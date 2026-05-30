import React from 'react';
import { Video } from 'lucide-react';
import ScoreBadge from './ScoreBadge';

export default function InterviewCard({ title, date, score, time = "10:30 AM", onViewReport }) {
  return (
    <div className="bg-[#111827] border border-[#1F2937] p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 hover:border-primary/20 shadow-md">
      {/* Left + Center content */}
      <div className="flex items-center gap-4">
        {/* Left: Video Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
          <Video className="w-5 h-5" />
        </div>
        
        {/* Center: Interview Details */}
        <div>
          <h4 className="text-white font-semibold text-base leading-snug">{title}</h4>
          <p className="text-gray-400 text-xs mt-1">
            {date} • {time}
          </p>
        </div>
      </div>

      {/* Right: Score + Button */}
      <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end">
        <ScoreBadge score={score} />
        
        <button
          onClick={onViewReport}
          className="px-4 py-2 border border-primary/40 hover:border-primary text-xs font-semibold rounded-xl bg-white/5 hover:bg-primary/10 text-gray-300 hover:text-white transition-all duration-300"
        >
          View Report
        </button>
      </div>
    </div>
  );
}
