/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Avatar } from '../components/Avatar';
import { 
  Settings, 
  User, 
  BellRing, 
  SlidersHorizontal, 
  Volume2, 
  Check, 
  Save, 
  UserSquare2,
  Lock
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { currentUser, users, login, register } = useTaskFlow();

  // State handles matching layout
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [role, setRole] = useState(currentUser?.role || '');
  const [avatarColor, setAvatarColor] = useState(currentUser?.avatarColor || 'bg-blue-600');
  
  // Toggles Preferences states
  const [emailDigest, setEmailDigest] = useState(true);
  const [inAppPings, setInAppPings] = useState(true);
  const [playAudit, setPlayAudit] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const [notifSuccess, setNotifSuccess] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Mutate the local users list
    currentUser.name = name.trim();
    currentUser.email = email.trim();
    currentUser.role = role.trim();
    currentUser.avatarColor = avatarColor;
    
    // Recalculate initials
    const freshInitials = name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'U';
    currentUser.initials = freshInitials;

    // Trigger re-login to force refresh context state
    login(currentUser.email);

    setNotifSuccess(true);
    setTimeout(() => setNotifSuccess(false), 3000);
  };

  const colorOptions = [
    'bg-blue-600', 'bg-emerald-600', 'bg-indigo-600', 
    'bg-fuchsia-600', 'bg-rose-600', 'bg-amber-600', 
    'bg-violet-600', 'bg-sky-600'
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-slate-900 tracking-tight">
          Workspace Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize your professional identity and workspace interactive preferences.
        </p>
      </div>

      {notifSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl p-3.5 flex items-center gap-2.5 font-semibold">
          <Check className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Your preferences have been written successfully. Changes are now visible.</span>
        </div>
      )}

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card Settings (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden font-sans">
          <div className="p-4 md:p-5 border-b border-slate-200 flex items-center gap-2 select-none">
            <UserSquare2 className="w-5 h-5 text-blue-600" />
            <span className="font-display font-bold text-sm text-slate-900">Identity settings</span>
          </div>

          <form onSubmit={handleProfileSave} className="p-6 space-y-5">
            {/* Live profile display */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-slate-205 pb-5">
              <Avatar user={currentUser || undefined} size="xl" showTooltip={false} />
              
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-3">Custom Avatar Theme</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {colorOptions.map(clr => (
                    <button
                      key={clr}
                      type="button"
                      onClick={() => setAvatarColor(clr)}
                      className={`w-6 h-6 rounded-full ${clr} ring-offset-2 transition-all
                        ${avatarColor === clr ? 'ring-2 ring-blue-600 scale-105' : 'hover:scale-105'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* General form fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5 text-slate-400 leading-3">
                  Full Account Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  id="settings-name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5 text-slate-400 leading-3">
                  Professional Coordinate Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="settings-email"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5 text-slate-400 leading-3">
                  Organization Assignment Role
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  id="settings-role"
                />
              </div>

              {/* Mock Password block */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5 text-slate-400 leading-3">
                  Workspace Authentication Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 text-slate-400 rounded-xl py-2 pl-3 pr-8 text-xs cursor-not-allowed select-none"
                    value="DEMO_ACCOUNT_PASSWORD"
                    id="settings-password"
                  />
                  <Lock className="w-3.5 h-3.5 absolute top-2.5 right-2 text-slate-350" />
                </div>
              </div>
            </div>

            {/* Actions button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 select-none"
                id="btn-settings-save"
              >
                <Save className="w-4 h-4" />
                <span>Save credentials</span>
              </button>
            </div>
          </form>
        </div>

        {/* Side toggles: Notifications & Prefs (1/3 width) */}
        <div className="space-y-6">
          {/* Notification section */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden font-sans">
            <div className="p-4 md:p-5 border-b border-slate-200 flex items-center gap-2 select-none">
              <BellRing className="w-5 h-5 text-blue-600" />
              <span className="font-display font-bold text-sm text-slate-900">Simulate Notifications</span>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-650">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-750 block">Receive email digests</span>
                  <p className="text-[10px] text-slate-400 leading-normal">Updates on assigned lists sent once daily.</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4.5 w-4.5 text-blue-600 rounded bg-slate-50 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                  id="settings-notif-email"
                />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-750 block">In-app activity flashes</span>
                  <p className="text-[10px] text-slate-400 leading-normal">Receive desktop notifications about comments live.</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4.5 w-4.5 text-blue-600 rounded bg-slate-50 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  checked={inAppPings}
                  onChange={(e) => setInAppPings(e.target.checked)}
                  id="settings-notif-ping"
                />
              </div>
            </div>
          </div>

          {/* Preset presentation screen */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden font-sans">
            <div className="p-4 md:p-5 border-b border-slate-200 flex items-center gap-2 select-none">
              <SlidersHorizontal className="w-5 h-5 text-blue-600" />
              <span className="font-display font-bold text-sm text-slate-900">Workspace Presets</span>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-650">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-750 block">Sound effect cues</span>
                  <p className="text-[10px] text-slate-400 leading-normal">Play an acoustic trigger when dragging and dropping.</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4.5 w-4.5 text-blue-600 rounded bg-slate-50 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  checked={playAudit}
                  onChange={(e) => setPlayAudit(e.target.checked)}
                  id="settings-pref-audio"
                />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-750 block">High-Contrast Borders</span>
                  <p className="text-[10px] text-slate-400 leading-normal">Outlines elements to simplify readability screens.</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4.5 w-4.5 text-blue-600 rounded bg-slate-50 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  id="settings-pref-layouts"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
