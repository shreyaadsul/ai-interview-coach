import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FileText, Upload, CheckCircle2, User, GraduationCap, Briefcase, FolderGit2 } from 'lucide-react';

export default function ResumeAnalysisPage({ resumeData, onAnalysisSuccess }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorToast, setErrorToast] = useState("");
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("Please upload a PDF file only.");
      return;
    }

    setIsAnalyzing(true);
    const userProfileStr = localStorage.getItem('userProfile');
    const userProfile = userProfileStr ? JSON.parse(userProfileStr) : null;
    const userId = userProfile?.email || "";

    const formData = new FormData();
    formData.append("resume", file);
    if (userId) {
      formData.append("user_id", userId);
    }

    try {
      const response = await axios.post("http://localhost:5000/api/analyze-resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data && !response.data.error) {
        onAnalysisSuccess({
          ...response.data,
          fileName: file.name,
          uploadedDate: `Uploaded on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        });
      } else {
        throw new Error(response.data.error || "Analysis failed");
      }
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      if (status === 502 || status === 500) {
        showToast("AI service temporarily unavailable.");
      } else {
        showToast("Resume analysis failed. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input
      }
    }
  };

  const showToast = (msg) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(""), 4000);
  };

  // Score circular progress bar variables
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const score = resumeData.resume_score || 0;
  const strokeDashoffset = circumference - (circumference * score) / 100;

  const getScoreColor = (s) => {
    if (s >= 90) return "#22C55E"; // Green
    if (s >= 75) return "#7C3AED"; // Purple
    if (s >= 60) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  };

  const isResumeUploaded = resumeData && resumeData.fileName !== "No Resume Uploaded" && resumeData.resume_score > 0;

  const scoreColor = getScoreColor(score);

  return (
    <div className="space-y-8 relative">
      
      {/* Toast Error Alert */}
      {errorToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#EF4444] text-white px-5 py-3 rounded-xl shadow-md font-semibold text-sm animate-bounce">
          ⚠️ {errorToast}
        </div>
      )}

      {/* Analyzing Spinner Screen overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-white font-semibold text-lg">Analyzing Resume...</p>
          <p className="text-gray-300 text-sm">Extracting text and generating AI evaluation metrics...</p>
        </div>
      )}

      {/* Hidden file input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">
            Resume Analysis
          </h1>
          <p className="text-textSecondary text-sm mt-1">Detailed evaluation and parsed insights from your CV</p>
        </div>
        {isResumeUploaded && (
          <button 
            onClick={handleUploadClick}
            className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm text-sm font-bold self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            Upload New Resume
          </button>
        )}
      </div>

      {!isResumeUploaded ? (
        /* Empty State / Upload Box for New Users */
        <div className="glass p-12 bg-white border border-[#E5E7EB] rounded-3xl flex flex-col items-center justify-center text-center max-w-2xl mx-auto min-h-[400px] mt-10">
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-3xl text-primary mb-6">
            <Upload className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-textPrimary mb-2">Upload your resume to begin</h2>
          <p className="text-sm text-textSecondary max-w-md mb-8 leading-relaxed">
            Our AI will parse your CV, extract key technical credentials, score your profile against market standards, and recommend interview paths.
          </p>
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white px-8 py-3.5 rounded-xl transition-all duration-200 shadow-sm text-sm font-bold"
          >
            <FileText className="w-4 h-4" />
            Select Resume PDF
          </button>
          <span className="text-xs text-textSecondary mt-3">Supports PDF format up to 5MB</span>
        </div>
      ) : (
        /* Detailed Resume Analysis Dashboard */
        <>
          {/* SECTION 1: Resume File Card */}
          <div className="glass p-5 bg-white border border-[#E5E7EB] rounded-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-textPrimary font-bold text-base">{resumeData.fileName}</h2>
                <p className="text-textSecondary text-xs mt-0.5">{resumeData.uploadedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-success bg-success/10 border border-success/20 px-3.5 py-1.5 rounded-xl text-xs font-bold self-start md:self-auto">
              <CheckCircle2 className="w-4 h-4" />
              Resume Parsed Successfully
            </div>
          </div>

          {/* SECTION 2: Extracted Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Name */}
            <div className="glass p-5 bg-white border border-[#E5E7EB] rounded-3xl flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-100">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-textSecondary font-bold uppercase tracking-wider">Name</p>
                <p className="text-textPrimary font-bold text-base mt-0.5 truncate max-w-[150px]">{resumeData.name}</p>
              </div>
            </div>

            {/* Card 2: Education */}
            <div className="glass p-5 bg-white border border-[#E5E7EB] rounded-3xl flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-100">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-textSecondary font-bold uppercase tracking-wider">Education</p>
                <p className="text-textPrimary font-bold text-xs mt-0.5 leading-snug line-clamp-2 max-w-[150px]">{resumeData.education}</p>
              </div>
            </div>

            {/* Card 3: Experience */}
            <div className="glass p-5 bg-white border border-[#E5E7EB] rounded-3xl flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-100">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-textSecondary font-bold uppercase tracking-wider">Experience</p>
                <p className="text-textPrimary font-bold text-base mt-0.5 truncate max-w-[150px]">{resumeData.experience_level}</p>
              </div>
            </div>

            {/* Card 4: Total Projects */}
            <div className="glass p-5 bg-white border border-[#E5E7EB] rounded-3xl flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-100">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-textSecondary font-bold uppercase tracking-wider">Total Projects</p>
                <p className="text-textPrimary font-bold text-base mt-0.5 truncate max-w-[150px]">{resumeData.projects_count}</p>
              </div>
            </div>
          </div>

          {/* SECTION 3: Skills Detected */}
          <div className="glass p-6 bg-white border border-[#E5E7EB] rounded-3xl">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-4">Skills Detected</h3>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills && resumeData.skills.map(skill => (
                <span 
                  key={skill} 
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-primary/5 border border-primary/20 text-primary transition-colors cursor-default animate-fadeIn"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* SECTION 4 & 5: Resume Summary & Suggested Roles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Section 4: Resume Summary */}
            <div className="glass p-6 bg-white border border-[#E5E7EB] rounded-3xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-4">Resume Summary</h3>
                <p className="text-textSecondary text-sm leading-relaxed">
                  {resumeData.summary}
                </p>
              </div>
            </div>

            {/* Section 5: Suggested Roles */}
            <div className="glass p-6 bg-white border border-[#E5E7EB] rounded-3xl">
              <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-4">Suggested Roles</h3>
              <div className="flex flex-col gap-2">
                {resumeData.suggested_roles && resumeData.suggested_roles.map(role => (
                  <div 
                    key={role} 
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary/20 transition-all duration-200"
                  >
                    <span className="text-sm font-bold text-textPrimary">{role}</span>
                    <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md font-bold">
                      Suggested
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NEW SECTIONS below Suggested Roles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Section 6: Resume Score Card */}
            <div className="glass p-6 bg-white border border-[#E5E7EB] rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
              <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider self-start">Resume Score</h3>
              
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* SVG Progress Circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    stroke="#F3F4F6"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    stroke={scoreColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold text-textPrimary">{score}</span>
                  <span className="text-[10px] text-textSecondary font-bold uppercase mt-0.5">/100</span>
                </div>
              </div>
            </div>

            {/* Section 7: Strengths Card */}
            <div className="glass p-6 bg-white border border-[#E5E7EB] rounded-3xl space-y-3">
              <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider">Strengths</h3>
              <ul className="space-y-2">
                {resumeData.strengths && resumeData.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-textSecondary">
                    <span className="text-[#22C55E] font-bold text-base select-none mt-0.5">•</span>
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 8: Areas To Improve Card */}
            <div className="glass p-6 bg-white border border-[#E5E7EB] rounded-3xl space-y-3">
              <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider">Areas To Improve</h3>
              <ul className="space-y-2">
                {resumeData.weaknesses && resumeData.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-textSecondary">
                    <span className="text-[#EF4444] font-bold text-base select-none mt-0.5">•</span>
                    <span className="leading-relaxed">{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
