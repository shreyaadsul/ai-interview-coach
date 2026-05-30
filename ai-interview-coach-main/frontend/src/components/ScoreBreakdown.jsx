import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const historyData = [
  { attempt: 'Attempt 1', score: 65 },
  { attempt: 'Attempt 2', score: 72 },
  { attempt: 'Attempt 3', score: 85 },
  { attempt: 'Current', score: 78 },
];

const ProgressBar = ({ label, value, colorClass }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1.5">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      <span className="text-sm font-semibold text-white">{value}%</span>
    </div>
    <div className="w-full bg-navy-900 rounded-full h-2.5 border border-white/5 overflow-hidden relative">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-2.5 rounded-full absolute top-0 left-0 ${colorClass}`}
      />
    </div>
  </div>
);

export default function ScoreBreakdown({ resumeData }) {
  const currentScore = resumeData?.resume_score || 78;
  const dynamicHistoryData = [
    { attempt: 'Attempt 1', score: 65 },
    { attempt: 'Attempt 2', score: 72 },
    { attempt: 'Attempt 3', score: 85 },
    { attempt: 'Current', score: currentScore },
  ];

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-white mb-6">Score Breakdown</h2>
      
      <div className="mb-8">
        <ProgressBar label="Technical Skills" value={currentScore > 0 ? Math.min(100, currentScore + 7) : 85} colorClass="bg-blue-500" />
        <ProgressBar label="Communication" value={currentScore > 0 ? Math.max(0, currentScore - 8) : 70} colorClass="bg-purple-500" />
        <ProgressBar label="Problem Solving" value={currentScore > 0 ? Math.min(100, currentScore + 2) : 80} colorClass="bg-green-500" />
        <ProgressBar label="Confidence" value={currentScore > 0 ? Math.max(0, currentScore - 3) : 75} colorClass="bg-orange-500" />
      </div>

      <div className="flex-grow flex flex-col">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Your Performance Over Time</h3>
        <div className="flex-grow w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dynamicHistoryData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="attempt" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} domain={[50, 100]} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#7C3AED" 
                strokeWidth={3}
                dot={{ fill: '#7C3AED', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
