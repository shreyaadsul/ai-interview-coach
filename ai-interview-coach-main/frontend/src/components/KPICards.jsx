import React from 'react';
import { cn } from '../lib/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const CircularProgress = ({ value, max, colorClass, trailColorClass, label, title, subtitle, isEmpty }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isEmpty ? circumference : circumference - (value / max) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
        <svg className="transform -rotate-90 w-16 h-16">
          <circle
            className={trailColorClass}
            strokeWidth="5"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="32"
            cy="32"
          />
          <circle
            className={cn("transition-all duration-1000 ease-in-out", colorClass)}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="32"
            cy="32"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-sm font-bold text-textPrimary">{label}</span>
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-0.5">{title}</h3>
        <p className="text-sm font-medium text-textPrimary leading-tight">{subtitle}</p>
      </div>
    </div>
  );
};

export default function KPICards({ resumeData, history }) {
  const isResumeUploaded = resumeData && resumeData.fileName !== "No Resume Uploaded" && resumeData.resume_score > 0;
  const hasInterviews = history && history.length > 0;

  const atsScore = isResumeUploaded ? resumeData.resume_score : 0;
  const suggestedRole = isResumeUploaded ? resumeData.suggested_roles?.[0] : null;
  
  const latestSession = hasInterviews ? history[0] : null;
  const interviewScore = latestSession ? (latestSession.score || 0) : 0;
  const confidenceScore = latestSession?.report?.confidence_score || 0;
  const questionsCount = latestSession?.questions_count || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
      {/* 1. ATS Score */}
      <div className="glass p-5 relative overflow-hidden">
        <CircularProgress 
          value={atsScore} max={100} 
          colorClass="text-success" 
          trailColorClass="text-success/10" 
          label={isResumeUploaded ? atsScore.toString() : "--"} 
          title="ATS Score" 
          subtitle={isResumeUploaded ? `${atsScore}/100` : "No resume analyzed yet."} 
          isEmpty={!isResumeUploaded}
        />
      </div>

      {/* 2. Interview Score */}
      <div className="glass p-5 relative overflow-hidden">
        <CircularProgress 
          value={interviewScore} max={100} 
          colorClass="text-secondary" 
          trailColorClass="text-secondary/10" 
          label={hasInterviews ? interviewScore.toString() : "--"} 
          title="Interview Score" 
          subtitle={hasInterviews ? `${interviewScore}/100` : "Complete your first interview."} 
          isEmpty={!hasInterviews}
        />
      </div>

      {/* 3. Confidence Score */}
      <div className="glass p-5 relative overflow-hidden">
        <CircularProgress 
          value={confidenceScore} max={100} 
          colorClass="text-primary" 
          trailColorClass="text-primary/10" 
          label={hasInterviews ? confidenceScore.toString() : "--"} 
          title="Confidence" 
          subtitle={hasInterviews ? `${confidenceScore}/100` : "No interview data available."} 
          isEmpty={!hasInterviews}
        />
      </div>

      {/* 4. Questions Completed */}
      <div className="glass p-5 relative overflow-hidden">
        <CircularProgress 
          value={questionsCount} max={100} 
          colorClass="text-orange-500" 
          trailColorClass="text-orange-500/10" 
          label={hasInterviews ? questionsCount.toString() : "--"} 
          title="Questions" 
          subtitle={hasInterviews ? "Questions Completed" : "No interview data."} 
          isEmpty={!hasInterviews}
        />
      </div>

      {/* 5. AI Recommendation */}
      <div className="glass p-5 relative overflow-hidden flex flex-col justify-center">
        {isResumeUploaded ? (
          <>
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">Recommended</span>
            </div>
            <h3 className="text-sm font-bold text-textPrimary truncate" title={suggestedRole}>{suggestedRole || "Software Engineer"}</h3>
            <p className="text-[11px] text-textSecondary mt-0.5">Strength match: <span className="text-textPrimary font-semibold">{atsScore}%</span></p>
          </>
        ) : (
          <div className="flex flex-col justify-center py-1.5">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-textSecondary/50" />
              <span className="text-[10px] font-bold text-textSecondary bg-gray-100 px-2 py-0.5 rounded-full">Pending</span>
            </div>
            <h3 className="text-sm font-bold text-textSecondary truncate">No skill data yet.</h3>
            <p className="text-[11px] text-textSecondary mt-0.5">Upload resume to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
