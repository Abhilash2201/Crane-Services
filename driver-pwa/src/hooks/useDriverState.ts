import { useEffect, useState } from "react";
import type { DriverState, Job } from "../types";

const STORAGE_KEY = "cranehub_driver_state_v1";
const seedJobs: Job[] = [];

function loadState(): DriverState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        isLoggedIn: false,
        user: null,
        online: true,
        dismissedInstall: false,
        jobs: seedJobs,
        lastTrackingAt: null,
      };
    }
    return JSON.parse(raw) as DriverState;
  } catch {
    return {
      isLoggedIn: false,
      user: null,
      online: true,
      dismissedInstall: false,
      jobs: seedJobs,
      lastTrackingAt: null,
    };
  }
}

function saveState(state: DriverState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useDriverState() {
  const [state, setState] = useState<DriverState>(() => loadState());

  // Persist driver session + job cache so the PWA can resume quickly.
  useEffect(() => saveState(state), [state]);

  return { state, setState };
}
