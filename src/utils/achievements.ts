import type { PageId, PivotPilotState } from '../types';

export type AchievementIconName =
  | 'flame'
  | 'zap'
  | 'compass'
  | 'check-circle'
  | 'folder-check'
  | 'mic'
  | 'trending-up'
  | 'briefcase';

export interface AchievementStatus {
  id: string;
  title: string;
  description: string;
  category: 'Momentum' | 'Skills' | 'Execution' | 'Interview' | 'Pipeline';
  icon: AchievementIconName;
  unlocked: boolean;
  unlockedAt?: string;
  current: number;
  target: number;
  progressLabel: string;
  percent: number;
  actionPage: PageId;
  actionLabel: string;
}

export function evaluateAchievements(state: PivotPilotState): AchievementStatus[] {
  const unlockedDates = state.unlockedAchievements ?? {};

  // 1. Consistency Master — 7-day streak
  const streakCurrent = state.streakDays;
  const streakTarget = 7;
  const consistencyUnlocked = streakCurrent >= streakTarget;

  // 2. Skill Ninja — close at least 3 skills to Ready status (gap <= 20)
  const closedSkillsCount =
    state.gapMap?.skills.filter((s) => s.gap <= 20 || s.userLevel >= 70).length ?? 0;
  const skillTarget = 3;
  const skillNinjaUnlocked = closedSkillsCount >= skillTarget;

  // 3. Blueprint Architect — Gap Map + Roadmap both generated
  const blueprintSteps = (state.gapMap ? 1 : 0) + (state.roadmap ? 1 : 0);
  const blueprintUnlocked = blueprintSteps >= 2;

  // 4. Week Crusher — Complete 100% of tasks in at least 1 roadmap week
  const completedWeeks =
    state.roadmap?.weeks.filter(
      (w) => w.tasks.length > 0 && w.tasks.every((t) => t.completed)
    ).length ?? 0;
  const weekCrusherUnlocked = completedWeeks >= 1;

  // 5. Proof-of-Work Builder — Ship at least 1 completed portfolio project
  const completedProjects = state.projects.filter((p) => p.status === 'completed').length;
  const proofUnlocked = completedProjects >= 1;

  // 6. Rubric Ace — Score >= 3.8/5 average in any Mock Interview session
  const bestInterviewScore = state.interviews.reduce(
    (best, s) => Math.max(best, s.overallAverage || 0),
    0
  );
  const rubricAceUnlocked = bestInterviewScore >= 3.8;

  // 7. Adaptive Strategist — Submit at least 1 Weekly Check-In
  const checkInCount = state.progressLogs.length;
  const adaptiveUnlocked = checkInCount >= 1;

  // 8. Pipeline Pro — Track 5+ applications and earn at least 1 interview or offer
  const totalApps = state.applications.length;
  const interviewOrOffer = state.applications.filter(
    (a) => a.status === 'interview' || a.status === 'offer'
  ).length;
  const pipelineUnlocked = totalApps >= 5 && interviewOrOffer >= 1;
  const pipelineProgress = Math.min(5, totalApps) + (interviewOrOffer >= 1 ? 1 : 0);

  const items: AchievementStatus[] = [
    {
      id: 'consistency-master',
      title: 'Consistency Master',
      description: 'Maintain a 7-day active career pivot learning streak.',
      category: 'Momentum',
      icon: 'flame',
      unlocked: consistencyUnlocked,
      unlockedAt: unlockedDates['consistency-master'],
      current: Math.min(streakCurrent, streakTarget),
      target: streakTarget,
      progressLabel: `${streakCurrent} / ${streakTarget} days`,
      percent: Math.min(100, Math.round((streakCurrent / streakTarget) * 100)),
      actionPage: 'roadmap',
      actionLabel: 'Complete a task',
    },
    {
      id: 'skill-ninja',
      title: 'Skill Ninja',
      description: 'Close high-gap skills so at least 3 target skills reach Ready status (gap ≤ 20).',
      category: 'Skills',
      icon: 'zap',
      unlocked: skillNinjaUnlocked,
      unlockedAt: unlockedDates['skill-ninja'],
      current: Math.min(closedSkillsCount, skillTarget),
      target: skillTarget,
      progressLabel: `${closedSkillsCount} / ${skillTarget} skills ready`,
      percent: Math.min(100, Math.round((closedSkillsCount / skillTarget) * 100)),
      actionPage: 'skill-gap',
      actionLabel: 'Inspect gaps',
    },
    {
      id: 'blueprint-architect',
      title: 'Blueprint Architect',
      description: 'Generate both your Skill-Gap Map and personalized weekly Roadmap.',
      category: 'Execution',
      icon: 'compass',
      unlocked: blueprintUnlocked,
      unlockedAt: unlockedDates['blueprint-architect'],
      current: blueprintSteps,
      target: 2,
      progressLabel: `${blueprintSteps} / 2 plans built`,
      percent: Math.round((blueprintSteps / 2) * 100),
      actionPage: state.gapMap ? 'roadmap' : 'skill-gap',
      actionLabel: state.gapMap ? 'Build roadmap' : 'Run skill gap',
    },
    {
      id: 'week-crusher',
      title: 'Week Crusher',
      description: 'Check off 100% of scheduled tasks in any Roadmap week.',
      category: 'Execution',
      icon: 'check-circle',
      unlocked: weekCrusherUnlocked,
      unlockedAt: unlockedDates['week-crusher'],
      current: Math.min(completedWeeks, 1),
      target: 1,
      progressLabel: `${completedWeeks} / 1 week finished`,
      percent: weekCrusherUnlocked ? 100 : 0,
      actionPage: 'roadmap',
      actionLabel: 'Finish week',
    },
    {
      id: 'proof-builder',
      title: 'Proof-of-Work Builder',
      description: 'Complete and ship at least 1 gap-closing portfolio project.',
      category: 'Skills',
      icon: 'folder-check',
      unlocked: proofUnlocked,
      unlockedAt: unlockedDates['proof-builder'],
      current: Math.min(completedProjects, 1),
      target: 1,
      progressLabel: `${completedProjects} / 1 project shipped`,
      percent: proofUnlocked ? 100 : 0,
      actionPage: 'projects',
      actionLabel: 'View projects',
    },
    {
      id: 'rubric-ace',
      title: 'Rubric Ace',
      description: 'Earn a 3.8 / 5.0 or higher overall score in a Mock Interview session.',
      category: 'Interview',
      icon: 'mic',
      unlocked: rubricAceUnlocked,
      unlockedAt: unlockedDates['rubric-ace'],
      current: Number(Math.min(bestInterviewScore, 3.8).toFixed(1)),
      target: 3.8,
      progressLabel: `${bestInterviewScore.toFixed(1)} / 3.8 score`,
      percent: Math.min(100, Math.round((bestInterviewScore / 3.8) * 100)),
      actionPage: 'mock-interview',
      actionLabel: 'Practice mock',
    },
    {
      id: 'adaptive-strategist',
      title: 'Adaptive Strategist',
      description: 'Submit a weekly check-in to recalibrate your skill levels and roadmap.',
      category: 'Momentum',
      icon: 'trending-up',
      unlocked: adaptiveUnlocked,
      unlockedAt: unlockedDates['adaptive-strategist'],
      current: Math.min(checkInCount, 1),
      target: 1,
      progressLabel: `${checkInCount} / 1 check-in`,
      percent: adaptiveUnlocked ? 100 : 0,
      actionPage: 'progress',
      actionLabel: 'Log check-in',
    },
    {
      id: 'pipeline-pro',
      title: 'Pipeline Pro',
      description: 'Log at least 5 job applications and convert 1 or more into an interview or offer.',
      category: 'Pipeline',
      icon: 'briefcase',
      unlocked: pipelineUnlocked,
      unlockedAt: unlockedDates['pipeline-pro'],
      current: pipelineProgress,
      target: 6,
      progressLabel: `${totalApps} apps · ${interviewOrOffer} interviews`,
      percent: Math.min(100, Math.round((pipelineProgress / 6) * 100)),
      actionPage: 'applications',
      actionLabel: 'Track pipeline',
    },
  ];

  return items;
}
