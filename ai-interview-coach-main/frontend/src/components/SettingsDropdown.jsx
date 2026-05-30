import React from 'react';

export default function SettingsDropdown({ label, value, options = [], onChange }) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-[#0B1020]/60 border border-[#1F2937] hover:border-[#7C3AED]/40 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 rounded-xl text-white text-sm focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-[#111827] text-white">
              {option}
            </option>
          ))}
        </select>
        
        {/* Custom arrow decoration for premium styling */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
