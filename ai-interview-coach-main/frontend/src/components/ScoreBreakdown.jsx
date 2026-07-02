import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const ProgressBar = ({ label, value, colorClass }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1.5">
      <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">{label}</span>
      <span className="text-sm font-semibold text-textPrimary">{value}%</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2 border border-gray-200 overflow-hidden relative">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-2 rounded-full absolute top-0 left-0 ${colorClass}`}
      />
    </div>
  </div>
);

export default function ScoreBreakdown({ resumeData, history }) {
  const hasInterviews = history && history.length > 0;

  if (!hasInterviews) {
    return (
      <div className="glass p-6 h-full flex flex-col items-center justify-center text-center py-10 min-h-[300px] bg-white border border-[#E5E7EB] rounded-3xl">
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-textSecondary mb-3">
          <span className="text-2xl">📈</span>
        </div>
        <h3 className="font-bold text-textPrimary text-base mb-1">No skill data yet</h3>
        <p className="text-xs text-textSecondary max-w-[220px]">Skills and progress insights will be available once you complete an interview.</p>
      </div>
    );
  }

  const latestSession = history[0];
  const dynamicHistoryData = [...history].slice(0, 5).reverse().map((session, index, arr) => ({
    attempt: index === arr.length - 1 ? 'Current' : `Attempt ${index + 1}`,
    score: session.score || 0
  }));
      
  const tsScore = latestSession?.report?.technical_score || 0;
  const commScore = latestSession?.report?.communication_score || 0;
  const psScore = latestSession?.report?.problem_solving_score || 0;
  const confScore = latestSession?.report?.confidence_score || 0;

  return (
    <div className="glass p-6 bg-white border border-[#E5E7EB] rounded-3xl h-full flex flex-col">
      <h2 className="text-base font-bold text-textPrimary mb-6">Score Breakdown</h2>
      
      <div className="mb-6">
        <ProgressBar label="Technical Skills" value={tsScore} colorClass="bg-blue-500" />
        <ProgressBar label="Communication" value={commScore} colorClass="bg-indigo-500" />
        <ProgressBar label="Problem Solving" value={psScore} colorClass="bg-emerald-500" />
        <ProgressBar label="Confidence" value={confScore} colorClass="bg-amber-500" />
      </div>

      <div className="flex-grow flex flex-col border-t border-gray-150 pt-5">
        <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-4">Your Performance Over Time</h3>
        <div className="flex-grow w-full min-h-[180px] flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dynamicHistoryData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="attempt" stroke="#6B7280" fontSize={11} fontWeight={500} tickLine={false} axisLine={false} />
              <YAxis stroke="#6B7280" fontSize={11} fontWeight={500} tickLine={false} axisLine={false} domain={[50, 100]} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#fff', borderColor: '#E5E7EB', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                itemStyle={{ color: '#111827', fontSize: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#4F46E5" 
                strokeWidth={2}
                dot={{ fill: '#4F46E5', strokeWidth: 1, r: 3.5 }}
                activeDot={{ r: 5, fill: '#2563EB' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
