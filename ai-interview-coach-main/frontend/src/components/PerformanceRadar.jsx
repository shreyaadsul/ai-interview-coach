import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs shadow-sm">
        <p className="font-bold text-textPrimary mb-1.5">{payload[0].payload.subject}</p>
        <p className="text-primary font-bold">You: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function PerformanceRadar({ resumeData, history }) {
  const hasInterviews = history && history.length > 0;

  if (!hasInterviews) {
    return (
      <div className="glass p-6 h-full flex flex-col items-center justify-center text-center py-10 min-h-[300px]">
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-textSecondary mb-3">
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="font-bold text-textPrimary text-base mb-1">No interview data available</h3>
        <p className="text-xs text-textSecondary max-w-[220px]">Complete your first mock interview to see your skill breakdown.</p>
      </div>
    );
  }

  const latestSession = history[0];
  const tsScore = latestSession?.report?.technical_score || 0;
  const commScore = latestSession?.report?.communication_score || 0;
  const psScore = latestSession?.report?.problem_solving_score || 0;
  const confScore = latestSession?.report?.confidence_score || 0;
  const leadScore = Math.max(0, (latestSession.score || 0) - 10);

  const dynamicData = [
    { subject: 'Technical Skills', A: tsScore, B: 65, fullMark: 100 },
    { subject: 'Communication', A: commScore, B: 60, fullMark: 100 },
    { subject: 'Problem Solving', A: psScore, B: 55, fullMark: 100 },
    { subject: 'Confidence', A: confScore, B: 60, fullMark: 100 },
    { subject: 'Leadership', A: leadScore, B: 50, fullMark: 100 },
  ];

  return (
    <div className="glass p-6 h-full flex flex-col bg-white border border-[#E5E7EB] rounded-3xl">
      <div className="mb-4">
        <h2 className="text-base font-bold text-textPrimary">Performance Overview</h2>
      </div>
      
      <div className="flex-grow w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dynamicData}>
            <PolarGrid stroke="rgba(0,0,0,0.06)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="You"
              dataKey="A"
              stroke="#4F46E5"
              fill="#4F46E5"
              fillOpacity={0.15}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ fontSize: '11px', paddingTop: '15px', color: '#6B7280' }} 
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
