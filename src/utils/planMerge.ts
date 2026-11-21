import type { PortfolioProject, Roadmap, RoadmapTask, RoadmapWeek } from '../types';

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

/**
 * Merges a regenerated roadmap with the existing roadmap instead of replacing it:
 * - Weeks before `currentWeek` are kept verbatim from the existing roadmap.
 * - Weeks >= `currentWeek` come from the new roadmap, with `completed` restored by task `id`.
 * - Any existing roadmap tasks that have a `projectId` are preserved in their week
 *   (or placed in the last week if the new plan has fewer weeks).
 */
export function mergeRoadmap(
  existing: Roadmap | null,
  incoming: Roadmap,
  currentWeek: number
): Roadmap {
  if (!existing || existing.weeks.length === 0) {
    return incoming;
  }

  // 1. Keep weeks before currentWeek verbatim
  const pastWeeks: RoadmapWeek[] = existing.weeks
    .filter((w) => w.weekNumber < currentWeek)
    .map((w) => ({
      ...w,
      goals: [...w.goals],
      tasks: w.tasks.map((t) => ({ ...t, skillsTargeted: [...t.skillsTargeted] })),
    }));

  // Build task completion lookup across existing roadmap
  const completedById = new Map<string, boolean>();
  existing.weeks.forEach((w) => {
    w.tasks.forEach((t) => {
      completedById.set(t.id, t.completed);
    });
  });

  // Collect project-linked tasks from existing weeks >= currentWeek
  const projectTasksByWeek = new Map<number, RoadmapTask[]>();
  existing.weeks
    .filter((w) => w.weekNumber >= currentWeek)
    .forEach((w) => {
      const projTasks = w.tasks
        .filter((t) => Boolean(t.projectId))
        .map((t) => ({ ...t, skillsTargeted: [...t.skillsTargeted] }));
      if (projTasks.length > 0) {
        projectTasksByWeek.set(w.weekNumber, projTasks);
      }
    });

  // 2. For weeks >= currentWeek, take incoming weeks and restore `completed` by task id
  const incomingLaterWeeks: RoadmapWeek[] = incoming.weeks
    .filter((w) => w.weekNumber >= currentWeek)
    .map((w) => {
      const restoredTasks = w.tasks.map((t) => ({
        ...t,
        skillsTargeted: [...t.skillsTargeted],
        completed: completedById.has(t.id) ? completedById.get(t.id)! : t.completed,
      }));

      // Retain project-linked tasks belonging to this week
      const preservedProjTasks = projectTasksByWeek.get(w.weekNumber) ?? [];
      projectTasksByWeek.delete(w.weekNumber);

      const mergedTasks = [...restoredTasks];
      preservedProjTasks.forEach((pt) => {
        const alreadyPresent = mergedTasks.some(
          (t) => t.id === pt.id || (pt.projectId && t.projectId === pt.projectId)
        );
        if (!alreadyPresent) {
          mergedTasks.push(pt);
        }
      });

      return {
        ...w,
        goals: [...w.goals],
        tasks: mergedTasks,
      };
    });

  // 3. Preserve any remaining project-linked tasks whose original week exceeds the new plan length
  const leftoverProjTasks: RoadmapTask[] = [];
  projectTasksByWeek.forEach((tasks) => {
    leftoverProjTasks.push(...tasks);
  });

  if (leftoverProjTasks.length > 0) {
    if (incomingLaterWeeks.length > 0) {
      const lastWeek = incomingLaterWeeks[incomingLaterWeeks.length - 1];
      leftoverProjTasks.forEach((pt) => {
        const alreadyPresent = lastWeek.tasks.some(
          (t) => t.id === pt.id || (pt.projectId && t.projectId === pt.projectId)
        );
        if (!alreadyPresent) {
          lastWeek.tasks.push(pt);
        }
      });
    } else {
      // Fallback: if incoming had no weeks >= currentWeek, retain existing weeks holding project tasks
      existing.weeks
        .filter((w) => w.weekNumber >= currentWeek && w.tasks.some((t) => Boolean(t.projectId)))
        .forEach((w) => {
          incomingLaterWeeks.push({
            ...w,
            goals: [...w.goals],
            tasks: w.tasks
              .filter((t) => Boolean(t.projectId))
              .map((t) => ({ ...t, skillsTargeted: [...t.skillsTargeted] })),
          });
        });
    }
  }

  const combinedWeeks = [...pastWeeks, ...incomingLaterWeeks].sort(
    (a, b) => a.weekNumber - b.weekNumber
  );

  return {
    ...incoming,
    weeks: combinedWeeks,
  };
}

/**
 * Merges regenerated portfolio projects with existing projects:
 * - Carries over `status` (and original `id` so roadmap `projectId` links stay intact)
 *   for any incoming project matching an existing project by `id` or normalized `title`.
 * - Keeps any unmatched existing projects whose status is `in_progress` or `completed`.
 */
export function mergeProjects(
  existing: PortfolioProject[],
  incoming: PortfolioProject[]
): PortfolioProject[] {
  if (!existing || existing.length === 0) {
    return incoming;
  }

  const matchedExistingIds = new Set<string>();

  const mergedIncoming = incoming.map((newProj) => {
    const normNewTitle = normalizeTitle(newProj.title);
    const match = existing.find(
      (oldProj) =>
        oldProj.id === newProj.id || normalizeTitle(oldProj.title) === normNewTitle
    );

    if (match) {
      matchedExistingIds.add(match.id);
      return {
        ...newProj,
        id: match.id,
        status: match.status,
      };
    }

    return newProj;
  });

  const keptActiveOrDone = existing.filter(
    (oldProj) =>
      !matchedExistingIds.has(oldProj.id) &&
      (oldProj.status === 'in_progress' || oldProj.status === 'completed')
  );

  return [...keptActiveOrDone, ...mergedIncoming];
}
