import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import KPICards from '../components/KPICards';
import ResumeAnalysis from '../components/ResumeAnalysis';
import PerformanceRadar from '../components/PerformanceRadar';
import QuestionAnalysis from '../components/QuestionAnalysis';
import ScoreBreakdown from '../components/ScoreBreakdown';
import ATSSuggestions from '../components/ATSSuggestions';
import RecentInterviews from '../components/RecentInterviews';
import { Bot, Play } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      <div className="mb-8 bg-gradient-to-r from-blue-600/20 to-navy-800 border border-blue-500/30 p-6 rounded-xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500">
            <Bot className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Your AI Interview Coach is Ready</h2>
            <p className="text-slate-300">Practice with a realistic AI interviewer to improve your readiness score.</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/live')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold transition-all hover:scale-105 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
        >
          <Play className="w-5 h-5" />
          Start Interview
        </button>
      </div>

      <KPICards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <ResumeAnalysis />
        </div>
        <div className="lg:col-span-2">
          <PerformanceRadar />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <QuestionAnalysis />
        </div>
        <div className="lg:col-span-1">
          <ScoreBreakdown />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ATSSuggestions />
        <RecentInterviews />
      </div>
    </motion.div>
  );
}
