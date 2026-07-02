import React, { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import PreferencesCard from './PreferencesCard';
import AccountSettingsCard from './AccountSettingsCard';
import { X, Lock, Bell, Trash, ShieldAlert } from 'lucide-react';

export default function SettingsPage({ onProfileUpdate }) {
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  });
  const userId = userProfile?.email || "";

  const [profile, setProfile] = useState({
    name: userProfile?.name || "Shreya",
    email: userId || "shreya@example.com",
    avatar: userProfile?.avatar || "👨‍💻",
    degree: userProfile?.degree || "",
    graduationYear: userProfile?.graduationYear || "",
    targetRole: userProfile?.targetRole || "",
    skills: userProfile?.skills || [],
    weakAreas: userProfile?.weakAreas || [],
    careerGoal: userProfile?.careerGoal || ""
  });

  const [preferences, setPreferences] = useState({
    role: "Machine Learning Engineer",
    difficulty: "Medium",
    questionType: "All"
  });

  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    push: false
  });
  const [theme, setTheme] = useState("dark");

  // Modal active states
  const [modalOpen, setModalOpen] = useState(null); // 'password' | 'notifications' | 'delete' | null
  const [successMessage, setSuccessMessage] = useState("");

  // Load settings from MongoDB
  useEffect(() => {
    const loadSettings = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:5000/api/settings?user_id=${encodeURIComponent(userId)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.profile) setProfile(data.profile);
          if (data.preferences) setPreferences(data.preferences);
          if (data.notifications) setNotifications(data.notifications);
          if (data.theme) setTheme(data.theme);
        }
      } catch (err) {
        console.error("Failed to load settings from MongoDB", err);
      }
    };
    loadSettings();
  }, [userId]);

  const handleUpdateProfile = async (updatedProfile) => {
    setProfile(updatedProfile);
    if (userId) {
      try {
        const response = await fetch("http://localhost:5000/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            profile: updatedProfile,
            preferences: preferences,
            notifications: notifications,
            theme: theme
          })
        });
        if (response.ok) {
          showSuccessToast("Profile settings saved successfully!");
          
          // Sync changes back to localStorage
          const updatedLocalProfile = {
            ...userProfile,
            ...updatedProfile
          };
          localStorage.setItem('userProfile', JSON.stringify(updatedLocalProfile));
          if (onProfileUpdate) {
            onProfileUpdate(updatedLocalProfile);
          }
        } else {
          throw new Error("Failed to save settings");
        }
      } catch (err) {
        console.error(err);
        showSuccessToast("Failed to save settings to server.");
      }
    } else {
      showSuccessToast("Profile settings saved successfully!");
      const updatedLocalProfile = {
        ...userProfile,
        ...updatedProfile
      };
      localStorage.setItem('userProfile', JSON.stringify(updatedLocalProfile));
      if (onProfileUpdate) {
        onProfileUpdate(updatedLocalProfile);
      }
    }
  };

  const handlePreferenceChange = async (key, value) => {
    const updatedPreferences = {
      ...preferences,
      [key]: value
    };
    setPreferences(updatedPreferences);
    
    if (userId) {
      try {
        const response = await fetch("http://localhost:5000/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            profile: profile,
            preferences: updatedPreferences,
            notifications: notifications,
            theme: theme
          })
        });
        if (response.ok) {
          showSuccessToast(`Preferences updated: ${value}`);
        } else {
          throw new Error("Failed to save preferences");
        }
      } catch (err) {
        console.error(err);
        showSuccessToast("Failed to save preferences to server.");
      }
    } else {
      showSuccessToast(`Preferences updated: ${value}`);
    }
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
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">
          Settings
        </h1>
        <p className="text-textSecondary text-sm mt-1">Manage your account information, preferences, and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile settings + Preferences (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileCard 
            key={profile.email + profile.name}
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl w-full max-w-md p-6 space-y-6 shadow-sm animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-primary">
                <Lock className="w-5 h-5" />
                <h3 className="text-base font-bold text-textPrimary">Change Password</h3>
              </div>
              <button onClick={handleCloseModal} className="text-textSecondary hover:text-textPrimary transition-colors focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCloseModal();
              showSuccessToast("Password updated successfully!");
            }} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Current Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl text-textPrimary text-sm focus:outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl text-textPrimary text-sm focus:outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl text-textPrimary text-sm focus:outline-none"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-textSecondary hover:bg-gray-50 font-semibold text-sm transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-sm transition-all focus:outline-none"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl w-full max-w-md p-6 space-y-6 shadow-sm animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-primary">
                <Bell className="w-5 h-5" />
                <h3 className="text-base font-bold text-textPrimary">Notification Settings</h3>
              </div>
              <button onClick={handleCloseModal} className="text-textSecondary hover:text-textPrimary transition-colors focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-150 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-textPrimary">Email Notifications</span>
                  <span className="text-xs text-textSecondary">Receive reports and feedback updates.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications.email} 
                  onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })} 
                  className="w-4 h-4 accent-primary cursor-pointer" 
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-150 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-textPrimary">Browser Notifications</span>
                  <span className="text-xs text-textSecondary">Stay alerted during mock sessions.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications.browser} 
                  onChange={(e) => setNotifications({ ...notifications, browser: e.target.checked })} 
                  className="w-4 h-4 accent-primary cursor-pointer" 
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-150 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-textPrimary">Push Notifications</span>
                  <span className="text-xs text-textSecondary">Get reminders for scheduled reviews.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications.push} 
                  onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })} 
                  className="w-4 h-4 accent-primary cursor-pointer" 
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-textSecondary hover:bg-gray-50 font-semibold text-sm transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    handleCloseModal();
                    if (userId) {
                      try {
                        const response = await fetch("http://localhost:5000/api/settings", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            user_id: userId,
                            profile: profile,
                            preferences: preferences,
                            notifications: notifications,
                            theme: theme
                          })
                        });
                        if (response.ok) {
                           showSuccessToast("Notification preferences saved!");
                        } else {
                          throw new Error("Failed to save notifications");
                        }
                      } catch (err) {
                        console.error(err);
                        showSuccessToast("Failed to save preferences to server.");
                      }
                    } else {
                      showSuccessToast("Notification preferences saved!");
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-sm transition-all focus:outline-none"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-sm animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-danger">
                <ShieldAlert className="w-6 h-6 animate-bounce" />
                <h3 className="text-base font-bold text-textPrimary">Delete Account</h3>
              </div>
              <button onClick={handleCloseModal} className="text-textSecondary hover:text-textPrimary transition-colors focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-textSecondary leading-relaxed">
                Are you absolutely sure you want to delete your account? This action is permanent and will result in the loss of:
              </p>
              <ul className="list-disc pl-5 text-xs text-textSecondary space-y-1">
                <li>Your parsed resume analytics and metrics.</li>
                <li>All mock interview logs and AI evaluations.</li>
                <li>Leaderboard rankings and history items.</li>
              </ul>
              
              <p className="text-xs text-red-500 font-semibold bg-red-500/5 border border-red-500/10 p-3 rounded-lg">
                ⚠️ Warning: This operation cannot be undone.
              </p>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-textSecondary hover:bg-gray-50 font-semibold text-sm transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleCloseModal();
                    alert("Account deletion simulated.");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#EF4444] hover:bg-red-600 text-white font-bold text-sm transition-colors focus:outline-none"
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
