import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KPICards from './components/KPICards';
import ResumeAnalysis from './components/ResumeAnalysis';
import PerformanceRadar from './components/PerformanceRadar';
import QuestionAnalysis from './components/QuestionAnalysis';
import ScoreBreakdown from './components/ScoreBreakdown';
import ATSSuggestions from './components/ATSSuggestions';
import RecentInterviews from './components/RecentInterviews';
import ResumeAnalysisPage from './components/ResumeAnalysisPage';
import MockInterviewPage from './components/MockInterviewPage';
import AnswerEvaluationPage from './components/AnswerEvaluationPage';
import ATSCheckerPage from './components/ATSCheckerPage';
import InterviewHistoryPage from './components/InterviewHistoryPage';
import LeaderboardPage from './components/LeaderboardPage';
import SettingsPage from './components/SettingsPage';
import { motion } from 'framer-motion';

function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard');
  
  // Controlled states for sibling communication
  const [questionNumber, setQuestionNumber] = useState(3);
  const [submittedQuestion, setSubmittedQuestion] = useState("Explain the difference between supervised and unsupervised learning.");
  const [submittedAnswer, setSubmittedAnswer] = useState("");

  // State for parsed resume insights (initialized with static details from user spec)
  const [resumeData, setResumeData] = useState({
    name: "Shreya Adsul",
    education: "B.Tech in AIML",
    experience_level: "Fresher",
    skills: [
      "Python", "Machine Learning", "Flask", "SQL", "Pandas", "NumPy",
      "Scikit-Learn", "Git", "Automation", "REST APIs", "HTML", "CSS", "JavaScript"
    ],
    projects_count: 4,
    summary: "Shreya is a B.Tech AIML student with strong skills in Machine Learning, Python, and Web Development. She has built impactful projects like AutoJi (Instagram Automation) and WhatsApp Bot, showcasing automation and API integration expertise.",
    suggested_roles: [
      "Machine Learning Engineer", "Data Scientist", "Backend Developer", "AI Engineer", "Python Developer"
    ],
    resume_score: 82,
    strengths: ["Strong project portfolio", "Good AI foundation"],
    weaknesses: ["Limited cloud exposure"],
    fileName: "Shreya_Resume.pdf",
    uploadedDate: "Uploaded on May 29, 2025"
  });

  const [dynamicQuestions, setDynamicQuestions] = useState([]);

  const handleAnalysisSuccess = (data) => {
    // Save resume metrics
    setResumeData({
      name: data.name,
      education: data.education,
      experience_level: data.experience_level,
      skills: data.skills,
      projects_count: data.projects_count,
      summary: data.summary,
      suggested_roles: data.suggested_roles,
      resume_score: data.resume_score,
      strengths: data.strengths,
      weaknesses: data.weaknesses || data.areas_to_improve || [],
      fileName: data.fileName,
      uploadedDate: data.uploadedDate
    });

    // Save dynamic interview questions for Mock Interview traversal
    if (data.interview_questions) {
      const combined = [
        ...(data.interview_questions.hr || []),
        ...(data.interview_questions.technical || []),
        ...(data.interview_questions.project || [])
      ];
      setDynamicQuestions(combined);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 selection:bg-primary/30">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex flex-col">
        <Header />
        
        <main className="ml-64 p-8">
          {currentPage === 'Dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto"
            >
              <KPICards />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1">
                  <ResumeAnalysis />
                </div>
                <div className="lg:col-span-2">
                  <PerformanceRadar />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <QuestionAnalysis />
                </div>
                <div className="lg:col-span-1">
                  <ScoreBreakdown />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ATSSuggestions />
                <RecentInterviews />
              </div>
            </motion.div>
          ) : currentPage === 'Resume Analysis' ? (
            <motion.div
              key="resume-analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto"
            >
              <ResumeAnalysisPage 
                resumeData={resumeData}
                onAnalysisSuccess={handleAnalysisSuccess}
              />
            </motion.div>
          ) : currentPage === 'Mock Interview' ? (
            <motion.div
              key="mock-interview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto"
            >
              <MockInterviewPage 
                questionNumber={questionNumber}
                setQuestionNumber={setQuestionNumber}
                questions={dynamicQuestions}
                onSubmit={(qNum, qText, answerText) => {
                  setSubmittedQuestion(qText);
                  setSubmittedAnswer(answerText);
                  setQuestionNumber(qNum);
                  setCurrentPage('Answer Evaluation');
                }}
              />
            </motion.div>
          ) : currentPage === 'Answer Evaluation' ? (
            <motion.div
              key="answer-evaluation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto"
            >
              <AnswerEvaluationPage 
                questionNumber={questionNumber}
                question={submittedQuestion}
                userAnswer={submittedAnswer}
                onNextQuestion={() => {
                  const maxQuestions = dynamicQuestions.length > 0 ? dynamicQuestions.length : 15;
                  if (questionNumber < maxQuestions) {
                    setQuestionNumber(questionNumber + 1);
                  }
                  setCurrentPage('Mock Interview');
                }}
              />
            </motion.div>
          ) : currentPage === 'ATS Checker' ? (
            <motion.div
              key="ats-checker"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto"
            >
              <ATSCheckerPage />
            </motion.div>
          ) : currentPage === 'Interview History' ? (
            <motion.div
              key="interview-history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto"
            >
              <InterviewHistoryPage 
                onViewReport={(session) => {
                  let qNum = 3;
                  let qText = "Explain the difference between supervised and unsupervised learning.";
                  let ansText = "";

                  if (session.id === "ml-engineer") {
                    qNum = 3;
                    qText = "Explain the difference between supervised and unsupervised learning.";
                    ansText = "Supervised learning uses labeled datasets to train algorithms to classify data or predict outcomes. Unsupervised learning analyzes and clusters unlabeled datasets to discover hidden patterns.";
                  } else if (session.id === "data-scientist") {
                    qNum = 2;
                    qText = "What is overfitting, and how do you prevent it?";
                    ansText = "Overfitting happens when a machine learning model fits the noise of the training data too closely, making it fail to generalize on unseen data. It can be prevented by using regularization (L1/L2), cross-validation, simplifying the model architecture, or adding more training data.";
                  } else if (session.id === "backend-developer") {
                    qNum = 4;
                    qText = "How do you optimize frontend performance in a React application?";
                    ansText = "I optimize React performance by using code splitting with React.lazy, memoization hooks like useMemo and useCallback, optimizing image assets, minimizing bundle sizes, and reducing unnecessary component re-renders.";
                  } else if (session.id === "aiml-internship") {
                    qNum = 1;
                    qText = "Explain the difference between inner, outer, left, and right joins in SQL.";
                    ansText = "Inner join returns records that have matching values in both tables. Left join returns all records from the left table and the matched records from the right table. Right join returns all from the right and matching from the left. Full outer join returns all records when there is a match in either left or right table.";
                  }

                  setSubmittedQuestion(qText);
                  setSubmittedAnswer(ansText);
                  setQuestionNumber(qNum);
                  setCurrentPage('Answer Evaluation');
                }}
              />
            </motion.div>
          ) : currentPage === 'Leaderboard' ? (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto"
            >
              <LeaderboardPage />
            </motion.div>
          ) : currentPage === 'Settings' ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto"
            >
              <SettingsPage />
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto text-center py-20"
            >
              <h2 className="text-2xl font-bold text-white mb-2">{currentPage}</h2>
              <p className="text-gray-400">This page is under construction.</p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
