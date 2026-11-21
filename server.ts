import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Add your key in Settings > Secrets, or enable Demo Mode in the sidebar.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function callGeminiJSON<T>(
  contents: unknown,
  responseSchema: Record<string, unknown>,
  systemInstruction: string,
  timeoutMs = 45000
): Promise<T> {
  const ai = getAIClient();

  const generatePromise = ai.models.generateContent({
    model: MODEL_NAME,
    contents: contents as Parameters<typeof ai.models.generateContent>[0]['contents'],
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: responseSchema as NonNullable<
        Parameters<typeof ai.models.generateContent>[0]['config']
      >['responseSchema'],
    },
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error('Gemini API call timed out after 45 seconds. Please try again.')),
      timeoutMs
    )
  );

  const response = await Promise.race([generatePromise, timeoutPromise]);

  const text = (response.text ?? '').trim();
  if (!text) {
    throw new Error('Gemini returned an empty response. Please try again.');
  }

  let cleaned = text;
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(`Failed to parse structured JSON from Gemini response: ${cleaned.slice(0, 160)}...`);
  }
}

function handleApiError(res: Response, err: unknown) {
  const message = err instanceof Error ? err.message : 'Unexpected server error while calling Gemini API.';
  console.error('[PivotPilot API Error]:', message);

  let status = 500;
  if (message.includes('GEMINI_API_KEY')) {
    status = 503;
  } else if (
    message.includes('429') ||
    message.includes('quota') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.includes('Rate limit')
  ) {
    status = 429;
  } else if (message.includes('timed out')) {
    status = 504;
  } else if (
    message.includes('Provide either') ||
    message.includes('required') ||
    message.includes('must be')
  ) {
    status = 400;
  }

  res.status(status).json({ error: message });
}

const app = express();
app.use(express.json({ limit: '15mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, model: MODEL_NAME });
});

// 1. Parse Resume (PDF base64 or plain text)
app.post('/api/gemini/parse-resume', async (req: Request, res: Response) => {
  try {
    const { resumeText, pdfBase64, mimeType } = req.body as {
      resumeText?: string;
      pdfBase64?: string;
      mimeType?: string;
    };

    if (!resumeText && !pdfBase64) {
      res.status(400).json({ error: 'Provide either resumeText or pdfBase64.' });
      return;
    }

    const schema = {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Candidate full name' },
        currentRole: { type: Type.STRING, description: 'Most recent job title' },
        yearsExperience: { type: Type.NUMBER, description: 'Total years of professional experience' },
        skills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'List of technical, analytical, and domain skills extracted from the resume',
        },
        education: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Degrees, institutions, and graduation years',
        },
        achievements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Key bullet-point accomplishments from experience sections',
        },
        extractedText: {
          type: Type.STRING,
          description: 'Clean plain-text transcription of the resume content',
        },
      },
      required: ['name', 'currentRole', 'yearsExperience', 'skills', 'education', 'achievements', 'extractedText'],
    };

    const promptText =
      'Extract structured career profile details from this resume. Preserve quantifiable achievements verbatim as clear bullet strings.';

    let cleanPdfBase64 = pdfBase64;
    if (cleanPdfBase64 && cleanPdfBase64.includes(',')) {
      cleanPdfBase64 = cleanPdfBase64.split(',')[1];
    }

    const contents = cleanPdfBase64
      ? {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'application/pdf',
                data: cleanPdfBase64,
              },
            },
            { text: promptText },
          ],
        }
      : `${promptText}\n\nRESUME TEXT:\n${resumeText}`;

    const data = await callGeminiJSON<Record<string, unknown>>(
      contents,
      schema,
      'You are an expert executive recruiter and ATS resume parser. Return accurate structured JSON only.'
    );

    const normalized = {
      name: String(data.name || '').trim(),
      currentRole: String(data.currentRole || '').trim(),
      yearsExperience: Number(data.yearsExperience) || 0,
      skills: Array.isArray(data.skills) ? data.skills.map(String) : [],
      education: Array.isArray(data.education) ? data.education.map(String) : [],
      achievements: Array.isArray(data.achievements) ? data.achievements.map(String) : [],
      extractedText: String(data.extractedText || resumeText || '').trim(),
    };

    res.json(normalized);
  } catch (err) {
    handleApiError(res, err);
  }
});

