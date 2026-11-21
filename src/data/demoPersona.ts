import type {
  AnswerEvaluation,
  ApplicationEntry,
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
  ProgressLog,
  ReadinessHistoryPoint,
  Roadmap,
} from '../types';

export const RAVI_RESUME_TEXT = `RAVI NAIR
Mechanical Design Engineer | Austin, TX | ravi.nair@email.com

SUMMARY
Mechanical Engineer with 3 years of experience designing electro-mechanical industrial IoT enclosures and sensor assemblies from concept through mass production. Proven track record collaborating with firmware, manufacturing, and customer support teams to cut unit cost, reduce field defects, and ship hardware on tight schedules.

EXPERIENCE
Mechanical Engineer — Apex Robotics & Sensors (2023 – Present)
• Led end-to-end redesign of modular thermal sensor housing across 3 product lines, reducing BOM cost by 18% ($420K annual savings) and assembly time by 24%.
• Partnered with firmware engineers, QA, and field service technicians to root-cause 140+ customer RMA tickets, cutting field failure rate from 4.8% to 1.6% in two quarters.
• Built Python and Excel telemetry dashboards analyzing vibration and temperature test logs across 500+ pilot units to prioritize firmware vs. mechanical fixes.
• Owned cross-functional launch readiness checklists with 6 overseas suppliers, delivering 2 flagship hardware revisions ahead of schedule.

Associate Mechanical Engineer — Vertex Industrial Systems (2022 – 2023)
• Conducted 22 on-site plant walkthroughs with maintenance operators to document workflow bottlenecks and translate field pain points into CAD spec requirements.
• Managed engineering change orders (ECOs) and BOM version control for a 12-person engineering team using SolidWorks PDM and Jira.
• Designed automated endurance test rigs that reduced pre-release validation cycle time from 3 weeks to 6 days.

EDUCATION
B.S. in Mechanical Engineering, University of Texas at Austin (2022) — GPA 3.74

SKILLS
SolidWorks, DFMA, Root Cause Analysis (5 Whys / FMEA), Python (Pandas, Matplotlib), SQL (Basic), Excel Modeling, Jira, Cross-Functional Coordination, Supplier Management, Customer Field Research`;

export const RAVI_PROFILE: Profile = {
  name: 'Ravi Nair',
  currentRole: 'Mechanical Engineer',
  yearsExperience: 3,
  skills: [
    'Cross-Functional Coordination',
    'Root Cause Analysis (FMEA)',
    'Python (Pandas)',
    'SQL (Basic)',
    'Customer Field Research',
    'Jira & Backlog Tracking',
    'Hardware Lifecycle & DFMA',
    'Data Modeling (Excel)',
  ],
  education: ['B.S. Mechanical Engineering, University of Texas at Austin (2022)'],
  achievements: [
    'Led end-to-end redesign of modular thermal sensor housing across 3 product lines, reducing BOM cost by 18% ($420K annual savings) and assembly time by 24%.',
    'Partnered with firmware engineers, QA, and field service technicians to root-cause 140+ customer RMA tickets, cutting field failure rate from 4.8% to 1.6% in two quarters.',
    'Built Python and Excel telemetry dashboards analyzing vibration and temperature test logs across 500+ pilot units to prioritize firmware vs. mechanical fixes.',
    'Conducted 22 on-site plant walkthroughs with maintenance operators to document workflow bottlenecks and translate field pain points into spec requirements.',
    'Designed automated endurance test rigs that reduced pre-release validation cycle time from 3 weeks to 6 days.',
  ],
  targetRole: 'Product Manager',
  hoursPerWeek: 8,
  weeksAvailable: 12,
  resumeText: RAVI_RESUME_TEXT,
  resumeFileName: 'Ravi_Nair_Resume.pdf',
};

export const RAVI_JOB_DESCRIPTIONS: JobDescription[] = [
  {
    id: 'jd-1',
    company: 'Samsara',
    title: 'Product Manager, Connected Operations',
    text: `We are looking for a Product Manager to own fleet hardware-to-cloud diagnostic workflows.
Responsibilities:
- Write clear Product Requirements Documents (PRDs) and user stories balancing customer pain with engineering feasibility.
- Define North Star KPIs, activation funnels, and retention cohorts using SQL and Amplitude.
- Run structured customer discovery interviews with fleet managers and translate insights into a 2-quarter roadmap.
- Partner closely with firmware, mobile, and backend engineers to scope MVPs and manage trade-offs.
- Design and analyze A/B experiments and phased rollouts to measure adoption lift.
Qualifications:
- 2-5 years in product management, engineering, or analytics; hardware/IoT familiarity is a plus.
- Strong SQL proficiency, data storytelling, and prioritization frameworks (RICE, ICE, opportunity sizing).`,
  },
  {
    id: 'jd-2',
    company: 'Procore',
    title: 'Associate Product Manager, Field Productivity',
    text: `Procore builds construction management software used by field teams worldwide.
What you'll do:
- Own backlog prioritization and sprint planning alongside design and engineering squads.
- Conduct usability testing and field discovery with superintendents to validate wireframes before build.
- Define product metrics, funnel conversion dashboards, and instrumentation specs in Mixpanel/SQL.
- Author PRDs, release notes, and cross-functional Go-To-Market (GTM) enablement briefs with Product Marketing and Sales.
- Present roadmap trade-offs and quarterly business reviews to senior product leadership.`,
  },
  {
    id: 'jd-3',
    company: 'Verkada',
    title: 'Technical Product Manager, IoT Sensors',
    text: `Lead the roadmap for next-generation environmental and industrial security sensors paired with cloud alerting.
Key Responsibilities:
- Bridge hardware constraints, firmware telemetry, and cloud web/mobile UX into cohesive customer experiences.
- Develop pricing and packaging hypotheses with Finance and GTM teams for new enterprise tiers.
- Write crisp technical PRDs, API payload requirements, and acceptance criteria.
- Track sensor onboarding activation, alert false-positive rates, and enterprise account expansion metrics via SQL.
- Conduct competitive teardown analyses and win/loss calls with enterprise customers.`,
  },
  {
    id: 'jd-4',
    company: 'Linear',
    title: 'Product Manager, Workflows & Insights',
    text: `Help high-velocity software and hardware teams plan roadmaps and measure execution.
What we look for:
- Deep product craft: ability to write concise specs, critique UX flows, and cut scope ruthlessly.
- Experience designing A/B experiments, guardrail metrics, and self-serve onboarding flows.
- Strong SQL and product analytics fluency to diagnose activation drops and cohort retention cliffs.
- Clear written communication and structured decision memos for cross-functional alignment.`,
  },
  {
    id: 'jd-5',
    company: 'Augury',
    title: 'Product Manager, Machine Health Platform',
    text: `Augury combines vibration/temperature IoT sensors with AI diagnostics for industrial plants.
Responsibilities:
- Own the end-to-end roadmap for plant reliability alerts and technician workflow apps.
- Translate industrial customer interviews and reliability engineer feedback into prioritized product initiatives.
- Define experiment plans, adoption KPIs, and customer health dashboards in SQL/Looker.
- Collaborate with ML engineers, hardware teams, and Customer Success on GTM launches and pricing tiers.
- Communicate clear strategic narratives and ROI business cases to executives.`,
  },
];

