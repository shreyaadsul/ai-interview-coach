import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import AIAvatar from './AIAvatar';

// ─── Text Cleanup Utility ─────────────────────────────────────────────────────
const cleanText = (text) => {
  if (!text) return "";
  
  let cleaned = text;

  // Dictionary for speech recognition typos and corrections
  const corrections = {
    "artilicial": "artificial",
    "innelligencc": "intelligence",
    "innelligenct": "intelligent",
    "specfcially": "specifically",
    "roleeas": "roles",
    "seemssthere": "seems there",
    "wws": "was",
    "misuuderstandiig": "misunderstanding",
    "misuuderstanding": "misunderstanding",
    "dont": "don't",
    "cant": "can't",
    "im": "I'm",
    "ive": "I've",
    "id": "I'd",
    "youre": "you're",
    "theyre": "they're",
    "weve": "we've",
    "its": "it's"
  };

  // Apply dictionary corrections (case insensitive)
  Object.keys(corrections).forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(regex, corrections[word]);
  });

  // Collapse trailing STT anomalies safely
  cleaned = cleaned.replace(/cc\b/gi, 'ce');
  cleaned = cleaned.replace(/ii\b/gi, 'y');

  // Collapse double letters that are never duplicated in correct English words
  cleaned = cleaned.replace(/([hjqvxys])\1+/gi, '$1');

  // Collapse triple letters (e.g. 'treee' -> 'tree')
  cleaned = cleaned.replace(/([a-z])\1{2,}/gi, '$1$1');

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Collapse duplicate punctuation
  cleaned = cleaned.replace(/([.,!?])\1+/g, '$1');

  // Spacing around punctuation
  cleaned = cleaned.replace(/\s+([.,!?])/g, '$1');
  cleaned = cleaned.replace(/([.,!?])([A-Za-z0-9])/g, '$1 $2');

  // Sentence capitalization
  cleaned = cleaned.replace(/(^\s*|[.!?]\s+)([a-z])/g, (match, separator, char) => separator + char.toUpperCase());

  // Collapse consecutive duplicate words
  cleaned = cleaned.replace(/\b(\w+)\s+\1\b/gi, '$1');

  return cleaned.trim();
};

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

// Module-level global variables removed in favor of React state-based storage