// 2. Skill Gap Analysis
app.post('/api/gemini/skill-gap', async (req: Request, res: Response) => {
  try {
    const { profile, jobDescriptions } = req.body;
    if (!profile || !Array.isArray(jobDescriptions) || jobDescriptions.length === 0) {
      res.status(400).json({ error: 'Profile and at least one job description are required.' });
      return;
    }

    const schema = {
      type: Type.OBJECT,
      properties: {
        skills: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING, description: 'Skill cluster, e.g., Product Strategy, Analytics, Technical, Execution, Leadership' },
              importance: { type: Type.NUMBER, description: '0-100 based on how many JDs require it and how critical it is' },
              userLevel: { type: Type.NUMBER, description: '0-100 estimated current proficiency from resume evidence' },
              gap: { type: Type.NUMBER, description: '0-100 computed gap magnitude (higher = bigger priority gap)' },
              evidenceQuotes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2-3 short verbatim or near-verbatim phrases copied from the provided JDs',
              },
              transferableFrom: {
                type: Type.STRING,
                description: 'Specific resume item or experience that partially covers or transfers to this skill',
              },
            },
            required: ['name', 'category', 'importance', 'userLevel', 'gap', 'evidenceQuotes', 'transferableFrom'],
          },
        },
        jdMatches: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              jdId: { type: Type.STRING },
              company: { type: Type.STRING },
              roleTitle: { type: Type.STRING },
              matchScore: { type: Type.NUMBER, description: '0-100 resume-vs-JD match score' },
              keyMatches: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['jdId', 'company', 'roleTitle', 'matchScore', 'keyMatches', 'missingSkills'],
          },
        },
        readinessScore: { type: Type.NUMBER, description: 'Overall pivot readiness score 0-100' },
        readinessExplanation: {
          type: Type.STRING,
          description: 'Crisp one-line explanation of the pivot readiness score',
        },
      },
      required: ['skills', 'jdMatches', 'readinessScore', 'readinessExplanation'],
    };

    const prompt = `Analyze the candidate's resume and profile against ALL provided job descriptions for their target role "${profile.targetRole}".
Produce 10-12 distinct skills across 4 categories, ranked by gap descending.
Compute importance (0-100) directly from how frequently and prominently each skill appears across the JDs.
Quote short exact phrases from the JDs in evidenceQuotes.
Identify a specific resume item in transferableFrom (or "None directly — build via portfolio project").
Compute a resume-vs-JD matchScore for EVERY JD preserving its exact jdId.

CANDIDATE PROFILE:
${JSON.stringify(profile, null, 2)}

JOB DESCRIPTIONS:
${JSON.stringify(jobDescriptions, null, 2)}`;

    const data = await callGeminiJSON<{
      skills?: Array<Record<string, unknown>>;
      jdMatches?: Array<Record<string, unknown>>;
      readinessScore?: number;
      readinessExplanation?: string;
    }>(
      prompt,
      schema,
      'You are a pragmatic career pivot strategist. Be honest, evidence-driven, and strictly grounded in the resume and JD text.'
    );

    const normalized = {
      skills: Array.isArray(data.skills)
        ? data.skills.map((s) => ({
            name: String(s.name || 'Core Competency'),
            category: String(s.category || 'Product Strategy'),
            importance: Math.max(0, Math.min(100, Math.round(Number(s.importance) || 50))),
            userLevel: Math.max(0, Math.min(100, Math.round(Number(s.userLevel) || 0))),
            gap: Math.max(0, Math.min(100, Math.round(Number(s.gap) || 0))),
            evidenceQuotes: Array.isArray(s.evidenceQuotes) ? s.evidenceQuotes.map(String) : [],
            transferableFrom: String(s.transferableFrom || 'None directly — build via portfolio project'),
          }))
        : [],
      jdMatches: Array.isArray(data.jdMatches)
        ? data.jdMatches.map((m) => ({
            jdId: String(m.jdId || ''),
            company: String(m.company || ''),
            roleTitle: String(m.roleTitle || ''),
            matchScore: Math.max(0, Math.min(100, Math.round(Number(m.matchScore) || 50))),
            keyMatches: Array.isArray(m.keyMatches) ? m.keyMatches.map(String) : [],
            missingSkills: Array.isArray(m.missingSkills) ? m.missingSkills.map(String) : [],
          }))
        : [],
      readinessScore: Math.max(0, Math.min(100, Math.round(Number(data.readinessScore) || 50))),
      readinessExplanation: String(data.readinessExplanation || ''),
    };

    res.json(normalized);
  } catch (err) {
    handleApiError(res, err);
  }
});