export const RAVI_DEMO_GAP_MAP: GapMap = {
  readinessScore: 62,
  readinessExplanation:
    'Strong IoT domain credibility and analytical rigor give Ravi an edge for technical PM roles, but closing gaps in PRD writing, SQL product analytics, and A/B experimentation is critical before full-loop interviews.',
  generatedAt: '2026-11-18T10:00:00.000Z',
  skills: [
    {
      name: 'PRD Writing & Product Scoping',
      category: 'Product Execution',
      importance: 96,
      userLevel: 32,
      gap: 64,
      evidenceQuotes: [
        'Write clear Product Requirements Documents (PRDs) and user stories balancing customer pain with engineering feasibility.',
        'Author PRDs, release notes, and cross-functional GTM enablement briefs.',
        'Write crisp technical PRDs, API payload requirements, and acceptance criteria.',
      ],
      transferableFrom:
        'Translated 22 plant walkthroughs into CAD spec requirements and managed engineering change orders (ECOs).',
    },
    {
      name: 'A/B Testing & Experimentation Design',
      category: 'Analytics & Metrics',
      importance: 86,
      userLevel: 26,
      gap: 60,
      evidenceQuotes: [
        'Design and analyze A/B experiments and phased rollouts to measure adoption lift.',
        'Experience designing A/B experiments, guardrail metrics, and self-serve onboarding flows.',
        'Define experiment plans, adoption KPIs, and customer health dashboards.',
      ],
      transferableFrom:
        'Designed endurance validation test rigs and root-caused pilot sensor anomalies across 500+ units.',
    },
    {
      name: 'SQL & Product Funnel Analytics',
      category: 'Analytics & Metrics',
      importance: 94,
      userLevel: 40,
      gap: 54,
      evidenceQuotes: [
        'Define North Star KPIs, activation funnels, and retention cohorts using SQL and Amplitude.',
        'Strong SQL proficiency, data storytelling, and prioritization frameworks.',
        'Track sensor onboarding activation and enterprise account expansion metrics via SQL.',
      ],
      transferableFrom:
        'Built Python (Pandas) and Excel telemetry dashboards analyzing vibration/temperature logs; Basic SQL listed.',
    },
    {
      name: 'Go-To-Market (GTM) & Pricing Strategy',
      category: 'Product Strategy',
      importance: 78,
      userLevel: 28,
      gap: 50,
      evidenceQuotes: [
        'Develop pricing and packaging hypotheses with Finance and GTM teams for new enterprise tiers.',
        'Cross-functional Go-To-Market (GTM) enablement briefs with Product Marketing and Sales.',
        'Collaborate with Customer Success on GTM launches and pricing tiers.',
      ],
      transferableFrom:
        'Delivered $420K annual BOM cost reduction and managed launch readiness with 6 overseas suppliers.',
    },
    {
      name: 'Roadmap Prioritization Frameworks (RICE / Opportunity Sizing)',
      category: 'Product Strategy',
      importance: 90,
      userLevel: 48,
      gap: 42,
      evidenceQuotes: [
        'Prioritization frameworks (RICE, ICE, opportunity sizing).',
        'Own backlog prioritization and sprint planning alongside design and engineering squads.',
        'Translate industrial customer interviews into prioritized product initiatives.',
      ],
      transferableFrom:
        'Prioritized firmware vs. mechanical fixes across 140+ customer RMA tickets using telemetry data.',
    },
    {
      name: 'UX Wireframing & Usability Validation',
      category: 'Product Execution',
      importance: 74,
      userLevel: 38,
      gap: 36,
      evidenceQuotes: [
        'Conduct usability testing and field discovery with superintendents to validate wireframes before build.',
        'Deep product craft: ability to write concise specs, critique UX flows, and cut scope ruthlessly.',
      ],
      transferableFrom:
        'Documented operator workflow bottlenecks across 22 on-site plant walkthroughs.',
    },
    {
      name: 'Executive Storytelling & Decision Memos',
      category: 'Stakeholder Leadership',
      importance: 82,
      userLevel: 54,
      gap: 28,
      evidenceQuotes: [
        'Present roadmap trade-offs and quarterly business reviews to senior product leadership.',
        'Communicate clear strategic narratives and ROI business cases to executives.',
      ],
      transferableFrom:
        'Coordinated cross-functional launch readiness across firmware, QA, and manufacturing leadership.',
    },
    {
      name: 'Customer Discovery & Field Synthesis',
      category: 'Product Strategy',
      importance: 88,
      userLevel: 68,
      gap: 20,
      evidenceQuotes: [
        'Run structured customer discovery interviews with fleet managers.',
        'Conduct competitive teardown analyses and win/loss calls with enterprise customers.',
      ],
      transferableFrom:
        'Conducted 22 on-site plant walkthroughs with maintenance operators at Vertex Industrial Systems.',
    },
    {
      name: 'Cross-Functional Engineering Collaboration',
      category: 'Stakeholder Leadership',
      importance: 92,
      userLevel: 82,
      gap: 10,
      evidenceQuotes: [
        'Partner closely with firmware, mobile, and backend engineers to scope MVPs and manage trade-offs.',
        'Bridge hardware constraints, firmware telemetry, and cloud web/mobile UX.',
      ],
      transferableFrom:
        'Partnered directly with firmware, QA, and field service teams to cut field failure rate from 4.8% to 1.6%.',
    },
    {
      name: 'Hardware / Industrial IoT Domain Fluency',
      category: 'Technical Fluency',
      importance: 76,
      userLevel: 90,
      gap: 0,
      evidenceQuotes: [
        'Hardware/IoT familiarity is a plus.',
        'Augury combines vibration/temperature IoT sensors with AI diagnostics for industrial plants.',
      ],
      transferableFrom:
        '3 years designing electro-mechanical industrial IoT thermal/vibration sensor enclosures at Apex Robotics.',
    },
  ],
  jdMatches: [
    {
      jdId: 'jd-5',
      company: 'Augury',
      roleTitle: 'Product Manager, Machine Health Platform',
      matchScore: 78,
      keyMatches: ['Vibration/temperature IoT sensors', 'Plant walkthroughs & operator empathy', 'Cross-functional firmware/QA work'],
      missingSkills: ['Looker/SQL cohort dashboards', 'Pricing & GTM launch ownership'],
    },
    {
      jdId: 'jd-3',
      company: 'Verkada',
      roleTitle: 'Technical Product Manager, IoT Sensors',
      matchScore: 74,
      keyMatches: ['Electro-mechanical sensor lifecycle', 'Hardware-firmware telemetry bridge', 'Root-cause field reliability'],
      missingSkills: ['Technical PRDs & API specs', 'Enterprise pricing & packaging'],
    },
    {
      jdId: 'jd-1',
      company: 'Samsara',
      roleTitle: 'Product Manager, Connected Operations',
      matchScore: 68,
      keyMatches: ['Hardware-to-cloud telemetry', 'Data analysis with Python', 'Cross-functional launches'],
      missingSkills: ['Amplitude/SQL retention cohorts', 'A/B experiment design', 'Formal PRD portfolio'],
    },
    {
      jdId: 'jd-2',
      company: 'Procore',
      roleTitle: 'Associate Product Manager, Field Productivity',
      matchScore: 61,
      keyMatches: ['Field operator walkthroughs', 'Jira workflow coordination', 'Spec translation'],
      missingSkills: ['Usability wireframe testing', 'Mixpanel funnel instrumentation', 'GTM enablement briefs'],
    },
    {
      jdId: 'jd-4',
      company: 'Linear',
      roleTitle: 'Product Manager, Workflows & Insights',
      matchScore: 49,
      keyMatches: ['Structured analytical rigor', 'Execution discipline'],
      missingSkills: ['Self-serve SaaS onboarding A/B tests', 'Software UX critique craft', 'SQL activation cohorts'],
    },
  ],
};

