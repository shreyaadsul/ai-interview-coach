import React, { useState } from 'react';
import ProfileCard from './ProfileCard';
import PreferencesCard from './PreferencesCard';
import AccountSettingsCard from './AccountSettingsCard';
import { X, Lock, Bell, Trash, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "Shreya",
    email: "shreya@example.com"
  });

  const [preferences, setPreferences] = useState({
    role: "Machine Learning Engineer",
    difficulty: "Medium",
    questionType: "All"
  });

  // Modal active states
  const [modalOpen, setModalOpen] = useState(null); // 'password' | 'notifications' | 'delete' | null
  const [successMessage, setSuccessMessage] = useState("");

  // Simulated handlers
  const handleUpdateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    showSuccessToast("Profile settings saved successfully!");
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences({
      ...preferences,
      [key]: value
    });
    showSuccessToast(`Preferences updated: ${value}`);
  };

  const showSuccessToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleCloseModal = () => setModalOpen(null);

  return (
    <div className="space-y-8 relative">
      
      {/* Toast alert banner */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#22C55E] text-white px-5 py-3 rounded-xl shadow-lg shadow-[#22C55E]/20 font-semibold text-sm animate-bounce">
          ✓ {successMessage}
        </div>
      )}

      {/* PAGE TITLE */}
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Settings
        </h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account information, preferences, and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile settings + Preferences (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileCard 
            initialProfile={profile} 
            onUpdate={handleUpdateProfile} 
          />
          <PreferencesCard 
            preferences={preferences} 
            onChange={handlePreferenceChange} 
          />
        </div>

        {/* Right Column: Account settings (Span 1) */}
        <div className="lg:col-span-1">
          <AccountSettingsCard 
            onChangePassword={() => setModalOpen('password')}
            onNotificationSettings={() => setModalOpen('notifications')}
            onDeleteAccount={() => setModalOpen('delete')}
          />
        </div>
      </div>

      {/* --- MODAL DIALOG OVERLAYS --- */}

      {/* 1. Change Password Modal */}
      {modalOpen === 'password' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#7C3AED]">
                <Lock className="w-5 h-5" />
                <h3 className="text-lg font-bold text-white">Change Password</h3>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCloseModal();
              showSuccessToast("Password updated successfully!");
            }} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#0B1020]/60 border border-[#1F2937] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 rounded-xl text-white text-sm focus:outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#0B1020]/60 border border-[#1F2937] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 rounded-xl text-white text-sm focus:outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#0B1020]/60 border border-[#1F2937] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 rounded-xl text-white text-sm focus:outline-none"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 rounded-xl border border-[#1F2937] text-gray-300 hover:bg-white/5 font-semibold text-sm transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white font-semibold text-sm transition-shadow shadow-md shadow-[#7C3AED]/15 focus:outline-none"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Notification Settings Modal */}
      {modalOpen === 'notifications' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#7C3AED]">
                <Bell className="w-5 h-5" />
                <h3 className="text-lg font-bold text-white">Notification Settings</h3>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-[#0B1020]/40 border border-[#1F2937] rounded-xl">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">Email Notifications</span>
                  <span className="text-xs text-gray-400">Receive reports and feedback updates.</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary cursor-pointer" />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#0B1020]/40 border border-[#1F2937] rounded-xl">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">Browser Notifications</span>
                  <span className="text-xs text-gray-400">Stay alerted during mock sessions.</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary cursor-pointer" />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#0B1020]/40 border border-[#1F2937] rounded-xl">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">Push Notifications</span>
                  <span className="text-xs text-gray-400">Get reminders for scheduled reviews.</span>
                </div>
                <input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 rounded-xl border border-[#1F2937] text-gray-300 hover:bg-white/5 font-semibold text-sm transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleCloseModal();
                    showSuccessToast("Notification preferences saved!");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white font-semibold text-sm transition-shadow shadow-md shadow-[#7C3AED]/15 focus:outline-none"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Account Modal */}
      {modalOpen === 'delete' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-red-500/30 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#EF4444]">
                <ShieldAlert className="w-6 h-6 animate-bounce" />
                <h3 className="text-lg font-bold text-white">Delete Account</h3>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-300 leading-relaxed">
                Are you absolutely sure you want to delete your account? This action is permanent and will result in the loss of:
              </p>
              <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1">
                <li>Your parsed resume analytics and metrics.</li>
                <li>All mock interview logs and AI evaluations.</li>
                <li>Leaderboard rankings and history items.</li>
              </ul>
              
              <p className="text-xs text-red-500 font-semibold bg-red-500/5 border border-red-500/25 p-3 rounded-lg">
                ⚠️ Warning: This operation cannot be undone.
              </p>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 rounded-xl border border-[#1F2937] text-gray-300 hover:bg-white/5 font-semibold text-sm transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleCloseModal();
                    alert("Account deletion simulated.");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#EF4444] hover:bg-red-600 text-white font-semibold text-sm transition-colors focus:outline-none"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
