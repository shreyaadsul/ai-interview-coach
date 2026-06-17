import React from 'react';

const transformSuggestion = (sug) => {
  if (!sug) return null;
  
  if (typeof sug === 'string') {
    return {
      title: "Improvement",
      icon: "💡",
      description: sug
    };
  }
  
  if (typeof sug === 'object') {
    if (sug.title && sug.description) {
      return {
        title: sug.title,
        icon: sug.icon || "💡",
        description: sug.description
      };
    }
    
    const category = sug.category || "general";
    const message = sug.message || sug.suggestion || sug.description || JSON.stringify(sug);
    
    const mapping = {
      formatting: { icon: "📄", title: "Formatting" },
      content: { icon: "💻", title: "Content" },
      layout: { icon: "📋", title: "Layout" },
      skills: { icon: "🚀", title: "Skills" },
      projects: { icon: "🛠", title: "Projects" },
      experience: { icon: "💼", title: "Experience" }
    };
    
    const normalizedCategory = category.toLowerCase().trim();
    const mapped = mapping[normalizedCategory] || { icon: "💡", title: category.charAt(0).toUpperCase() + category.slice(1) };
    
    return {
      title: mapped.title,
      icon: mapped.icon,
      description: message
    };
  }
  
  return {
    title: "Suggestion",
    icon: "💡",
    description: String(sug)
  };
};

export default function SuggestionCard({ suggestions = [] }) {
  return (
    <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl space-y-4 shadow-xl">
      <h3 className="text-lg font-semibold text-white">Suggestions</h3>
      <div className="space-y-4 divide-y divide-white/10">
        {suggestions.map((sug, index) => {
          const transformed = transformSuggestion(sug);
          if (!transformed) return null;
          return (
            <div key={index} className={index > 0 ? "pt-4 space-y-1" : "space-y-1"}>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="text-base select-none">{transformed.icon}</span>
                <span>{transformed.title}</span>
              </div>
              <p className="text-sm text-gray-300 pl-6 leading-relaxed">
                {transformed.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
