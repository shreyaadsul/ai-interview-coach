import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

// Removed mock history data

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

export default function ScoreBreakdown({ resumeData, history }) {
  const latestSession = history && history.length > 0 ? history[0] : null;
  const currentScore = latestSession ? (latestSession.score || 0) : (resumeData?.resume_score || 0);
  
  // Calculate historical chart data from history array (max 5 items, reverse to get oldest first)
  const dynamicHistoryData = history && history.length > 0
    ? [...history].slice(0, 5).reverse().map((session, index, arr) => ({
        attempt: index === arr.length - 1 ? 'Current' : `Attempt ${index + 1}`,
        score: session.score || 0
      }))
    : [];
      
  const tsScore = latestSession?.report?.technical_score || 0;
  const commScore = latestSession?.report?.communication_score || 0;
  const psScore = latestSession?.report?.problem_solving_score || 0;
  const confScore = latestSession?.report?.confidence_score || 0;

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-white mb-6">Score Breakdown</h2>
      
      <div className="mb-8">
        <ProgressBar label="Technical Skills" value={tsScore} colorClass="bg-blue-500" />
        <ProgressBar label="Communication" value={commScore} colorClass="bg-purple-500" />
        <ProgressBar label="Problem Solving" value={psScore} colorClass="bg-green-500" />
        <ProgressBar label="Confidence" value={confScore} colorClass="bg-orange-500" />
      </div>

      <div className="flex-grow flex flex-col">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Your Performance Over Time</h3>
        <div className="flex-grow w-full min-h-[200px] flex items-center justify-center relative">
          {dynamicHistoryData.length > 0 ? (
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
          ) : (
            <div className="text-gray-500 text-sm text-center">Take your first interview to see progress!</div>
          )}
        </div>
      </div>
    </div>
  );
}
