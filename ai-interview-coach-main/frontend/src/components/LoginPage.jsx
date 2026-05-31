import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    targetRole: '',
    experienceLevel: 'Fresher'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Please fill in all required fields.");
      return;
    }
    
    const userProfile = {
      ...formData,
      createdAt: new Date().toISOString()
    };
    
    onLogin(userProfile);
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8 relative z-10"
      >
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary/25">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white text-center">AI Interview Coach</h1>
          <p className="text-gray-400 text-sm mt-2 text-center">Create your profile to get personalized coaching</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-300">Full Name *</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-300">Email Address *</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. john@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-300">Target Role</label>
            <input 
              type="text" 
              name="targetRole"
              value={formData.targetRole}
              onChange={handleChange}
              placeholder="e.g. Software Engineer"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-300">Experience Level</label>
            <select 
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="w-full bg-navy-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors appearance-none"
            >
              <option value="Fresher">Fresher (0 years)</option>
              <option value="Entry-Level">Entry-Level (1-2 years)</option>
              <option value="Mid-Level">Mid-Level (3-5 years)</option>
              <option value="Senior">Senior (5+ years)</option>
              <option value="Executive">Executive</option>
            </select>
          </div>

          <button 
            type="submit"
            className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/25 text-white font-bold transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span>Create Profile & Login</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
