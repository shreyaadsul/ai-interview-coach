import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HelpCircle, ChevronLeft, ChevronRight, CheckCircle, Info, Clock, Loader2, AlertTriangle, Camera } from 'lucide-react';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export default function MockInterviewPage({ 
  onSubmit, 
  questionNumber, 
  setQuestionNumber,
  questions,
  setQuestions,
  sessionConfig,
  resumeData
}) {
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Anti-cheat states
  const [warnings, setWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const showWarningRef = useRef(false);

  // MediaPipe & Video states
  const videoRef = useRef(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [lookingAway, setLookingAway] = useState(false);
  const faceLandmarkerRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);

  const currentQuestion = questions[questionNumber - 1] || "";
  const currentAnswer = answers[questionNumber] || "";
  
  // Progress is time-based now
  const progressPercentage = Math.round(((1800 - timeLeft) / 1800) * 100);

  const handleForceSubmit = useCallback((isDisqualified = false) => {
    const allAnswers = questions.map((_, i) => answers[i + 1] || "No answer provided.");
    if (onSubmit) {
      onSubmit(questions, allAnswers, isDisqualified === true);
    }
  }, [answers, onSubmit, questions]);

  const handleViolation = useCallback((message = "You have switched tabs, exited full-screen, or lost focus.") => {
    // Don't trigger if already showing warning
    if (showWarningRef.current) return;
    showWarningRef.current = true;
    
    setWarningMessage(message);
    setWarnings(prev => {
      if (prev >= 2) {
        alert("You have exceeded the maximum number of warnings. The interview will now be automatically submitted.");
        handleForceSubmit(true);
        return 3;
      }
      setShowWarning(true);
      return prev + 1;
    });
  }, [handleForceSubmit]);

  // Anti-cheat event listeners (Browser focus/fullscreen)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation("You switched tabs or minimized the window.");
    };
    const handleBlur = () => {
      // Small delay to allow permissions popups without instantly striking
      setTimeout(() => {
        if (!document.hasFocus()) {
          handleViolation("You clicked outside the interview window or lost focus.");
        }
      }, 500);
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) handleViolation("You exited full-screen mode.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleForceSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleForceSubmit]);

  // Initialize MediaPipe and Camera
  useEffect(() => {
    let isMounted = true;
    const initializeMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
        
        if (!isMounted) {
          landmarker.close();
          return;
        }
        faceLandmarkerRef.current = landmarker;
        setIsModelLoading(false);

        // Start camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera or MediaPipe init failed", err);
        if (isMounted) {
          handleViolation("Camera disconnected, denied, or unavailable.");
        }
      }
    };

    initializeMediaPipe();

    return () => {
      isMounted = false;
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (faceLandmarkerRef.current) faceLandmarkerRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVideoLoad = () => {
    let lastVideoTime = -1;
    let awayFrames = 0; // Require looking away for X frames before triggering warning
    
    const predictWebcam = async () => {
      if (videoRef.current && faceLandmarkerRef.current) {
        let startTimeMs = performance.now();
        if (lastVideoTime !== videoRef.current.currentTime) {
          lastVideoTime = videoRef.current.currentTime;
          
          try {
            const results = faceLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
            
            if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0) {
              const matrix = results.facialTransformationMatrixes[0].data;
              const yaw = Math.atan2(matrix[8], matrix[10]);
              const pitch = Math.atan2(-matrix[9], Math.sqrt(matrix[8] ** 2 + matrix[10] ** 2));
              
              const yawDegrees = (yaw * 180) / Math.PI;
              const pitchDegrees = (pitch * 180) / Math.PI;

              // Threshold for looking away (relaxed to 35 degrees)
              if (Math.abs(yawDegrees) > 35 || Math.abs(pitchDegrees) > 35) {
                awayFrames++;
              } else {
                awayFrames = 0;
              }

              // Running at ~4 FPS, 8 frames = ~2 seconds
              if (awayFrames > 8) { 
                 handleViolation("AI Head Tracking detected you looking away from the screen!");
                 awayFrames = 0; // reset
              }
              setLookingAway(awayFrames > 2);
            } else {
              // No face detected
              awayFrames++;
              if (awayFrames > 12) { // ~3 seconds of no face at 4 FPS
                 handleViolation("AI could not detect your face. Please stay in frame.");
                 awayFrames = 0;
              }
            }
          } catch(e) {
            console.error("Face landmark error:", e);
          }
        }
        // Throttle to ~4 FPS to prevent UI lagging
        setTimeout(() => {
          animationRef.current = requestAnimationFrame(predictWebcam);
        }, 250);
      }
    };
    predictWebcam();
  };


  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleTextareaChange = (e) => {
    const text = e.target.value;
    if (text.length <= 1000) {
      setAnswers({
        ...answers,
        [questionNumber]: text
      });
    }
  };

  const handlePrev = () => {
    if (questionNumber > 1) {
      setQuestionNumber(questionNumber - 1);
    }
  };

  const handleNext = () => {
    if (questionNumber < questions.length) {
      setQuestionNumber(questionNumber + 1);
    }
  };

  const handleSaveAndNext = async () => {
    if (questionNumber < questions.length) {
      handleNext();
      return;
    }

    setIsGenerating(true);
    try {
      const history = questions.map((q, i) => ({
        question: q,
        answer: answers[i + 1] || "No answer provided."
      }));

      const response = await fetch("http://localhost:5000/api/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_data: resumeData,
          history: history,
          target_role: sessionConfig?.target_role,
          interview_type: sessionConfig?.interview_type,
          difficulty: sessionConfig?.difficulty
        })
      });

      if (response.ok) {
        const data = await response.json();
        const nextQ = data.question || "Can you elaborate on your previous answer?";
        setQuestions([...questions, nextQ]);
        setQuestionNumber(questionNumber + 1);
      }
    } catch (err) {
      console.error("Failed to generate next question", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResumeAfterWarning = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {}
    setShowWarning(false);
    setTimeout(() => {
      showWarningRef.current = false;
    }, 1000); // Wait a second before unlocking to prevent rapid firing
  };

  const isLastQuestion = questionNumber === questions.length;

  return (
    <>
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-900/95 backdrop-blur-md">
          <div className="bg-navy-800 border border-danger/50 rounded-2xl shadow-2xl shadow-danger/20 p-8 max-w-lg w-full text-center space-y-6">
            <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-danger" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Proctoring Violation</h2>
              <p className="text-gray-300">
                {warningMessage}
              </p>
            </div>
            <div className="bg-danger/10 border border-danger/20 rounded-xl p-4">
              <p className="text-danger font-bold text-lg">Warning {warnings} of 3</p>
              <p className="text-danger/80 text-sm mt-1">If you receive 3 warnings, the interview will be automatically terminated.</p>
            </div>
            <button
              onClick={handleResumeAfterWarning}
              className="w-full py-3.5 rounded-xl bg-danger text-white font-bold hover:bg-danger/90 transition-colors"
            >
              I Understand, Resume Interview
            </button>
          </div>
        </div>
      )}

      <div className="space-y-8 select-none">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Mock Interview
            </h1>
            <p className="text-gray-400 text-sm mt-1">Interactive mock session designed to hone your interview responses.</p>
          </div>
          
          {/* Live Camera PIP */}
          <div className="relative group">
            <div className={`w-40 h-30 rounded-xl overflow-hidden border-2 transition-colors duration-300 ${lookingAway ? 'border-danger' : 'border-primary/50'}`}>
              {isModelLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-navy-800">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              )}
              <video 
                ref={videoRef}
                onLoadedData={handleVideoLoad}
                autoPlay 
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]" 
              />
            </div>
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white whitespace-nowrap transition-colors ${lookingAway ? 'bg-danger' : 'bg-primary'}`}>
              {lookingAway ? "LOOKING AWAY" : "AI TRACKING"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-6 border border-white/10 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-200">Interview Progress</span>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${timeLeft < 300 ? 'bg-danger/10 text-danger border-danger/20 animate-pulse' : 'bg-primary/10 text-primary border-primary/20'}`}>
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-xs text-gray-400 font-medium bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                    Question {questionNumber} of {questions.length}
                  </span>
                </div>
              </div>
              
              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out ${timeLeft < 300 ? 'bg-danger' : 'bg-gradient-to-r from-primary to-secondary'}`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="glass p-6 border border-white/10 rounded-2xl flex items-start gap-4 select-none">
              <div className="w-2.5 h-2.5 rounded-full bg-success mt-2 flex-shrink-0 animate-pulse" />
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Question {questionNumber}</span>
                <p className="text-white font-medium text-lg mt-1 leading-relaxed">
                  {currentQuestion}
                </p>
              </div>
            </div>

            <div className="glass p-6 border border-white/10 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="answer-input" className="text-sm font-semibold text-gray-200">
                  Your Answer
                </label>
              </div>
              <div className="relative">
                <textarea
                  id="answer-input"
                  className="w-full min-h-[220px] p-4 bg-navy-900/50 border border-white/10 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none transition-all duration-300 resize-y"
                  placeholder="Type your answer here..."
                  value={currentAnswer}
                  onChange={handleTextareaChange}
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                />
                <div className="absolute bottom-4 right-4 text-xs font-medium text-gray-500 bg-navy-900/80 px-2 py-1 rounded border border-white/5">
                  {currentAnswer.length}/1000
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSaveAndNext}
                disabled={isGenerating || (isLastQuestion && !currentAnswer.trim())}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/25 text-white font-semibold transition-all duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isGenerating ? "Analyzing & Generating..." : (isLastQuestion ? "Save Answer & Next Question" : "View Next Question")}
              </button>
              <button
                onClick={handleForceSubmit}
                className="px-6 py-3.5 rounded-xl bg-danger/20 hover:bg-danger/30 text-danger border border-danger/30 font-semibold transition-all duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-danger/50"
              >
                End Interview Early
              </button>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="glass p-6 border border-primary/20 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Info className="w-5 h-5" />
                <h3 className="font-semibold text-white">Interview Tips</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-sm text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>The timer will strictly end the interview at 30 minutes.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-danger font-medium">Do not exit fullscreen, switch tabs, or look away from the camera.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>Copy and pasting is strictly disabled.</span>
                </li>
              </ul>
            </div>
            
            {/* Proctoring Status Card */}
            <div className="glass p-6 border border-danger/20 rounded-2xl space-y-4 bg-danger/5">
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-semibold">Proctoring Active</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Warnings</span>
                  <span className="text-danger font-bold">{warnings} / 3</span>
                </div>
                <div className="w-full h-1.5 bg-danger/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-danger rounded-full transition-all duration-300"
                    style={{ width: `${(warnings / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={questionNumber === 1}
            className="flex items-center gap-2 px-5 py-2.5 border border-primary/30 hover:border-primary disabled:opacity-30 disabled:pointer-events-none rounded-xl bg-white/5 hover:bg-primary/10 text-gray-300 hover:text-white text-sm font-semibold transition-all duration-300 focus:outline-none"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={isLastQuestion}
            className="flex items-center gap-2 px-5 py-2.5 border border-primary/30 hover:border-primary disabled:opacity-30 disabled:pointer-events-none rounded-xl bg-white/5 hover:bg-primary/10 text-gray-300 hover:text-white text-sm font-semibold transition-all duration-300 focus:outline-none"
          >
            Next Question
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