export const RAVI_DEMO_ROADMAP: Roadmap = {
  generatedAt: '2026-11-18T10:15:00.000Z',
  focusNote:
    'Paced at 8 hrs/week across 12 weeks. Prioritizes PRD Writing, SQL Product Analytics, and A/B Experimentation in Weeks 1–5 while leveraging Ravi’s Industrial IoT edge.',
  weeks: [
    {
      weekNumber: 1,
      theme: 'PM Foundations & PRD Scoping Fundamentals',
      goals: [
        'Translate hardware engineering specs into software-grade PRDs',
        'Establish North Star metric vocabulary for connected IoT products',
      ],
      milestone: 'Complete 1 teardown PRD for an IoT sensor onboarding workflow',
      tasks: [
        {
          id: 'w1-t1',
          title: 'Study modern 1-page PRD structure (Problem, Non-Goals, Metrics, Trade-offs)',
          type: 'reading',
          estHours: 2,
          skillsTargeted: ['PRD Writing & Product Scoping'],
          resourceSuggestion: 'Lenny’s Newsletter PRD Templates + Marty Cagan "Inspired" Ch. 10–14',
          completed: true,
        },
        {
          id: 'w1-t2',
          title: 'Rewrite 2 mechanical engineering ECOs into outcome-oriented software PRDs',
          type: 'practice',
          estHours: 3,
          skillsTargeted: ['PRD Writing & Product Scoping', 'Executive Storytelling & Decision Memos'],
          resourceSuggestion: 'Notion 1-Pager Spec Template applied to Apex thermal sensor firmware alert',
          completed: true,
        },
        {
          id: 'w1-t3',
          title: 'Audit Samsara & Augury product onboarding flows and log 5 UX friction points',
          type: 'practice',
          estHours: 2,
          skillsTargeted: ['UX Wireframing & Usability Validation'],
          resourceSuggestion: 'Public product demos & G2 customer reviews for Samsara / Augury',
          completed: true,
        },
        {
          id: 'w1-t4',
          title: 'Map 3 transferable behavioral stories using STAR + business outcome metrics',
          type: 'interview',
          estHours: 1,
          skillsTargeted: ['Executive Storytelling & Decision Memos'],
          resourceSuggestion: 'PivotPilot ATS Bullet Rewriter & STAR story matrix',
          completed: true,
        },
      ],
    },
    {
      weekNumber: 2,
      theme: 'SQL Product Analytics & Cohort Retention',
      goals: [
        'Move from basic SQL queries to funnel conversion and Day-7/Day-30 retention queries',
        'Define event instrumentation schemas for sensor activation',
      ],
      milestone: 'Ship a SQL cohort retention notebook analyzing B2B IoT device activation',
      tasks: [
        {
          id: 'w2-t1',
          title: 'Complete window functions, CTEs, and cohort retention SQL drills',
          type: 'course',
          estHours: 3,
          skillsTargeted: ['SQL & Product Funnel Analytics'],
          resourceSuggestion: 'Mode Analytics Intermediate/Advanced SQL Tutorial (Window Functions + Cohorts)',
          completed: true,
        },
        {
          id: 'w2-t2',
          title: 'Write activation funnel & 30-day retention SQL queries on sample SaaS telemetry dataset',
          type: 'project',
          estHours: 3,
          skillsTargeted: ['SQL & Product Funnel Analytics'],
          resourceSuggestion: 'DuckDB / PostgreSQL local playground with 50k synthetic device events',
          completed: true,
        },
        {
          id: 'w2-t3',
          title: 'Draft a Mixpanel/Amplitude event tracking plan for sensor setup & alert triage',
          type: 'practice',
          estHours: 2,
          skillsTargeted: ['SQL & Product Funnel Analytics', 'PRD Writing & Product Scoping'],
          resourceSuggestion: 'Amplitude Event Taxonomy Playbook',
          completed: false,
        },
      ],
    },
    {
      weekNumber: 3,
      theme: 'A/B Experimentation & Guardrail Metrics',
      goals: [
        'Master statistical power, minimum detectable effect, and guardrail metric selection',
        'Design an experimentation spec for reducing false-positive sensor alerts',
      ],
      milestone: 'Publish an A/B Experiment Spec & Decision Doc for Portfolio Project #1',
      tasks: [
        {
          id: 'w3-t1',
          title: 'Learn A/B testing pitfalls (peeking, novelty effect, network interference, guardrails)',
          type: 'course',
          estHours: 2.5,
          skillsTargeted: ['A/B Testing & Experimentation Design'],
          resourceSuggestion: 'Ron Kohavi "Trustworthy Online Controlled Experiments" Ch. 1–4',
          completed: true,
        },
        {
          id: 'w3-t2',
          title: 'Calculate sample size & run hypothesis test on alert-threshold experiment data',
          type: 'practice',
          estHours: 2,
          skillsTargeted: ['A/B Testing & Experimentation Design', 'SQL & Product Funnel Analytics'],
          resourceSuggestion: 'Evan Miller Sample Size Calculator + Python SciPy t-test notebook',
          completed: false,
        },
        {
          id: 'w3-t3',
          title: 'Draft full PRD + A/B Experiment Plan for Predictive Alert Triage workflow',
          type: 'project',
          estHours: 2.5,
          skillsTargeted: ['PRD Writing & Product Scoping', 'A/B Testing & Experimentation Design'],
          resourceSuggestion: 'Portfolio Project #1 workspace',
          completed: false,
        },
        {
          id: 'w3-t4',
          title: 'Complete a 25-minute Role-Specific Mock Interview on Metrics & Diagnostics',
          type: 'interview',
          estHours: 1,
          skillsTargeted: ['A/B Testing & Experimentation Design', 'Executive Storytelling & Decision Memos'],
          resourceSuggestion: 'PivotPilot Mock Interview (Role-Specific)',
          completed: false,
        },
      ],
    },
    {
      weekNumber: 4,
      theme: 'Prioritization Frameworks & Opportunity Sizing',
      goals: [
        'Quantify business impact using RICE, ICE, and TAM/ROI sizing',
        'Defend roadmap trade-offs under engineering capacity constraints',
      ],
      milestone: 'Build a 2-quarter prioritized backlog with quantified opportunity sizing',
      tasks: [
        {
          id: 'w4-t1',
          title: 'Practice RICE scoring & opportunity sizing across 8 competing IoT feature requests',
          type: 'practice',
          estHours: 2.5,
          skillsTargeted: ['Roadmap Prioritization Frameworks (RICE / Opportunity Sizing)'],
          resourceSuggestion: 'Intercom RICE Prioritization Guide + Spreadsheet Model',
          completed: false,
        },
        {
          id: 'w4-t2',
          title: 'Create low-fidelity Figma wireframes for mobile technician alert triage flow',
          type: 'project',
          estHours: 3.5,
          skillsTargeted: ['UX Wireframing & Usability Validation'],
          resourceSuggestion: 'Figma Wireframe Kit + 3 quick usability tests with engineer peers',
          completed: false,
        },
        {
          id: 'w4-t3',
          title: 'Write a 1-page Executive Decision Memo defending what you cut from Q2 scope',
          type: 'practice',
          estHours: 2,
          skillsTargeted: ['Executive Storytelling & Decision Memos', 'Roadmap Prioritization Frameworks (RICE / Opportunity Sizing)'],
          resourceSuggestion: 'Amazon 6-pager / 1-pager executive memo template',
          completed: false,
        },
      ],
    },
    {
      weekNumber: 5,
      theme: 'Go-To-Market (GTM) & Enterprise Pricing Strategy',
      goals: [
        'Structure SaaS + hardware bundle pricing tiers and value metrics',
        'Write a Sales & Customer Success GTM launch playbook',
      ],
      milestone: 'Complete Enterprise Sensor Tier Pricing Model & GTM Launch Brief',
      tasks: [
        {
          id: 'w5-t1',
          title: 'Study B2B SaaS + IoT monetization (per-asset vs. usage vs. tiered bundles)',
          type: 'reading',
          estHours: 2.5,
          skillsTargeted: ['Go-To-Market (GTM) & Pricing Strategy'],
          resourceSuggestion: 'Madhavan Ramanujam "Monetizing Innovation" + Kyle Poyar Pricing Guides',
          completed: false,
        },
        {
          id: 'w5-t2',
          title: 'Build a 3-tier pricing sensitivity & ROI calculator for plant reliability managers',
          type: 'project',
          estHours: 3.5,
          skillsTargeted: ['Go-To-Market (GTM) & Pricing Strategy'],
          resourceSuggestion: 'Google Sheets ROI & Margin Model for IoT SaaS tiers',
          completed: false,
        },
        {
          id: 'w5-t3',
          title: 'Draft GTM enablement brief (positioning, battlecard, rollout checklist)',
          type: 'practice',
          estHours: 2,
          skillsTargeted: ['Go-To-Market (GTM) & Pricing Strategy', 'Executive Storytelling & Decision Memos'],
          resourceSuggestion: 'Product Marketing Alliance GTM Launch Canvas',
          completed: false,
        },
      ],
    },
    {
      weekNumber: 6,
      theme: 'Technical PM Fluency: APIs, Telemetry & Cloud Architecture',
      goals: [
        'Articulate edge-to-cloud API payload, latency, and offline-sync trade-offs',
        'Translate hardware constraints cleanly for software engineering interviewers',
      ],
      milestone: 'Publish Technical PRD with JSON webhook payload spec & SLA trade-offs',
      tasks: [
        {
          id: 'w6-t1',
          title: 'Review REST/Webhook/MQTT telemetry architectures for connected devices',
          type: 'course',
          estHours: 3,
          skillsTargeted: ['PRD Writing & Product Scoping', 'Cross-Functional Engineering Collaboration'],
          resourceSuggestion: 'ByteByteGo API & IoT Telemetry Architecture Primers',
          completed: false,
        },
        {
          id: 'w6-t2',
          title: 'Write API acceptance criteria & offline-retry spec for field sensor gateways',
          type: 'project',
          estHours: 3,
          skillsTargeted: ['PRD Writing & Product Scoping'],
          resourceSuggestion: 'OpenAPI / Postman mock payload spec attached to Portfolio Project',
          completed: false,
        },
        {
          id: 'w6-t3',
          title: 'Run a Case/Technical Mock Interview on system trade-offs & alerting latency',
          type: 'interview',
          estHours: 2,
          skillsTargeted: ['Executive Storytelling & Decision Memos', 'Cross-Functional Engineering Collaboration'],
          resourceSuggestion: 'PivotPilot Mock Interview (Case/Technical)',
          completed: false,
        },
      ],
    },
    {
      weekNumber: 7,
      theme: 'Portfolio Case Study Packaging & Resume Transformation',
      goals: [
        'Publish 2 polished case studies demonstrating end-to-end PM ownership',
        'Tailor ATS resume bullets to highlight product outcomes over CAD execution',
      ],
      milestone: 'Live Notion portfolio with 2 case studies + updated PM resume',
      tasks: [
        {
          id: 'w7-t1',
          title: 'Rewrite all 8 resume experience bullets for PM impact & ATS keywords',
          type: 'practice',
          estHours: 2.5,
          skillsTargeted: ['Executive Storytelling & Decision Memos'],
          resourceSuggestion: 'PivotPilot ATS Bullet Rewriter',
          completed: false,
        },
        {
          id: 'w7-t2',
          title: 'Package SQL Retention Audit + Predictive Alert PRD into scannable portfolio pages',
          type: 'project',
          estHours: 4,
          skillsTargeted: ['PRD Writing & Product Scoping', 'SQL & Product Funnel Analytics'],
          resourceSuggestion: 'Notion public portfolio template with executive summary up top',
          completed: false,
        },
        {
          id: 'w7-t3',
          title: 'Collect peer critique from 2 practicing Product Managers on portfolio clarity',
          type: 'practice',
          estHours: 1.5,
          skillsTargeted: ['Executive Storytelling & Decision Memos'],
          resourceSuggestion: 'PM LinkedIn / alumni coffee chat feedback script',
          completed: false,
        },
      ],
    },
    {
      weekNumber: 8,
      theme: 'Targeted Referral Outreach & Mid-Size IoT Pipeline',
      goals: [
        'Shift outreach toward warm referrals at mid-size industrial SaaS/IoT companies',
        'Attach tailored portfolio teardowns to recruiter & hiring manager outreach',
      ],
      milestone: '10 warm outreach messages sent + 4 referral-backed applications submitted',
      tasks: [
        {
          id: 'w8-t1',
          title: 'Identify 15 mid-size IoT/Connected Ops PM hiring managers & UT Austin alumni',
          type: 'practice',
          estHours: 2.5,
          skillsTargeted: ['Go-To-Market (GTM) & Pricing Strategy'],
          resourceSuggestion: 'LinkedIn Alumni filter + PivotPilot Applications tracker',
          completed: false,
        },
        {
          id: 'w8-t2',
          title: 'Create 2 tailored 1-page product teardowns for top target companies',
          type: 'project',
          estHours: 3.5,
          skillsTargeted: ['UX Wireframing & Usability Validation', 'Roadmap Prioritization Frameworks (RICE / Opportunity Sizing)'],
          resourceSuggestion: '1-page Loom + Notion teardown attached to referral messages',
          completed: false,
        },
        {
          id: 'w8-t3',
          title: 'Run Behavioral Mock Interview focusing on "Why pivot from Mechanical Eng to PM?"',
          type: 'interview',
          estHours: 2,
          skillsTargeted: ['Executive Storytelling & Decision Memos'],
          resourceSuggestion: 'PivotPilot Mock Interview (Behavioral)',
          completed: false,
        },
      ],
    },
    {
      weekNumber: 9,
      theme: 'Product Sense & Metrics Interview Mastery',
      goals: [
        'Deliver structured CIRCLES-style product design answers in under 20 minutes',
        'Diagnose sudden metric drops systematically with segmentation + guardrails',
      ],
      milestone: 'Score >= 4.0/5 across all 5 rubric dimensions in a Role-Specific Mock',
      tasks: [
        {
          id: 'w9-t1',
          title: 'Drill 4 product design prompts (user segments, pain points, MVP, metrics)',
          type: 'practice',
          estHours: 3.5,
          skillsTargeted: ['Roadmap Prioritization Frameworks (RICE / Opportunity Sizing)', 'UX Wireframing & Usability Validation'],
          resourceSuggestion: 'Lewis Lin "Decode and Conquer" + Exponent Product Sense rubric',
          completed: false,
        },
        {
          id: 'w9-t2',
          title: 'Drill 3 root-cause metric drop cases (activation, retention, alert fatigue)',
          type: 'practice',
          estHours: 2.5,
          skillsTargeted: ['SQL & Product Funnel Analytics', 'A/B Testing & Experimentation Design'],
          resourceSuggestion: 'Metric Diagnosis Framework (Internal vs External, Segment, Funnel Step)',
          completed: false,
        },
        {
          id: 'w9-t3',
          title: 'Complete timed PivotPilot Role-Specific Mock & review radar weak spots',
          type: 'interview',
          estHours: 2,
          skillsTargeted: ['A/B Testing & Experimentation Design', 'Executive Storytelling & Decision Memos'],
          resourceSuggestion: 'PivotPilot Mock Interview (Voice mode)',
          completed: false,
        },
      ],
    },
    {
      weekNumber: 10,
      theme: 'Execution, Trade-offs & Cross-Functional Influence Loops',
      goals: [
        'Navigate ambiguous stakeholder conflict and engineering pushback smoothly',
        'Strengthen evidence_and_metrics storytelling in every behavioral answer',
      ],
      milestone: 'Zero rubric dimensions below 3.8/5 across behavioral and case drills',
      tasks: [
        {
          id: 'w10-t1',
          title: 'Prepare 6 quantified conflict & trade-off stories from Apex Robotics & Vertex',
          type: 'practice',
          estHours: 3,
          skillsTargeted: ['Cross-Functional Engineering Collaboration', 'Executive Storytelling & Decision Memos'],
          resourceSuggestion: 'Story Bank Spreadsheet with Before/Action/Metric columns',
          completed: false,
        },
        {
          id: 'w10-t2',
          title: 'Practice 2 live case interviews with PM peers and capture rubric notes',
          type: 'interview',
          estHours: 3,
          skillsTargeted: ['Roadmap Prioritization Frameworks (RICE / Opportunity Sizing)'],
          resourceSuggestion: 'Lewis Lin Slack / Exponent Peer Mock platform',
          completed: false,
        },
        {
          id: 'w10-t3',
          title: 'Refine active application strategy using PivotPilot segment response data',
          type: 'practice',
          estHours: 2,
          skillsTargeted: ['Go-To-Market (GTM) & Pricing Strategy'],
          resourceSuggestion: 'PivotPilot Applications Learning Insights panel',
          completed: false,
        },
      ],
    },
    {
      weekNumber: 11,
      theme: 'Full-Loop Interview Sprints & Take-Home Case Prep',
      goals: [
        'Simulate back-to-back Product Sense + Execution + Behavioral loops',
        'Prepare a reusable template for 48-hour PM take-home assignments',
      ],
      milestone: 'Complete 2 full mock loops and finalize take-home case framework',
      tasks: [
        {
          id: 'w11-t1',
          title: 'Build a reusable 6-slide take-home case deck (Context, Users, Bet, Metrics, Risks)',
          type: 'project',
          estHours: 3,
          skillsTargeted: ['Executive Storytelling & Decision Memos', 'PRD Writing & Product Scoping'],
          resourceSuggestion: 'Figma / Slides take-home deck starter',
          completed: false,
        },
        {
          id: 'w11-t2',
          title: 'Run back-to-back Case/Technical + Behavioral mocks in voice dictation mode',
          type: 'interview',
          estHours: 3,
          skillsTargeted: ['A/B Testing & Experimentation Design', 'Executive Storytelling & Decision Memos'],
          resourceSuggestion: 'PivotPilot Mock Interview',
          completed: false,
        },
        {
          id: 'w11-t3',
          title: 'Follow up on active screening/interview threads with relevant portfolio links',
          type: 'practice',
          estHours: 2,
          skillsTargeted: ['Go-To-Market (GTM) & Pricing Strategy'],
          resourceSuggestion: 'PivotPilot Applications Tracker',
          completed: false,
        },
      ],
    },
    {
      weekNumber: 12,
      theme: 'Final Loop Execution, Executive Presence & Offer Negotiation',
      goals: [
        'Deliver crisp 30-60-90 day PM onboarding plans for final-round companies',
        'Benchmark PM compensation bands and prepare negotiation anchors',
      ],
      milestone: 'Final-round 30-60-90 day plan delivered & offer negotiation script ready',
      tasks: [
        {
          id: 'w12-t1',
          title: 'Draft a tailored 30-60-90 day PM ramp plan for top 2 interviewing companies',
          type: 'practice',
          estHours: 3,
          skillsTargeted: ['Executive Storytelling & Decision Memos', 'Customer Discovery & Field Synthesis'],
          resourceSuggestion: '30-60-90 PM Ramp Template focused on customer calls + quick wins',
          completed: false,
        },
        {
          id: 'w12-t2',
          title: 'Run final dress-rehearsal mock interview covering top company product strategy',
          type: 'interview',
          estHours: 3,
          skillsTargeted: ['Go-To-Market (GTM) & Pricing Strategy', 'Roadmap Prioritization Frameworks (RICE / Opportunity Sizing)'],
          resourceSuggestion: 'PivotPilot Mock Interview',
          completed: false,
        },
        {
          id: 'w12-t3',
          title: 'Research PM leveling, equity bands, and negotiation scripts for Austin/Remote',
          type: 'reading',
          estHours: 2,
          skillsTargeted: ['Executive Storytelling & Decision Memos'],
          resourceSuggestion: 'Levels.fyi + Haseeb Qureshi Negotiation Guide',
          completed: false,
        },
      ],
    },
  ],
};

