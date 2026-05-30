import os
import json
import pdfplumber
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv

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

Generate EXACTLY ONE personalized introductory interview question tailored to the setup to start the interview.
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

Based on the candidate's LAST answer, generate EXACTLY ONE logical follow-up question. 
If the candidate's last answer indicates they don't know the answer (e.g., "I don't know", "skip", "not sure"), DO NOT ask them about the same topic again. Move on to a completely different topic or skill from their resume.
If the previous answer was poor or incomplete but they tried, you can dig deeper. 
If it was good, you can move on to a new topic relevant to the Interview Setup.
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
Provide scores from 0 to 100 for Technical, Communication, Confidence, Problem Solving, and Overall.
Provide a list of Strengths, Weaknesses, and Actionable Suggestions.

Return ONLY valid JSON.
Response Format:
{{
  "overall_score": 0,
  "technical_score": 0,
  "communication_score": 0,
  "confidence_score": 0,
  "problem_solving_score": 0,
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
Analyze the resume below and determine its ATS compatibility.
Return ONLY valid JSON.

Resume:
{resume_text}

Return this exact structure:
{{
  "atsScore": 0,
  "missingKeywords": [],
  "suggestions": []
}}

Rules:
* atsScore should be out of 100 based on standard ATS formatting and keyword density.
* missingKeywords should be an array of 5 to 8 important industry keywords that are missing.
* suggestions should be an array of 3 to 5 actionable formatting or content suggestions.
Return ONLY JSON."""

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        return jsonify(json.loads(chat_completion.choices[0].message.content))

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=False)
