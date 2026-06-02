/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import { Avatar } from './Avatar';
import { 
  X, 
  Trash2, 
  Edit3, 
  Calendar, 
  Tag, 
  CheckSquare, 
  Folder, 
  MessageSquare,
  Clock,
  ArrowRight
} from 'lucide-react';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  onClose,
  onEdit
}) => {
  const { 
    projects, 
    users, 
    getCommentsForTask, 
    addComment, 
    deleteTask, 
    updateTask, 
    currentUser 
  } = useTaskFlow();

  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [localTagInput, setLocalTagInput] = useState('');

  const handleDetailsAddTag = () => {
    const trimmed = localTagInput.trim();
    if (trimmed) {
      const currentTags = task.tags || [];
      if (!currentTags.includes(trimmed)) {
        const updatedTags = [...currentTags, trimmed];
        updateTask({ ...task, tags: updatedTags });
      }
    }
    setLocalTagInput('');
  };

  const project = projects.find(p => p.id === task.projectId);
  const assignee = users.find(u => u.id === task.assigneeId);
  const commentsList = getCommentsForTask(task.id);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');

    // --- Comment validation (As specified in Flow 5) ---
    if (!newComment.trim()) {
      setCommentError('Comment message cannot be empty.');
      return;
    }

    if (newComment.length > 1000) {
      setCommentError('Message must be under 1000 characters.');
      return;
    }

    addComment(task.id, newComment.trim());
    setNewComment('');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to permanently delete this task?')) {
      deleteTask(task.id);
      onClose();
    }
  };

  const handleQuickStatusChange = (newStatus: TaskStatus) => {
    updateTask({ ...task, status: newStatus });
  };

  const handleQuickPriorityChange = (newPriority: TaskPriority) => {
    updateTask({ ...task, priority: newPriority });
  };

  // Helper date formatter
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/85 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-shake-in duration-200 text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/40 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
              ID: {task.id}
            </span>
            <span className={`text-[10px] uppercase font-mono tracking-wider font-bold px-2 py-0.5 rounded
              ${task.priority === 'High' ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400' : ''}
              ${task.priority === 'Medium' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400' : ''}
              ${task.priority === 'Low' ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' : ''}
            `}>
              {task.priority} Priority
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={onEdit}
              className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Edit Task Details"
              id="btn-details-edit"
            >
              <Edit3 className="w-4.5 h-4.5" />
            </button>
            <button 
              onClick={handleDelete}
              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="Delete Task"
              id="btn-details-delete"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
            <div className="h-4 w-[1px] bg-slate-200 mx-1" />
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
              id="btn-details-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal body (Scrollable Grid) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Context Left Section (2/3 columns on wide screens) */}
          <div className="col-span-1 md:col-span-2 space-y-5">
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest block mb-1">
                {project?.name || 'Unassigned Project'}
              </span>
              <h2 className="font-display font-bold text-xl md:text-2xl text-slate-800 leading-snug">
                {task.title}
              </h2>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Description
              </span>
              <div className="bg-slate-50/50 border border-slate-150 rounded-xl p-4 text-xs md:text-sm text-slate-600 leading-relaxed font-sans whitespace-pre-wrap">
                {task.description || (
                  <span className="italic text-slate-400">No descriptive text provided for this task.</span>
                )}
              </div>
            </div>

            {/* Activity comments Timeline Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Discussion Stream ({commentsList.length})
                </span>
              </div>

              {/* Comments Render Grid */}
              <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                {commentsList.length > 0 ? (
                  commentsList.map(comm => {
                    const commentAuthor = users.find(u => u.id === comm.userId);
                    return (
                      <div key={comm.id} className="flex gap-2.5 items-start">
                        <Avatar user={commentAuthor} size="sm" showTooltip={true} />
                        <div className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-2xl rounded-tl-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-xs text-slate-800">
                              {commentAuthor?.name || 'Unknown Teammate'}
                            </span>
                            <span className="text-[9px] text-slate-400 flex items-center gap-1 font-mono">
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-sans leading-relaxed">
                            {comm.message}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/10">
                    <p className="text-xs text-slate-400 font-sans">
                      No remarks recorded on this task yet.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Type below to commence collaboration.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit comment form */}
              <form onSubmit={handleAddComment} className="pt-2 space-y-2">
                {commentError && (
                  <div className="text-rose-600 text-[11px] font-semibold">{commentError}</div>
                )}
                <div className="flex gap-2.5 items-end">
                  <div className="flex-1 relative">
                    <textarea
                      placeholder={currentUser ? `Commenting as ${currentUser.name}...` : `Type a team response...`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 pr-14 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 h-16 resize-none"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      id="textarea-task-comment"
                      maxLength={1000}
                    />
                    <span className="absolute bottom-2 right-3 text-[9px] font-mono text-slate-400">
                      {newComment.length}/1000
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 hover:shadow transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
                    id="btn-comment-submit"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Quick Config Sidebar Right Section (1/3 column) */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 md:p-5 space-y-4 h-fit text-xs text-slate-700 dark:text-slate-300">
            <span className="font-display font-extrabold text-[10px] text-slate-400 uppercase tracking-widest block border-b border-slate-200 pb-1.5">
              Task Configurations
            </span>

            {/* Assignee Details */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Owner / Assignee</span>
              <div className="flex items-center gap-2 capitalize">
                <Avatar user={assignee} size="sm" showTooltip={false} />
                <div>
                  <p className="font-bold text-slate-800 leading-tight">{assignee?.name || 'Unassigned'}</p>
                  <p className="text-[9px] text-slate-400 font-mono leading-tight">{assignee?.role || 'Teammate'}</p>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Project</span>
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <Folder className="w-4 h-4 text-slate-400" />
                <span>{project?.name || 'General Overheads'}</span>
              </div>
            </div>

            {/* Due date */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Target Deadline</span>
              <div className="flex items-center gap-2 font-semibold text-rose-600 font-mono">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            </div>

            {/* Dynamic Interactive Quick Status Setter */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Quick Status Shift</span>
              <select
                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={task.status}
                onChange={(e) => handleQuickStatusChange(e.target.value as TaskStatus)}
                id="select-quick-status"
              >
                <option value="Backlog">Backlog</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Dynamic Interactive Quick Priority Setter */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Priority Leverage</span>
              <select
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={task.priority}
                onChange={(e) => handleQuickPriorityChange(e.target.value as TaskPriority)}
                id="select-quick-priority"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            {/* Custom Tags Section */}
            <div className="space-y-1.5 border-t border-slate-200/60 dark:border-slate-800/60 pt-3">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 block uppercase flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
                <span>Labels / Tags</span>
              </span>
              
              {/* Display existing tags as small badges */}
              {task.tags && task.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {task.tags.map(t => (
                    <span 
                      key={t}
                      className="flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      <span className="truncate max-w-[80px]">{t}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedTags = (task.tags || []).filter(item => item !== t);
                          updateTask({ ...task, tags: updatedTags });
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-200/40 dark:hover:bg-slate-700/50 transition-colors"
                        title={`Remove tag: ${t}`}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-450 dark:text-slate-500 italic pb-0.5">No custom labels applied.</p>
              )}

              {/* Add tag controls inside details popup */}
              <div className="flex gap-1.5 mt-2">
                <input
                  type="text"
                  placeholder="New label..."
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-1 px-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium"
                  value={localTagInput}
                  onChange={(e) => setLocalTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleDetailsAddTag();
                    }
                  }}
                  id="input-quick-add-tag"
                />
                <button
                  type="button"
                  onClick={handleDetailsAddTag}
                  className="px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md text-[10px] transition-colors cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
