/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import { X } from 'lucide-react';

interface CreateEditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task; // If provided, we are in EDIT mode
}

export const CreateEditTaskModal: React.FC<CreateEditTaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit
}) => {
  const { projects, users, addTask, updateTask } = useTaskFlow();
  
  // State elements
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [dueDate, setDueDate] = useState('');
  
  const [validationError, setValidationError] = useState('');

  // Prepopulate if editing
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setProjectId(taskToEdit.projectId);
      setAssigneeId(taskToEdit.assigneeId);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setDueDate(taskToEdit.dueDate);
    } else {
      // Create defaults
      setTitle('');
      setDescription('');
      setProjectId(projects[0]?.id || '');
      setAssigneeId(users[0]?.id || '');
      setPriority('Medium');
      setStatus('To Do');
      // Set default due date to 5 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 5);
      setDueDate(defaultDate.toISOString().split('T')[0]);
    }
  }, [taskToEdit, projects, users]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // --- Core Client-Side Validation (As specified in Flow 1) ---
    if (!title.trim()) {
      setValidationError('Task title is required.');
      return;
    }

    if (!projectId) {
      setValidationError('Please select a project.');
      return;
    }

    if (!dueDate) {
      setValidationError('Please select a valid upcoming deadline.');
      return;
    }

    // "Due date cannot be in the past."
    // Current application virtual context timestamp is 2026-06-02.
    const todayStr = '2026-06-02';
    if (dueDate < todayStr) {
      setValidationError('Due date cannot be in the past.');
      return;
    }

    if (description.length > 2000) {
      setValidationError('Description exceeds maximum character length (2000 chars).');
      return;
    }

    if (taskToEdit) {
      // Perform Edit
      updateTask({
        ...taskToEdit,
        title: title.trim(),
        description: description.trim(),
        projectId,
        assigneeId,
        priority,
        status,
        dueDate
      });
    } else {
      // Perform New Task Addition
      addTask(
        title.trim(),
        description.trim(),
        projectId,
        assigneeId,
        priority,
        status,
        dueDate
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-xl overflow-hidden animate-shake-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <span className="font-display font-bold text-lg text-slate-800">
            {taskToEdit ? 'Modify Work Item' : 'Create New Team Task'}
          </span>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg p-3 font-semibold">
              {validationError}
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 align-middle">
              Task Name / Action Item <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 font-medium"
              placeholder="e.g., Code API gateway wrappers, Setup CDN caches"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id="input-task-title"
            />
          </div>

          {/* Dual columns for Project & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project Select */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Project Belonging <span className="text-rose-500">*</span>
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                id="select-task-project"
              >
                <option value="">Select Target Project...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Assignee Select */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Assignee Owner
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                id="select-task-assignee"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dual columns for Status, Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Priority Select */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Priority Ranking
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                id="select-task-priority"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Workflow Status
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                id="select-task-status"
              >
                <option value="Backlog">Backlog</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Due Date Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Due Date Target <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                id="input-task-duedate"
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Full Description / Subtasks Details
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                {description.length} / 2000 chars
              </span>
            </div>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 h-28 resize-none"
              placeholder="Break down this task's deliverables so there is complete clarity among teammates."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              id="input-task-description"
              maxLength={2000}
            />
          </div>

          {/* Actions Panel */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-md shadow-blue-500/10 transition-colors"
              id="btn-task-save"
            >
              {taskToEdit ? 'Save Changes' : 'Publish Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
