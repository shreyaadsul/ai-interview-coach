import React, { useState, useEffect } from 'react';
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
import ATSCheckerPage from './components/ATSCheckerPage';
import InterviewHistoryPage from './components/InterviewHistoryPage';
import LeaderboardPage from './components/LeaderboardPage';
import SettingsPage from './components/SettingsPage';
import InterviewSetupModal from './components/InterviewSetupModal';
import InterviewBriefingPage from './components/InterviewBriefingPage';
import InterviewReportPage from './components/InterviewReportPage';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard');
  
  // Controlled states for sibling communication
  const [questionNumber, setQuestionNumber] = useState(1);
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState("");

  // Storage states
  const [interviewHistory, setInterviewHistory] = useState(() => {
    const saved = localStorage.getItem('interviewHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('interviewHistory', JSON.stringify(interviewHistory));
  }, [interviewHistory]);

  // Current session states
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [currentSessionConfig, setCurrentSessionConfig] = useState(null);
  const [dynamicQuestions, setDynamicQuestions] = useState([]);
  const [careerInsights, setCareerInsights] = useState(null);
  const [currentReport, setCurrentReport] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // State for parsed resume insights (initialized with static details from user spec)
  const [resumeData, setResumeData] = useState(() => {
    const saved = localStorage.getItem('resumeData');
    if (saved) return JSON.parse(saved);
    return {
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
    };
  });

  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  const handleAnalysisSuccess = async (data) => {
    // Save resume metrics
    const parsedResumeData = {
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
    };
    setResumeData(parsedResumeData);

    try {
      const response = await fetch("http://localhost:5000/api/career-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_data: parsedResumeData })
      });
      if (response.ok) {
        const insights = await response.json();
        setCareerInsights(insights);
      }
    } catch (err) {
      console.error("Failed to generate career insights", err);
    }
  };

  const handleStartInterview = (config, questions) => {
    setCurrentSessionConfig(config);
    setDynamicQuestions(questions);
    setQuestionNumber(1);
    setShowSetupModal(false);
    setCurrentPage('Interview Briefing');
  };

  const handleFinishInterview = async (questions, answers, isDisqualified = false) => {
    setIsEvaluating(true);
    setCurrentPage('Evaluating');

    if (isDisqualified) {
      const disqualifiedReport = {
        overall_score: 0,
        technical_score: 0,
        communication_score: 0,
        confidence_score: 0,
        problem_solving_score: 0,
        strengths: ["None (Interview Disqualified)"],
        areas_to_improve: ["Proctoring Violation: You exceeded the maximum number of allowed warnings (e.g., looking away, tab switching, exiting fullscreen)."],
        recommendations: ["Maintain focus on the screen.", "Do not exit fullscreen.", "Ensure your camera is working properly."],
        detailed_feedback: questions.map(q => ({
          question: q,
          feedback: "Disqualified due to proctoring violation. No evaluation provided."
        }))
      };
      
      setCurrentReport(disqualifiedReport);
      
      const newSession = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: currentSessionConfig?.target_role || "General",
        score: 0,
        duration: `Disqualified`,
        questions_count: questions.length,
        report: disqualifiedReport
      };
      setInterviewHistory([newSession, ...interviewHistory]);
      
      setDynamicQuestions([]);
      setCurrentPage('Interview Report');
      setIsEvaluating(false);
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/evaluate-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions, answers })
      });
      if (response.ok) {
        const report = await response.json();
        setCurrentReport(report);
        
        // Save to history
        const newSession = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          role: currentSessionConfig?.target_role || "General",
          score: report.overall_score || 0,
          duration: `30 Mins`,
          questions_count: questions.length,
          report: report
        };
        setInterviewHistory([newSession, ...interviewHistory]);
        
        setDynamicQuestions([]);
        setCurrentPage('Interview Report');
      } else {
        console.error("Evaluation failed.");
        setCurrentPage('Dashboard');
      }
    } catch (err) {
      console.error(err);
      setCurrentPage('Dashboard');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 selection:bg-primary/30">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex flex-col">
        <Header 
          userName={resumeData.name} 
          onNewInterview={() => setShowSetupModal(true)} 
          onNameChange={(newName) => setResumeData({...resumeData, name: newName})} 
          currentPage={currentPage}
          resumeData={resumeData}
        />
        
        <InterviewSetupModal 
          isOpen={showSetupModal} 
          onClose={() => setShowSetupModal(false)} 
          onStart={handleStartInterview}
          resumeData={resumeData}
        />

        <main className="ml-64 p-8">
          {currentPage === 'Dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto"
            >
              {careerInsights && (
                <div className="mb-8 glass p-6 border border-primary/30 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full" />
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-2xl">💡</span> AI Mentor Insights
                  </h3>
                  <p className="text-gray-300 italic mb-4">{careerInsights.mentor_message}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Recommended Next Step</h4>
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-primary font-semibold">
                        {careerInsights.next_interview_path || "Backend Developer Intermediate"}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Learning Focus</h4>
                      <div className="flex flex-wrap gap-2">
                        {careerInsights.learning_recommendations?.slice(0,3).map((rec, i) => (
                          <span key={i} className="px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-lg text-sm">{rec}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <KPICards resumeData={resumeData} history={interviewHistory} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1">
                  <ResumeAnalysis resumeData={resumeData} />
                </div>
                <div className="lg:col-span-2">
                  <PerformanceRadar resumeData={resumeData} history={interviewHistory} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <QuestionAnalysis resumeData={resumeData} history={interviewHistory} />
                </div>
                <div className="lg:col-span-1">
                  <ScoreBreakdown resumeData={resumeData} history={interviewHistory} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ATSSuggestions resumeData={resumeData} />
                <RecentInterviews resumeData={resumeData} history={interviewHistory} />
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
          ) : currentPage === 'Interview Briefing' ? (
            <motion.div
              key="interview-briefing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto"
            >
              <InterviewBriefingPage 
                sessionConfig={currentSessionConfig} 
                resumeData={resumeData}
                onBegin={() => setCurrentPage('Mock Interview')}
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
              {dynamicQuestions && dynamicQuestions.length > 0 ? (
                <MockInterviewPage 
                  questionNumber={questionNumber}
                  setQuestionNumber={setQuestionNumber}
                  questions={dynamicQuestions}
                  setQuestions={setDynamicQuestions}
                  sessionConfig={currentSessionConfig}
                  resumeData={resumeData}
                  onSubmit={handleFinishInterview}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 border border-primary/20">
                    <span className="text-3xl">🎙️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">No Active Interview</h2>
                  <p className="text-gray-400 max-w-md mb-6">Please configure and start a new interview session to access the proctored mock interview environment.</p>
                  <button 
                    onClick={() => setShowSetupModal(true)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:shadow-lg hover:shadow-primary/25 transition-all"
                  >
                    Start New Interview
                  </button>
                </div>
              )}
            </motion.div>
          ) : currentPage === 'Evaluating' ? (
            <motion.div
              key="evaluating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto text-center py-32 space-y-6"
            >
              <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
              <h2 className="text-2xl font-bold text-white">Evaluating Your Performance...</h2>
              <p className="text-gray-400">Our AI is currently reviewing your answers and generating a comprehensive report.</p>
            </motion.div>
          ) : currentPage === 'Interview Report' ? (
            <motion.div
              key="interview-report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto"
            >
              <InterviewReportPage 
                report={currentReport} 
                onBackToHistory={() => setCurrentPage('Interview History')}
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
              <ATSCheckerPage setResumeData={setResumeData} />
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
                history={interviewHistory}
                onViewReport={(session) => {
                  if (session.report) {
                    setCurrentReport(session.report);
                    setCurrentPage('Interview Report');
                  } else {
                    // Fallback for static items without report
                    alert("Detailed report not available for this legacy session.");
                  }
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
