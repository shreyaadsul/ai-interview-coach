import React, { useState, useRef, useEffect } from 'react';
import { Bell, Plus, Edit2, Check, CheckCircle2, AlertCircle, User, Briefcase, GraduationCap, FileText, Settings, LogOut, Search, X, ChevronRight } from 'lucide-react';

export default function Header({ userName = 'Shreya Adsul', avatar, onNewInterview, onNameChange, onLogout, currentPage, resumeData = {}, setCurrentPage, interviewHistory = [], onSelectReport }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const firstName = userName.split(' ')[0];

  const initialNotifications = [
    { id: 1, type: 'success', text: 'Resume parsed successfully! You are ready for mock interviews.', time: 'Just now', read: false },
    { id: 2, type: 'warning', text: 'Proctoring system flagged 1 warning in your last session.', time: '2 hours ago', read: false },
    { id: 3, type: 'info', text: 'New AI Interview role added: Product Manager', time: '1 day ago', read: false }
  ];

  const [notifications, setNotifications] = useState(initialNotifications);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const navigationActions = [
    { label: "Go to Dashboard", page: "Dashboard", category: "Navigation" },
    { label: "Go to Resume Analysis", page: "Resume Analysis", category: "Navigation" },
    { label: "Go to Mock Interview", page: "Mock Interview", category: "Navigation" },
    { label: "Go to ATS Checker", page: "ATS Checker", category: "Navigation" },
    { label: "Go to Interview History", page: "Interview History", category: "Navigation" },
    { label: "Go to Settings", page: "Settings", category: "Navigation" },
    { label: "Start a New Interview", page: "NewInterviewAction", category: "Actions" },
  ];

  const filteredActions = navigationActions.filter(action =>
    action.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = (interviewHistory || []).filter(item => {
    const roleMatch = (item.role || item.target_role || "").toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatch = (item.interview_type || item.type || "").toLowerCase().includes(searchQuery.toLowerCase());
    const difficultyMatch = (item.difficulty || "").toLowerCase().includes(searchQuery.toLowerCase());
    return roleMatch || typeMatch || difficultyMatch;
  });

  const hasResults = filteredActions.length > 0 || filteredHistory.length > 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = () => {
    setIsEditing(false);
    if (onNameChange && tempName.trim() !== '') {
      onNameChange(tempName);
    } else {
      setTempName(userName);
    }
  };

  return (
    <header className="flex items-center justify-between py-2.5 px-8 ml-[260px] bg-white sticky top-0 z-40 border-b border-[#E5E7EB] min-h-[56px] h-[56px]">
      {/* Left side: Greeting */}
      <div className="text-lg font-bold text-textPrimary">
        Hi, {firstName} 👋
      </div>

      <div className="flex items-center gap-4">
        
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-gray-100 text-textPrimary' : 'hover:bg-gray-50 text-textSecondary'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white" />}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.08)] z-50 overflow-hidden animate-fadeIn">
              <div className="p-4 border-b border-[#E5E7EB] bg-gray-50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-textPrimary">Notifications</h3>
                {unreadCount > 0 && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{unreadCount} New</span>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-primary/5' : 'opacity-70'}`}>
                    <div className="mt-0.5 flex-shrink-0">
                      {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-success" />}
                      {notif.type === 'warning' && <AlertCircle className="w-4 h-4 text-warning" />}
                      {notif.type === 'info' && <div className="w-4 h-4 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold">i</div>}
                    </div>
                    <div>
                      <p className={`text-sm leading-snug ${!notif.read ? 'text-textPrimary font-medium' : 'text-textSecondary'}`}>{notif.text}</p>
                      <p className="text-xs text-textSecondary mt-1">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              {unreadCount > 0 && (
                <div className="p-3 text-center border-t border-[#E5E7EB] bg-white hover:bg-gray-50 cursor-pointer transition-colors" onClick={handleMarkAllRead}>
                  <span className="text-xs font-semibold text-primary">Mark all as read</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Profile Dropdown */}
        <div className="relative border-l border-[#E5E7EB] pl-4 flex items-center gap-3" ref={profileRef}>
          <div 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            {avatar ? (
              <div 
                className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-lg hover:ring-2 hover:ring-primary/30 transition-all select-none overflow-hidden"
              >
                {avatar.startsWith('data:') || avatar.startsWith('http') ? (
                  <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  avatar
                )}
              </div>
            ) : (
              <img 
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${firstName}&backgroundColor=4F46E5`} 
                alt="User Avatar" 
                className="w-8 h-8 rounded-full border border-gray-200 hover:ring-2 hover:ring-primary/30 transition-all"
              />
            )}
            <span className="text-xs font-bold text-textPrimary group-hover:text-primary transition-colors">
              {userName}
            </span>
          </div>
          
          {showProfile && (
            <div className="absolute right-0 top-12 w-72 bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.08)] z-50 overflow-hidden animate-fadeIn">
              {/* Profile Header */}
              <div className="p-5 border-b border-[#E5E7EB] bg-gray-50">
                <div className="flex items-center gap-4">
                  {avatar ? (
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl select-none overflow-hidden">
                      {avatar.startsWith('data:') || avatar.startsWith('http') ? (
                        <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
                      ) : (
                        avatar
                      )}
                    </div>
                  ) : (
                    <img 
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${firstName}&backgroundColor=4F46E5`} 
                      alt="User Avatar" 
                      className="w-12 h-12 rounded-full border border-gray-200"
                    />
                  )}
                  <div>
                    <h3 className="text-base font-bold text-textPrimary leading-tight">{userName}</h3>
                    <p className="text-xs text-textSecondary mt-0.5">{resumeData?.experience_level || 'Entry-Level'}</p>
                  </div>
                </div>
              </div>
              
              {/* Profile Details */}
              <div className="p-2 space-y-0.5">
                <div className="px-3 py-2 flex items-center gap-3 text-sm text-textSecondary">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <span className="truncate" title={resumeData?.education || "No education added"}>
                    {resumeData?.education || "B.Sc. Computer Science"}
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center gap-3 text-sm text-textSecondary">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="truncate" title={resumeData?.suggested_roles?.[0] || "Software Engineer"}>
                    Target: {resumeData?.suggested_roles?.[0] || "Software Engineer"}
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center gap-3 text-sm text-textSecondary">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>Resume Score: <span className="font-bold text-textPrimary">{resumeData?.resume_score || '--'}</span></span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-[#E5E7EB] p-2">
                <button 
                  onClick={() => {
                    if (setCurrentPage) setCurrentPage('Settings');
                    setShowProfile(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-gray-50 transition-colors text-left"
                >
                  <Settings className="w-4 h-4" />
                  Account Settings
                </button>
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {currentPage === 'Resume Analysis' && (
          <button 
            onClick={onNewInterview}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/95 hover:shadow-sm transition-all ml-2"
          >
            <Plus className="w-4 h-4" />
            New Interview
          </button>
        )}
      </div>
    </header>
  );
}
