import React from 'react';

export default function EvaluationMetric({ title, score, stars }) {
  const totalStars = 5;
  const filledStarsCount = Math.min(Math.max(0, stars), totalStars);
  const emptyStarsCount = totalStars - filledStarsCount;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-primary/20 transition-all duration-300 gap-2">
      <span className="text-sm font-semibold text-gray-300">{title}</span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5 text-lg select-none">
          <span className="text-yellow-400">
            {"★".repeat(filledStarsCount)}
          </span>
          <span className="text-gray-600">
            {"☆".repeat(emptyStarsCount)}
          </span>
        </div>
        <span className="text-sm font-bold text-white bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
          {score}/10
        </span>
      </div>
    </div>
  );
}
