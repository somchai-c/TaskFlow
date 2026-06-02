/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParams, useOutletContext, Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import { Avatar } from '../components/Avatar';
import { 
  Plus, 
  BarChart4, 
  Grid3X3, 
  List, 
  Calendar, 
  Users, 
  AlertTriangle,
  FolderDot,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface OutletContextType {
  onOpenCreateTask: () => void;
  onOpenTaskDetails: (task: Task) => void;
}

export const ProjectDetailsScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, tasks, users, getProjectProgress, moveTask } = useTaskFlow();
  const { onOpenCreateTask, onOpenTaskDetails } = useOutletContext<OutletContextType>();

  // Switch between Kanban Board vs Task List within the project
  const [activeView, setActiveView] = useState<'board' | 'list'>('board');
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const project = projects.find(p => p.id === id);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const progress = getProjectProgress(project.id);

  // Statistics
  const backlogTasks = projectTasks.filter(t => t.status === 'Backlog');
  const todoTasks = projectTasks.filter(t => t.status === 'To Do');
  const inProgressTasks = projectTasks.filter(t => t.status === 'In Progress');
  const reviewTasks = projectTasks.filter(t => t.status === 'Review');
  const doneTasks = projectTasks.filter(t => t.status === 'Done');

  // Drag and drop parameters for local columns
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setActiveDragId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setActiveDragId(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      moveTask(taskId, targetStatus);
    }
  };

  const priorityColors: Record<TaskPriority, string> = {
    High: 'bg-rose-50 text-rose-700 border-rose-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  const statusColors: Record<TaskStatus, { bg: string, text: string }> = {
    'Backlog': { bg: 'bg-slate-50', text: 'text-slate-600 border-slate-200' },
    'To Do': { bg: 'bg-indigo-50/50', text: 'text-indigo-700 border-indigo-200' },
    'In Progress': { bg: 'bg-blue-50/50', text: 'text-blue-700 border-blue-200' },
    'Review': { bg: 'bg-purple-50/50', text: 'text-purple-700 border-purple-200' },
    'Done': { bg: 'bg-emerald-50/50', text: 'text-emerald-700 border-emerald-200' }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Project Info Header Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -z-10 opacity-70"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-slate-450 font-medium text-xs">
               <Link to="/projects" className="hover:text-slate-800 transition-colors">Projects</Link>
               <ChevronRight className="w-3.5 h-3.5 text-slate-350" />
               <span className="text-slate-650 font-bold">{project.name}</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight text-slate-900 leading-tight">
              {project.name}
            </h2>
            <p className="text-slate-500 font-sans text-xs md:text-sm leading-relaxed">
              {project.description || 'Full outlines and objectives overview has not been assigned for this board yet.'}
            </p>
          </div>

          {/* Progress gauge */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl md:w-64">
            <div className="w-12 h-12 rounded-full border-4 border-blue-600 bg-white shadow-sm flex items-center justify-center font-display font-bold text-slate-800 text-sm flex-shrink-0">
              {progress}%
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-0.5">Project Done Scale</span>
              <span className="text-xs font-bold text-slate-700 block truncate">{doneTasks.length} / {projectTasks.length} items complete</span>
              <div className="w-24 bg-slate-200 rounded-full h-1 mt-1">
                <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Members and view toggling row */}
        <div className="border-t border-slate-200 mt-6 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Members */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>Project Crew:</span>
            </span>
            <div className="flex -space-x-2.5 overflow-hidden">
              {project.members.map(memberId => {
                const u = users.find(user => user.id === memberId);
                return <Avatar key={memberId} user={u} size="sm" showTooltip={true} />;
              })}
            </div>
          </div>

          {/* View switcher & task creation */}
          <div className="flex items-center gap-3">
            {/* View Switcher Layout Buttons */}
            <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center select-none">
              <button
                onClick={() => setActiveView('board')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer
                  ${activeView === 'board' ? 'bg-white text-slate-800 shadow-xs font-extrabold' : 'text-slate-550 hover:text-slate-850'}`}
              >
                <Grid3X3 className="w-4 h-4 text-xs" />
                <span className="hidden sm:inline">Kanban Board</span>
              </button>
              <button
                onClick={() => setActiveView('list')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer
                  ${activeView === 'list' ? 'bg-white text-slate-800 shadow-xs font-extrabold' : 'text-slate-550 hover:text-slate-850'}`}
              >
                <List className="w-4 h-4 text-xs" />
                <span className="hidden sm:inline">Register List</span>
              </button>
            </div>

            {/* Quick Create Button within this project */}
            <button
              onClick={onOpenCreateTask}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              id="btn-project-add-task"
            >
              <Plus className="w-4 h-4" />
              <span>Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Visual Columns Content Area */}
      {activeView === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {(['Backlog', 'To Do', 'In Progress', 'Review', 'Done'] as TaskStatus[]).map(colStatus => {
            const colTasks = projectTasks.filter(t => t.status === colStatus);
            return (
              <div 
                key={colStatus}
                className={`rounded-2xl p-3 border min-w-[210px] h-[65vh] flex flex-col shadow-sm transition-all
                  ${colStatus === 'In Progress' 
                    ? 'bg-blue-50/20 border-blue-100' 
                    : 'bg-slate-100/50 border-slate-200'}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, colStatus)}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-1.5 pb-2.5 border-b border-slate-200 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                    <span className="text-xs font-bold text-slate-705">{colStatus}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-200/60 text-slate-650 px-2 py-0.5 rounded-full font-mono">
                    {colTasks.length}
                  </span>
                </div>

                {/* Subtask list */}
                <div className="flex-1 overflow-y-auto pt-3 space-y-2.5 pr-0.5">
                  <AnimatePresence mode="popLayout">
                    {colTasks.length > 0 ? (
                      colTasks.map(task => {
                        const asign = users.find(u => u.id === task.assigneeId);
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
                                : 'cursor-grab active:cursor-grabbing hover:scale-[1.01]'}
                              ${!isDraggingThis && task.priority === 'High' 
                                ? 'border-blue-200 dark:border-blue-800/80 pl-4.5 font-sans' 
                                : !isDraggingThis ? 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800' : ''}`}
                          >
                            {task.priority === 'High' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                            )}
                            <div className="space-y-1">
                              <span className={`text-[8px] font-extrabold uppercase font-mono tracking-widest border px-1.5 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </span>
                              <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pt-1">
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

                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-2 text-[9px] text-slate-400 dark:text-slate-500">
                              <span className="font-mono font-medium">Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              <Avatar user={asign} size="xs" showTooltip={true} />
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
                        className="h-full border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center p-4 min-h-[100px] bg-slate-50/5 dark:bg-slate-900/5"
                      >
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-mono leading-relaxed">
                          Drop Tasks Here
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* project granular task register table view */
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] text-slate-450 uppercase font-mono border-b border-slate-200 select-none font-sans">
                <tr>
                  <th className="px-5 py-3">Task Name</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {projectTasks.length > 0 ? (
                  projectTasks.map(task => {
                    const assign = users.find(u => u.id === task.assigneeId);
                    return (
                      <tr 
                        key={task.id}
                        onClick={() => onOpenTaskDetails(task)}
                        className="hover:bg-slate-50/50 cursor-pointer transition-colors group select-none"
                      >
                        <td className="px-5 py-3.5 font-semibold text-slate-800 max-w-xs truncate group-hover:text-blue-650">
                          {task.title}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <Avatar user={assign} size="xs" showTooltip={false} />
                            <span className="font-medium text-slate-700 truncate max-w-[120px]">{assign?.name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`text-[9px] font-bold border px-2.5 py-0.5 rounded-full
                            ${task.status === 'Done' ? statusColors['Done'].text : ''}
                            ${task.status === 'Review' ? statusColors['Review'].text : ''}
                            ${task.status === 'In Progress' ? statusColors['In Progress'].text : ''}
                            ${task.status === 'To Do' ? statusColors['To Do'].text : ''}
                            ${task.status === 'Backlog' ? statusColors['Backlog'].text : ''}
                          `}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[10px] text-slate-500">
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 p-4 text-center text-slate-400 font-sans">
                      No deliverables created inside this workspace. Click **Add Task** to start.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
