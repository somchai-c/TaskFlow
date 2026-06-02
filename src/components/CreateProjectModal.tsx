/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Avatar } from './Avatar';
import { X, Check } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { users, addProject } = useTaskFlow();
  
  // State elements
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Verification
    if (!name.trim()) {
      setValidationError('Project name is required.');
      return;
    }

    addProject(name.trim(), description.trim(), selectedMembers);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-shake-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <span className="font-display font-bold text-lg text-slate-800">Create New Project</span>
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

          {/* Project Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 align-middle">
              Project Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400"
              placeholder="e.g., Marketing Q3 Plan, Sales Funnel, API Redoc"
              value={name}
              onChange={(e) => setName(e.target.value)}
              id="input-project-name"
            />
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Description / Core Objectives
            </label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 h-24 resize-none"
              placeholder="What does this project group encompass?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              id="input-project-description"
              maxLength={500}
            />
          </div>

          {/* Members Selection List */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Assign Team Members ({selectedMembers.length} selected)
            </label>
            <div className="border border-slate-200 rounded-lg h-36 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
              {users.map(u => {
                const isSelected = selectedMembers.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleMember(u.id)}
                    className="w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar user={u} size="xs" showTooltip={false} />
                      <div>
                        <p className="font-semibold text-slate-800 leading-3">{u.name}</p>
                        <p className="text-[10px] text-slate-400 leading-3 mt-0.5">{u.role}</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors
                      ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-350 bg-white'}`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions panel */}
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
              id="btn-project-save"
            >
              Launch Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