export const RAVI_DEMO_PROJECTS: PortfolioProject[] = [
  {
    id: 'proj-1',
    title: 'Predictive Alert Triage PRD & A/B Experiment Spec',
    problemStatement:
      'Industrial plant technicians ignore 40% of IoT vibration/thermal alerts due to alert fatigue, causing preventable unplanned downtime. Design a severity-tiered triage workflow and A/B rollout plan.',
    skillsCovered: ['PRD Writing & Product Scoping', 'A/B Testing & Experimentation Design', 'UX Wireframing & Usability Validation'],
    gapsClosed: ['PRD Writing & Product Scoping', 'A/B Testing & Experimentation Design'],
    difficulty: 'Intermediate',
    estHours: 8,
    deliverables: [
      '2-page PRD with problem framing, non-goals, edge cases, and acceptance criteria',
      'A/B experiment design with sample size calculation and missed-failure guardrail metric',
      '3-screen Figma wireframe showing technician mobile triage flow',
    ],
    whyRecruitersCare:
      'Proves Ravi can translate his real mechanical sensor reliability experience into a rigorous software PRD and statistically sound experiment plan.',
    status: 'in_progress',
  },
  {
    id: 'proj-2',
    title: 'Connected Fleet Onboarding SQL Funnel & Retention Audit',
    problemStatement:
      'Mid-market IoT customers churn within 45 days when gateway installation stalls after hardware delivery. Analyze 50,000 simulated device events in SQL to pinpoint the Day-7 activation cliff.',
    skillsCovered: ['SQL & Product Funnel Analytics', 'Roadmap Prioritization Frameworks (RICE / Opportunity Sizing)'],
    gapsClosed: ['SQL & Product Funnel Analytics'],
    difficulty: 'Intermediate',
    estHours: 6,
    deliverables: [
      'GitHub/Notion SQL query pack (funnel conversion, D7/D30 cohort retention, segmentation)',
      'Executive 1-page diagnostic memo with top 3 onboarding friction hypotheses',
      'RICE-scored backlog of 5 activation experiments',
    ],
    whyRecruitersCare:
      'Demonstrates hands-on SQL cohort fluency and product sense rather than just listing "SQL (Basic)" on a resume.',
    status: 'completed',
  },
  {
    id: 'proj-3',
    title: 'Hardware + Cloud SaaS Tiered Pricing & GTM Launch Plan',
    problemStatement:
      'A growing industrial sensor company bundles cloud analytics for free with hardware, compressing gross margins. Design a 3-tier hardware-plus-SaaS packaging strategy and GTM launch playbook.',
    skillsCovered: ['Go-To-Market (GTM) & Pricing Strategy', 'Executive Storytelling & Decision Memos'],
    gapsClosed: ['Go-To-Market (GTM) & Pricing Strategy', 'Executive Storytelling & Decision Memos'],
    difficulty: 'Advanced',
    estHours: 7,
    deliverables: [
      'Good / Better / Best pricing matrix tied to customer ROI value metrics',
      'Spreadsheet margin & payback period sensitivity model',
      'Sales & Customer Success GTM enablement one-pager + objection battlecard',
    ],
    whyRecruitersCare:
      'Signals commercial PM maturity—showing Ravi understands revenue, packaging, and cross-functional GTM beyond engineering execution.',
    status: 'suggested',
  },
  {
    id: 'proj-4',
    title: 'Edge-to-Cloud Telemetry API Spec & Offline Sync Trade-off Doc',
    problemStatement:
      'Remote industrial plants experience intermittent Wi-Fi, causing dropped sensor readings and false offline alerts. Spec an edge buffering + webhook retry architecture balancing battery life and alert latency.',
    skillsCovered: ['PRD Writing & Product Scoping', 'Cross-Functional Engineering Collaboration'],
    gapsClosed: ['PRD Writing & Product Scoping', 'Roadmap Prioritization Frameworks (RICE / Opportunity Sizing)'],
    difficulty: 'Intermediate',
    estHours: 5,
    deliverables: [
      'Technical PRD with JSON telemetry payload schema and retry state machine',
      'Trade-off matrix comparing MQTT vs. HTTP polling on battery, latency, and cost',
      'Engineering sprint breakdown with MVP vs. V2 cut line',
    ],
    whyRecruitersCare:
      'Directly positions Ravi for Technical PM roles at Verkada, Samsara, and Augury by turning his hardware roots into a technical product differentiator.',
    status: 'suggested',
  },
];

