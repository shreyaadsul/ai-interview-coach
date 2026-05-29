import React from 'react';
import { cn } from '../lib/utils';

export default function QuestionAnalysis() {
  const questions = [
    {
      q: "Explain your AutoJi Project",
      score: 8.5,
      feedback: "Great explanation. Add more challenges faced.",
      color: "text-success",
      bg: "bg-success/10"
    },
    {
      q: "How do Flask Webhooks work?",
      score: 7.0,
      feedback: "Good understanding. Add technical depth.",
      color: "text-yellow-400",
      bg: "bg-yellow-400/10"
    },
    {
      q: "Difference between AI and ML?",
      score: 9.0,
      feedback: "Excellent answer.",
      color: "text-success",
      bg: "bg-success/10"
    },
    {
      q: "What is overfitting?",
      score: 5.5,
      feedback: "Needs improvement. Provide real-world examples.",
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    }
  ];

  return (
    <div className="glass-card p-6 overflow-hidden">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Question-wise Analysis</h2>
        <p className="text-sm text-gray-400">Detailed breakdown of your answers</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs uppercase bg-white/5 text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-4 rounded-tl-xl">Question</th>
              <th scope="col" className="px-6 py-4">Score</th>
              <th scope="col" className="px-6 py-4 rounded-tr-xl">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((item, idx) => (
              <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 font-medium text-white">
                  {item.q}
                </td>
                <td className="px-6 py-4">
                  <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", item.bg, item.color)}>
                    {item.score}/10
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 group-hover:text-gray-300 transition-colors">
                  {item.feedback}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
