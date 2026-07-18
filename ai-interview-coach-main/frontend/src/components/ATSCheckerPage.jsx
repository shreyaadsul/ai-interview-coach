import React, { useState } from 'react';
import ResumeUploader from './ResumeUploader';
import ATSScoreCard from './ATSScoreCard';
import KeywordBadge from './KeywordBadge';
import SuggestionCard from './SuggestionCard';
import { ArrowLeft, RefreshCw, FileText } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

export default function ATSCheckerPage({ setResumeData, onAtsComplete }) {
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [analysisResult, setAnalysisResult] = useState({
    atsScore: 0,
    missingKeywords: [],
    suggestions: []
  });

  const handleUploadSuccess = async (name, file) => {
    setFileName(name);
    setIsAnalyzing(true);

    const userProfileStr = localStorage.getItem('userProfile');
    const userProfile = userProfileStr ? JSON.parse(userProfileStr) : null;
    const userId = userProfile?.email || "";

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("target_role", targetRole || "Software Engineer");
    if (userId) {
      formData.append("user_id", userId);
    }

    try {
      const response = await fetch(`${API}/api/ats-checker`, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisResult({
          atsScore: data.atsScore || 0,
          missingKeywords: data.missingKeywords || [],
          suggestions: data.suggestions || []
        });
        if (setResumeData) {
          setResumeData(prev => ({
            ...prev,
            resume_score: data.atsScore || prev.resume_score,
            ats_missing_keywords: data.missingKeywords || [],
            ats_suggestions: data.suggestions || []
          }));
        }
        if (onAtsComplete) {
          onAtsComplete();
        }
      } else {
        throw new Error("Failed to analyze ATS compatibility.");
      }
    } catch (err) {
      console.error(err);
      alert(`ATS Analysis failed. The backend server is unreachable. Please ensure the backend is running at ${API}.`);
      setAnalysisResult({
        atsScore: 0,
        missingKeywords: [],
        suggestions: ["Upload failed. Please try again."]
      });
    } finally {
      setIsAnalyzing(false);
      setIsUploaded(true);
    }
  };

  const handleReset = () => {
    setIsUploaded(false);
    setFileName('');
    setAnalysisResult({
      atsScore: 82,
      missingKeywords: [],
      suggestions: []
    });
  };

  return (
    <div className="space-y-8">
      {/* PAGE TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">
            ATS Checker
          </h1>
          <p className="text-textSecondary text-sm mt-1">Optimize your resume for applicant tracking systems.</p>
        </div>
        {isUploaded && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 border border-gray-200 hover:border-primary/30 px-4 py-2 rounded-xl text-textSecondary hover:text-textPrimary text-sm font-semibold transition-all duration-200 bg-white hover:bg-gray-50 self-start sm:self-auto shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Scan Another Resume
          </button>
        )}
      </div>

      {isAnalyzing && (
        <div className="bg-white border border-[#E5E7EB] p-12 rounded-3xl flex flex-col items-center justify-center space-y-4 shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-textPrimary font-bold text-base">Analyzing "{fileName}"...</p>
          <p className="text-textSecondary text-sm">Parsing content structure and keywords...</p>
        </div>
      )}

      {!isUploaded && !isAnalyzing && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white border border-[#E5E7EB] p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-textPrimary">Target Job Role</h3>
            <p className="text-textSecondary text-xs">What role are you applying for? This helps us suggest accurate missing keywords.</p>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Frontend Developer, Data Scientist..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-textPrimary placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>
          <ResumeUploader onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

      {isUploaded && !isAnalyzing && (
        <div className="space-y-6 animate-fadeIn">
          {/* File summary bar */}
          <div className="bg-white border border-[#E5E7EB] px-6 py-4 rounded-3xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <FileText className="text-primary w-5 h-5" />
              <span className="text-textPrimary font-bold text-sm">{fileName}</span>
            </div>
            <span className="text-xs text-textSecondary">Scan Complete</span>
          </div>

          {/* SECTION 2: ATS Score Card */}
          <ATSScoreCard score={analysisResult.atsScore} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SECTION 3: Missing Keywords (Column Span 2) */}
            <div className="lg:col-span-2 bg-white border border-[#E5E7EB] p-6 rounded-3xl space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-textPrimary">Missing Keywords</h3>
              <p className="text-textSecondary text-xs leading-relaxed">
                We couldn't detect these critical industry terms in your resume. Consider incorporating them to improve match rates.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {analysisResult.missingKeywords.length > 0 ? (
                  analysisResult.missingKeywords.map((kw) => (
                    <KeywordBadge key={kw} keyword={kw} />
                  ))
                ) : (
                  <span className="text-textSecondary text-xs">No missing keywords detected! Excellent profile match.</span>
                )}
              </div>
            </div>

            {/* SECTION 4: Suggestions (Column Span 1) */}
            <div className="lg:col-span-1">
              <SuggestionCard suggestions={analysisResult.suggestions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
