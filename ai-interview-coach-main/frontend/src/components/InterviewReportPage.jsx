import React from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';

export default function InterviewReportPage({ report, onBackToHistory }) {
  if (!report) return null;

  const scoreColor = (score) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-danger";
  };

  return (
    <div className="space-y-8">
      {/* Header section with back button */}
      <div className="flex items-center gap-4">
        <button onClick={onBackToHistory} className="p-2 bg-white hover:bg-gray-50 rounded-xl transition-colors border border-gray-200 text-textSecondary hover:text-textPrimary shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">
            Interview Report
          </h1>
          <p className="text-textSecondary text-sm mt-1">Detailed performance analysis of your recent interview session.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score Card */}
        <div className="bg-white border border-[#E5E7EB] p-8 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center space-y-4 md:col-span-1">
          <h3 className="text-sm font-bold text-textSecondary uppercase tracking-wider">Overall Score</h3>
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
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
              <span className={`text-3xl font-extrabold ${scoreColor(report.overall_score)}`}>{report.overall_score || 0}</span>
              <span className="text-xs font-bold text-textSecondary mt-0.5">/ 100</span>
            </div>
          </div>
        </div>

        {/* Breakdowns Card */}
        <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] md:col-span-2 space-y-6">
          <h3 className="text-base font-bold text-textPrimary">Performance Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: "Technical", score: report.technical_score },
              { label: "Communication", score: report.communication_score },
              { label: "Confidence", score: report.confidence_score },
              { label: "Problem Solving", score: report.problem_solving_score },
              { label: "Project Knowledge", score: report.project_knowledge_score }
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-textSecondary uppercase tracking-wider">{item.label}</span>
                  <span className={`${scoreColor(item.score)} font-extrabold`}>{item.score || 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${item.score >= 80 ? 'bg-success' : item.score >= 60 ? 'bg-warning' : 'bg-danger'}`} 
                    style={{ width: `${item.score || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage Breakdowns Card */}
        {report.stage_scores && (
          <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] md:col-span-3 space-y-6">
            <h3 className="text-base font-bold text-textPrimary">Interview Stage Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { label: "Introduction", score: report.stage_scores.Introduction },
                { label: "Resume", score: report.stage_scores.Resume },
                { label: "Project", score: report.stage_scores.Project },
                { label: "Technical", score: report.stage_scores.Technical },
                { label: "HR", score: report.stage_scores.HR }
              ].map((item, i) => (
                <div key={i} className="space-y-2 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-textSecondary uppercase tracking-wider">{item.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-textPrimary mt-1">
                    {item.score || 0} <span className="text-xs font-bold text-textSecondary">/ 10</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
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

      {/* Strengths / Weaknesses / Suggestions List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths Card */}
        <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 text-success mb-4">
            <CheckCircle className="w-5 h-5" />
            <h3 className="text-sm font-bold text-textPrimary">Strengths</h3>
          </div>
          <ul className="space-y-3">
            {report.strengths?.map((str, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-textSecondary font-semibold leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses Card */}
        <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 text-danger mb-4">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-bold text-textPrimary">Areas to Improve</h3>
          </div>
          <ul className="space-y-3">
            {report.weaknesses?.map((wk, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-textSecondary font-semibold leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-2 flex-shrink-0" />
                <span>{wk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Suggestions Card */}
        <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 text-primary mb-4">
            <Lightbulb className="w-5 h-5" />
            <h3 className="text-sm font-bold text-textPrimary">Recommendations</h3>
          </div>
          <ul className="space-y-3">
            {report.suggestions?.map((sug, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-textSecondary font-semibold leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Career Readiness Section */}
      {report.career_coach && (
        <div className="mt-12 pt-12 border-t border-gray-100 space-y-6">
          <h2 className="text-2xl font-extrabold text-textPrimary flex items-center gap-2">
            <span className="text-3xl">🚀</span> Career Readiness Engine
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Readiness Score Card */}
            <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
              <h3 className="text-textSecondary font-bold uppercase tracking-wider text-[10px] mb-4">Interview Readiness</h3>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
                {report.career_coach.interview_readiness}%
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${report.career_coach.interview_readiness >= 90 ? 'bg-success/10 text-success border-success/20' : report.career_coach.interview_readiness >= 80 ? 'bg-primary/10 text-primary border-primary/20' : report.career_coach.interview_readiness >= 70 ? 'bg-warning/10 text-warning border-warning/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                {report.career_coach.interview_readiness >= 90 ? 'Elite' : report.career_coach.interview_readiness >= 80 ? 'Ready' : report.career_coach.interview_readiness >= 70 ? 'Improving' : 'Needs Practice'}
              </div>
            </div>

            {/* AI Career Coach Insights Card */}
            <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] md:col-span-2 relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/5 blur-3xl rounded-full" />
              <h3 className="text-textPrimary font-bold text-base mb-4 flex items-center gap-2">
                <span>🤖</span> AI Career Coach
              </h3>
              <p className="text-textSecondary font-semibold italic text-xs leading-relaxed mb-6">"{report.career_coach.mentor_insight}"</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <p className="text-[10px] text-textSecondary uppercase font-bold tracking-wider mb-1">Suggested Role</p>
                  <p className="text-sm font-bold text-textPrimary">{report.career_coach.suggested_role}</p>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <p className="text-[10px] text-textSecondary uppercase font-bold tracking-wider mb-1">Hiring Decision</p>
                  <p className={`text-sm font-bold ${report.career_coach.hiring_recommendation === 'Strongly Recommended' ? 'text-success' : report.career_coach.hiring_recommendation === 'Recommended' ? 'text-primary' : report.career_coach.hiring_recommendation === 'Borderline' ? 'text-warning' : 'text-danger'}`}>{report.career_coach.hiring_recommendation}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Career Gap Card */}
            <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
              <h3 className="text-textPrimary font-bold text-base mb-4 flex items-center gap-2">
                <span className="text-warning">⚠️</span> Career Gap Analysis
              </h3>
              <div className="space-y-3">
                <p className="text-xs font-bold text-textSecondary uppercase tracking-wider">Missing Critical Skills</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {report.career_coach.skill_gaps?.map((gap, i) => (
                    <span key={i} className="px-3 py-1 bg-danger/5 text-danger border border-danger/25 rounded-lg text-xs font-bold">{gap}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Learning Roadmap Card */}
            <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] lg:col-span-2">
              <h3 className="text-textPrimary font-bold text-base mb-4 flex items-center gap-2">
                <span className="text-success">📈</span> Personalized Learning Roadmap
              </h3>
              <div className="relative pt-2">
                <div className="absolute top-0 bottom-0 left-[15px] w-0.5 bg-gray-100" />
                <div className="space-y-4">
                  {report.career_coach.roadmap?.map((step, i) => (
                    <div key={i} className="relative pl-10">
                      <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-white border-2 border-primary flex items-center justify-center z-10 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <h4 className="text-textPrimary font-bold text-sm">{step.week}</h4>
                      <p className="text-textSecondary font-medium text-xs mt-0.5">{step.focus}</p>
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
