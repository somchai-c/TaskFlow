/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import { Avatar } from '../components/Avatar';
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  Layers, 
  UserCircle2, 
  X,
  RefreshCw
} from 'lucide-react';

interface OutletContextType {
  onOpenCreateTask: () => void;
  onOpenTaskDetails: (task: Task) => void;
}

export const KanbanBoardScreen: React.FC = () => {
  const { tasks, projects, users, moveTask, comments } = useTaskFlow();
  const { onOpenCreateTask, onOpenTaskDetails } = useOutletContext<OutletContextType>();

  // Filter conditions
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const [hoverColumn, setHoverColumn] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Get all unique tags from currently loaded tasks
  const allAvailableTags = Array.from(
    new Set(tasks.flatMap(t => t.tags || []))
  ).filter(Boolean);

  // --- Filtering tasks logic from Flow 4 ---
  const filteredTasks = tasks.filter(t => {
    const matchesQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = !projectFilter || t.projectId === projectFilter;
    const matchesAssignee = !assigneeFilter || t.assigneeId === assigneeFilter;
    const matchesPriority = !priorityFilter || t.priority === priorityFilter;
    const matchesTag = !tagFilter || (t.tags && t.tags.includes(tagFilter));

    return matchesQuery && matchesProject && matchesAssignee && matchesPriority && matchesTag;
  });

  const clearAllFilters = () => {
    setSearchQuery('');
    setProjectFilter('');
    setAssigneeFilter('');
    setPriorityFilter('');
    setTagFilter('');
  };

  const hasAnyFilters = searchQuery || projectFilter || assigneeFilter || priorityFilter || tagFilter;

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setActiveDragId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, colStatus: string) => {
    e.preventDefault();
    setHoverColumn(colStatus);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setHoverColumn(null);
    setActiveDragId(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      moveTask(taskId, targetStatus);
    }
  };

  const getCommentsCountForTask = (taskId: string) => {
    return comments.filter(c => c.taskId === taskId).length;
  };

  const priorityColors: Record<TaskPriority, string> = {
    High: 'bg-rose-50 text-rose-700 border-rose-250',
    Medium: 'bg-amber-50 text-amber-700 border-amber-250',
    Low: 'bg-blue-50 text-blue-700 border-blue-250'
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Page Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100 flex-wrap sm:flex-nowrap">
        <div>
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-slate-800 tracking-tight">
            Kanban Visualizer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Drag items across columns to reflect changes in project phases instantly.
          </p>
        </div>

        <button
          onClick={onOpenCreateTask}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg transition-all select-none flex-shrink-0 cursor-pointer"
          id="btn-board-add"
        >
          <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span>New Task Item</span>
        </button>
      </div>

      {/* 2. Unified Filter panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Key Search Filter */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-450">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15"
              placeholder="Search by keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="input-board-query-filter"
            />
          </div>

          {/* Project select */}
          <select
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-705 dark:text-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            id="select-board-project-filter"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Assignee select */}
          <select
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-705 dark:text-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            id="select-board-assignee-filter"
          >
            <option value="">All Assignees</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {/* Priority select */}
          <select
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-750 dark:text-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority)}
            id="select-board-priority-filter"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {/* Tag Filter select */}
          <select
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-750 dark:text-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            id="select-board-tag-filter"
          >
            <option value="">All Labels ({allAvailableTags.length})</option>
            {allAvailableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        {/* Selected filter tags/chips row (PRD Flow 4) */}
        {hasAnyFilters && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-1">Active Filter Chips:</span>
              
              {searchQuery && (
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  <span>Query: "{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')} className="p-0.5 hover:text-slate-900"><X className="w-3 h-3" /></button>
                </span>
              )}

              {projectFilter && (
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  <span>Proj: {projects.find(p => p.id === projectFilter)?.name}</span>
                  <button onClick={() => setProjectFilter('')} className="p-0.5 hover:text-slate-900"><X className="w-3 h-3" /></button>
                </span>
              )}

              {assigneeFilter && (
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  <span>User: {users.find(u => u.id === assigneeFilter)?.name}</span>
                  <button onClick={() => setAssigneeFilter('')} className="p-0.5 hover:text-slate-900"><X className="w-3 h-3" /></button>
                </span>
              )}

              {priorityFilter && (
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  <span>Rank: {priorityFilter}</span>
                  <button onClick={() => setPriorityFilter('')} className="p-0.5 hover:text-slate-900"><X className="w-3 h-3" /></button>
                </span>
              )}

              {tagFilter && (
                <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3" />
                    <span>Label: "{tagFilter}"</span>
                  </span>
                  <button onClick={() => setTagFilter('')} className="p-0.5 hover:text-blue-900 dark:hover:text-blue-200"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>

            <button
              onClick={clearAllFilters}
              className="text-[10px] text-blue-600 hover:text-blue-800 font-extrabold flex items-center gap-1 leading-5 transition-all outline-none"
              id="btn-board-clear-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Global Gantt-style Column lanes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {(['Backlog', 'To Do', 'In Progress', 'Review', 'Done'] as TaskStatus[]).map(statusCol => {
          const colTasks = filteredTasks.filter(t => t.status === statusCol);
          const isDragingOverCol = hoverColumn === statusCol;

          return (
            <div
              key={statusCol}
              onDragOver={(e) => handleDragOver(e, statusCol)}
              onDragLeave={() => setHoverColumn(null)}
              onDrop={(e) => handleDrop(e, statusCol)}
              className={`rounded-2xl p-3 border min-w-[210px] h-[65vh] flex flex-col transition-all duration-150 shadow-sm
                ${isDragingOverCol 
                  ? 'bg-blue-50/40 border-blue-400 scale-[1.01] shadow-md' 
                  : statusCol === 'In Progress' 
                    ? 'bg-blue-50/20 border-blue-100' 
                    : 'bg-slate-100/50 border-slate-200'}`}
            >
              {/* Lane header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 select-none">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full
                    ${statusCol === 'Backlog' ? 'bg-slate-400' : ''}
                    ${statusCol === 'To Do' ? 'bg-indigo-500' : ''}
                    ${statusCol === 'In Progress' ? 'bg-blue-600' : ''}
                    ${statusCol === 'Review' ? 'bg-purple-600' : ''}
                    ${statusCol === 'Done' ? 'bg-emerald-500' : ''}
                  `}></span>
                  <span className="text-xs font-bold text-slate-705">{statusCol}</span>
                </div>
                <span className="text-[10px] font-bold bg-slate-200/60 px-2 py-0.5 rounded-full font-mono text-slate-650">
                  {colTasks.length}
                </span>
              </div>

              {/* Lane Cards Stream */}
              <div className="flex-1 overflow-y-auto pt-3 space-y-2.5 pr-0.5">
                <AnimatePresence mode="popLayout">
                  {colTasks.length > 0 ? (
                    colTasks.map(task => {
                      const assign = users.find(u => u.id === task.assigneeId);
                      const proj = projects.find(p => p.id === task.projectId);
                      const commCount = getCommentsCountForTask(task.id);
                      const isDraggingThis = activeDragId === task.id;

                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95, y: 15 }}
                          animate={{ 
                            opacity: isDraggingThis ? 0.35 : 1, 
                            scale: isDraggingThis ? 0.96 : 1,
                            y: 0 
                          }}
                          exit={{ opacity: 0, scale: 0.95, y: -15 }}
                          transition={{ 
                            type: 'spring', 
                            stiffness: 300, 
                            damping: 30, 
                            layout: { duration: 0.2, type: 'spring', stiffness: 220, damping: 25 }
                          }}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={() => setActiveDragId(null)}
                          onClick={() => onOpenTaskDetails(task)}
                          className={`bg-white dark:bg-slate-900 border rounded-xl p-3.5 shadow-sm select-none space-y-2.5 group relative overflow-hidden transition-colors duration-150
                            ${isDraggingThis 
                              ? 'border-dashed border-blue-500 dark:border-blue-700 bg-blue-50/15 dark:bg-blue-950/20 shadow-none pointer-events-none select-none' 
                              : 'cursor-grab active:cursor-grabbing'}
                            ${!isDraggingThis && task.priority === 'High' 
                              ? 'border-blue-200 dark:border-blue-800/80 pl-4.5 font-sans' 
                              : !isDraggingThis ? 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800' : ''}`}
                        >
                          {task.priority === 'High' && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                          )}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-1 select-none">
                              <span className="text-[8px] font-extrabold uppercase font-mono tracking-widest text-slate-400 block truncate max-w-[110px]">{proj?.name}</span>
                              <span className={`text-[8px] font-extrabold uppercase font-mono tracking-wider border px-1.5 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </span>
                            </div>
                            
                            <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 pt-0.5">
                              {task.title}
                            </h4>
                          </div>

                          {/* Applied Task Tag Badge Stream */}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {task.tags.map(tag => (
                                <span 
                                  key={tag} 
                                  className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-355 border border-slate-200/50 dark:border-slate-800/80"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Card metadata (Comment Count, Dates, Assigned initials) */}
                          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-2.5 flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                            {/* Left metadata */}
                            <div className="flex items-center gap-2">
                              {/* Comments Count bubble */}
                              <span className="flex items-center gap-0.5 text-[9px] hover:text-slate-650 dark:hover:text-slate-300" title={`${commCount} comments posted`}>
                                <MessageSquare className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 animate-pulse-subtle" />
                                <span>{commCount}</span>
                              </span>
                              
                              {/* Calendar icon */}
                              <span className="flex items-center gap-0.5 transform leading-3">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </span>
                            </div>

                            {/* Right Avatar */}
                            <Avatar user={assign} size="xs" showTooltip={true} />
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="h-full border border-dashed border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center justify-center p-6 text-center select-none bg-slate-50/5 dark:bg-slate-900/5"
                    >
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono leading-relaxed">
                        Lanes empty.
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
