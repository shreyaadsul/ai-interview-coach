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
import SettingsPage from './components/SettingsPage';
import InterviewSetupModal from './components/InterviewSetupModal';
import InterviewBriefingPage from './components/InterviewBriefingPage';
import InterviewReportPage from './components/InterviewReportPage';
import LoginPage from './components/LoginPage';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard');
  
  // Authentication State
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  });
  const isAuthenticated = !!userProfile;

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('userProfile');
    }
  }, [userProfile]);

  const handleLogin = async (profile) => {
    setUserProfile(profile);
    
    // Attempt to save user profile to MongoDB
    try {
      await fetch("http://localhost:5000/api/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
    } catch (err) {
      console.error("Failed to save user to MongoDB, falling back to LocalStorage only", err);
    }
    
    // Wipe previous session data for the new user
    setInterviewHistory([]);
    setCareerInsights(null);
    setCurrentReport(null);
    
    // Set a blank resume slate based on login info
    setResumeData({
      name: profile.name,
      education: "Not Provided",
      experience_level: profile.experienceLevel,
      skills: [],
      projects_count: 0,
      summary: "Please head over to the Resume Analysis tab and upload your resume to generate your AI-driven career summary and extract your skills.",
      suggested_roles: profile.targetRole ? [profile.targetRole] : ["Software Engineer"],
      resume_score: 0,
      strengths: [],
      weaknesses: [],
      fileName: "No Resume Uploaded",
      uploadedDate: "N/A"
    });
  };

  const handleLogout = () => {
    setUserProfile(null);
    setCurrentPage('Dashboard');
    // Clear the resume data so the next user starts fresh
    localStorage.removeItem('resumeData');
    setResumeData({
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
      fileName: "Static_Resume.pdf",
      uploadedDate: "Uploaded on May 29, 2025"
    });
  };
  
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

  // Fetch user-specific data from MongoDB on mount/login
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userProfile?.email) return;
      const userId = userProfile.email;

      // Load History
      try {
        const response = await fetch(`http://localhost:5000/api/interviews?user_id=${encodeURIComponent(userId)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.history) {
            setInterviewHistory(data.history);
          }
        }
      } catch (err) {
        console.error("Failed to fetch history from MongoDB", err);
      }

      // Load Resume Analysis
      try {
        const response = await fetch(`http://localhost:5000/api/resume?user_id=${encodeURIComponent(userId)}`);
        if (response.ok) {
          const data = await response.json();
          const { user_id, ...cleanData } = data;
          setResumeData(cleanData);
        }
      } catch (err) {
        console.error("Failed to fetch resume analysis from MongoDB", err);
      }

      // Load Career Insights
      try {
        const response = await fetch(`http://localhost:5000/api/career-insights?user_id=${encodeURIComponent(userId)}`);
        if (response.ok) {
          const data = await response.json();
          setCareerInsights(data);
        }
      } catch (err) {
        console.error("Failed to fetch career insights from MongoDB", err);
      }
    };

    fetchUserData();
  }, [userProfile]);

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
      name: userProfile?.name || "Shreya Adsul",
      education: "B.Tech in AIML",
      experience_level: userProfile?.experienceLevel || "Fresher",
      skills: [
        "Python", "Machine Learning", "Flask", "SQL", "Pandas", "NumPy",
        "Scikit-Learn", "Git", "Automation", "REST APIs", "HTML", "CSS", "JavaScript"
      ],
      projects_count: 4,
      summary: "Shreya is a B.Tech AIML student with strong skills in Machine Learning, Python, and Web Development. She has built impactful projects like AutoJi (Instagram Automation) and WhatsApp Bot, showcasing automation and API integration expertise.",
      suggested_roles: [
        userProfile?.targetRole || "Machine Learning Engineer", "Data Scientist", "Backend Developer", "AI Engineer", "Python Developer"
      ],
      resume_score: 82,
      strengths: ["Strong project portfolio", "Good AI foundation"],
      weaknesses: ["Limited cloud exposure"],
      fileName: "Static_Resume.pdf",
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
        body: JSON.stringify({ 
          resume_data: parsedResumeData,
          user_id: userProfile?.email
        })
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
        
        let careerCoachData = null;
        try {
          const coachRes = await fetch("http://localhost:5000/api/career-coach", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resume_score: resumeData.resume_score || 0,
              ats_score: resumeData.atsScore || 75,
              technical_score: report.technical_score || 0,
              communication_score: report.communication_score || 0,
              problem_solving_score: report.problem_solving_score || 0,
              confidence_score: report.confidence_score || 0,
              skills: resumeData.skills || [],
              weaknesses: resumeData.weaknesses || [],
              resume_summary: resumeData.summary || "",
              interview_answers: answers
            })
          });
          if (coachRes.ok) {
            careerCoachData = await coachRes.json();
          }
        } catch(err) {
          console.error("Coach API failed", err);
        }

        const fullReport = { ...report, career_coach: careerCoachData };
        setCurrentReport(fullReport);
        
        const session_id = Date.now().toString();
        // Save to history
        const newSession = {
          id: session_id,
          session_id: session_id,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          role: currentSessionConfig?.target_role || "General",
          score: report.overall_score || 0,
          duration: `10 Mins`,
          questions_count: questions.length,
          report: fullReport,
          readiness_score: careerCoachData?.interview_readiness || 0,
          hiring_recommendation: careerCoachData?.hiring_recommendation || "N/A",
          suggested_role: careerCoachData?.suggested_role || "N/A"
        };
        
        // Save to MongoDB
        try {
          await fetch("http://localhost:5000/api/interview/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...newSession,
              user_id: userProfile?.email,
              questions: questions,
              answers: answers
            })
          });
        } catch(err) {
          console.error("MongoDB save failed, falling back to LocalStorage only", err);
        }

        setInterviewHistory(prev => [newSession, ...prev]);
        
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

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-navy-900 selection:bg-primary/30">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex flex-col">
        <Header 
          userName={userProfile?.name || resumeData.name} 
          avatar={userProfile?.avatar}
          onNewInterview={() => setShowSetupModal(true)} 
          onNameChange={(newName) => {
            setResumeData({...resumeData, name: newName});
            setUserProfile({...userProfile, name: newName});
          }} 
          onLogout={handleLogout}
          currentPage={currentPage}
          resumeData={resumeData}
          setCurrentPage={setCurrentPage}
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

              {interviewHistory.length > 0 && interviewHistory[0].report?.career_coach && (
                <div className="mb-8 space-y-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="text-3xl">🚀</span> Career Readiness Engine
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Readiness Score Card */}
                    <div className="glass p-6 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center bg-gradient-to-b from-navy-800 to-navy-900 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
                      <h3 className="text-gray-400 font-semibold mb-4 uppercase tracking-widest text-xs">Interview Readiness</h3>
                      <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
                        {interviewHistory[0].report.career_coach.interview_readiness}%
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${interviewHistory[0].report.career_coach.interview_readiness >= 90 ? 'bg-success/10 text-success border-success/20' : interviewHistory[0].report.career_coach.interview_readiness >= 80 ? 'bg-primary/10 text-primary border-primary/20' : interviewHistory[0].report.career_coach.interview_readiness >= 70 ? 'bg-warning/10 text-warning border-warning/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                        {interviewHistory[0].report.career_coach.interview_readiness >= 90 ? 'Elite' : interviewHistory[0].report.career_coach.interview_readiness >= 80 ? 'Ready' : interviewHistory[0].report.career_coach.interview_readiness >= 70 ? 'Improving' : 'Needs Practice'}
                      </div>
                    </div>

                    {/* AI Career Coach Insights */}
                    <div className="glass p-6 border border-white/10 rounded-2xl md:col-span-2 relative overflow-hidden">
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/10 blur-3xl rounded-full" />
                      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <span>🤖</span> AI Career Coach
                      </h3>
                      <p className="text-gray-300 italic mb-6">"{interviewHistory[0].report.career_coach.mentor_insight}"</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Suggested Role</p>
                          <p className="text-sm font-semibold text-white">{interviewHistory[0].report.career_coach.suggested_role}</p>
                        </div>
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Hiring Recommendation</p>
                          <p className={`text-sm font-bold ${interviewHistory[0].report.career_coach.hiring_recommendation === 'Strongly Recommended' ? 'text-success' : interviewHistory[0].report.career_coach.hiring_recommendation === 'Recommended' ? 'text-primary' : interviewHistory[0].report.career_coach.hiring_recommendation === 'Borderline' ? 'text-warning' : 'text-danger'}`}>{interviewHistory[0].report.career_coach.hiring_recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Career Gap Analysis */}
                    <div className="glass p-6 border border-white/10 rounded-2xl">
                      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="text-warning">⚠️</span> Career Gap Analysis
                      </h3>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-400">Missing Critical Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {interviewHistory[0].report.career_coach.skill_gaps?.map((gap, i) => (
                            <span key={i} className="px-3 py-1 bg-danger/10 text-danger border border-danger/20 rounded-lg text-sm">{gap}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Learning Roadmap */}
                    <div className="glass p-6 border border-white/10 rounded-2xl lg:col-span-2">
                      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="text-success">📈</span> Personalized Learning Roadmap
                      </h3>
                      <div className="relative">
                        <div className="absolute top-0 bottom-0 left-[15px] w-0.5 bg-white/10" />
                        <div className="space-y-4">
                          {interviewHistory[0].report.career_coach.roadmap?.map((step, i) => (
                            <div key={i} className="relative pl-10">
                              <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-navy-900 border-2 border-primary flex items-center justify-center z-10">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              </div>
                              <h4 className="text-white font-semibold text-sm">{step.week}</h4>
                              <p className="text-gray-400 text-sm">{step.focus}</p>
                            </div>
                          ))}
                        </div>
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
                onViewReport={async (session) => {
                  let reportToUse = session.report;
                  
                  // If report isn't embedded, try to fetch from MongoDB
                  if (!reportToUse && session.id) {
                    try {
                      const response = await fetch(`http://localhost:5000/api/interview/${session.id}?user_id=${encodeURIComponent(userProfile?.email || "")}`);
                      if (response.ok) {
                        const data = await response.json();
                        reportToUse = data.report;
                      }
                    } catch(err) {
                      console.error("Failed to fetch report from MongoDB", err);
                    }
                  }
                  
                  if (reportToUse) {
                    setCurrentReport(reportToUse);
                    setCurrentPage('Interview Report');
                  } else {
                    // Fallback for static items without report
                    alert("Detailed report not available for this session.");
                  }
                }}
              />
            </motion.div>
          ) : currentPage === 'Settings' ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto"
            >
              <SettingsPage onProfileUpdate={setUserProfile} />
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
