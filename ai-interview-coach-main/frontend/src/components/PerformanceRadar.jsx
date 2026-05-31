import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-lg border border-white/10 text-xs">
        <p className="font-semibold text-white mb-2">{payload[0].payload.subject}</p>
        <p className="text-primary font-medium mb-1">You: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function PerformanceRadar({ resumeData, history }) {
  const latestSession = history && history.length > 0 ? history[0] : null;
  const baseScore = resumeData?.resume_score || 75;
  const currentScore = latestSession ? (latestSession.score || 0) : baseScore;
  
  const tsScore = latestSession?.report?.technical_score || (currentScore > 0 ? Math.min(100, currentScore + 7) : 85);
  const commScore = latestSession?.report?.communication_score || (currentScore > 0 ? Math.max(0, currentScore - 8) : 70);
  const psScore = latestSession?.report?.problem_solving_score || (currentScore > 0 ? Math.min(100, currentScore + 2) : 80);
  const confScore = latestSession?.report?.confidence_score || (currentScore > 0 ? Math.max(0, currentScore - 3) : 75);
  // Optional: add a leadership proxy if not explicitly in report
  const leadScore = Math.max(0, currentScore - 10);

  const dynamicData = [
    { subject: 'Technical Skills', A: tsScore, B: 65, fullMark: 100 },
    { subject: 'Communication', A: commScore, B: 60, fullMark: 100 },
    { subject: 'Problem Solving', A: psScore, B: 55, fullMark: 100 },
    { subject: 'Confidence', A: confScore, B: 60, fullMark: 100 },
    { subject: 'Leadership', A: leadScore, B: 50, fullMark: 100 },
  ];

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Performance Overview</h2>
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
