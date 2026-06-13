import React from 'react';
import { Lock, Bell, Trash, ChevronRight } from 'lucide-react';

export default function AccountSettingsCard({ onChangePassword, onNotificationSettings, onDeleteAccount }) {
  return (
    <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl space-y-5 shadow-xl">
      <h3 className="text-lg font-semibold text-white">Account</h3>
      
      <div className="flex flex-col gap-3.5">
        {/* Change Password */}
        <button
          onClick={onChangePassword}
          className="w-full flex items-center justify-between p-4 bg-[#0B1020]/40 hover:bg-[#0B1020]/80 border border-[#1F2937] hover:border-primary/20 rounded-xl transition-all duration-300 group cursor-pointer text-left focus:outline-none"
        >
          <div className="flex items-center gap-3.5 text-gray-300 group-hover:text-white">
            <Lock className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
            <span className="text-sm font-semibold">Change Password</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
        </button>

        {/* Notification Settings */}
        <button
          onClick={onNotificationSettings}
          className="w-full flex items-center justify-between p-4 bg-[#0B1020]/40 hover:bg-[#0B1020]/80 border border-[#1F2937] hover:border-primary/20 rounded-xl transition-all duration-300 group cursor-pointer text-left focus:outline-none"
        >
          <div className="flex items-center gap-3.5 text-gray-300 group-hover:text-white">
            <Bell className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
            <span className="text-sm font-semibold">Notification Settings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
        </button>

        {/* Delete Account */}
        <button
          onClick={onDeleteAccount}
          className="w-full flex items-center justify-between p-4 bg-red-500/5 hover:bg-[#EF4444] border border-red-500/20 hover:border-red-500 rounded-xl transition-all duration-300 group cursor-pointer text-left focus:outline-none"
        >
          <div className="flex items-center gap-3.5 text-red-500 group-hover:text-white">
            <Trash className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
            <span className="text-sm font-semibold">Delete Account</span>
          </div>
          <ChevronRight className="w-4 h-4 text-red-500/40 group-hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  );
}
