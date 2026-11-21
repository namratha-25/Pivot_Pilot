import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PageId, PlanChange, ProgressLog } from '../types';
import { usePivotPilot } from '../store/PivotPilotContext';
import { submitWeeklyCheckInApi } from '../services/api';
import { EmptyState, ErrorBanner, LoadingSkeleton } from '../components/UI';

const CHANGE_TYPE_LABELS: Record<PlanChange['type'], string> = {
  added: 'Added',
  removed: 'Removed',
  reordered: 'Reordered',
  extended: 'Extended',
};

export const ProgressPage: React.FC<{ onNavigate: (page: PageId) => void }> = ({ onNavigate }) => {
  const {
    state,
    applyWeeklyCheckIn,
    setDemoMode,
    loadDemoPersona,
    overallCompletionRate,
    latestWeakInterviewAreas,
  } = usePivotPilot();

  const [selectedWeek, setSelectedWeek] = useState<number>(state.currentWeek);
  const [hoursSpent, setHoursSpent] = useState<number>(state.profile.hoursPerWeek || 8);
  const [blockers, setBlockers] = useState('');
  const [confidenceMap, setConfidenceMap] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedWeek(state.currentWeek);
  }, [state.currentWeek]);

  // Top 6 skills for confidence sliders
  const trackedSkills = useMemo(() => {
    if (!state.gapMap?.skills) return [];
    return [...state.gapMap.skills].sort((a, b) => b.gap - a.gap).slice(0, 6);
  }, [state.gapMap]);

  useEffect(() => {
    if (trackedSkills.length === 0) return;
    setConfidenceMap((prev) => {
      const next = { ...prev };
      trackedSkills.forEach((s) => {
        if (next[s.name] === undefined) {
          next[s.name] = Math.max(1, Math.min(5, Math.round(s.userLevel / 20)));
        }
      });
      return next;
    });
  }, [trackedSkills]);

  const weekObj = useMemo(
    () =>
      state.roadmap?.weeks.find((w) => w.weekNumber === selectedWeek) ??
      state.roadmap?.weeks[0] ??
      null,
    [state.roadmap, selectedWeek]
  );

  const tasksCompletedCount = weekObj ? weekObj.tasks.filter((t) => t.completed).length : 0;
  const totalTasksCount = weekObj ? weekObj.tasks.length : 0;
  const latestInterview = state.interviews[0] ?? null;
  const latestLog = state.progressLogs[0] ?? null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!state.gapMap || !state.roadmap) return;

    setError(null);
    setSubmitting(true);
    try {
      const result = await submitWeeklyCheckInApi(
        {
          profile: state.profile,
          gapMap: state.gapMap,
          roadmap: state.roadmap,
          checkIn: {
            weekNumber: selectedWeek,
            tasksCompletedCount,
            totalTasksCount,
            hoursSpent,
            skillConfidence: confidenceMap,
            blockers,
          },
          latestInterview,
        },
        state.demoMode
      );

      const newLog: ProgressLog = {
        id: `log-${Date.now()}`,
        date: new Date().toISOString(),
        weekNumber: selectedWeek,
        tasksCompletedCount,
        totalTasksCount,
        hoursSpent,
        skillConfidence: { ...confidenceMap },
        blockers,
        planChanges: result.planChanges,
        newReadinessScore: result.newReadinessScore,
      };

      applyWeeklyCheckIn({
        log: newLog,
        updatedSkillLevels: result.updatedSkillLevels,
        updatedRoadmap: result.updatedRoadmap,
      });

      setBlockers('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process weekly check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  const canCheckIn = Boolean(state.gapMap && state.roadmap);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl sm:text-[28px] font-semibold text-ink tracking-tight">
            Progress & adaptive check-in
          </h1>
          <p className="text-sm text-ink-muted">
            Log weekly execution, confidence, and blockers so Gemini recalibrates your remaining
            roadmap.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('roadmap')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface border border-line text-xs font-medium text-ink hover:border-primary hover:text-primary transition-colors self-start sm:self-auto whitespace-nowrap cursor-pointer"
        >
          <span>Inspect Roadmap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {error && (
        <ErrorBanner
          message={error}
          demoMode={state.demoMode}
          onRetry={() => handleSubmit()}
          onEnableDemoMode={() => {
            setDemoMode(true);
            setError(null);
          }}
        />
      )}

      {!canCheckIn ? (
        <EmptyState
          icon={<TrendingUp className="w-6 h-6" />}
          title="Generate your Gap Map & Roadmap first"
          description="Weekly check-ins adapt your live roadmap and skill levels based on completed tasks, confidence sliders, and mock interview weak spots."
          actionLabel={state.gapMap ? 'Build Roadmap' : 'Go to Intake'}
          onAction={() => onNavigate(state.gapMap ? 'roadmap' : 'intake')}
          secondaryLabel="Load Demo Persona (Ravi)"
          onSecondary={loadDemoPersona}
        />
      ) : (
        <>
          {/* Top Metrics + Readiness Over Time Chart */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <article className="lg:col-span-8 bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Readiness score over time</h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Updated after every weekly check-in and gap recalibration
                  </p>
                </div>
                <span className="font-mono text-sm font-semibold text-primary tabular-nums">
                  Current: {state.gapMap?.readinessScore ?? 0}%
                </span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={state.readinessHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--pp-line)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: 'var(--pp-ink-muted)', fontSize: 12 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: 'var(--pp-ink-muted)', fontSize: 12 }}
                      unit="%"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--pp-surface)',
                        borderColor: 'var(--pp-line)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: 'var(--pp-ink)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Readiness Score"
                      stroke="var(--pp-primary)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: 'var(--pp-primary)' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            {/* Completion Rate & Interview Feed Summary */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <article className="bg-surface border border-line rounded-[20px] p-5 flex flex-col gap-2">
                <span className="text-xs text-ink-muted">Overall task completion</span>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-3xl font-bold text-ink tabular-nums">
                    {overallCompletionRate}%
                  </span>
                  <span className="font-mono text-xs text-primary tabular-nums">
                    {state.progressLogs.length} check-ins
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface-mid overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${overallCompletionRate}%` }}
                  />
                </div>
              </article>

              <article className="flex-1 bg-surface border border-line rounded-[20px] p-5 flex flex-col justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-primary">
                    Interview rubric feedback loop
                  </span>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {latestWeakInterviewAreas.length > 0
                      ? `Your latest mock interview flagged ${latestWeakInterviewAreas
                          .map((a) => a.replace(/_/g, ' '))
                          .join(', ')} below 3.6/5. Submitting a check-in automatically weaves targeted drills into remaining weeks.`
                      : 'Complete a Mock Interview session so weak rubric areas automatically feed into your weekly recalibration.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('mock-interview')}
                  className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 self-start cursor-pointer"
                >
                  <span>Open Mock Interview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </article>
            </div>
          </section>

          {/* Main Grid: Weekly Check-in Form + Why Your Plan Changed */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Check-in Form */}
            <form
              onSubmit={handleSubmit}
              className="lg:col-span-7 bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-5"
            >
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Weekly check-in</h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Tasks completed auto-sync from your Roadmap checkboxes.
                  </p>
                </div>

                <select
                  aria-label="Select check-in week"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  className="rounded-full bg-surface-low border border-line px-3.5 py-1.5 text-xs font-mono text-ink focus:outline-none focus:border-primary"
                >
                  {state.roadmap?.weeks.map((w) => (
                    <option key={w.weekNumber} value={w.weekNumber}>
                      Week {w.weekNumber}
                    </option>
                  ))}
                </select>
              </header>

              {/* Auto Tasks + Actual Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-[14px] bg-surface-low border border-line p-4 flex flex-col gap-1">
                  <span className="text-xs text-ink-muted">
                    Tasks completed (Week {selectedWeek})
                  </span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="font-mono text-lg font-semibold text-ink tabular-nums">
                      {tasksCompletedCount} / {totalTasksCount}
                    </span>
                  </div>
                </div>

                <label className="rounded-[14px] bg-surface-low border border-line p-4 flex flex-col gap-1">
                  <span className="text-xs text-ink-muted">Hours actually spent</span>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    max={60}
                    value={hoursSpent}
                    onChange={(e) => setHoursSpent(Number(e.target.value) || 0)}
                    className="bg-transparent font-mono text-lg font-semibold text-ink tabular-nums focus:outline-none"
                  />
                </label>
              </div>

              {/* Confidence Sliders (1-5) */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-ink">
                  Confidence per priority skill (1 = shaky, 5 = interview-ready)
                </span>
                <div className="flex flex-col gap-3">
                  {trackedSkills.map((skill) => {
                    const val = confidenceMap[skill.name] ?? 3;
                    return (
                      <div
                        key={skill.name}
                        className="rounded-[12px] bg-surface-low border border-line px-4 py-3 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-medium text-ink">{skill.name}</span>
                          <span className="font-mono font-semibold text-primary tabular-nums">
                            {val} / 5
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          step={1}
                          value={val}
                          onChange={(e) =>
                            setConfidenceMap((prev) => ({
                              ...prev,
                              [skill.name]: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-[var(--pp-primary)] cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Blockers */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink">Blockers or pacing notes</span>
                <textarea
                  rows={3}
                  value={blockers}
                  onChange={(e) => setBlockers(e.target.value)}
                  placeholder="e.g., Got stuck on cohort retention window functions; only had 6 hours free this week..."
                  className="w-full rounded-[12px] bg-surface-low border border-line px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary"
                />
              </label>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-medium hover:opacity-90 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {submitting ? 'Adapting Remaining Weeks...' : 'Submit Check-In & Adapt Plan'}
                  </span>
                </button>
              </div>

              {submitting && (
                <LoadingSkeleton
                  rows={3}
                  title="Recalculating skill levels, readiness score, and remaining roadmap weeks..."
                />
              )}
            </form>

            {/* Right Column: Why Your Plan Changed Panel */}
            <aside className="lg:col-span-5 flex flex-col gap-6">
              <article className="bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-4">
                <header className="flex items-center justify-between gap-2 pb-3 border-b border-line">
                  <div>
                    <h2 className="text-lg font-semibold text-ink">Why your plan changed</h2>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {latestLog
                        ? `From Week ${latestLog.weekNumber} check-in · New readiness ${latestLog.newReadinessScore}%`
                        : 'Submit a weekly check-in to see adaptive plan diffs'}
                    </p>
                  </div>
                  <GitBranch className="w-5 h-5 text-primary shrink-0" />
                </header>

                {latestLog && latestLog.planChanges.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {latestLog.planChanges.map((change, idx) => (
                      <div
                        key={idx}
                        className="rounded-[14px] bg-surface-low border border-line p-4 flex flex-col gap-1.5"
                      >
                        <span className="text-xs font-mono font-semibold text-primary">
                          {CHANGE_TYPE_LABELS[change.type] || change.type}
                        </span>
                        <p className="text-sm font-medium text-ink leading-snug">
                          {change.description}
                        </p>
                        <p className="text-xs text-ink-muted leading-relaxed">
                          Reason: {change.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Every time you log a weekly check-in, PivotPilot explains every added, removed,
                    reordered, or extended task right here.
                  </p>
                )}
              </article>

              {/* Check-in History Log */}
              {state.progressLogs.length > 0 && (
                <article className="bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-3">
                  <h3 className="text-base font-semibold text-ink">Past check-ins</h3>
                  <div className="divide-y divide-line">
                    {state.progressLogs.map((log) => (
                      <div key={log.id} className="py-3 flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                          <span className="font-semibold text-ink">Week {log.weekNumber}</span>
                          <span className="text-primary">Readiness {log.newReadinessScore}%</span>
                        </div>
                        <span className="text-xs text-ink-muted">
                          {log.tasksCompletedCount}/{log.totalTasksCount} tasks · {log.hoursSpent}h
                          spent · {log.planChanges.length} plan edits
                        </span>
                        {log.blockers && (
                          <p className="text-xs text-ink-subtle italic">“{log.blockers}”</p>
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              )}
            </aside>
          </section>
        </>
      )}
    </div>
  );
};
