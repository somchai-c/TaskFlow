/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TaskFlowProvider } from './context/TaskFlowContext';
import { GlobalLayout } from './components/GlobalLayout';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ProjectsScreen } from './screens/ProjectsScreen';
import { ProjectDetailsScreen } from './screens/ProjectDetailsScreen';
import { KanbanBoardScreen } from './screens/KanbanBoardScreen';
import { TaskListScreen } from './screens/TaskListScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export default function App() {
  return (
    <TaskFlowProvider>
      <HashRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginScreen />} />

          {/* Protected Main App Layout */}
          <Route path="/" element={<GlobalLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardScreen />} />
            <Route path="projects" element={<ProjectsScreen />} />
            <Route path="projects/:id" element={<ProjectDetailsScreen />} />
            <Route path="board" element={<KanbanBoardScreen />} />
            <Route path="tasks" element={<TaskListScreen />} />
            <Route path="settings" element={<SettingsScreen />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </HashRouter>
    </TaskFlowProvider>
  );
}
