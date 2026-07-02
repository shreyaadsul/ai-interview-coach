import React from 'react';

export default function ATSScoreCard({ score = 0 }) {
  // SVG circle calculations
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * score) / 100;

  const getScoreColor = (s) => {
    if (s >= 80) return "#22C55E";
    if (s >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const getScoreFeedback = (s) => {
    if (s >= 90) return "Excellent resume match! Your profile is extremely compatible with applicant tracking systems.";
    if (s >= 75) return "Good compatibility. A few simple adjustments will make your resume highly optimized.";
    if (s >= 60) return "Fair compatibility. Consider adding missing keywords and polishing layout structures.";
    return "Action required. Your resume needs keyword optimization to successfully pass automatic screening filters.";
  };

  return (
    <div className="bg-white border border-[#E5E7EB] p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-6 shadow-sm">
      {/* Left Column: Title & Circular Progress Ring */}
      <div className="flex flex-col items-center gap-4 flex-shrink-0">
        <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider self-start sm:self-auto">ATS Match Score</h4>
        
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Progress Ring */}
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#F3F4F6"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Foreground Circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke={getScoreColor(score)}
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
            <span className="text-2xl font-extrabold text-textPrimary leading-none">{score}</span>
            <span className="text-[10px] text-textSecondary font-bold uppercase mt-0.5">/100</span>
          </div>
        </div>
      </div>
 
      {/* Right Column: Feedback Summary */}
      <div className="flex-grow text-center sm:text-left">
        <p className="text-textSecondary text-sm sm:text-base font-semibold leading-relaxed">
          {getScoreFeedback(score)}
        </p>
      </div>
    </div>
  );
}