// 3. ATS Bullet Rewriter
app.post('/api/gemini/rewrite-bullet', async (req: Request, res: Response) => {
  try {
    const { bullet, targetRole, topGapSkills } = req.body as {
      bullet: string;
      targetRole: string;
      topGapSkills?: string[];
    };
    if (!bullet || !targetRole) {
      res.status(400).json({ error: 'Bullet text and targetRole are required.' });
      return;
    }

    const schema = {
      type: Type.OBJECT,
      properties: {
        originalBullet: { type: Type.STRING },
        rewrites: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              angle: { type: Type.STRING, description: 'Short framing label, e.g., Outcome & Metrics, Cross-Functional Leadership, ATS Keyword Optimized' },
              rewrittenBullet: { type: Type.STRING, description: 'Polished single-line resume bullet tailored to the target role without fabricating facts' },
              rationale: { type: Type.STRING, description: '1 sentence explaining why this works better for recruiters in the target role' },
            },
            required: ['angle', 'rewrittenBullet', 'rationale'],
          },
        },
      },
      required: ['originalBullet', 'rewrites'],
    };

    const prompt = `Rewrite the following resume bullet into exactly 3 distinct, ATS-friendly variations tailored to a "${targetRole}" role.
Preserve factual truthfulness — translate jargon into ${targetRole} impact language rather than inventing metrics.
Target keywords to weave in naturally where truthful: ${(topGapSkills ?? []).join(', ')}.

ORIGINAL BULLET:
"${bullet}"`;

    const data = await callGeminiJSON(
      prompt,
      schema,
      'You are an expert ATS resume coach helping career pivoters translate transferable impact.'
    );
    res.json(data);
  } catch (err) {
    handleApiError(res, err);
  }
});

