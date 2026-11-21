import type { Roadmap } from '../types';

function formatIcsDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export function exportRoadmapToIcs(roadmap: Roadmap, targetRole: string): void {
  const now = new Date();
  // Start next Monday at 18:00 UTC (evening study slot)
  const dayOfWeek = now.getUTCDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  const startMonday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday, 18, 0, 0)
  );

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PivotPilot//AI Career Pivot Coach//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:PivotPilot — ${escapeIcsText(targetRole || 'Career Pivot')} Roadmap`,
  ];

  const dtStamp = formatIcsDate(now);

  roadmap.weeks.forEach((week) => {
    const weekStart = new Date(startMonday.getTime() + (week.weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
    const taskCount = Math.max(week.tasks.length, 1);

    week.tasks.forEach((task, index) => {
      // Spread tasks across Monday-Saturday of that week
      const dayOffset = Math.min(Math.floor((index * 6) / taskCount), 6);
      const startDate = new Date(weekStart.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const safeHours = Math.max(Number(task.estHours) || 1, 0.5);
      const durationMs = safeHours * 60 * 60 * 1000;
      const endDate = new Date(startDate.getTime() + durationMs);

      const summary = `[Wk ${week.weekNumber} · ${task.type.toUpperCase()}] ${task.title}`;
      const description = [
        `Week ${week.weekNumber} Theme: ${week.theme}`,
        `Estimated Hours: ${safeHours}h`,
        `Skills Targeted: ${task.skillsTargeted.join(', ')}`,
        `Suggested Resource: ${task.resourceSuggestion}`,
        `Week Milestone: ${week.milestone}`,
      ].join('\n');

      const safeTaskId = String(task.id || `task-${index}`).replace(/[^a-zA-Z0-9_-]/g, '_');

      lines.push(
        'BEGIN:VEVENT',
        `UID:pivotpilot-w${week.weekNumber}-${safeTaskId}@pivotpilot.app`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${formatIcsDate(startDate)}`,
        `DTEND:${formatIcsDate(endDate)}`,
        `SUMMARY:${escapeIcsText(summary)}`,
        `DESCRIPTION:${escapeIcsText(description)}`,
        'END:VEVENT'
      );
    });
  });

  lines.push('END:VCALENDAR');

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeFileName = (targetRole || 'Pivot').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.download = `PivotPilot_Roadmap_${safeFileName}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
