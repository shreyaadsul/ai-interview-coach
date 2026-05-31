# 🚀 AI Career Readiness Platform & Interview Coach

A premium AI-powered interview preparation and career coaching platform. This application evolves beyond standard mock interviews by utilizing an intelligent backend to calculate your holistic **Interview Readiness Score**, identify career skill gaps, and generate personalized learning roadmaps based on your performance.

## ✨ Key Features

- **Proctored Mock Interviews**: Simulates realistic interview pressure using browser-native AI (MediaPipe) to track your head movements and enforce anti-cheat rules (like switching tabs or looking away).
- **AI Career Coach Engine**: Generates a mathematically precise "Interview Readiness" score, a clear hiring recommendation, and a custom week-by-week learning roadmap based on your interview answers and resume data.
- **Dynamic LLaMA 3 Questioning**: Uses the ultra-fast Groq API (powered by LLaMA 3.1) to generate logical follow-up questions tailored instantly to your previous answers. 
- **ATS Resume Analysis**: Extracts data from uploaded PDFs using `pdfplumber` to simulate ATS keyword checking, calculate an ATS compatibility score, and inform the AI interviewer.
- **Premium SaaS Dashboard**: A beautiful, responsive frontend featuring dark mode "glassmorphism", animated charts, and detailed evaluation reports.

## 🛠 Tech Stack

**Backend (AI Engine & API):**
- Python 3 & Flask
- Groq API (`llama-3.1-8b-instant`) for blazing-fast inference
- `pdfplumber` for Resume parsing
- Streamlit (Secondary Chatbot Interface)

**Frontend (Dashboard & Proctoring):**
- React 19 + Vite
- MediaPipe Vision (`@mediapipe/tasks-vision`) for local Face Landmarking
- Tailwind CSS v3 (Deep Navy Theme & Glassmorphism)
- Framer Motion (Smooth UI Animations)
- Recharts (Performance Visualization)

## 🚀 Getting Started

### 1. Clone the Repository
Ensure you are in the project root directory (`ai interview coach`).

### 2. Backend Setup
1. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up your API Keys:
   - Create or open the `.env` file in the root directory.
   - Add your Groq API key:
     ```env
     GROQ_API_KEY=your_groq_api_key_here
     ```

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```

## 🏃‍♂️ Running the Application

To experience the full platform, you need to run both the Flask API server and the React Frontend simultaneously.

**Start the API Server (Backend):**
From the root directory, start the Flask application:
```bash
.\.venv\Scripts\python.exe app.py
```
*(The API will be available at http://127.0.0.1:5000)*

**Start the SaaS Dashboard (Frontend):**
From the `frontend` directory, start the Vite development server:
```bash
npm run dev
```
*(The dashboard will be available at http://localhost:5173)*

*(Optional) Start the Streamlit Chatbot:*
```bash
.\.venv\Scripts\python.exe -m streamlit run chatbot.py
```

## 📁 Architecture Overview

When an interview is finished, the React frontend submits the Q&A pairs to the Flask `/api/evaluate-interview` endpoint. Once the evaluation is returned, a chained API call is automatically made to `/api/career-coach`. This final endpoint aggregates your Resume, ATS, Technical, Communication, and Confidence scores into a unified AI Career Coach report, which is then persisted to your browser's LocalStorage and visualized on the Dashboard.
