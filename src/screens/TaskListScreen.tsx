/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import { Avatar } from '../components/Avatar';
import { 
  Plus, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight, 
  X,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

interface OutletContextType {
  onOpenCreateTask: () => void;
  onOpenTaskDetails: (task: Task) => void;
}

type SortField = 'title' | 'project' | 'priority' | 'status' | 'dueDate';
type SortOrder = 'asc' | 'desc';

export const TaskListScreen: React.FC = () => {
  const { tasks, projects, users } = useTaskFlow();
  const { onOpenCreateTask, onOpenTaskDetails } = useOutletContext<OutletContextType>();

  // Filter settings
  const [searchQuery, setSearchQuery] = useState('');
  const [projectSelect, setProjectSelect] = useState('');
  const [assigneeSelect, setAssigneeSelect] = useState('');
  const [prioritySelect, setPrioritySelect] = useState('');
  const [statusSelect, setStatusSelect] = useState('');

  // Sorting parameters
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Pagination parameters
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Perfect size to immediately trigger pagination with MOCK data

  // Filter tasks list
  const filteredTasks = tasks.filter(t => {
    const matchesQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = !projectSelect || t.projectId === projectSelect;
    const matchesAssignee = !assigneeSelect || t.assigneeId === assigneeSelect;
    const matchesPriority = !prioritySelect || t.priority === prioritySelect;
    const matchesStatus = !statusSelect || t.status === statusSelect;

    return matchesQuery && matchesProject && matchesAssignee && matchesPriority && matchesStatus;
  });

  // Sorting weights for priority and status
  const priorityWeight: Record<TaskPriority, number> = { High: 3, Medium: 2, Low: 1 };
  const statusWeight: Record<TaskStatus, number> = {
    'Backlog': 1,
    'To Do': 2,
    'In Progress': 3,
    'Review': 4,
    'Done': 5
  };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let fieldA: any = a[sortField] || '';
    let fieldB: any = b[sortField] || '';

    if (sortField === 'project') {
      const pA = projects.find(p => p.id === a.projectId)?.name || '';
      const pB = projects.find(p => p.id === b.projectId)?.name || '';
      fieldA = pA.toLowerCase();
      fieldB = pB.toLowerCase();
    } else if (sortField === 'priority') {
      fieldA = priorityWeight[a.priority];
      fieldB = priorityWeight[b.priority];
    } else if (sortField === 'status') {
      fieldA = statusWeight[a.status];
      fieldB = statusWeight[b.status];
    } else if (typeof fieldA === 'string') {
      fieldA = fieldA.toLowerCase();
      fieldB = fieldB.toLowerCase();
    }

    if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Get range for pagination
  const totalItems = sortedTasks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  // Safe page constraint resetting
  const adjustedCurrentPage = currentPage > totalPages ? totalPages : currentPage;
  const startIndex = (adjustedCurrentPage - 1) * itemsPerPage;
  const paginatedTasks = sortedTasks.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setProjectSelect('');
    setAssigneeSelect('');
    setPrioritySelect('');
    setStatusSelect('');
    setCurrentPage(1);
  };

  const hasAnyFilters = searchQuery || projectSelect || assigneeSelect || prioritySelect || statusSelect;

  const renderSortArrow = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-350 shrink-0 select-none opacity-50" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-blue-600 shrink-0 select-none animate-bounce" /> 
      : <ArrowDown className="w-3.5 h-3.5 text-blue-600 shrink-0 select-none animate-bounce" />;
  };

  const priorityColors: Record<TaskPriority, string> = {
    High: 'bg-rose-50 text-rose-700 border-rose-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  const statusColors: Record<TaskStatus, string> = {
    'Backlog': 'bg-slate-100 text-slate-600',
    'To Do': 'bg-blue-50 text-blue-700',
    'In Progress': 'bg-indigo-50 text-indigo-700',
    'Review': 'bg-purple-50 text-purple-700',
    'Done': 'bg-emerald-50 text-emerald-800'
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200 flex-wrap sm:flex-nowrap">
        <div>
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-slate-900 tracking-tight">
            Deliverable Registry
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and filter tasks inside an interactive spreadsheet table context.
          </p>
        </div>

        <button
          onClick={onOpenCreateTask}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg transition-all select-none flex-shrink-0 cursor-pointer"
          id="btn-list-add"
        >
          <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span>Add Task Word</span>
        </button>
      </div>

      {/* Modular Filtering Panels */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Key Search Filter */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-450">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15"
              placeholder="Search deliverable..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              id="input-list-query-filter"
            />
          </div>

          {/* Project select */}
          <select
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            value={projectSelect}
            onChange={(e) => { setProjectSelect(e.target.value); setCurrentPage(1); }}
            id="select-list-project-filter"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Assignee select */}
          <select
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            value={assigneeSelect}
            onChange={(e) => { setAssigneeSelect(e.target.value); setCurrentPage(1); }}
            id="select-list-assignee-filter"
          >
            <option value="">All Assignees</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {/* Priority select */}
          <select
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            value={prioritySelect}
            onChange={(e) => { setPrioritySelect(e.target.value); setCurrentPage(1); }}
            id="select-list-priority-filter"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {/* Status select */}
          <select
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            value={statusSelect}
            onChange={(e) => { setStatusSelect(e.target.value); setCurrentPage(1); }}
            id="select-list-status-filter"
          >
            <option value="">All Statuses</option>
            <option value="Backlog">Backlog</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Done">Done</option>
          </select>
        </div>

        {/* Dynamic filter chips (PRD Flow 4) */}
        {hasAnyFilters && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-200 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">Active Filters:</span>
              
              {searchQuery && (
                <span className="text-[10px] bg-slate-100 text-slate-650 border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  <span>Contains: "{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')} className="p-0.5 hover:text-slate-900"><X className="w-3 h-3" /></button>
                </span>
              )}

              {projectSelect && (
                <span className="text-[10px] bg-slate-100 text-slate-650 border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  <span>Proj: {projects.find(p => p.id === projectSelect)?.name}</span>
                  <button onClick={() => setProjectSelect('')} className="p-0.5 hover:text-slate-900"><X className="w-3 h-3" /></button>
                </span>
              )}

              {assigneeSelect && (
                <span className="text-[10px] bg-slate-100 text-slate-650 border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  <span>Assignee: {users.find(u => u.id === assigneeSelect)?.name}</span>
                  <button onClick={() => setAssigneeSelect('')} className="p-0.5 hover:text-slate-900"><X className="w-3 h-3" /></button>
                </span>
              )}

              {prioritySelect && (
                <span className="text-[10px] bg-slate-100 text-slate-650 border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  <span>Priority: {prioritySelect}</span>
                  <button onClick={() => setPrioritySelect('')} className="p-0.5 hover:text-slate-900"><X className="w-3 h-3" /></button>
                </span>
              )}

              {statusSelect && (
                <span className="text-[10px] bg-slate-100 text-slate-650 border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  <span>Status: {statusSelect}</span>
                  <button onClick={() => setStatusSelect('')} className="p-0.5 hover:text-slate-900"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>

            <button
              onClick={clearAllFilters}
              className="text-[10px] text-blue-600 hover:text-blue-800 font-extrabold flex items-center gap-1 leading-5 transition-all outline-none"
              id="btn-list-clear-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Central Spreadsheet Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] text-slate-450 uppercase font-mono border-b border-slate-200 select-none">
              <tr>
                <th className="px-5 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1">
                    <span>Task Name</span>
                    {renderSortArrow('title')}
                  </div>
                </th>
                <th className="px-4 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('project')}>
                  <div className="flex items-center gap-1">
                    <span>Project Board</span>
                    {renderSortArrow('project')}
                  </div>
                </th>
                <th className="px-4 py-4">Assignee</th>
                <th className="px-4 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('priority')}>
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    {renderSortArrow('priority')}
                  </div>
                </th>
                <th className="px-4 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">
                    <span>Workflow Status</span>
                    {renderSortArrow('status')}
                  </div>
                </th>
                <th className="px-4 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('dueDate')}>
                  <div className="flex items-center gap-1">
                    <span>Due Date Target</span>
                    {renderSortArrow('dueDate')}
                  </div>
                </th>
              </tr>
            </thead>

            {/* Table layout rows */}
            <tbody className="divide-y divide-slate-200 font-sans">
              {paginatedTasks.length > 0 ? (
                paginatedTasks.map(task => {
                  const assignUser = users.find(u => u.id === task.assigneeId);
                  const projectObj = projects.find(p => p.id === task.projectId);
                  return (
                    <tr 
                      key={task.id}
                      onClick={() => onOpenTaskDetails(task)}
                      className="hover:bg-slate-50/55 cursor-pointer transition-colors group select-none"
                    >
                      {/* Name */}
                      <td className="px-5 py-4 font-semibold text-slate-800 max-w-sm truncate group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </td>

                      {/* Project */}
                      <td className="px-4 py-4 text-slate-550 whitespace-nowrap font-medium">
                        <span className="flex items-center gap-1.5">
                          <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span>{projectObj?.name || 'General Board'}</span>
                        </span>
                      </td>

                      {/* Assignee */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Avatar user={assignUser} size="xs" showTooltip={false} />
                          <span className="font-semibold text-slate-700">{assignUser?.name || 'Unassigned'}</span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold select-none ${statusColors[task.status]}`}>
                          {task.status}
                        </span>
                      </td>

                      {/* Due date */}
                      <td className="px-4 py-4 whitespace-nowrap font-mono text-[10px] text-slate-500 font-semibold">
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 font-sans">
                    No active tasks match the filters combined.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Spreadsheet Pagination Controls Panel (PRD specification) */}
        {totalPages > 1 && (
          <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between select-none font-sans">
            <span className="text-[11px] text-slate-450 font-medium">
              Showing <span className="font-bold text-slate-700">{startIndex + 1}</span> to <span className="font-bold text-slate-700">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="font-bold text-slate-700">{totalItems}</span> matching items
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-xs text-slate-650 font-bold flex items-center gap-0.5 transition-colors disabled:cursor-not-allowed cursor-pointer"
                id="btn-list-page-prev"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              
              <div className="px-3 text-xs font-bold text-slate-700 text-center font-mono">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-xs text-slate-650 font-bold flex items-center gap-0.5 transition-colors disabled:cursor-not-allowed cursor-pointer"
                id="btn-list-page-next"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
