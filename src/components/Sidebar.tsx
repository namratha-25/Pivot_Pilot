import React, { useState } from 'react';
import {
  Briefcase,
  Compass,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Map as MapIcon,
  Menu,
  Mic,
  Moon,
  RotateCcw,
  Route,
  Sparkles,
  Sun,
  TrendingUp,
  UserCheck,
  X,
} from 'lucide-react';
import type { PageId } from '../types';
import { usePivotPilot } from '../store/PivotPilotContext';

interface SidebarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
}

const NAV_ITEMS: Array<{ id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'intake', label: 'Intake', icon: FileText },
  { id: 'skill-gap', label: 'Skill Gap', icon: MapIcon },
  { id: 'roadmap', label: 'Roadmap', icon: Route },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'mock-interview', label: 'Mock Interview', icon: Mic },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'applications', label: 'Applications', icon: Briefcase },
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onSelectPage }) => {
  const { state, loadDemoPersona, setDemoMode, toggleTheme, resetAllData } = usePivotPilot();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const initials = state.profile.name
    ? state.profile.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'PP';

  const handleNavClick = (id: PageId) => {
    onSelectPage(id);
    setMobileOpen(false);
  };

  const handleLoadDemo = () => {
    loadDemoPersona();
    setMobileOpen(false);
  };

  const handleReset = () => {
    resetAllData();
    setConfirmResetOpen(false);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full gap-5">
      <div className="flex flex-col gap-5">
        {/* Brand */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-[12px] bg-blush-soft text-primary flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-display text-lg font-semibold text-ink tracking-tight whitespace-nowrap">
              PivotPilot
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-full text-ink-muted hover:bg-surface-mid cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Role Summary */}
        <div className="rounded-[12px] bg-surface-low border border-line px-3.5 py-2.5 flex flex-col gap-0.5">
          <span className="text-[11px] font-medium text-ink-muted">Target Role</span>
          <span className="text-xs font-semibold text-ink truncate">
            {state.profile.targetRole
              ? `${state.profile.targetRole} · Wk ${state.currentWeek}/${state.profile.weeksAvailable || 12}`
              : 'Not configured yet'}
          </span>
        </div>

        {/* Navigation */}
        <nav aria-label="Primary Navigation" className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            const showAppCount = item.id === 'applications' && state.applications.length > 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[12px] text-sm font-medium transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blush-tint text-primary'
                    : 'text-ink-muted hover:bg-surface-mid hover:text-ink'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {showAppCount && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-blush-soft text-primary-deep font-mono text-[11px] font-semibold tabular-nums">
                    {state.applications.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="pt-4 border-t border-line flex flex-col gap-3">
        {/* Load Demo Persona & Reset Data */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleLoadDemo}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-blush-soft text-primary-deep text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Load demo persona</span>
          </button>
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            title="Reset application data"
            aria-label="Reset application data"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-low border border-line text-ink-muted hover:text-primary hover:border-blush-mid transition-colors shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visible Demo Mode Toggle */}
        <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-[12px] bg-surface-low border border-line">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-ink leading-tight">Demo mode</span>
              <span className="text-[11px] text-ink-muted leading-tight truncate">
                {state.demoMode ? 'Cached AI outputs' : 'Live Gemini API'}
              </span>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={state.demoMode}
            aria-label="Toggle Demo Mode"
            onClick={() => setDemoMode(!state.demoMode)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
              state.demoMode ? 'bg-primary' : 'bg-line-strong'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-surface transition-transform ${
                state.demoMode ? 'translate-x-4.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Profile & Theme Switcher */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-blush-soft text-primary-deep flex items-center justify-center text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-ink truncate">
                {state.profile.name || 'New Candidate'}
              </span>
              <span className="text-xs text-ink-muted font-mono tabular-nums">
                {state.profile.hoursPerWeek || 8} hrs / week
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={state.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={state.theme === 'dark' ? 'Switch to Ash & Blush Light' : 'Switch to Ash & Blush Dark'}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-low border border-line text-ink-muted hover:text-primary hover:border-blush-mid transition-colors shrink-0 cursor-pointer"
          >
            {state.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sticky Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-surface border-b border-line px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-blush-soft text-primary flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-display text-base font-semibold text-ink">PivotPilot</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDemoMode(!state.demoMode)}
            className={`px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
              state.demoMode
                ? 'bg-blush-tint border-blush-mid text-primary'
                : 'bg-surface-low border-line text-ink-muted'
            }`}
          >
            {state.demoMode ? 'Demo: On' : 'Demo: Off'}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-surface-low border border-line text-ink-muted cursor-pointer"
          >
            {state.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-surface-mid text-ink hover:bg-blush-tint hover:text-primary transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Desktop Static & Mobile Slide-Over Sidebar */}
      <aside
        className={`${
          mobileOpen ? 'flex' : 'hidden'
        } lg:flex fixed lg:sticky top-0 left-0 z-50 w-64 shrink-0 h-screen overflow-y-auto bg-surface border-r border-line flex-col p-5`}
      >
        {sidebarContent}
      </aside>

      {/* Reset Confirmation Modal */}
      {confirmResetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <div className="bg-surface border border-line rounded-[16px] max-w-sm w-full p-5 shadow-lg flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <h3 id="reset-modal-title" className="font-display font-semibold text-ink text-base">
                Reset Application Data?
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                This will reset your profile, roadmap, saved applications, and progress logs to empty baseline state. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-ink-muted hover:bg-surface-mid transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
