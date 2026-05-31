import React from 'react';
import InterviewCard from './InterviewCard';
import PerformanceChart from './PerformanceChart';

export default function InterviewHistoryPage({ history, onViewReport }) {
  const interviewHistory = (history && history.length > 0) ? history.map(h => ({
    ...h,
    title: h.role ? `${h.role} Interview` : h.title
  })) : [];

  return (
    <div className="space-y-8">
      {/* PAGE TITLE */}
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Interview History
        </h1>
        <p className="text-gray-400 text-sm mt-1">Review your past scores, milestones, and details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-2">Your Interview Sessions</h3>
          <div className="flex flex-col gap-4">
            {interviewHistory.length > 0 ? interviewHistory.map((session) => (
              <InterviewCard 
                key={session.id}
                title={session.title}
                date={session.date}
                time={session.time}
                score={session.score}
                onViewReport={() => onViewReport(session)}
              />
            )) : (
              <div className="bg-[#111827] border border-[#1F2937] p-8 rounded-2xl flex flex-col items-center justify-center text-center">
                <p className="text-gray-400">You haven't taken any mock interviews yet.</p>
                <p className="text-sm text-gray-500 mt-2">Head over to the Mock Interview tab to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Performance Trend (Span 1) */}
        <div className="lg:col-span-1">
          <PerformanceChart data={interviewHistory} />
        </div>
      </div>
    </div>
  );
}
