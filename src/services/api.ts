import type {
  AnswerEvaluation,
  ApplicationInsights,
  BulletRewriteResponse,
  GapMap,
  InterviewQuestionItem,
  InterviewSession,
  InterviewType,
  JobDescription,
  PlanChange,
  PortfolioProject,
  Profile,
  Roadmap,
  SegmentGroupStats,
} from '../types';
import {
  getDemoAnswerEvaluation,
  getDemoBulletRewrites,
  getDemoInterviewQuestions,
  getDemoWeeklyCheckInUpdate,
  RAVI_DEMO_APP_INSIGHTS,
  RAVI_DEMO_GAP_MAP,
  RAVI_DEMO_PROJECTS,
  RAVI_DEMO_ROADMAP,
  RAVI_PROFILE,
} from '../data/demoPersona';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function postJson<T>(url: string, body: unknown, timeoutMs = 45000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        payload.error || `Request failed (${res.status}). Please retry or switch on Demo Mode.`
      );
    }
    return payload as T;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out after 45 seconds. Check your connection or enable Demo Mode.');
    }
    if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
      throw new Error(
        'Network error: Unable to connect to PivotPilot backend. Verify server is running or switch on Demo Mode.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export interface ParsedResumeResult {
  name: string;
  currentRole: string;
  yearsExperience: number;
  skills: string[];
  education: string[];
  achievements: string[];
  extractedText: string;
}

export async function parseResumeApi(
  input: { resumeText?: string; pdfBase64?: string; mimeType?: string },
  demoMode: boolean
): Promise<ParsedResumeResult> {
  if (demoMode) {
    await sleep(450);
    return {
      name: RAVI_PROFILE.name,
      currentRole: RAVI_PROFILE.currentRole,
      yearsExperience: RAVI_PROFILE.yearsExperience,
      skills: RAVI_PROFILE.skills,
      education: RAVI_PROFILE.education,
      achievements: RAVI_PROFILE.achievements,
      extractedText: input.resumeText || RAVI_PROFILE.resumeText,
    };
  }
  return postJson<ParsedResumeResult>('/api/gemini/parse-resume', input);
}

export async function analyzeSkillGapApi(
  profile: Profile,
  jobDescriptions: JobDescription[],
  demoMode: boolean
): Promise<GapMap> {
  if (demoMode) {
    await sleep(600);
    return {
      ...RAVI_DEMO_GAP_MAP,
      generatedAt: new Date().toISOString(),
    };
  }
  const result = await postJson<Omit<GapMap, 'generatedAt'>>('/api/gemini/skill-gap', {
    profile,
    jobDescriptions,
  });
  return {
    ...result,
    generatedAt: new Date().toISOString(),
  };
}

export async function rewriteBulletApi(
  bullet: string,
  targetRole: string,
  topGapSkills: string[],
  demoMode: boolean
): Promise<BulletRewriteResponse> {
  if (demoMode) {
    await sleep(450);
    return getDemoBulletRewrites(bullet, targetRole);
  }
  return postJson<BulletRewriteResponse>('/api/gemini/rewrite-bullet', {
    bullet,
    targetRole,
    topGapSkills,
  });
}

export async function generateRoadmapApi(
  params: {
    profile: Profile;
    gapMap: GapMap;
    weakInterviewAreas?: string[];
    applicationInsights?: ApplicationInsights | null;
  },
  demoMode: boolean
): Promise<Roadmap> {
  if (demoMode) {
    await sleep(650);
    const desiredWeeks = Math.max(4, Math.min(12, params.profile.weeksAvailable || 12));
    const budget = Math.max(2, params.profile.hoursPerWeek || 8);
    const weeks = RAVI_DEMO_ROADMAP.weeks.slice(0, desiredWeeks).map((w) => {
      const tasks = w.tasks.map((t) => ({ ...t }));
      const totalH = tasks.reduce((sum, t) => sum + t.estHours, 0);
      if (totalH > budget && tasks.length > 0) {
        const scale = budget / totalH;
        tasks.forEach((t) => {
          t.estHours = Number(Math.max(0.5, t.estHours * scale).toFixed(1));
        });
        const newSum = tasks.reduce((sum, t) => sum + t.estHours, 0);
        if (newSum > budget) {
          tasks[0].estHours = Number(Math.max(0.5, tasks[0].estHours - (newSum - budget)).toFixed(1));
        }
      }
      return { ...w, tasks };
    });

    return {
      ...RAVI_DEMO_ROADMAP,
      weeks,
      focusNote: params.applicationInsights?.recommendedFocus
        ? `Updated with Application Insights: ${params.applicationInsights.recommendedFocus}`
        : RAVI_DEMO_ROADMAP.focusNote,
      generatedAt: new Date().toISOString(),
    };
  }
  return postJson<Roadmap>('/api/gemini/roadmap', params);
}

