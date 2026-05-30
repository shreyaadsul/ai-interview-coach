import React from 'react';
import { LayoutDashboard, FileText, Video, CheckSquare, History, Trophy, Settings, Bot, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: true },
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
          {navItems.map((item) => (
            <button
              key={item.name}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium",
                item.active 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5", item.active ? "text-primary" : "text-gray-400")} />
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="px-4">
        <div className="gradient-border rounded-xl p-5 bg-navy-900/50 backdrop-blur-md relative overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-white/5">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Pro Upgrade</h3>
              <p className="text-xs text-gray-400">Unlimited mocks</p>
            </div>
          </div>
          <button className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors duration-300">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}
