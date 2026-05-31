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
              { label: "Problem Solving", score: report.problem_solving_score },
              { label: "Project Knowledge", score: report.project_knowledge_score }
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
        {/* Stage Breakdowns */}
        {report.stage_scores && (
          <div className="glass p-6 border border-white/10 rounded-2xl md:col-span-3 space-y-6">
            <h3 className="text-lg font-semibold text-white">Interview Stage Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { label: "Introduction", score: report.stage_scores.Introduction },
                { label: "Resume", score: report.stage_scores.Resume },
                { label: "Project", score: report.stage_scores.Project },
                { label: "Technical", score: report.stage_scores.Technical },
                { label: "HR", score: report.stage_scores.HR }
              ].map((item, i) => (
                <div key={i} className="space-y-2 p-4 bg-white/5 border border-white/5 rounded-xl">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300 font-medium">{item.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {item.score || 0} <span className="text-sm font-normal text-gray-500">/ 10</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${item.score >= 8 ? 'bg-success' : item.score >= 6 ? 'bg-warning' : 'bg-danger'}`} 
                      style={{ width: `${(item.score || 0) * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

      {report.career_coach && (
        <div className="mt-12 pt-12 border-t border-white/10 space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">🚀</span> Career Readiness Engine
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Readiness Score Card */}
            <div className="glass p-6 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center bg-gradient-to-b from-navy-800 to-navy-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
              <h3 className="text-gray-400 font-semibold mb-4 uppercase tracking-widest text-xs">Interview Readiness</h3>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
                {report.career_coach.interview_readiness}%
              </div>
              <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${report.career_coach.interview_readiness >= 90 ? 'bg-success/10 text-success border-success/20' : report.career_coach.interview_readiness >= 80 ? 'bg-primary/10 text-primary border-primary/20' : report.career_coach.interview_readiness >= 70 ? 'bg-warning/10 text-warning border-warning/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                {report.career_coach.interview_readiness >= 90 ? 'Elite' : report.career_coach.interview_readiness >= 80 ? 'Ready' : report.career_coach.interview_readiness >= 70 ? 'Improving' : 'Needs Practice'}
              </div>
            </div>

            {/* AI Career Coach Insights */}
            <div className="glass p-6 border border-white/10 rounded-2xl md:col-span-2 relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/10 blur-3xl rounded-full" />
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span>🤖</span> AI Career Coach
              </h3>
              <p className="text-gray-300 italic mb-6">"{report.career_coach.mentor_insight}"</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Suggested Role</p>
                  <p className="text-sm font-semibold text-white">{report.career_coach.suggested_role}</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Hiring Recommendation</p>
                  <p className={`text-sm font-bold ${report.career_coach.hiring_recommendation === 'Strongly Recommended' ? 'text-success' : report.career_coach.hiring_recommendation === 'Recommended' ? 'text-primary' : report.career_coach.hiring_recommendation === 'Borderline' ? 'text-warning' : 'text-danger'}`}>{report.career_coach.hiring_recommendation}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Career Gap Analysis */}
            <div className="glass p-6 border border-white/10 rounded-2xl">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="text-warning">⚠️</span> Career Gap Analysis
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-400">Missing Critical Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {report.career_coach.skill_gaps?.map((gap, i) => (
                    <span key={i} className="px-3 py-1 bg-danger/10 text-danger border border-danger/20 rounded-lg text-sm">{gap}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Learning Roadmap */}
            <div className="glass p-6 border border-white/10 rounded-2xl lg:col-span-2">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="text-success">📈</span> Personalized Learning Roadmap
              </h3>
              <div className="relative">
                <div className="absolute top-0 bottom-0 left-[15px] w-0.5 bg-white/10" />
                <div className="space-y-4">
                  {report.career_coach.roadmap?.map((step, i) => (
                    <div key={i} className="relative pl-10">
                      <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-navy-900 border-2 border-primary flex items-center justify-center z-10">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <h4 className="text-white font-semibold text-sm">{step.week}</h4>
                      <p className="text-gray-400 text-sm">{step.focus}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
