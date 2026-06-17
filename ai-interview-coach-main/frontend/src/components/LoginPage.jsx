import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, LogIn, ArrowRight, ArrowLeft, Check, Loader2, 
  User, Mail, Lock, GraduationCap, Calendar, Briefcase, 
  Code, AlertCircle, Sparkles, Smile 
} from 'lucide-react';

const SUGGESTED_SKILLS = [
  "Python", "JavaScript", "React", "Node.js", "Java", "C++", 
  "SQL", "Git", "Docker", "AWS", "Machine Learning", "System Design"
];

const SUGGESTED_WEAKNESSES = [
  "System Design", "System Architecture", "Behavioral Prep", 
  "Data Structures", "Algorithms", "Public Speaking", "Negotiation", "Case Studies"
];

const AVATARS = ["👨‍💻", "👩‍💻", "🤖", "🚀", "🎓", "💼", "🌟", "🎯", "🧠", "🦁", "🦊", "🦄"];

export default function LoginPage({ onLogin }) {
  const [step, setStep] = useState(0); // 0: Welcome Screen, 1-5: Onboarding steps
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Onboarding Profile State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    status: 'Student', // Student, Job Seeker, Employed, Other
    degree: '',
    graduationYear: '2026',
    targetRole: '',
    experienceLevel: 'Fresher',
    timeline: 'Immediate', // Immediate, 1 Month, 3 Months, Exploring
    skills: [],
    weakAreas: [],
    avatar: '👨‍💻'
  });

  // Login Form State
  const [loginFormData, setLoginFormData] = useState({
    email: '',
    password: ''
  });

  // Helpers to update onboarding form
  const handleOnboardingChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleSkill = (skill) => {
    const isSelected = formData.skills.includes(skill);
    const newSkills = isSelected 
      ? formData.skills.filter(s => s !== skill)
      : [...formData.skills, skill];
    setFormData({ ...formData, skills: newSkills });
  };

  const toggleWeakArea = (area) => {
    const isSelected = formData.weakAreas.includes(area);
    const newWeakAreas = isSelected 
      ? formData.weakAreas.filter(a => a !== area)
      : [...formData.weakAreas, area];
    setFormData({ ...formData, weakAreas: newWeakAreas });
  };

  // Helpers to update login form
  const handleLoginChange = (e) => {
    setLoginFormData({
      ...loginFormData,
      [e.target.name]: e.target.value
    });
  };

  // Step Navigations & Validations
  const validateStep1 = () => {
    if (!formData.name.trim()) return "Full name is required.";
    if (!formData.email.trim()) return "Email address is required.";
    if (!formData.password) return "Password is required.";
    if (formData.password.length < 6) return "Password must be at least 6 characters.";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      const step1Error = validateStep1();
      if (step1Error) {
        setError(step1Error);
        return;
      }
    }
    if (step === 2) {
      if (!formData.degree.trim()) {
        setError("Please enter your degree or course of study.");
        return;
      }
    }
    if (step === 3) {
      if (!formData.targetRole.trim()) {
        setError("Please specify your target role.");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  // Onboarding Signup Submit
  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Setup payload matching both frontend & backend snake/camel fields
      const payload = {
        ...formData,
        target_role: formData.targetRole,
        experience_level: formData.experienceLevel,
        graduation_year: formData.graduationYear,
        weak_areas: formData.weakAreas
      };

      const response = await fetch("http://localhost:5000/api/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create profile");
      }

      // Login immediately with the new user profile
      const userProfile = {
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar,
        status: formData.status,
        degree: formData.degree,
        graduationYear: formData.graduationYear,
        targetRole: formData.targetRole,
        experienceLevel: formData.experienceLevel,
        timeline: formData.timeline,
        skills: formData.skills,
        weakAreas: formData.weakAreas,
        createdAt: new Date().toISOString()
      };

      onLogin(userProfile);
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch("http://localhost:5000/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginFormData.email,
          password: loginFormData.password
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      onLogin(data.user);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Transition variants
  const slideVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-lg relative z-10">
        
        {/* Onboarding Steps Progress Indicator */}
        {!isLoginMode && step > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-400 mb-2 px-1">
              <span className="text-primary font-bold">PROFILE SETUP</span>
              <span>Step {step} of 5</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="glass-card p-8 shadow-2xl relative border border-white/10 rounded-3xl bg-navy-950/80 backdrop-blur-xl">
          
          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-start gap-2.5 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* LOGIN MODE */}
            {isLoginMode && (
              <motion.div
                key="login-form"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="flex flex-col items-center justify-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary/25">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white text-center tracking-tight">Welcome Back</h1>
                  <p className="text-gray-400 text-sm mt-1.5 text-center">Login to resume your AI coaching session</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Email Address
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      value={loginFormData.email}
                      onChange={handleLoginChange}
                      placeholder="e.g. john@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Password
                    </label>
                    <input 
                      type="password" 
                      name="password"
                      value={loginFormData.password}
                      onChange={handleLoginChange}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/25 text-white font-bold transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginMode(false);
                        setStep(0);
                        setError('');
                      }}
                      className="text-primary hover:text-primary-focus text-sm font-semibold hover:underline"
                    >
                      Don't have an account? Sign Up
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* WELCOME SCREEN (STEP 0) */}
            {!isLoginMode && step === 0 && (
              <motion.div
                key="welcome-screen"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center"
              >
                <div className="flex flex-col items-center justify-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-tr from-primary to-secondary rounded-3xl flex items-center justify-center mb-5 shadow-2xl shadow-primary/20 relative">
                    <Bot className="w-10 h-10 text-white" />
                    <div className="absolute -bottom-1 -right-1 bg-warning text-navy-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow">
                      ✨
                    </div>
                  </div>
                  <h1 className="text-4xl font-extrabold text-white tracking-tight">Welcome to InterviewAI</h1>
                  <p className="text-primary font-medium mt-2 text-base">
                    Your personal AI Interview Coach and Career Mentor.
                  </p>
                  <p className="text-gray-400 text-sm max-w-md mt-4 leading-relaxed">
                    Let's get to know you so we can personalize your interview experience.
                  </p>
                </div>

                <div className="space-y-4 max-w-sm mx-auto mt-10">
                  <button 
                    onClick={() => setStep(1)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:shadow-primary/20 text-white font-extrabold transition-all duration-300 flex items-center justify-center gap-2.5 group text-base"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </button>

                  <button 
                    onClick={() => {
                      setIsLoginMode(true);
                      setError('');
                    }}
                    className="w-full py-4 rounded-2xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>Already Have Account? Login</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 1: ACCOUNT CREATION */}
            {!isLoginMode && step === 1 && (
              <motion.div
                key="step-1"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <User className="w-6 h-6 text-primary" /> Create your Account
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">Setup your access credentials to save your progress</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      Full Name *
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleOnboardingChange}
                      placeholder="e.g. John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleOnboardingChange}
                      placeholder="john@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        Password *
                      </label>
                      <input 
                        type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleOnboardingChange}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        Confirm Password *
                      </label>
                      <input 
                        type="password" 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleOnboardingChange}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button 
                    onClick={handleBack}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                    onClick={handleNext}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-1.5 group"
                  >
                    Next <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: ABOUT YOURSELF */}
            {!isLoginMode && step === 2 && (
              <motion.div
                key="step-2"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-primary" /> Tell us about yourself
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">Help us personalize your education level and background</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">Choose Profile Avatar</label>
                    <div className="grid grid-cols-6 gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                      {AVATARS.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormData({ ...formData, avatar: emoji })}
                          className={`text-2xl p-1.5 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center ${formData.avatar === emoji ? 'bg-primary/20 border border-primary/50' : 'border border-transparent'}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Current Status</label>
                    <select 
                      name="status"
                      value={formData.status}
                      onChange={handleOnboardingChange}
                      className="w-full bg-navy-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors appearance-none"
                    >
                      <option value="Student">Student (University / High School)</option>
                      <option value="Job Seeker">Job Seeker (Actively Looking)</option>
                      <option value="Employed">Employed (Looking for transition)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      Degree / Major *
                    </label>
                    <input 
                      type="text" 
                      name="degree"
                      value={formData.degree}
                      onChange={handleOnboardingChange}
                      placeholder="e.g. B.Tech in Computer Science"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Graduation Year / Experience Year</label>
                    <select 
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleOnboardingChange}
                      className="w-full bg-navy-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors appearance-none"
                    >
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028 (or later)</option>
                      <option value="N/A">Graduated (N/A)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button 
                    onClick={handleBack}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                    onClick={handleNext}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-1.5 group"
                  >
                    Next <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CAREER GOALS */}
            {!isLoginMode && step === 3 && (
              <motion.div
                key="step-3"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-primary" /> Target Career Goals
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">Specify your target roles and experience tier</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      Target Role *
                    </label>
                    <input 
                      type="text" 
                      name="targetRole"
                      value={formData.targetRole}
                      onChange={handleOnboardingChange}
                      placeholder="e.g. Machine Learning Engineer"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Experience level</label>
                    <select 
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleOnboardingChange}
                      className="w-full bg-navy-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors appearance-none"
                    >
                      <option value="Fresher">Fresher (0 years)</option>
                      <option value="Entry-Level">Entry-Level (1-2 years)</option>
                      <option value="Mid-Level">Mid-Level (3-5 years)</option>
                      <option value="Senior">Senior (5+ years)</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Interview Timeline</label>
                    <select 
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleOnboardingChange}
                      className="w-full bg-navy-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors appearance-none"
                    >
                      <option value="Immediate">Immediate (Interviews scheduled!)</option>
                      <option value="1 Month">Within next 30 days</option>
                      <option value="3 Months">Within next 90 days</option>
                      <option value="Exploring">Just exploring / practicing</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button 
                    onClick={handleBack}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                    onClick={handleNext}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-1.5 group"
                  >
                    Next <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SKILLS DISCOVERY */}
            {!isLoginMode && step === 4 && (
              <motion.div
                key="step-4"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Code className="w-6 h-6 text-primary" /> Skills Discovery
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">Select your top strengths and priority learning areas</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-300 flex justify-between">
                      <span>Strong Technical Skills</span>
                      <span className="text-gray-500">Selected: {formData.skills.length}</span>
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                      {SUGGESTED_SKILLS.map(skill => {
                        const active = formData.skills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${active ? 'bg-primary/20 text-primary border-primary/40' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-300 flex justify-between">
                      <span>Weak Areas / Learning Priorities</span>
                      <span className="text-gray-500">Selected: {formData.weakAreas.length}</span>
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                      {SUGGESTED_WEAKNESSES.map(area => {
                        const active = formData.weakAreas.includes(area);
                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() => toggleWeakArea(area)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${active ? 'bg-warning/20 text-warning border-warning/40' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                          >
                            {area}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button 
                    onClick={handleBack}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                    onClick={handleNext}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-1.5 group"
                  >
                    Next <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: AI SUMMARY CARD */}
            {!isLoginMode && step === 5 && (
              <motion.div
                key="step-5"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center py-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success/15 text-success mb-3 animate-bounce">
                    <Smile className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-white">Let's build your profile!</h2>
                  <p className="text-gray-400 text-xs mt-1">Review your AI Career roadmap inputs below</p>
                </div>

                <div className="p-5 bg-gradient-to-br from-navy-900 to-navy-950 border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-3">
                    <div className="text-4xl">{formData.avatar}</div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{formData.name}</h3>
                      <p className="text-gray-400 text-xs">{formData.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500 uppercase font-semibold">Degree / Major</span>
                      <p className="text-white font-medium mt-0.5 truncate">{formData.degree} ({formData.graduationYear})</p>
                    </div>
                    <div>
                      <span className="text-gray-500 uppercase font-semibold">Target Career</span>
                      <p className="text-white font-medium mt-0.5 truncate">{formData.targetRole} ({formData.experienceLevel})</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-xs text-gray-500 uppercase font-semibold block">Core Strengths</span>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.skills.length > 0 ? (
                        formData.skills.map(skill => (
                          <span key={skill} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] font-bold">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-[10px]">No skills selected</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-gray-500 uppercase font-semibold block">Areas of Development</span>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.weakAreas.length > 0 ? (
                        formData.weakAreas.map(area => (
                          <span key={area} className="px-2 py-0.5 bg-warning/10 text-warning border border-warning/20 rounded-md text-[10px] font-bold">
                            {area}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-[10px]">No areas selected</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button 
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 py-3.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                    onClick={handleOnboardingSubmit}
                    disabled={loading}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm hover:shadow-xl transition-all flex items-center justify-center gap-1.5 group disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Start My Journey!</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