export const RAVI_DEMO_INTERVIEWS: InterviewSession[] = [
  {
    id: 'int-demo-1',
    date: '2026-11-12T17:30:00.000Z',
    type: 'behavioral',
    overallAverage: 3.4,
    weakAreas: ['evidence_and_metrics', 'depth'],
    completed: true,
    questions: [
      {
        id: 'q1',
        question: 'Tell me about a time you influenced engineers or stakeholders without direct authority to change a technical direction.',
        targetSkill: 'Cross-Functional Engineering Collaboration',
        answer:
          'At Apex Robotics, field failure rates were high on our thermal sensor line. Firmware thought it was a mechanical enclosure seal issue, while mechanical thought it was a firmware calibration bug. I pulled 140 RMA tickets and built a Python dashboard across 500 pilot units showing 68% of failures correlated with firmware sampling spikes during thermal cycling. We aligned on a joint fix that cut failures significantly.',
        evaluation: {
          scores: {
            structure: 3.8,
            relevance: 4.2,
            depth: 3.1,
            evidence_and_metrics: 3.0,
            communication: 3.6,
          },
          overall: 3.5,
          strengths: [
            'Strong real-world cross-functional conflict directly relevant to PM work',
            'Used data (Python dashboard + RMA logs) rather than opinion to align teams',
          ],
          weaknesses: [
            'Missed stating the exact before/after failure metric (4.8% to 1.6%) and timeline',
            'Could unpack the trade-off firmware had to make (e.g., delayed another sprint item)',
          ],
          improvedAnswerExample:
            'State the exact business stake upfront ("4.8% RMA rate costing $180K/yr"), detail the trade-off negotiation with the firmware lead to defer a low-priority feature, and close with the exact outcome ("dropped failures to 1.6% in two quarters").',
          followUpQuestion: 'What did the firmware team have to deprioritize to ship that fix, and how did you handle pushback from their manager?',
        },
      },
      {
        id: 'q2',
        question: 'Why are you pivoting from Mechanical Engineering into Product Management now?',
        targetSkill: 'Executive Storytelling & Decision Memos',
        answer:
          'I enjoyed engineering at Apex and Vertex, especially doing 22 plant walkthroughs with maintenance operators. I realized my favorite part wasn’t just CAD optimization—it was figuring out which customer problem was actually worth solving and aligning firmware, QA, and suppliers around the outcome. Product Management lets me own that problem-to-impact loop full time.',
        evaluation: {
          scores: {
            structure: 3.6,
            relevance: 4.0,
            depth: 3.0,
            evidence_and_metrics: 2.8,
            communication: 3.7,
          },
          overall: 3.3,
          strengths: [
            'Authentic narrative anchored in customer plant walkthroughs',
            'Avoids sounding like you are running away from engineering',
          ],
          weaknesses: [
            'Needs concrete proof of PM-adjacent ownership (metrics, specs, prioritization)',
            'Connect your hardware/IoT background explicitly to why you are uniquely valuable to target PM teams',
          ],
          improvedAnswerExample:
            'Anchor your pivot in 3 concrete moments: 22 plant discovery sessions, using telemetry to cut RMAs from 4.8% to 1.6%, and shipping a $420K BOM redesign—then bridge directly to why industrial/technical SaaS PM teams need builders who speak hardware and data.',
          followUpQuestion: 'What part of transitioning from an individual contributor engineer to a PM do you expect to be hardest in your first 90 days?',
        },
      },
    ],
  },
  {
    id: 'int-demo-2',
    date: '2026-11-18T18:15:00.000Z',
    type: 'role-specific',
    overallAverage: 3.9,
    weakAreas: ['evidence_and_metrics', 'depth'],
    completed: true,
    questions: [
      {
        id: 'q1',
        question: 'Activation for new industrial sensor installations dropped 11% after a mobile setup app update. How do you diagnose and respond?',
        targetSkill: 'SQL & Product Funnel Analytics',
        answer:
          'First I would verify tracking integrity and confirm how activation is defined (e.g. sensor paired and streaming telemetry for 24h). Next I would segment the 11% drop in SQL by app OS version, sensor hardware revision, and plant Wi-Fi vs cellular setup step. If drop-off spikes at Bluetooth pairing on Android after the update, I would work with mobile engineering to hotfix or roll back while tracking Day-7 active sensors as a guardrail.',
        evaluation: {
          scores: {
            structure: 4.3,
            relevance: 4.4,
            depth: 3.5,
            evidence_and_metrics: 3.4,
            communication: 4.1,
          },
          overall: 3.9,
          strengths: [
            'Clean structured flow: data sanity check -> definition -> funnel segmentation -> mitigation',
            'Smart inclusion of hardware revision & connectivity mode segments',
          ],
          weaknesses: [
            'Did not mention external factors (seasonality, major customer onboarding batch, firmware release overlap)',
            'Could specify exact quantitative threshold for triggering a rollback vs forward-fix',
          ],
          improvedAnswerExample:
            'Add a brief external-vs-internal check (new enterprise cohort or firmware push?) and quantify the decision rule: "If pairing failure exceeds 15% on the new app version affecting >20% of installs, roll back immediately within 2 hours while isolating the BLE regression."',
          followUpQuestion: 'What if the drop only affects smaller plants with fewer than 5 sensors—would you still roll back the entire release?',
        },
      },
    ],
  },
];

