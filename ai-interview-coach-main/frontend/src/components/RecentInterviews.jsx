import React from 'react';
import { History, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function RecentInterviews({ history }) {
  const defaultInterviews = [
    { title: "ML Engineer Mock Interview", score: 78, date: "2 days ago", color: "text-success", bg: "bg-success/10" },
    { title: "Data Scientist Mock Interview", score: 72, date: "1 week ago", color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Backend Developer Interview", score: 65, date: "2 weeks ago", color: "text-orange-400", bg: "bg-orange-400/10" },
  ];

  const interviews = (history && history.length > 0) ? history.slice(0, 3).map(h => ({
    title: h.role ? `${h.role} Mock Interview` : h.title,
    score: h.score,
    date: h.date,
    color: h.score >= 80 ? "text-success" : h.score >= 60 ? "text-warning" : "text-danger",
    bg: h.score >= 80 ? "bg-success/10" : h.score >= 60 ? "bg-warning/10" : "bg-danger/10"
  })) : defaultInterviews;

  return (
    <div className="glass-card p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
            <History className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">Recent Interviews</h2>
        </div>
      </div>

      <div className="flex-grow space-y-4">
        {interviews.map((interview, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5">
            <div>
              <h3 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{interview.title}</h3>
              <p className="text-xs text-gray-500">{interview.date}</p>
            </div>
            <div className={cn("px-3 py-1 rounded-lg text-xs font-bold", interview.bg, interview.color)}>
              {interview.score}%
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors duration-300 flex items-center justify-center gap-2 group border border-white/5">
        View All History
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
