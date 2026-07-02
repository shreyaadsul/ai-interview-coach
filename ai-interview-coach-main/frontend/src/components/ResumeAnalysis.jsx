import React from 'react';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResumeAnalysis({ resumeData }) {
  const isResumeUploaded = resumeData && resumeData.fileName !== "No Resume Uploaded" && resumeData.resume_score > 0;

  if (!isResumeUploaded) {
    return (
      <div className="glass p-6 h-full flex flex-col items-center justify-center text-center py-10 min-h-[300px]">
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-textSecondary mb-3">
          <FileText className="w-6 h-6 text-textSecondary" />
        </div>
        <h3 className="font-bold text-textPrimary text-base mb-1">No resume analyzed yet</h3>
        <p className="text-xs text-textSecondary max-w-[220px]">Upload your resume in the Resume Analysis tab to view skills and strengths.</p>
      </div>
    );
  }

  const skills = resumeData?.skills?.slice(0, 9) || [];
  const strengths = resumeData?.strengths?.slice(0, 3) || [];
  const experience = resumeData?.experience_level || "Not specified";

  return (
    <div className="glass p-6 h-full flex flex-col bg-white border border-[#E5E7EB] rounded-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/5 text-primary">
          <FileText className="w-5 h-5" />
        </div>
        <h2 className="text-base font-bold text-textPrimary">Resume Analysis</h2>
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2.5">Skills Detected</h3>
        <div className="flex flex-wrap gap-1.5">
          {skills.map(skill => (
            <span key={skill} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-50 border border-gray-200 text-textSecondary transition-colors">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6 flex-grow">
        <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2.5">Top Strengths</h3>
        <ul className="space-y-2">
          {strengths.map((strength, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-textSecondary">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span className="leading-tight">{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">Experience Level</h3>
        <p className="text-sm font-semibold text-textPrimary">{experience}</p>
      </div>
    </div>
  );
}
