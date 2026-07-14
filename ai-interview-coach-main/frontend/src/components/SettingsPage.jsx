import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Bell, Trash, ShieldAlert, User, Sliders, Video, 
  Smartphone, LogOut, Check, Plus, Download, Camera, Mic, Volume2
} from 'lucide-react';

// Helper: Custom Chips Input for Skills and Weak Areas
const ChipsInput = ({ label, items = [], onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !items.includes(val)) {
        onChange([...items, val]);
      }
      setInputValue("");
    }
  };

  const removeItem = (itemToRemove) => {
    onChange(items.filter(item => item !== itemToRemove));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 rounded-xl min-h-[50px] transition-all duration-300">
        {items.map((item, idx) => (
          <span key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold">
            {item}
            <button
              type="button"
              onClick={() => removeItem(item)}
              className="text-primary hover:text-primary/70 focus:outline-none transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={items.length === 0 ? placeholder : "Add more..."}
          className="flex-grow bg-transparent text-textPrimary text-sm focus:outline-none min-w-[120px]"
        />
      </div>
    </div>
  );
};

// Helper: Custom Form Input Field
const FormInput = ({ label, type = "text", value, onChange, placeholder, disabled, required }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">{label}</label>
    <input
      type={type}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      required={required}
      className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl text-textPrimary text-sm focus:outline-none transition-all duration-300 ${disabled ? 'cursor-not-allowed text-textSecondary/80 bg-gray-100/50' : 'hover:border-primary/30'}`}
    />
  </div>
);

// Helper: Custom Select Dropdown
const FormSelect = ({ label, value, onChange, options = [] }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 hover:border-primary/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl text-textPrimary text-sm focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-white text-textPrimary">
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-textSecondary">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  </div>
);

// Helper: Custom Toggle Switch
const FormToggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-2xl hover:border-gray-200 transition-all duration-200">
    <div className="flex flex-col gap-0.5 max-w-[80%]">
      <span className="text-sm font-bold text-textPrimary">{label}</span>
      {description && <span className="text-xs text-textSecondary">{description}</span>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none"
      style={{ backgroundColor: checked ? '#4F46E5' : '#D1D5DB' }}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  </div>
);

export default function SettingsPage({ onProfileUpdate }) {
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  });
  const userId = userProfile?.email || "";

  // 1. Initial State Definitions
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
    questionType: "All",
    theme: "Light",
    voice: "Rachel (Default)",
    autoSave: true
  });

  const [interview, setInterview] = useState({
    avatar: "Tech Interviewer 👨‍💼",
    voice: "Assistant Voice",
    camera: "Integrated Camera (Default)",
    microphone: "Default Audio Input",
    fullscreen: true,
    eyeContact: true,
    timer: true,
    proctoring: false
  });

  const [notifications, setNotifications] = useState({
    email: true,
    weeklyReports: true,
    reminders: true,
    achievements: true
  });

  // 2. Draft States for Cancelling edits
  const [draftProfile, setDraftProfile] = useState({ ...profile });
  const [draftPreferences, setDraftPreferences] = useState({ ...preferences });
  const [draftInterview, setDraftInterview] = useState({ ...interview });
  const [draftNotifications, setDraftNotifications] = useState({ ...notifications });

  const [activeTab, setActiveTab] = useState('profile');
  const [modalOpen, setModalOpen] = useState(null); // 'delete' | null
  const [successMessage, setSuccessMessage] = useState("");
  
  // Top-level states for Security and Account tabs to obey React Hooks rules
  const [passwordState, setPasswordState] = useState({ current: "", newPassword: "", confirm: "" });
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: "Chrome on Windows (Current)", location: "Mumbai, India", ip: "103.45.21.90", active: "Active now" },
    { id: 2, device: "Safari on iPhone", location: "Mumbai, India", ip: "103.45.21.92", active: "2 hours ago" },
  ]);
  const [privacy, setPrivacy] = useState({ shareData: true, allowRecruiter: false, keepPrivate: false });

  const showSuccessToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // 3. Load settings from MongoDB on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:5000/api/settings?user_id=${encodeURIComponent(userId)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            const normalizedProfile = {
              ...data.profile,
              skills: Array.isArray(data.profile.skills) ? data.profile.skills : [],
              weakAreas: Array.isArray(data.profile.weakAreas) ? data.profile.weakAreas : (Array.isArray(data.profile.weak_areas) ? data.profile.weak_areas : [])
            };
            setProfile(normalizedProfile);
            setDraftProfile(normalizedProfile);
          }
          if (data.preferences) {
            const mergedPreferences = { ...preferences, ...data.preferences };
            setPreferences(mergedPreferences);
            setDraftPreferences(mergedPreferences);
          }
          if (data.interview) {
            const mergedInterview = { ...interview, ...data.interview };
            setInterview(mergedInterview);
            setDraftInterview(mergedInterview);
          }
          if (data.notifications) {
            const mergedNotifications = { ...notifications, ...data.notifications };
            setNotifications(mergedNotifications);
            setDraftNotifications(mergedNotifications);
          }
        }
      } catch (err) {
        console.error("Failed to load settings from MongoDB", err);
      }
    };
    loadSettings();
  }, [userId]);

  // 4. Save Changes to Server & State
  const handleSaveChanges = async () => {
    setProfile(draftProfile);
    setPreferences(draftPreferences);
    setInterview(draftInterview);
    setNotifications(draftNotifications);

    if (userId) {
      try {
        const response = await fetch("http://localhost:5000/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            profile: draftProfile,
            preferences: draftPreferences,
            interview: draftInterview,
            notifications: draftNotifications
          })
        });
        if (response.ok) {
          showSuccessToast("Settings saved successfully!");
          
          // Sync changes back to localStorage
          const updatedLocalProfile = {
            ...userProfile,
            ...draftProfile
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
      showSuccessToast("Settings saved successfully!");
      const updatedLocalProfile = {
        ...userProfile,
        ...draftProfile
      };
      localStorage.setItem('userProfile', JSON.stringify(updatedLocalProfile));
      if (onProfileUpdate) {
        onProfileUpdate(updatedLocalProfile);
      }
    }
  };

  // Revert drafts to saved state
  const handleCancel = () => {
    setDraftProfile({ ...profile });
    setDraftPreferences({ ...preferences });
    setDraftInterview({ ...interview });
    setDraftNotifications({ ...notifications });
    showSuccessToast("Changes discarded.");
  };

  // Export Data as JSON
  const handleExportData = () => {
    const exportPayload = {
      profile,
      preferences,
      interview,
      notifications,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${profile.name.replace(/\s+/g, '_')}_interview_coach_settings.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showSuccessToast("Data exported successfully!");
  };

  // Render Tabs
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'account', label: 'Account', icon: Trash },
  ];

  // Tab Content Renderers
  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-gray-50/50 border border-gray-100 rounded-2xl">
        <div className="relative group">
          <div className="w-24 h-24 rounded-2xl bg-[#4F46E5]/5 border border-[#E5E7EB] flex items-center justify-center text-4xl shadow-sm overflow-hidden select-none">
            {draftProfile.avatar && (draftProfile.avatar.startsWith('data:') || draftProfile.avatar.startsWith('http')) ? (
              <img src={draftProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{draftProfile.avatar || "👨‍💻"}</span>
            )}
          </div>
          <label className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-xs font-bold">
            Upload
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setDraftProfile({ ...draftProfile, avatar: reader.result });
                  };
                  reader.readAsDataURL(file);
                }
              }} 
              className="hidden" 
            />
          </label>
        </div>
        
        <div className="flex-grow space-y-2">
          <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block">Profile Photo</span>
          <p className="text-xs text-textSecondary">Upload a high-quality JPG, PNG or SVG profile picture. This custom photo will persist across the application.</p>
          <div className="flex items-center gap-3 pt-1">
            <label className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-textSecondary hover:text-textPrimary font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-all duration-200">
              Upload Custom Photo
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setDraftProfile({ ...draftProfile, avatar: reader.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
                className="hidden" 
              />
            </label>
            {draftProfile.avatar && (draftProfile.avatar.startsWith('data:') || draftProfile.avatar.startsWith('http')) && (
              <button
                type="button"
                onClick={() => setDraftProfile({ ...draftProfile, avatar: "👨‍💻" })}
                className="text-xs font-bold text-danger hover:text-danger/80"
              >
                Remove Photo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Full Name"
          value={draftProfile.name}
          onChange={(e) => setDraftProfile({ ...draftProfile, name: e.target.value })}
          required
        />
        <FormInput
          label="Email (Account ID)"
          value={draftProfile.email}
          disabled
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Degree / Major"
          value={draftProfile.degree}
          onChange={(e) => setDraftProfile({ ...draftProfile, degree: e.target.value })}
          placeholder="e.g. B.Tech in CS"
        />
        <FormInput
          label="Graduation Year"
          value={draftProfile.graduationYear}
          onChange={(e) => setDraftProfile({ ...draftProfile, graduationYear: e.target.value })}
          placeholder="e.g. 2026"
        />
      </div>

      <FormInput
        label="Target Role"
        value={draftProfile.targetRole}
        onChange={(e) => setDraftProfile({ ...draftProfile, targetRole: e.target.value })}
        placeholder="e.g. Machine Learning Engineer"
      />

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Career Goal</label>
        <textarea
          value={draftProfile.careerGoal || ""}
          onChange={(e) => setDraftProfile({ ...draftProfile, careerGoal: e.target.value })}
          rows="3"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 hover:border-[#4F46E5]/30 focus:border-[#4F46E5]/50 focus:ring-1 focus:ring-[#4F46E5]/20 rounded-xl text-textPrimary text-sm focus:outline-none transition-all duration-300 resize-none"
          placeholder="Describe your long-term career ambition..."
        />
      </div>

      <ChipsInput
        label="Skills"
        items={draftProfile.skills}
        onChange={(newSkills) => setDraftProfile({ ...draftProfile, skills: newSkills })}
        placeholder="Type a skill and press Enter or comma"
      />

      <ChipsInput
        label="Areas of Improvement"
        items={draftProfile.weakAreas}
        onChange={(newWeak) => setDraftProfile({ ...draftProfile, weakAreas: newWeak })}
        placeholder="Type an area of improvement and press Enter or comma"
      />
    </div>
  );

  const renderPreferences = () => {
    const roleOptions = [
      "Machine Learning Engineer", 
      "Data Scientist", 
      "Backend Developer", 
      "AI Engineer", 
      "Python Developer", 
      "Frontend Developer"
    ];
    const difficultyOptions = ["Easy", "Medium", "Hard", "Expert"];
    const questionTypeOptions = ["All", "HR", "Technical", "Project Based", "Behavioral", "Coding"];
    const themeOptions = ["Light", "Dark", "System"];
    const voiceOptions = ["Rachel (Default)", "Drew (Deep)", "Paul (Professional)", "Sarah (Friendly)"];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="Preferred Role"
            value={draftPreferences.role}
            onChange={(val) => setDraftPreferences({ ...draftPreferences, role: val })}
            options={roleOptions}
          />
          <FormSelect
            label="Difficulty Level"
            value={draftPreferences.difficulty}
            onChange={(val) => setDraftPreferences({ ...draftPreferences, difficulty: val })}
            options={difficultyOptions}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="Question Type"
            value={draftPreferences.questionType}
            onChange={(val) => setDraftPreferences({ ...draftPreferences, questionType: val })}
            options={questionTypeOptions}
          />
          <FormSelect
            label="Theme"
            value={draftPreferences.theme}
            onChange={(val) => setDraftPreferences({ ...draftPreferences, theme: val })}
            options={themeOptions}
          />
        </div>

        <FormSelect
          label="AI Voice"
          value={draftPreferences.voice}
          onChange={(val) => setDraftPreferences({ ...draftPreferences, voice: val })}
          options={voiceOptions}
        />

        <FormToggle
          label="Auto Save Changes"
          description="Automatically sync changes as you customize your interview dashboards."
          checked={draftPreferences.autoSave}
          onChange={(val) => setDraftPreferences({ ...draftPreferences, autoSave: val })}
        />
      </div>
    );
  };

  const renderInterview = () => {
    const avatarOptions = [
      "Virtual Assistant 🤖", 
      "Tech Interviewer 👨‍💼", 
      "HR Specialist 👩‍💼", 
      "Professional Coach 🎓"
    ];
    const voiceOptions = ["Assistant Voice", "Professional Male", "Friendly Female", "Robot"];
    const cameraOptions = ["Integrated Camera (Default)", "External USB Camera", "OBS Virtual Camera"];
    const micOptions = ["Default Audio Input", "External Microphone", "System Sound Device"];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="AI Avatar Agent"
            value={draftInterview.avatar}
            onChange={(val) => setDraftInterview({ ...draftInterview, avatar: val })}
            options={avatarOptions}
          />
          <FormSelect
            label="Voice Selection"
            value={draftInterview.voice}
            onChange={(val) => setDraftInterview({ ...draftInterview, voice: val })}
            options={voiceOptions}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="Camera Input"
            value={draftInterview.camera}
            onChange={(val) => setDraftInterview({ ...draftInterview, camera: val })}
            options={cameraOptions}
          />
          <FormSelect
            label="Microphone Input"
            value={draftInterview.microphone}
            onChange={(val) => setDraftInterview({ ...draftInterview, microphone: val })}
            options={micOptions}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <FormToggle
            label="Fullscreen Mode"
            description="Enter mock interview in full-screen proctored window."
            checked={draftInterview.fullscreen}
            onChange={(val) => setDraftInterview({ ...draftInterview, fullscreen: val })}
          />
          <FormToggle
            label="Eye Contact Detection"
            description="AI monitors your eye focus and gives active posture coaching."
            checked={draftInterview.eyeContact}
            onChange={(val) => setDraftInterview({ ...draftInterview, eyeContact: val })}
          />
          <FormToggle
            label="Interview Timer"
            description="Display remaining question time during sessions."
            checked={draftInterview.timer}
            onChange={(val) => setDraftInterview({ ...draftInterview, timer: val })}
          />
          <FormToggle
            label="Proctoring Mode"
            description="Check background tab switching or duplicate faces."
            checked={draftInterview.proctoring}
            onChange={(val) => setDraftInterview({ ...draftInterview, proctoring: val })}
          />
        </div>
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="bg-gray-50/30 border border-gray-150 rounded-2xl p-5 space-y-4">
        <FormToggle
          label="Email Notifications"
          description="Receive mock performance reports and weekly insights via email."
          checked={draftNotifications.email}
          onChange={(val) => setDraftNotifications({ ...draftNotifications, email: val })}
        />
        <FormToggle
          label="Interview Reminders"
          description="Get alert notifications for scheduled interviews."
          checked={draftNotifications.reminders}
          onChange={(val) => setDraftNotifications({ ...draftNotifications, reminders: val })}
        />
        <FormToggle
          label="Achievement Notifications"
          description="Notify me when I complete milestones or set top readiness score."
          checked={draftNotifications.achievements}
          onChange={(val) => setDraftNotifications({ ...draftNotifications, achievements: val })}
        />
      </div>
    </div>
  );

  const renderSecurity = () => {

    const handlePasswordSubmit = (e) => {
      e.preventDefault();
      if (passwordState.newPassword !== passwordState.confirm) {
        alert("New password and confirm password do not match.");
        return;
      }
      setPasswordState({ current: "", newPassword: "", confirm: "" });
      showSuccessToast("Password updated successfully!");
    };

    return (
      <div className="space-y-8">
        {/* Connection status */}
        <div className="p-5 bg-gray-50/50 border border-gray-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block">Connected Account</span>
            <span className="text-sm font-bold text-textPrimary mt-1 block">Linked via Identity Provider</span>
            <span className="text-xs text-textSecondary block mt-0.5">{profile.email}</span>
          </div>
          <button
            type="button"
            onClick={() => showSuccessToast("Connected with Google.")}
            className="px-4 py-2 border border-gray-250 hover:bg-gray-55 text-textPrimary text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Continue with Google
          </button>
        </div>

        {/* Change password */}
        <form onSubmit={handlePasswordSubmit} className="p-5 bg-white border border-gray-100 rounded-2xl space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-textPrimary">Change Password</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Current Password"
              type="password"
              value={passwordState.current}
              onChange={(e) => setPasswordState({ ...passwordState, current: e.target.value })}
              placeholder="••••••••"
              required
            />
            <FormInput
              label="New Password"
              type="password"
              value={passwordState.newPassword}
              onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
              placeholder="••••••••"
              required
            />
            <FormInput
              label="Confirm New Password"
              type="password"
              value={passwordState.confirm}
              onChange={(e) => setPasswordState({ ...passwordState, confirm: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary hover:bg-[#4F46E5]/95 text-white text-xs font-bold rounded-xl transition-all"
          >
            Update Password
          </button>
        </form>
      </div>
    );
  };

  const renderAccount = () => {
    return (
      <div className="space-y-6">
        <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#EF4444]">Danger Zone</h3>
            <p className="text-xs text-textSecondary mt-0.5">Permanently delete your account. This action cannot be undone.</p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen('delete')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#EF4444] hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all"
          >
            <Trash className="w-4 h-4" /> Delete Account
          </button>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfile();
      case 'notifications':
        return renderNotifications();
      case 'security':
        return renderSecurity();
      case 'account':
        return renderAccount();
      default:
        return null;
    }
  };

  const handleCloseModal = () => setModalOpen(null);

  return (
    <div className="space-y-8 relative">
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

      {/* Tab Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Navigation */}
        <div className="lg:col-span-1 bg-white border border-[#E5E7EB] rounded-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-3.5 space-y-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20 font-extrabold'
                    : 'text-textSecondary hover:bg-gray-50 hover:text-textPrimary'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-textSecondary'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Settings Form Container */}
        <div className="lg:col-span-3 bg-white border border-[#E5E7EB] rounded-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-8 flex flex-col min-h-[620px] transition-all duration-200">
          
          {/* Header row with Save / Cancel in the top-right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-textPrimary capitalize">{activeTab} Settings</h2>
              <p className="text-xs text-textSecondary mt-0.5">Customize your preferences and account options</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-textSecondary hover:text-textPrimary font-bold text-xs rounded-xl shadow-sm transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-primary hover:bg-[#4F46E5]/95 text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm hover:translate-y-[-1px]"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Render Tab Content */}
          <div className="flex-grow pt-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Delete Account Modal Dialog Overlay */}
      {modalOpen === 'delete' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-red-150 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-xl animate-scaleUp">
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
