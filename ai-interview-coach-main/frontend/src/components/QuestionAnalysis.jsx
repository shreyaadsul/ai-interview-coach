import React from 'react';
import { cn } from '../lib/utils';

export default function QuestionAnalysis({ resumeData, history }) {
  const latestSession = history && history.length > 0 ? history[0] : null;
  const detailedFeedback = latestSession?.report?.detailed_feedback || [];

  const questions = detailedFeedback.length > 0 
    ? detailedFeedback.map(f => ({
        q: f.question,
        score: f.score || 7,
        feedback: f.feedback,
        color: (f.score || 7) >= 8 ? "text-success" : (f.score || 7) >= 6 ? "text-yellow-400" : "text-orange-500",
        bg: (f.score || 7) >= 8 ? "bg-success/10" : (f.score || 7) >= 6 ? "bg-yellow-400/10" : "bg-orange-500/10"
      }))
    : [];

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
            {questions.length > 0 ? questions.map((item, idx) => (
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
            )) : (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                  Complete an interview to see question-by-question feedback.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
