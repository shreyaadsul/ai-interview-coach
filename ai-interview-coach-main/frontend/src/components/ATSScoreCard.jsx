import React from 'react';

export default function ATSScoreCard({ score = 82 }) {
  // SVG circle calculations
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * score) / 100;

  return (
    <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow-xl">
      {/* Left Column: Title & Circular Progress Ring */}
      <div className="flex flex-col items-center gap-4">
        <h4 className="text-sm font-semibold text-gray-300 self-start sm:self-auto">ATS Score</h4>
        
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Progress Ring */}
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#1F2937"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Foreground Circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#22C55E"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          {/* Central Score Text */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white leading-none">{score}</span>
            <span className="text-xs text-gray-500 font-medium mt-0.5">/100</span>
          </div>
        </div>
      </div>

      {/* Right Column: Feedback Summary */}
      <div className="flex-1 text-center sm:text-left">
        <p className="text-gray-300 text-sm sm:text-base font-medium leading-relaxed">
          This resume is ATS-friendly, but there is still room for improvement.
        </p>
      </div>
    </div>
  );
}
