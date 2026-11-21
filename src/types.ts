export type PageId =
  | 'dashboard'
  | 'intake'
  | 'skill-gap'
  | 'roadmap'
  | 'projects'
  | 'mock-interview'
  | 'progress'
  | 'applications';

export interface Profile {
  name: string;
  currentRole: string;
  yearsExperience: number;
  skills: string[];
  education: string[];
  achievements: string[];
  targetRole: string;
  hoursPerWeek: number;
  weeksAvailable: number;
  resumeText: string;
  resumeFileName?: string;
}

export interface JobDescription {
  id: string;
  company: string;
  title: string;
  text: string;
}

export interface SkillGapItem {
  name: string;
  category: string;
  importance: number; // 0-100
  userLevel: number; // 0-100
  gap: number; // 0-100
  evidenceQuotes: string[];
  transferableFrom: string;
}

export interface JdMatchItem {
  jdId: string;
  company: string;
  roleTitle: string;
  matchScore: number; // 0-100
  keyMatches: string[];
  missingSkills: string[];
}

export interface GapMap {
  skills: SkillGapItem[];
  jdMatches: JdMatchItem[];
  readinessScore: number; // 0-100
  readinessExplanation: string;
  generatedAt: string;
}

export interface BulletRewriteOption {
  angle: string;
  rewrittenBullet: string;
  rationale: string;
}

export interface BulletRewriteResponse {
  originalBullet: string;
  rewrites: BulletRewriteOption[];
}

export type RoadmapTaskType = 'course' | 'reading' | 'practice' | 'project' | 'interview';

export interface RoadmapTask {
  id: string;
  title: string;
  type: RoadmapTaskType;
  estHours: number;
  skillsTargeted: string[];
  resourceSuggestion: string;
  completed: boolean;
  projectId?: string;
}

export interface RoadmapWeek {
  weekNumber: number;
  theme: string;
  goals: string[];
  tasks: RoadmapTask[];
  milestone: string;
}

export interface Roadmap {
  weeks: RoadmapWeek[];
  generatedAt: string;
  focusNote?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  problemStatement: string;
  skillsCovered: string[];
  gapsClosed: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  estHours: number;
  deliverables: string[];
  whyRecruitersCare: string;
  status: 'suggested' | 'in_progress' | 'completed';
}

export type InterviewType = 'behavioral' | 'role-specific' | 'case/technical';

export interface RubricScores {
  structure: number; // 0-5
  relevance: number; // 0-5
  depth: number; // 0-5
  evidence_and_metrics: number; // 0-5
  communication: number; // 0-5
}

export interface AnswerEvaluation {
  scores: RubricScores;
  overall: number; // 0-5
  strengths: string[];
  weaknesses: string[];
  improvedAnswerExample: string;
  followUpQuestion: string;
}

export interface InterviewQuestionItem {
  id: string;
  question: string;
  targetSkill: string;
  answer: string;
  evaluation?: AnswerEvaluation;
}

export interface InterviewSession {
  id: string;
  date: string;
  type: InterviewType;
  questions: InterviewQuestionItem[];
  overallAverage: number;
  weakAreas: string[];
  completed: boolean;
}

export interface PlanChange {
  type: 'added' | 'removed' | 'reordered' | 'extended';
  description: string;
  reason: string;
}

export interface ProgressLog {
  id: string;
  date: string;
  weekNumber: number;
  tasksCompletedCount: number;
  totalTasksCount: number;
  hoursSpent: number;
  skillConfidence: Record<string, number>;
  blockers: string;
  planChanges: PlanChange[];
  newReadinessScore: number;
}

export type CompanySize = 'startup' | 'mid' | 'large';
export type ApplicationSource = 'LinkedIn' | 'referral' | 'cold email' | 'careers page';
export type ApplicationStatus =
  | 'applied'
  | 'no response'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected';

export interface ApplicationEntry {
  id: string;
  company: string;
  roleTitle: string;
  roleType: string;
  seniority: string;
  companySize: CompanySize;
  source: ApplicationSource;
  dateApplied: string;
  matchScore: number;
  status: ApplicationStatus;
}

export interface ReadinessHistoryPoint {
  date: string;
  label: string;
  score: number;
  completionRate: number;
}

export interface ApplicationInsights {
  insights: string[];
  recommendedFocus: string;
  suggestedChanges: string[];
  generatedAt: string;
}

export interface SegmentStat {
  segment: string;
  total: number;
  responses: number;
  positiveResponses: number;
  responseRate: number; // 0-100
  meetsMinSample: boolean;
}

export interface SegmentGroupStats {
  dimension: 'source' | 'companySize' | 'roleType' | 'seniority' | 'matchBand';
  label: string;
  items: SegmentStat[];
  bestSegment: SegmentStat | null;
  worstSegment: SegmentStat | null;
}

export interface PivotPilotState {
  profile: Profile;
  jobDescriptions: JobDescription[];
  gapMap: GapMap | null;
  roadmap: Roadmap | null;
  projects: PortfolioProject[];
  interviews: InterviewSession[];
  progressLogs: ProgressLog[];
  applications: ApplicationEntry[];
  readinessHistory: ReadinessHistoryPoint[];
  applicationInsights: ApplicationInsights | null;
  demoMode: boolean;
  theme: 'light' | 'dark';
  tourDismissed: boolean;
  currentWeek: number;
  streakDays: number;
  unlockedAchievements: Record<string, string>;
}
