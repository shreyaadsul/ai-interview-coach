import React from 'react';
import { History, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function RecentInterviews({ history, onViewAll }) {
  const hasInterviews = history && history.length > 0;
  
  const interviews = hasInterviews ? history.slice(0, 3).map(h => ({
    title: h.role ? `${h.role} Mock Interview` : h.title,
    score: h.score,
    date: h.date,
    color: h.score >= 80 ? "text-success" : h.score >= 60 ? "text-warning" : "text-danger",
    bg: h.score >= 80 ? "bg-success/10" : h.score >= 60 ? "bg-warning/10" : "bg-danger/10"
  })) : [];

  return (
    <div className="glass p-6 flex flex-col h-full bg-white border border-[#E5E7EB] rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-secondary/5 text-secondary">
            <History className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-textPrimary">Recent Interviews</h2>
        </div>
      </div>

      <div className="flex-grow space-y-3">
        {hasInterviews ? (
          interviews.map((interview, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-textPrimary group-hover:text-primary transition-colors">{interview.title}</h3>
                <p className="text-xs text-textSecondary">{interview.date}</p>
              </div>
              <div className={cn("px-2.5 py-0.5 rounded-lg text-xs font-bold", interview.bg, interview.color)}>
                {interview.score}%
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-textSecondary text-xs">No interviews completed.</p>
          </div>
        )}
      </div>

      <button 
        onClick={onViewAll}
        className="w-full mt-5 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-textSecondary hover:text-textPrimary text-sm font-semibold transition-all flex items-center justify-center gap-2 group border border-gray-200"
      >
        View All History
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
