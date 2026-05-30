import React from 'react';

export default function KeywordBadge({ keyword }) {
  return (
    <span className="px-4 py-2 text-xs font-semibold rounded-full bg-[#111827] border border-[#1F2937] text-gray-300 hover:border-[#7C3AED]/30 transition-colors duration-200 cursor-default select-none">
      {keyword}
    </span>
  );
}
