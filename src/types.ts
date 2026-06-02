/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string; // Tailwind color class e.g., 'bg-indigo-600'
  initials: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number; // percentage 0 to 100
  members: string[]; // list of user ids
}

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Done';

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  tags?: string[];
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  message: string;
  createdAt: string; // ISO datetime string
}
