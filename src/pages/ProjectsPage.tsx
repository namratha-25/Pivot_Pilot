import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  Play,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import type { PageId } from '../types';
import { usePivotPilot } from '../store/PivotPilotContext';
import { generateProjectsApi } from '../services/api';
import { EmptyState, ErrorBanner, LoadingSkeleton } from '../components/UI';

export const ProjectsPage: React.FC<{ onNavigate: (page: PageId) => void }> = ({ onNavigate }) => {
  const { state, setProjects, updateProjectStatus, setDemoMode, loadDemoPersona } =
    usePivotPilot();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const runGenerate = async () => {
    if (!state.gapMap) return;
    setError(null);
    setLoading(true);
    try {
      const projects = await generateProjectsApi(
        {
          profile: state.profile,
          gapMap: state.gapMap,
          applicationInsights: state.applicationInsights,
        },
        state.demoMode
      );
      setProjects(projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate portfolio projects.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkInProgress = (projectId: string, title: string) => {
    updateProjectStatus(projectId, 'in_progress');
    setAddedToast(`"${title}" marked In Progress and added to your weekly Roadmap.`);
    setTimeout(() => setAddedToast(null), 4500);
  };

  const gapLookup = React.useMemo(() => {
    const map = new Map<string, number>();
    state.gapMap?.skills.forEach((s) => map.set(s.name.toLowerCase(), s.gap));
    return map;
  }, [state.gapMap]);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl sm:text-[28px] font-semibold text-ink tracking-tight">
            Portfolio projects
          </h1>
          <p className="text-sm text-ink-muted">
            4 high-signal proof-of-work deliverables engineered to close your top skill gaps.
          </p>
        </div>

        <button
          type="button"
          disabled={!state.gapMap || loading}
          onClick={runGenerate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-medium hover:opacity-90 disabled:opacity-50 whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          {state.projects.length > 0 ? (
            <RefreshCw className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>
            {loading
              ? 'Generating Ideas...'
              : state.projects.length > 0
              ? 'Regenerate 4 Projects'
              : 'Generate 4 Projects'}
          </span>
        </button>
      </header>

      {addedToast && (
        <div className="bg-blush-tint border border-blush-mid rounded-[16px] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-primary-deep">{addedToast}</span>
          <button
            type="button"
            onClick={() => onNavigate('roadmap')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline whitespace-nowrap cursor-pointer"
          >
            <span>View in Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
          rows={4}
          title="Designing 4 portfolio projects matched to your highest-weighted skill gaps..."
        />
      )}

      {!loading && state.projects.length === 0 && (
        <EmptyState
          icon={<FolderKanban className="w-6 h-6" />}
          title="No portfolio projects generated yet"
          description={
            state.gapMap
              ? 'Generate 4 realistic portfolio projects matched directly to your biggest skill gaps.'
              : 'Run Skill-Gap analysis first so PivotPilot can tailor projects to your exact gaps.'
          }
          actionLabel={state.gapMap ? 'Generate 4 Portfolio Projects' : 'Go to Skill Gap'}
          onAction={() => (state.gapMap ? runGenerate() : onNavigate('skill-gap'))}
          secondaryLabel={!state.gapMap ? 'Load Demo Persona (Ravi)' : undefined}
          onSecondary={!state.gapMap ? loadDemoPersona : undefined}
        />
      )}

      {!loading && state.projects.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {state.projects.map((project) => {
            const isInProgress = project.status === 'in_progress';
            const isCompleted = project.status === 'completed';

            return (
              <article
                key={project.id}
                className={`h-full bg-surface rounded-[20px] p-6 flex flex-col justify-between gap-5 ${
                  isInProgress ? 'border-2 border-primary' : 'border border-line'
                }`}
              >
                <div className="flex flex-col gap-4">
                  <header className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums">
                      <span className={isInProgress ? 'text-primary font-semibold' : 'text-ink-muted'}>
                        {project.difficulty} · Est. {project.estHours}h
                      </span>
                      <span
                        className={`font-sans font-semibold ${
                          isInProgress
                            ? 'text-primary'
                            : isCompleted
                            ? 'text-ink'
                            : 'text-ink-muted'
                        }`}
                      >
                        {isInProgress ? 'In Progress' : isCompleted ? 'Completed' : 'Suggested'}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-ink leading-snug">{project.title}</h2>
                  </header>

                  <p className="text-sm text-ink-muted leading-relaxed">
                    {project.problemStatement}
                  </p>

                  {/* Gaps Closed */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-ink">Skill gaps closed</span>
                    <div className="flex flex-col gap-1.5">
                      {project.gapsClosed.map((gapName) => {
                        const score = gapLookup.get(gapName.toLowerCase());
                        return (
                          <div
                            key={gapName}
                            className="flex items-center justify-between gap-2 rounded-[10px] bg-blush-tint/70 px-3 py-1.5 text-xs"
                          >
                            <span className="font-medium text-primary-deep">{gapName}</span>
                            {score !== undefined && (
                              <span className="font-mono text-primary tabular-nums">
                                Gap {score}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-ink">Deliverables</span>
                    <ul className="list-disc pl-4 text-xs text-ink-muted flex flex-col gap-1">
                      {project.deliverables.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Why Recruiters Care */}
                  <div className="rounded-[12px] bg-surface-low border border-line p-3.5 flex flex-col gap-1">
                    <span className="text-xs font-semibold text-ink">Why recruiters care</span>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      {project.whyRecruitersCare}
                    </p>
                  </div>
                </div>

                <footer className="pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-ink-muted">
                    Covers: {project.skillsCovered.slice(0, 2).join(', ')}
                  </span>

                  <div className="flex items-center gap-2">
                    {isInProgress ? (
                      <button
                        type="button"
                        onClick={() => updateProjectStatus(project.id, 'completed')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blush-soft text-primary-deep text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Completed</span>
                      </button>
                    ) : isCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleMarkInProgress(project.id, project.title)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-low border border-line text-ink text-xs font-medium hover:bg-surface-mid transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <span>Reopen Project</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMarkInProgress(project.id, project.title)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Mark In Progress & Add to Roadmap</span>
                      </button>
                    )}
                  </div>
                </footer>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};
