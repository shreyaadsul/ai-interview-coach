import React, { useState } from 'react';
import { Play, CheckCircle, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InterviewBriefingPage({ sessionConfig, resumeData, onBegin, onCameraReady }) {
  const [cameraReady, setCameraReady] = useState(false);
  const [testingCamera, setTestingCamera] = useState(false);

  if (!sessionConfig) return null;

  const handleTestCamera = async () => {
    setTestingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log("Camera permission granted");
      console.log("MediaStream created");
      if (onCameraReady) onCameraReady(stream);
      setCameraReady(true);
      console.log("Camera ready");
    } catch (err) {
      console.error("Camera init failed:", err);
      alert("Camera access denied or no camera found. You must allow camera access to begin the proctored interview.");
      setCameraReady(false);
    } finally {
      setTestingCamera(false);
    }
  };

  const handleBegin = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request failed:", err);
    }
    onBegin();
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">
          Interview Briefing
        </h1>
        <p className="text-textSecondary text-sm mt-1">Review your AI-generated interview parameters before starting.</p>
      </div>

      {/* Grid Container */}
      <div className="bg-white border border-[#E5E7EB] p-8 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Proctoring Instructions */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-textPrimary border-b border-gray-100 pb-2">Proctoring Instructions</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-textSecondary leading-relaxed font-semibold">
                  <span className="text-textPrimary font-bold">Fullscreen Mode:</span> The interview will automatically enter fullscreen. Do not exit fullscreen or use the Escape key.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-textSecondary leading-relaxed font-semibold">
                  <span className="text-textPrimary font-bold">Focus Tracking:</span> Switching tabs, minimizing the browser, or clicking outside the window will trigger a violation warning.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0" />
                <p className="text-textSecondary leading-relaxed font-semibold">
                  <span className="text-danger font-bold">3-Strikes Rule:</span> Accumulating 3 warnings will result in immediate termination of the mock interview.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-textSecondary leading-relaxed font-semibold">
                  <span className="text-textPrimary font-bold">No Copy-Pasting:</span> Copying and pasting text is strictly disabled to ensure original answers.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                <p className="text-textSecondary leading-relaxed font-semibold">
                  <span className="text-warning font-bold">AI Head Tracking:</span> MediaPipe AI will actively track your face. Looking away from the screen will trigger a warning.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interview Setup Details */}
        <div className="space-y-6 border-t border-gray-100 pt-6 md:border-t-0 md:pt-0">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-textPrimary border-b border-gray-100 pb-2">Interview Setup</h3>
            
            <div className="flex justify-between items-center py-1">
              <span className="text-textSecondary text-xs font-bold uppercase tracking-wider">Target Role</span>
              <span className="text-textPrimary text-sm font-bold">{sessionConfig.target_role}</span>
            </div>
            
            <div className="flex justify-between items-center py-1 border-t border-gray-50">
              <span className="text-textSecondary text-xs font-bold uppercase tracking-wider">Interview Type</span>
              <span className="text-textPrimary text-sm font-bold">{sessionConfig.interview_type}</span>
            </div>
            
            <div className="flex justify-between items-center py-1 border-t border-gray-50">
              <span className="text-textSecondary text-xs font-bold uppercase tracking-wider">Difficulty</span>
              <span className="text-textPrimary text-sm font-bold">{sessionConfig.difficulty}</span>
            </div>
            
            <div className="flex justify-between items-center py-1 border-t border-gray-50">
              <span className="text-textSecondary text-xs font-bold uppercase tracking-wider">Questions Count</span>
              <span className="text-textPrimary text-sm font-bold">20 Questions (6 Stages)</span>
            </div>
            
            <div className="flex justify-between items-center py-1 border-t border-gray-50">
              <span className="text-textSecondary text-xs font-bold uppercase tracking-wider">Estimated Duration</span>
              <span className="text-primary text-sm font-bold">{sessionConfig.questions_count || "15-20 Minutes"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {!cameraReady ? (
            <button 
              onClick={handleTestCamera}
              disabled={testingCamera}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-textSecondary hover:text-textPrimary font-bold text-xs transition-all shadow-sm focus:outline-none"
            >
              <Camera className="w-4 h-4 text-textSecondary" />
              {testingCamera ? "Testing..." : "Enable Camera Access"}
            </button>
          ) : (
            <div className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-success/20 rounded-xl bg-success/5 text-success text-xs font-bold shadow-sm">
              <CheckCircle className="w-4 h-4 text-success" />
              Camera Ready
            </div>
          )}
          {!cameraReady && (
            <p className="text-xs font-semibold text-textSecondary text-center sm:text-left">Camera access is required for AI Proctoring.</p>
          )}
        </div>

        <button 
          onClick={handleBegin}
          disabled={!cameraReady}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-[#4F46E5]/95 text-white font-bold text-xs transition-all shadow-sm hover:translate-y-[-1px] disabled:opacity-50 disabled:pointer-events-none"
        >
          Begin Interview
          <Play className="w-4 h-4 ml-1 text-white fill-white" />
        </button>
      </div>
    </div>
  );
}
