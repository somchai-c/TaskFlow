/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Avatar } from '../components/Avatar';
import { CheckSquare, ArrowRight, Sparkles, Mail, Lock, User as UserIcon, ShieldAlert } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, register, users } = useTaskFlow();
  const navigate = useNavigate();

  // Mode switcher
  const [isSignUp, setIsSignUp] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Developer');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Both Email and Password fields are required.');
      return;
    }

    const success = login(email);
    if (success) {
      navigate('/dashboard');
    } else {
      setErrorMsg('Unauthorized Email. Try registering or use a Quick-Play Profile below!');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please specify a valid email address.');
      return;
    }

    register(name.trim(), email.trim(), role);
    navigate('/dashboard');
  };

  const selectQuickProfile = (userEmail: string) => {
    const success = login(userEmail);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-all duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand visualizer */}
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 text-white font-display font-medium text-3xl mb-4 select-none">
          T
        </div>
        <h1 className="font-display font-extrabold text-3xl text-white tracking-tight leading-8">
          TaskFlow
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          The collaborative visual workspace built for modern agile teams.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 border border-slate-700/60 shadow-2xl rounded-2xl sm:px-10">
          
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl p-3.5 flex items-start gap-2.5 mb-5 font-semibold leading-relaxed">
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Standard authentication inputs */}
          {!isSignUp ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5 text-slate-300 leading-3">
                  Account Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-550 transition-all font-sans"
                    placeholder="sarah@taskflow.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="login-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5 text-slate-300 leading-3">
                  Access Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-550 transition-all font-sans"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="login-password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1.5">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 bg-slate-900 border-slate-700 rounded focus:ring-blue-500 focus:ring-offset-slate-800"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-slate-400">
                    Keep me authenticated
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Simulated: Forgot password flow requested. Switch using Quick Profile below!")}
                  className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-blue-500/20 active:translate-y-[1px] mt-4 flex items-center justify-center gap-1.5 cursor-pointer"
                id="btn-login-submit"
              >
                <span>Access Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5 text-slate-300 leading-3">
                  Your Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-550 transition-all font-sans"
                    placeholder="Alexander Mercer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    id="register-name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5 text-slate-300 leading-3">
                  Professional Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-550 transition-all font-sans"
                    placeholder="alexander@taskflow.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="register-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5 text-slate-300 leading-3">
                  Role Specialty
                </label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  id="register-role"
                >
                  <option value="Lead Developer">Lead Developer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Product Owner">Product Owner</option>
                  <option value="QA Engineer">QA Engineer</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-blue-500/20 active:translate-y-[1px] mt-4 flex items-center justify-center gap-1.5 cursor-pointer"
                id="btn-register-submit"
              >
                <span>Create Identity & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Mode switch anchor */}
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs text-slate-450 select-none">
              <span className="bg-slate-800 px-3 text-slate-400 font-medium">Or</span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setErrorMsg('');
                setIsSignUp(!isSignUp);
              }}
              className="text-xs text-blue-450 hover:text-blue-300 font-semibold transition-colors"
            >
              {isSignUp ? 'Already registered? Log in here' : "Need a professional coordinate? Sign up"}
            </button>
          </div>

          {/* Frictionless Quick-Play Profiles Box */}
          <div className="mt-8 border-t border-slate-700/80 pt-6">
            <span className="text-[10px] bg-slate-900 border border-slate-700/60 px-2.5 py-1 text-blue-400 rounded-full font-bold uppercase tracking-widest inline-flex items-center gap-1 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick-Play Profiles (Testing)</span>
            </span>
            <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
              Switch team roles context on the fly with single-click demo profiles:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {users.slice(0, 3).map(u => (
                <button
                  key={u.id}
                  onClick={() => selectQuickProfile(u.email)}
                  type="button"
                  className="flex items-center gap-2.5 p-2 bg-slate-900/65 border border-slate-700/40 hover:border-blue-500 hover:bg-slate-900 hover:translate-x-0.5 rounded-xl transition-all text-left"
                >
                  <Avatar user={u} size="xs" showTooltip={false} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-200 leading-3">{u.name}</p>
                    <p className="text-[9px] text-slate-400 leading-3 font-mono mt-0.5">{u.role} ({u.email})</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-450" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
