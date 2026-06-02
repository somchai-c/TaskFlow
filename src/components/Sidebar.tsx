/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Kanban, 
  ClipboardList, 
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  X
} from 'lucide-react';
import { useTaskFlow } from '../context/TaskFlowContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobileDrawerOpen: boolean;
  onCloseMobileDrawer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  isMobileDrawerOpen,
  onCloseMobileDrawer
}) => {
  const { projects } = useTaskFlow();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Kanban Board', path: '/board', icon: Kanban },
    { name: 'Task List', path: '/tasks', icon: ClipboardList },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans border-r border-slate-200 dark:border-slate-800 transition-colors duration-200">
      {/* Mobile Close Button / Sidebar Brand Header (Only shown in Mobile Drawer) */}
      <div className="flex items-center justify-between h-16 px-4 md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-display font-medium text-lg">
            T
          </div>
          <span className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">TaskFlow</span>
        </div>
        <button 
          onClick={onCloseMobileDrawer}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links Grid */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onCloseMobileDrawer}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold select-none transition-all duration-150
              ${isActive 
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 shadow-none' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'} 
              ${(!isOpen && 'md:justify-center md:px-2')}
            `}
            title={!isOpen ? item.name : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className={`${!isOpen && 'md:hidden'} transition-opacity duration-200`}>
              {item.name}
            </span>
          </NavLink>
        ))}

        {/* Quick Shortcut Projects Divider */}
        <div className="pt-6 pb-2">
          <div className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 ${!isOpen && 'md:hidden'}`}>
            My Projects
          </div>
          <div className={`h-[1px] bg-slate-100 dark:bg-slate-800 my-2 ${isOpen ? 'mx-3' : 'mx-1'}`} />
        </div>

        {/* Quick link project items */}
        <div className="space-y-0.5 overflow-y-auto max-h-48 pr-1">
          {projects.map(proj => (
            <NavLink
              key={proj.id}
              to={`/projects/${proj.id}`}
              onClick={onCloseMobileDrawer}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold select-none transition-all truncate leading-5
                ${isActive 
                  ? 'bg-blue-50/40 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'}
                ${(!isOpen && 'md:justify-center md:px-2')}
              `}
              title={proj.name}
            >
              <FolderOpen className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span className={`truncate ${!isOpen && 'md:hidden'}`}>
                {proj.name}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer / Minimize Collapse Button on Desktop */}
      <div className="hidden md:flex p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 items-center justify-between transition-colors duration-200">
        {isOpen && (
          <div className="text-[10px] text-slate-450 font-mono select-none">
            v1.0.0 (Client Side)
          </div>
        )}
        <button
          onClick={onToggle}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-750 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mx-auto cursor-pointer ${isOpen ? '' : 'w-full'}`}
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          id="btn-sidebar-collapse-expand"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 mx-auto" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar Container */}
      <aside className={`h-screen hidden md:block transition-all duration-300 md:flex-shrink-0 bg-white dark:bg-slate-900 z-30
        ${isOpen ? 'w-60' : 'w-16'}`}
      >
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer Backdrop */}
      {isMobileDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-fade-in"
          onClick={onCloseMobileDrawer}
        />
      )}

      {/* 3. Mobile Navigation Drawer Container */}
      <aside className={`fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 ease-in-out md:hidden bg-white dark:bg-slate-900
        ${isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
