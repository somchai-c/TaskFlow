/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { CreateEditTaskModal } from './CreateEditTaskModal';
import { CreateProjectModal } from './CreateProjectModal';
import { TaskDetailsModal } from './TaskDetailsModal';
import { Task } from '../types';

export const GlobalLayout: React.FC = () => {
  const { isLoggedIn } = useTaskFlow();
  
  // Layout views state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Modals controller states
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Redirect if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleCloseMobileDrawer = () => {
    setMobileDrawerOpen(false);
  };

  const handleOpenTaskDetails = (task: Task) => {
    setSelectedTask(task);
  };

  const handleEditTaskFromDetails = (task: Task) => {
    setSelectedTask(null);
    setEditingTask(task);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobileDrawerOpen={mobileDrawerOpen}
        onCloseMobileDrawer={handleCloseMobileDrawer}
      />

      {/* 2. Main content container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Header navigation bar */}
        <Header 
          onToggleSidebar={handleToggleSidebar} 
          onOpenCreateTask={() => setCreateTaskOpen(true)}
          onOpenTaskDetails={handleOpenTaskDetails}
        />

        {/* Routed views scrollable panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
          <Outlet context={{ 
            onOpenTaskDetails: handleOpenTaskDetails,
            onOpenCreateTask: () => setCreateTaskOpen(true)
          }} />
        </main>
      </div>

      {/* --- REUSABLE DISPATCHED MODALS --- */}
      
      {/* A. Create Task Modal */}
      {createTaskOpen && (
        <CreateEditTaskModal 
          isOpen={createTaskOpen}
          onClose={() => setCreateTaskOpen(false)}
        />
      )}

      {/* B. Edit Task Modal */}
      {editingTask && (
        <CreateEditTaskModal 
          isOpen={!!editingTask}
          taskToEdit={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}

      {/* C. Create Project Modal */}
      {createProjectOpen && (
        <CreateProjectModal 
          isOpen={createProjectOpen}
          onClose={() => setCreateProjectOpen(false)}
        />
      )}

      {/* D. Task Details Panel Overlay */}
      {selectedTask && (
        <TaskDetailsModal 
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={() => handleEditTaskFromDetails(selectedTask)}
        />
      )}
    </div>
  );
};
