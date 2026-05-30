import React from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InterviewReportPage({ report, onBackToHistory }) {
  if (!report) return null;

  const scoreColor = (score) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-danger";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={onBackToHistory} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10 text-gray-300 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Interview Report
          </h1>
          <p className="text-gray-400 text-sm mt-1">Detailed performance analysis of your recent interview session.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score */}
        <div className="glass p-8 border border-white/10 rounded-2xl flex flex-col items-center justify-center space-y-4 md:col-span-1">
          <h3 className="text-lg font-semibold text-gray-300">Overall Score</h3>
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
              <circle 
                cx="64" 
                cy="64" 
                r="56" 
                stroke="currentColor" 
                strokeWidth="12" 
                fill="transparent" 
                strokeDasharray="351.858" 
                strokeDashoffset={351.858 - (351.858 * (report.overall_score || 0)) / 100} 
                className={`${report.overall_score >= 80 ? 'text-success' : report.overall_score >= 60 ? 'text-warning' : 'text-danger'} transition-all duration-1000`} 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className={`text-3xl font-bold ${scoreColor(report.overall_score)}`}>{report.overall_score || 0}</span>
              <span className="text-xs text-gray-400">/ 100</span>
            </div>
          </div>
        </div>

        {/* Breakdowns */}
        <div className="glass p-6 border border-white/10 rounded-2xl md:col-span-2 space-y-6">
          <h3 className="text-lg font-semibold text-white">Performance Breakdown</h3>
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: "Technical", score: report.technical_score },
              { label: "Communication", score: report.communication_score },
              { label: "Confidence", score: report.confidence_score },
              { label: "Problem Solving", score: report.problem_solving_score }
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">{item.label}</span>
                  <span className={`font-bold ${scoreColor(item.score)}`}>{item.score || 0}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${item.score >= 80 ? 'bg-success' : item.score >= 60 ? 'bg-warning' : 'bg-danger'}`} 
                    style={{ width: `${item.score || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="glass p-6 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2 text-success mb-4">
            <CheckCircle className="w-5 h-5" />
            <h3 className="font-semibold text-white">Strengths</h3>
          </div>
          <ul className="space-y-3">
            {report.strengths?.map((str, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="glass p-6 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2 text-danger mb-4">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-semibold text-white">Areas to Improve</h3>
          </div>
          <ul className="space-y-3">
            {report.weaknesses?.map((wk, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-2 flex-shrink-0" />
                <span>{wk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Suggestions */}
        <div className="glass p-6 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2 text-primary mb-4">
            <Lightbulb className="w-5 h-5" />
            <h3 className="font-semibold text-white">Recommendations</h3>
          </div>
          <ul className="space-y-3">
            {report.suggestions?.map((sug, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
