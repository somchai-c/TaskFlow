/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Avatar } from './Avatar';
import { Search, Bell, ChevronDown, LogOut, ChevronRight, Projector, CheckSquare, Plus, Sun, Moon } from 'lucide-react';
import { Task } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenCreateTask: () => void;
  onOpenTaskDetails: (task: Task) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  onOpenCreateTask,
  onOpenTaskDetails 
}) => {
  const { currentUser, users, login, logout, tasks, projects, isDarkMode, toggleDarkMode } = useTaskFlow();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const bellDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (bellDropdownRef.current && !bellDropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = tasks.filter(t => 
      t.title.toLowerCase().includes(query) || 
      t.description.toLowerCase().includes(query)
    );
    setSearchResults(filtered);
  }, [searchQuery, tasks]);

  // Mock notifications based on current tasks
  const mockNotifications = [
    {
      id: 1,
      title: 'New Comment on Wireframes',
      desc: 'Sarah Johnson commented on "Create homepage wireframes"',
      time: '10 mins ago',
      unread: true
    },
    {
      id: 2,
      title: 'Task Assigned To You',
      desc: 'You have been assigned to "Configure telemetry reporting"',
      time: '1 hr ago',
      unread: true
    },
    {
      id: 3,
      title: 'Milestone Met',
      desc: 'Website redesign is now 68% complete',
      time: '4 hrs ago',
      unread: false
    }
  ];

  const handleUserSwitch = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      login(selectedUser.email);
    }
    setShowUserDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 h-16 flex items-center justify-between px-4 md:px-6 transition-colors duration-200">
      {/* Left section: Hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors md:block"
          aria-label="Toggle Navigation"
          id="btn-toggle-sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-display font-bold text-lg shadow-sm">
              T
            </div>
            <span className="font-display font-bold text-lg text-slate-800 dark:text-slate-200 tracking-tight hidden sm:block">
              TaskFlow
            </span>
          </div>
        </div>
      </div>

      {/* Middle section: Global Search Bar */}
      <div className="relative flex-1 max-w-md mx-4 md:mx-8">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 dark:placeholder-slate-500 transition-all font-sans"
            placeholder="Search tasks globally..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="input-global-search"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 text-xs font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Global Search Expandable Panel */}
        {searchQuery.trim().length > 0 && (
          <div className="absolute top-12 left-0 right-0 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5 border-b border-slate-100">
              Found {searchResults.length} Tasks
            </div>
            {searchResults.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {searchResults.map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <button
                      key={task.id}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-sm transition-colors rounded-lg group"
                      onClick={() => {
                        onOpenTaskDetails(task);
                        setSearchQuery('');
                      }}
                    >
                      <div className="min-w-0 pr-4">
                        <div className="font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </div>
                        <div className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                          <span>{project?.name || 'No Project'}</span>
                          <span>•</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium 
                            ${task.priority === 'High' ? 'bg-rose-50 text-rose-600' : ''}
                            ${task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : ''}
                            ${task.priority === 'Low' ? 'bg-blue-50 text-blue-600' : ''}
                          `}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                No tasks found.
                <div className="text-xs text-slate-400 mt-1">Try adapting your search criteria.</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right section: Utilities & User profile */}
      <div className="flex items-center gap-3">
        {/* Quick Add Task Button */}
        <button
          onClick={onOpenCreateTask}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all hover:shadow hover:translate-y-[-1px] select-none"
          id="btn-quick-create-task"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>

        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
          id="btn-toggle-theme"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-amber-500 hover:scale-110 transition-transform" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={bellDropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
            id="btn-notifications-menu"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Notifications Dropdown Grid */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50">
                <span className="font-display font-bold text-sm text-slate-800">Recent Notifications</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">2 New</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {mockNotifications.map(n => (
                  <div key={n.id} className={`p-3 text-xs text-slate-600 hover:bg-slate-50 transition-colors ${n.unread ? 'bg-blue-50/20' : ''}`}>
                    <div className="flex justify-between items-start mb-0.5">
                      <span className={`font-semibold ${n.unread ? 'text-slate-800' : 'text-slate-700'}`}>{n.title}</span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{n.time}</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed font-sans">{n.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 text-center bg-slate-50">
                <button className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                  Clear All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Account / Profile dropdown selector */}
        <div className="relative" ref={userDropdownRef}>
          <button 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-1.5 p-1 hover:bg-slate-100 rounded-lg transition-colors"
            id="btn-user-profile-menu"
          >
            <Avatar user={currentUser || undefined} size="sm" showTooltip={false} />
            <div className="hidden lg:block text-left pr-1">
              <div className="text-xs font-semibold text-slate-800 leading-3">
                {currentUser ? currentUser.name : 'Guest User'}
              </div>
              <div className="text-[9px] text-slate-400 font-mono mt-0.5 leading-3">
                {currentUser ? currentUser.role : 'Freelancer'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Expanded dropdown swapper */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {/* Account header */}
              <div className="p-3 bg-slate-50 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Active Workspace User
                </span>
                <div className="flex items-center gap-2">
                  <Avatar user={currentUser || undefined} size="sm" showTooltip={false} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate leading-4">
                      {currentUser?.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                      {currentUser?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Swapping entries */}
              <div className="p-1 max-h-48 overflow-y-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2.5 pt-1.5 pb-1">
                  Switch Active Identity:
                </span>
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleUserSwitch(u.id)}
                    className={`w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg flex items-center justify-between text-xs transition-colors
                      ${currentUser?.id === u.id ? 'bg-blue-50/55 font-semibold text-blue-700' : 'text-slate-600'}
                    `}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar user={u} size="xs" showTooltip={false} />
                      <div className="truncate">
                        <div className="truncate font-medium">{u.name}</div>
                        <div className="text-[9px] text-slate-400 font-mono truncate">{u.role}</div>
                      </div>
                    </div>
                    {currentUser?.id === u.id && (
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 p-1 bg-slate-50/50">
                <button 
                  onClick={logout}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-semibold rounded-lg flex items-center gap-2 text-xs transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout from Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
