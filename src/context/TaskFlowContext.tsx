/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Project, Task, Comment, TaskStatus, TaskPriority } from '../types';
import { MOCK_USERS, MOCK_PROJECTS, MOCK_TASKS, MOCK_COMMENTS } from '../data/mockData';

interface TaskFlowContextType {
  users: User[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (email: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, role: string) => void;
  
  // Projects
  addProject: (name: string, description: string, members: string[]) => void;
  getProjectProgress: (projectId: string) => number;
  
  // Tasks
  addTask: (title: string, description: string, projectId: string, assigneeId: string, priority: TaskPriority, status: TaskStatus, dueDate: string) => string;
  updateTask: (updatedTask: Task) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, targetStatus: TaskStatus) => void;
  
  // Comments
  addComment: (taskId: string, message: string) => void;
  getCommentsForTask: (taskId: string) => Comment[];

  // Dark Mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const TaskFlowContext = createContext<TaskFlowContextType | undefined>(undefined);

export const TaskFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from localStorage if available, otherwise seed from mockData
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('tf_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('tf_projects');
    return saved ? JSON.parse(saved) : MOCK_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tf_tasks');
    return saved ? JSON.parse(saved) : MOCK_TASKS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('tf_comments');
    return saved ? JSON.parse(saved) : MOCK_COMMENTS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('tf_current_user');
    if (savedUser) return JSON.parse(savedUser);
    // Auto login as Sarah by default to keep experience frictionless
    return MOCK_USERS[0];
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const savedUser = localStorage.getItem('tf_current_user');
    return savedUser ? true : true; // Default to true using Sarah, but support login/out flow
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('tf_dark_mode');
    if (saved) return JSON.parse(saved) === true;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync state to localStorage on modification
  useEffect(() => {
    localStorage.setItem('tf_dark_mode', JSON.stringify(isDarkMode));
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };
  useEffect(() => {
    localStorage.setItem('tf_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('tf_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('tf_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tf_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tf_current_user', JSON.stringify(currentUser));
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem('tf_current_user');
      setIsLoggedIn(false);
    }
  }, [currentUser]);

  // Auth Actions
  const login = (email: string): boolean => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (foundUser) {
      setCurrentUser(foundUser);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  const register = (name: string, email: string, role: string) => {
    const initials = name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'U';

    const colors = [
      'bg-indigo-600', 'bg-emerald-600', 'bg-blue-600', 
      'bg-fuchsia-600', 'bg-rose-600', 'bg-amber-600', 
      'bg-violet-600', 'bg-sky-600'
    ];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const newUser: User = {
      id: 'u_' + Date.now(),
      name,
      email,
      avatarColor,
      initials,
      role
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
  };

  // Helper dynamic project progress solver
  const getProjectProgress = (projectId: string): number => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) {
      // Return static setting or 0 if none
      const p = projects.find(proj => proj.id === projectId);
      return p ? p.progress : 0;
    }
    const doneTasks = projectTasks.filter(t => t.status === 'Done');
    return Math.round((doneTasks.length / projectTasks.length) * 100);
  };

  // Projects Actions
  const addProject = (name: string, description: string, members: string[]) => {
    const newProject: Project = {
      id: 'p_' + Date.now(),
      name,
      description,
      progress: 0,
      members: members.length > 0 ? members : (currentUser ? [currentUser.id] : [])
    };
    setProjects(prev => [...prev, newProject]);
  };

  // Tasks Actions
  const addTask = (
    title: string,
    description: string,
    projectId: string,
    assigneeId: string,
    priority: TaskPriority,
    status: TaskStatus,
    dueDate: string
  ): string => {
    const newId = 't_' + Date.now();
    const newTask: Task = {
      id: newId,
      title,
      description,
      projectId,
      assigneeId,
      priority,
      status,
      dueDate
    };
    setTasks(prev => [...prev, newTask]);
    return newId;
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    // Pull opinions and scrub responses
    setComments(prev => prev.filter(c => c.taskId !== taskId));
  };

  const moveTask = (taskId: string, targetStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t));
  };

  // Comments Actions
  const addComment = (taskId: string, message: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: 'c_' + Date.now(),
      taskId,
      userId: currentUser.id,
      message,
      createdAt: new Date().toISOString()
    };
    setComments(prev => [...prev, newComment]);
  };

  const getCommentsForTask = (taskId: string): Comment[] => {
    return comments
      .filter(c => c.taskId === taskId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  return (
    <TaskFlowContext.Provider value={{
      users,
      projects,
      tasks,
      comments,
      currentUser,
      isLoggedIn,
      login,
      logout,
      register,
      addProject,
      getProjectProgress,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      addComment,
      getCommentsForTask,
      isDarkMode,
      toggleDarkMode
    }}>
      {children}
    </TaskFlowContext.Provider>
  );
};

export const useTaskFlow = () => {
  const context = useContext(TaskFlowContext);
  if (!context) {
    throw new Error('useTaskFlow must be used within a TaskFlowProvider');
  }
  return context;
};
