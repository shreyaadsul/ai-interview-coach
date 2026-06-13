import React, { useState } from 'react';

const AVATARS = ["👨‍💻", "👩‍💻", "🤖", "🚀", "🎓", "💼", "🌟", "🎯", "🧠", "🦁", "🦊", "🦄"];

export default function ProfileCard({ 
  initialProfile = { 
    name: "Shreya", 
    email: "shreya@example.com",
    avatar: "👨‍💻",
    degree: "",
    graduationYear: "",
    targetRole: "",
    skills: [],
    weakAreas: [],
    careerGoal: ""
  }, 
  onUpdate 
}) {
  // Parse initial fields to local states
  const [profile, setProfile] = useState({
    name: initialProfile.name || "",
    email: initialProfile.email || "",
    avatar: initialProfile.avatar || "👨‍💻",
    degree: initialProfile.degree || "",
    graduationYear: initialProfile.graduationYear || "",
    targetRole: initialProfile.targetRole || "",
    skillsInput: Array.isArray(initialProfile.skills) ? initialProfile.skills.join(", ") : "",
    weakAreasInput: Array.isArray(initialProfile.weakAreas) ? initialProfile.weakAreas.join(", ") : "",
    careerGoal: initialProfile.careerGoal || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Parse comma-separated strings back to trimmed arrays
    const skills = profile.skillsInput
      ? profile.skillsInput.split(",").map(s => s.trim()).filter(s => s !== "")
      : [];
      
    const weakAreas = profile.weakAreasInput
      ? profile.weakAreasInput.split(",").map(a => a.trim()).filter(a => a !== "")
      : [];

    onUpdate({
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
      degree: profile.degree,
      graduationYear: profile.graduationYear,
      targetRole: profile.targetRole,
      skills: skills,
      weakAreas: weakAreas,
      careerGoal: profile.careerGoal
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl space-y-5 shadow-xl">
      <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
      
      <div className="space-y-4">
        {/* Avatar Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Profile Avatar</label>
          <div className="flex flex-wrap gap-2 p-3 bg-[#0B1020]/40 rounded-xl border border-[#1F2937]">
            {AVATARS.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => setProfile({ ...profile, avatar: emoji })}
                className={`text-xl p-1.5 rounded-lg hover:bg-[#1F2937] transition-colors flex items-center justify-center ${profile.avatar === emoji ? 'bg-[#7C3AED]/20 border border-[#7C3AED]/50' : 'border border-transparent'}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name Field */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-3 bg-[#0B1020]/60 border border-[#1F2937] hover:border-[#7C3AED]/40 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 rounded-xl text-white text-sm focus:outline-none transition-all duration-300"
              required
            />
          </div>

          {/* Email Field (Disabled to prevent unique key issues) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email (Account ID)</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-3 bg-[#0B1020]/30 border border-[#1F2937] text-gray-500 text-sm focus:outline-none rounded-xl cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Degree Field */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Degree / Major</label>
            <input
              type="text"
              value={profile.degree}
              onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
              className="w-full px-4 py-3 bg-[#0B1020]/60 border border-[#1F2937] hover:border-[#7C3AED]/40 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 rounded-xl text-white text-sm focus:outline-none transition-all duration-300"
              placeholder="e.g. B.Tech in CS"
            />
          </div>

          {/* Graduation Year Field */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Graduation Year</label>
            <input
              type="text"
              value={profile.graduationYear}
              onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
              className="w-full px-4 py-3 bg-[#0B1020]/60 border border-[#1F2937] hover:border-[#7C3AED]/40 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 rounded-xl text-white text-sm focus:outline-none transition-all duration-300"
              placeholder="e.g. 2026"
            />
          </div>
        </div>

        {/* Target Role Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Target Role</label>
          <input
            type="text"
            value={profile.targetRole}
            onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
            className="w-full px-4 py-3 bg-[#0B1020]/60 border border-[#1F2937] hover:border-[#7C3AED]/40 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 rounded-xl text-white text-sm focus:outline-none transition-all duration-300"
            placeholder="e.g. Machine Learning Engineer"
          />
        </div>

        {/* Skills Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Skills (comma separated)</label>
          <input
            type="text"
            value={profile.skillsInput}
            onChange={(e) => setProfile({ ...profile, skillsInput: e.target.value })}
            className="w-full px-4 py-3 bg-[#0B1020]/60 border border-[#1F2937] hover:border-[#7C3AED]/40 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 rounded-xl text-white text-sm focus:outline-none transition-all duration-300"
            placeholder="Python, SQL, React"
          />
        </div>

        {/* Weak Areas Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Weak Areas / Learning Priorities (comma separated)</label>
          <input
            type="text"
            value={profile.weakAreasInput}
            onChange={(e) => setProfile({ ...profile, weakAreasInput: e.target.value })}
            className="w-full px-4 py-3 bg-[#0B1020]/60 border border-[#1F2937] hover:border-[#7C3AED]/40 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 rounded-xl text-white text-sm focus:outline-none transition-all duration-300"
            placeholder="System Design, Algorithms"
          />
        </div>

        {/* Career Goal Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Career Goal</label>
          <textarea
            value={profile.careerGoal}
            onChange={(e) => setProfile({ ...profile, careerGoal: e.target.value })}
            rows="2"
            className="w-full px-4 py-3 bg-[#0B1020]/60 border border-[#1F2937] hover:border-[#7C3AED]/40 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 rounded-xl text-white text-sm focus:outline-none transition-all duration-300 resize-none"
            placeholder="Describe your long-term career ambition..."
          />
        </div>
      </div>

      {/* UPDATE PROFILE BUTTON */}
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] hover:shadow-lg hover:shadow-[#7C3AED]/25 text-white font-semibold transition-all duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50"
      >
        Update Profile
      </button>
    </form>
  );
}
