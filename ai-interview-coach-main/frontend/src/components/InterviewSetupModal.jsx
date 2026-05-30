import React, { useState } from 'react';
import { X, Play, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      questions_count: 'Dynamic (30 Mins)'
    };

    try {
      const response = await fetch("http://localhost:5000/api/generate-questions", {
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
    } finally {
      setIsGenerating(false);
    }
  };

  const estimatedDuration = 30;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-navy-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h2 className="text-xl font-bold text-white">Configure Interview</h2>
            <button onClick={onClose} disabled={isGenerating} className="p-2 text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Target Role */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Target Role</label>
              <select 
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
              >
                <option value="AI Engineer">AI Engineer</option>
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Python Developer">Python Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
              </select>
            </div>

            {/* Interview Type */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Interview Type</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {['HR', 'Technical', 'Project Based', 'Mixed'].map(type => (
                  <label key={type} className={`cursor-pointer border rounded-xl py-2 px-3 text-center text-sm transition-all duration-300 ${interviewType === type ? 'bg-primary/20 border-primary text-primary font-semibold' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>
                    <input type="radio" className="hidden" name="type" value={type} checked={interviewType === type} onChange={() => setInterviewType(type)} />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Difficulty</label>
              <div className="grid grid-cols-3 gap-3">
                {['Beginner', 'Intermediate', 'Advanced'].map(diff => (
                  <label key={diff} className={`cursor-pointer border rounded-xl py-2 px-3 text-center text-sm transition-all duration-300 ${difficulty === diff ? 'bg-primary/20 border-primary text-primary font-semibold' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>
                    <input type="radio" className="hidden" name="diff" value={diff} checked={difficulty === diff} onChange={() => setDifficulty(diff)} />
                    {diff}
                  </label>
                ))}
              </div>
            </div>

            {/* Estimated Duration */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Duration</label>
              <div className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 text-white font-medium">
                Strict 30-Minute Timer
              </div>
              <p className="text-xs text-primary mt-2">Questions will dynamically generate based on your responses.</p>
            </div>
          </div>

          <div className="p-6 border-t border-white/5 bg-navy-900/50 flex justify-end gap-4">
            <button onClick={onClose} disabled={isGenerating} className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white font-medium transition-colors">
              Cancel
            </button>
            <button onClick={handleStart} disabled={isGenerating} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50">
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              {isGenerating ? "Generating..." : "Start Interview"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