// 4. Roadmap Generator
app.post('/api/gemini/roadmap', async (req: Request, res: Response) => {
  try {
    const { profile, gapMap, weakInterviewAreas, applicationInsights } = req.body;
    if (!profile || !gapMap) {
      res.status(400).json({ error: 'Profile and gapMap are required to build a roadmap.' });
      return;
    }

    const schema = {
      type: Type.OBJECT,
      properties: {
        weeks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              weekNumber: { type: Type.INTEGER },
              theme: { type: Type.STRING },
              goals: { type: Type.ARRAY, items: { type: Type.STRING } },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    type: {
                      type: Type.STRING,
                      enum: ['course', 'reading', 'practice', 'project', 'interview'],
                    },
                    estHours: { type: Type.NUMBER },
                    skillsTargeted: { type: Type.ARRAY, items: { type: Type.STRING } },
                    resourceSuggestion: { type: Type.STRING },
                  },
                  required: ['id', 'title', 'type', 'estHours', 'skillsTargeted', 'resourceSuggestion'],
                },
              },
              milestone: { type: Type.STRING },
            },
            required: ['weekNumber', 'theme', 'goals', 'tasks', 'milestone'],
          },
        },
        focusNote: { type: Type.STRING },
      },
      required: ['weeks', 'focusNote'],
    };

    const weeksCount = Math.min(Math.max(Number(profile.weeksAvailable) || 12, 4), 16);
    const maxHours = Math.max(Number(profile.hoursPerWeek) || 8, 2);

    const prompt = `Build a ${weeksCount}-week personalized career pivot learning roadmap from "${profile.currentRole}" to "${profile.targetRole}".
STRICT CONSTRAINT: The sum of estHours for all tasks in EVERY week MUST be <= ${maxHours} hours (target 85-100% of ${maxHours} hours).
Prioritize the highest-gap, highest-importance skills in the earliest weeks.
Mix task types across course, reading, practice, project, and interview.
Provide concrete, actionable resourceSuggestion names (books, frameworks, practice drills, datasets).
${weakInterviewAreas?.length ? `Extra priority from Mock Interviews — reinforce these weak rubric areas: ${weakInterviewAreas.join(', ')}.` : ''}
${applicationInsights?.recommendedFocus ? `Extra priority from Application Learning Insights: ${applicationInsights.recommendedFocus}. Changes: ${(applicationInsights.suggestedChanges || []).join('; ')}.` : ''}

SKILL GAP MAP:
${JSON.stringify(gapMap.skills, null, 2)}`;

    const data = await callGeminiJSON<{
      weeks: Array<{
        weekNumber?: number;
        theme?: string;
        goals?: string[];
        milestone?: string;
        tasks: Array<Record<string, unknown>>;
      }>;
      focusNote?: string;
    }>(
      prompt,
      schema,
      'You are an elite career coach who designs realistic, time-boxed weekly study roadmaps. Never exceed the weekly hour budget.'
    );

    // Ensure completed: false on every task and strictly enforce maxHours per week
    const normalized = {
      generatedAt: new Date().toISOString(),
      focusNote: data.focusNote || 'Personalized career pivot roadmap.',
      weeks: (data.weeks || []).map((w, wi) => {
        const tasks = (w.tasks || []).map((t, ti) => ({
          ...t,
          id: (t.id as string) || `w${wi + 1}-t${ti + 1}`,
          title: String(t.title || `Task ${ti + 1}`),
          type: (t.type as string) || 'practice',
          estHours: Math.max(0.5, Number(t.estHours) || 1),
          skillsTargeted: Array.isArray(t.skillsTargeted) ? t.skillsTargeted.map(String) : [],
          resourceSuggestion: String(t.resourceSuggestion || 'Recommended learning resource'),
          completed: false,
        }));

        let totalH = tasks.reduce((sum, task) => sum + task.estHours, 0);
        if (totalH > maxHours && tasks.length > 0) {
          const scale = maxHours / totalH;
          tasks.forEach((task) => {
            task.estHours = Number(Math.max(0.5, task.estHours * scale).toFixed(1));
          });
          const adjustedSum = tasks.reduce((sum, task) => sum + task.estHours, 0);
          if (adjustedSum > maxHours) {
            tasks[0].estHours = Number(Math.max(0.5, tasks[0].estHours - (adjustedSum - maxHours)).toFixed(1));
          }
        }

        return {
          weekNumber: Number(w.weekNumber) || wi + 1,
          theme: String(w.theme || `Week ${wi + 1}`),
          goals: Array.isArray(w.goals) ? w.goals.map(String) : [],
          milestone: String(w.milestone || `Week ${wi + 1} milestone`),
          tasks,
        };
      }),
    };

    res.json(normalized);
  } catch (err) {
    handleApiError(res, err);
  }
});

