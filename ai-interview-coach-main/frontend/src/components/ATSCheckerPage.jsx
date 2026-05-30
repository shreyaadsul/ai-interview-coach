import React, { useState } from 'react';
import ResumeUploader from './ResumeUploader';
import ATSScoreCard from './ATSScoreCard';
import KeywordBadge from './KeywordBadge';
import SuggestionCard from './SuggestionCard';
import { ArrowLeft, RefreshCw, FileText } from 'lucide-react';

export default function ATSCheckerPage() {
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState({
    atsScore: 82,
    missingKeywords: [],
    suggestions: []
  });

  const handleUploadSuccess = async (name, file) => {
    setFileName(name);
    setIsAnalyzing(true);
    
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("http://localhost:5000/api/ats-checker", {
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
      } else {
        throw new Error("Failed to analyze ATS compatibility.");
      }
    } catch (err) {
      console.error(err);
      alert("ATS Analysis failed. Please make sure the AI backend is running.");
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
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            ATS Checker
          </h1>
          <p className="text-gray-400 text-sm mt-1">Optimize your resume for applicant tracking systems.</p>
        </div>
        {isUploaded && (
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 border border-primary/40 hover:border-primary px-4 py-2 rounded-xl text-gray-300 hover:text-white text-sm font-semibold transition-all duration-300 bg-white/5 hover:bg-primary/10 self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Scan Another Resume
          </button>
        )}
      </div>

      {isAnalyzing && (
        <div className="bg-[#111827] border border-[#1F2937] p-12 rounded-2xl flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C3AED]" />
          <p className="text-white font-semibold text-base">Analyzing "{fileName}"...</p>
          <p className="text-gray-400 text-sm">Parsing content structure and keywords...</p>
        </div>
      )}

      {!isUploaded && !isAnalyzing && (
        <div className="max-w-2xl mx-auto">
          <ResumeUploader onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

      {isUploaded && !isAnalyzing && (
        <div className="space-y-6 animate-fadeIn">
          {/* File summary bar */}
          <div className="bg-[#111827] border border-[#1F2937] px-6 py-4 rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <FileText className="text-[#7C3AED] w-5 h-5" />
              <span className="text-white font-medium text-sm">{fileName}</span>
            </div>
            <span className="text-xs text-gray-400">Scan Complete</span>
          </div>

          {/* SECTION 2: ATS Score Card */}
          <ATSScoreCard score={analysisResult.atsScore} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SECTION 3: Missing Keywords (Column Span 2) */}
            <div className="lg:col-span-2 bg-[#111827] border border-[#1F2937] p-6 rounded-2xl space-y-4 shadow-xl">
              <h3 className="text-lg font-semibold text-white">Missing Keywords</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We couldn't detect these critical industry terms in your resume. Consider incorporating them to improve match rates.
              </p>
              <div className="flex flex-wrap gap-2.5 pt-2">
                {analysisResult.missingKeywords.map((kw) => (
                  <KeywordBadge key={kw} keyword={kw} />
                ))}
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
