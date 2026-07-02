import React from 'react';
import { cn } from '../lib/utils';

export default function QuestionAnalysis({ resumeData, history }) {
  const hasInterviews = history && history.length > 0;

  if (!hasInterviews) {
    return (
      <div className="glass p-6 h-full flex flex-col items-center justify-center text-center py-10 min-h-[300px] bg-white border border-[#E5E7EB] rounded-3xl">
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-textSecondary mb-3">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="font-bold text-textPrimary text-base mb-1">No interview data available</h3>
        <p className="text-xs text-textSecondary max-w-[220px]">Complete your first mock interview to see question-by-question feedback.</p>
      </div>
    );
  }

  const latestSession = history[0];
  const detailedFeedback = latestSession?.report?.detailed_feedback || [];

  const questions = detailedFeedback.map(f => {
    const scoreVal = f.score || 7;
    let colorClass = "text-danger";
    let bgClass = "bg-danger/10";
    if (scoreVal >= 8) {
      colorClass = "text-success";
      bgClass = "bg-success/10";
    } else if (scoreVal >= 6) {
      colorClass = "text-warning";
      bgClass = "bg-warning/10";
    }
    return {
      q: f.question,
      score: scoreVal,
      feedback: f.feedback,
      color: colorClass,
      bg: bgClass
    };
  });

  return (
    <div className="glass p-6 bg-white border border-[#E5E7EB] rounded-3xl overflow-hidden">
      <div className="mb-6">
        <h2 className="text-base font-bold text-textPrimary">Question-wise Analysis</h2>
        <p className="text-xs text-textSecondary mt-0.5">Detailed breakdown of your answers</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-textSecondary">
          <thead className="text-xs uppercase bg-gray-50 text-textSecondary border-b border-gray-200">
            <tr>
              <th scope="col" className="px-6 py-3 font-semibold rounded-tl-xl">Question</th>
              <th scope="col" className="px-6 py-3 font-semibold">Score</th>
              <th scope="col" className="px-6 py-3 font-semibold rounded-tr-xl">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4 font-medium text-textPrimary max-w-xs truncate" title={item.q}>
                  {item.q}
                </td>
                <td className="px-6 py-4">
                  <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", item.bg, item.color)}>
                    {item.score}/10
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-textSecondary">
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
