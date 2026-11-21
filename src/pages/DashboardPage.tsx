import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Flame,
  HelpCircle,
  Mic,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import type { PageId } from '../types';
import { usePivotPilot } from '../store/PivotPilotContext';
import { ReadinessRing } from '../components/UI';
import { AchievementsGrid } from '../components/AchievementsGrid';

const TOUR_STEPS: Array<{
  step: number;
  title: string;
  body: string;
  page: PageId;
  cta: string;
}> = [
  {
    step: 1,
    title: '1. Import resume & target job descriptions',
    body: 'Upload a PDF or paste your resume on Intake, set your weekly hours, and add 3–10 real job descriptions—or click Load Demo Persona to explore as Ravi.',
    page: 'intake',
    cta: 'Open Intake',
  },
  {
    step: 2,
    title: '2. Map your skill gaps & rewrite bullets',
    body: 'Gemini benchmarks your resume against every JD, highlights exact evidence quotes, scores per-JD match, and rewrites resume bullets for ATS alignment.',
    page: 'skill-gap',
    cta: 'Open Skill Gap',
  },
  {
    step: 3,
    title: '3. Execute your weekly roadmap & portfolio projects',
    body: 'Follow a time-boxed weekly plan that respects your hour budget, export tasks to your calendar (.ics), and push high-signal portfolio projects into your schedule.',
    page: 'roadmap',
    cta: 'Open Roadmap',
  },
  {
    step: 4,
    title: '4. Drill mock interviews, check in & optimize applications',
    body: 'Practice with voice or text, get 5-axis rubric scores, submit weekly check-ins that adapt future weeks, and let application conversion analytics refine your focus.',
    page: 'mock-interview',
    cta: 'Try Mock Interview',
  },
];

