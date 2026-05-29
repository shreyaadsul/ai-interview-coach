import React from 'react';
import { Bell, Plus } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center justify-between py-6 px-8 ml-64 bg-navy-900/50 backdrop-blur-md sticky top-0 z-40 border-b border-white/5">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back, Shreya! 👋</h1>
        <p className="text-sm text-gray-400">Here's your interview performance overview.</p>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
          <Bell className="w-5 h-5 text-gray-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-navy-900" />
        </button>
        
        <div className="flex items-center gap-3 border-l border-white/10 pl-6">
          <img 
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Shreya&backgroundColor=7C3AED" 
            alt="User Avatar" 
            className="w-10 h-10 rounded-full border border-white/10"
          />
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:-translate-y-0.5">
          <Plus className="w-4 h-4" />
          New Interview
        </button>
      </div>
    </header>
  );
}
