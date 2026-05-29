import React from 'react';
import { cn } from '../lib/utils';
import { CheckCircle2 } from 'lucide-react';

const CircularProgress = ({ value, max, colorClass, trailColorClass, label, title, subtitle }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / max) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="transform -rotate-90 w-20 h-20">
          <circle
            className={trailColorClass}
            strokeWidth="6"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="40"
            cy="40"
          />
          <circle
            className={cn("transition-all duration-1000 ease-in-out", colorClass)}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="40"
            cy="40"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-sm font-bold text-white">{label}</span>
        </div>
      </div>
      <div>
        <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
        <p className="text-lg font-semibold text-white">{subtitle}</p>
      </div>
    </div>
  );
};

export default function KPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {/* 1. ATS Score */}
      <div className="glass-card p-5 group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-success/20 transition-colors" />
        <CircularProgress 
          value={82} max={100} 
          colorClass="text-success" 
          trailColorClass="text-success/20" 
          label="82" 
          title="ATS Score" 
          subtitle="82/100" 
        />
      </div>

      {/* 2. Interview Score */}
      <div className="glass-card p-5 group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-secondary/20 transition-colors" />
        <CircularProgress 
          value={78} max={100} 
          colorClass="text-secondary" 
          trailColorClass="text-secondary/20" 
          label="78" 
          title="Interview Score" 
          subtitle="78/100" 
        />
      </div>

      {/* 3. Confidence Score */}
      <div className="glass-card p-5 group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors" />
        <CircularProgress 
          value={75} max={100} 
          colorClass="text-primary" 
          trailColorClass="text-primary/20" 
          label="75" 
          title="Confidence" 
          subtitle="75/100" 
        />
      </div>

      {/* 4. Questions Completed */}
      <div className="glass-card p-5 group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-orange-500/20 transition-colors" />
        <CircularProgress 
          value={15} max={15} 
          colorClass="text-orange-500" 
          trailColorClass="text-orange-500/20" 
          label="15/15" 
          title="Questions" 
          subtitle="Completed" 
        />
      </div>

      {/* 5. AI Recommendation */}
      <div className="gradient-border rounded-2xl p-5 bg-navy-900/50 backdrop-blur-md group relative overflow-hidden flex flex-col justify-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <span className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-full">Recommended</span>
        </div>
        <h3 className="text-sm font-medium text-white mb-1">Junior ML Engineer</h3>
        <p className="text-xs text-gray-400">Confidence: <span className="text-white font-semibold">82%</span></p>
      </div>
    </div>
  );
}
