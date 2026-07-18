import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Mail, Lock, User, Calendar, GraduationCap, Briefcase, 
  ChevronRight, ChevronLeft, Eye, EyeOff, AlertCircle, Bot, 
  ArrowRight, ArrowLeft, Check, Sparkles, Smile 
} from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';

const API = import.meta.env.VITE_API_URL;

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
  const [showPassword, setShowPassword] = useState(false);
  const [showOnboardingPassword, setShowOnboardingPassword] = useState(false);
  const [showOnboardingConfirmPassword, setShowOnboardingConfirmPassword] = useState(false);

  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      let response;
      try {
        response = await fetch(`${API}/api/user/google-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            name: user.displayName || 'Google User',
            avatar: user.photoURL || '👨‍💻',
            uid: user.uid
          })
        });
      } catch (networkErr) {
        console.error("Network/CORS error during backend fetch:", networkErr);
        if (!navigator.onLine) {
          throw new Error("Network error: You are offline. Please check your internet connection.");
        } else {
          throw new Error(`Backend server is unavailable or CORS request was blocked. Please ensure the backend is running at ${API}.`);
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Invalid server response (Status ${response.status})`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Backend returned an unsuccessful status.");
      }
      
      if (!data.user) {
        throw new Error("Invalid server response: User profile is missing.");
      }
      
      if (data.isNewUser) {
        setFormData(prev => ({
          ...prev,
          name: data.user.name || prev.name,
          email: data.user.email || prev.email,
          avatar: data.user.avatar || prev.avatar,
          uid: data.user.uid || prev.uid,
          password: '',
          confirmPassword: ''
        }));
        setStep(2);
        setIsLoginMode(false);
      } else {
        onLogin(data.user);
      }
    } catch (err) {
      console.error(err);
      if (err.code && err.code.startsWith('auth/')) {
        if (err.code === 'auth/popup-closed-by-user') {
          setError("Firebase authentication error: Sign-in popup closed before completion.");
        } else if (err.code === 'auth/cancelled-popup-request') {
          setError("Firebase authentication error: Popup sign-in request cancelled.");
        } else if (err.code === 'auth/popup-blocked') {
          setError("Firebase authentication error: Sign-in popup was blocked by the browser.");
        } else {
          setError(`Firebase authentication error: ${err.message}`);
        }
      } else {
        setError(err.message || "An error occurred during authentication.");
      }
    } finally {
      setLoading(false);
    }
  };

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

  const passwordRules = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecial: /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password),
  };

  const isNameValid = formData.name.trim().length > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isPasswordValid = 
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(formData.password) &&
    !/\s/.test(formData.password);
  const isConfirmPasswordValid = formData.password === formData.confirmPassword;

  const isStep1Valid = isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;

  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: 'Weak', color: 'bg-danger' };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) score++;
    
    let label = 'Weak';
    let color = 'bg-danger';
    
    if (score === 2) {
      label = 'Fair';
      color = 'bg-orange-500';
    } else if (score === 3) {
      label = 'Good';
      color = 'bg-warning';
    } else if (score === 4) {
      label = 'Strong';
      color = 'bg-secondary';
    } else if (score === 5) {
      if (!/\s/.test(pwd)) {
        label = 'Very Strong';
        color = 'bg-success';
      } else {
        label = 'Strong';
        color = 'bg-secondary';
      }
    }
    
    return { score, label, color };
  };

  const renderChecklistItem = (label, isSatisfied) => {
    let icon = "✓";
    let colorClass = "text-textSecondary"; // gray
    
    if (isSatisfied) {
      colorClass = "text-success"; // green
      icon = "✓";
    } else if (passwordTouched) {
      colorClass = "text-danger"; // red
      icon = "✗";
    }
    
    return (
      <div className={`flex items-center gap-2 text-xs font-semibold ${colorClass} transition-colors duration-200`}>
        <span className="text-sm font-bold">{icon}</span>
        <span>{label}</span>
      </div>
    );
  };

  // Step Navigations & Validations
  const validateStep1 = () => {
    if (!isNameValid) return "Full name is required.";
    if (!isEmailValid) return "Invalid email address.";
    if (!isPasswordValid) return "Password does not meet all requirements.";
    if (!isConfirmPasswordValid) return "Passwords do not match.";
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
      if (!formData.targetRole.trim()) {
        setError("Please specify your target career.");
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
        weak_areas: formData.weakAreas,
        onboardingCompleted: true,
        coreStrengths: formData.skills,
        areasOfDevelopment: formData.weakAreas
      };

      let response;
      try {
        response = await fetch(`${API}/api/user/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (netErr) {
        console.error(netErr);
        throw new Error(`Cannot connect to the authentication server. Please check your network or ensure the backend is running at ${API}.`);
      }

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
        coreStrengths: formData.skills,
        areasOfDevelopment: formData.weakAreas,
        onboardingCompleted: true,
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
      let response;
      try {
        response = await fetch(`${API}/api/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: loginFormData.email,
            password: loginFormData.password
          })
        });
      } catch (netErr) {
        console.error(netErr);
        throw new Error(`Cannot connect to the login server. Please ensure the backend is running at ${API}.`);
      }

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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-[460px] relative z-10">
        
        {/* Onboarding Steps Progress Indicator */}
        {!isLoginMode && step === 1 && (
          <div className="mb-6">
            <div className="flex justify-between items-center text-xs font-semibold text-textSecondary mb-2 px-1">
              <span className="text-primary font-bold">PROFILE SETUP</span>
              <span>Step 1 of 5</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: '20%' }}
              />
            </div>
          </div>
        )}

        <div className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-10">
          
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
                className="space-y-6"
              >
                {/* Logo & Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_4px_12px_rgba(79,70,229,0.2)]">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-textPrimary leading-none">AI Coach</h3>
                      <span className="text-[10px] text-textSecondary font-semibold">Interview Ready, Future Ready</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <h1 className="text-[42px] font-bold text-textPrimary tracking-tight leading-none">Welcome back 👋</h1>
                  <p className="text-sm text-textSecondary font-medium">Login to continue your preparation journey.</p>
                </div>

                {/* Social Login Stack */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full h-14 border border-[#E5E7EB] hover:bg-gray-50 bg-white rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-sm font-semibold text-textPrimary"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.5 15 1 12 1 7.3 1 3.3 3.7 1.4 7.6l3.9 3C6.3 7.8 8.9 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.3 3.6l3.6 2.8c2.1-2 3.7-4.9 3.7-8.7z" />
                      <path fill="#FBBC05" d="M5.3 10.6c-.3-.9-.4-1.8-.4-2.6 0-.8.1-1.7.4-2.6L1.4 2.4C.5 4.1 0 6 0 8s.5 3.9 1.4 5.6l3.9-3z" />
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-2.9l-3.6-2.8c-1.2.8-2.7 1.3-4.4 1.3-3.1 0-5.7-2.1-6.7-5l-3.9 3C3.3 20.3 7.3 23 12 23z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onLogin({ name: 'Shreya Adsul', email: 'shreya.adsul@microsoft.com', avatar: '👩‍💻' })}
                    className="w-full h-14 border border-[#E5E7EB] hover:bg-gray-50 bg-white rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-sm font-semibold text-textPrimary"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 23 23">
                      <path fill="#F25022" d="M0 0h11v11H0z" />
                      <path fill="#7FBA00" d="M12 0h11v11H12z" />
                      <path fill="#00A4EF" d="M0 12h11v11H0z" />
                      <path fill="#FFB900" d="M12 12h11v11H12z" />
                    </svg>
                    <span>Continue with Microsoft</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E5E7EB]" />
                  </div>
                  <span className="relative px-4 bg-white text-xs font-semibold text-textSecondary uppercase tracking-widest">
                    Or continue with
                  </span>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-textPrimary">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
                      <input 
                        type="email" 
                        name="email"
                        value={loginFormData.email}
                        onChange={handleLoginChange}
                        placeholder="Enter your email"
                        className="w-full h-14 bg-white border border-[#E5E7EB] focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl pl-12 pr-4 text-sm text-textPrimary placeholder-gray-400 focus:outline-none transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-textPrimary">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password"
                        value={loginFormData.password}
                        onChange={handleLoginChange}
                        placeholder="Enter your password"
                        className="w-full h-14 bg-white border border-[#E5E7EB] focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl pl-12 pr-12 text-sm text-textPrimary placeholder-gray-400 focus:outline-none transition-all duration-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-textSecondary hover:text-textPrimary transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember / Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-textSecondary font-semibold select-none group">
                      <input 
                        type="checkbox" 
                        className="w-4.5 h-4.5 rounded-md border-[#E5E7EB] text-primary focus:ring-primary/20 cursor-pointer accent-[#4F46E5]" 
                      />
                      <span className="group-hover:text-textPrimary transition-colors">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => alert("Check your email for reset instructions.")}
                      className="text-primary font-bold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Login Button */}
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.35)] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span>Login</span>
                    )}
                  </button>

                  {/* Sign Up Redirect */}
                  <div className="pt-2 text-center">
                    <span className="text-xs font-semibold text-textSecondary">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLoginMode(false);
                          setStep(0);
                          setError('');
                        }}
                        className="text-primary font-bold hover:underline"
                      >
                        Sign up
                      </button>
                    </span>
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
                className="space-y-6"
              >
                {/* Logo & Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_4px_12px_rgba(79,70,229,0.2)]">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-textPrimary leading-none">AI Coach</h3>
                      <span className="text-[10px] text-textSecondary font-semibold">Interview Ready, Future Ready</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 text-left">
                  <h1 className="text-[34px] font-bold text-textPrimary tracking-tight leading-none">Welcome to AI Coach</h1>
                  <p className="text-sm text-textSecondary font-medium">Your personal AI Interview Coach and Career Mentor.</p>
                </div>

                <p className="text-xs text-textSecondary leading-relaxed text-left">
                  Let's get to know you so we can personalize your interview experience, track metrics, and generate customized feedback.
                </p>

                <div className="space-y-4 pt-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_12px_rgba(79,70,229,0.25)]"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => {
                      setIsLoginMode(true);
                      setError('');
                    }}
                    className="w-full h-14 rounded-2xl border border-[#E5E7EB] hover:bg-gray-50 text-textSecondary hover:text-textPrimary font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Already have an account? Login</span>
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
                {/* Purple profile icon & Title */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <User className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-textPrimary tracking-tight">Create your Account</h2>
                  <p className="text-textSecondary text-xs font-semibold mt-1">Setup your access credentials to save your progress</p>
                </div>

                {/* Continue with Google button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full h-[52px] border border-[#E5E7EB] hover:bg-gray-50 bg-white rounded-[14px] flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-md text-sm font-semibold text-textPrimary mt-4"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.5 15 1 12 1 7.3 1 3.3 3.7 1.4 7.6l3.9 3C6.3 7.8 8.9 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.3 3.6l3.6 2.8c2.1-2 3.7-4.9 3.7-8.7z" />
                    <path fill="#FBBC05" d="M5.3 10.6c-.3-.9-.4-1.8-.4-2.6 0-.8.1-1.7.4-2.6L1.4 2.4C.5 4.1 0 6 0 8s.5 3.9 1.4 5.6l3.9-3z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-2.9l-3.6-2.8c-1.2.8-2.7 1.3-4.4 1.3-3.1 0-5.7-2.1-6.7-5l-3.9 3C3.3 20.3 7.3 23 12 23z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* OR divider */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E5E7EB]" />
                  </div>
                  <span className="relative px-3 bg-white text-xs font-semibold text-textSecondary uppercase tracking-widest">
                    OR
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-textPrimary">
                      Full Name *
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleOnboardingChange}
                      onBlur={() => setNameTouched(true)}
                      placeholder="Enter your full name"
                      className="w-full h-14 bg-white border border-[#E5E7EB] focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl px-4 text-sm text-textPrimary placeholder-gray-400 focus:outline-none transition-all duration-200"
                      required
                    />
                    {nameTouched && !formData.name.trim() && (
                      <div className="text-xs font-bold mt-1 text-danger flex items-center gap-1.5">
                        <span>✗</span>
                        <span>Full Name is required</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-textPrimary">
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleOnboardingChange}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="Enter your email"
                      className="w-full h-14 bg-white border border-[#E5E7EB] focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl px-4 text-sm text-textPrimary placeholder-gray-400 focus:outline-none transition-all duration-200"
                      required
                    />
                    {(emailTouched || formData.email) && (
                      <div className={`text-xs font-bold mt-1 flex items-center gap-1.5 ${
                        isEmailValid ? 'text-success' : 'text-danger'
                      }`}>
                        <span>{isEmailValid ? '✓' : '✗'}</span>
                        <span>{isEmailValid ? 'Valid email' : 'Invalid email address'}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-textPrimary">
                        Password *
                      </label>
                      <div className="relative">
                        <input 
                          type={showOnboardingPassword ? "text" : "password"} 
                          name="password"
                          value={formData.password}
                          onChange={handleOnboardingChange}
                          onBlur={() => setPasswordTouched(true)}
                          placeholder="••••••••"
                          className="w-full h-14 bg-white border border-[#E5E7EB] focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl pl-4 pr-10 text-sm text-textPrimary placeholder-gray-400 focus:outline-none transition-all duration-200"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowOnboardingPassword(!showOnboardingPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-textSecondary hover:text-textPrimary transition-colors"
                        >
                          {showOnboardingPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {/\s/.test(formData.password) && (
                        <div className="text-xs font-bold mt-1 text-danger flex items-center gap-1.5">
                          <span>✗</span>
                          <span>No spaces allowed in password</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-textPrimary">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input 
                          type={showOnboardingConfirmPassword ? "text" : "password"} 
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleOnboardingChange}
                          onBlur={() => setConfirmPasswordTouched(true)}
                          placeholder="••••••••"
                          className="w-full h-14 bg-white border border-[#E5E7EB] focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl pl-4 pr-10 text-sm text-textPrimary placeholder-gray-400 focus:outline-none transition-all duration-200"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowOnboardingConfirmPassword(!showOnboardingConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-textSecondary hover:text-textPrimary transition-colors"
                        >
                          {showOnboardingConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {(confirmPasswordTouched || formData.confirmPassword) && (
                        <div className={`text-xs font-bold mt-1 flex items-center gap-1.5 ${
                          isConfirmPasswordValid ? 'text-success' : 'text-danger'
                        }`}>
                          <span>{isConfirmPasswordValid ? '✓' : '✗'}</span>
                          <span>{isConfirmPasswordValid ? 'Passwords match' : 'Passwords do not match'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password Checklist & Strength indicator */}
                  {formData.password && (
                    <div className="space-y-3 mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="text-xs font-bold text-textPrimary mb-1">Password Requirements:</div>
                      {renderChecklistItem("Minimum 8 characters", passwordRules.minLength)}
                      {renderChecklistItem("One uppercase letter", passwordRules.hasUppercase)}
                      {renderChecklistItem("One lowercase letter", passwordRules.hasLowercase)}
                      {renderChecklistItem("One number", passwordRules.hasNumber)}
                      {renderChecklistItem("One special character", passwordRules.hasSpecial)}
                      
                      {/* Strength indicator */}
                      <div className="space-y-1.5 pt-2 border-t border-gray-200/50">
                        <div className="flex justify-between items-center text-xs font-bold text-textPrimary">
                          <span>Password Strength:</span>
                          <span className={`font-extrabold ${
                            getPasswordStrength().score <= 1 ? 'text-danger' :
                            getPasswordStrength().score === 2 ? 'text-orange-500' :
                            getPasswordStrength().score === 3 ? 'text-warning' :
                            getPasswordStrength().score === 4 ? 'text-secondary' : 'text-success'
                          }`}>{getPasswordStrength().label}</span>
                        </div>
                        <div className="flex gap-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          {[1, 2, 3, 4, 5].map((index) => (
                            <div 
                              key={index}
                              className={`h-full flex-1 transition-all duration-300 ${
                                index <= getPasswordStrength().score ? getPasswordStrength().color : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handleBack}
                    className="flex-1 h-14 rounded-2xl border border-[#E5E7EB] text-textSecondary hover:text-textPrimary hover:bg-gray-50 font-bold text-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={!isStep1Valid}
                    className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold text-sm transition-all flex items-center justify-center gap-1.5 group disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Next <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PROFILE DETAILS */}
            {!isLoginMode && step === 2 && (
              <motion.div
                key="step-2"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {/* Purple profile icon & Title */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-textPrimary tracking-tight">Let's build your profile</h2>
                  <p className="text-textSecondary text-xs font-semibold mt-1">Tell us about your educational and professional target</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-textPrimary">Current Status</label>
                    <select 
                      name="status"
                      value={formData.status}
                      onChange={handleOnboardingChange}
                      className="w-full h-14 bg-white border border-[#E5E7EB] focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl px-4 text-sm text-textPrimary focus:outline-none transition-all duration-200 appearance-none"
                    >
                      <option value="Student">Student (University / High School)</option>
                      <option value="Job Seeker">Job Seeker (Actively Looking)</option>
                      <option value="Employed">Employed (Looking for transition)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-textPrimary">
                      Degree / Major *
                    </label>
                    <input 
                      type="text" 
                      name="degree"
                      value={formData.degree}
                      onChange={handleOnboardingChange}
                      placeholder="e.g. B.Tech in Computer Science"
                      className="w-full h-14 bg-white border border-[#E5E7EB] focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl px-4 text-sm text-textPrimary placeholder-gray-400 focus:outline-none transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-textPrimary">Graduation Year / Experience Year</label>
                    <select 
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleOnboardingChange}
                      className="w-full h-14 bg-white border border-[#E5E7EB] focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl px-4 text-sm text-textPrimary focus:outline-none transition-all duration-200 appearance-none"
                    >
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028 (or later)</option>
                      <option value="N/A">Graduated (N/A)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-textPrimary">Target Career *</label>
                    <input 
                      type="text" 
                      name="targetRole"
                      value={formData.targetRole}
                      onChange={handleOnboardingChange}
                      placeholder="e.g. Software Engineer"
                      className="w-full h-14 bg-white border border-[#E5E7EB] focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl px-4 text-sm text-textPrimary placeholder-gray-400 focus:outline-none transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handleBack}
                    className="flex-1 h-14 rounded-2xl border border-[#E5E7EB] text-textSecondary hover:text-textPrimary hover:bg-gray-50 font-bold text-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                    onClick={handleNext}
                    className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold text-sm transition-all flex items-center justify-center gap-1.5 group"
                  >
                    Next <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Bottom step indicator stepper */}
                <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-[#E5E7EB]">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary text-white">1</span>
                    <span className="text-[10px] font-bold text-textPrimary">Account</span>
                  </div>
                  <div className="w-6 border-t border-gray-200" />
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary text-white">2</span>
                    <span className="text-[10px] font-bold text-textPrimary">Details</span>
                  </div>
                  <div className="w-6 border-t border-gray-200" />
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-100 text-textSecondary">3</span>
                    <span className="text-[10px] font-bold text-textSecondary">Confirm</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CONFIRMATION SCREEN */}
            {!isLoginMode && step === 3 && (
              <motion.div
                key="step-3"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5"
              >
                {/* Success Icon Header */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mb-3">
                    <Check className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-textPrimary tracking-tight">Your profile looks good!</h2>
                  <p className="text-textSecondary text-xs font-semibold mt-1">Review your summary below before beginning</p>
                </div>

                {/* Clean Summary Card */}
                <div className="bg-gray-50/50 border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-3 border-b border-gray-200/80 pb-3.5">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-textPrimary text-sm leading-snug">{formData.name}</h4>
                      <p className="text-textSecondary text-xs leading-none">{formData.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                      <span className="text-textSecondary uppercase font-bold text-[9px] tracking-wider block">Status</span>
                      <p className="text-textPrimary font-semibold mt-0.5">{formData.status}</p>
                    </div>
                    <div>
                      <span className="text-textSecondary uppercase font-bold text-[9px] tracking-wider block">Target Career</span>
                      <p className="text-textPrimary font-semibold mt-0.5 truncate">{formData.targetRole}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-textSecondary uppercase font-bold text-[9px] tracking-wider block">Degree / Major</span>
                      <p className="text-textPrimary font-semibold mt-0.5">{formData.degree} ({formData.graduationYear})</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-gray-200/85">
                    <span className="text-[9px] text-textSecondary uppercase font-bold tracking-wider block">Core Strengths</span>
                    {formData.skills && formData.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {formData.skills.map(skill => (
                          <span key={skill} className="px-2 py-0.5 bg-white border border-[#E5E7EB] text-textSecondary rounded-md text-[10px] font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-textSecondary leading-normal">
                        Not selected yet. This will be identified automatically after Resume Analysis and Mock Interviews.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] text-textSecondary uppercase font-bold tracking-wider block">Areas of Development</span>
                    {formData.weakAreas && formData.weakAreas.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {formData.weakAreas.map(area => (
                          <span key={area} className="px-2 py-0.5 bg-white border border-[#E5E7EB] text-textSecondary rounded-md text-[10px] font-semibold">
                            {area}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-textSecondary leading-normal">
                        Not available yet. AI will recommend improvement areas after evaluating your resume and interview performance.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-1">
                  <button 
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 h-14 rounded-2xl border border-[#E5E7EB] text-textSecondary hover:text-textPrimary hover:bg-gray-50 font-bold text-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                    onClick={handleOnboardingSubmit}
                    disabled={loading}
                    className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold text-sm transition-all flex items-center justify-center gap-1.5 group shadow-[0_4px_12px_rgba(79,70,229,0.25)]"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Start My Journey</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Bottom Information Box */}
                <div className="p-3.5 bg-[#4F46E5]/5 border border-[#4F46E5]/10 rounded-2xl flex items-center justify-center text-center">
                  <p className="text-[10px] font-bold text-primary">
                    You can update these details anytime in Settings.
                  </p>
                </div>

                {/* Bottom step indicator stepper */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary text-white">1</span>
                    <span className="text-[10px] font-bold text-textPrimary">Account</span>
                  </div>
                  <div className="w-6 border-t border-gray-200" />
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary text-white">2</span>
                    <span className="text-[10px] font-bold text-textPrimary">Details</span>
                  </div>
                  <div className="w-6 border-t border-gray-200" />
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary text-white">3</span>
                    <span className="text-[10px] font-bold text-textPrimary">Confirm</span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