// ─── AIAvatar Error Boundary ─────────────────────────────────────────────────
class AIAvatarErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('[AIAvatarErrorBoundary] Caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10, 12, 28, 0.95)',
          color: '#fff',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          gap: '12px',
          zIndex: 10
        }}>
          <span style={{ fontSize: '2.5rem' }}>⚠️</span>
          <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            Unable to load AI Interviewer
          </p>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: '320px' }}>
            {this.state.error?.message || 'WebGL context lost or Three.js runtime error'}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
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

  // Elapsed Timer state
  const [elapsedTime, setElapsedTime] = useState(0);

  // Anti-cheat / Proctoring states
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

  // Speech and Conversational States
  const [interviewerState, setInterviewerState] = useState('Idle'); // 'Idle', 'Speaking', 'Listening', 'Analyzing'
  const [typedText, setTypedText] = useState('');
  const [candidateSpeechText, setCandidateSpeechText] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const [ttsStatus, setTtsStatus] = useState(null);

  const typewriterTimer = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const selectedVoiceRef = useRef(null);
  const activeQuestionRef = useRef(null);

  // State-based voice selection
  const [voice, setVoice] = useState(null);
  const voiceReady = !!voice;

  // Derived values
  const currentQuestion = questions[questionNumber - 1] || '';
  const currentStage = getCurrentStage(questionNumber);
  const isLastQuestion = questionNumber === totalQuestions;

  // ─── Timer implementation ───────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // Set up listeners to load and lock voices as early as possible (storing in component state)
  useEffect(() => {
    console.log("MockInterviewPage Mounted");

    const selectAndLockVoice = () => {
      // If voice is already stored in state, do not re-select
      if (selectedVoiceRef.current) return;

      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Ordered selection priority with preferences for female English, en-US, en-IN
      const voicePriority = [
        'microsoft aria',
        'microsoft zira',
        'google uk english female',
        'google us english female',
        'female',
        'samantha',
        'heera',
        'veena',
        'hazel',
        'susan',
        'tessa',
        'fiona',
        'moira',
        'karen',
        'victoria'
      ];

      const englishVoices = voices.filter(v => v.lang.startsWith('en') || v.lang.includes('en-'));
      let foundVoice = null;
      
      // Try to find preferred en-US or en-IN female voice first
      const targetLangs = ['en-US', 'en-IN'];
      for (const lang of targetLangs) {
        const langVoices = englishVoices.filter(v => v.lang.toLowerCase().includes(lang.toLowerCase()));
        for (const priority of voicePriority) {
          foundVoice = langVoices.find(v => v.name.toLowerCase().includes(priority));
          if (foundVoice) break;
        }
        if (foundVoice) break;
      }

      // Fallback 1: Any general English female voice matching the priorities list
      if (!foundVoice) {
        for (const priority of voicePriority) {
          foundVoice = englishVoices.find(v => v.name.toLowerCase().includes(priority));
          if (foundVoice) break;
        }
      }

      // Fallback 2: Any voice containing "female"
      if (!foundVoice) {
        foundVoice = voices.find(v => v.name.toLowerCase().includes('female'));
      }

      // Fallback 3: First available English voice
      if (!foundVoice && englishVoices.length > 0) {
        foundVoice = englishVoices[0];
      }

      // Final Fallback: First voice
      if (!foundVoice) {
        foundVoice = voices[0];
      }

      if (foundVoice) {
        selectedVoiceRef.current = foundVoice;
        setVoice(foundVoice);
        console.log("Selected Voice:", foundVoice.name);
      }
    };

    selectAndLockVoice();

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', selectAndLockVoice);
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.removeEventListener('voiceschanged', selectAndLockVoice);
      }
    };
  }, []);

  useEffect(() => {
    console.log("Interview State:", interviewerState);
  }, [interviewerState]);

  // ─── Text-to-Speech (TTS) Engine ─────────────────────────────────────────────
  const speakQuestion = (text, onEndCallback) => {
    // Set active question text BEFORE calling cancel() to avoid synchronous race conditions
    activeQuestionRef.current = text;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Use the exact same locked voice stored in state
    const voiceToUse = voice;
    if (voiceToUse) {
      utterance.voice = voiceToUse;
    } else {
      console.warn('[TTS] No female voice loaded yet. Fallback check.');
    }
    
    utterance.onstart = () => {
      setTtsStatus(null);
    };

    utterance.onend = () => {
      if (activeQuestionRef.current === text) {
        if (onEndCallback) onEndCallback();
      }
    };
    
    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || activeQuestionRef.current !== text) {
        return;
      }
      console.error('[TTS] Speech synthesis error:', e);
      setTtsStatus("Voice generation unavailable.");
      if (onEndCallback) onEndCallback();
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // ─── Typewriter and Speech orchestration ──────────────────────────────────────
  useEffect(() => {
    if (!currentQuestion || !voiceReady) return;

    console.log("QUESTION RECEIVED BY TYPEWRITER:", currentQuestion);

    // Use the ORIGINAL generated question text directly (never clean/modify LLM output)
    const originalQuestion = currentQuestion.trim();

    setTypedText('');
    setCandidateSpeechText('');
    stopSpeechRecognition();
    
    if (typewriterTimer.current) clearInterval(typewriterTimer.current);

    // Enter Speaking State
    setInterviewerState('Speaking');

    // Start typewriter effect - reveals characters sequentially
    let idx = 0;
    typewriterTimer.current = setInterval(() => {
      setTypedText((prev) => prev + originalQuestion.charAt(idx));
      idx++;
      if (idx >= originalQuestion.length) {
        clearInterval(typewriterTimer.current);
      }
    }, 30);

    // Speak identical question, transition to listening after speaking is done
    speakQuestion(originalQuestion, () => {
      setInterviewerState('Listening');
      startSpeechRecognition();
    });

    return () => {
      if (typewriterTimer.current) clearInterval(typewriterTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, voiceReady]);

  // ─── Speech-to-Text (STT) Engine ─────────────────────────────────────────────
  function startSpeechRecognition() {
    stopSpeechRecognition();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[STT] Speech recognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onstart = () => {
      console.log('[STT] Candidate microphone listening active.');
      setIsMicActive(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      const currentFullText = finalTranscript + interimTranscript;
      setCandidateSpeechText(currentFullText);

      // Silence Detection: Auto submit after 4 seconds of silence
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(() => {
        console.log('[STT] Silence threshold reached. Automatically saving response.');
        handleSpeechSubmit(currentFullText);
      }, 4000);
    };

    recognition.onerror = (e) => {
      console.error('[STT] Speech recognition error encountered:', e.error);
    };

    recognition.onend = () => {
      console.log('[STT] Candidate microphone listening deactivated.');
      setIsMicActive(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  function stopSpeechRecognition() {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Already stopped
      }
    }
  };

  async function handleSpeechSubmit(text) {
    // Apply cleaning filter on candidate STT output before storing
    const finalAnswer = cleanText(text) || 'No answer provided.';
    const updatedAnswers = { ...answers, [questionNumber]: finalAnswer };
    setAnswers(updatedAnswers);
    
    stopSpeechRecognition();
    setInterviewerState('Analyzing');

    if (isLastQuestion) {
      handleForceSubmit();
    } else {
      await generateNextQuestion(updatedAnswers);
    }
  };

  async function generateNextQuestion(updatedAnswers) {
    setIsGenerating(true);
    try {
      const history = questions.map((q, i) => ({
        question: q,
        answer: updatedAnswers[i + 1] || 'No answer provided.',
      }));
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
        console.log("QUESTION BEFORE STORAGE:", data.question);
        setQuestions([...questions, data.question || 'Can you elaborate on your previous answer?']);
        setQuestionNumber(questionNumber + 1);
      }
    } catch (err) {
      console.error('Failed to generate next question', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeQuestionRef.current = null;
      stopSpeechRecognition();
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Force submit ────────────────────────────────────────────────────────────
  const handleForceSubmit = useCallback(
    (isDisqualified = false) => {
      isSubmittingRef.current = true;
      stopSpeechRecognition();
      window.speechSynthesis.cancel();
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
      <div className="select-none" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── Page Header ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          padding: '16px 24px',
          background: 'rgba(15, 23, 42, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 16,
          backdropFilter: 'blur(8px)'
        }}>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span style={{ color: '#8B5CF6' }}>✦</span> AI Interview Room
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* Dynamic Question Counter */}
            <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>
              Question <span style={{ color: '#fff' }}>{questionNumber}</span> of <span style={{ color: '#fff' }}>{totalQuestions}</span>
            </div>

            {/* Dynamic Timer */}
            <div style={{
              color: '#8B5CF6',
              fontSize: '0.875rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              padding: '4px 12px',
              borderRadius: 8
            }}>
              ⏱ {formatTime(elapsedTime)}
            </div>

            {/* End Interview Button */}
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to end the interview early? Your responses will be evaluated up to this point.")) {
                  handleForceSubmit();
                }
              }}
              style={{
                background: 'transparent',
                border: '1px solid #ef4444',
                color: '#ef4444',
                padding: '6px 16px',
                borderRadius: 8,
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.1)'; }}
              onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
            >
              End Interview
            </button>
          </div>
        </div>

        {/* ── Main 50/50 split room layout ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          alignItems: 'stretch',
          marginBottom: 24,
          minHeight: 560
        }}>
          {/* LEFT SIDE: AI Interviewer Panel */}
          <div style={{
            borderRadius: 24,
            overflow: 'hidden',
            border: interviewerState === 'Speaking'
              ? '2px solid rgba(139, 92, 246, 0.5)' // Purple glow when speaking
              : interviewerState === 'Listening'
              ? '2px solid rgba(34, 197, 94, 0.4)' // Green border when listening
              : '2px solid rgba(59, 130, 246, 0.4)', // Blue border when analyzing
            boxShadow: interviewerState === 'Speaking'
              ? '0 0 25px rgba(139, 92, 246, 0.15)'
              : interviewerState === 'Listening'
              ? '0 0 25px rgba(34, 197, 94, 0.1)'
              : '0 0 25px rgba(59, 130, 246, 0.1)',
            background: 'linear-gradient(145deg, #070c1f, #0d1530)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            transition: 'all 0.5s ease'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>● AI Interviewer</span>
              {/* Dynamic Status Badge */}
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '4px 10px',
                borderRadius: 999,
                background: interviewerState === 'Speaking'
                  ? 'rgba(139, 92, 246, 0.15)'
                  : interviewerState === 'Listening'
                  ? 'rgba(34, 197, 94, 0.15)'
                  : 'rgba(59, 130, 246, 0.15)',
                color: interviewerState === 'Speaking'
                  ? '#a855f7'
                  : interviewerState === 'Listening'
                  ? '#4ade80'
                  : '#60a5fa',
                border: interviewerState === 'Speaking'
                  ? '1px solid rgba(139, 92, 246, 0.3)'
                  : interviewerState === 'Listening'
                  ? '1px solid rgba(34, 197, 94, 0.3)'
                  : '1px solid rgba(59, 130, 246, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: interviewerState === 'Speaking' ? '#a855f7' : interviewerState === 'Listening' ? '#22c55e' : '#3b82f6',
                  boxShadow: `0 0 6px ${interviewerState === 'Speaking' ? '#a855f7' : interviewerState === 'Listening' ? '#22c55e' : '#3b82f6'}`,
                  animation: 'pulse 1.5s infinite'
                }} />
                {interviewerState.toUpperCase()}
              </span>
            </div>

            {/* 3D Model Canvas area */}
            <div style={{ flex: 1, position: 'relative', minHeight: 480 }}>
              <AIAvatarErrorBoundary>
                <AIAvatar aiState={interviewerState} />
              </AIAvatarErrorBoundary>
              
              {/* Speaking Waveform */}
              {interviewerState === 'Speaking' && (
                <div style={{
                  position: 'absolute',
                  bottom: 20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  background: 'rgba(15, 23, 42, 0.65)',
                  padding: '8px 16px',
                  borderRadius: 999,
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  zIndex: 2
                }}>
                  <div className="wave-bar" style={{ animationDelay: '0.1s' }} />
                  <div className="wave-bar" style={{ animationDelay: '0.3s' }} />
                  <div className="wave-bar" style={{ animationDelay: '0.5s' }} />
                  <div className="wave-bar" style={{ animationDelay: '0.2s' }} />
                  <div className="wave-bar" style={{ animationDelay: '0.4s' }} />
                  
                  <style>{`
                    .wave-bar {
                      width: 3px;
                      height: 15px;
                      background-color: #a855f7;
                      border-radius: 999px;
                      animation: wave 1.2s ease-in-out infinite alternate;
                    }
                    @keyframes wave {
                      0% { height: 4px; }
                      100% { height: 24px; }
                    }
                  `}</style>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Candidate Webcam Panel */}
          <div style={{
            borderRadius: 24,
            overflow: 'hidden',
            border: isMicActive
              ? '2px solid rgba(34, 197, 94, 0.5)' // Green glow when mic active
              : '2px solid rgba(255, 255, 255, 0.05)',
            boxShadow: isMicActive
              ? '0 0 25px rgba(34, 197, 94, 0.15)'
              : 'none',
            background: 'linear-gradient(145deg, #070c1f, #0d1530)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            transition: 'all 0.5s ease'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>● Your Camera</span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '4px 10px',
                borderRadius: 999,
                background: isMicActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: isMicActive ? '#4ade80' : '#64748b',
                border: isMicActive ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: isMicActive ? '#22c55e' : '#64748b',
                  boxShadow: isMicActive ? '0 0 6px #22c55e' : 'none'
                }} />
                {isMicActive ? 'LISTENING' : 'MUTED'}
              </span>
            </div>

            {/* Webcam Video area */}
            <div style={{ flex: 1, position: 'relative', minHeight: 480, background: '#020617' }}>
              {isModelLoading && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#020617', zIndex: 1
                }}>
                  <Loader2 size={36} color="#8B5CF6" className="animate-spin" />
                </div>
              )}
              
              <video
                ref={videoRef}
                onLoadedData={handleVideoLoad}
                autoPlay playsInline muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)'
                }}
              />

              {/* Proctoring Warning overlays inside Webcam Panel */}
              {lookingAway && (
                <div style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  padding: '6px 12px',
                  background: 'rgba(239, 68, 68, 0.9)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  zIndex: 2,
                  animation: 'pulse 1s infinite'
                }}>
                  ⚠ AI WARNING: LOOKING AWAY
                </div>
              )}

              {/* Subtitles / Real-time speech transcription preview for candidate */}
              {isMicActive && candidateSpeechText && (
                <div style={{
                  position: 'absolute',
                  bottom: 24,
                  left: '5%',
                  right: '5%',
                  padding: '10px 16px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  color: '#e2e8f0',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  zIndex: 2
                }}>
                  <span style={{ color: '#a855f7', fontWeight: 600 }}>Spoken:</span> "{candidateSpeechText}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Transcript Panel ── */}
        <div className="glass" style={{
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 24,
          padding: '24px 32px',
          background: 'rgba(10, 14, 35, 0.75)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          marginBottom: 24
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            paddingBottom: 16,
            marginBottom: 16
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
              AI Interviewer Transcript
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {ttsStatus && (
                <span style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 600 }}>
                  ⚠️ {ttsStatus}
                </span>
              )}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: '#22c55e',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em'
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 8px #22c55e'
                }} />
                LIVE
              </span>
            </div>
          </div>

          {/* Transcript Content Area */}
          <div style={{
            minHeight: 80,
            fontFamily: 'Courier New, Courier, monospace',
            color: '#fff',
            fontSize: '1rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap'
          }}>
            <span style={{ color: '#a855f7', fontWeight: 700 }}>AI Interviewer: </span>
            {typedText}
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 16,
              background: '#a855f7',
              marginLeft: 4,
              animation: 'blink 1s step-end infinite'
            }} />
            <style>{`
              @keyframes blink {
                from, to { background-color: transparent }
                50% { background-color: #a855f7 }
              }
            `}</style>
          </div>
        </div>

      </div>
    </>
  );
}