export const RAVI_DEMO_APPLICATIONS: ApplicationEntry[] = [
  {
    id: 'app-1',
    company: 'Augury',
    roleTitle: 'Product Manager, Machine Health',
    roleType: 'Technical PM',
    seniority: 'Mid',
    companySize: 'mid',
    source: 'referral',
    dateApplied: '2026-11-16',
    matchScore: 84,
    status: 'interview',
  },
  {
    id: 'app-2',
    company: 'Samsara',
    roleTitle: 'Product Manager, Connected Ops',
    roleType: 'Technical PM',
    seniority: 'Mid',
    companySize: 'mid',
    source: 'referral',
    dateApplied: '2026-11-14',
    matchScore: 82,
    status: 'interview',
  },
  {
    id: 'app-3',
    company: 'Verkada',
    roleTitle: 'Technical PM, IoT Sensors',
    roleType: 'Technical PM',
    seniority: 'Mid',
    companySize: 'mid',
    source: 'referral',
    dateApplied: '2026-11-11',
    matchScore: 81,
    status: 'screening',
  },
  {
    id: 'app-4',
    company: 'Procore',
    roleTitle: 'Associate Product Manager',
    roleType: 'APM',
    seniority: 'Entry',
    companySize: 'mid',
    source: 'cold email',
    dateApplied: '2026-11-10',
    matchScore: 76,
    status: 'screening',
  },
  {
    id: 'app-5',
    company: 'Motive',
    roleTitle: 'PM, Fleet Hardware',
    roleType: 'Technical PM',
    seniority: 'Mid',
    companySize: 'mid',
    source: 'referral',
    dateApplied: '2026-11-08',
    matchScore: 85,
    status: 'offer',
  },
  {
    id: 'app-6',
    company: 'Formlabs',
    roleTitle: 'Product Manager, Software',
    roleType: 'PM',
    seniority: 'Mid',
    companySize: 'mid',
    source: 'cold email',
    dateApplied: '2026-11-06',
    matchScore: 79,
    status: 'interview',
  },
  {
    id: 'app-7',
    company: 'Machina Labs',
    roleTitle: 'Product Manager, Robotics',
    roleType: 'PM',
    seniority: 'Mid',
    companySize: 'startup',
    source: 'cold email',
    dateApplied: '2026-11-05',
    matchScore: 74,
    status: 'rejected',
  },
  {
    id: 'app-8',
    company: 'Amazon',
    roleTitle: 'Product Manager, Devices',
    roleType: 'PM',
    seniority: 'Mid',
    companySize: 'large',
    source: 'LinkedIn',
    dateApplied: '2026-11-03',
    matchScore: 63,
    status: 'no response',
  },
  {
    id: 'app-9',
    company: 'Google',
    roleTitle: 'Product Manager, Nest',
    roleType: 'PM',
    seniority: 'Senior',
    companySize: 'large',
    source: 'LinkedIn',
    dateApplied: '2026-11-01',
    matchScore: 58,
    status: 'no response',
  },
  {
    id: 'app-10',
    company: 'Honeywell',
    roleTitle: 'Product Manager, Connected Plant',
    roleType: 'PM',
    seniority: 'Senior',
    companySize: 'large',
    source: 'careers page',
    dateApplied: '2026-10-29',
    matchScore: 69,
    status: 'no response',
  },
  {
    id: 'app-11',
    company: 'Linear',
    roleTitle: 'Product Manager, Workflows',
    roleType: 'PM',
    seniority: 'Mid',
    companySize: 'startup',
    source: 'LinkedIn',
    dateApplied: '2026-10-27',
    matchScore: 52,
    status: 'no response',
  },
  {
    id: 'app-12',
    company: 'Cisco',
    roleTitle: 'Product Analyst, Meraki IoT',
    roleType: 'Product Analyst',
    seniority: 'Entry',
    companySize: 'large',
    source: 'careers page',
    dateApplied: '2026-10-25',
    matchScore: 67,
    status: 'applied',
  },
];

