import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function PerformanceChart({ data = [] }) {
  // Format data for chart mapping
  const chartData = data.map(item => ({
    name: item.date,
    score: item.score
  })).reverse();

  // Custom tooltips to match SaaS premium feel
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-[#E5E7EB] px-3.5 py-2.5 rounded-xl shadow-sm">
          <p className="text-textSecondary text-xs font-bold uppercase tracking-wider">{payload[0].payload.name}</p>
          <p className="text-textPrimary text-sm font-bold mt-1">
            Score: <span className="text-primary">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-[#E5E7EB] p-6 rounded-3xl space-y-4 shadow-sm flex flex-col h-full">
      <h3 className="text-base font-bold text-textPrimary">Performance Trend</h3>
      <div className="w-full h-72 flex-grow min-h-[250px] flex items-center justify-center">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
            >
              <CartesianGrid stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280" 
                fontSize={11}
                fontWeight={500}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#6B7280" 
                fontSize={11}
                fontWeight={500}
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
                stroke="#4F46E5" 
                strokeWidth={2.5}
                dot={{ r: 3.5, stroke: '#4F46E5', strokeWidth: 1, fill: '#fff' }}
                activeDot={{ r: 5.5, stroke: '#2563EB', strokeWidth: 1, fill: '#2563EB' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-textSecondary text-xs">Not enough data to display trend.</p>
        )}
      </div>
    </div>
  );
}
