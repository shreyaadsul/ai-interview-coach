import React from 'react';
import { CheckSquare, AlertTriangle, Lightbulb } from 'lucide-react';

export default function ATSSuggestions() {
  const missingKeywords = [
    "Deep Learning", "Docker", "REST APIs", "AWS", "CI/CD"
  ];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
          <CheckSquare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">ATS Suggestions</h2>
          <p className="text-sm text-gray-400">Score: <span className="text-success font-semibold">82/100</span></p>
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
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            Add measurable project metrics (e.g., "improved efficiency by 20%")
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            Improve project descriptions with STAR method
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            Include more industry keywords from standard job descriptions
          </li>
        </ul>
      </div>
    </div>
  );
}
