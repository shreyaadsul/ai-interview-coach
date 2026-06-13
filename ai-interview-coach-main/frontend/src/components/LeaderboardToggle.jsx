import React from 'react';

export default function LeaderboardToggle({ activeTab = "Global", onToggle }) {
  return (
    <div className="flex bg-[#111827] border border-[#1F2937] p-1 rounded-xl items-center gap-1 shadow-inner select-none self-start sm:self-auto">
      <button
        onClick={() => onToggle("Global")}
        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
          activeTab === "Global"
            ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/25"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        Global
      </button>
      <button
        onClick={() => onToggle("Friends")}
        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
          activeTab === "Friends"
            ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/25"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        Friends
      </button>
    </div>
  );
}
