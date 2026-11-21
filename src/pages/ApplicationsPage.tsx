import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Edit3,
  Lightbulb,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  ApplicationEntry,
  ApplicationSource,
  ApplicationStatus,
  CompanySize,
  PageId,
  SegmentGroupStats,
} from '../types';
import { usePivotPilot } from '../store/PivotPilotContext';
import { computeApplicationAnalytics } from '../utils/applicationAnalytics';
import {
  generateApplicationInsightsApi,
  generateProjectsApi,
  generateRoadmapApi,
} from '../services/api';
import { EmptyState, ErrorBanner, LoadingSkeleton } from '../components/UI';

const STATUS_OPTIONS: ApplicationStatus[] = [
  'applied',
  'no response',
  'screening',
  'interview',
  'offer',
  'rejected',
];

const SOURCE_OPTIONS: ApplicationSource[] = [
  'referral',
  'LinkedIn',
  'cold email',
  'careers page',
];

const SIZE_OPTIONS: Array<{ value: CompanySize; label: string }> = [
  { value: 'startup', label: 'Startup' },
  { value: 'mid', label: 'Mid-Size' },
  { value: 'large', label: 'Large' },
];

const EMPTY_FORM: Omit<ApplicationEntry, 'id'> = {
  company: '',
  roleTitle: '',
  roleType: 'Technical PM',
  seniority: 'Mid',
  companySize: 'mid',
  source: 'referral',
  dateApplied: new Date().toISOString().slice(0, 10),
  matchScore: 75,
  status: 'applied',
};

