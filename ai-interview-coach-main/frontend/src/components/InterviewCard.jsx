import React from 'react';
import { Video } from 'lucide-react';
import ScoreBadge from './ScoreBadge';

export default function InterviewCard({ title, date, score, time = "10:30 AM", onViewReport }) {
  return (
    <div className="bg-white border border-[#E5E7EB] p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 hover:border-primary/20 shadow-sm">
      {/* Left + Center content */}
      <div className="flex items-center gap-4">
        {/* Left: Video Icon */}
        <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          <Video className="w-5 h-5" />
        </div>
        
        {/* Center: Interview Details */}
        <div>
          <h4 className="text-textPrimary font-bold text-base leading-snug">{title}</h4>
          <p className="text-textSecondary text-xs mt-1">
            {date} • {time}
          </p>
        </div>
      </div>

      {/* Right: Score + Button */}
      <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end">
        <ScoreBadge score={score} />
        
        <button
          onClick={onViewReport}
          className="px-4 py-2 border border-gray-200 hover:border-primary/30 text-xs font-bold rounded-xl bg-white hover:bg-gray-50 text-textSecondary hover:text-textPrimary transition-all duration-200 shadow-sm"
        >
          View Report
        </button>
      </div>
    </div>
  );
}
