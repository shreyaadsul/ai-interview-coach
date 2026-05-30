import React from 'react';

export default function SuggestionCard({ suggestions = [] }) {
  return (
    <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl space-y-4 shadow-xl">
      <h3 className="text-lg font-semibold text-white">Suggestions</h3>
      <ul className="space-y-3.5">
        {suggestions.map((suggestion, index) => {
          const text = typeof suggestion === 'object' ? (suggestion.suggestion || suggestion.description || suggestion.title || JSON.stringify(suggestion)) : suggestion;
          return (
            <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
              <span className="text-[#7C3AED] font-bold text-base select-none mt-0.5">•</span>
              <span className="leading-relaxed">{text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
