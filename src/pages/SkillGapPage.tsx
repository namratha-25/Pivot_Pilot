import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  Map as MapIcon,
  Quote,
  RefreshCw,
  Sparkles,
  Wand2,
} from 'lucide-react';
import type { BulletRewriteResponse, PageId, SkillGapItem } from '../types';
import { usePivotPilot } from '../store/PivotPilotContext';
import { analyzeSkillGapApi, rewriteBulletApi } from '../services/api';
import { EmptyState, ErrorBanner, LoadingSkeleton, ReadinessRing } from '../components/UI';

function getGapIntensityStyles(gap: number): {
  tileClass: string;
  barClass: string;
  label: string;
} {
  if (gap >= 50) {
    return {
      tileClass: 'bg-primary text-on-primary border-primary',
      barClass: 'bg-primary',
      label: 'Critical Gap',
    };
  }
  if (gap >= 35) {
    return {
      tileClass: 'bg-blush-soft text-primary-deep border-blush-mid',
      barClass: 'bg-blush-mid',
      label: 'Priority Gap',
    };
  }
  if (gap >= 15) {
    return {
      tileClass: 'bg-blush-tint text-ink border-blush-soft',
      barClass: 'bg-blush-mid/70',
      label: 'Building',
    };
  }
  return {
    tileClass: 'bg-surface-low text-ink border-line',
    barClass: 'bg-ink-subtle',
    label: 'Ready',
  };
}

