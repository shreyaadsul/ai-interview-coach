# 🧑‍💼 AI Interview Coach

A premium AI-powered interview preparation platform that helps candidates practice role-specific questions and receive real-time, constructive feedback. The project consists of a Python-based intelligent backend and a stunning modern React dashboard.

## ✨ Features

- **Role-Specific Mock Interviews**: Tailored questions for roles like ML Engineer, Frontend Developer, Data Analyst, and HR Executive.
- **Real-Time AI Feedback**: Evaluates answers based on clarity, confidence, and relevance using advanced Groq LLM models (Llama 3).
- **Premium SaaS Dashboard**: A beautiful, dark-mode-only frontend featuring glassmorphism, animated radar charts, and score breakdowns.
- **ATS Resume Analysis**: Simulates ATS keyword checking and provides actionable suggestions.

## 🛠 Tech Stack

**Backend (AI Engine):**
- Python 3
- Streamlit (UI & State Management)
- LangChain & LangGraph (Agentic flow)
- Groq API (`llama-3.1-8b-instant`) for blazing-fast inference

**Frontend (Dashboard):**
- React 19 + Vite
- Tailwind CSS v3 (Deep Navy Theme & Glassmorphism)
- Framer Motion (Animations)
- Recharts (Data Visualization)
- Lucide React (Icons)

## 🚀 Getting Started

### 1. Clone the Repository
Ensure you are in the project root directory (`ai interview coach`).

### 2. Backend Setup (Streamlit + AI)
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
   - Open the `.env` file in the root directory.
   - Add your Groq API key:
     ```env
     GROQ_API_KEY=your_groq_api_key_here
     ```

### 3. Frontend Setup (React Dashboard)
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```

## 🏃‍♂️ Running the Application

**Run the AI Interview Engine (Backend):**
From the root directory, start the Streamlit application:
```bash
streamlit run chatbot.py
```
*The app will be available at http://localhost:8501*

**Run the SaaS Dashboard (Frontend):**
From the `frontend` directory, start the Vite development server:
```bash
npm run dev
```
*The dashboard will be available at http://localhost:5173*

## 📁 Project Structure

```text
ai interview coach/
├── .env                # Environment variables (API Keys)
├── chatbot.py          # Core AI logic and Streamlit interface
├── requirements.txt    # Python dependencies
└── frontend/           # React Dashboard application
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── App.jsx     # Main dashboard layout
        ├── index.css   # Global styles and glassmorphism utilities
        └── components/ # Reusable UI components (Sidebar, KPICards, etc.)
```
