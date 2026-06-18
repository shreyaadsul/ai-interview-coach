import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  AlertTriangle,
  Mic,
  Send,
  SkipForward,
  XCircle,
} from 'lucide-react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import AIAvatar from './AIAvatar';

// ─── Utility ──────────────────────────────────────────────────────────────────
const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

const STAGES = ['Introduction', 'Resume', 'Project', 'Technical', 'HR', 'Follow-Up'];

function getCurrentStage(qNum) {
  if (qNum <= 2) return 'Introduction';
  if (qNum <= 5) return 'Resume';
  if (qNum <= 9) return 'Project';
  if (qNum <= 14) return 'Technical';
  if (qNum <= 17) return 'HR';
  return 'Follow-Up';
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MockInterviewPage({
  onSubmit,
  questionNumber,
  setQuestionNumber,
  questions,
  setQuestions,
  sessionConfig,
  resumeData,
}) {
  const [answers, setAnswers] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const totalQuestions = 20;

  // Anti-cheat
  const [warnings, setWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const showWarningRef = useRef(false);
  const isSubmittingRef = useRef(false);

  // Object detection
  const detectorRef = useRef(null);
  const phoneVisibleRef = useRef(false);
  const phoneFirstSeenTimeRef = useRef(null);
  const warningLevel2TriggeredRef = useRef(false);
  const phoneLastSeenTimeRef = useRef(0);

  // MediaPipe
  const videoRef = useRef(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [lookingAway, setLookingAway] = useState(false);
  const faceLandmarkerRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);

  // Derived
  const currentQuestion = questions[questionNumber - 1] || '';
  const currentAnswer = answers[questionNumber] || '';
  const currentStage = getCurrentStage(questionNumber);
  const progressPercentage = Math.round((questionNumber / totalQuestions) * 100);
  const isLastQuestion = questionNumber === totalQuestions;

  // AI interviewer state machine
  const [interviewerState, setInterviewerState] = useState('Idle');

  useEffect(() => {
    if (isGenerating) {
      setInterviewerState('Idle');
      return;
    }
    if (currentQuestion) {
      setInterviewerState('Speaking');
      const timer = setTimeout(() => setInterviewerState('Listening'), 6000);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, isGenerating]);

  // ─── Force submit ────────────────────────────────────────────────────────────
  const handleForceSubmit = useCallback(
    (isDisqualified = false) => {
      isSubmittingRef.current = true;
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch (_) {}
      const allAnswers = questions.map((_, i) => answers[i + 1] || 'No answer provided.');
      if (onSubmit) onSubmit(questions, allAnswers, isDisqualified === true);
    },
    [answers, onSubmit, questions]
  );

  // ─── Violation handler ───────────────────────────────────────────────────────
  const handleViolation = useCallback(
    (message = 'You have switched tabs, exited full-screen, or lost focus.') => {
      if (showWarningRef.current) return;
      showWarningRef.current = true;
      setWarningMessage(message);
      setWarnings((prev) => {
        if (prev >= 2) {
          alert('You have exceeded the maximum number of warnings. The interview will now be automatically submitted.');
          handleForceSubmit(true);
          return 3;
        }
        setShowWarning(true);
        return prev + 1;
      });
    },
    [handleForceSubmit]
  );

  // ─── Anti-cheat event listeners ──────────────────────────────────────────────
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && !isSubmittingRef.current)
        handleViolation('You switched tabs or minimized the window.');
    };
    const onBlur = () => {
      setTimeout(() => {
        if (!document.hasFocus() && !isSubmittingRef.current)
          handleViolation('You clicked outside the interview window.');
      }, 500);
    };
    const onFullscreen = () => {
      if (!document.fullscreenElement && !isSubmittingRef.current)
        handleViolation('You exited full-screen mode.');
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreen);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── MediaPipe init ───────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true,
          runningMode: 'VIDEO',
          numFaces: 1,
        });
        if (!isMounted) { landmarker.close(); return; }
        faceLandmarkerRef.current = landmarker;

        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd');
        const detector = await window.cocoSsd.load();
        if (!isMounted) return;
        detectorRef.current = detector;
        setIsModelLoading(false);

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!isMounted) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Camera / proctoring init failed', err);
        if (isMounted) handleViolation('Camera disconnected or unavailable.');
      }
    };
    init();
    return () => {
      isMounted = false;
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (faceLandmarkerRef.current) faceLandmarkerRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detectObjects = async () => {
    if (!videoRef.current || !detectorRef.current || showWarningRef.current) return;
    try {
      const predictions = await detectorRef.current.detect(videoRef.current);
      const phone = predictions.find((p) => p.class === 'cell phone' && p.score > 0.5);
      if (phone) {
        const now = Date.now();
        if (!phoneVisibleRef.current) {
          phoneVisibleRef.current = true;
          phoneFirstSeenTimeRef.current = now;
          warningLevel2TriggeredRef.current = false;
          handleViolation('Prohibited object detected: Mobile phone usage is strictly forbidden!');
        } else {
          const dur = now - phoneFirstSeenTimeRef.current;
          if (dur > 3000 && !warningLevel2TriggeredRef.current) {
            warningLevel2TriggeredRef.current = true;
            handleViolation('Phone visible for more than 3 seconds! Put it away immediately.');
          }
        }
        phoneLastSeenTimeRef.current = now;
      } else {
        if (phoneVisibleRef.current) {
          phoneVisibleRef.current = false;
          phoneLastSeenTimeRef.current = Date.now();
        }
      }
    } catch (err) {
      console.error('Object detection error:', err);
    }
  };

  const handleVideoLoad = () => {
    let lastVideoTime = -1;
    let awayFrames = 0;
    let lastObjTime = 0;
    const predict = async () => {
      if (videoRef.current && faceLandmarkerRef.current) {
        const t = performance.now();
        if (lastVideoTime !== videoRef.current.currentTime) {
          lastVideoTime = videoRef.current.currentTime;
          try {
            const res = faceLandmarkerRef.current.detectForVideo(videoRef.current, t);
            if (res.facialTransformationMatrixes?.length > 0) {
              const m = res.facialTransformationMatrixes[0].data;
              const yaw = (Math.atan2(m[8], m[10]) * 180) / Math.PI;
              const pitch = (Math.atan2(-m[9], Math.sqrt(m[8] ** 2 + m[10] ** 2)) * 180) / Math.PI;
              if (Math.abs(yaw) > 35 || Math.abs(pitch) > 35) awayFrames++;
              else awayFrames = 0;
              if (awayFrames > 8) { handleViolation('AI detected you looking away from the screen!'); awayFrames = 0; }
              setLookingAway(awayFrames > 2);
            } else {
              awayFrames++;
              if (awayFrames > 12) { handleViolation('AI could not detect your face. Please stay in frame.'); awayFrames = 0; }
            }
          } catch (e) { console.error('Face landmark error:', e); }
        }
        const now = Date.now();
        if (now - lastObjTime > 500) { lastObjTime = now; await detectObjects(); }
        setTimeout(() => { animationRef.current = requestAnimationFrame(predict); }, 250);
      }
    };
    predict();
  };

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleTextareaChange = (e) => {
    if (e.target.value.length <= 1000)
      setAnswers({ ...answers, [questionNumber]: e.target.value });
  };

  const handlePrev = () => { if (questionNumber > 1) setQuestionNumber(questionNumber - 1); };
  const handleNext = () => {
    const a = answers[questionNumber];
    if (!a?.trim()) { alert('Please answer the question before proceeding.'); return; }
    if (questionNumber < questions.length) setQuestionNumber(questionNumber + 1);
  };

  const generateNextQuestion = async (updatedAnswers) => {
    setIsGenerating(true);
    try {
      const history = questions.map((q, i) => ({ question: q, answer: updatedAnswers[i + 1] || 'No answer provided.' }));
      const res = await fetch('http://localhost:5000/api/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_data: resumeData,
          history,
          target_role: sessionConfig?.target_role,
          interview_type: sessionConfig?.interview_type,
          difficulty: sessionConfig?.difficulty,
          stage: getCurrentStage(questionNumber + 1),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions([...questions, data.question || 'Can you elaborate on your previous answer?']);
        setQuestionNumber(questionNumber + 1);
      }
    } catch (err) { console.error('Failed to generate next question', err); }
    finally { setIsGenerating(false); }
  };

  const handleSaveAndNext = async () => {
    const a = answers[questionNumber];
    if (!a?.trim()) { alert('Please answer the question before proceeding.'); return; }
    if (questionNumber < questions.length) { setQuestionNumber(questionNumber + 1); return; }
    if (isLastQuestion) { handleForceSubmit(); return; }
    await generateNextQuestion(answers);
  };

  const handleSkipQuestion = async () => {
    const updated = { ...answers, [questionNumber]: 'skipped' };
    setAnswers(updated);
    if (questionNumber < questions.length) { setQuestionNumber(questionNumber + 1); return; }
    if (isLastQuestion) {
      isSubmittingRef.current = true;
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch (_) {}
      const allAnswers = questions.map((_, i) => updated[i + 1] || 'No answer provided.');
      if (onSubmit) onSubmit(questions, allAnswers, false);
      return;
    }
    await generateNextQuestion(updated);
  };

  const handleResumeAfterWarning = async () => {
    try { if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); } catch (_) {}
    setShowWarning(false);
    setTimeout(() => { showWarningRef.current = false; }, 1000);
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Proctoring Warning Modal ── */}
      {showWarning && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
          background: 'rgba(10,12,28,0.96)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: 20,
            boxShadow: '0 25px 60px rgba(239,68,68,0.15)',
            padding: 36,
            maxWidth: 480,
            width: '100%',
            textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <AlertTriangle size={28} color="#ef4444" />
            </div>
            <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>Proctoring Violation</h2>
            <p style={{ color: '#94a3b8', marginBottom: 20 }}>{warningMessage}</p>
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12, padding: '14px 20px', marginBottom: 24,
            }}>
              <p style={{ color: '#f87171', fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>
                Warning {warnings} of 3
              </p>
              <p style={{ color: 'rgba(248,113,113,0.75)', fontSize: '0.8rem' }}>
                3 warnings will automatically terminate your interview.
              </p>
            </div>
            <button
              onClick={handleResumeAfterWarning}
              style={{
                width: '100%', padding: '14px 0',
                borderRadius: 12, border: 'none',
                background: '#ef4444', color: '#fff',
                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              }}
            >
              I Understand — Resume Interview
            </button>
          </div>
        </div>
      )}

      {/* ── Page Root ── */}
      <div className="select-none" style={{ minHeight: '100vh' }}>

        {/* ── Page Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Mock Interview
            </h1>
            <p className="text-gray-400 text-sm mt-1">AI-proctored session — stay focused and answer each question clearly.</p>
          </div>

          {/* Camera PIP */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 144, height: 108, borderRadius: 12, overflow: 'hidden',
              border: `2px solid ${lookingAway ? '#ef4444' : 'rgba(124,58,237,0.5)'}`,
              background: '#0f172a',
              transition: 'border-color 0.3s',
            }}>
              {isModelLoading && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#0f172a',
                }}>
                  <Loader2 size={20} color="#7c3aed" className="animate-spin" />
                </div>
              )}
              <video
                ref={videoRef}
                onLoadedData={handleVideoLoad}
                autoPlay playsInline muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
              />
            </div>
            <div style={{
              position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)',
              padding: '2px 10px', borderRadius: 999,
              background: lookingAway ? '#ef4444' : '#7c3aed',
              fontSize: 9, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap',
              transition: 'background 0.3s',
            }}>
              {lookingAway ? '⚠ LOOKING AWAY' : '● AI TRACKING'}
            </div>
          </div>
        </div>

        {/* ── Main 65/35 Layout ── */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* ════════════════════════════════════════
              LEFT — 65% — Interview Content
          ════════════════════════════════════════ */}
          <div style={{ flex: '0 0 65%', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Progress Card */}
            <div className="glass border border-white/10 rounded-2xl p-6 space-y-4">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.875rem' }}>Interview Progress</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600,
                    background: 'rgba(124,58,237,0.1)', color: '#a78bfa',
                    border: '1px solid rgba(124,58,237,0.25)', borderRadius: 6, padding: '3px 10px',
                  }}>
                    ~15–20 mins
                  </span>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600,
                    background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 10px',
                  }}>
                    Q {questionNumber} / {totalQuestions}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{
                width: '100%', height: 8, borderRadius: 999,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${progressPercentage}%`,
                  borderRadius: 999,
                  background: 'linear-gradient(to right, #7c3aed, #6366f1)',
                  transition: 'width 0.5s ease-out',
                }} />
              </div>

              {/* Stage Pills */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STAGES.map((stage, idx) => {
                  const stageIdx = STAGES.indexOf(currentStage);
                  const isActive = stage === currentStage;
                  const isPast = idx < stageIdx;
                  return (
                    <span
                      key={stage}
                      style={{
                        padding: '5px 12px', borderRadius: 8,
                        fontSize: '0.7rem', fontWeight: 700,
                        whiteSpace: 'nowrap',
                        border: `1px solid ${isActive ? 'rgba(124,58,237,0.35)' : isPast ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.06)'}`,
                        background: isActive ? 'rgba(124,58,237,0.18)' : isPast ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                        color: isActive ? '#a78bfa' : isPast ? '#4ade80' : '#64748b',
                      }}
                    >
                      {isPast ? '✓ ' : ''}{stage}{isActive ? ' ◉' : ''}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Question Card */}
            <div className="glass border border-white/10 rounded-2xl p-6" style={{ display: 'flex', gap: 14 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: '#22c55e', flexShrink: 0, marginTop: 6,
                boxShadow: '0 0 10px #22c55e',
                animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
              }} />
              <div>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700,
                  color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  Question {questionNumber} · {currentStage}
                </span>
                <p style={{ color: '#fff', fontWeight: 500, fontSize: '1.1rem', marginTop: 6, lineHeight: 1.65 }}>
                  {currentQuestion || 'Loading question…'}
                </p>
              </div>
            </div>

            {/* Answer Card */}
            <div className="glass border border-white/10 rounded-2xl p-6 space-y-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="answer-input" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>
                  Your Answer
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: '#64748b' }}>
                  <Mic size={12} />
                  <span>Type your response below</span>
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <textarea
                  id="answer-input"
                  style={{
                    width: '100%', minHeight: 200,
                    padding: '14px 16px',
                    background: 'rgba(15,23,42,0.5)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    color: '#fff', fontSize: '0.875rem',
                    resize: 'vertical', outline: 'none',
                    fontFamily: 'inherit', lineHeight: 1.6,
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  placeholder="Type your answer here... Be specific, use examples, and show your thought process."
                  value={currentAnswer}
                  onChange={handleTextareaChange}
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                />
                <div style={{
                  position: 'absolute', bottom: 10, right: 12,
                  fontSize: '0.7rem', fontWeight: 600,
                  color: currentAnswer.length > 900 ? '#f59e0b' : '#475569',
                  background: 'rgba(15,23,42,0.9)', padding: '2px 8px', borderRadius: 6,
                }}>
                  {currentAnswer.length}/1000
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleSaveAndNext}
                disabled={isGenerating}
                style={{
                  flex: 1, padding: '13px 0',
                  borderRadius: 12, border: 'none',
                  background: isGenerating ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #6366f1)',
                  color: '#fff', fontWeight: 700, fontSize: '0.875rem',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: isGenerating ? 'none' : '0 4px 20px rgba(124,58,237,0.3)',
                  transition: 'all 0.2s',
                  opacity: isGenerating ? 0.6 : 1,
                }}
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                {isGenerating
                  ? 'Analyzing & Generating...'
                  : isLastQuestion
                  ? 'Submit Interview'
                  : 'Save & Next Question'}
              </button>

              <button
                onClick={handleSkipQuestion}
                disabled={isGenerating}
                style={{
                  padding: '13px 20px', borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#94a3b8', fontWeight: 600, fontSize: '0.875rem',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7,
                  transition: 'all 0.2s',
                }}
              >
                <SkipForward size={15} />
                Skip
              </button>

              <button
                onClick={handleForceSubmit}
                style={{
                  padding: '13px 18px', borderRadius: 12,
                  border: '1px solid rgba(239,68,68,0.25)',
                  background: 'rgba(239,68,68,0.08)',
                  color: '#f87171', fontWeight: 600, fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7,
                  transition: 'all 0.2s',
                }}
              >
                <XCircle size={15} />
                End Early
              </button>
            </div>

            {/* Nav Row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              <button
                onClick={handlePrev}
                disabled={questionNumber === 1}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', borderRadius: 10,
                  border: '1px solid rgba(124,58,237,0.3)',
                  background: 'rgba(255,255,255,0.03)',
                  color: questionNumber === 1 ? '#334155' : '#94a3b8',
                  fontWeight: 600, fontSize: '0.8rem', cursor: questionNumber === 1 ? 'not-allowed' : 'pointer',
                  opacity: questionNumber === 1 ? 0.4 : 1,
                }}
              >
                <ChevronLeft size={15} /> Previous
              </button>
              <button
                onClick={handleNext}
                disabled={isLastQuestion}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', borderRadius: 10,
                  border: '1px solid rgba(124,58,237,0.3)',
                  background: 'rgba(255,255,255,0.03)',
                  color: isLastQuestion ? '#334155' : '#94a3b8',
                  fontWeight: 600, fontSize: '0.8rem', cursor: isLastQuestion ? 'not-allowed' : 'pointer',
                  opacity: isLastQuestion ? 0.4 : 1,
                }}
              >
                Next Question <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* ════════════════════════════════════════
              RIGHT — 35% — AI Interviewer Panel
          ════════════════════════════════════════ */}
          <div style={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── AI Interviewer 3D Viewport ── */}
            <div style={{
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid rgba(124,58,237,0.25)',
              background: 'linear-gradient(145deg, #070c1f, #0d1530)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
              position: 'relative',
            }}>
              {/* Card Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.03)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Animated interviewer avatar icon */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                    boxShadow: '0 0 12px rgba(124,58,237,0.4)',
                  }}>
                    🤵
                  </div>
                  <div>
                    <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.875rem', lineHeight: 1 }}>
                      AI Interviewer
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.65rem', marginTop: 2 }}>
                      {sessionConfig?.target_role || 'HR Professional'}
                    </p>
                  </div>
                </div>

                {/* State badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', borderRadius: 999,
                  background: interviewerState === 'Speaking'
                    ? 'rgba(34,197,94,0.12)'
                    : interviewerState === 'Listening'
                    ? 'rgba(168,85,247,0.12)'
                    : 'rgba(59,130,246,0.12)',
                  border: `1px solid ${
                    interviewerState === 'Speaking'
                      ? 'rgba(34,197,94,0.3)'
                      : interviewerState === 'Listening'
                      ? 'rgba(168,85,247,0.3)'
                      : 'rgba(59,130,246,0.3)'
                  }`,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: interviewerState === 'Speaking' ? '#22c55e' : interviewerState === 'Listening' ? '#a855f7' : '#3b82f6',
                    boxShadow: `0 0 6px ${interviewerState === 'Speaking' ? '#22c55e' : interviewerState === 'Listening' ? '#a855f7' : '#3b82f6'}`,
                    display: 'inline-block',
                  }} />
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: interviewerState === 'Speaking' ? '#4ade80' : interviewerState === 'Listening' ? '#c084fc' : '#60a5fa',
                  }}>
                    {interviewerState}
                  </span>
                </div>
              </div>

              {/* 3D Canvas — tall viewport */}
              <div style={{ height: 480, position: 'relative' }}>
                {/* Subtle gradient overlay at bottom to blend into next card */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
                  background: 'linear-gradient(to bottom, transparent, rgba(7,12,31,0.7))',
                  zIndex: 2, pointerEvents: 'none',
                }} />
                <AIAvatar aiState={interviewerState} />
              </div>
            </div>

            {/* ── Interview Tips ── */}
            <div className="glass border border-white/10 rounded-2xl p-5 space-y-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Info size={16} color="#7c3aed" />
                <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.875rem' }}>Interview Tips</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  '20 questions across 6 structured stages.',
                  'Do not switch tabs, exit fullscreen, or look away.',
                  'Copy & paste is strictly disabled.',
                  'Use STAR method: Situation → Task → Action → Result.',
                ].map((tip, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#7c3aed',
                      flexShrink: 0, marginTop: 6,
                    }} />
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.5 }}>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Proctoring Status ── */}
            <div style={{
              padding: '16px 20px', borderRadius: 16,
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.18)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <AlertTriangle size={16} color="#f87171" />
                <span style={{ color: '#f87171', fontWeight: 700, fontSize: '0.875rem' }}>Proctoring Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem' }}>
                <span style={{ color: '#64748b' }}>Warnings</span>
                <span style={{ color: '#f87171', fontWeight: 700 }}>{warnings} / 3</span>
              </div>
              <div style={{
                height: 5, borderRadius: 999,
                background: 'rgba(239,68,68,0.12)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 999,
                  background: '#ef4444',
                  width: `${(warnings / 3) * 100}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
