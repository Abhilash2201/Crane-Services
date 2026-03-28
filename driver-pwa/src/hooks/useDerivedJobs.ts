import { useMemo } from "react";
import type { Job } from "../types";

export function useDerivedJobs(jobs: Job[]) {
  return useMemo(() => {
    const active = jobs.find(
      (j) => j.status === "in_progress" || j.status === "assigned",
    );
    const newest = jobs.find((j) => j.status === "new");
    const completed = jobs.filter((j) => j.status === "completed");
    const todaysEarnings = completed.reduce((sum, j) => sum + j.amount, 0);
    return { active, newest, completed, todaysEarnings };
  }, [jobs]);
}
