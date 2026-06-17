import os
import json
import pdfplumber
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
from database import get_db, is_db_available

load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from React dashboard

def get_request_user_id():
    if request.is_json:
        try:
            val = request.json.get("user_id")
            if val:
                return val
        except Exception:
            pass
    val = request.form.get("user_id")
    if val:
        return val
    val = request.args.get("user_id")
    if val:
        return val
    val = request.headers.get("X-User-Id")
    if val:
        return val
    return None

# Load Groq API Key
api_key = os.getenv("GROQ_API_KEY", "")
client = Groq(api_key=api_key) if api_key else None

@app.route('/api/analyze-resume', methods=['POST'])
def analyze_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file uploaded"}), 400
    
    file = request.files['resume']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    try:
        # Extract text from the PDF file
        resume_text = ""
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    resume_text += text + "\n"
        
        if not resume_text.strip():
            return jsonify({"error": "Failed to extract text from PDF. Ensure it is not scanned or empty."}), 400

        # Verify Groq client
        if not client:
            return jsonify({"error": "AI service temporarily unavailable. GROQ_API_KEY is not set on the server."}), 500

        # Construct Groq Prompt matching specifications
        prompt = f"""You are an expert AI Resume Analyzer.
Analyze the resume below.
Return ONLY valid JSON.

Resume:
{resume_text}

Return this exact structure:
{{
"name": "",
"education": "",
"experience_level": "",
"skills": [],
"projects_count": 0,
"summary": "",
"suggested_roles": [],
"resume_score": 0,
"strengths": [],
"weaknesses": [],
"interview_questions": {{
"hr": [],
"technical": [],
"project": []
}}
}}

Rules:
* Extract candidate name.
* Detect education.
* Determine experience level.
* Count projects.
* Extract technical skills.
* Generate professional summary.
* Suggest suitable job roles.
* Give resume score out of 100.
* Provide strengths and weaknesses.
* Generate:
  5 HR Questions
  5 Technical Questions
  5 Project-Based Questions

Questions must be personalized based on the resume.
Return ONLY JSON."""

        # Call Groq API with Llama 3
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )

        ai_response = chat_completion.choices[0].message.content
        parsed_result = json.loads(ai_response)
        
        # Save parsed result to resumes collection in MongoDB under user_id
        user_id = request.form.get("user_id") or get_request_user_id()
        if user_id:
            db, collections = get_db()
            
            import hashlib
            import datetime
            resume_hash = hashlib.sha256(resume_text.strip().encode('utf-8')).hexdigest()
            
            parsed_result["user_id"] = user_id
            parsed_result["resume_id"] = resume_hash
            parsed_result["upload_date"] = time.time()
            parsed_result["fileName"] = file.filename
            parsed_result["uploadedDate"] = f"Uploaded on {datetime.datetime.now().strftime('%b %d, %Y')}"
            
            ats_score = 0
            if db is not None:
                try:
                    existing_ats = db.ats_reports.find_one({"resume_hash": resume_hash})
                    if existing_ats:
                        ats_score = existing_ats.get("atsScore", 0)
                except Exception as read_err:
                    print(f"Failed to check existing ATS report: {read_err}")
                    
            parsed_result["ats_score"] = ats_score
            
            # Calculate deterministic resume score
            from scoring_engine import calculate_resume_score
            calculated_resume_score = calculate_resume_score(parsed_result, ats_score, resume_text=resume_text)
            parsed_result["resume_score"] = calculated_resume_score
            
            if db is not None:
                try:
                    db_doc = parsed_result.copy()
                    collections['resumes'].insert_one(db_doc)
                except Exception as save_err:
                    print(f"Failed to save resume analysis: {save_err}")
                    
        return jsonify(parsed_result)

    except json.JSONDecodeError:
        return jsonify({"error": "AI service temporarily unavailable. Failed to parse AI output."}), 502
    except Exception as e:
        print(f"Error in analyze_resume: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-questions', methods=['POST'])
def generate_questions():
    if not request.json or 'resume_data' not in request.json:
        return jsonify({"error": "No resume_data provided"}), 400
        
    resume_data = request.json['resume_data']
    target_role = request.json.get('target_role', 'General')
    interview_type = request.json.get('interview_type', 'Mixed')
    difficulty = request.json.get('difficulty', 'Intermediate')
    
    if not client:
        return jsonify({"error": "AI service temporarily unavailable. GROQ_API_KEY is not set."}), 500

    prompt = f"""You are an expert technical interviewer.
Based on the candidate resume information below:
{json.dumps(resume_data, indent=2)}

Interview Setup:
- Target Role: {target_role}
- Interview Type: {interview_type} (e.g. HR, Technical, Project, Mixed)
- Difficulty: {difficulty}

This is the INTRODUCTION ROUND. 
Generate EXACTLY ONE personalized introductory interview question tailored to the setup to start the interview.
It should be an icebreaker, such as "Tell me about yourself", "Walk me through your background", or "Why are you interested in this role?"

Return ONLY JSON.

Response Format:
{{
  "question": "The question string here"
}}
"""
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        ai_response = chat_completion.choices[0].message.content
        return jsonify(json.loads(ai_response))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/next-question', methods=['POST'])
def next_question():
    if not request.json or 'resume_data' not in request.json or 'history' not in request.json:
        return jsonify({"error": "Missing required data"}), 400
        
    resume_data = request.json['resume_data']
    history = request.json['history']  # List of {"question": ..., "answer": ...}
    target_role = request.json.get('target_role', 'General')
    interview_type = request.json.get('interview_type', 'Mixed')
    difficulty = request.json.get('difficulty', 'Intermediate')
    stage = request.json.get('stage', 'Technical')
    
    if not client:
        return jsonify({"error": "AI service temporarily unavailable."}), 500

    prompt = f"""You are an expert technical interviewer conducting a mock interview.
Candidate Profile:
{json.dumps(resume_data, indent=2)}

Interview Setup:
- Target Role: {target_role}
- Interview Type: {interview_type}
- Difficulty: {difficulty}

Here is the conversation history so far:
{json.dumps(history, indent=2)}

CURRENT STAGE: {stage}

Based on the CURRENT STAGE and the candidate's LAST answer, generate EXACTLY ONE logical follow-up question. 

RULES FOR STAGES:
- If STAGE is "Introduction": Ask about their background or interest in the role.
- If STAGE is "Resume": Ask about specific skills, education, or experiences extracted directly from their Candidate Profile.
- If STAGE is "Project": Ask about the projects listed in their Candidate Profile. Dive into technical challenges, architecture, or why they used a specific tool.
- If STAGE is "Technical": Ask a challenging technical question based on their Target Role and Skills. e.g. "Explain REST APIs", "What is vector search?"
- If STAGE is "HR": Ask a behavioral question. e.g. "Describe a challenge you faced", "Tell me about a conflict."
- If STAGE is "Follow-Up": This is the most critical adaptive round. You MUST analyze the candidate's last answer and generate a deep-dive follow-up question based on what they just said. Act like a deep-diving interrogator.

If the candidate's last answer indicates they don't know the answer, DO NOT ask them about the same topic again. Move on to a completely different topic within the current STAGE.
Do not evaluate the answer to the candidate, just ask the next question naturally.

Return ONLY JSON.

Response Format:
{{
  "question": "The next question string here"
}}
"""
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        ai_response = chat_completion.choices[0].message.content
        return jsonify(json.loads(ai_response))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/career-insights', methods=['POST'])
def career_insights():
    if not request.json or 'resume_data' not in request.json:
        return jsonify({"error": "No resume_data provided"}), 400
        
    resume_data = request.json['resume_data']
    if not client: return jsonify({"error": "No API Key"}), 500

    prompt = f"""You are an expert AI Career Mentor.
Analyze this resume data:
{json.dumps(resume_data, indent=2)}

Generate Career Insights containing:
1. Strong Skills
2. Weak Skills
3. Recommended Roles (List of strings)
4. Learning Recommendations (List of strings)
5. Mentor Message (A brief encouraging 2-sentence paragraph summarizing the insights)
6. Next Interview Path (e.g. 'Backend Developer Intermediate')

Return ONLY valid JSON.
Response Format:
{{
  "strong_skills": [],
  "weak_skills": [],
  "recommended_roles": [],
  "learning_recommendations": [],
  "mentor_message": "",
  "next_interview_path": ""
}}
"""
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        ai_response = chat_completion.choices[0].message.content
        insights = json.loads(ai_response)
        
        # Save career insights result to career_insights collection in MongoDB under user_id
        user_id = request.json.get("user_id") or get_request_user_id()
        if user_id:
            db, collections = get_db()
            if db is not None:
                try:
                    db.career_insights.update_one(
                        {"user_id": user_id},
                        {"$set": {
                            "user_id": user_id,
                            "insights": insights,
                            "timestamp": time.time()
                        }},
                        upsert=True
                    )
                except Exception as save_err:
                    print(f"Failed to save career insights: {save_err}")
                    
        return jsonify(insights)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/evaluate-interview', methods=['POST'])
def evaluate_interview():
    if not request.json or 'questions' not in request.json or 'answers' not in request.json:
        return jsonify({"error": "Missing questions or answers"}), 400
        
    questions = request.json['questions']
    answers = request.json['answers']
    
    if not client: return jsonify({"error": "No API Key"}), 500

    q_and_a = []
    for q, a in zip(questions, answers):
        q_and_a.append({"question": q, "answer": a})

    # Fetch user's skills
    user_skills = []
    user_id = get_request_user_id()
    if user_id:
        db, collections = get_db()
        if db is not None:
            try:
                latest_resume = collections['resumes'].find_one({"user_id": user_id}, sort=[("upload_date", -1)])
                if latest_resume:
                    user_skills = latest_resume.get("skills", [])
            except Exception as read_err:
                print(f"Failed to fetch user skills: {read_err}")
                
    # Calculate deterministic interview scores
    from scoring_engine import calculate_interview_scores
    det_scores = calculate_interview_scores(questions, answers, user_skills)

    prompt = f"""You are an expert AI Interview Feedback Specialist.
Analyze the following interview session:
Questions and Answers:
{json.dumps(q_and_a, indent=2)}

Deterministic Calculated Scores:
- Technical Accuracy: {det_scores['technical_accuracy']}/100
- Communication: {det_scores['communication']}/100
- Completeness: {det_scores['completeness']}/100
- Confidence: {det_scores['confidence']}/100
- Problem Solving: {det_scores['problem_solving']}/100
- Overall Score: {det_scores['overall_score']}/100

Generate a qualitative feedback report explaining these scores.
Do NOT attempt to assign different scores. Explain the provided deterministic scores.

Provide a list of Strengths, Weaknesses, and Actionable Suggestions.
Provide detailed feedback for each question explaining their performance.

Return ONLY valid JSON.
Response Format:
{{
  "strengths": ["string"],
  "weaknesses": ["string"],
  "suggestions": ["string"],
  "detailed_feedback": [
    {{
      "question": "string",
      "feedback": "string",
      "score": 0
    }}
  ]
}}
"""
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        ai_response = chat_completion.choices[0].message.content
        parsed = json.loads(ai_response)

        # Override scores with our deterministic calculations
        parsed["overall_score"] = det_scores["overall_score"]
        parsed["technical_score"] = det_scores["technical_accuracy"]
        parsed["communication_score"] = det_scores["communication"]
        parsed["confidence_score"] = det_scores["confidence"]
        parsed["problem_solving_score"] = det_scores["problem_solving"]
        parsed["project_knowledge_score"] = det_scores["problem_solving"] # Duplicate for compatibility
        
        parsed["stage_scores"] = {
            "Introduction": int(round(det_scores["completeness"] / 10.0)),
            "Resume": int(round(det_scores["technical_accuracy"] / 10.0)),
            "Project": int(round(det_scores["problem_solving"] / 10.0)),
            "Technical": int(round(det_scores["technical_accuracy"] / 10.0)),
            "HR": int(round(det_scores["communication"] / 10.0))
        }

        # Override question-level scores in detailed_feedback to ensure consistency
        df_list = parsed.get("detailed_feedback", [])
        for i, (q, a) in enumerate(zip(questions, answers)):
            # Calculate question score
            if a.strip().lower() == "skipped" or not a.strip():
                q_score = 0
            else:
                # Word count completeness
                word_count = len(a.split())
                comp_val = min(100, word_count * 2.5)
                
                # Confidence
                conf_val = 100
                fillers = ["um", "uh", "like", "maybe", "probably", "i think", "sort of", "dont know", "don't know", "not sure"]
                for filler in fillers:
                    conf_val -= a.strip().lower().count(filler) * 8
                conf_val = max(20, conf_val)
                
                # Communication
                words = a.strip().lower().split()
                unique_words = len(set(words))
                ratio = unique_words / len(words) if len(words) > 0 else 0
                comm_val = min(100, max(30, int(ratio * 100)))
                
                # Problem solving
                transition_words = ["first", "second", "then", "finally", "however", "therefore", "because", "so", "solve", "approach", "structure", "result"]
                matches = sum(1 for word in transition_words if word in a.strip().lower())
                ps_val = min(100, 30 + matches * 20)
                
                # Tech accuracy
                q_words = set(w.strip("?,.:;!") for w in q.lower().split())
                stop_words = {"what", "how", "why", "explain", "describe", "tell", "me", "about", "your", "you", "a", "an", "the", "in", "on", "at", "to", "for", "with", "is", "are", "was", "were", "do", "does", "did", "have", "has", "had", "can", "could", "should", "would"}
                q_keywords = q_words - stop_words
                q_matches = sum(1 for kw in q_keywords if len(kw) > 2 and kw in a.strip().lower())
                skills_matches = sum(1 for skill in user_skills if skill.lower() in a.strip().lower())
                tech_val = min(100, 40 + q_matches * 15 + skills_matches * 15)
                
                q_score = int(round(tech_val * 0.3 + comm_val * 0.2 + comp_val * 0.2 + conf_val * 0.15 + ps_val * 0.15))
                
            if i < len(df_list):
                df_list[i]["score"] = q_score
                if a.strip().lower() == "skipped":
                    df_list[i]["status"] = "skipped"
                    df_list[i]["feedback"] = "Question skipped by candidate."
            else:
                df_list.append({
                    "question": q,
                    "feedback": "Question skipped by candidate." if a.strip().lower() == "skipped" else "Detailed evaluation provided.",
                    "score": q_score,
                    "status": "skipped" if a.strip().lower() == "skipped" else "completed"
                })
        
        parsed["detailed_feedback"] = df_list
        return jsonify(parsed)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ats-checker', methods=['POST'])
def ats_checker():
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file uploaded"}), 400
    
    file = request.files['resume']
    target_role = request.form.get('target_role', 'Software Engineer')
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    try:
        resume_text = ""
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    resume_text += text + "\n"
        
        if not resume_text.strip():
            return jsonify({"error": "Failed to extract text from PDF."}), 400

        # Unique hash identifying the resume content and normalize target role
        import hashlib
        resume_hash = hashlib.sha256(resume_text.strip().encode('utf-8')).hexdigest()
        normalized_role = target_role.strip().lower()

        # Try to retrieve existing ATS report from MongoDB
        db, collections = get_db()
        user_id = request.form.get("user_id") or get_request_user_id()
        if db is not None:
            try:
                existing = db.ats_reports.find_one({
                    "resume_hash": resume_hash,
                    "target_role": normalized_role
                })
                if existing:
                    if user_id:
                        try:
                            collections['resumes'].update_many(
                                {"user_id": user_id, "resume_id": resume_hash},
                                {"$set": {"ats_score": existing.get("atsScore", 0)}}
                            )
                        except Exception as update_err:
                            print(f"Failed to update resumes collection: {update_err}")
                    return jsonify({
                        "atsScore": existing.get("atsScore", 0),
                        "missingKeywords": existing.get("missingKeywords", []),
                        "suggestions": existing.get("suggestions", [])
                    })
            except Exception as read_err:
                print(f"MongoDB read failed: {read_err}")

        if not client:
            return jsonify({"error": "AI service temporarily unavailable."}), 500

        prompt = f"""You are an expert ATS (Applicant Tracking System) Analyzer.
Analyze the resume below and determine its ATS compatibility for the specific Target Role provided.
Return ONLY valid JSON.

Target Role: {target_role}

Resume:
{resume_text}

Return this exact structure:
{{
  "missingKeywords": [],
  "suggestions": []
}}

Rules:
* missingKeywords should be an array of 5 to 8 important industry keywords that are CRITICAL for the `{target_role}` role, but missing from the resume.
* suggestions should be an array of 3 to 5 actionable formatting or content suggestions specifically to improve matching for the `{target_role}` role.
Return ONLY JSON."""

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        
        ai_response = chat_completion.choices[0].message.content
        parsed = json.loads(ai_response)

        # Calculate score deterministically
        from scoring_engine import calculate_ats_score
        ats_score_calculated = calculate_ats_score(resume_text, target_role)
        parsed["atsScore"] = ats_score_calculated

        # Cache the report to MongoDB for future requests
        if db is not None:
            try:
                db.ats_reports.update_one(
                    {"resume_hash": resume_hash, "target_role": normalized_role},
                    {"$set": {
                        "user_id": user_id,
                        "resume_hash": resume_hash,
                        "target_role": normalized_role,
                        "atsScore": parsed.get("atsScore", 0),
                        "missingKeywords": parsed.get("missingKeywords", []),
                        "suggestions": parsed.get("suggestions", []),
                        "timestamp": time.time()
                    }},
                    upsert=True
                )
                if user_id:
                    collections['resumes'].update_many(
                        {"user_id": user_id, "resume_id": resume_hash},
                        {"$set": {"ats_score": parsed.get("atsScore", 0)}}
                    )
            except Exception as save_err:
                print(f"Failed to save ATS report to MongoDB: {save_err}")

        return jsonify(parsed)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/career-coach', methods=['POST'])
def career_coach():
    if not request.json:
        return jsonify({"error": "No data provided"}), 400
        
    data = request.json
    resume_score = data.get('resume_score', 0)
    ats_score = data.get('ats_score', 0)
    technical_score = data.get('technical_score', 0)
    communication_score = data.get('communication_score', 0)
    problem_solving_score = data.get('problem_solving_score', 0)
    confidence_score = data.get('confidence_score', 0)
    
    # Package features
    features = {
        "resume_score": float(resume_score),
        "ats_score": float(ats_score),
        "technical_score": float(technical_score),
        "communication_score": float(communication_score),
        "confidence_score": float(confidence_score),
        "problem_solving_score": float(problem_solving_score),
        "skills_count": float(len(data.get('skills', []))),
        "projects_count": float(data.get('projects_count', 0))
    }
    
    # Load predictions from ML pipeline
    from ml.predict_readiness import predict_readiness as get_ml_readiness
    from ml.predict_hiring import predict_hiring as get_ml_hiring
    
    readiness = int(round(get_ml_readiness(features)))
    hiring_recommendation = get_ml_hiring(features)
    
    # Heuristics for Confidence Level
    if confidence_score >= 85:
        confidence_level = "High"
    elif confidence_score >= 70:
        confidence_level = "Medium"
    else:
        confidence_level = "Low"
        
    if not client:
        return jsonify({"error": "AI service temporarily unavailable."}), 500

    prompt = f"""You are an expert Technical Recruiter, Career Coach, and Hiring Manager.
Analyze the following candidate data:
- Resume Score: {resume_score}
- ATS Score: {ats_score}
- Technical Score: {technical_score}
- Communication Score: {communication_score}
- Problem Solving Score: {problem_solving_score}
- Confidence Score: {confidence_score}
- Skills: {json.dumps(data.get('skills', []))}
- Weaknesses: {json.dumps(data.get('weaknesses', []))}
- Summary: {data.get('resume_summary', '')}

Predicted ML Metrics:
- Interview Readiness Score: {readiness}%
- Hiring Recommendation: {hiring_recommendation}
- Confidence Level: {confidence_level}

Your task is to generate:
1. Suggested Job Role
2. Top Strengths and Weak Areas
3. Skill Gap Analysis
4. Personalized Learning Roadmap (Week 1 to Week 4)
5. AI Mentor Insights (explaining the predicted readiness {readiness}% and hiring recommendation '{hiring_recommendation}')

Return ONLY valid JSON.
Response Format:
{{
  "suggested_role": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "skill_gaps": ["string"],
  "roadmap": [
    {{
      "week": "string",
      "focus": "string"
    }}
  ],
  "mentor_insight": "string"
}}
"""
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        ai_response = chat_completion.choices[0].message.content
        parsed = json.loads(ai_response)
        
        # Override fields with ML-predicted/calculated values
        parsed['interview_readiness'] = readiness
        parsed['hiring_recommendation'] = hiring_recommendation
        parsed['confidence_level'] = confidence_level
        return jsonify(parsed)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# MONGODB ENDPOINTS
# ==========================================

@app.route('/api/test-db', methods=['GET'])
def test_db():
    db, collections = get_db()
    if db is not None:
        try:
            # Insert a sample document as requested
            collections['users'].insert_one({"test": "connection", "timestamp": time.time()})
            return jsonify({"message": "MongoDB Connected Successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "MongoDB not available"}), 503

@app.route('/api/interview/save', methods=['POST'])
def save_interview():
    db, collections = get_db()
    if db is None:
        return jsonify({"error": "MongoDB not available"}), 503
        
    data = request.json
    session_id = data.get('id') or data.get('session_id')
    user_id = data.get('user_id') or get_request_user_id()
    
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400
        
    # Extract report and career coach to save separately or together
    report_data = data.get('report', {})
    career_coach_data = report_data.get('career_coach', {})
    
    # Save Session
    session_doc = {
        "session_id": session_id,
        "user_id": user_id,
        "date": data.get("date"),
        "time": data.get("time"),
        "role": data.get("role", "General"),
        "duration": data.get("duration"),
        "questions_count": data.get("questions_count", 0),
        "score": data.get("score", 0),
        "overall_score": report_data.get("overall_score", 0),
        "technical_score": report_data.get("technical_score", 0),
        "communication_score": report_data.get("communication_score", 0),
        "confidence_score": report_data.get("confidence_score", 0),
        "status": "completed",
        "readiness_score": data.get("readiness_score", 0),
        "hiring_recommendation": data.get("hiring_recommendation", "N/A"),
        "suggested_role": data.get("suggested_role", "N/A")
    }
    
    # Save Report
    report_doc = {
        "session_id": session_id,
        "user_id": user_id,
        "report": report_data
    }
    
    try:
        collections['interview_sessions'].update_one({"session_id": session_id}, {"$set": session_doc}, upsert=True)
        collections['interview_reports'].update_one({"session_id": session_id}, {"$set": report_doc}, upsert=True)
        
        if career_coach_data:
            coach_doc = {
                "session_id": session_id,
                "user_id": user_id,
                "career_coach": career_coach_data
            }
            collections['career_coach'].update_one({"session_id": session_id}, {"$set": coach_doc}, upsert=True)
            
        # Capture training data sample automatically
        try:
            latest_resume = collections['resumes'].find_one({"user_id": user_id}, sort=[("upload_date", -1)])
            r_score = 75
            a_score = 75
            s_count = 5
            p_count = 2
            if latest_resume:
                r_score = latest_resume.get("resume_score", 75)
                a_score = latest_resume.get("ats_score", 75)
                s_count = len(latest_resume.get("skills", []))
                p_count = latest_resume.get("projects_count", 0)
                
            training_sample = {
                "resume_score": float(r_score),
                "ats_score": float(a_score),
                "technical_score": float(report_data.get("technical_score", 0)),
                "communication_score": float(report_data.get("communication_score", 0)),
                "confidence_score": float(report_data.get("confidence_score", 0)),
                "problem_solving_score": float(report_data.get("problem_solving_score", 0)),
                "skills_count": float(s_count),
                "projects_count": float(p_count),
                "overall_score": float(career_coach_data.get("interview_readiness", 0) or data.get("readiness_score", 0)),
                "hiring_recommendation": career_coach_data.get("hiring_recommendation") or data.get("hiring_recommendation", "Recommended"),
                "questions": data.get("questions", []),
                "answers": data.get("answers", []),
                "evaluation_results": report_data,
                "timestamp": time.time(),
                "user_id": user_id,
                "session_id": session_id
            }
            db.training_data.insert_one(training_sample)
            print("Successfully saved training data sample to MongoDB.")
        except Exception as train_err:
            print(f"Failed to save training data: {train_err}")
            
        return jsonify({"message": "Interview session saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/report/save', methods=['POST'])
def save_report():
    # Dedicated endpoint for saving just the report if needed
    db, collections = get_db()
    if db is None:
        return jsonify({"error": "MongoDB not available"}), 503
        
    data = request.json
    session_id = data.get('session_id')
    user_id = data.get('user_id') or get_request_user_id()
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400
        
    try:
        data['user_id'] = user_id
        collections['interview_reports'].update_one({"session_id": session_id}, {"$set": data}, upsert=True)
        return jsonify({"message": "Report saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/interviews', methods=['GET'])
def get_interviews():
    db, collections = get_db()
    if db is None:
        return jsonify({"error": "MongoDB not available"}), 503
        
    user_id = get_request_user_id()
    if not user_id:
        return jsonify({"history": []}), 200
        
    try:
        # Sort by most recent first, filtered by user_id
        sessions = list(collections['interview_sessions'].find({"user_id": user_id}, {'_id': 0}).sort('_id', -1))
        
        for session in sessions:
            report_doc = collections['interview_reports'].find_one({"session_id": session["session_id"], "user_id": user_id}, {'_id': 0})
            if report_doc and "report" in report_doc:
                session["report"] = report_doc["report"]
                
                # Fetch career coach if it exists
                coach_doc = collections['career_coach'].find_one({"session_id": session["session_id"], "user_id": user_id}, {'_id': 0})
                if coach_doc and "career_coach" in coach_doc:
                    session["report"]["career_coach"] = coach_doc["career_coach"]
            
            # Map session_id to id for frontend compatibility
            session["id"] = session["session_id"]
            
        return jsonify({"history": sessions}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/interview/<session_id>', methods=['GET'])
def get_interview_report(session_id):
    db, collections = get_db()
    if db is None:
        return jsonify({"error": "MongoDB not available"}), 503
        
    user_id = get_request_user_id()
    try:
        query = {"session_id": session_id}
        if user_id:
            query["user_id"] = user_id
            
        report_doc = collections['interview_reports'].find_one(query, {'_id': 0})
        if not report_doc:
            return jsonify({"error": "Report not found"}), 404
            
        return jsonify(report_doc), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/save', methods=['POST'])
def save_user():
    db, collections = get_db()
    if db is None:
        return jsonify({"error": "MongoDB not available"}), 503
        
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email is required to save user profile"}), 400
        
    try:
        data['user_id'] = email
        password = data.get('password')
        if password:
            import hashlib
            data['password'] = hashlib.sha256(password.encode('utf-8')).hexdigest()
            
        data.pop("confirmPassword", None)
        
        # Use email as the unique identifier for the user
        collections['users'].update_one(
            {"email": email}, 
            {"$set": data}, 
            upsert=True
        )
        return jsonify({"message": "User profile saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/login', methods=['POST'])
def login_user():
    db, collections = get_db()
    if db is None:
        return jsonify({"error": "MongoDB not available"}), 503
        
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
        
    try:
        import hashlib
        hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()
        
        user = collections['users'].find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        if user.get("password") != hashed_password:
            return jsonify({"error": "Invalid password"}), 401
            
        # Clean user dict to return
        user_profile = user.copy()
        user_profile.pop("_id", None)
        user_profile.pop("password", None)
        
        # Map fields so frontend compatibility is perfect
        user_profile["name"] = user_profile.get("name", "")
        user_profile["email"] = user_profile.get("email", "")
        user_profile["targetRole"] = user_profile.get("target_role", "")
        user_profile["experienceLevel"] = user_profile.get("experience_level", "Fresher")
        
        return jsonify({"message": "Login successful", "user": user_profile}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/resume', methods=['GET'])
def get_resume():
    db, collections = get_db()
    if db is None:
        return jsonify({"error": "MongoDB not available"}), 503
        
    user_id = get_request_user_id()
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
        
    try:
        resume_doc = collections['resumes'].find_one(
            {"user_id": user_id},
            {'_id': 0},
            sort=[("upload_date", -1)]
        )
        if not resume_doc:
            return jsonify({"message": "No resume found"}), 404
            
        resume_id = resume_doc.get("resume_id")
        if resume_id:
            try:
                ats_report = db.ats_reports.find_one(
                    {"resume_hash": resume_id},
                    {'_id': 0},
                    sort=[("timestamp", -1)]
                )
                if ats_report:
                    resume_doc["ats_score"] = ats_report.get("atsScore", 0)
                    resume_doc["atsScore"] = ats_report.get("atsScore", 0)
                    resume_doc["ats_missing_keywords"] = ats_report.get("missingKeywords", [])
                    resume_doc["ats_suggestions"] = ats_report.get("suggestions", [])
                else:
                    resume_doc["ats_score"] = 0
                    resume_doc["atsScore"] = 0
                    resume_doc["ats_missing_keywords"] = []
                    resume_doc["ats_suggestions"] = []
            except Exception as read_err:
                print(f"Failed to check existing ATS report: {read_err}")
                
        return jsonify(resume_doc), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/career-insights', methods=['GET'])
def get_career_insights():
    db, collections = get_db()
    if db is None:
        return jsonify({"error": "MongoDB not available"}), 503
        
    user_id = get_request_user_id()
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
        
    try:
        doc = db.career_insights.find_one({"user_id": user_id}, {'_id': 0})
        if not doc:
            return jsonify({"message": "No insights found"}), 404
        return jsonify(doc.get("insights", {})), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/settings', methods=['GET'])
def get_settings():
    db, collections = get_db()
    if db is None:
        return jsonify({"error": "MongoDB not available"}), 503
        
    user_id = get_request_user_id()
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
        
    try:
        settings_doc = db.user_settings.find_one({"user_id": user_id}, {'_id': 0})
        user_profile = collections['users'].find_one({"email": user_id})
        
        # Build profile dictionary
        profile_data = {
            "name": "Shreya",
            "email": user_id
        }
        if user_profile:
            profile_data = {
                "name": user_profile.get("name", "Shreya"),
                "email": user_profile.get("email", user_id),
                "avatar": user_profile.get("avatar", "👨‍💻"),
                "degree": user_profile.get("degree", ""),
                "graduationYear": user_profile.get("graduationYear", user_profile.get("graduation_year", "")),
                "targetRole": user_profile.get("targetRole", user_profile.get("target_role", "")),
                "skills": user_profile.get("skills", []),
                "weakAreas": user_profile.get("weakAreas", user_profile.get("weak_areas", [])),
                "careerGoal": user_profile.get("careerGoal", user_profile.get("career_goal", ""))
            }
        elif settings_doc and "profile" in settings_doc:
            profile_data = settings_doc["profile"]

        if not settings_doc:
            settings_doc = {
                "user_id": user_id,
                "profile": profile_data,
                "preferences": {
                    "role": profile_data.get("targetRole") or "Machine Learning Engineer",
                    "difficulty": "Medium",
                    "questionType": "All"
                },
                "theme": "dark",
                "notifications": {
                    "email": True,
                    "browser": True,
                    "push": False
                }
            }
        else:
            settings_doc["profile"] = profile_data
            
        return jsonify(settings_doc), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/settings', methods=['POST'])
def save_settings():
    db, collections = get_db()
    if db is None:
        return jsonify({"error": "MongoDB not available"}), 503
        
    data = request.json
    user_id = data.get("user_id") or get_request_user_id()
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
        
    try:
        profile_data = data.get("profile", {})
        # Update user collection with any profile data changes
        if profile_data and "email" in profile_data:
            email = profile_data.get("email")
            # Map frontend camelCase to both camelCase and snake_case to keep consistency
            user_update = {
                "name": profile_data.get("name"),
                "avatar": profile_data.get("avatar", "👨‍💻"),
                "degree": profile_data.get("degree"),
                "graduationYear": profile_data.get("graduationYear"),
                "graduation_year": profile_data.get("graduationYear"),
                "targetRole": profile_data.get("targetRole"),
                "target_role": profile_data.get("targetRole"),
                "careerGoal": profile_data.get("careerGoal"),
                "career_goal": profile_data.get("careerGoal")
            }
            if "skills" in profile_data:
                user_update["skills"] = profile_data.get("skills")
            if "weakAreas" in profile_data:
                user_update["weakAreas"] = profile_data.get("weakAreas")
                user_update["weak_areas"] = profile_data.get("weakAreas")
                
            collections['users'].update_one(
                {"email": email},
                {"$set": user_update},
                upsert=True
            )
            
        db.user_settings.update_one(
            {"user_id": user_id},
            {"$set": {
                "user_id": user_id,
                "profile": profile_data,
                "preferences": data.get("preferences", {}),
                "theme": data.get("theme", "dark"),
                "notifications": data.get("notifications", {}),
                "timestamp": time.time()
            }},
            upsert=True
        )
        return jsonify({"message": "Settings saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=False)
