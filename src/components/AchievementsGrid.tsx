import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle2,
  Compass,
  Flame,
  FolderCheck,
  Lock,
  Mic,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { PageId } from '../types';
import type { AchievementIconName, AchievementStatus } from '../utils/achievements';

interface AchievementsGridProps {
  achievements: AchievementStatus[];
  onNavigate: (page: PageId) => void;
}

const ICON_MAP: Record<AchievementIconName, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  zap: Zap,
  compass: Compass,
  'check-circle': CheckCircle2,
  'folder-check': FolderCheck,
  mic: Mic,
  'trending-up': TrendingUp,
  briefcase: Briefcase,
};

function formatUnlockDate(iso?: string): string {
  if (!iso) return 'Unlocked';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Unlocked';
  }
}

export const AchievementsGrid: React.FC<AchievementsGridProps> = ({
  achievements,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedCount = useMemo(
    () => achievements.filter((a) => a.unlocked).length,
    [achievements]
  );

  const visibleItems = useMemo(() => {
    if (filter === 'unlocked') return achievements.filter((a) => a.unlocked);
    if (filter === 'locked') return achievements.filter((a) => !a.unlocked);
    return achievements;
  }, [achievements, filter]);

  const completionPct =
    achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0;

  return (
    <section
      aria-label="Achievements"
      className="bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-5"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-blush-tint text-primary flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-ink">Achievements</h2>
              <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                {unlockedCount} / {achievements.length} unlocked
              </span>
            </div>
            <p className="text-xs text-ink-muted">
              Earned automatically from daily streaks, closed skill gaps, completed projects, and
              interview milestones.
            </p>
          </div>
        </div>

        {/* Interactive Filter Control */}
        <div className="inline-flex items-center p-1 rounded-[12px] bg-surface-mid self-start sm:self-auto">
          {(
            [
              { id: 'all', label: `All (${achievements.length})` },
              { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
              { id: 'locked', label: `In Progress (${achievements.length - unlockedCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filter === tab.id
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Overall Trophy Progress Strip */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-surface-mid overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <span className="font-mono text-xs text-ink-muted tabular-nums shrink-0">
          {completionPct}% complete
        </span>
      </div>

      {/* Badge Grid */}
      {visibleItems.length === 0 ? (
        <div className="py-8 text-center text-sm text-ink-muted">
          {filter === 'unlocked'
            ? 'No badges unlocked yet — complete a task, close a skill gap, or load the demo persona to start earning milestones.'
            : 'All achievements unlocked. Outstanding pivot execution.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {visibleItems.map((badge) => {
            const Icon = ICON_MAP[badge.icon] ?? Award;
            return (
              <article
                key={badge.id}
                className={`rounded-[16px] p-4 flex flex-col justify-between gap-3.5 transition-colors ${
                  badge.unlocked
                    ? 'bg-blush-tint/55 border border-blush-mid'
                    : 'bg-surface-low border border-line'
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        badge.unlocked
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-mid text-ink-subtle'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-ink-muted flex items-center gap-1">
                      {badge.unlocked ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          <span className="text-primary font-medium">
                            {formatUnlockDate(badge.unlockedAt)}
                          </span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-ink-subtle" />
                          <span>{badge.percent}%</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-ink-muted">{badge.category}</span>
                    <h3 className="text-sm font-semibold text-ink leading-snug">{badge.title}</h3>
                    <p className="text-xs text-ink-muted leading-relaxed">{badge.description}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-line/70">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums">
                    <span className={badge.unlocked ? 'text-primary font-medium' : 'text-ink-muted'}>
                      {badge.progressLabel}
                    </span>
                    {!badge.unlocked && (
                      <button
                        type="button"
                        onClick={() => onNavigate(badge.actionPage)}
                        className="font-sans font-medium text-primary hover:underline inline-flex items-center gap-0.5 whitespace-nowrap cursor-pointer"
                      >
                        <span>{badge.actionLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-mid overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        badge.unlocked ? 'bg-primary' : 'bg-blush-mid'
                      }`}
                      style={{ width: `${badge.percent}%` }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
