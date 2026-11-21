import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type {
  ApplicationEntry,
  ApplicationInsights,
  GapMap,
  InterviewSession,
  JobDescription,
  PivotPilotState,
  PortfolioProject,
  Profile,
  ProgressLog,
  Roadmap,
} from '../types';
import {
  RAVI_DEMO_APP_INSIGHTS,
  RAVI_DEMO_APPLICATIONS,
  RAVI_DEMO_GAP_MAP,
  RAVI_DEMO_INTERVIEWS,
  RAVI_DEMO_PROGRESS_LOGS,
  RAVI_DEMO_PROJECTS,
  RAVI_DEMO_READINESS_HISTORY,
  RAVI_DEMO_ROADMAP,
  RAVI_JOB_DESCRIPTIONS,
  RAVI_PROFILE,
} from '../data/demoPersona';
import { evaluateAchievements, type AchievementStatus } from '../utils/achievements';
import { mergeProjects, mergeRoadmap } from '../utils/planMerge';

const STORAGE_KEY = 'pivotpilot_state_v1';

const EMPTY_PROFILE: Profile = {
  name: '',
  currentRole: '',
  yearsExperience: 0,
  skills: [],
  education: [],
  achievements: [],
  targetRole: '',
  hoursPerWeek: 8,
  weeksAvailable: 12,
  resumeText: '',
  resumeFileName: '',
};

const INITIAL_STATE: PivotPilotState = {
  profile: EMPTY_PROFILE,
  jobDescriptions: [
    { id: 'jd-init-1', company: '', title: '', text: '' },
    { id: 'jd-init-2', company: '', title: '', text: '' },
    { id: 'jd-init-3', company: '', title: '', text: '' },
  ],
  gapMap: null,
  roadmap: null,
  projects: [],
  interviews: [],
  progressLogs: [],
  applications: [],
  readinessHistory: [],
  applicationInsights: null,
  demoMode: false,
  theme: 'light',
  tourDismissed: false,
  currentWeek: 1,
  streakDays: 0,
  unlockedAchievements: {},
};

function loadInitialState(): PivotPilotState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as Partial<PivotPilotState>;
    return {
      ...INITIAL_STATE,
      ...parsed,
      profile: { ...EMPTY_PROFILE, ...(parsed.profile ?? {}) },
      jobDescriptions:
        Array.isArray(parsed.jobDescriptions) && parsed.jobDescriptions.length > 0
          ? parsed.jobDescriptions
          : INITIAL_STATE.jobDescriptions,
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      interviews: Array.isArray(parsed.interviews) ? parsed.interviews : [],
      progressLogs: Array.isArray(parsed.progressLogs) ? parsed.progressLogs : [],
      applications: Array.isArray(parsed.applications) ? parsed.applications : [],
      readinessHistory: Array.isArray(parsed.readinessHistory) ? parsed.readinessHistory : [],
      unlockedAchievements:
        typeof parsed.unlockedAchievements === 'object' && parsed.unlockedAchievements !== null
          ? parsed.unlockedAchievements
          : {},
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      demoMode: Boolean(parsed.demoMode),
    };
  } catch {
    return INITIAL_STATE;
  }
}

interface PivotPilotContextValue {
  state: PivotPilotState;
  updateProfile: (patch: Partial<Profile>) => void;
  setJobDescriptions: (jds: JobDescription[]) => void;
  setGapMap: (gapMap: GapMap) => void;
  setRoadmap: (roadmap: Roadmap) => void;
  toggleRoadmapTask: (weekNumber: number, taskId: string) => void;
  setProjects: (projects: PortfolioProject[]) => void;
  updateProjectStatus: (projectId: string, status: PortfolioProject['status']) => void;
  addInterviewSession: (session: InterviewSession) => void;
  updateInterviewSession: (session: InterviewSession) => void;
  applyWeeklyCheckIn: (payload: {
    log: ProgressLog;
    updatedSkillLevels: { skillName: string; newUserLevel: number }[];
    updatedRoadmap: Roadmap;
  }) => void;
  addApplication: (entry: Omit<ApplicationEntry, 'id'>) => void;
  updateApplication: (entry: ApplicationEntry) => void;
  deleteApplication: (id: string) => void;
  setApplicationInsights: (insights: ApplicationInsights | null) => void;
  loadDemoPersona: () => void;
  resetAllData: () => void;
  setDemoMode: (enabled: boolean) => void;
  toggleTheme: () => void;
  setTourDismissed: (dismissed: boolean) => void;
  setCurrentWeek: (week: number) => void;
  latestWeakInterviewAreas: string[];
  overallCompletionRate: number;
  achievements: AchievementStatus[];
}

const PivotPilotContext = createContext<PivotPilotContextValue | null>(null);

