import React from 'react';
import InterviewCard from './InterviewCard';
import PerformanceChart from './PerformanceChart';

export default function InterviewHistoryPage({ onViewReport }) {
  const interviewHistory = [
    {
      id: "ml-engineer",
      title: "ML Engineer Mock Interview",
      date: "May 29, 2025",
      time: "10:30 AM",
      score: 78
    },
    {
      id: "data-scientist",
      title: "Data Scientist Mock Interview",
      date: "May 25, 2025",
      time: "02:15 PM",
      score: 72
    },
    {
      id: "backend-developer",
      title: "Backend Developer Interview",
      date: "May 20, 2025",
      time: "11:00 AM",
      score: 65
    },
    {
      id: "aiml-internship",
      title: "AIML Internship Interview",
      date: "May 15, 2025",
      time: "04:30 PM",
      score: 80
    }
  ];

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
        {/* Left Column: Your Interview Sessions (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-2">Your Interview Sessions</h3>
          <div className="flex flex-col gap-4">
            {interviewHistory.map((session) => (
              <InterviewCard 
                key={session.id}
                title={session.title}
                date={session.date}
                time={session.time}
                score={session.score}
                onViewReport={() => onViewReport(session)}
              />
            ))}
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
