import React from 'react';

export default function ScoreBadge({ score }) {
  // Compute color scheme based on score
  let badgeStyles = "bg-red-500/10 text-red-500 border-red-500/20";
  
  if (score >= 80) {
    badgeStyles = "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20";
  } else if (score >= 70) {
    badgeStyles = "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20";
  } else if (score >= 60) {
    badgeStyles = "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20";
  }

  return (
    <span className={`px-3.5 py-1.5 rounded-lg border text-sm font-bold shadow-sm select-none ${badgeStyles}`}>
      {score}%
    </span>
  );
}
