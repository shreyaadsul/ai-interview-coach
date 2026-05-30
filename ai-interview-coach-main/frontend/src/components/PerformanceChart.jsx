import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function PerformanceChart({ data = [] }) {
  // Format data for chart mapping (Recharts uses key names)
  const chartData = data.map(item => ({
    name: item.date,
    score: item.score
  })).reverse(); // Reverse so it displays chronologically (May 15 first)

  // Custom tooltips to match dark theme premium feel
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111827] border border-[#1F2937] px-3.5 py-2.5 rounded-xl shadow-lg">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{payload[0].payload.name}</p>
          <p className="text-white text-sm font-bold mt-1">
            Score: <span className="text-primary">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl space-y-4 shadow-xl flex flex-col h-full">
      <h3 className="text-lg font-semibold text-white">Performance Trend</h3>
      <div className="w-full h-72 flex-grow min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
          >
            <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#9CA3AF" 
              fontSize={11}
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              dx={-5}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#7C3AED" 
              strokeWidth={3.5}
              dot={{ r: 4, stroke: '#7C3AED', strokeWidth: 2, fill: '#0B1020' }}
              activeDot={{ r: 7, stroke: '#7C3AED', strokeWidth: 2, fill: '#7C3AED' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
