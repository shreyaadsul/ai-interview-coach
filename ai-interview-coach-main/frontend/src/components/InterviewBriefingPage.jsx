import React, { useState } from 'react';
import { Play, CheckCircle, Video, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InterviewBriefingPage({ sessionConfig, resumeData, onBegin }) {
  const [cameraReady, setCameraReady] = useState(false);
  const [testingCamera, setTestingCamera] = useState(false);

  if (!sessionConfig) return null;

  const handleTestCamera = async () => {
    setTestingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // We just need permission, so stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
      setCameraReady(true);
    } catch (err) {
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
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Interview Briefing
        </h1>
        <p className="text-gray-400 text-sm mt-1">Review your AI-generated interview parameters before starting.</p>
      </div>

      <div className="glass p-8 border border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Proctoring Instructions</h3>
            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p><span className="text-white font-medium">Fullscreen Mode:</span> The interview will automatically enter fullscreen. Do not exit fullscreen or use the Escape key.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p><span className="text-white font-medium">Focus Tracking:</span> Switching tabs, minimizing the browser, or clicking outside the window will trigger a violation warning.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0" />
                <p><span className="text-danger font-medium">3-Strikes Rule:</span> Accumulating 3 warnings will result in immediate termination of the mock interview.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p><span className="text-white font-medium">No Copy-Pasting:</span> Copying and pasting text is strictly disabled to ensure original answers.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                <p><span className="text-warning font-medium">AI Head Tracking:</span> MediaPipe AI will actively track your face. Looking away from the screen will trigger a warning.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Interview Setup</h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Target Role</span>
              <span className="text-white font-medium">{sessionConfig.target_role}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Interview Type</span>
              <span className="text-white font-medium">{sessionConfig.interview_type}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Difficulty</span>
              <span className="text-white font-medium">{sessionConfig.difficulty}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Questions Count</span>
              <span className="text-white font-medium">{sessionConfig.questions_count}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Estimated Duration</span>
              <span className="text-primary font-medium">30 Minutes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <div className="flex items-center gap-4">
          {!cameraReady ? (
            <button 
              onClick={handleTestCamera}
              disabled={testingCamera}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all focus:outline-none"
            >
              <Camera className="w-5 h-5" />
              {testingCamera ? "Testing..." : "Enable Camera Access"}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-success/10 text-success font-semibold">
              <CheckCircle className="w-5 h-5" />
              Camera Ready
            </div>
          )}
          {!cameraReady && (
            <p className="text-xs text-gray-400">Camera access is required for AI Proctoring.</p>
          )}
        </div>

        <button 
          onClick={handleBegin}
          disabled={!cameraReady}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
        >
          Begin Interview
          <Play className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
}
