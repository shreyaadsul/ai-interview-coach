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
import PerformanceChart from './components/PerformanceChart';
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
import { Loader2, FileText, Target, CheckCircle2, TrendingUp, Video, Award, ChevronRight, Play, Upload, BookOpen } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [globalMediaStream, setGlobalMediaStream] = useState(null);
  const [globalVoice, setGlobalVoice] = useState(null);


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
      await fetch(`${API}/api/user/save`, {
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
    localStorage.removeItem('resumeData');
    setResumeData({
      name: "",
      education: "Not Provided",
      experience_level: "Fresher",
      skills: [],
      projects_count: 0,
      summary: "Please head over to the Resume Analysis tab and upload your resume to generate your AI-driven career summary and extract your skills.",
      suggested_roles: [],
      resume_score: 0,
      strengths: [],
      weaknesses: [],
      fileName: "No Resume Uploaded",
      uploadedDate: "N/A"
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
        const response = await fetch(`${API}/api/interviews?user_id=${encodeURIComponent(userId)}`);
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
        const response = await fetch(`${API}/api/resume?user_id=${encodeURIComponent(userId)}`);
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
        const response = await fetch(`${API}/api/career-insights?user_id=${encodeURIComponent(userId)}`);
        if (response.ok) {
          const data = await response.json();
          setCareerInsights(data);
        }
      } catch (err) {
        console.error("Failed to fetch career insights from MongoDB", err);
      }

      // Load User Settings / Profile (to sync avatar and profile photo)
      try {
        const response = await fetch(`${API}/api/settings?user_id=${encodeURIComponent(userId)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setUserProfile(prev => {
              const updated = {
                ...prev,
                ...data.profile
              };
              localStorage.setItem('userProfile', JSON.stringify(updated));
              return updated;
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings from MongoDB", err);
      }
    };

    fetchUserData();
  }, [userProfile?.email]);

  // Pre-load text-to-speech voices globally
  useEffect(() => {
    const loadVoices = () => {
      if (globalVoice) return;
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;
      const voicePriority = [
        'microsoft aria', 'microsoft zira', 'google uk english female',
        'google us english female', 'female', 'samantha', 'heera', 'veena',
        'hazel', 'susan', 'tessa', 'fiona', 'moira', 'karen', 'victoria'
      ];
      const englishVoices = voices.filter(v => v.lang.startsWith('en') || v.lang.includes('en-'));
      let foundVoice = null;
      const targetLangs = ['en-US', 'en-IN'];
      for (const lang of targetLangs) {
        const langVoices = englishVoices.filter(v => v.lang.toLowerCase().includes(lang.toLowerCase()));
        for (const priority of voicePriority) {
          foundVoice = langVoices.find(v => v.name.toLowerCase().includes(priority));
          if (foundVoice) break;
        }
        if (foundVoice) break;
      }
      if (!foundVoice) foundVoice = englishVoices.find(v => v.name.toLowerCase().includes('female')) || englishVoices[0] || voices[0];
      setGlobalVoice(foundVoice);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [globalVoice]);

  const [dashboardSummary, setDashboardSummary] = useState({
    resumeScore: 0,
    atsScore: 0,
    interviewScore: 0,
    readinessScore: 0,
    statusText: "Beginner",
    resumeUploaded: false,
    resumeDate: null,
    resumeFileName: null,
    resumeInsights: { strengths: [], weaknesses: [], summary: "" },
    atsCompleted: false,
    atsMissingKeywords: [],
    atsSuggestions: [],
    mockCompleted: false,
    recentInterview: null,
    careerInsights: {},
    lastUpdated: null
  });

  const fetchDashboardData = async () => {
    if (!userProfile?.email) return;
    try {
      const response = await fetch(`${API}/api/dashboard?user_id=${encodeURIComponent(userProfile.email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardSummary(data);
          if (data.resumeUploaded && data.resumeInsights) {
            setResumeData(prev => ({
              ...prev,
              resume_score: data.resumeScore,
              atsScore: data.atsScore,
              ats_score: data.atsScore,
              fileName: data.resumeFileName || prev.fileName,
              uploadedDate: data.resumeDate || prev.uploadedDate,
              strengths: data.resumeInsights.strengths,
              weaknesses: data.resumeInsights.weaknesses,
              summary: data.resumeInsights.summary
            }));
          }
          if (data.careerInsights) {
            setCareerInsights(data.careerInsights);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
      name: userProfile?.name || "",
      education: "Not Provided",
      experience_level: userProfile?.experienceLevel || "Fresher",
      skills: [],
      projects_count: 0,
      summary: "Please head over to the Resume Analysis tab and upload your resume to generate your AI-driven career summary and extract your skills.",
      suggested_roles: userProfile?.targetRole ? [userProfile.targetRole] : [],
      resume_score: 0,
      strengths: [],
      weaknesses: [],
      fileName: "No Resume Uploaded",
      uploadedDate: "N/A"
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
      const response = await fetch(`${API}/api/career-insights`, {
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
    console.log("QUESTION BEFORE STORAGE:", questions[0]);
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
      await fetchDashboardData();

      setDynamicQuestions([]);
      setCurrentPage('Interview Report');
      setIsEvaluating(false);
      return;
    }
    try {
      const response = await fetch(`${API}/api/evaluate-interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions, answers })
      });
      if (response.ok) {
        const report = await response.json();

        let careerCoachData = null;
        try {
          const coachRes = await fetch(`${API}/api/career-coach`, {
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
        } catch (err) {
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
          await fetch(`${API}/api/interview/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...newSession,
              user_id: userProfile?.email,
              questions: questions,
              answers: answers
            })
          });
        } catch (err) {
          console.error("MongoDB save failed, falling back to LocalStorage only", err);
        }

        setInterviewHistory(prev => [newSession, ...prev]);
        await fetchDashboardData();

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
            setResumeData({ ...resumeData, name: newName });
            setUserProfile({ ...userProfile, name: newName });
          }}
          onLogout={handleLogout}
          currentPage={currentPage}
          resumeData={resumeData}
          setCurrentPage={setCurrentPage}
          interviewHistory={interviewHistory}
          onSelectReport={async (session) => {
            let reportToUse = session.report;
            if (!reportToUse && session.id) {
              try {
                const response = await fetch(`${API}/api/interview/${session.id}?user_id=${encodeURIComponent(userProfile?.email || "")}`);
                if (response.ok) {
                  const data = await response.json();
                  reportToUse = data.report;
                }
              } catch (err) {
                console.error("Failed to fetch report from MongoDB", err);
              }
            }
            if (reportToUse) {
              setCurrentReport(reportToUse);
              setCurrentPage('Interview Report');
            } else {
              alert("Detailed report not available for this session.");
            }
          }}
        />

        <InterviewSetupModal
          isOpen={showSetupModal}
          onClose={() => setShowSetupModal(false)}
          onStart={handleStartInterview}
          resumeData={resumeData}
        />

        <main className="ml-[260px] p-8">
          {currentPage === 'Dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto space-y-8"
            >
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Resume Score */}
                <div
                  onClick={() => !dashboardSummary.resumeUploaded && setCurrentPage('Resume Analysis')}
                  className={`bg-white border border-[#E5E7EB] p-5 rounded-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] space-y-3 transition-all duration-200 ${!dashboardSummary.resumeUploaded ? 'cursor-pointer hover:bg-gray-50/50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Resume Score</span>
                    <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    {dashboardSummary.resumeUploaded ? (
                      <>
                        <div className="text-3xl font-extrabold text-textPrimary">{dashboardSummary.resumeScore}</div>
                        <p className="text-xs text-textSecondary font-medium truncate">📄 {dashboardSummary.resumeDate || 'Resume Analyzed'}</p>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-extrabold text-textPrimary">--</div>
                        <span className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                          📄 Upload Resume <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* 2. ATS Score */}
                <div
                  onClick={() => !dashboardSummary.atsCompleted && setCurrentPage('ATS Checker')}
                  className={`bg-white border border-[#E5E7EB] p-5 rounded-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] space-y-3 transition-all duration-200 ${!dashboardSummary.atsCompleted ? 'cursor-pointer hover:bg-gray-50/50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">ATS Score</span>
                    <div className="w-8 h-8 rounded-lg bg-secondary/5 border border-secondary/10 flex items-center justify-center text-secondary">
                      <Target className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    {dashboardSummary.atsCompleted ? (
                      <>
                        <div className="text-3xl font-extrabold text-textPrimary">{dashboardSummary.atsScore}</div>
                        <p className="text-xs text-textSecondary font-medium truncate">📈 Compatibility: {dashboardSummary.atsScore >= 80 ? 'Excellent' : dashboardSummary.atsScore >= 70 ? 'Good' : 'Needs Improvement'}</p>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-extrabold text-textPrimary">--</div>
                        <span className="text-xs text-secondary font-bold hover:underline flex items-center gap-1">
                          📈 Complete ATS Analysis <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Interview Score */}
                <div
                  onClick={() => !dashboardSummary.mockCompleted && setShowSetupModal(true)}
                  className={`bg-white border border-[#E5E7EB] p-5 rounded-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] space-y-3 transition-all duration-200 ${!dashboardSummary.mockCompleted ? 'cursor-pointer hover:bg-gray-50/50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Interview Score</span>
                    <div className="w-8 h-8 rounded-lg bg-success/5 border border-success/10 flex items-center justify-center text-success">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    {dashboardSummary.mockCompleted ? (
                      <>
                        <div className="text-3xl font-extrabold text-textPrimary">{dashboardSummary.interviewScore}</div>
                        <p className="text-xs text-textSecondary font-medium truncate">🎤 Last Role: {dashboardSummary.recentInterview?.role || 'General'}</p>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-extrabold text-textPrimary">--</div>
                        <span className="text-xs text-success font-bold hover:underline flex items-center gap-1">
                          🎤 Take Mock Interview <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* 4. Interview Readiness */}
                <div className="bg-white border border-[#E5E7EB] p-5 rounded-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] space-y-3 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Interview Readiness</span>
                    <div className="w-8 h-8 rounded-lg bg-warning/5 border border-warning/10 flex items-center justify-center text-warning">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-extrabold text-textPrimary">
                      {dashboardSummary.resumeUploaded || dashboardSummary.atsCompleted || dashboardSummary.mockCompleted
                        ? `${dashboardSummary.readinessScore}%`
                        : "--"
                      }
                    </div>
                    <p className="text-xs text-textSecondary font-medium truncate">
                      🚀 Status: {dashboardSummary.resumeUploaded || dashboardSummary.atsCompleted || dashboardSummary.mockCompleted
                        ? dashboardSummary.statusText
                        : "Unlock readiness insights."
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Two-Column SaaS Content Layout: Left (60%) & Right (40%) */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* LEFT SIDE (60%): spans 3 of 5 columns */}
                <div className="lg:col-span-3 space-y-6">

                  {/* 1. Interview Readiness Card */}
                  <div className="bg-white border border-[#E5E7EB] p-8 rounded-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col justify-between items-center text-center space-y-6 transition-all duration-200 min-h-[340px]">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-textPrimary">Interview Readiness</h3>
                      <p className="text-xs text-textSecondary font-semibold">Your preparation score calculated by AI</p>
                    </div>

                    {/* Circular progress ring */}
                    {dashboardSummary.resumeUploaded || dashboardSummary.atsCompleted || dashboardSummary.mockCompleted ? (
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50" cy="50" r="40"
                            stroke="#F3F4F6" strokeWidth="8" fill="transparent"
                          />
                          <circle
                            cx="50" cy="50" r="40"
                            stroke="#4F46E5" strokeWidth="8" fill="transparent"
                            strokeDasharray={2 * Math.PI * 40}
                            strokeDashoffset={2 * Math.PI * 40 - (dashboardSummary.readinessScore / 100) * (2 * Math.PI * 40)}
                            strokeLinecap="round"
                            className="transition-all duration-500 ease-out"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-textPrimary">{dashboardSummary.readinessScore}%</span>
                          <span className="text-[9px] text-textSecondary uppercase tracking-widest font-extrabold mt-0.5 px-2 text-center truncate max-w-[120px]">{dashboardSummary.statusText}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50" cy="50" r="40"
                            stroke="#F3F4F6" strokeWidth="8" fill="transparent"
                          />
                          <circle
                            cx="50" cy="50" r="40"
                            stroke="#E5E7EB" strokeWidth="8" fill="transparent"
                            strokeDasharray={2 * Math.PI * 40}
                            strokeDashoffset={2 * Math.PI * 40}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-textSecondary">--</span>
                          <span className="text-[10px] text-textSecondary uppercase tracking-widest font-extrabold mt-0.5">READY</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 w-full">
                      <p className="text-xs text-textSecondary leading-relaxed px-6">
                        {dashboardSummary.resumeUploaded || dashboardSummary.atsCompleted || dashboardSummary.mockCompleted ? (
                          <>Your overall readiness score is <strong>{dashboardSummary.readinessScore}%</strong>. Keep improving to reach the <strong>Excellent Candidate</strong> level!</>
                        ) : (
                          <>Complete your first mock interview to generate your readiness score.</>
                        )}
                      </p>
                      <button
                        onClick={() => setShowSetupModal(true)}
                        className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-sm transition-all shadow-sm"
                      >
                        Take Mock Interview
                      </button>
                    </div>
                  </div>

                  {/* 2. Performance Trend Card */}
                  {interviewHistory && interviewHistory.length > 0 ? (
                    <div className="min-h-[340px] flex flex-col justify-between">
                      <PerformanceChart data={interviewHistory} />
                    </div>
                  ) : (
                    <div className="bg-white border border-[#E5E7EB] p-8 rounded-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col justify-between transition-all duration-200 min-h-[340px]">
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-textPrimary">Performance Trend</h3>
                        <p className="text-xs text-textSecondary font-semibold">Mock interview score milestones</p>
                      </div>

                      {/* Empty state chart illustration */}
                      <div className="flex-grow flex flex-col items-center justify-center py-8 space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-textSecondary shadow-sm">
                          <TrendingUp className="w-8 h-8 opacity-40" />
                        </div>
                        <p className="text-xs text-textSecondary font-bold">No interview data available yet.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT SIDE (40%): spans 2 of 5 columns */}
                <div className="lg:col-span-2 space-y-6">

                  {/* 1. Recent Interviews Card */}
                  {interviewHistory && interviewHistory.length > 0 ? (
                    <div className="min-h-[340px] flex flex-col justify-between">
                      <RecentInterviews history={interviewHistory} onViewAll={() => setCurrentPage('Interview History')} />
                    </div>
                  ) : (
                    <div className="bg-white border border-[#E5E7EB] p-8 rounded-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col justify-between transition-all duration-200 min-h-[340px]">
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-textPrimary">Recent Interviews</h3>
                        <p className="text-xs text-textSecondary font-semibold">History of your mock sessions</p>
                      </div>

                      {/* Empty state table illustration */}
                      <div className="flex-grow flex flex-col items-center justify-center py-10 space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-textSecondary shadow-sm">
                          <Video className="w-6 h-6 opacity-40" />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-xs text-textPrimary font-bold">No interviews completed yet.</p>
                          <p className="text-[11px] text-textSecondary">Your mock records will appear here after your first session.</p>
                        </div>
                        <button
                          onClick={() => setShowSetupModal(true)}
                          className="px-4 py-2 border border-primary/20 hover:border-primary/40 text-xs font-bold rounded-xl bg-primary/5 hover:bg-primary/10 text-primary transition-all duration-200 shadow-sm"
                        >
                          Start First Interview
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. Recommended Actions Card */}
                  <div className="bg-white border border-[#E5E7EB] p-8 rounded-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col justify-between transition-all duration-200 min-h-[340px]">
                    <div className="space-y-1 mb-4">
                      <h3 className="text-base font-bold text-textPrimary">Recommended Actions</h3>
                      <p className="text-xs text-textSecondary font-semibold">Steps to accelerate your progress</p>
                    </div>

                    <div className="space-y-4 flex-grow flex flex-col justify-center">
                      {/* Action 1: Upload Resume */}
                      <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-2xl hover:border-gray-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-textPrimary">Upload Resume</h4>
                            <p className="text-[10px] text-textSecondary mt-0.5">Parse metrics & target suggestions.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setCurrentPage('Resume Analysis')}
                          className="p-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-white text-textSecondary hover:text-textPrimary transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Action 2: Run ATS Analysis */}
                      <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-2xl hover:border-gray-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-secondary/5 border border-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                            <Target className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-textPrimary">Run ATS Analysis</h4>
                            <p className="text-[10px] text-textSecondary mt-0.5">Check for job profile matches.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setCurrentPage('ATS Checker')}
                          className="p-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-white text-textSecondary hover:text-textPrimary transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Action 3: Start Mock Interview */}
                      <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-2xl hover:border-gray-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-success/5 border border-success/10 flex items-center justify-center text-success flex-shrink-0">
                            <Video className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-textPrimary">Start Mock Interview</h4>
                            <p className="text-[10px] text-textSecondary mt-0.5">Engage in live proctored sessions.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowSetupModal(true)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-white text-textSecondary hover:text-textPrimary transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Action 4: Visit Career Coach */}
                      <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-2xl hover:border-gray-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-warning/5 border border-warning/10 flex items-center justify-center text-warning flex-shrink-0">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-textPrimary">Visit Career Coach</h4>
                            <p className="text-[10px] text-textSecondary mt-0.5">Get roadmap & learning paths.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowSetupModal(true)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-white text-textSecondary hover:text-textPrimary transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

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
                onCameraReady={setGlobalMediaStream}
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
                /* AIAvatar is exclusively rendered inside MockInterviewPage.
                   Do NOT render AIAvatar on Dashboard, Resume Analysis, ATS Checker, 
                   Interview History, or Settings pages. */
                <MockInterviewPage
                  questionNumber={questionNumber}
                  setQuestionNumber={setQuestionNumber}
                  questions={dynamicQuestions}
                  setQuestions={setDynamicQuestions}
                  sessionConfig={currentSessionConfig}
                  resumeData={resumeData}
                  onSubmit={handleFinishInterview}
                  globalMediaStream={globalMediaStream}
                  globalVoice={globalVoice}
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
              <ATSCheckerPage setResumeData={setResumeData} onAtsComplete={fetchDashboardData} />
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
                      const response = await fetch(`${API}/api/interview/${session.id}?user_id=${encodeURIComponent(userProfile?.email || "")}`);
                      if (response.ok) {
                        const data = await response.json();
                        reportToUse = data.report;
                      }
                    } catch (err) {
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
