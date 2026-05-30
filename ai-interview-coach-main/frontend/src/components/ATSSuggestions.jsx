import React from 'react';
import { CheckSquare, AlertTriangle, Lightbulb } from 'lucide-react';

export default function ATSSuggestions({ resumeData }) {
  const missingKeywords = [
    "Deep Learning", "Docker", "REST APIs", "AWS", "CI/CD"
  ];
  
  const atsScore = resumeData?.resume_score || 82;
  const suggestions = resumeData?.weaknesses?.length > 0 
    ? resumeData.weaknesses 
    : [
        "Add measurable project metrics (e.g., 'improved efficiency by 20%')",
        "Improve project descriptions with STAR method",
        "Include more industry keywords from standard job descriptions"
      ];

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
          {missingKeywords.map(kw => (
            <span key={kw} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-200">
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
        <div className="flex items-center gap-2 mb-3 text-primary">
          <Lightbulb className="w-4 h-4" />
          <h3 className="text-sm font-medium">Actionable Suggestions</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-300">
          {suggestions.map((sug, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span className="leading-tight">{sug}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
