import React from 'react';
import { LayoutDashboard, FileText, Video, CheckSquare, History, Trophy, Settings, Bot, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Resume Analysis', icon: FileText },
    { name: 'Mock Interview', icon: Video },
    { name: 'ATS Checker', icon: CheckSquare },
    { name: 'Interview History', icon: History },
    { name: 'Leaderboard', icon: Trophy },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass border-r border-white/10 flex flex-col justify-between py-6 z-50">
      <div>
        <div className="flex items-center gap-3 px-6 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            AI Coach
          </h1>
        </div>

        <nav className="flex flex-col gap-2 px-4">
          {navItems.map((item) => {
            const isActive = currentPage === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setCurrentPage(item.name)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium",
                  isActive 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-gray-400")} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
