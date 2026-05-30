import React from 'react';

export default function LeaderboardRow({ rank, name, score, isCurrentUser = false }) {
  // Get initials for avatar circle
  const getInitials = (fullName) => {
    return fullName
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Avatar background colors based on rank or username
  const getAvatarBg = () => {
    if (isCurrentUser) return "bg-[#7C3AED] text-white";
    if (rank === 1) return "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30";
    if (rank === 2) return "bg-gray-300/20 text-gray-300 border border-gray-300/30";
    if (rank === 3) return "bg-amber-600/20 text-amber-500 border border-amber-600/30";
    return "bg-white/5 text-gray-400 border border-white/10";
  };

  return (
    <div 
      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 select-none
        ${isCurrentUser 
          ? "bg-[#7C3AED]/15 border border-[#7C3AED]/45 shadow-lg shadow-[#7C3AED]/5" 
          : "bg-[#111827] border border-[#1F2937]/80 hover:border-primary/20 hover:scale-[1.01] transform cursor-default"
        }
      `}
    >
      {/* Rank + Name Column */}
      <div className="flex items-center gap-4">
        {/* Rank Number */}
        <span className={`w-6 text-center text-sm font-bold ${isCurrentUser ? 'text-[#7C3AED]' : rank <= 3 ? 'text-white' : 'text-gray-500'}`}>
          {rank}
        </span>
        
        {/* Profile Avatar Circle */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-inner ${getAvatarBg()}`}>
          {getInitials(name)}
        </div>
        
        {/* Candidate Name */}
        <span className={`text-sm font-semibold ${isCurrentUser ? 'text-white font-bold' : 'text-gray-200'}`}>
          {name} {isCurrentUser && <span className="text-xs text-primary/80 font-normal ml-1">(You)</span>}
        </span>
      </div>

      {/* Score badge Column */}
      <span className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 shadow-sm">
        {score}%
      </span>
    </div>
  );
}
