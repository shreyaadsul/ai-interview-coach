import React from 'react';

export default function KeywordBadge({ keyword }) {
  const displayKeyword = typeof keyword === 'object' ? (keyword.keyword || keyword.title || keyword.name || JSON.stringify(keyword)) : keyword;
  return (
    <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-orange-50 border border-orange-100 text-orange-700 select-none">
      {displayKeyword}
    </span>
  );
}