export const PivotPilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PivotPilotState>(() => loadInitialState());

  // Sync dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to persist PivotPilot state:', err);
    }
  }, [state]);

  const updateProfile = (patch: Partial<Profile>) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...patch },
    }));
  };

  const setJobDescriptions = (jobDescriptions: JobDescription[]) => {
    setState((prev) => ({ ...prev, jobDescriptions }));
  };

  const setGapMap = (gapMap: GapMap) => {
    setState((prev) => {
      const nextScore = Math.round(gapMap.readinessScore);
      let nextHistory = [...prev.readinessHistory];
      if (nextHistory.length === 0) {
        nextHistory = [
          {
            date: new Date().toISOString().slice(0, 10),
            label: 'Baseline',
            score: nextScore,
            completionRate: 0,
          },
        ];
      } else if (nextHistory.length === 1 && nextHistory[0].label === 'Baseline') {
        nextHistory[0] = { ...nextHistory[0], score: nextScore };
      }
      return {
        ...prev,
        gapMap,
        readinessHistory: nextHistory,
      };
    });
  };

  const setRoadmap = (roadmap: Roadmap) => {
    setState((prev) => ({
      ...prev,
      roadmap: mergeRoadmap(prev.roadmap, roadmap, prev.currentWeek),
    }));
  };

  const toggleRoadmapTask = (weekNumber: number, taskId: string) => {
    setState((prev) => {
      if (!prev.roadmap) return prev;
      let toggledToDone = false;
      let linkedProjectId: string | undefined;
      let nextCompletedState = false;

      const weeks = prev.roadmap.weeks.map((week) => {
        if (week.weekNumber !== weekNumber) return week;
        return {
          ...week,
          tasks: week.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const nextCompleted = !task.completed;
            toggledToDone = nextCompleted;
            nextCompletedState = nextCompleted;
            linkedProjectId = task.projectId;
            return { ...task, completed: nextCompleted };
          }),
        };
      });

      let updatedProjects = prev.projects;
      if (linkedProjectId) {
        updatedProjects = prev.projects.map((p) => {
          if (p.id !== linkedProjectId) return p;
          return {
            ...p,
            status: nextCompletedState ? 'completed' : 'in_progress',
          };
        });
      }

      return {
        ...prev,
        roadmap: { ...prev.roadmap, weeks },
        projects: updatedProjects,
        streakDays: toggledToDone ? Math.max(prev.streakDays, 1) : prev.streakDays,
      };
    });
  };

  const setProjects = (projects: PortfolioProject[]) => {
    setState((prev) => ({
      ...prev,
      projects: mergeProjects(prev.projects, projects),
    }));
  };

  const updateProjectStatus = (projectId: string, status: PortfolioProject['status']) => {
    setState((prev) => {
      const targetProject = prev.projects.find((p) => p.id === projectId);
      const updatedProjects = prev.projects.map((p) =>
        p.id === projectId ? { ...p, status } : p
      );

      let updatedRoadmap = prev.roadmap;

      if (status === 'completed' && updatedRoadmap) {
        // Mark linked tasks as completed
        const weeks = updatedRoadmap.weeks.map((w) => ({
          ...w,
          tasks: w.tasks.map((t) =>
            t.projectId === projectId ? { ...t, completed: true } : t
          ),
        }));
        updatedRoadmap = { ...updatedRoadmap, weeks };
      } else if (status === 'in_progress' && targetProject) {
        const alreadyInRoadmap = updatedRoadmap?.weeks.some((w) =>
          w.tasks.some((t) => t.projectId === projectId || t.title.includes(targetProject.title))
        );

        if (alreadyInRoadmap && updatedRoadmap) {
          const weeks = updatedRoadmap.weeks.map((w) => ({
            ...w,
            tasks: w.tasks.map((t) =>
              t.projectId === projectId ? { ...t, completed: false } : t
            ),
          }));
          updatedRoadmap = { ...updatedRoadmap, weeks };
        } else if (!alreadyInRoadmap) {
          const budget = Math.max(prev.profile.hoursPerWeek || 8, 2);
          const taskHours = Number(Math.min(targetProject.estHours, Math.max(budget * 0.5, 2)).toFixed(1));
          const newTask = {
            id: `proj-task-${projectId}`,
            title: `Portfolio Project: ${targetProject.title}`,
            type: 'project' as const,
            estHours: taskHours,
            skillsTargeted: targetProject.gapsClosed.length
              ? targetProject.gapsClosed
              : targetProject.skillsCovered.slice(0, 2),
            resourceSuggestion: targetProject.deliverables[0] || 'Complete project deliverables',
            completed: false,
            projectId,
          };

          if (prev.roadmap && prev.roadmap.weeks.length > 0) {
            let targetIdx = prev.roadmap.weeks.findIndex((w) => {
              if (w.weekNumber < prev.currentWeek) return false;
              const used = w.tasks.reduce((s, t) => s + t.estHours, 0);
              return used + taskHours <= budget;
            });
            if (targetIdx === -1) {
              targetIdx = Math.max(
                0,
                prev.roadmap.weeks.findIndex((w) => w.weekNumber >= prev.currentWeek)
              );
            }

            const weeks = prev.roadmap.weeks.map((w, idx) => {
              if (idx !== targetIdx) return w;
              const currentSum = w.tasks.reduce((s, t) => s + t.estHours, 0);
              let excess = currentSum + taskHours - budget;
              const adjustedTasks = w.tasks.map((t) => {
                if (excess <= 0 || t.completed || t.type === 'project') return t;
                const reducible = Math.max(0, t.estHours - 0.5);
                const cut = Math.min(reducible, excess);
                excess -= cut;
                return { ...t, estHours: Number((t.estHours - cut).toFixed(1)) };
              });
              return {
                ...w,
                tasks: [...adjustedTasks, newTask],
              };
            });

            updatedRoadmap = { ...prev.roadmap, weeks };
          } else {
            updatedRoadmap = {
              generatedAt: new Date().toISOString(),
              focusNote: 'Started from an active portfolio project.',
              weeks: [
                {
                  weekNumber: 1,
                  theme: `Portfolio Sprint: ${targetProject.title}`,
                  goals: targetProject.deliverables.slice(0, 2),
                  tasks: [newTask],
                  milestone: `Complete ${targetProject.title}`,
                },
              ],
            };
          }
        }
      }

      return {
        ...prev,
        projects: updatedProjects,
        roadmap: updatedRoadmap,
      };
    });
  };

  const addInterviewSession = (session: InterviewSession) => {
    setState((prev) => ({
      ...prev,
      interviews: [session, ...prev.interviews],
    }));
  };

  const updateInterviewSession = (session: InterviewSession) => {
    setState((prev) => {
      const exists = prev.interviews.some((i) => i.id === session.id);
      return {
        ...prev,
        interviews: exists
          ? prev.interviews.map((i) => (i.id === session.id ? session : i))
          : [session, ...prev.interviews],
      };
    });
  };

  const applyWeeklyCheckIn = ({
    log,
    updatedSkillLevels,
    updatedRoadmap,
  }: {
    log: ProgressLog;
    updatedSkillLevels: { skillName: string; newUserLevel: number }[];
    updatedRoadmap: Roadmap;
  }) => {
    setState((prev) => {
      const levelMap = new Map(
        updatedSkillLevels.map((s) => [s.skillName.toLowerCase(), s.newUserLevel])
      );

      const updatedGapMap = prev.gapMap
        ? {
            ...prev.gapMap,
            readinessScore: Math.round(log.newReadinessScore),
            skills: prev.gapMap.skills
              .map((skill) => {
                const nextLevel = levelMap.get(skill.name.toLowerCase());
                if (nextLevel === undefined) return skill;
                const clamped = Math.max(0, Math.min(100, Math.round(nextLevel)));
                const nextGap = Math.max(0, Math.round(skill.importance - clamped));
                return { ...skill, userLevel: clamped, gap: nextGap };
              })
              .sort((a, b) => b.gap - a.gap),
          }
        : null;

      const completionRate =
        log.totalTasksCount > 0
          ? Math.round((log.tasksCompletedCount / log.totalTasksCount) * 100)
          : 0;

      const nextPoint = {
        date: log.date.slice(0, 10),
        label: `Week ${log.weekNumber}`,
        score: Math.round(log.newReadinessScore),
        completionRate,
      };

      const mergedRoadmap = mergeRoadmap(prev.roadmap, updatedRoadmap, log.weekNumber + 1);

      const nextWeek = Math.min(
        mergedRoadmap.weeks.length || prev.profile.weeksAvailable || 12,
        log.weekNumber + 1
      );

      return {
        ...prev,
        gapMap: updatedGapMap,
        roadmap: mergedRoadmap,
        progressLogs: [log, ...prev.progressLogs],
        readinessHistory: [...prev.readinessHistory, nextPoint],
        currentWeek: nextWeek,
        streakDays: prev.streakDays + 7,
      };
    });
  };

  const addApplication = (entry: Omit<ApplicationEntry, 'id'>) => {
    setState((prev) => ({
      ...prev,
      applications: [{ ...entry, id: `app-${Date.now()}` }, ...prev.applications],
    }));
  };

  const updateApplication = (entry: ApplicationEntry) => {
    setState((prev) => ({
      ...prev,
      applications: prev.applications.map((a) => (a.id === entry.id ? entry : a)),
    }));
  };

  const deleteApplication = (id: string) => {
    setState((prev) => ({
      ...prev,
      applications: prev.applications.filter((a) => a.id !== id),
    }));
  };

  const setApplicationInsights = (applicationInsights: ApplicationInsights | null) => {
    setState((prev) => ({ ...prev, applicationInsights }));
  };

  const loadDemoPersona = () => {
    setState((prev) => ({
      ...prev,
      profile: { ...RAVI_PROFILE },
      jobDescriptions: RAVI_JOB_DESCRIPTIONS.map((jd) => ({ ...jd })),
      gapMap: {
        ...RAVI_DEMO_GAP_MAP,
        skills: RAVI_DEMO_GAP_MAP.skills.map((s) => ({ ...s })),
        jdMatches: RAVI_DEMO_GAP_MAP.jdMatches.map((m) => ({ ...m })),
      },
      roadmap: {
        ...RAVI_DEMO_ROADMAP,
        weeks: RAVI_DEMO_ROADMAP.weeks.map((w) => ({
          ...w,
          tasks: w.tasks.map((t) => ({ ...t })),
        })),
      },
      projects: RAVI_DEMO_PROJECTS.map((p) => ({ ...p })),
      interviews: RAVI_DEMO_INTERVIEWS.map((i) => ({ ...i })),
      progressLogs: RAVI_DEMO_PROGRESS_LOGS.map((l) => ({ ...l })),
      applications: RAVI_DEMO_APPLICATIONS.map((a) => ({ ...a })),
      readinessHistory: RAVI_DEMO_READINESS_HISTORY.map((h) => ({ ...h })),
      applicationInsights: { ...RAVI_DEMO_APP_INSIGHTS },
      currentWeek: 3,
      streakDays: 14,
      demoMode: true,
    }));
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState((prev) => ({
      ...INITIAL_STATE,
      theme: prev.theme,
      demoMode: prev.demoMode,
    }));
  };

  const setDemoMode = (demoMode: boolean) => {
    setState((prev) => ({ ...prev, demoMode }));
  };

  const toggleTheme = () => {
    setState((prev) => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const setTourDismissed = (tourDismissed: boolean) => {
    setState((prev) => ({ ...prev, tourDismissed }));
  };

  const setCurrentWeek = (currentWeek: number) => {
    setState((prev) => ({ ...prev, currentWeek }));
  };

  const latestWeakInterviewAreas = useMemo(() => {
    const latest = state.interviews.find((s) => s.weakAreas && s.weakAreas.length > 0);
    return latest?.weakAreas ?? [];
  }, [state.interviews]);

  const overallCompletionRate = useMemo(() => {
    if (!state.roadmap) return 0;
    const allTasks = state.roadmap.weeks.flatMap((w) => w.tasks);
    if (allTasks.length === 0) return 0;
    const done = allTasks.filter((t) => t.completed).length;
    return Math.round((done / allTasks.length) * 100);
  }, [state.roadmap]);

  const achievements = useMemo(() => evaluateAchievements(state), [state]);

  // Persist unlock timestamps whenever a new achievement is earned
  useEffect(() => {
    const newlyUnlockedIds = achievements
      .filter((a) => a.unlocked && !state.unlockedAchievements[a.id])
      .map((a) => a.id);

    if (newlyUnlockedIds.length === 0) return;

    const now = new Date().toISOString();
    setState((prev) => {
      const nextUnlocked = { ...(prev.unlockedAchievements ?? {}) };
      newlyUnlockedIds.forEach((id) => {
        if (!nextUnlocked[id]) nextUnlocked[id] = now;
      });
      return {
        ...prev,
        unlockedAchievements: nextUnlocked,
      };
    });
  }, [achievements, state.unlockedAchievements]);

  return (
    <PivotPilotContext.Provider
      value={{
        state,
        updateProfile,
        setJobDescriptions,
        setGapMap,
        setRoadmap,
        toggleRoadmapTask,
        setProjects,
        updateProjectStatus,
        addInterviewSession,
        updateInterviewSession,
        applyWeeklyCheckIn,
        addApplication,
        updateApplication,
        deleteApplication,
        setApplicationInsights,
        loadDemoPersona,
        resetAllData,
        setDemoMode,
        toggleTheme,
        setTourDismissed,
        setCurrentWeek,
        latestWeakInterviewAreas,
        overallCompletionRate,
        achievements,
      }}
    >
      {children}
    </PivotPilotContext.Provider>
  );
};

export function usePivotPilot(): PivotPilotContextValue {
  const ctx = useContext(PivotPilotContext);
  if (!ctx) {
    throw new Error('usePivotPilot must be used within PivotPilotProvider');
  }
  return ctx;
}
