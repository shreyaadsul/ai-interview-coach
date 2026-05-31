import React, { useState, useRef, useEffect } from 'react';
import { Bell, Plus, Edit2, Check, CheckCircle2, AlertCircle, User, Briefcase, GraduationCap, FileText, Settings, LogOut } from 'lucide-react';

export default function Header({ userName = 'Shreya Adsul', onNewInterview, onNameChange, onLogout, currentPage, resumeData = {} }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
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
    <header className="flex items-center justify-between py-6 px-8 ml-64 bg-navy-900/50 backdrop-blur-md sticky top-0 z-40 border-b border-white/5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">Welcome back,</span>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="bg-navy-800 border border-primary/50 rounded-lg px-2 py-0.5 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/50 w-32"
                autoFocus
              />
              <button onClick={handleSave} className="p-1 rounded-md bg-success/20 text-success hover:bg-success/30 transition-colors">
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)} title="Click to edit name">
              <h1 className="text-2xl font-bold text-white">Welcome back, {firstName}! 👋</h1>
              <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 text-gray-400 transition-all">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-400">Here's your interview performance overview.</p>
      </div>

      <div className="flex items-center gap-6">
        
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-gray-300'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-navy-900" />}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-navy-800 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fadeIn">
              <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Notifications</h3>
                {unreadCount > 0 && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">{unreadCount} New</span>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-white/5' : 'opacity-70'}`}>
                    <div className="mt-0.5 flex-shrink-0">
                      {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-success" />}
                      {notif.type === 'warning' && <AlertCircle className="w-4 h-4 text-warning" />}
                      {notif.type === 'info' && <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">i</div>}
                    </div>
                    <div>
                      <p className={`text-sm leading-snug ${!notif.read ? 'text-white font-medium' : 'text-gray-300'}`}>{notif.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              {unreadCount > 0 && (
                <div className="p-3 text-center border-t border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors" onClick={handleMarkAllRead}>
                  <span className="text-xs font-semibold text-primary">Mark all as read</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Profile Dropdown */}
        <div className="relative border-l border-white/10 pl-6 flex items-center gap-3" ref={profileRef}>
          <img 
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${firstName}&backgroundColor=7C3AED`} 
            alt="User Avatar" 
            className="w-10 h-10 rounded-full border border-white/10 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
            onClick={() => setShowProfile(!showProfile)}
          />
          
          {showProfile && (
            <div className="absolute right-0 top-14 w-72 bg-navy-800 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fadeIn">
              {/* Profile Header */}
              <div className="p-5 border-b border-white/10 bg-gradient-to-br from-primary/10 to-transparent">
                <div className="flex items-center gap-4">
                  <img 
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${firstName}&backgroundColor=7C3AED`} 
                    alt="User Avatar" 
                    className="w-14 h-14 rounded-full border-2 border-primary/50"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{userName}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">{resumeData?.experience_level || 'Entry-Level'}</p>
                  </div>
                </div>
              </div>
              
              {/* Profile Details */}
              <div className="p-2">
                <div className="px-3 py-2 flex items-center gap-3 text-sm text-gray-300">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <span className="truncate" title={resumeData?.education || "No education added"}>
                    {resumeData?.education || "B.Sc. Computer Science"}
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center gap-3 text-sm text-gray-300">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="truncate" title={resumeData?.suggested_roles?.[0] || "Software Engineer"}>
                    Target: {resumeData?.suggested_roles?.[0] || "Software Engineer"}
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center gap-3 text-sm text-gray-300">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>Resume Score: <span className="font-bold text-white">{resumeData?.resume_score || 0}</span></span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-white/10 p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-left">
                  <Settings className="w-4 h-4" />
                  Account Settings
                </button>
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors text-left"
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:-translate-y-0.5 ml-3"
          >
            <Plus className="w-4 h-4" />
            New Interview
          </button>
        )}
      </div>
    </header>
  );
}
