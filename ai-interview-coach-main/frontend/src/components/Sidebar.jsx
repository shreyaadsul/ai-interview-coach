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
    { name: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-[260px] h-screen fixed left-0 top-0 bg-white border-r border-[#E5E7EB] flex flex-col justify-between py-6 z-50">
      <div>
        <div className="flex items-center gap-3 px-6 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Bot className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-textPrimary tracking-tight">
            AI Coach
          </h1>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = currentPage === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setCurrentPage(item.name)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
                  isActive 
                    ? "bg-[#4F46E5]/10 text-primary" 
                    : "text-textSecondary hover:text-textPrimary hover:bg-gray-50"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-textSecondary/70")} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
