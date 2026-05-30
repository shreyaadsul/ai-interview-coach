import React from 'react';
import LeaderboardRow from './LeaderboardRow';

export default function UserRankCard({ rank = 23, name = "Shreya", score = 78 }) {
  return (
    <div className="space-y-2 mt-4 pt-4 border-t border-[#1F2937]/80">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">Your Ranking</p>
      <LeaderboardRow 
        rank={rank} 
        name={name} 
        score={score} 
        isCurrentUser={true} 
      />
    </div>
  );
}
