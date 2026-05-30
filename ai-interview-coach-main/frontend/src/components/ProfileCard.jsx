import React, { useState } from 'react';

export default function ProfileCard({ initialProfile = { name: "Shreya", email: "shreya@example.com" }, onUpdate }) {
  const [profile, setProfile] = useState(initialProfile);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(profile);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl space-y-5 shadow-xl">
      <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
      
      <div className="space-y-4">
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

        {/* Email Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="w-full px-4 py-3 bg-[#0B1020]/60 border border-[#1F2937] hover:border-[#7C3AED]/40 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 rounded-xl text-white text-sm focus:outline-none transition-all duration-300"
            required
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
