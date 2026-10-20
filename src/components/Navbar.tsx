import React, { useState } from 'react';
import {
  Brain,
  FileText,
  Briefcase,
  Bot,
  Kanban,
  BarChart3,
  TestTube2,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ShieldAlert,
  Key
} from 'lucide-react';
import { UserProfile, ParsedResume } from '../types';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../services/supabaseClient';

export type NavTab =
  | 'dashboard'
  | 'resume'
  | 'jobs'
  | 'agent'
  | 'tracker'
  | 'evaluation'
  | 'tests';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  user: UserProfile | null;
  activeResume: ParsedResume | null;
  onOpenAuth: (defaultTab?: 'login' | 'signup') => void;
  onOpenProfile: () => void;
  onOpenSetupGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  activeResume,
  onOpenAuth,
  onOpenProfile,
  onOpenSetupGuide
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'resume', label: 'Resume Intel', icon: FileText },
    { id: 'jobs', label: 'Job Matching', icon: Briefcase },
    { id: 'agent', label: 'Career Agent', icon: Bot },
    { id: 'tracker', label: 'Applications', icon: Kanban },
    { id: 'evaluation', label: 'ML Benchmark', icon: Brain },
    { id: 'tests', label: 'Test Suite', icon: TestTube2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-indigo-300 transition">
                  ResumeAI<span className="text-indigo-400">.</span>Agent
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  ML
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Intelligent Career Platform</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Active resume pill */}
          {activeResume && (
            <button
              onClick={() => onSelectTab('resume')}
              className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 transition"
              title="Click to view parsed resume details"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium truncate max-w-[140px]">{activeResume.name || 'Candidate'}</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] rounded">
                {activeResume.atsScore} ATS
              </span>
            </button>
          )}

          {/* Config mode pill */}
          <button
            onClick={onOpenSetupGuide}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
              isSupabaseConfigured
                ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30 hover:bg-emerald-950/50'
                : 'bg-amber-950/30 text-amber-300 border-amber-500/30 hover:bg-amber-950/50'
            }`}
            title="Click to view Supabase & Google OAuth Configuration Guide"
          >
            {isSupabaseConfigured ? (
              <Key className="w-3.5 h-3.5" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {isSupabaseConfigured ? 'Supabase Live' : 'Demo Auth'}
            </span>
          </button>

          {/* User profile / Auth buttons */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium hidden md:inline truncate max-w-[100px]">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl py-2 text-xs text-slate-300 z-50">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <div className="font-semibold text-white truncate">{user.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-800 hover:text-white flex items-center gap-2 transition"
                  >
                    <User className="w-3.5 h-3.5" /> Account & Preferences
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenSetupGuide();
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-800 hover:text-white flex items-center gap-2 transition"
                  >
                    <Key className="w-3.5 h-3.5" /> OAuth & DB Setup Guide
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      authService.signOut();
                    }}
                    className="w-full px-4 py-2 text-left text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white font-medium transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-3.5 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition shadow-md shadow-indigo-600/20"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 bg-slate-950 border-b border-slate-800 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
