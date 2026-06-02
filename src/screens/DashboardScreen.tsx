/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Task } from '../types';
import { Avatar } from '../components/Avatar';
import { 
  Plus, 
  Folder, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Play
} from 'lucide-react';

interface OutletContextType {
  onOpenCreateTask: () => void;
  onOpenTaskDetails: (task: Task) => void;
}

export const DashboardScreen: React.FC = () => {
  const { tasks, projects, users, currentUser, getProjectProgress } = useTaskFlow();
  const { onOpenCreateTask, onOpenTaskDetails } = useOutletContext<OutletContextType>();

  // Derived statistics helper variables
  const totalTasks = tasks.length;
  const backlogCount = tasks.filter(t => t.status === 'Backlog').length;
  const todoCount = tasks.filter(t => t.status === 'To Do').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const reviewCount = tasks.filter(t => t.status === 'Review').length;
  const doneCount = tasks.filter(t => t.status === 'Done').length;
  
  // Calculate aggregate progress percentage across all tasks
  const aggregateProgress = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  // Upcoming deadlines (Tasks with due dates, sorted chronologically, filtered if not completed)
  // Virtual current timestamp is 2026-06-02. Show tasks close to or after this date.
  const upcomingDeadlines = tasks
    .filter(t => t.status !== 'Done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Recent tasks activity stream (recently modified tasks or first 4 from list for UI richness)
  const recentTasks = [...tasks]
    .sort((a, b) => b.id.localeCompare(a.id)) // Quick proxy for newest added in context
    .slice(0, 4);

  // Helper priority color map
  const getPriorityBadgeClass = (p: string) => {
    switch (p) {
      case 'High': return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'Medium': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'Low': return 'bg-blue-50 border-blue-200 text-blue-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  // Helper status color map
  const getStatusBadgeClass = (s: string) => {
    switch (s) {
      case 'Backlog': return 'bg-slate-100 text-slate-650';
      case 'To Do': return 'bg-blue-50 text-blue-650';
      case 'In Progress': return 'bg-indigo-50 text-indigo-600';
      case 'Review': return 'bg-purple-50 text-purple-650';
      case 'Done': return 'bg-emerald-50 text-emerald-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header Greeting Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl">
        <div className="space-y-1">
          <span className="text-xs bg-white/15 px-3 py-1 rounded-full font-bold uppercase tracking-widest inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workspace Center</span>
          </span>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight mt-1">
            Welcome back, {currentUser?.name || 'Teammate'}!
          </h1>
          <p className="text-blue-105 text-sm max-w-xl font-medium">
            You operate as <span className="underline decoration-blue-300 font-bold">{currentUser?.role}</span>. Here is how your company workspaces, backlogs, and team progress stand today.
          </p>
        </div>

        {/* Quick launcher action points */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreateTask}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-blue-700 text-xs font-bold rounded-xl transition-all shadow-md shadow-slate-900/10 hover:shadow-slate-900/15"
            id="btn-dash-create-btn"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Work Item</span>
          </button>
        </div>
      </div>

      {/* 2. Stats Dashboard Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Aggregate Progress Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Aggregate Output</span>
            <span className="font-display font-bold text-lg md:text-2xl text-slate-900 leading-tight block">{aggregateProgress}%</span>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${aggregateProgress}%` }}></div>
            </div>
          </div>
        </div>

        {/* Stat 2: Active Projects */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Active Hubs</span>
            <span className="font-display font-bold text-lg md:text-2xl text-slate-900 leading-tight block">{projects.length}</span>
            <span className="text-[9px] text-slate-400">Collaborative Boards</span>
          </div>
        </div>

        {/* Stat 3: Running In Progress Tasks */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">In Progress Items</span>
            <span className="font-display font-bold text-lg md:text-2xl text-slate-900 leading-tight block">{inProgressCount}</span>
            <span className="text-[9px] text-slate-400">{reviewCount} in active code review</span>
          </div>
        </div>

        {/* Stat 4: Accomplished Done Milestones */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Completed Tasks</span>
            <span className="font-display font-bold text-lg md:text-2xl text-slate-900 leading-tight block">{doneCount}</span>
            <span className="text-[9px] text-slate-400">{totalTasks - doneCount} remaining in queue</span>
          </div>
        </div>
      </div>

      {/* 3. Deep Bento Layout (Main Streams vs Project List) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Recent Stream & Deadlines (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent tasks visual workspace */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 md:p-5">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
              <span className="font-display font-bold text-sm text-slate-900">
                Recent Tasks Activity
              </span>
              <Link 
                to="/tasks"
                className="text-xs text-blue-600 hover:text-blue-800 font-bold transition-all flex items-center gap-1 leading-5"
              >
                <span>View Full Registry</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentTasks.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentTasks.map(task => {
                  const assignee = users.find(u => u.id === task.assigneeId);
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <div 
                      key={task.id}
                      onClick={() => onOpenTaskDetails(task)}
                      className="py-3 px-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group select-none"
                    >
                      <div className="min-w-0 max-w-md pr-1">
                        <div className="font-semibold text-xs md:text-sm text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                          {task.title}
                        </div>
                        <div className="text-[10px] text-slate-450 truncate flex items-center gap-2 mt-0.5">
                          <span className="font-medium text-slate-500">{project?.name || 'Overheads'}</span>
                          <span>•</span>
                          <span className="font-mono">Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Status Badge */}
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold select-none ${getStatusBadgeClass(task.status)}`}>
                          {task.status}
                        </span>

                        {/* Priority Border Card */}
                        <span className={`text-[9px] px-2 py-0.5 border rounded-full font-bold select-none ${getPriorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </span>

                        {/* Assignee Avatar */}
                        <Avatar user={assignee} size="sm" showTooltip={true} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center text-slate-400 text-sm">
                No active tasks found in the registry.
                <button onClick={onOpenCreateTask} className="text-blue-600 block mx-auto font-bold mt-1 text-xs hover:underline">
                  Create your first task!
                </button>
              </div>
            )}
          </div>

          {/* Upcoming deadlines */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 md:p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-rose-500" />
              <span className="font-display font-bold text-sm text-slate-900">
                Critical Deadlines Pipeline
              </span>
            </div>

            {upcomingDeadlines.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {upcomingDeadlines.map(task => {
                  const assignee = users.find(u => u.id === task.assigneeId);
                  const project = projects.find(p => p.id === task.projectId);
                  
                  // Compute if task is overdue compared to 2026-06-02
                  const isOverdue = task.dueDate < '2026-06-02';
                  
                  return (
                    <div 
                      key={task.id}
                      onClick={() => onOpenTaskDetails(task)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between h-28 hover:shadow-sm
                        ${isOverdue 
                          ? 'bg-rose-50/20 border-rose-200 hover:border-rose-300' 
                          : 'bg-slate-50/20 border-slate-200 hover:border-slate-300'}`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider truncate">{project?.name || 'General'}</span>
                          {isOverdue && (
                            <span className="text-[8px] bg-rose-155 text-rose-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest flex items-center gap-0.5 animate-pulse">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Overdue</span>
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight">
                          {task.title}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-250/50 pt-2 text-[10px]">
                        <span className={`font-mono font-bold font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                          Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <Avatar user={assignee} size="xs" showTooltip={true} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                No active deadlines found! Enjoy a clear board.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Visual Project health cards (1/3 width) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 md:p-5">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
              <span className="font-display font-bold text-sm text-slate-900">
                Project Velocity Boards
              </span>
              <Link 
                to="/projects"
                className="text-xs text-blue-600 hover:text-blue-800 font-bold transition-all flex items-center"
              >
                <span>View All</span>
              </Link>
            </div>

            <div className="space-y-4">
              {projects.map(proj => {
                const calculatedProgress = getProjectProgress(proj.id);
                const projTasks = tasks.filter(t => t.projectId === proj.id);
                const completionBadgeClass = calculatedProgress === 100 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-blue-100 text-blue-800';

                return (
                  <div key={proj.id} className="p-3.5 border border-slate-150 hover:border-slate-250 rounded-xl space-y-3 transition-colors bg-slate-50/20">
                    {/* Title */}
                    <div className="flex items-start justify-between gap-1.5 min-w-0">
                      <Link 
                        to={`/projects/${proj.id}`}
                        className="text-xs md:text-sm font-bold text-slate-900 hover:text-blue-600 truncate leading-snug"
                      >
                        {proj.name}
                      </Link>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${completionBadgeClass}`}>
                        {calculatedProgress}%
                      </span>
                    </div>

                    {/* Dynamic progress sliders */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${calculatedProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-450 font-medium">
                        <span>{projTasks.length} Active Work items</span>
                        <span>{projTasks.filter(t => t.status === 'Done').length} Complete</span>
                      </div>
                    </div>

                    {/* Project crew list circles */}
                    <div className="flex -space-x-2.5 overflow-hidden">
                      {proj.members.map(memberId => {
                        const mUser = users.find(u => u.id === memberId);
                        return <Avatar key={memberId} user={mUser} size="xs" showTooltip={true} />;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Helper Widget */}
          <div className="bg-blue-50/30 border border-blue-50/60 rounded-2xl p-4 md:p-5 relative overflow-hidden">
            <span className="font-display font-black text-[10px] tracking-widest text-blue-600 uppercase block mb-1">
              TaskFlow Pro-Tip
            </span>
            <p className="text-xs leading-relaxed text-slate-600">
              Double click elements inside the **Kanban Board** to initiate drag-and-drops instantly. You can easily switch active team identites using the profile menu in the upper right.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