export const ApplicationsPage: React.FC<{ onNavigate: (page: PageId) => void }> = ({
  onNavigate,
}) => {
  const {
    state,
    addApplication,
    updateApplication,
    deleteApplication,
    setApplicationInsights,
    setRoadmap,
    setProjects,
    setDemoMode,
    loadDemoPersona,
    latestWeakInterviewAreas,
  } = usePivotPilot();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('all');
  const [chartDimension, setChartDimension] =
    useState<SegmentGroupStats['dimension']>('source');

  // Add / Edit modal drawer state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Omit<ApplicationEntry, 'id'>>(EMPTY_FORM);

  // AI Learning Insights & Plan Update state
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [planUpdatedNotice, setPlanUpdatedNotice] = useState<string | null>(null);

  const analytics = useMemo(
    () => computeApplicationAnalytics(state.applications),
    [state.applications]
  );

  const activeGroup = useMemo(
    () => analytics.groups.find((g) => g.dimension === chartDimension) ?? analytics.groups[0],
    [analytics, chartDimension]
  );

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.applications.filter((app) => {
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;
      if (!q) return true;
      return (
        app.company.toLowerCase().includes(q) ||
        app.roleTitle.toLowerCase().includes(q) ||
        app.roleType.toLowerCase().includes(q) ||
        app.source.toLowerCase().includes(q)
      );
    });
  }, [state.applications, search, statusFilter]);

  const openAddForm = () => {
    setEditingId(null);
    const defaultMatch = state.gapMap?.readinessScore ?? 72;
    setFormState({ ...EMPTY_FORM, matchScore: Math.round(defaultMatch) });
    setFormOpen(true);
  };

  const openEditForm = (app: ApplicationEntry) => {
    setEditingId(app.id);
    const { id: _id, ...rest } = app;
    setFormState(rest);
    setFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.company.trim() || !formState.roleTitle.trim()) return;
    if (editingId) {
      updateApplication({ id: editingId, ...formState });
    } else {
      addApplication(formState);
    }
    setFormOpen(false);
    setEditingId(null);
  };

  const handleGenerateInsights = async () => {
    if (state.applications.length === 0) return;
    setInsightsError(null);
    setLoadingInsights(true);
    try {
      const result = await generateApplicationInsightsApi(
        {
          profile: state.profile,
          segmentStats: analytics.groups,
          totalApplications: analytics.total,
          overallResponseRate: analytics.overallResponseRate,
        },
        state.demoMode
      );
      setApplicationInsights(result);
    } catch (err) {
      setInsightsError(
        err instanceof Error ? err.message : 'Failed to generate application insights.'
      );
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleUpdatePlanFromInsights = async () => {
    if (!state.applicationInsights || !state.gapMap) return;
    setInsightsError(null);
    setUpdatingPlan(true);
    try {
      const [newRoadmap, newProjects] = await Promise.all([
        generateRoadmapApi(
          {
            profile: state.profile,
            gapMap: state.gapMap,
            weakInterviewAreas: latestWeakInterviewAreas,
            applicationInsights: state.applicationInsights,
          },
          state.demoMode
        ),
        generateProjectsApi(
          {
            profile: state.profile,
            gapMap: state.gapMap,
            applicationInsights: state.applicationInsights,
          },
          state.demoMode
        ),
      ]);
      setRoadmap(newRoadmap);
      setProjects(newProjects);
      setPlanUpdatedNotice(
        'Roadmap and Portfolio Projects updated to prioritize your highest-converting role segments.'
      );
      setTimeout(() => setPlanUpdatedNotice(null), 5000);
    } catch (err) {
      setInsightsError(
        err instanceof Error ? err.message : 'Failed to update roadmap & projects from insights.'
      );
    } finally {
      setUpdatingPlan(false);
    }
  };

  const statusTextStyle = (status: ApplicationStatus): string => {
    if (status === 'offer' || status === 'interview') return 'text-primary font-semibold';
    if (status === 'screening') return 'text-primary-deep font-medium';
    if (status === 'rejected') return 'text-danger';
    return 'text-ink-muted';
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl sm:text-[28px] font-semibold text-ink tracking-tight">
            Applications & learning insights
          </h1>
          <p className="text-sm text-ink-muted">
            Track applications, analyze response rates by segment, and adapt your roadmap to what
            converts.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Application</span>
        </button>
      </header>

      {/* Add / Edit Inline Form Panel */}
      {formOpen && (
        <form
          onSubmit={handleSaveForm}
          className="bg-surface border-2 border-primary rounded-[20px] p-6 flex flex-col gap-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">
              {editingId ? 'Edit application' : 'Log new application'}
            </h2>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              aria-label="Close form"
              className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:bg-surface-mid cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ink">Company</span>
              <input
                required
                type="text"
                value={formState.company}
                onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                placeholder="e.g., Samsara"
                className="rounded-[10px] bg-surface-low border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ink">Role title</span>
              <input
                required
                type="text"
                value={formState.roleTitle}
                onChange={(e) => setFormState({ ...formState, roleTitle: e.target.value })}
                placeholder="e.g., Product Manager, Connected Ops"
                className="rounded-[10px] bg-surface-low border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ink">Role type</span>
              <input
                type="text"
                value={formState.roleType}
                onChange={(e) => setFormState({ ...formState, roleType: e.target.value })}
                placeholder="PM, Technical PM, APM, Analyst"
                className="rounded-[10px] bg-surface-low border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ink">Seniority</span>
              <select
                value={formState.seniority}
                onChange={(e) => setFormState({ ...formState, seniority: e.target.value })}
                className="rounded-[10px] bg-surface-low border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary"
              >
                <option value="Entry">Entry</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ink">Company size</span>
              <select
                value={formState.companySize}
                onChange={(e) =>
                  setFormState({ ...formState, companySize: e.target.value as CompanySize })
                }
                className="rounded-[10px] bg-surface-low border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary"
              >
                {SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ink">Source</span>
              <select
                value={formState.source}
                onChange={(e) =>
                  setFormState({ ...formState, source: e.target.value as ApplicationSource })
                }
                className="rounded-[10px] bg-surface-low border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary"
              >
                {SOURCE_OPTIONS.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ink">Date applied</span>
              <input
                type="date"
                value={formState.dateApplied}
                onChange={(e) => setFormState({ ...formState, dateApplied: e.target.value })}
                className="rounded-[10px] bg-surface-low border border-line px-3 py-2 text-sm font-mono text-ink focus:outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ink">Resume match score (0–100)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={formState.matchScore}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    matchScore: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                  })
                }
                className="rounded-[10px] bg-surface-low border border-line px-3 py-2 text-sm font-mono tabular-nums text-ink focus:outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ink">Status</span>
              <select
                value={formState.status}
                onChange={(e) =>
                  setFormState({ ...formState, status: e.target.value as ApplicationStatus })
                }
                className="rounded-[10px] bg-surface-low border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 rounded-full bg-surface-low border border-line text-xs font-medium text-ink hover:bg-surface-mid cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-primary text-on-primary text-xs font-medium hover:opacity-90 cursor-pointer"
            >
              {editingId ? 'Save changes' : 'Add application'}
            </button>
          </div>
        </form>
      )}

      {state.applications.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-6 h-6" />}
          title="No applications logged yet"
          description="Log your real applications to uncover response-rate patterns by source, company size, role type, seniority, and JD match score."
          actionLabel="Log First Application"
          onAction={openAddForm}
          secondaryLabel="Load Demo Persona (12 rows)"
          onSecondary={loadDemoPersona}
        />
      ) : (
        <>
          {/* KPI Summary Strip */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface border border-line rounded-[16px] p-4 flex flex-col gap-1">
              <span className="text-xs text-ink-muted">Total applied</span>
              <span className="font-display text-2xl font-bold text-ink tabular-nums">
                {analytics.total}
              </span>
            </div>
            <div className="bg-surface border border-line rounded-[16px] p-4 flex flex-col gap-1">
              <span className="text-xs text-ink-muted">Response rate</span>
              <span className="font-display text-2xl font-bold text-primary tabular-nums">
                {analytics.overallResponseRate}%
              </span>
            </div>
            <div className="bg-surface border border-line rounded-[16px] p-4 flex flex-col gap-1">
              <span className="text-xs text-ink-muted">Interviews / offers</span>
              <span className="font-display text-2xl font-bold text-ink tabular-nums">
                {analytics.interviewOrOfferCount}
              </span>
            </div>
            <div className="bg-surface border border-line rounded-[16px] p-4 flex flex-col gap-1">
              <span className="text-xs text-ink-muted">Avg. match score</span>
              <span className="font-display text-2xl font-bold text-ink tabular-nums">
                {analytics.avgMatchScore}%
              </span>
            </div>
          </section>

          {/* Learning Insights & Segment Response Rate Bar Chart */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Bar Chart Panel */}
            <article className="lg:col-span-7 bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Response rate by segment</h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Response = any status beyond applied / no response · Min 3 samples flagged
                  </p>
                </div>
              </div>

              {/* Dimension Switcher */}
              <div className="flex flex-wrap gap-1.5">
                {analytics.groups.map((grp) => (
                  <button
                    key={grp.dimension}
                    type="button"
                    onClick={() => setChartDimension(grp.dimension)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      chartDimension === grp.dimension
                        ? 'bg-blush-tint text-primary border border-blush-mid'
                        : 'bg-surface-low border border-line text-ink-muted hover:text-ink'
                    }`}
                  >
                    {grp.label}
                  </button>
                ))}
              </div>

              {/* BarChart */}
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activeGroup?.items || []}
                    margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--pp-line)" />
                    <XAxis
                      dataKey="segment"
                      tick={{ fill: 'var(--pp-ink-muted)', fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      unit="%"
                      tick={{ fill: 'var(--pp-ink-muted)', fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(val: unknown, _name: unknown, props: { payload?: { responses?: number; total?: number } }) => [
                        `${val}% (${props.payload?.responses ?? 0}/${props.payload?.total ?? 0})`,
                        'Response Rate',
                      ]}
                      contentStyle={{
                        backgroundColor: 'var(--pp-surface)',
                        borderColor: 'var(--pp-line)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: 'var(--pp-ink)',
                      }}
                    />
                    <Bar dataKey="responseRate" radius={[8, 8, 0, 0]} maxBarSize={48}>
                      {(activeGroup?.items || []).map((entry) => {
                        const isBest =
                          activeGroup?.bestSegment?.segment === entry.segment &&
                          entry.meetsMinSample;
                        const isWorst =
                          activeGroup?.worstSegment?.segment === entry.segment &&
                          entry.meetsMinSample;
                        const fill = isBest
                          ? 'var(--pp-primary)'
                          : isWorst
                          ? 'var(--pp-ink-subtle)'
                          : 'var(--pp-blush-mid)';
                        return <Cell key={entry.segment} fill={fill} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Best & Worst Segment Callout (Min 3 Samples) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-line">
                <div className="rounded-[12px] bg-blush-tint/70 border border-blush-soft p-3.5 flex flex-col gap-0.5">
                  <span className="text-[11px] font-medium text-primary">
                    Best segment (n ≥ 3)
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {activeGroup?.bestSegment
                      ? `${activeGroup.bestSegment.segment} — ${activeGroup.bestSegment.responseRate}%`
                      : 'Need ≥ 3 samples in a segment'}
                  </span>
                  {activeGroup?.bestSegment && (
                    <span className="text-xs text-ink-muted font-mono tabular-nums">
                      {activeGroup.bestSegment.responses}/{activeGroup.bestSegment.total} responded
                    </span>
                  )}
                </div>

                <div className="rounded-[12px] bg-surface-low border border-line p-3.5 flex flex-col gap-0.5">
                  <span className="text-[11px] font-medium text-ink-muted">
                    Weakest segment (n ≥ 3)
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {activeGroup?.worstSegment
                      ? `${activeGroup.worstSegment.segment} — ${activeGroup.worstSegment.responseRate}%`
                      : 'Need ≥ 2 segments with n ≥ 3'}
                  </span>
                  {activeGroup?.worstSegment && (
                    <span className="text-xs text-ink-muted font-mono tabular-nums">
                      {activeGroup.worstSegment.responses}/{activeGroup.worstSegment.total}{' '}
                      responded
                    </span>
                  )}
                </div>
              </div>
            </article>

            {/* AI Learning Insights Panel */}
            <aside className="lg:col-span-5 bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-5">
              <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-ink">Learning insights</h2>
                </div>
                <button
                  type="button"
                  disabled={loadingInsights}
                  onClick={handleGenerateInsights}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blush-soft text-primary-deep text-xs font-semibold hover:opacity-90 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  {loadingInsights ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{loadingInsights ? 'Analyzing...' : 'Refresh Insights'}</span>
                </button>
              </header>

              {insightsError && (
                <ErrorBanner
                  message={insightsError}
                  demoMode={state.demoMode}
                  onRetry={handleGenerateInsights}
                  onEnableDemoMode={() => {
                    setDemoMode(true);
                    setInsightsError(null);
                  }}
                />
              )}

              {planUpdatedNotice && (
                <div className="rounded-[12px] bg-blush-tint border border-blush-mid p-3.5 flex flex-col gap-2">
                  <span className="text-xs font-medium text-primary-deep">{planUpdatedNotice}</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('roadmap')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline self-start cursor-pointer"
                  >
                    <span>View updated Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {loadingInsights ? (
                <LoadingSkeleton rows={3} title="Synthesizing application conversion stats..." />
              ) : state.applicationInsights ? (
                <div className="flex flex-col gap-4">
                  <div className="rounded-[14px] bg-blush-tint/70 border border-blush-soft p-4 flex flex-col gap-1">
                    <span className="text-xs font-semibold text-primary">Recommended focus</span>
                    <p className="text-sm text-ink leading-relaxed">
                      {state.applicationInsights.recommendedFocus}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-ink">Key conversion patterns</span>
                    <ul className="list-disc pl-4 text-xs text-ink-muted flex flex-col gap-1.5">
                      {state.applicationInsights.insights.map((ins, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {ins}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-ink">Suggested plan changes</span>
                    <ul className="list-disc pl-4 text-xs text-ink-muted flex flex-col gap-1.5">
                      {state.applicationInsights.suggestedChanges.map((ch, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {ch}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={updatingPlan || !state.gapMap}
                    onClick={handleUpdatePlanFromInsights}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-primary text-on-primary text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {updatingPlan
                        ? 'Updating Roadmap & Projects...'
                        : 'Update my plan from these insights'}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Send your computed segment conversion stats to Gemini to uncover which sources,
                    company sizes, and role types yield the highest callback rates.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateInsights}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-primary text-on-primary text-xs font-semibold hover:opacity-90 self-start cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Learning Insights</span>
                  </button>
                </div>
              )}
            </aside>
          </section>

          {/* Applications Table */}
          <section className="bg-surface border border-line rounded-[20px] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-ink-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search company, role, source..."
                  className="w-full rounded-full bg-surface-low border border-line pl-10 pr-4 py-2 text-xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', ...STATUS_OPTIONS] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-blush-tint text-primary border border-blush-mid'
                        : 'bg-surface-low text-ink-muted hover:text-ink'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-low border-b border-line text-xs text-ink-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Type · Level</th>
                    <th className="px-4 py-3 font-medium">Size</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium text-right">Match</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Applied</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-sm">
                  {filteredApps.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-surface-low transition-colors"
                    >
                      <td className="px-4 py-3.5 font-medium text-ink whitespace-nowrap">
                        {app.company}
                      </td>
                      <td className="px-4 py-3.5 text-ink-muted">{app.roleTitle}</td>
                      <td className="px-4 py-3.5 text-xs text-ink-muted whitespace-nowrap">
                        {app.roleType} · {app.seniority}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-ink-muted capitalize whitespace-nowrap">
                        {app.companySize}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-ink whitespace-nowrap">
                        {app.source}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-primary text-right tabular-nums whitespace-nowrap">
                        {app.matchScore}%
                      </td>
                      <td className="px-4 py-3.5 text-xs capitalize whitespace-nowrap">
                        <span className={statusTextStyle(app.status)}>{app.status}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-ink-muted tabular-nums whitespace-nowrap">
                        {app.dateApplied}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditForm(app)}
                            aria-label={`Edit ${app.company}`}
                            className="p-1.5 rounded-full text-ink-muted hover:text-primary hover:bg-blush-tint transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteApplication(app.id)}
                            aria-label={`Delete ${app.company}`}
                            className="p-1.5 rounded-full text-ink-muted hover:text-danger hover:bg-danger-bg/50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredApps.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-sm text-ink-muted">
                        No applications match your current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
