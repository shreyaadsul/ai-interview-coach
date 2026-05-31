import React from 'react';
import { CheckSquare, AlertTriangle, Lightbulb } from 'lucide-react';

export default function ATSSuggestions({ resumeData }) {
  const missingKeywords = resumeData?.ats_missing_keywords || [];
  const atsScore = resumeData?.resume_score || 0;
  
  const suggestions = resumeData?.ats_suggestions?.length > 0
    ? resumeData.ats_suggestions
    : resumeData?.weaknesses?.length > 0 
      ? resumeData.weaknesses 
      : [];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
          <CheckSquare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">ATS Suggestions</h2>
          <p className="text-sm text-gray-400">Score: <span className="text-success font-semibold">{atsScore}/100</span></p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 text-orange-400">
          <AlertTriangle className="w-4 h-4" />
          <h3 className="text-sm font-medium">Missing Keywords</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {missingKeywords.length > 0 ? missingKeywords.map((kw, i) => {
            const displayKw = typeof kw === 'object' ? (kw.keyword || kw.title || kw.name || JSON.stringify(kw)) : kw;
            return (
              <span key={i} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-200">
                {displayKw}
              </span>
            );
          }) : (
            <span className="text-gray-500 text-sm">Upload your resume to see missing keywords.</span>
          )}
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
        <div className="flex items-center gap-2 mb-3 text-primary">
          <Lightbulb className="w-4 h-4" />
          <h3 className="text-sm font-medium">Actionable Suggestions</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-300">
          {suggestions.length > 0 ? suggestions.map((sug, idx) => {
            const text = typeof sug === 'object' ? (sug.suggestion || sug.description || sug.title || JSON.stringify(sug)) : sug;
            return (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span className="leading-tight">{text}</span>
              </li>
            );
          }) : (
            <li className="text-gray-500 text-sm">Scan your resume to receive actionable suggestions.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
