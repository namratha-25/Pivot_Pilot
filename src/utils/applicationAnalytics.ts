import type { ApplicationEntry, SegmentGroupStats, SegmentStat } from '../types';

const MIN_SAMPLE = 3;

export function isResponseStatus(status: ApplicationEntry['status']): boolean {
  // Any status beyond applied / no response
  return status !== 'applied' && status !== 'no response';
}

export function isPositiveStatus(status: ApplicationEntry['status']): boolean {
  return status === 'screening' || status === 'interview' || status === 'offer';
}

export function getMatchScoreBand(score: number): string {
  if (score >= 80) return '80%+ High Match';
  if (score >= 65) return '65–79% Mid Match';
  return '<65% Low Match';
}

function computeGroup(
  apps: ApplicationEntry[],
  dimension: SegmentGroupStats['dimension'],
  label: string,
  extractor: (app: ApplicationEntry) => string
): SegmentGroupStats {
  const buckets = new Map<string, { total: number; responses: number; positiveResponses: number }>();

  apps.forEach((app) => {
    const key = extractor(app) || 'Unknown';
    const curr = buckets.get(key) ?? { total: 0, responses: 0, positiveResponses: 0 };
    curr.total += 1;
    if (isResponseStatus(app.status)) curr.responses += 1;
    if (isPositiveStatus(app.status)) curr.positiveResponses += 1;
    buckets.set(key, curr);
  });

  const items: SegmentStat[] = Array.from(buckets.entries())
    .map(([segment, data]) => ({
      segment,
      total: data.total,
      responses: data.responses,
      positiveResponses: data.positiveResponses,
      responseRate: data.total > 0 ? Math.round((data.responses / data.total) * 100) : 0,
      meetsMinSample: data.total >= MIN_SAMPLE,
    }))
    .sort((a, b) => b.responseRate - a.responseRate || b.total - a.total);

  const eligible = items.filter((item) => item.meetsMinSample);
  let bestSegment: SegmentStat | null = null;
  let worstSegment: SegmentStat | null = null;

  if (eligible.length >= 2) {
    bestSegment = eligible[0];
    worstSegment = eligible[eligible.length - 1];
    if (bestSegment.responseRate === worstSegment.responseRate) {
      bestSegment = null;
      worstSegment = null;
    }
  } else if (eligible.length === 1) {
    bestSegment = eligible[0];
  }

  return {
    dimension,
    label,
    items,
    bestSegment,
    worstSegment,
  };
}

export function computeApplicationAnalytics(apps: ApplicationEntry[]): {
  total: number;
  responses: number;
  overallResponseRate: number;
  interviewOrOfferCount: number;
  avgMatchScore: number;
  groups: SegmentGroupStats[];
} {
  const total = apps.length;
  const responses = apps.filter((a) => isResponseStatus(a.status)).length;
  const interviewOrOfferCount = apps.filter((a) => a.status === 'interview' || a.status === 'offer').length;
  const overallResponseRate = total > 0 ? Math.round((responses / total) * 100) : 0;
  const avgMatchScore =
    total > 0 ? Math.round(apps.reduce((sum, a) => sum + a.matchScore, 0) / total) : 0;

  const groups: SegmentGroupStats[] = [
    computeGroup(apps, 'source', 'Application Source', (a) => a.source),
    computeGroup(apps, 'companySize', 'Company Size', (a) =>
      a.companySize === 'startup' ? 'Startup' : a.companySize === 'mid' ? 'Mid-Size' : 'Large Enterprise'
    ),
    computeGroup(apps, 'roleType', 'Role Type', (a) => a.roleType),
    computeGroup(apps, 'seniority', 'Seniority', (a) => a.seniority),
    computeGroup(apps, 'matchBand', 'Match Score Band', (a) => getMatchScoreBand(a.matchScore)),
  ];

  return {
    total,
    responses,
    overallResponseRate,
    interviewOrOfferCount,
    avgMatchScore,
    groups,
  };
}
