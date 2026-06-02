/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Avatar } from '../components/Avatar';
import { Search, FolderKanban, Plus, Layers, CheckCircle2, TrendingUp, X } from 'lucide-react';
import { CreateProjectModal } from '../components/CreateProjectModal';

export const ProjectsScreen: React.FC = () => {
  const { projects, users, tasks, getProjectProgress } = useTaskFlow();

  // Modal open states local hook
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filter settings
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Completed'>('All');

  // Filter products list
  const filteredProjects = projects.filter(proj => {
    const progress = getProjectProgress(proj.id);
    const matchesSearch = proj.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          proj.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'Completed') {
      return matchesSearch && progress === 100;
    }
    if (statusFilter === 'Active') {
      return matchesSearch && progress < 100;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200 flex-wrap sm:flex-nowrap">
        <div>
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-slate-900 tracking-tight">
            Team Projects
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Build and synchronize collaborative structures within your active squads.
          </p>
        </div>

        {/* Create button */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg transition-all select-none flex-shrink-0 cursor-pointer"
          id="btn-project-add-action"
        >
          <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span>Add Project Board</span>
        </button>
      </div>

      {/* Interactive Toolbars */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="input-project-search"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1 overflow-x-auto select-none">
          {(['All', 'Active', 'Completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer
                ${statusFilter === f 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 font-extrabold' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              {f} Projects
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Boards */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(proj => {
            const progress = getProjectProgress(proj.id);
            const projectTasks = tasks.filter(t => t.projectId === proj.id);
            const doneTasksCount = projectTasks.filter(t => t.status === 'Done').length;
            const completionBadgeClass = progress === 100 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
              : 'bg-blue-50 border-blue-100 text-blue-700';

            return (
              <div 
                key={proj.id}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                {/* Title */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <span className="p-2 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 font-medium">
                      <FolderKanban className="w-5 h-5" />
                    </span>
                    <span className={`text-[10px] items-center gap-1 px-2.5 py-0.5 border rounded-full font-bold uppercase tracking-wider ${completionBadgeClass}`}>
                      {progress === 100 ? 'Complete' : `${progress}% Done`}
                    </span>
                  </div>
                  
                  <Link 
                    to={`/projects/${proj.id}`}
                    className="font-display font-extrabold text-lg text-slate-900 hover:text-blue-600 tracking-tight leading-tight block pt-1.5"
                  >
                    {proj.name}
                  </Link>

                  <p className="text-xs text-slate-500 font-sans line-clamp-2 leading-relaxed">
                    {proj.description || 'No objectives outlines registered for this workspace.'}
                  </p>
                </div>

                {/* Progress scale */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium font-mono">
                    <span>{projectTasks.length} total deliverables</span>
                    <span>{doneTasksCount} complete</span>
                  </div>
                </div>

                {/* Bottom row: Crew members list */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <div className="flex -space-x-2.5 overflow-hidden">
                    {proj.members.map(memb => {
                      const mUser = users.find(u => u.id === memb);
                      return <Avatar key={memb} user={mUser} size="xs" showTooltip={true} />;
                    })}
                  </div>

                  <Link 
                    to={`/projects/${proj.id}`}
                    className="text-xs font-bold text-blue-600 group hover:text-blue-800 transition-colors flex items-center gap-0.5"
                  >
                    <span>Inspect board</span>
                    <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border rounded-2xl border-dashed border-slate-205 py-16 px-4 text-center">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-display font-bold text-sm text-slate-900">No workspaces matched</h3>
          <p className="text-xs text-slate-550 mt-1 max-w-sm mx-auto">
            Try adjusting your search filters or create a brand new team project to get started immediately.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg text-xs transition-colors"
          >
            Launch Project
          </button>
        </div>
      )}

      {/* Create project modal overlay */}
      {isCreateOpen && (
        <CreateProjectModal 
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </div>
  );
};
