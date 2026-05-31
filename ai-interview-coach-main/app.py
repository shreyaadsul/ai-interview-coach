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
        return jsonify(json.loads(chat_completion.choices[0].message.content))
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

    prompt = f"""You are an expert Technical Interview Evaluator.
Evaluate the following complete interview session:

{json.dumps(q_and_a, indent=2)}

Generate a comprehensive evaluation report.
Provide scores from 0 to 100 for Technical, Communication, Confidence, Problem Solving, Project Knowledge, and Overall.
Also, provide scores from 0 to 10 for the following stages: Introduction, Resume, Project, Technical, HR.
Provide a list of Strengths, Weaknesses, and Actionable Suggestions.

Return ONLY valid JSON.
Response Format:
{{
  "overall_score": 0,
  "technical_score": 0,
  "communication_score": 0,
  "confidence_score": 0,
  "problem_solving_score": 0,
  "project_knowledge_score": 0,
  "stage_scores": {{
    "Introduction": 0,
    "Resume": 0,
    "Project": 0,
    "Technical": 0,
    "HR": 0
  }},
  "strengths": [],
  "weaknesses": [],
  "suggestions": [],
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
        return jsonify(json.loads(chat_completion.choices[0].message.content))
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
  "atsScore": 0,
  "missingKeywords": [],
  "suggestions": []
}}

Rules:
* Be EXTREMELY STRICT when grading. Start at 100 and deduct points:
  - Missing or hard-to-find contact info (-15 points)
  - Vague bullet points without measurable metrics (-20 points)
  - Bad formatting or complex layouts that confuse ATS (-15 points)
  - Weak action verbs or passive voice (-10 points)
  - Missing critical industry keywords for the Target Role (-15 points)
* Do NOT default to a specific score. Calculate the deductions mathematically based on the resume text.
* atsScore MUST be an integer between 10 and 100 based strictly on the deductions above.
* missingKeywords should be an array of 5 to 8 important industry keywords that are CRITICAL for the `{target_role}` role, but missing from the resume.
* suggestions should be an array of 3 to 5 actionable formatting or content suggestions specifically to improve matching for the `{target_role}` role.
Return ONLY JSON."""

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        return jsonify(json.loads(chat_completion.choices[0].message.content))

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
    
    # Calculate Readiness
    readiness = int((resume_score + ats_score + technical_score + communication_score + problem_solving_score + confidence_score) / 6)
    
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

Generate:
1. Interview Readiness Score (must be exactly {readiness})
2. Hiring Recommendation (Strongly Recommended, Recommended, Borderline, or Not Recommended)
3. Suggested Role
4. Top Strengths
5. Weak Areas
6. Skill Gap Analysis
7. Personalized Learning Roadmap (Week 1 to Week 4)
8. AI Mentor Insights

Return ONLY valid JSON.
Response Format:
{{
"interview_readiness": {readiness},
"hiring_recommendation": "string",
"confidence_level": "string",
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
        parsed['interview_readiness'] = readiness # force override just in case
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
    
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400
        
    # Extract report and career coach to save separately or together
    report_data = data.get('report', {})
    career_coach_data = report_data.get('career_coach', {})
    
    # Save Session
    session_doc = {
        "session_id": session_id,
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
        "report": report_data
    }
    
    try:
        collections['interview_sessions'].update_one({"session_id": session_id}, {"$set": session_doc}, upsert=True)
        collections['interview_reports'].update_one({"session_id": session_id}, {"$set": report_doc}, upsert=True)
        
        if career_coach_data:
            coach_doc = {
                "session_id": session_id,
                "career_coach": career_coach_data
            }
            collections['career_coach'].update_one({"session_id": session_id}, {"$set": coach_doc}, upsert=True)
            
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
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400
        
    try:
        collections['interview_reports'].update_one({"session_id": session_id}, {"$set": data}, upsert=True)
        return jsonify({"message": "Report saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/interviews', methods=['GET'])
def get_interviews():
    db, collections = get_db()
    if db is None:
        return jsonify({"error": "MongoDB not available"}), 503
        
    try:
        # Sort by most recent first (using _id as proxy for insertion order if no timestamp)
        sessions = list(collections['interview_sessions'].find({}, {'_id': 0}).sort('_id', -1))
        
        # In a real app we might join the reports here, but we'll fetch reports separately 
        # or merge them if the frontend expects it. The frontend history object usually contains the report.
        # Let's attach the reports so the frontend history works seamlessly.
        for session in sessions:
            report_doc = collections['interview_reports'].find_one({"session_id": session["session_id"]}, {'_id': 0})
            if report_doc and "report" in report_doc:
                session["report"] = report_doc["report"]
                
                # Fetch career coach if it exists
                coach_doc = collections['career_coach'].find_one({"session_id": session["session_id"]}, {'_id': 0})
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
        
    try:
        report_doc = collections['interview_reports'].find_one({"session_id": session_id}, {'_id': 0})
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
        # Use email as the unique identifier for the user
        collections['users'].update_one(
            {"email": email}, 
            {"$set": data}, 
            upsert=True
        )
        return jsonify({"message": "User profile saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=False)
