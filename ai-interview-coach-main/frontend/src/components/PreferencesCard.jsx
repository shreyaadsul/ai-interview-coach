import React from 'react';
import SettingsDropdown from './SettingsDropdown';

export default function PreferencesCard({ preferences, onChange }) {
  const roleOptions = [
    "Machine Learning Engineer", 
    "Data Scientist", 
    "Backend Developer", 
    "AI Engineer", 
    "Python Developer", 
    "Frontend Developer"
  ];

  const difficultyOptions = ["Easy", "Medium", "Hard", "Expert"];

  const typeOptions = ["All", "HR", "Technical", "Project Based", "Behavioral", "Coding"];

  return (
    <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl space-y-5 shadow-xl">
      <h3 className="text-lg font-semibold text-white">Preferences</h3>
      
      <div className="grid grid-cols-1 gap-5">
        <SettingsDropdown
          label="Preferred Role"
          value={preferences.role}
          options={roleOptions}
          onChange={(val) => onChange('role', val)}
        />
        <SettingsDropdown
          label="Difficulty Level"
          value={preferences.difficulty}
          options={difficultyOptions}
          onChange={(val) => onChange('difficulty', val)}
        />
        <SettingsDropdown
          label="Question Type"
          value={preferences.questionType}
          options={typeOptions}
          onChange={(val) => onChange('questionType', val)}
        />
      </div>
    </div>
  );
}
