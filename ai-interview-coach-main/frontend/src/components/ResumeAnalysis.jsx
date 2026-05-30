import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

export default function ResumeAnalysis() {
  const skills = [
    "Python", "Machine Learning", "Flask", "SQL", 
    "Pandas", "NumPy", "Scikit-Learn", "Git", "Automation"
  ];

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <FileText className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-white">Resume Analysis</h2>
      </div>

      <div className="mb-6">
        <h3 className="text-sm text-gray-400 mb-3">Skills Detected</h3>
        <div className="flex flex-wrap gap-2">
          {skills.map(skill => (
            <span key={skill} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 transition-colors cursor-default">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6 flex-grow">
        <h3 className="text-sm text-gray-400 mb-3">Top Strengths</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm text-gray-200">
            <CheckCircle2 className="w-4 h-4 text-success" />
            Backend Development
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-200">
            <CheckCircle2 className="w-4 h-4 text-success" />
            Automation & Integrations
          </li>
        </ul>
      </div>

      <div className="pt-4 border-t border-white/10">
        <h3 className="text-xs text-gray-400 mb-1">Experience Level</h3>
        <p className="text-sm font-semibold text-white">Final Year AIML Student</p>
      </div>
    </div>
  );
}