// 5. Portfolio Projects Generator
app.post('/api/gemini/projects', async (req: Request, res: Response) => {
  try {
    const { profile, gapMap, applicationInsights } = req.body;
    if (!profile || !gapMap) {
      res.status(400).json({ error: 'Profile and gapMap are required to generate projects.' });
      return;
    }

    const schema = {
      type: Type.OBJECT,
      properties: {
        projects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              problemStatement: { type: Type.STRING },
              skillsCovered: { type: Type.ARRAY, items: { type: Type.STRING } },
              gapsClosed: { type: Type.ARRAY, items: { type: Type.STRING } },
              difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
              estHours: { type: Type.NUMBER },
              deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
              whyRecruitersCare: { type: Type.STRING },
            },
            required: [
              'id',
              'title',
              'problemStatement',
              'skillsCovered',
              'gapsClosed',
              'difficulty',
              'estHours',
              'deliverables',
              'whyRecruitersCare',
            ],
          },
        },
      },
      required: ['projects'],
    };

    const prompt = `Generate exactly 4 high-signal portfolio project ideas for ${profile.name} pivoting from ${profile.currentRole} to ${profile.targetRole}.
Match them directly to the top skill gaps below so gapsClosed references exact skill names from the gap map.
Leverage their background (${profile.currentRole}) as an unfair advantage where relevant.
${applicationInsights?.recommendedFocus ? `Align projects with high-response application segments: ${applicationInsights.recommendedFocus}.` : ''}

TOP SKILL GAPS:
${JSON.stringify(gapMap.skills.slice(0, 8), null, 2)}`;

    const data = await callGeminiJSON<{ projects: Array<Record<string, unknown>> }>(
      prompt,
      schema,
      'You are a hiring manager and portfolio advisor. Design realistic, proof-of-work projects that recruiters actually read.'
    );

    const normalized = {
      projects: data.projects.map((p, idx) => ({
        ...p,
        id: (p.id as string) || `proj-${Date.now()}-${idx + 1}`,
        status: 'suggested',
      })),
    };
    res.json(normalized);
  } catch (err) {
    handleApiError(res, err);
  }
});

// 6. Mock Interview Questions Generator
app.post('/api/gemini/interview-questions', async (req: Request, res: Response) => {
  try {
    const { profile, gapMap, interviewType } = req.body;
    if (!profile || !interviewType) {
      res.status(400).json({ error: 'Profile and interviewType are required.' });
      return;
    }

    const schema = {
      type: Type.OBJECT,
      properties: {
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              targetSkill: { type: Type.STRING },
            },
            required: ['id', 'question', 'targetSkill'],
          },
        },
      },
      required: ['questions'],
    };

    const prompt = `Generate exactly 5 tailored "${interviewType}" mock interview questions for a candidate pivoting from "${profile.currentRole}" to "${profile.targetRole}".
Ground the questions in their real resume background AND probe their highest skill gaps so they practice bridging their story.

PROFILE:
${JSON.stringify({ currentRole: profile.currentRole, yearsExperience: profile.yearsExperience, achievements: profile.achievements, targetRole: profile.targetRole })}

TOP GAPS:
${JSON.stringify((gapMap?.skills || []).slice(0, 6).map((s: { name: string; gap: number }) => ({ name: s.name, gap: s.gap })))}`;

    const data = await callGeminiJSON(
      prompt,
      schema,
      'You are a bar-raiser interviewer at top technology companies. Write crisp, realistic interview questions.'
    );
    res.json(data);
  } catch (err) {
    handleApiError(res, err);
  }
});

// 7. Mock Interview Answer Scorer
app.post('/api/gemini/score-answer', async (req: Request, res: Response) => {
  try {
    const { question, answer, interviewType, targetRole, targetSkill } = req.body;
    if (!question || !answer) {
      res.status(400).json({ error: 'Question and answer are required.' });
      return;
    }

    const schema = {
      type: Type.OBJECT,
      properties: {
        scores: {
          type: Type.OBJECT,
          properties: {
            structure: { type: Type.NUMBER, description: '0-5 score for logical framework & clarity' },
            relevance: { type: Type.NUMBER, description: '0-5 score for directly answering the prompt' },
            depth: { type: Type.NUMBER, description: '0-5 score for trade-offs, nuance, and strategic rigor' },
            evidence_and_metrics: { type: Type.NUMBER, description: '0-5 score for concrete examples, numbers, and KPIs' },
            communication: { type: Type.NUMBER, description: '0-5 score for conciseness and executive presence' },
          },
          required: ['structure', 'relevance', 'depth', 'evidence_and_metrics', 'communication'],
        },
        overall: { type: Type.NUMBER, description: '0-5 overall weighted rubric score (1 decimal)' },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        improvedAnswerExample: {
          type: Type.STRING,
          description: 'A concrete, high-scoring rewrite showing how to elevate the candidate answer',
        },
        followUpQuestion: {
          type: Type.STRING,
          description: 'One realistic probing follow-up question an interviewer would ask next',
        },
      },
      required: ['scores', 'overall', 'strengths', 'weaknesses', 'improvedAnswerExample', 'followUpQuestion'],
    };

    const prompt = `Evaluate this ${interviewType} interview response for a ${targetRole} candidate (testing skill: ${targetSkill || targetRole}).
Score rigorously from 0 to 5 (allow 0.5 increments, e.g., 3.5). Give specific, actionable strengths, weaknesses, an improved answer example, and a realistic follow-up question.

QUESTION:
"${question}"

CANDIDATE ANSWER:
"${answer}"`;

    const data = await callGeminiJSON(
      prompt,
      schema,
      'You are an expert interview coach. Give honest, calibrated, constructive rubric feedback in JSON.'
    );
    res.json(data);
  } catch (err) {
    handleApiError(res, err);
  }
});

