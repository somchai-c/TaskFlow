/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Project, Task, Comment } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sarah Johnson',
    email: 'sarah@taskflow.com',
    avatarColor: 'bg-emerald-600',
    initials: 'SJ',
    role: 'Project Manager'
  },
  {
    id: 'u2',
    name: 'Michael Chen',
    email: 'michael@taskflow.com',
    avatarColor: 'bg-blue-600',
    initials: 'MC',
    role: 'Lead Developer'
  },
  {
    id: 'u3',
    name: 'Emma Davis',
    email: 'emma@taskflow.com',
    avatarColor: 'bg-fuchsia-600',
    initials: 'ED',
    role: 'UI/UX Designer'
  },
  {
    id: 'u4',
    name: 'Alex Rivera',
    email: 'alex@taskflow.com',
    avatarColor: 'bg-rose-600',
    initials: 'AR',
    role: 'QA Engineer'
  },
  {
    id: 'u5',
    name: 'Sophia Martinez',
    email: 'sophia@taskflow.com',
    avatarColor: 'bg-amber-600',
    initials: 'SM',
    role: 'Product Owner'
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Website Redesign',
    description: 'Fresh and modern company website overhaul to improve lead conversion and landing page speeds.',
    progress: 68,
    members: ['u1', 'u2', 'u3', 'u5']
  },
  {
    id: 'p2',
    name: 'Mobile App Launch',
    description: 'Development and launch of our iOS & Android mobile companion applications.',
    progress: 42,
    members: ['u1', 'u2', 'u4']
  },
  {
    id: 'p3',
    name: 'Cloud Infrastructure Upgrade',
    description: 'Transitioning legacy hosting environments to high-availability Google Cloud services.',
    progress: 85,
    members: ['u1', 'u2', 'u4']
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Create homepage wireframes',
    description: 'Design key homepage concepts focusing on intuitive user navigation and speedier copy sections. Include layout wireframes and user interaction routes.',
    projectId: 'p1',
    assigneeId: 'u3',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-06-15',
    tags: ['design', 'UX', 'frontend']
  },
  {
    id: 't2',
    title: 'Implement login page UI',
    description: 'Build complete responsive front-end and error message workflows using global layout standards.',
    projectId: 'p2',
    assigneeId: 'u2',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '2026-06-18',
    tags: ['frontend', 'auth']
  },
  {
    id: 't3',
    title: 'Review branding assets & logo',
    description: 'Validate final typography, brand rules, colors, and layout ratios with the branding director.',
    projectId: 'p1',
    assigneeId: 'u1',
    priority: 'Low',
    status: 'Review',
    dueDate: '2026-06-12',
    tags: ['branding', 'marketing']
  },
  {
    id: 't4',
    title: 'Configure telemetry reporting',
    description: 'Install simple telemetry libraries and hook up user interaction clicks safely without bloating assets.',
    projectId: 'p2',
    assigneeId: 'u2',
    priority: 'High',
    status: 'Backlog',
    dueDate: '2026-06-25',
    tags: ['telemetry', 'analytics']
  },
  {
    id: 't5',
    title: 'Draft mobile launch newsletter copy',
    description: 'Publish complete content layout emphasizing benefits, pricing structure, and user referral links.',
    projectId: 'p2',
    assigneeId: 'u5',
    priority: 'Low',
    status: 'Done',
    dueDate: '2026-06-01',
    tags: ['marketing', 'copywriting']
  },
  {
    id: 't6',
    title: 'Migrate staging databases',
    description: 'Convert schema entries, execute clean index creations, and verify high availability replicas of product inventories.',
    projectId: 'p3',
    assigneeId: 'u2',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-06-10',
    tags: ['database', 'infra', 'stg']
  },
  {
    id: 't7',
    title: 'Create test automation suites',
    description: 'Write critical user flow browser automated tests validating logins, item carts, and payment checkouts.',
    projectId: 'p3',
    assigneeId: 'u4',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '2026-06-20'
  }
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    taskId: 't1',
    userId: 'u1',
    message: 'Please update the main navigation section. It needs to clearly display high-margin services higher up.',
    createdAt: '2026-06-01T10:30:00Z'
  },
  {
    id: 'c2',
    taskId: 't1',
    userId: 'u3',
    message: 'Updated the wireframes with a sticky navigation bar! Added responsive prototypes for tablet and phone dimensions too.',
    createdAt: '2026-06-01T14:15:00Z'
  },
  {
    id: 'c3',
    taskId: 't4',
    userId: 'u2',
    message: 'Reviewing database connections. Will create indexes to handle high read loads.',
    createdAt: '2026-06-01T18:05:00Z'
  }
];