export async function generateProjectsApi(
  params: {
    profile: Profile;
    gapMap: GapMap;
    applicationInsights?: ApplicationInsights | null;
  },
  demoMode: boolean
): Promise<PortfolioProject[]> {
  if (demoMode) {
    await sleep(550);
    return RAVI_DEMO_PROJECTS.map((p) => ({ ...p }));
  }
  const res = await postJson<{ projects: PortfolioProject[] }>('/api/gemini/projects', params);
  return res.projects;
}

export async function generateInterviewQuestionsApi(
  params: {
    profile: Profile;
    gapMap: GapMap | null;
    interviewType: InterviewType;
  },
  demoMode: boolean
): Promise<InterviewQuestionItem[]> {
  if (demoMode) {
    await sleep(500);
    return getDemoInterviewQuestions(params.interviewType);
  }
  const res = await postJson<{ questions: Array<{ id: string; question: string; targetSkill: string }> }>(
    '/api/gemini/interview-questions',
    params
  );
  return res.questions.map((q, idx) => ({
    id: q.id || `q-${idx + 1}`,
    question: q.question,
    targetSkill: q.targetSkill,
    answer: '',
  }));
}

export async function scoreInterviewAnswerApi(
  params: {
    question: string;
    answer: string;
    interviewType: InterviewType;
    targetRole: string;
    targetSkill: string;
  },
  demoMode: boolean
): Promise<AnswerEvaluation> {
  if (demoMode) {
    await sleep(550);
    return getDemoAnswerEvaluation(params.answer);
  }
  return postJson<AnswerEvaluation>('/api/gemini/score-answer', params);
}

export async function submitWeeklyCheckInApi(
  params: {
    profile: Profile;
    gapMap: GapMap;
    roadmap: Roadmap;
    checkIn: {
      weekNumber: number;
      tasksCompletedCount: number;
      totalTasksCount: number;
      hoursSpent: number;
      skillConfidence: Record<string, number>;
      blockers: string;
    };
    latestInterview: InterviewSession | null;
  },
  demoMode: boolean
): Promise<{
  updatedSkillLevels: { skillName: string; newUserLevel: number }[];
  newReadinessScore: number;
  planChanges: PlanChange[];
  updatedRoadmap: Roadmap;
}> {
  if (demoMode) {
    await sleep(650);
    return getDemoWeeklyCheckInUpdate(
      params.gapMap,
      params.roadmap,
      params.checkIn.weekNumber,
      params.checkIn.skillConfidence,
      params.checkIn.hoursSpent,
      params.checkIn.blockers
    );
  }
  const res = await postJson<{
    updatedSkillLevels: { skillName: string; newUserLevel: number }[];
    newReadinessScore: number;
    planChanges: PlanChange[];
    updatedRoadmap: { weeks: Roadmap['weeks'] };
  }>('/api/gemini/weekly-checkin', params);

  return {
    ...res,
    updatedRoadmap: {
      weeks: res.updatedRoadmap.weeks,
      generatedAt: new Date().toISOString(),
      focusNote: params.roadmap.focusNote,
    },
  };
}

export async function generateApplicationInsightsApi(
  params: {
    profile: Profile;
    segmentStats: SegmentGroupStats[];
    totalApplications: number;
    overallResponseRate: number;
  },
  demoMode: boolean
): Promise<ApplicationInsights> {
  if (demoMode) {
    await sleep(500);
    return {
      ...RAVI_DEMO_APP_INSIGHTS,
      generatedAt: new Date().toISOString(),
    };
  }
  const res = await postJson<Omit<ApplicationInsights, 'generatedAt'>>(
    '/api/gemini/application-insights',
    params
  );
  return {
    ...res,
    generatedAt: new Date().toISOString(),
  };
}