export const SkillGapPage: React.FC<{ onNavigate: (page: PageId) => void }> = ({ onNavigate }) => {
  const { state, setGapMap, setDemoMode, loadDemoPersona } = usePivotPilot();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'bars' | 'heatmap'>('bars');
  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(null);

  // ATS Bullet Rewriter state
  const [selectedBullet, setSelectedBullet] = useState<string>(
    state.profile.achievements[0] ?? ''
  );
  const [rewriting, setRewriting] = useState(false);
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  const [rewriteResult, setRewriteResult] = useState<BulletRewriteResponse | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedBullet && state.profile.achievements.length > 0) {
      setSelectedBullet(state.profile.achievements[0]);
    }
  }, [state.profile.achievements, selectedBullet]);

  const filledJds = useMemo(
    () => state.jobDescriptions.filter((jd) => jd.text.trim().length > 15),
    [state.jobDescriptions]
  );

  const sortedSkills = useMemo(() => {
    if (!state.gapMap?.skills) return [];
    return [...state.gapMap.skills].sort((a, b) => b.gap - a.gap);
  }, [state.gapMap]);

  const activeSkill: SkillGapItem | null = useMemo(() => {
    if (!sortedSkills.length) return null;
    if (selectedSkillName) {
      return sortedSkills.find((s) => s.name === selectedSkillName) ?? sortedSkills[0];
    }
    return sortedSkills[0];
  }, [sortedSkills, selectedSkillName]);

  const runAnalysis = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await analyzeSkillGapApi(state.profile, filledJds, state.demoMode);
      setGapMap(result);
      if (result.skills[0]) setSelectedSkillName(result.skills[0].name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze skill gaps.');
    } finally {
      setLoading(false);
    }
  };

  const runRewrite = async () => {
    const bulletText = selectedBullet.trim();
    if (!bulletText) return;
    setRewriteError(null);
    setRewriting(true);
    try {
      const topGaps = sortedSkills.slice(0, 5).map((s) => s.name);
      const res = await rewriteBulletApi(
        bulletText,
        state.profile.targetRole || 'Product Manager',
        topGaps,
        state.demoMode
      );
      setRewriteResult(res);
    } catch (err) {
      setRewriteError(err instanceof Error ? err.message : 'Failed to rewrite bullet.');
    } finally {
      setRewriting(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1600);
  };

  const canAnalyze = Boolean(
    (state.profile.resumeText.trim() || state.profile.skills.length > 0) && filledJds.length > 0
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl sm:text-[28px] font-semibold text-ink tracking-tight">
            Skill-Gap Map
          </h1>
          <p className="text-sm text-ink-muted">
            Evidence-backed gaps weighted across your target JDs, plus ATS bullet tailoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            disabled={!canAnalyze || loading}
            onClick={runAnalysis}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            {state.gapMap ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Analyzing...' : state.gapMap ? 'Re-run Analysis' : 'Analyze Skill Gaps'}</span>
          </button>
        </div>
      </header>

      {error && (
        <ErrorBanner
          message={error}
          demoMode={state.demoMode}
          onRetry={runAnalysis}
          onEnableDemoMode={() => {
            setDemoMode(true);
            setError(null);
          }}
        />
      )}

      {loading && (
        <LoadingSkeleton
          rows={5}
          title="Benchmarking resume against all target job descriptions with Gemini..."
        />
      )}

      {!loading && !state.gapMap && (
        <EmptyState
          icon={<MapIcon className="w-6 h-6" />}
          title="No Skill-Gap Map generated yet"
          description={
            canAnalyze
              ? `Ready to analyze ${state.profile.name || 'your resume'} against ${
                  filledJds.length
                } job descriptions for ${state.profile.targetRole || 'your target role'}.`
              : 'Add your resume and at least one job description on Intake first, or load Ravi’s demo persona.'
          }
          actionLabel={canAnalyze ? 'Analyze Skill Gaps with Gemini' : 'Go to Intake'}
          onAction={() => (canAnalyze ? runAnalysis() : onNavigate('intake'))}
          secondaryLabel={!canAnalyze ? 'Load Demo Persona (Ravi)' : undefined}
          onSecondary={!canAnalyze ? loadDemoPersona : undefined}
        />
      )}

      {!loading && state.gapMap && (
        <>
          {/* Top Summary: Pivot Readiness + JD Match Scores */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <article className="lg:col-span-5 bg-surface border border-line rounded-[20px] p-6 flex flex-col justify-between gap-5">
              <div>
                <h2 className="text-lg font-semibold text-ink">Pivot readiness score</h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  Targeting {state.profile.targetRole || 'Target Role'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ReadinessRing score={state.gapMap.readinessScore} size={148} subtitle="Overall" />
                <p className="text-sm text-ink leading-relaxed">
                  {state.gapMap.readinessExplanation}
                </p>
              </div>
              <div className="pt-3 border-t border-line flex items-center justify-between text-xs text-ink-muted">
                <span>{sortedSkills.length} skills evaluated</span>
                <button
                  type="button"
                  onClick={() => onNavigate('roadmap')}
                  className="text-primary font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Build Roadmap from Gaps</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>

            {/* Per-JD Match Scores */}
            <article className="lg:col-span-7 bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Resume-vs-JD match scores</h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Ranked by alignment with your current resume evidence
                  </p>
                </div>
                <span className="font-mono text-xs text-ink-muted tabular-nums">
                  {state.gapMap.jdMatches.length} JDs
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {[...state.gapMap.jdMatches]
                  .sort((a, b) => b.matchScore - a.matchScore)
                  .map((jd) => (
                    <div
                      key={jd.jdId}
                      className="rounded-[12px] bg-surface-low border border-line p-3.5 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-ink">{jd.company}</span>
                          <span className="text-xs text-ink-muted"> · {jd.roleTitle}</span>
                        </div>
                        <span className="font-mono text-sm font-semibold text-primary tabular-nums shrink-0">
                          {Math.round(jd.matchScore)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-mid overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(5, jd.matchScore))}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                        <span>
                          <strong className="text-ink font-medium">Matches:</strong>{' '}
                          {jd.keyMatches.slice(0, 2).join(', ')}
                        </span>
                        {jd.missingSkills.length > 0 && (
                          <span>
                            <strong className="text-primary font-medium">Missing:</strong>{' '}
                            {jd.missingSkills.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </article>
          </section>

          {/* Main Interactive Skill-Gap Matrix / Bars + Evidence Inspector */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Skills sorted by gap</h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Click any skill to inspect verbatim JD evidence quotes & transferable strengths
                  </p>
                </div>

                {/* Segmented View Toggle */}
                <div className="inline-flex items-center p-1 rounded-[12px] bg-surface-mid">
                  <button
                    type="button"
                    onClick={() => setViewMode('bars')}
                    className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors cursor-pointer ${
                      viewMode === 'bars'
                        ? 'bg-surface text-ink shadow-xs'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    Gap Bars
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('heatmap')}
                    className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors cursor-pointer ${
                      viewMode === 'heatmap'
                        ? 'bg-surface text-ink shadow-xs'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    Heatmap
                  </button>
                </div>
              </div>

              {viewMode === 'bars' ? (
                <div className="flex flex-col gap-2.5">
                  {sortedSkills.map((skill) => {
                    const isSelected = activeSkill?.name === skill.name;
                    const styles = getGapIntensityStyles(skill.gap);
                    return (
                      <button
                        key={skill.name}
                        type="button"
                        onClick={() => setSelectedSkillName(skill.name)}
                        className={`text-left rounded-[14px] border p-4 flex flex-col gap-2.5 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blush-tint/60 border-primary'
                            : 'bg-surface-low border-line hover:border-blush-mid'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-sm font-semibold text-ink block truncate">
                              {skill.name}
                            </span>
                            <span className="text-xs text-ink-muted">
                              {skill.category} · {styles.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 font-mono text-xs tabular-nums shrink-0">
                            <span className="text-ink-muted">Imp {skill.importance}</span>
                            <span className="text-ink-muted">You {skill.userLevel}</span>
                            <span className="font-semibold text-primary">Gap {skill.gap}</span>
                          </div>
                        </div>

                        {/* Stacked progress visualization: userLevel vs importance */}
                        <div className="relative h-2.5 rounded-full bg-surface-mid overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-blush-soft"
                            style={{ width: `${Math.min(100, skill.importance)}%` }}
                            title={`JD Importance: ${skill.importance}`}
                          />
                          <div
                            className={`absolute inset-y-0 left-0 rounded-full ${styles.barClass}`}
                            style={{ width: `${Math.min(100, skill.userLevel)}%` }}
                            title={`Current Proficiency: ${skill.userLevel}`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sortedSkills.map((skill) => {
                    const isSelected = activeSkill?.name === skill.name;
                    const styles = getGapIntensityStyles(skill.gap);
                    return (
                      <button
                        key={skill.name}
                        type="button"
                        onClick={() => setSelectedSkillName(skill.name)}
                        className={`text-left rounded-[14px] border p-4 flex flex-col justify-between gap-3 transition-transform cursor-pointer ${
                          styles.tileClass
                        } ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold leading-snug">{skill.name}</span>
                          <span className="font-mono text-xs font-semibold tabular-nums shrink-0">
                            -{skill.gap}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs opacity-90 font-mono tabular-nums">
                          <span>{skill.category}</span>
                          <span>
                            {skill.userLevel} / {skill.importance}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Skill Evidence Inspector Panel */}
            <aside className="lg:col-span-5 bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-5 lg:sticky lg:top-6">
              {activeSkill ? (
                <>
                  <header className="flex flex-col gap-1 pb-4 border-b border-line">
                    <span className="text-xs font-medium text-primary">
                      {activeSkill.category} · {getGapIntensityStyles(activeSkill.gap).label}
                    </span>
                    <h3 className="text-lg font-semibold text-ink">{activeSkill.name}</h3>
                  </header>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-[12px] bg-surface-low border border-line p-3 flex flex-col gap-0.5">
                      <span className="text-[11px] text-ink-muted">JD Demand</span>
                      <span className="font-mono text-lg font-semibold text-ink tabular-nums">
                        {activeSkill.importance}
                      </span>
                    </div>
                    <div className="rounded-[12px] bg-surface-low border border-line p-3 flex flex-col gap-0.5">
                      <span className="text-[11px] text-ink-muted">Your Level</span>
                      <span className="font-mono text-lg font-semibold text-ink tabular-nums">
                        {activeSkill.userLevel}
                      </span>
                    </div>
                    <div className="rounded-[12px] bg-blush-tint border border-blush-soft p-3 flex flex-col gap-0.5">
                      <span className="text-[11px] text-primary">Priority Gap</span>
                      <span className="font-mono text-lg font-semibold text-primary tabular-nums">
                        {activeSkill.gap}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-ink">
                      Transferable strength from your resume
                    </span>
                    <p className="text-sm text-ink-muted leading-relaxed rounded-[12px] bg-surface-low border border-line p-3.5">
                      {activeSkill.transferableFrom}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <span className="text-xs font-semibold text-ink inline-flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5 text-primary" />
                      <span>Evidence quotes from target JDs</span>
                    </span>
                    <ul className="flex flex-col gap-2">
                      {activeSkill.evidenceQuotes.map((quote, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-ink leading-relaxed rounded-[12px] bg-surface-low border border-line p-3 italic"
                        >
                          “{quote}”
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-sm text-ink-muted">Select a skill to inspect details.</p>
              )}
            </aside>
          </section>

          {/* ATS Bullet Rewriter */}
          <section className="bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-5">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">ATS bullet rewriter</h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  Pick a resume achievement bullet to generate 3 tailored rewrites for{' '}
                  {state.profile.targetRole || 'your target role'}.
                </p>
              </div>
              <Wand2 className="w-5 h-5 text-primary" />
            </header>

            {state.profile.achievements.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-ink-muted">
                  Pick from your extracted resume bullets:
                </span>
                <div className="flex flex-col gap-2">
                  {state.profile.achievements.map((bullet, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedBullet(bullet)}
                      className={`text-left text-xs p-3 rounded-[12px] border transition-colors cursor-pointer ${
                        selectedBullet === bullet
                          ? 'bg-blush-tint border-primary text-ink font-medium'
                          : 'bg-surface-low border-line text-ink-muted hover:text-ink'
                      }`}
                    >
                      {bullet}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <textarea
                rows={2}
                value={selectedBullet}
                onChange={(e) => setSelectedBullet(e.target.value)}
                placeholder="Or paste any resume bullet here..."
                className="flex-1 rounded-[12px] bg-surface-low border border-line px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                disabled={rewriting || !selectedBullet.trim()}
                onClick={runRewrite}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-medium hover:opacity-90 disabled:opacity-50 whitespace-nowrap self-end sm:self-center cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{rewriting ? 'Rewriting...' : 'Get 3 Rewrites'}</span>
              </button>
            </div>

            {rewriteError && (
              <ErrorBanner
                message={rewriteError}
                demoMode={state.demoMode}
                onRetry={runRewrite}
                onEnableDemoMode={() => {
                  setDemoMode(true);
                  setRewriteError(null);
                }}
              />
            )}

            {rewriting && <LoadingSkeleton rows={3} title="Crafting 3 ATS-aligned bullet options..." />}

            {!rewriting && rewriteResult && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {rewriteResult.rewrites.map((opt, idx) => (
                  <article
                    key={idx}
                    className="rounded-[16px] bg-surface-low border border-line p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-primary">{opt.angle}</span>
                      <p className="text-sm text-ink leading-relaxed font-medium">
                        {opt.rewrittenBullet}
                      </p>
                      <p className="text-xs text-ink-muted leading-relaxed">{opt.rationale}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(opt.rewrittenBullet, idx)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-line text-xs font-medium text-ink hover:border-primary hover:text-primary transition-colors self-start cursor-pointer"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-primary" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy bullet</span>
                        </>
                      )}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