// 8. Weekly Progress Check-in & Adaptive Plan Update
app.post('/api/gemini/weekly-checkin', async (req: Request, res: Response) => {
  try {
    const { profile, gapMap, roadmap, checkIn, latestInterview } = req.body;
    if (!profile || !gapMap || !roadmap || !checkIn) {
      res.status(400).json({ error: 'Profile, gapMap, roadmap, and checkIn are required.' });
      return;
    }

    const schema = {
      type: Type.OBJECT,
      properties: {
        updatedSkillLevels: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              skillName: { type: Type.STRING },
              newUserLevel: { type: Type.NUMBER, description: 'Updated proficiency 0-100' },
            },
            required: ['skillName', 'newUserLevel'],
          },
        },
        newReadinessScore: { type: Type.NUMBER, description: 'Updated pivot readiness score 0-100' },
        planChanges: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['added', 'removed', 'reordered', 'extended'] },
              description: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: ['type', 'description', 'reason'],
          },
        },
        updatedRoadmap: {
          type: Type.OBJECT,
          properties: {
            weeks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  weekNumber: { type: Type.INTEGER },
                  theme: { type: Type.STRING },
                  goals: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        type: {
                          type: Type.STRING,
                          enum: ['course', 'reading', 'practice', 'project', 'interview'],
                        },
                        estHours: { type: Type.NUMBER },
                        skillsTargeted: { type: Type.ARRAY, items: { type: Type.STRING } },
                        resourceSuggestion: { type: Type.STRING },
                        completed: { type: Type.BOOLEAN },
                      },
                      required: ['id', 'title', 'type', 'estHours', 'skillsTargeted', 'resourceSuggestion', 'completed'],
                    },
                  },
                  milestone: { type: Type.STRING },
                },
                required: ['weekNumber', 'theme', 'goals', 'tasks', 'milestone'],
              },
            },
          },
          required: ['weeks'],
        },
      },
      required: ['updatedSkillLevels', 'newReadinessScore', 'planChanges', 'updatedRoadmap'],
    };

    const prompt = `Process this weekly check-in for ${profile.name} (Week ${checkIn.weekNumber} of ${profile.weeksAvailable}, budget ${profile.hoursPerWeek} hrs/week).
1. Update skill levels (0-100) based on tasks completed, hours spent, and self-reported confidence (1-5).
2. Recalculate newReadinessScore (0-100).
3. Adapt the REMAINING weeks (> week ${checkIn.weekNumber}) of the roadmap while preserving completed weeks (<= week ${checkIn.weekNumber}) as-is.
4. Explicitly feed any weak mock interview rubric areas and stated blockers into the remaining weeks (adding drills, extending overloaded tasks, or reordering priorities). Never exceed ${profile.hoursPerWeek} hrs/week.
5. List 3-5 specific planChanges with clear type (added|removed|reordered|extended) and reason.

CHECK-IN:
${JSON.stringify(checkIn, null, 2)}

LATEST MOCK INTERVIEW SCORES & WEAK AREAS:
${JSON.stringify(latestInterview || null, null, 2)}

CURRENT GAP MAP SKILLS:
${JSON.stringify(gapMap.skills.map((s: { name: string; importance: number; userLevel: number; gap: number }) => ({ name: s.name, importance: s.importance, userLevel: s.userLevel, gap: s.gap })))}

CURRENT ROADMAP:
${JSON.stringify(roadmap.weeks)}`;

    const maxHours = Math.max(Number(profile.hoursPerWeek) || 8, 2);

    const data = await callGeminiJSON<{
      updatedSkillLevels: { skillName: string; newUserLevel: number }[];
      newReadinessScore: number;
      planChanges: Array<{ type: string; description: string; reason: string }>;
      updatedRoadmap: {
        weeks: Array<{
          weekNumber: number;
          theme: string;
          goals: string[];
          milestone: string;
          tasks: Array<{
            id: string;
            title: string;
            type: string;
            estHours: number;
            skillsTargeted: string[];
            resourceSuggestion: string;
            completed: boolean;
          }>;
        }>;
      };
    }>(
      prompt,
      schema,
      'You are an adaptive career pivot coach. Adjust upcoming weeks thoughtfully based on real velocity, blockers, and interview rubric gaps.'
    );

    // Strictly enforce maxHours on updated weeks
    if (data.updatedRoadmap && Array.isArray(data.updatedRoadmap.weeks)) {
      data.updatedRoadmap.weeks.forEach((week) => {
        if (Array.isArray(week.tasks)) {
          let totalH = week.tasks.reduce((sum, t) => sum + (Number(t.estHours) || 0), 0);
          if (totalH > maxHours && week.tasks.length > 0) {
            const scale = maxHours / totalH;
            week.tasks.forEach((t) => {
              t.estHours = Number(Math.max(0.5, t.estHours * scale).toFixed(1));
            });
            const adjustedSum = week.tasks.reduce((sum, t) => sum + t.estHours, 0);
            if (adjustedSum > maxHours) {
              week.tasks[0].estHours = Number(Math.max(0.5, week.tasks[0].estHours - (adjustedSum - maxHours)).toFixed(1));
            }
          }
        }
      });
    }

    res.json(data);
  } catch (err) {
    handleApiError(res, err);
  }
});

