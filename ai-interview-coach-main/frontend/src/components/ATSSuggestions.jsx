import React from 'react';
import { CheckSquare, AlertTriangle, Lightbulb } from 'lucide-react';

const transformSuggestion = (sug) => {
  if (!sug) return null;
  
  if (typeof sug === 'string') {
    return {
      title: "Improvement",
      icon: "💡",
      description: sug
    };
  }
  
  if (typeof sug === 'object') {
    if (sug.title && sug.description) {
      return {
        title: sug.title,
        icon: sug.icon || "💡",
        description: sug.description
      };
    }
    
    const category = sug.category || "general";
    const message = sug.message || sug.suggestion || sug.description || JSON.stringify(sug);
    
    const mapping = {
      formatting: { icon: "📄", title: "Formatting" },
      content: { icon: "💻", title: "Content" },
      layout: { icon: "📋", title: "Layout" },
      skills: { icon: "🚀", title: "Skills" },
      projects: { icon: "🛠", title: "Projects" },
      experience: { icon: "💼", title: "Experience" }
    };
    
    const normalizedCategory = category.toLowerCase().trim();
    const mapped = mapping[normalizedCategory] || { icon: "💡", title: category.charAt(0).toUpperCase() + category.slice(1) };
    
    return {
      title: mapped.title,
      icon: mapped.icon,
      description: message
    };
  }
  
  return {
    title: "Suggestion",
    icon: "💡",
    description: String(sug)
  };
};

export default function ATSSuggestions({ resumeData }) {
  const isResumeUploaded = resumeData && resumeData.fileName !== "No Resume Uploaded" && resumeData.resume_score > 0;

  if (!isResumeUploaded) {
    return (
      <div className="glass p-6 h-full flex flex-col items-center justify-center text-center py-10 min-h-[300px] bg-white border border-[#E5E7EB] rounded-3xl">
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-textSecondary mb-3">
          <CheckSquare className="w-6 h-6 text-textSecondary" />
        </div>
        <h3 className="font-bold text-textPrimary text-base mb-1">No resume analyzed yet</h3>
        <p className="text-xs text-textSecondary max-w-[220px]">Upload your resume to see ATS suggestions and missing keywords.</p>
      </div>
    );
  }

  const missingKeywords = resumeData?.ats_missing_keywords || [];
  const atsScore = resumeData?.resume_score || 0;
  
  const suggestions = resumeData?.ats_suggestions?.length > 0
    ? resumeData.ats_suggestions
    : resumeData?.weaknesses?.length > 0 
      ? resumeData.weaknesses 
      : [];

  return (
    <div className="glass p-6 bg-white border border-[#E5E7EB] rounded-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
          <CheckSquare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-textPrimary">ATS Suggestions</h2>
          <p className="text-xs text-textSecondary">Overall Resume Score: <span className="text-success font-bold">{atsScore}/100</span></p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 text-amber-600">
          <AlertTriangle className="w-4 h-4" />
          <h3 className="text-xs font-semibold uppercase tracking-wider">Missing Keywords</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {missingKeywords.length > 0 ? missingKeywords.map((kw, i) => {
            const displayKw = typeof kw === 'object' ? (kw.keyword || kw.title || kw.name || JSON.stringify(kw)) : kw;
            return (
              <span key={i} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-orange-50 text-orange-700 border border-orange-100">
                {displayKw}
              </span>
            );
          }) : (
            <span className="text-textSecondary text-xs">No missing keywords detected. Great job!</span>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="flex items-center gap-2 mb-3 text-primary">
          <Lightbulb className="w-4 h-4" />
          <h3 className="text-xs font-semibold uppercase tracking-wider">Actionable Suggestions</h3>
        </div>
        <div className="space-y-4 divide-y divide-gray-200">
          {suggestions.length > 0 ? suggestions.map((sug, idx) => {
            const transformed = transformSuggestion(sug);
            if (!transformed) return null;
            return (
              <div key={idx} className={idx > 0 ? "pt-3 space-y-1" : "space-y-1"}>
                <div className="flex items-center gap-2 text-sm font-bold text-textPrimary">
                  <span className="text-base select-none">{transformed.icon}</span>
                  <span>{transformed.title}</span>
                </div>
                <p className="text-xs text-textSecondary pl-6 leading-relaxed">
                  {transformed.description}
                </p>
              </div>
            );
          }) : (
            <p className="text-textSecondary text-xs">No specific suggestions generated.</p>
          )}
        </div>
      </div>
    </div>
  );
}