export const RAVI_DEMO_READINESS_HISTORY: ReadinessHistoryPoint[] = [
  { date: '2026-11-01', label: 'Baseline', score: 48, completionRate: 0 },
  { date: '2026-11-08', label: 'Week 1', score: 55, completionRate: 100 },
  { date: '2026-11-15', label: 'Week 2', score: 62, completionRate: 83 },
];

export const RAVI_DEMO_PROGRESS_LOGS: ProgressLog[] = [
  {
    id: 'log-w2',
    date: '2026-11-15T19:00:00.000Z',
    weekNumber: 2,
    tasksCompletedCount: 2,
    totalTasksCount: 3,
    hoursSpent: 7.5,
    skillConfidence: {
      'PRD Writing & Product Scoping': 3,
      'A/B Testing & Experimentation Design': 2,
      'SQL & Product Funnel Analytics': 3,
      'Go-To-Market (GTM) & Pricing Strategy': 2,
    },
    blockers: 'Ran out of time on the Mixpanel event tracking plan; felt shaky quantifying metrics in mock interview.',
    newReadinessScore: 62,
    planChanges: [
      {
        type: 'added',
        description: 'Added a 1-hour Role-Specific Mock Interview drill in Week 3 focused on metric thresholds and guardrails.',
        reason: 'Latest Mock Interview flagged evidence_and_metrics (3.4/5) and depth (3.5/5) as your lowest rubric dimensions.',
      },
      {
        type: 'reordered',
        description: 'Moved A/B hypothesis calculation ahead of GTM pricing so experimentation pairs with your active Predictive Alert PRD.',
        reason: 'A/B Testing had low self-reported confidence (2/5) and carries 86/100 JD importance.',
      },
      {
        type: 'extended',
        description: 'Trimmed Week 3 reading from 3.5h to 2.5h so you can wrap the unfinished Mixpanel taxonomy within your 8 hr/week cap.',
        reason: 'Actual velocity was 7.5 hrs/week in Week 2 with 1 unfinished task.',
      },
    ],
  },
];

export const RAVI_DEMO_APP_INSIGHTS: ApplicationInsights = {
  insights: [
    'Referrals convert at a 100% response rate (4/4) compared to 0% on cold LinkedIn applications (0/3) — warm outreach is your single highest-leverage multiplier.',
    'Mid-size companies (100% response rate across 6 applications) dramatically outperform large enterprises (0% across 4 applications), where automated ATS filters penalize non-traditional titles.',
    'Applications with 80%+ JD match score achieved a 100% interview/offer progression rate, versus 0% for sub-65% matches.',
    'Technical PM roles anchored in IoT/hardware-to-cloud domains convert significantly better than generic B2B SaaS PM postings.',
  ],
  recommendedFocus:
    'Double down on referral-backed Technical PM roles at mid-size IoT/Connected Operations companies where your match score is 75%+, and stop cold-applying to large enterprise PM listings via LinkedIn.',
  suggestedChanges: [
    'Prioritize Technical PRD + API Telemetry projects to push Verkada/Samsara/Augury match scores above 85%.',
    'Shift 2 hours/week from generic job board browsing to warm alumni/hiring-manager outreach paired with a 1-page product teardown.',
    'Focus mock interview practice on hardware-to-cloud diagnostics and ROI trade-offs typical of mid-size IoT PM loops.',
  ],
  generatedAt: '2026-11-18T12:00:00.000Z',
};

// Cached fallback responses for Demo Mode
export function getDemoBulletRewrites(bullet: string, targetRole: string): BulletRewriteResponse {
  return {
    originalBullet: bullet,
    rewrites: [
      {
        angle: 'Outcome & Business Impact',
        rewrittenBullet: `Drove end-to-end product redesign across 3 flagship IoT lines, cutting unit BOM cost by 18% ($420K/yr margin expansion) while accelerating deployment speed by 24%.`,
        rationale: `Reframes mechanical engineering work into P&L margin impact and customer deployment velocity valued by ${targetRole} hiring managers.`,
      },
      {
        angle: 'Cross-Functional Product Ownership',
        rewrittenBullet: `Owned cross-functional roadmap trade-offs across firmware, QA, and field ops—synthesizing 140+ customer pain points to slash field defect rates from 4.8% to 1.6% in 2 quarters.`,
        rationale: `Highlights stakeholder alignment, customer insight synthesis, and measurable quality KPIs without fabricating facts.`,
      },
      {
        angle: 'ATS Keyword Optimized',
        rewrittenBullet: `Leveraged telemetry analytics (Python/SQL) across 500+ pilot deployments to prioritize engineering backlog initiatives, reducing pre-launch validation cycles by 71%.`,
        rationale: `Front-loads high-frequency ${targetRole} ATS keywords (telemetry analytics, backlog prioritization, launch velocity).`,
      },
    ],
  };
}

