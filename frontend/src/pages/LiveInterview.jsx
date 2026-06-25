import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AIAvatar from '../components/AIAvatar';

export default function LiveInterview() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen bg-navy-900 relative overflow-hidden flex flex-col">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 z-50 flex items-center justify-between bg-gradient-to-b from-navy-900 to-transparent">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors px-4 py-2 bg-navy-800/50 backdrop-blur rounded-lg border border-navy-700"
        >
          <ArrowLeft className="w-5 h-5" />
          End Interview
        </button>
        <div className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-full text-sm font-bold flex items-center gap-2 backdrop-blur">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          LIVE
        </div>
      </div>

      {/* 3D Interviewer Scene */}
      <div className="flex-1 w-full h-full">
        <AIAvatar />
      </div>
    </div>
  );
}
