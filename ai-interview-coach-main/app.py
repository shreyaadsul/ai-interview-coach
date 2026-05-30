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

if __name__ == '__main__':
    app.run(port=5000, debug=True)
