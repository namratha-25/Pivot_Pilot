import React, { useState } from 'react';
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  RefreshCw,
  Route,
  Sparkles,
} from 'lucide-react';
import type { PageId, RoadmapTaskType } from '../types';
import { usePivotPilot } from '../store/PivotPilotContext';
import { generateRoadmapApi } from '../services/api';
import { exportRoadmapToIcs } from '../utils/icsExport';
import { EmptyState, ErrorBanner, LoadingSkeleton } from '../components/UI';

const TASK_TYPE_LABELS: Record<RoadmapTaskType, string> = {
  course: 'Course',
  reading: 'Reading',
  practice: 'Practice',
  project: 'Project',
  interview: 'Interview',
};

export const RoadmapPage: React.FC<{ onNavigate: (page: PageId) => void }> = ({ onNavigate }) => {
  const {
    state,
    setRoadmap,
    toggleRoadmapTask,
    setCurrentWeek,
    setDemoMode,
    loadDemoPersona,
    latestWeakInterviewAreas,
    overallCompletionRate,
  } = usePivotPilot();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({
    [state.currentWeek]: true,
    [state.currentWeek + 1]: true,
  });
  const [exportNotice, setExportNotice] = useState(false);

  const toggleExpand = (weekNumber: number) => {
    setExpandedWeeks((prev) => ({ ...prev, [weekNumber]: !prev[weekNumber] }));
  };

  const runGenerate = async () => {
    if (!state.gapMap) return;
    setError(null);
    setLoading(true);
    try {
      const plan = await generateRoadmapApi(
        {
          profile: state.profile,
          gapMap: state.gapMap,
          weakInterviewAreas: latestWeakInterviewAreas,
          applicationInsights: state.applicationInsights,
        },
        state.demoMode
      );
      setRoadmap(plan);
      setExpandedWeeks({ 1: true, 2: true, [state.currentWeek]: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportIcs = () => {
    if (!state.roadmap) return;
    exportRoadmapToIcs(state.roadmap, state.profile.targetRole || 'Career Pivot');
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2400);
  };

  const budgetHours = state.profile.hoursPerWeek || 8;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl sm:text-[28px] font-semibold text-ink tracking-tight">
            Week-by-week roadmap
          </h1>
          <p className="text-sm text-ink-muted">
            {state.profile.weeksAvailable || 12}-week plan capped at{' '}
            <span className="font-mono tabular-nums text-ink">{budgetHours} hrs/week</span> · Highest
            gaps prioritized first.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {state.roadmap && (
            <button
              type="button"
              onClick={handleExportIcs}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface border border-line text-ink text-xs font-medium hover:border-primary hover:text-primary transition-colors whitespace-nowrap cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{exportNotice ? 'Downloaded .ics' : 'Export to calendar (.ics)'}</span>
            </button>
          )}
          <button
            type="button"
            disabled={!state.gapMap || loading}
            onClick={runGenerate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-medium hover:opacity-90 disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            {state.roadmap ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>
              {loading
                ? 'Generating Plan...'
                : state.roadmap
                ? 'Regenerate Plan'
                : 'Generate Roadmap'}
            </span>
          </button>
        </div>
      </header>

      {error && (
        <ErrorBanner
          message={error}
          demoMode={state.demoMode}
          onRetry={runGenerate}
          onEnableDemoMode={() => {
            setDemoMode(true);
            setError(null);
          }}
        />
      )}

      {loading && (
        <LoadingSkeleton
          rows={5}
          title={`Building your ${state.profile.weeksAvailable || 12}-week roadmap within ${budgetHours} hrs/week...`}
        />
      )}

      {!loading && !state.roadmap && (
        <EmptyState
          icon={<Route className="w-6 h-6" />}
          title="No weekly roadmap generated yet"
          description={
            state.gapMap
              ? `Generate a structured ${state.profile.weeksAvailable || 12}-week study and project plan tailored to your top skill gaps.`
              : 'Complete your Skill-Gap analysis first so Gemini can prioritize your biggest skill gaps.'
          }
          actionLabel={state.gapMap ? 'Generate Roadmap with Gemini' : 'Go to Skill Gap'}
          onAction={() => (state.gapMap ? runGenerate() : onNavigate('skill-gap'))}
          secondaryLabel={!state.gapMap ? 'Load Demo Persona (Ravi)' : undefined}
          onSecondary={!state.gapMap ? loadDemoPersona : undefined}
        />
      )}

      {!loading && state.roadmap && (
        <>
          {/* Summary Bar */}
          <section className="bg-surface border border-line rounded-[20px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted font-mono tabular-nums">
                <span className="text-primary font-semibold">{overallCompletionRate}% completed</span>
                <span aria-hidden="true">·</span>
                <span>{state.roadmap.weeks.length} weeks planned</span>
                <span aria-hidden="true">·</span>
                <span>Cap: {budgetHours} hrs/wk</span>
              </div>
              {state.roadmap.focusNote && (
                <p className="text-sm text-ink-muted">{state.roadmap.focusNote}</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const allOpen: Record<number, boolean> = {};
                  state.roadmap?.weeks.forEach((w) => {
                    allOpen[w.weekNumber] = true;
                  });
                  setExpandedWeeks(allOpen);
                }}
                className="px-3 py-1.5 rounded-full bg-surface-low border border-line text-xs font-medium text-ink-muted hover:text-ink transition-colors whitespace-nowrap cursor-pointer"
              >
                Expand all
              </button>
              <button
                type="button"
                onClick={() => setExpandedWeeks({ [state.currentWeek]: true })}
                className="px-3 py-1.5 rounded-full bg-surface-low border border-line text-xs font-medium text-ink-muted hover:text-ink transition-colors whitespace-nowrap cursor-pointer"
              >
                Focus current week
              </button>
            </div>
          </section>

          {/* Timeline */}
          <section className="flex flex-col gap-4">
            {state.roadmap.weeks.map((week) => {
              const totalHours = Number(
                week.tasks.reduce((sum, t) => sum + Number(t.estHours || 0), 0).toFixed(1)
              );
              const doneCount = week.tasks.filter((t) => t.completed).length;
              const isAllDone = week.tasks.length > 0 && doneCount === week.tasks.length;
              const isCurrent = week.weekNumber === state.currentWeek;
              const isExpanded = expandedWeeks[week.weekNumber] ?? isCurrent;
              const overBudget = totalHours > budgetHours + 0.1;

              return (
                <article
                  key={week.weekNumber}
                  className={`bg-surface rounded-[20px] p-5 sm:p-6 transition-colors ${
                    isCurrent ? 'border-2 border-primary' : 'border border-line'
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold shrink-0 ${
                            isAllDone
                              ? 'bg-blush-soft text-primary'
                              : isCurrent
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-mid text-ink-muted'
                          }`}
                        >
                          {isAllDone ? <Check className="w-4 h-4" /> : week.weekNumber}
                        </div>

                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted font-mono tabular-nums">
                            <span className={isCurrent ? 'text-primary font-semibold' : ''}>
                              Week {week.weekNumber}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {isAllDone ? 'Completed' : isCurrent ? 'Current Focus' : 'Upcoming'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {doneCount}/{week.tasks.length} tasks
                            </span>
                          </div>
                          <h2 className="text-base sm:text-lg font-semibold text-ink">
                            {week.theme}
                          </h2>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-xs tabular-nums ${
                            overBudget ? 'text-danger font-semibold' : 'text-ink-muted'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {totalHours}h / {budgetHours}h
                          </span>
                        </span>

                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => setCurrentWeek(week.weekNumber)}
                            className="px-2.5 py-1 rounded-full bg-surface-low border border-line text-[11px] font-medium text-ink-muted hover:text-primary hover:border-primary transition-colors cursor-pointer"
                          >
                            Set active
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleExpand(week.weekNumber)}
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? 'Collapse week' : 'Expand week'}
                          className="w-8 h-8 rounded-full bg-surface-low border border-line flex items-center justify-center text-ink-muted hover:text-ink cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Milestone summary */}
                    <p className="text-xs text-ink-muted pl-10">
                      <strong className="text-ink font-medium">Milestone:</strong> {week.milestone}
                    </p>

                    {isExpanded && (
                      <div className="pt-3 mt-1 border-t border-line flex flex-col gap-4 pl-0 sm:pl-10">
                        {week.goals.length > 0 && (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-ink">Weekly goals</span>
                            <ul className="list-disc pl-4 text-xs text-ink-muted flex flex-col gap-1">
                              {week.goals.map((g, gi) => (
                                <li key={gi}>{g}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="divide-y divide-line border-t border-line">
                          {week.tasks.map((task) => (
                            <label
                              key={task.id}
                              className="py-3.5 flex items-start justify-between gap-4 cursor-pointer group"
                            >
                              <span className="flex items-start gap-3 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => toggleRoadmapTask(week.weekNumber, task.id)}
                                  className="mt-1 w-4 h-4 rounded border-line-strong accent-[var(--pp-primary)] cursor-pointer shrink-0"
                                />
                                <span className="flex flex-col gap-1 min-w-0">
                                  <span
                                    className={`text-sm ${
                                      task.completed
                                        ? 'line-through text-ink-muted'
                                        : 'text-ink font-medium group-hover:text-primary'
                                    }`}
                                  >
                                    {task.title}
                                  </span>
                                  <span className="text-xs text-ink-muted">
                                    {TASK_TYPE_LABELS[task.type] || task.type} ·{' '}
                                    {task.skillsTargeted.join(', ')}
                                  </span>
                                  <span className="text-xs text-ink-subtle">
                                    Resource: {task.resourceSuggestion}
                                  </span>
                                </span>
                              </span>

                              <span className="font-mono text-xs font-medium text-primary tabular-nums shrink-0 pt-0.5">
                                {task.estHours}h
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
};
