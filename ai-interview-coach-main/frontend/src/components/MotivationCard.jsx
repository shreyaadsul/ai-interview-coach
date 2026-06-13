import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';

export default function MotivationCard() {
  return (
    <div className="bg-[#111827] border border-[#1F2937] p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl hover:border-primary/20 transition-all duration-300 group min-h-[300px]">
      {/* SaaS Premium Glow Effect */}
      <div className="absolute -inset-10 bg-radial-glow from-primary/10 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />
      
      {/* Decorative Confetti Icons */}
      <div className="absolute top-8 left-8 text-yellow-500/20 group-hover:text-yellow-500/40 group-hover:scale-110 transition-all duration-300">
        <Sparkles className="w-5 h-5 animate-pulse" />
      </div>
      <div className="absolute bottom-8 right-8 text-primary/20 group-hover:text-primary/40 group-hover:scale-110 transition-all duration-300">
        <Sparkles className="w-6 h-6 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      <div className="absolute top-12 right-12 text-[#22C55E]/15 group-hover:text-[#22C55E]/35 group-hover:scale-110 transition-all duration-300">
        <Sparkles className="w-4 h-4 animate-pulse" style={{ animationDelay: '0.9s' }} />
      </div>

      {/* Trophy Illustration Container */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-500/20 to-primary/20 flex items-center justify-center text-yellow-500 border border-yellow-500/20 shadow-lg shadow-yellow-500/5 mb-6 group-hover:scale-105 transition-transform duration-300 z-10">
        <Trophy className="w-10 h-10 filter drop-shadow-md" />
      </div>

      {/* Text Info */}
      <div className="space-y-2.5 z-10">
        <h3 className="text-xl font-bold text-white tracking-tight">Keep Practicing!</h3>
        <p className="text-gray-400 text-sm leading-relaxed max-w-[240px]">
          You're doing great! Keep practicing to climb the leaderboard.
        </p>
      </div>
    </div>
  );
}