export const DashboardPage: React.FC<{ onNavigate: (page: PageId) => void }> = ({
  onNavigate,
}) => {
  const {
    state,
    toggleRoadmapTask,
    loadDemoPersona,
    setTourDismissed,
    overallCompletionRate,
    latestWeakInterviewAreas,
    achievements,
  } = usePivotPilot();

  const [tourStep, setTourStep] = useState(0);

  const activeWeekObj =
    state.roadmap?.weeks.find((w) => w.weekNumber === state.currentWeek) ??
    state.roadmap?.weeks[0] ??
    null;

  const weekTasks = activeWeekObj?.tasks ?? [];
  const weekDone = weekTasks.filter((t) => t.completed).length;

  const activeProject =
    state.projects.find((p) => p.status === 'in_progress') ?? state.projects[0] ?? null;

  const latestInterview = state.interviews[0] ?? null;
  const interviewingApps = state.applications.filter(
    (a) => a.status === 'interview' || a.status === 'screening' || a.status === 'offer'
  ).length;

  // Group category averages from gapMap
  const categoryBreakdown = React.useMemo(() => {
    if (!state.gapMap?.skills?.length) return [];
    const map = new Map<string, { sum: number; count: number }>();
    state.gapMap.skills.forEach((s) => {
      const curr = map.get(s.category) ?? { sum: 0, count: 0 };
      curr.sum += s.userLevel;
      curr.count += 1;
      map.set(s.category, curr);
    });
    return Array.from(map.entries())
      .map(([category, v]) => ({
        category,
        avg: Math.round(v.sum / v.count),
      }))
      .slice(0, 3);
  }, [state.gapMap]);

  // Context-aware Next Recommended Action
  const nextAction = React.useMemo(() => {
    if (!state.profile.resumeText && !state.profile.name) {
      return {
        kicker: 'Step 1 · Setup',
        title: 'Complete your career intake or load Ravi’s demo persona',
        description:
          'Upload your resume and 3–5 real job descriptions so PivotPilot can calculate your baseline readiness score.',
        buttonLabel: 'Start Intake',
        page: 'intake' as PageId,
      };
    }
    if (!state.gapMap) {
      return {
        kicker: 'Step 2 · Benchmark',
        title: 'Run your Skill-Gap analysis',
        description: `Compare ${state.profile.name || 'your resume'} against ${
          state.jobDescriptions.filter((j) => j.text.trim()).length
        } job descriptions to uncover top priority gaps.`,
        buttonLabel: 'Analyze Skill Gaps',
        page: 'skill-gap' as PageId,
      };
    }
    if (!state.roadmap) {
      return {
        kicker: 'Step 3 · Plan',
        title: 'Generate your week-by-week roadmap',
        description: `Turn your top skill gaps into a time-boxed ${state.profile.weeksAvailable}-week plan capped at ${state.profile.hoursPerWeek} hrs/week.`,
        buttonLabel: 'Build Roadmap',
        page: 'roadmap' as PageId,
      };
    }
    if (latestWeakInterviewAreas.length > 0 && weekDone >= Math.ceil(weekTasks.length * 0.5)) {
      return {
        kicker: 'Adaptive Coaching',
        title: `Run your Week ${state.currentWeek} check-in & recalibrate`,
        description: `Feed your recent mock interview weak areas (${latestWeakInterviewAreas
          .map((a) => a.replace(/_/g, ' '))
          .join(', ')}) into remaining roadmap weeks.`,
        buttonLabel: 'Log Weekly Check-In',
        page: 'progress' as PageId,
      };
    }
    if (!latestInterview) {
      return {
        kicker: 'Practice Loop',
        title: 'Run your first AI Mock Interview',
        description:
          'Practice role-specific or behavioral prompts via voice or text and get a 5-dimension rubric breakdown.',
        buttonLabel: 'Start Mock Session',
        page: 'mock-interview' as PageId,
      };
    }
    const nextUnfinished = weekTasks.find((t) => !t.completed);
    if (nextUnfinished) {
      return {
        kicker: `Week ${activeWeekObj?.weekNumber} Focus`,
        title: nextUnfinished.title,
        description: `Estimated ${nextUnfinished.estHours}h · Targets ${nextUnfinished.skillsTargeted.join(
          ', '
        )}.`,
        buttonLabel: 'Open Roadmap',
        page: 'roadmap' as PageId,
      };
    }
    return {
      kicker: 'Pipeline Optimization',
      title: 'Review your application response-rate insights',
      description:
        'See which outreach channels and company sizes convert best and align your study roadmap accordingly.',
      buttonLabel: 'Inspect Applications',
      page: 'applications' as PageId,
    };
  }, [
    state.profile,
    state.jobDescriptions,
    state.gapMap,
    state.roadmap,
    state.currentWeek,
    latestWeakInterviewAreas,
    latestInterview,
    weekDone,
    weekTasks,
    activeWeekObj,
  ]);

  const readinessScore = state.gapMap?.readinessScore ?? 0;
  const scoreDelta =
    state.readinessHistory.length >= 2
      ? state.readinessHistory[state.readinessHistory.length - 1].score -
        state.readinessHistory[0].score
      : null;

  const activeTour = TOUR_STEPS[tourStep];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl sm:text-[28px] font-semibold text-ink tracking-tight">
            {state.profile.name ? `Welcome back, ${state.profile.name.split(' ')[0]}` : 'Welcome to PivotPilot'}
          </h1>
          <p className="text-sm text-ink-muted">
            {state.profile.targetRole
              ? `Pivoting from ${state.profile.currentRole || 'Current Role'} to ${
                  state.profile.targetRole
                } · Week ${state.currentWeek} of ${state.profile.weeksAvailable || 12}`
              : 'Your structured AI career pivot coach — start with Intake or load Ravi’s sample profile.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {state.tourDismissed && (
            <button
              type="button"
              onClick={() => {
                setTourStep(0);
                setTourDismissed(false);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface border border-line text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-mid transition-colors whitespace-nowrap cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Tour</span>
            </button>
          )}
          {!state.profile.name && (
            <button
              type="button"
              onClick={loadDemoPersona}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blush-soft text-primary-deep text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Load demo persona</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('mock-interview')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>Start Mock Session</span>
          </button>
        </div>
      </header>

      {/* Onboarding Tour Card */}
      {!state.tourDismissed && (
        <section
          aria-label="Onboarding tour"
          className="bg-surface border border-blush-mid/60 rounded-[20px] p-5 sm:p-6 flex flex-col gap-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[12px] bg-blush-tint text-primary flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-ink-muted">
                  <span className="font-medium text-primary">Quick Tour</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    Step {tourStep + 1} of {TOUR_STEPS.length}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-ink mt-0.5">{activeTour.title}</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTourDismissed(true)}
              aria-label="Dismiss tour"
              className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:bg-surface-mid hover:text-ink transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-ink-muted max-w-3xl leading-relaxed">{activeTour.body}</p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line">
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((s, idx) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setTourStep(idx)}
                  aria-label={`Go to tour step ${s.step}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === tourStep ? 'w-7 bg-primary' : 'w-2 bg-line-strong hover:bg-blush-mid'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {!state.profile.name && (
                <button
                  type="button"
                  onClick={loadDemoPersona}
                  className="px-3.5 py-1.5 rounded-full bg-blush-tint text-primary text-xs font-medium hover:bg-blush-soft transition-colors whitespace-nowrap cursor-pointer"
                >
                  Load Ravi (Demo)
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigate(activeTour.page)}
                className="px-3.5 py-1.5 rounded-full bg-surface-low border border-line text-ink text-xs font-medium hover:bg-surface-mid transition-colors whitespace-nowrap cursor-pointer"
              >
                {activeTour.cta}
              </button>
              {tourStep < TOUR_STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setTourStep((prev) => prev + 1)}
                  className="px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                >
                  Next tip
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setTourDismissed(true)}
                  className="px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                >
                  Finish tour
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Primary Row: Readiness Ring + Next Recommended Action */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Readiness Score Ring Card */}
        <article className="lg:col-span-7 bg-surface border border-line rounded-[20px] p-6 flex flex-col justify-between gap-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-lg font-semibold text-ink">Pivot readiness score</h2>
              <p className="text-xs text-ink-muted">
                {state.gapMap
                  ? `Benchmarked across ${state.gapMap.jdMatches.length} target job descriptions`
                  : 'Run Skill Gap analysis to calculate your readiness score'}
              </p>
            </div>
            {scoreDelta !== null && (
              <span className="font-mono text-xs font-medium text-primary tabular-nums">
                {scoreDelta >= 0 ? `+${scoreDelta}%` : `${scoreDelta}%`} since baseline
              </span>
            )}
          </header>

          <div className="flex flex-col sm:flex-row items-center gap-8">
            <ReadinessRing
              score={readinessScore}
              subtitle={
                readinessScore >= 75
                  ? 'Ready to apply'
                  : readinessScore >= 50
                  ? 'Building proof'
                  : 'Baseline stage'
              }
            />

            <div className="flex-1 w-full flex flex-col gap-4">
              {categoryBreakdown.length > 0 ? (
                categoryBreakdown.map((item, idx) => (
                  <div key={item.category} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-ink truncate">
                        {item.category}
                      </span>
                      <span className="font-mono text-xs text-primary tabular-nums">
                        {item.avg}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-mid overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          idx === 0
                            ? 'bg-primary'
                            : idx === 1
                            ? 'bg-blush-mid'
                            : 'bg-ink-subtle'
                        }`}
                        style={{ width: `${Math.max(4, item.avg)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-ink-muted leading-relaxed">
                  Once you analyze your resume against target job descriptions, your skill category
                  proficiency bars will appear here.
                </p>
              )}
              {state.gapMap?.readinessExplanation && (
                <p className="text-xs text-ink-muted leading-relaxed pt-1">
                  {state.gapMap.readinessExplanation}
                </p>
              )}
            </div>
          </div>

          <footer className="pt-3 border-t border-line flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-ink-muted font-mono tabular-nums">
              {state.gapMap
                ? `${state.gapMap.skills.filter((s) => s.gap <= 20).length} of ${
                    state.gapMap.skills.length
                  } target skills ready`
                : 'No skill gap map yet'}
            </span>
            <button
              type="button"
              onClick={() => onNavigate('skill-gap')}
              className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect Skill-Gap Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </footer>
        </article>

        {/* Next Recommended Action + Streak Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <article className="flex-1 bg-surface border border-line rounded-[20px] p-6 flex flex-col justify-between gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-primary">{nextAction.kicker}</span>
                  <h2 className="text-lg font-semibold text-ink leading-snug">
                    {nextAction.title}
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-full bg-blush-tint text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">{nextAction.description}</p>
            </div>

            <footer className="pt-3 border-t border-line flex items-center justify-between gap-3">
              <span className="text-xs text-ink-muted">Next recommended action</span>
              <button
                type="button"
                onClick={() => onNavigate(nextAction.page)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-blush-soft text-primary-deep text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
              >
                <span>{nextAction.buttonLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </footer>
          </article>

          {/* Streak & Velocity Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface border border-line rounded-[16px] p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between text-ink-muted">
                <span className="text-xs">Streak</span>
                <Flame className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display text-2xl font-bold text-ink tabular-nums">
                {state.streakDays}d
              </span>
              <span className="text-[11px] text-ink-muted">Active momentum</span>
            </div>

            <div className="bg-surface border border-line rounded-[16px] p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between text-ink-muted">
                <span className="text-xs">Plan done</span>
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display text-2xl font-bold text-ink tabular-nums">
                {overallCompletionRate}%
              </span>
              <span className="text-[11px] text-ink-muted">All roadmap tasks</span>
            </div>

            <div className="bg-surface border border-line rounded-[16px] p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between text-ink-muted">
                <span className="text-xs">Mock avg</span>
                <Mic className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display text-2xl font-bold text-ink tabular-nums">
                {latestInterview && latestInterview.overallAverage > 0
                  ? `${latestInterview.overallAverage.toFixed(1)}`
                  : '—'}
              </span>
              <span className="text-[11px] text-ink-muted">Out of 5.0</span>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Row: This Week's Tasks + Module Quick Links */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <article className="lg:col-span-8 bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-5">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-lg font-semibold text-ink">This week’s tasks</h2>
              <p className="text-xs text-ink-muted">
                {activeWeekObj
                  ? `Week ${activeWeekObj.weekNumber}: ${activeWeekObj.theme}`
                  : 'Generate a roadmap to see your weekly checklist'}
              </p>
            </div>
            {weekTasks.length > 0 && (
              <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                {weekDone} / {weekTasks.length} done
              </span>
            )}
          </header>

          {weekTasks.length > 0 ? (
            <div className="divide-y divide-line">
              {weekTasks.map((task) => (
                <label
                  key={task.id}
                  className="py-3.5 flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <span className="flex items-start gap-3.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() =>
                        activeWeekObj && toggleRoadmapTask(activeWeekObj.weekNumber, task.id)
                      }
                      className="mt-0.5 w-4 h-4 rounded border-line-strong accent-[var(--pp-primary)] cursor-pointer shrink-0"
                    />
                    <span className="flex flex-col gap-0.5 min-w-0">
                      <span
                        className={`text-sm transition-colors ${
                          task.completed
                            ? 'line-through text-ink-muted'
                            : 'text-ink font-medium group-hover:text-primary'
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="text-xs text-ink-muted">
                        {task.type} · {task.skillsTargeted.slice(0, 2).join(', ')}
                      </span>
                    </span>
                  </span>
                  <span className="font-mono text-xs text-primary tabular-nums shrink-0">
                    {task.estHours}h
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center flex flex-col items-center gap-3">
              <p className="text-sm text-ink-muted">No weekly tasks scheduled yet.</p>
              <button
                type="button"
                onClick={() => onNavigate(state.gapMap ? 'roadmap' : 'intake')}
                className="px-4 py-2 rounded-full bg-blush-soft text-primary-deep text-xs font-semibold hover:opacity-90 cursor-pointer"
              >
                {state.gapMap ? 'Generate Roadmap' : 'Go to Intake'}
              </button>
            </div>
          )}
        </article>

        {/* Right Quick Pulse Cards */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => onNavigate('projects')}
            className="text-left bg-surface border border-line rounded-[20px] p-5 flex flex-col gap-2 hover:border-blush-mid transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-ink-muted">Active Portfolio Project</span>
              <ArrowRight className="w-4 h-4 text-primary shrink-0" />
            </div>
            <span className="text-base font-semibold text-ink">
              {activeProject ? activeProject.title : 'Generate portfolio ideas'}
            </span>
            <span className="text-xs text-ink-muted">
              {activeProject
                ? `Closes ${activeProject.gapsClosed.length} top gaps · Est. ${activeProject.estHours}h`
                : 'Proof-of-work deliverables matched to your highest skill gaps'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('applications')}
            className="text-left bg-surface border border-line rounded-[20px] p-5 flex flex-col gap-2 hover:border-blush-mid transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-ink-muted">Application Pipeline</span>
              <ArrowRight className="w-4 h-4 text-primary shrink-0" />
            </div>
            <span className="text-base font-semibold text-ink tabular-nums">
              {state.applications.length} tracked · {interviewingApps} active callbacks
            </span>
            <span className="text-xs text-ink-muted">
              {state.applicationInsights
                ? 'Segment learning insights ready'
                : 'Log applications to unlock conversion insights'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('progress')}
            className="text-left bg-surface border border-line rounded-[20px] p-5 flex flex-col gap-2 hover:border-blush-mid transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-ink-muted">Adaptive Progress Loop</span>
              <ArrowRight className="w-4 h-4 text-primary shrink-0" />
            </div>
            <span className="text-base font-semibold text-ink tabular-nums">
              {state.progressLogs.length} weekly check-ins logged
            </span>
            <span className="text-xs text-ink-muted">
              Update confidence & blockers to recalibrate remaining weeks
            </span>
          </button>
        </div>
      </section>

      {/* Achievements Badge Grid */}
      <AchievementsGrid achievements={achievements} onNavigate={onNavigate} />
    </div>
  );
};