export function getDemoInterviewQuestions(type: InterviewType): InterviewQuestionItem[] {
  if (type === 'behavioral') {
    return [
      {
        id: 'bq-1',
        question: 'Tell me about a time you used data to change a skeptical engineering team’s priority.',
        targetSkill: 'Cross-Functional Engineering Collaboration',
        answer: '',
      },
      {
        id: 'bq-2',
        question: 'Describe a customer discovery insight that surprised you and reshaped a product or design requirement.',
        targetSkill: 'Customer Discovery & Field Synthesis',
        answer: '',
      },
      {
        id: 'bq-3',
        question: 'Tell me about a high-stakes launch that went off track. How did you triage scope and communicate trade-offs?',
        targetSkill: 'Executive Storytelling & Decision Memos',
        answer: '',
      },
      {
        id: 'bq-4',
        question: 'Why are you pivoting from Mechanical Engineering to Product Management, and what edge does your background give you?',
        targetSkill: 'Executive Storytelling & Decision Memos',
        answer: '',
      },
      {
        id: 'bq-5',
        question: 'Tell me about a time you had to say no to a vocal stakeholder or customer request.',
        targetSkill: 'Roadmap Prioritization Frameworks (RICE / Opportunity Sizing)',
        answer: '',
      },
    ];
  }
  if (type === 'case/technical') {
    return [
      {
        id: 'cq-1',
        question: 'Our industrial IoT sensors lose Wi-Fi in underground plants for up to 4 hours. How would you scope an offline buffering & sync feature with firmware and cloud engineers?',
        targetSkill: 'PRD Writing & Product Scoping',
        answer: '',
      },
      {
        id: 'cq-2',
        question: 'You have engineering capacity for either a 20% alert-latency reduction OR a self-serve onboarding wizard. How do you size both opportunities and decide?',
        targetSkill: 'Roadmap Prioritization Frameworks (RICE / Opportunity Sizing)',
        answer: '',
      },
      {
        id: 'cq-3',
        question: 'Design an A/B experiment to test a new machine-learning anomaly alert threshold without risking missed critical equipment failures.',
        targetSkill: 'A/B Testing & Experimentation Design',
        answer: '',
      },
      {
        id: 'cq-4',
        question: 'Write out the SQL logic and funnel metrics you would track to find where new fleet customers drop off during Day-1 to Day-14 sensor onboarding.',
        targetSkill: 'SQL & Product Funnel Analytics',
        answer: '',
      },
      {
        id: 'cq-5',
        question: 'Leadership wants to launch a premium predictive-maintenance SaaS tier on top of existing hardware. How do you structure pricing and GTM rollout?',
        targetSkill: 'Go-To-Market (GTM) & Pricing Strategy',
        answer: '',
      },
    ];
  }
  return [
    {
      id: 'rq-1',
      question: 'Activation for new connected sensor workspaces dropped 9% week-over-week after a mobile onboarding redesign. Walk me through your diagnosis.',
      targetSkill: 'SQL & Product Funnel Analytics',
      answer: '',
    },
    {
      id: 'rq-2',
      question: 'Design a mobile alert-triage experience for plant maintenance technicians who wear gloves and have noisy shop floors.',
      targetSkill: 'UX Wireframing & Usability Validation',
      answer: '',
    },
    {
      id: 'rq-3',
      question: 'What North Star metric and 3 guardrail metrics would you choose for an industrial IoT machine-health platform?',
      targetSkill: 'A/B Testing & Experimentation Design',
      answer: '',
    },
    {
      id: 'rq-4',
      question: 'How would you write a 1-page PRD to convince skeptical enterprise IT buyers to adopt cloud firmware updates?',
      targetSkill: 'PRD Writing & Product Scoping',
      answer: '',
    },
    {
      id: 'rq-5',
      question: 'A major customer threatens to churn unless you build a custom CSV export that isn’t on the roadmap. What do you do?',
      targetSkill: 'Roadmap Prioritization Frameworks (RICE / Opportunity Sizing)',
      answer: '',
    },
  ];
}

export function getDemoAnswerEvaluation(answer: string): AnswerEvaluation {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  const hasNumbers = /\d+%|\$\d+|\d+\s*(days|weeks|months|users|units|hours)/i.test(answer);
  const base = words > 45 ? 4.0 : words > 20 ? 3.5 : 2.8;
  const metricsScore = hasNumbers ? Math.min(4.5, base + 0.4) : Math.max(2.4, base - 0.8);
  const scores = {
    structure: Number(Math.min(5, base + 0.2).toFixed(1)),
    relevance: Number(Math.min(5, base + 0.3).toFixed(1)),
    depth: Number(Math.max(2.5, base - 0.3).toFixed(1)),
    evidence_and_metrics: Number(metricsScore.toFixed(1)),
    communication: Number(Math.min(5, base + 0.1).toFixed(1)),
  };
  const overall = Number(
    (
      (scores.structure +
        scores.relevance +
        scores.depth +
        scores.evidence_and_metrics +
        scores.communication) /
      5
    ).toFixed(1)
  );
  return {
    scores,
    overall,
    strengths: [
      'Addresses the prompt directly with a logical step-by-step progression.',
      'Shows practical awareness of real-world operational constraints.',
    ],
    weaknesses: [
      hasNumbers
        ? 'Push deeper on explicit trade-offs and second-order risks (e.g., engineering opportunity cost).'
        : 'Missing concrete quantitative metrics, guardrails, or measurable success thresholds.',
      'State your recommendation or decision rule explicitly in the final 20 seconds.',
    ],
    improvedAnswerExample:
      'Open with a 1-sentence thesis and metric definition, structure your reasoning into 3 crisp buckets (User Segment -> Hypothesis -> Trade-off), quantify your target lift and guardrail metric (e.g., "+8% Day-7 activation with <0.5% increase in false alerts"), and close with a clear next milestone.',
    followUpQuestion:
      'If your top guardrail metric degrades by 2% during the rollout while primary activation improves by 6%, what exact decision criteria would you use to ship or revert?',
  };
}

export function getDemoWeeklyCheckInUpdate(
  currentGapMap: GapMap,
  currentRoadmap: Roadmap,
  weekNumber: number,
  skillConfidence: Record<string, number>,
  hoursSpent: number,
  blockers: string
): {
  updatedSkillLevels: { skillName: string; newUserLevel: number }[];
  newReadinessScore: number;
  planChanges: PlanChange[];
  updatedRoadmap: Roadmap;
} {
  const updatedSkillLevels = currentGapMap.skills.map((skill) => {
    const conf = skillConfidence[skill.name] ?? 3;
    const delta = conf >= 4 ? 7 : conf === 3 ? 4 : 2;
    return {
      skillName: skill.name,
      newUserLevel: Math.min(95, Math.round(skill.userLevel + delta)),
    };
  });

  const newReadinessScore = Math.min(96, Math.round(currentGapMap.readinessScore + (hoursSpent >= 6 ? 5 : 2)));

  const planChanges: PlanChange[] = [
    {
      type: 'added',
      description: `Inserted a focused 1.5h metric-storytelling & guardrail drill into Week ${Math.min(weekNumber + 1, currentRoadmap.weeks.length)}.`,
      reason: 'Recent mock interview rubric flagged evidence_and_metrics and trade-off depth below 3.8/5.',
    },
    {
      type: 'reordered',
      description: `Prioritized lowest-confidence high-importance skills ahead of lower-gap reading tasks in upcoming weeks.`,
      reason: 'Weekly confidence sliders highlighted remaining gaps in experimentation and pricing strategy.',
    },
    {
      type: 'extended',
      description: blockers.trim()
        ? `Rebalanced Week ${Math.min(weekNumber + 1, currentRoadmap.weeks.length)} task durations to unblock: "${blockers.trim().slice(0, 72)}"`
        : `Smoothed task load across Week ${Math.min(weekNumber + 1, currentRoadmap.weeks.length)} to match your actual ${hoursSpent}h weekly pace.`,
      reason: `Keeps your roadmap strictly within your weekly capacity while protecting project momentum.`,
    },
  ];

  const nextWeekIdx = currentRoadmap.weeks.findIndex((w) => w.weekNumber === weekNumber + 1);
  const updatedWeeks = currentRoadmap.weeks.map((week, idx) => {
    if (idx !== nextWeekIdx) return week;
    const extraTaskExists = week.tasks.some((t) => t.id.startsWith('adapt-'));
    if (extraTaskExists) return week;
    const trimmedTasks = week.tasks.map((t, ti) =>
      ti === 0 && t.estHours > 1.5 ? { ...t, estHours: Number((t.estHours - 1).toFixed(1)) } : t
    );
    return {
      ...week,
      tasks: [
        ...trimmedTasks,
        {
          id: `adapt-w${week.weekNumber}-${Date.now()}`,
          title: 'Targeted Rubric Drill: Quantify Metrics & Trade-Off Guardrails',
          type: 'interview' as const,
          estHours: 1,
          skillsTargeted: ['A/B Testing & Experimentation Design', 'Executive Storytelling & Decision Memos'],
          resourceSuggestion: 'PivotPilot Mock Interview (focus on evidence_and_metrics >= 4.0)',
          completed: false,
        },
      ],
    };
  });

  return {
    updatedSkillLevels,
    newReadinessScore,
    planChanges,
    updatedRoadmap: {
      ...currentRoadmap,
      weeks: updatedWeeks,
      generatedAt: new Date().toISOString(),
    },
  };
}
