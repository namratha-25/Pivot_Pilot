import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
} from 'lucide-react';
import type { JobDescription, PageId } from '../types';
import { usePivotPilot } from '../store/PivotPilotContext';
import { parseResumeApi } from '../services/api';
import { ErrorBanner, LoadingSkeleton } from '../components/UI';

const POPULAR_ROLES = [
  'Product Manager',
  'Technical Product Manager',
  'Product Analyst',
  'UX Researcher',
  'AI Solutions Architect',
];

export const IntakePage: React.FC<{ onNavigate: (page: PageId) => void }> = ({ onNavigate }) => {
  const { state, updateProfile, setJobDescriptions, loadDemoPersona, setDemoMode } =
    usePivotPilot();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParseInput, setLastParseInput] = useState<{
    resumeText?: string;
    pdfBase64?: string;
    mimeType?: string;
    fileName?: string;
  } | null>(null);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [skillsDraft, setSkillsDraft] = useState('');

  const runParse = async (payload: {
    resumeText?: string;
    pdfBase64?: string;
    mimeType?: string;
    fileName?: string;
  }) => {
    setError(null);
    setParseSuccess(false);
    setLastParseInput(payload);
    setParsing(true);
    try {
      const parsed = await parseResumeApi(
        {
          resumeText: payload.resumeText,
          pdfBase64: payload.pdfBase64,
          mimeType: payload.mimeType,
        },
        state.demoMode
      );
      updateProfile({
        name: parsed.name || state.profile.name,
        currentRole: parsed.currentRole || state.profile.currentRole,
        yearsExperience: Number(parsed.yearsExperience) || 0,
        skills: parsed.skills || [],
        education: parsed.education || [],
        achievements: parsed.achievements || [],
        resumeText: parsed.extractedText || payload.resumeText || state.profile.resumeText,
        resumeFileName: payload.fileName || state.profile.resumeFileName,
      });
      setParseSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract resume.');
    } finally {
      setParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds 10MB limit. Please upload a smaller PDF or text file.');
      e.target.value = '';
      return;
    }

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        runParse({ pdfBase64: base64, mimeType: 'application/pdf', fileName: file.name });
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || '');
        updateProfile({ resumeText: text, resumeFileName: file.name });
        runParse({ resumeText: text, fileName: file.name });
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const handleJdChange = (id: string, field: keyof JobDescription, value: string) => {
    setJobDescriptions(
      state.jobDescriptions.map((jd) => (jd.id === id ? { ...jd, [field]: value } : jd))
    );
  };

  const handleAddJd = () => {
    if (state.jobDescriptions.length >= 10) return;
    setJobDescriptions([
      ...state.jobDescriptions,
      { id: `jd-${Date.now()}`, company: '', title: '', text: '' },
    ]);
  };

  const handleRemoveJd = (id: string) => {
    if (state.jobDescriptions.length <= 1) return;
    setJobDescriptions(state.jobDescriptions.filter((jd) => jd.id !== id));
  };

  const handleAddSkill = () => {
    const trimmed = skillsDraft.trim();
    if (!trimmed) return;
    if (!state.profile.skills.includes(trimmed)) {
      updateProfile({ skills: [...state.profile.skills, trimmed] });
    }
    setSkillsDraft('');
  };

  const filledJdCount = state.jobDescriptions.filter((j) => j.text.trim().length > 20).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl sm:text-[28px] font-semibold text-ink tracking-tight">
            Career pivot intake
          </h1>
          <p className="text-sm text-ink-muted">
            Upload your resume, define your target role and weekly bandwidth, and paste 3–10 real
            job descriptions.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDemoPersona}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-blush-soft text-primary-deep text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          <span>Load demo persona (Ravi)</span>
        </button>
      </header>

      {error && (
        <ErrorBanner
          message={error}
          demoMode={state.demoMode}
          onRetry={lastParseInput ? () => runParse(lastParseInput) : undefined}
          onEnableDemoMode={() => {
            setDemoMode(true);
            setError(null);
          }}
        />
      )}

      {/* 1. Resume Upload & Extraction */}
      <section className="bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">1. Resume upload & extraction</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Upload a PDF or .txt file, or paste your resume text. Gemini extracts structured JSON.
            </p>
          </div>
          {parseSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile extracted</span>
            </span>
          )}
        </header>

        <div className="rounded-[14px] border border-dashed border-line-strong bg-surface-low p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-[12px] bg-blush-soft text-primary flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-semibold text-ink truncate">
                {state.profile.resumeFileName || 'Drop or select a PDF / TXT resume'}
              </span>
              <span className="text-xs text-ink-muted font-mono tabular-nums">
                {state.profile.skills.length > 0
                  ? `${state.profile.skills.length} skills · ${state.profile.achievements.length} achievements parsed`
                  : 'Supports PDF (multimodal Gemini parsing) and plain text'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,application/pdf,text/plain"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={parsing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-line text-ink text-xs font-medium hover:bg-surface-mid transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload PDF / TXT</span>
            </button>
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink">Or paste resume text directly</span>
          <textarea
            rows={6}
            value={state.profile.resumeText}
            onChange={(e) => updateProfile({ resumeText: e.target.value })}
            placeholder="Paste your resume text here and click Extract Profile with Gemini..."
            className="w-full rounded-[12px] bg-surface-low border border-line px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-ink-muted">
            Extracts name, role, years of experience, skills, education, and achievements.
          </span>
          <button
            type="button"
            disabled={parsing || !state.profile.resumeText.trim()}
            onClick={() => runParse({ resumeText: state.profile.resumeText })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{parsing ? 'Extracting with Gemini...' : 'Extract Profile with Gemini'}</span>
          </button>
        </div>

        {parsing && <LoadingSkeleton rows={3} title="Extracting structured profile JSON..." />}

        {/* Extracted Editable Profile Fields */}
        <div className="pt-4 border-t border-line grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink">Full name</span>
            <input
              type="text"
              value={state.profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              placeholder="e.g., Ravi Nair"
              className="rounded-[12px] bg-surface-low border border-line px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink">Current role</span>
            <input
              type="text"
              value={state.profile.currentRole}
              onChange={(e) => updateProfile({ currentRole: e.target.value })}
              placeholder="e.g., Mechanical Engineer"
              className="rounded-[12px] bg-surface-low border border-line px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink">Years of experience</span>
            <input
              type="number"
              min={0}
              max={40}
              value={state.profile.yearsExperience}
              onChange={(e) => updateProfile({ yearsExperience: Number(e.target.value) || 0 })}
              className="rounded-[12px] bg-surface-low border border-line px-3.5 py-2.5 text-sm font-mono tabular-nums text-ink focus:outline-none focus:border-primary"
            />
          </label>
        </div>

        {/* Extracted Skills & Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-ink">
              Extracted skills ({state.profile.skills.length})
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillsDraft}
                onChange={(e) => setSkillsDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add a skill and press Enter"
                className="flex-1 rounded-[12px] bg-surface-low border border-line px-3 py-2 text-xs text-ink focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 rounded-[12px] bg-surface-mid text-xs font-medium text-ink hover:bg-blush-tint hover:text-primary transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {state.profile.skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() =>
                    updateProfile({
                      skills: state.profile.skills.filter((s) => s !== skill),
                    })
                  }
                  title="Click to remove skill"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-surface-low border border-line text-xs text-ink hover:border-danger hover:text-danger transition-colors cursor-pointer"
                >
                  <span>{skill}</span>
                  <span aria-hidden="true">×</span>
                </button>
              ))}
              {state.profile.skills.length === 0 && (
                <span className="text-xs text-ink-muted">No skills extracted yet.</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-ink">
              Education & key achievements ({state.profile.achievements.length})
            </span>
            {state.profile.education.length > 0 && (
              <p className="text-xs text-ink-muted">{state.profile.education.join(' · ')}</p>
            )}
            <ul className="flex flex-col gap-1.5 text-xs text-ink-muted list-disc pl-4 max-h-40 overflow-y-auto">
              {state.profile.achievements.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {item}
                </li>
              ))}
              {state.profile.achievements.length === 0 && (
                <li className="list-none -ml-4">Extract your resume to populate achievement bullets.</li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Target Role & Bandwidth */}
      <section className="bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-semibold text-ink">2. Target role & weekly schedule</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Your weekly hours and timeline cap every week of your generated roadmap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <label className="md:col-span-6 flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink">Target role</span>
            <input
              type="text"
              value={state.profile.targetRole}
              onChange={(e) => updateProfile({ targetRole: e.target.value })}
              placeholder="e.g., Product Manager"
              className="rounded-[12px] bg-surface-low border border-line px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-primary"
            />
          </label>

          <label className="md:col-span-3 flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink">Weekly hours</span>
            <input
              type="number"
              min={2}
              max={40}
              value={state.profile.hoursPerWeek}
              onChange={(e) =>
                updateProfile({ hoursPerWeek: Math.max(2, Number(e.target.value) || 8) })
              }
              className="rounded-[12px] bg-surface-low border border-line px-3.5 py-2.5 text-sm font-mono tabular-nums text-ink focus:outline-none focus:border-primary"
            />
          </label>

          <label className="md:col-span-3 flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink">Weeks available</span>
            <input
              type="number"
              min={4}
              max={24}
              value={state.profile.weeksAvailable}
              onChange={(e) =>
                updateProfile({ weeksAvailable: Math.max(4, Number(e.target.value) || 12) })
              }
              className="rounded-[12px] bg-surface-low border border-line px-3.5 py-2.5 text-sm font-mono tabular-nums text-ink focus:outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-muted mr-1">Popular targets:</span>
          {POPULAR_ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => updateProfile({ targetRole: role })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                state.profile.targetRole === role
                  ? 'bg-blush-tint text-primary border border-blush-mid'
                  : 'bg-surface-mid text-ink-muted hover:text-ink'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Job Descriptions (3-10) */}
      <section className="bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">3. Target job descriptions (3–10)</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Paste real job descriptions so Gemini weights skill importance by real market demand.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-ink-muted tabular-nums">
              {filledJdCount} of {state.jobDescriptions.length} filled
            </span>
            <button
              type="button"
              onClick={handleAddJd}
              disabled={state.jobDescriptions.length >= 10}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-blush-soft text-primary-deep text-xs font-semibold hover:opacity-90 disabled:opacity-40 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add JD</span>
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          {state.jobDescriptions.map((jd, idx) => (
            <div
              key={jd.id}
              className="rounded-[16px] bg-surface-low border border-line p-4 flex flex-col gap-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-primary">
                  Job Description #{idx + 1}
                </span>
                {state.jobDescriptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveJd(jd.id)}
                    aria-label={`Remove Job Description ${idx + 1}`}
                    className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-danger transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={jd.company}
                  onChange={(e) => handleJdChange(jd.id, 'company', e.target.value)}
                  placeholder="Company name (e.g., Samsara)"
                  className="rounded-[10px] bg-surface border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={jd.title}
                  onChange={(e) => handleJdChange(jd.id, 'title', e.target.value)}
                  placeholder="Role title (e.g., Product Manager, Connected Ops)"
                  className="rounded-[10px] bg-surface border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary"
                />
              </div>

              <textarea
                rows={4}
                value={jd.text}
                onChange={(e) => handleJdChange(jd.id, 'text', e.target.value)}
                placeholder="Paste responsibilities and qualifications from the real job posting..."
                className="w-full rounded-[10px] bg-surface border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>

        <footer className="pt-3 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs text-ink-muted">
            {filledJdCount < 3
              ? 'Tip: Add at least 3 real job descriptions for reliable importance weighting.'
              : `${filledJdCount} job descriptions ready for Skill-Gap benchmarking.`}
          </span>
          <button
            type="button"
            onClick={() => onNavigate('skill-gap')}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-primary text-on-primary text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
          >
            <span>Proceed to Skill Gap Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </footer>
      </section>
    </div>
  );
};
