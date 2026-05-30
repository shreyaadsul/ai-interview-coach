import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-lg border border-white/10 text-xs">
        <p className="font-semibold text-white mb-2">{payload[0].payload.subject}</p>
        <p className="text-primary font-medium mb-1">You: {payload[0].value}%</p>
        <p className="text-gray-400">Avg Candidate: {payload[1].value}%</p>
      </div>
    );
  }
  return null;
};

export default function PerformanceRadar({ resumeData }) {
  const baseScore = resumeData?.resume_score || 75;
  const dynamicData = [
    { subject: 'Technical Skills', A: Math.min(100, baseScore + 7), B: 65, fullMark: 100 },
    { subject: 'Communication', A: Math.max(0, baseScore - 8), B: 60, fullMark: 100 },
    { subject: 'Problem Solving', A: Math.min(100, baseScore + 2), B: 55, fullMark: 100 },
    { subject: 'Confidence', A: Math.max(0, baseScore - 3), B: 60, fullMark: 100 },
    { subject: 'Leadership', A: Math.max(0, baseScore - 10), B: 50, fullMark: 100 },
  ];

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Performance Overview</h2>
        <p className="text-sm text-gray-400">Compared to average candidates</p>
      </div>
      
      <div className="flex-grow w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dynamicData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="You"
              dataKey="A"
              stroke="#7C3AED"
              fill="#7C3AED"
              fillOpacity={0.4}
            />
            <Radar
              name="Avg Candidate"
              dataKey="B"
              stroke="#4B5563"
              fill="#4B5563"
              fillOpacity={0.2}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} 
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
