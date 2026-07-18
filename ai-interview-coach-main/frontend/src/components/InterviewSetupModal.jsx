import React, { useState } from 'react';
import { X, Play, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL;

export default function InterviewSetupModal({ isOpen, onClose, onStart, resumeData }) {
  const [targetRole, setTargetRole] = useState(resumeData?.suggested_roles?.[0] || 'AI Engineer');
  const [interviewType, setInterviewType] = useState('Mixed');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleStart = async () => {
    setIsGenerating(true);
    const config = {
      target_role: targetRole,
      interview_type: interviewType,
      difficulty,
      questions_count: 'Dynamic (10 Mins)'
    };

    try {
      const response = await fetch(`${API}/api/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_data: resumeData, ...config }),
      });
      
      if (response.ok) {
        const generatedData = await response.json();
        const firstQuestion = generatedData.question || "Let's start by having you introduce yourself and tell me about your background.";
        onStart(config, [firstQuestion]);
      } else {
        console.error("Failed to generate personalized questions");
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to generate personalized questions. The backend server is unreachable. Please verify it is running at ${API}.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.08)] w-full max-w-xl overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] bg-gray-50/50">
            <h2 className="text-lg font-bold text-textPrimary">Configure Interview</h2>
            <button onClick={onClose} disabled={isGenerating} className="p-2 text-textSecondary hover:text-textPrimary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            {/* Target Role */}
            <div className="space-y-2 flex flex-col">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-wider">Target Role</label>
              <div className="relative">
                <select 
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 hover:border-primary/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl text-textPrimary text-sm focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="AI Engineer" className="bg-white text-textPrimary">AI Engineer</option>
                  <option value="Machine Learning Engineer" className="bg-white text-textPrimary">Machine Learning Engineer</option>
                  <option value="Data Scientist" className="bg-white text-textPrimary">Data Scientist</option>
                  <option value="Python Developer" className="bg-white text-textPrimary">Python Developer</option>
                  <option value="Backend Developer" className="bg-white text-textPrimary">Backend Developer</option>
                  <option value="Frontend Developer" className="bg-white text-textPrimary">Frontend Developer</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-textSecondary">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Interview Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-wider">Interview Type</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {['HR', 'Technical', 'Project Based', 'Mixed'].map(type => {
                  const isSelected = interviewType === type;
                  return (
                    <label key={type} className={`cursor-pointer border rounded-xl py-2.5 px-3 text-center text-xs font-bold transition-all duration-200 ${isSelected ? 'bg-primary/5 border-primary text-primary font-extrabold shadow-sm' : 'border-gray-200 text-textSecondary hover:border-gray-300 hover:text-textPrimary hover:bg-gray-50'}`}>
                      <input type="radio" className="hidden" name="type" value={type} checked={isSelected} onChange={() => setInterviewType(type)} />
                      {type}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-wider">Difficulty</label>
              <div className="grid grid-cols-3 gap-3">
                {['Beginner', 'Intermediate', 'Advanced'].map(diff => {
                  const isSelected = difficulty === diff;
                  return (
                    <label key={diff} className={`cursor-pointer border rounded-xl py-2.5 px-3 text-center text-xs font-bold transition-all duration-200 ${isSelected ? 'bg-primary/5 border-primary text-primary font-extrabold shadow-sm' : 'border-gray-200 text-textSecondary hover:border-gray-300 hover:text-textPrimary hover:bg-gray-50'}`}>
                      <input type="radio" className="hidden" name="diff" value={diff} checked={isSelected} onChange={() => setDifficulty(diff)} />
                      {diff}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-wider">Duration</label>
              <div className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-textPrimary text-xs font-bold flex items-center">
                Estimated 15-20 Minutes
              </div>
              <p className="text-xs font-semibold text-primary mt-1.5">Structured 6-Stage Interview Process (20 Questions)</p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-[#E5E7EB] bg-gray-50/50 flex justify-end gap-4">
            <button onClick={onClose} disabled={isGenerating} className="px-5 py-2.5 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-textSecondary hover:text-textPrimary font-bold text-xs rounded-xl shadow-sm transition-all duration-200">
              Cancel
            </button>
            <button onClick={handleStart} disabled={isGenerating} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-[#4F46E5]/95 text-white font-bold text-xs transition-all shadow-sm hover:translate-y-[-1px] disabled:opacity-50">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Play className="w-4 h-4 text-white fill-white" />}
              {isGenerating ? "Generating..." : "Start Interview"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
