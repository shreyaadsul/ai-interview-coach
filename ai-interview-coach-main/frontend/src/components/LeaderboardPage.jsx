import React, { useState } from 'react';
import LeaderboardToggle from './LeaderboardToggle';
import LeaderboardRow from './LeaderboardRow';
import UserRankCard from './UserRankCard';
import MotivationCard from './MotivationCard';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("Global");

  // Leaderboard data
  const globalLeaderboard = [
    { rank: 1, name: "Arjun Sharma", score: 92 },
    { rank: 2, name: "Priya Singh", score: 89 },
    { rank: 3, name: "Rohan Mehta", score: 87 },
    { rank: 4, name: "Sneha Verma", score: 85 },
    { rank: 5, name: "Karan Patel", score: 84 }
  ];

  const friendsLeaderboard = [
    { rank: 1, name: "Priya Singh", score: 89 },
    { rank: 2, name: "Rohan Mehta", score: 87 },
    { rank: 3, name: "Karan Patel", score: 84 }
  ];

  const currentUser = {
    name: "Shreya",
    score: 78
  };

  // Determine user rank based on active filter
  const userRank = activeTab === "Global" ? 23 : 4;

  const currentDataset = activeTab === "Global" ? globalLeaderboard : friendsLeaderboard;

  // Auto-sort list by score descending (it's already sorted, but let's make it robust)
  const sortedList = [...currentDataset].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-8">
      {/* PAGE TITLE & TOGGLE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Leaderboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">See how you rank against peers and connections.</p>
        </div>
        <LeaderboardToggle activeTab={activeTab} onToggle={setActiveTab} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ranking List (Span 2) */}
        <div className="lg:col-span-2 bg-[#111827] border border-[#1F2937] p-6 rounded-2xl flex flex-col justify-between shadow-xl min-h-[450px]">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-2">{activeTab} Standings</h3>
            
            <div className="flex flex-col gap-3">
              {sortedList.map((row) => (
                <LeaderboardRow 
                  key={row.name}
                  rank={row.rank}
                  name={row.name}
                  score={row.score}
                />
              ))}
            </div>
          </div>

          {/* CURRENT USER ROW (At the bottom) */}
          <UserRankCard 
            rank={userRank} 
            name={currentUser.name} 
            score={currentUser.score} 
          />
        </div>

        {/* Right Column: Motivation Card (Span 1) */}
        <div className="lg:col-span-1">
          <MotivationCard />
        </div>
      </div>
    </div>
  );
}
