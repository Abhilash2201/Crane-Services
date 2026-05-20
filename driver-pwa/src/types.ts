export type JobStatus = "new" | "assigned" | "in_progress" | "completed" | "rejected";

export type Job = {
  id: string;
  requestId?: string;
  jobId?: string;
  jobRefId?: string;
  requestRefId?: string;
  variant: string;
  capacity: string;
  customer: string;
  mobile: string;
  location: string;
  distanceKm: number;
  schedule: string;
  load: string;
  amount: number;
  status: JobStatus;
  reached: boolean;
  started: boolean;
  proofCount: number;
};

export type DriverState = {
  isLoggedIn: boolean;
  user: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    location_address?: string;
  } | null;
  online: boolean;
  dismissedInstall: boolean;
  jobs: Job[];
  lastTrackingAt?: string | null;
};
