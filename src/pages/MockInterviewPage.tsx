import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Mic,
  MicOff,
  Play,
  Send,
  Sparkles,
  Square,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { InterviewQuestionItem, InterviewSession, InterviewType, PageId } from '../types';
import { usePivotPilot } from '../store/PivotPilotContext';
import { generateInterviewQuestionsApi, scoreInterviewAnswerApi } from '../services/api';
import { EmptyState, ErrorBanner, LoadingSkeleton } from '../components/UI';

const INTERVIEW_TYPES: Array<{ id: InterviewType; label: string; desc: string }> = [
  { id: 'behavioral', label: 'Behavioral', desc: 'STAR stories, influence, pivot narrative' },
  { id: 'role-specific', label: 'Role-Specific', desc: 'Product sense, metrics, diagnostics' },
  { id: 'case/technical', label: 'Case / Technical', desc: 'Architecture, experiments, pricing' },
];

const RUBRIC_LABELS: Array<{ key: keyof NonNullable<InterviewQuestionItem['evaluation']>['scores']; label: string }> = [
  { key: 'structure', label: 'Structure' },
  { key: 'relevance', label: 'Relevance' },
  { key: 'depth', label: 'Depth' },
  { key: 'evidence_and_metrics', label: 'Evidence & Metrics' },
  { key: 'communication', label: 'Communication' },
];

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionResultEvent {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

function computeSessionMetrics(questions: InterviewQuestionItem[]): {
  overallAverage: number;
  weakAreas: string[];
  avgRubric: Record<string, number>;
} {
  const scored = questions.filter((q) => q.evaluation);
  if (scored.length === 0) {
    return { overallAverage: 0, weakAreas: [], avgRubric: {} };
  }
  const totals: Record<string, number> = {
    structure: 0,
    relevance: 0,
    depth: 0,
    evidence_and_metrics: 0,
    communication: 0,
  };
  let overallSum = 0;

  scored.forEach((q) => {
    const ev = q.evaluation!;
    overallSum += ev.overall;
    totals.structure += ev.scores.structure;
    totals.relevance += ev.scores.relevance;
    totals.depth += ev.scores.depth;
    totals.evidence_and_metrics += ev.scores.evidence_and_metrics;
    totals.communication += ev.scores.communication;
  });

  const avgRubric: Record<string, number> = {};
  const weakAreas: string[] = [];
  Object.keys(totals).forEach((k) => {
    const val = Number((totals[k] / scored.length).toFixed(1));
    avgRubric[k] = val;
    if (val < 3.6) weakAreas.push(k);
  });

  return {
    overallAverage: Number((overallSum / scored.length).toFixed(1)),
    weakAreas,
    avgRubric,
  };
}

export const MockInterviewPage: React.FC<{ onNavigate: (page: PageId) => void }> = ({
  onNavigate,
}) => {
  const { state, updateInterviewSession, setDemoMode } = usePivotPilot();

  const [selectedType, setSelectedType] = useState<InterviewType>('role-specific');
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(
    state.interviews[0] ?? null
  );
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answerDraft, setAnswerDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Web Speech API state
  const [isListening, setIsListening] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const currentQuestion = activeSession?.questions[questionIdx] ?? null;

  useEffect(() => {
    setAnswerDraft(currentQuestion?.answer ?? '');
  }, [activeSession?.id, questionIdx]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRec = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRec) {
      setSpeechNotice(
        'Web Speech API is not supported in this browser. Type your answer below instead.'
      );
      return;
    }

    setSpeechNotice(null);
    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalChunk = '';
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += `${transcript} `;
        } else {
          interim += transcript;
        }
      }
      if (finalChunk) {
        setAnswerDraft((prev) => `${prev.trim()} ${finalChunk.trim()}`.trim());
        finalChunk = '';
      }
      if (interim) {
        setSpeechNotice(`Hearing: "${interim}"`);
      }
    };

    recognition.onerror = (ev) => {
      if (ev.error === 'no-speech') {
        setSpeechNotice('No speech detected. You can speak again or continue typing anytime.');
      } else {
        setSpeechNotice(`Microphone status: ${ev.error}. You can continue typing anytime.`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setSpeechNotice(null);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleStartSession = async () => {
    setError(null);
    setGenerating(true);
    try {
      const questions = await generateInterviewQuestionsApi(
        {
          profile: state.profile,
          gapMap: state.gapMap,
          interviewType: selectedType,
        },
        state.demoMode
      );
      const newSession: InterviewSession = {
        id: `int-${Date.now()}`,
        date: new Date().toISOString(),
        type: selectedType,
        questions,
        overallAverage: 0,
        weakAreas: [],
        completed: false,
      };
      setActiveSession(newSession);
      setQuestionIdx(0);
      setAnswerDraft('');
      updateInterviewSession(newSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate interview questions.');
    } finally {
      setGenerating(false);
    }
  };

  const handleScoreAnswer = async () => {
    if (!activeSession || !currentQuestion || !answerDraft.trim()) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    setError(null);
    setScoring(true);
    try {
      const evaluation = await scoreInterviewAnswerApi(
        {
          question: currentQuestion.question,
          answer: answerDraft.trim(),
          interviewType: activeSession.type,
          targetRole: state.profile.targetRole || 'Product Manager',
          targetSkill: currentQuestion.targetSkill,
        },
        state.demoMode
      );

      const updatedQuestions = activeSession.questions.map((q, idx) =>
        idx === questionIdx ? { ...q, answer: answerDraft.trim(), evaluation } : q
      );

      const { overallAverage, weakAreas } = computeSessionMetrics(updatedQuestions);
      const completed = updatedQuestions.every((q) => Boolean(q.evaluation));

      const updatedSession: InterviewSession = {
        ...activeSession,
        questions: updatedQuestions,
        overallAverage,
        weakAreas,
        completed,
      };

      setActiveSession(updatedSession);
      updateInterviewSession(updatedSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to score your answer.');
    } finally {
      setScoring(false);
    }
  };

  const radarData = useMemo(() => {
    if (!activeSession) return [];
    const evalObj = currentQuestion?.evaluation;
    const { avgRubric } = computeSessionMetrics(activeSession.questions);

    return RUBRIC_LABELS.map(({ key, label }) => ({
      axis: label,
      current: evalObj ? evalObj.scores[key] : 0,
      sessionAvg: avgRubric[key] ?? 0,
    }));
  }, [activeSession, currentQuestion]);

  const trendData = useMemo(() => {
    return [...state.interviews]
      .filter((s) => s.overallAverage > 0)
      .reverse()
      .map((s, idx) => ({
        label: `Session ${idx + 1}`,
        score: s.overallAverage,
        type: s.type,
      }));
  }, [state.interviews]);

  const sessionMetrics = useMemo(
    () => (activeSession ? computeSessionMetrics(activeSession.questions) : null),
    [activeSession]
  );

  const wordCount = answerDraft.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl sm:text-[28px] font-semibold text-ink tracking-tight">
            Mock interview
          </h1>
          <p className="text-sm text-ink-muted">
            5 tailored questions with voice or text answers, 5-axis rubric scoring, and session
            trends.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('progress')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface border border-line text-xs font-medium text-ink hover:border-primary hover:text-primary transition-colors self-start sm:self-auto whitespace-nowrap cursor-pointer"
        >
          <span>Feed weak areas to Roadmap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* New Session Launcher */}
      <section className="bg-surface border border-line rounded-[20px] p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {INTERVIEW_TYPES.map((item) => {
              const active = selectedType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedType(item.id)}
                  className={`text-left rounded-[14px] p-3.5 border transition-colors cursor-pointer ${
                    active
                      ? 'bg-blush-tint border-primary'
                      : 'bg-surface-low border-line hover:border-blush-mid'
                  }`}
                >
                  <span
                    className={`text-sm font-semibold block ${
                      active ? 'text-primary' : 'text-ink'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="text-xs text-ink-muted">{item.desc}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={generating}
            onClick={handleStartSession}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary text-on-primary text-sm font-medium hover:opacity-90 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {generating ? <Sparkles className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{generating ? 'Generating 5 Questions...' : 'Start New 5-Q Session'}</span>
          </button>
        </div>

        {/* Past sessions selector */}
        {state.interviews.length > 0 && (
          <div className="pt-3 border-t border-line flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink-muted mr-1">Sessions:</span>
            {state.interviews.map((sess, idx) => (
              <button
                key={sess.id}
                type="button"
                onClick={() => {
                  setActiveSession(sess);
                  setQuestionIdx(0);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer font-mono tabular-nums ${
                  activeSession?.id === sess.id
                    ? 'bg-blush-tint text-primary border border-blush-mid'
                    : 'bg-surface-low border border-line text-ink-muted hover:text-ink'
                }`}
              >
                #{state.interviews.length - idx} · {sess.type} (
                {sess.overallAverage > 0 ? `${sess.overallAverage}/5` : 'New'})
              </button>
            ))}
          </div>
        )}
      </section>

      {error && (
        <ErrorBanner
          message={error}
          demoMode={state.demoMode}
          onRetry={currentQuestion && answerDraft.trim() ? handleScoreAnswer : handleStartSession}
          onEnableDemoMode={() => {
            setDemoMode(true);
            setError(null);
          }}
        />
      )}

      {generating && (
        <LoadingSkeleton
          rows={4}
          title="Crafting 5 questions tailored to your resume, target role, and top skill gaps..."
        />
      )}

      {/* Empty State when no active session */}
      {!generating && (!activeSession || !currentQuestion) && (
        <EmptyState
          icon={<Mic className="w-6 h-6 text-primary" />}
          title="No interview session active"
          description="Select an interview track above (Behavioral, Role-Specific, or Case / Technical) and click 'Start New 5-Q Session' to generate practice questions tailored to your target role."
          actionLabel="Start New 5-Q Session"
          onAction={handleStartSession}
        />
      )}

      {/* Active Interview Workspace */}
      {!generating && activeSession && currentQuestion && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 cols: Question Switcher + Answer + Feedback */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Question Number Stepper */}
            <div className="flex flex-wrap items-center gap-2">
              {activeSession.questions.map((q, idx) => {
                const isSelected = idx === questionIdx;
                const isScored = Boolean(q.evaluation);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setQuestionIdx(idx)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono tabular-nums transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-on-primary font-semibold'
                        : isScored
                        ? 'bg-blush-tint text-primary border border-blush-soft'
                        : 'bg-surface border border-line text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>Q{idx + 1}</span>
                    {isScored && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>

            {/* Question Card */}
            <article className="bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-medium text-primary">
                  {activeSession.type} · Tests {currentQuestion.targetSkill}
                </span>
                <span className="font-mono text-ink-muted tabular-nums">
                  Question {questionIdx + 1} of {activeSession.questions.length}
                </span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-semibold text-ink leading-snug">
                “{currentQuestion.question}”
              </h2>
            </article>

            {/* Answer Box with Mic Button */}
            <article className="bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-4">
              <header className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-ink">Your response</h3>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {isListening
                      ? 'Listening live via Web Speech API — click stop when finished.'
                      : 'Type your structured answer or tap the mic button to speak.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  aria-label={isListening ? 'Stop voice dictation' : 'Start voice dictation'}
                  aria-pressed={isListening}
                  className={`inline-flex items-center justify-center w-11 h-11 rounded-full transition-colors cursor-pointer shrink-0 ${
                    isListening
                      ? 'bg-primary text-on-primary'
                      : 'bg-blush-tint text-primary hover:bg-blush-soft'
                  }`}
                >
                  {isListening ? <Square className="w-4 h-4" /> : <Mic className="w-5 h-5" />}
                </button>
              </header>

              {speechNotice && (
                <p className="text-xs text-primary bg-blush-tint/60 rounded-[10px] px-3 py-2 flex items-center gap-2">
                  <MicOff className="w-3.5 h-3.5 shrink-0" />
                  <span>{speechNotice}</span>
                </p>
              )}

              <textarea
                rows={7}
                value={answerDraft}
                onChange={(e) => setAnswerDraft(e.target.value)}
                placeholder="Structure your answer clearly (e.g., 1. Context & metric definition, 2. Hypotheses / actions, 3. Trade-offs & measurable outcome)..."
                className="w-full rounded-[14px] bg-surface-low border border-line p-4 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary"
              />

              <footer className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs text-ink-muted tabular-nums">
                  {wordCount} words
                </span>

                <div className="flex items-center gap-2">
                  {questionIdx < activeSession.questions.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setQuestionIdx((prev) => prev + 1)}
                      className="px-4 py-2 rounded-full bg-surface-low border border-line text-xs font-medium text-ink hover:bg-surface-mid transition-colors cursor-pointer"
                    >
                      Next Question
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={scoring || !answerDraft.trim()}
                    onClick={handleScoreAnswer}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-medium hover:opacity-90 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{scoring ? 'Scoring Rubric...' : 'Score Response'}</span>
                  </button>
                </div>
              </footer>
            </article>

            {scoring && <LoadingSkeleton rows={3} title="Scoring response against 5-axis rubric..." />}

            {/* Detailed Coaching Feedback */}
            {!scoring && currentQuestion.evaluation && (
              <article className="bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-ink">Strengths</span>
                    <ul className="list-disc pl-4 text-xs text-ink-muted flex flex-col gap-1.5">
                      {currentQuestion.evaluation.strengths.map((s, i) => (
                        <li key={i} className="leading-relaxed">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-primary">Areas to tighten</span>
                    <ul className="list-disc pl-4 text-xs text-ink-muted flex flex-col gap-1.5">
                      {currentQuestion.evaluation.weaknesses.map((w, i) => (
                        <li key={i} className="leading-relaxed">
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-[14px] bg-surface-low border border-line p-4 flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-ink">Improved answer example</span>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    {currentQuestion.evaluation.improvedAnswerExample}
                  </p>
                </div>

                <div className="rounded-[14px] bg-blush-tint/70 border border-blush-soft p-4 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-primary">
                    Likely interviewer follow-up
                  </span>
                  <p className="text-sm text-ink leading-relaxed">
                    “{currentQuestion.evaluation.followUpQuestion}”
                  </p>
                </div>
              </article>
            )}
          </div>

          {/* Right 5 cols: Rubric Radar Chart + Session Summary */}
          <aside className="lg:col-span-5 flex flex-col gap-6">
            <article className="bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-5">
              <header className="flex items-center justify-between gap-4 pb-4 border-b border-line">
                <div>
                  <span className="text-xs text-ink-muted">AI Coach Rubric</span>
                  <h2 className="text-lg font-semibold text-ink">Rubric radar & scores</h2>
                </div>
                <div className="px-3.5 py-2 rounded-[12px] bg-blush-tint text-primary font-mono text-xl font-bold tabular-nums">
                  {currentQuestion.evaluation
                    ? `${currentQuestion.evaluation.overall.toFixed(1)} / 5`
                    : sessionMetrics?.overallAverage
                    ? `${sessionMetrics.overallAverage.toFixed(1)} / 5`
                    : '— / 5'}
                </div>
              </header>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                    <PolarGrid stroke="var(--pp-line-strong)" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fill: 'var(--pp-ink-muted)', fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 5]}
                      tick={{ fill: 'var(--pp-ink-subtle)', fontSize: 10 }}
                    />
                    <Radar
                      name="Current Answer"
                      dataKey="current"
                      stroke="var(--pp-primary)"
                      fill="var(--pp-primary)"
                      fillOpacity={0.28}
                    />
                    <Radar
                      name="Session Avg"
                      dataKey="sessionAvg"
                      stroke="var(--pp-blush-mid)"
                      fill="var(--pp-blush-mid)"
                      fillOpacity={0.14}
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
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Numeric Rubric Bars */}
              <div className="flex flex-col gap-3">
                {RUBRIC_LABELS.map(({ key, label }) => {
                  const val =
                    currentQuestion.evaluation?.scores[key] ??
                    sessionMetrics?.avgRubric[key] ??
                    0;
                  const isWeak = val > 0 && val < 3.6;
                  return (
                    <div key={key} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-ink">{label}</span>
                        <span
                          className={`font-mono tabular-nums ${
                            isWeak ? 'text-danger font-semibold' : 'text-primary'
                          }`}
                        >
                          {val > 0 ? `${val.toFixed(1)} / 5` : 'Not scored'}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-mid overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isWeak ? 'bg-blush-mid' : 'bg-primary'
                          }`}
                          style={{ width: `${(val / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeSession.weakAreas.length > 0 && (
                <div className="rounded-[12px] bg-surface-low border border-line p-3.5 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-primary">
                    Flagged weak areas (fed into Progress & Roadmap)
                  </span>
                  <p className="text-xs text-ink-muted">
                    {activeSession.weakAreas.map((a) => a.replace(/_/g, ' ')).join(', ')}
                  </p>
                </div>
              )}
            </article>

            {/* Session Trend Chart */}
            {trendData.length > 0 && (
              <article className="bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-semibold text-ink">Score trend across sessions</h3>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Tracks your average rubric performance over time
                  </p>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--pp-line)" />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: 'var(--pp-ink-muted)', fontSize: 11 }}
                      />
                      <YAxis
                        domain={[0, 5]}
                        tick={{ fill: 'var(--pp-ink-muted)', fontSize: 11 }}
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
                        stroke="var(--pp-primary)"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: 'var(--pp-primary)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </article>
            )}
          </aside>
        </section>
      )}

      {/* Session Transcript & Summary */}
      {!generating && activeSession && activeSession.questions.some((q) => q.answer) && (
        <section className="bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-ink">Session transcript & summary</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                {activeSession.questions.filter((q) => q.evaluation).length} of{' '}
                {activeSession.questions.length} questions scored · Avg{' '}
                <span className="font-mono text-primary tabular-nums">
                  {activeSession.overallAverage.toFixed(1)}/5
                </span>
              </p>
            </div>
          </div>

          <div className="divide-y divide-line">
            {activeSession.questions
              .filter((q) => q.answer)
              .map((q, idx) => (
                <div key={q.id} className="py-4 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink">
                      Q{idx + 1}. {q.question}
                    </span>
                    {q.evaluation && (
                      <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                        {q.evaluation.overall.toFixed(1)} / 5
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed whitespace-pre-wrap">
                    {q.answer}
                  </p>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
};