// 9. Application Learning Insights
app.post('/api/gemini/application-insights', async (req: Request, res: Response) => {
  try {
    const { profile, segmentStats, totalApplications, overallResponseRate } = req.body;
    if (!segmentStats) {
      res.status(400).json({ error: 'Computed segmentStats are required.' });
      return;
    }

    const schema = {
      type: Type.OBJECT,
      properties: {
        insights: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3-5 sharp, quantitative insights grounded strictly in the computed stats',
        },
        recommendedFocus: {
          type: Type.STRING,
          description: 'Single clear strategic focus statement for the next 2-4 weeks',
        },
        suggestedChanges: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3-4 concrete adjustments to roadmap, portfolio projects, or application targeting',
        },
      },
      required: ['insights', 'recommendedFocus', 'suggestedChanges'],
    };

    const prompt = `Analyze these computed job application response-rate statistics for ${profile?.name || 'the candidate'} targeting "${profile?.targetRole || 'Product Manager'}".
Total applications: ${totalApplications}, Overall response rate: ${overallResponseRate}%.
Only cite statistical superiority for segments that meet the minimum sample size (meetsMinSample: true, n >= 3).
Cite exact multipliers or percentage point gaps (e.g., "Referrals respond 3x more than cold LinkedIn applications").

COMPUTED SEGMENT STATS:
${JSON.stringify(segmentStats, null, 2)}`;

    const data = await callGeminiJSON(
      prompt,
      schema,
      'You are a data-driven job search strategist. Synthesize segment conversion data into crisp, high-leverage actions.'
    );
    res.json(data);
  } catch (err) {
    handleApiError(res, err);
  }
});

// Explicit 404 handler for all unmatched API routes (both development & production)
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
        return;
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PivotPilot server running on http://localhost:${PORT}`);
  });
}

startServer();
