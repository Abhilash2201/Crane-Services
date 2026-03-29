import { useParams } from "react-router-dom";
import type { Job } from "../types";
import { ActiveJobScreen } from "../screens/ActiveJobScreen";

type Props = {
  online: boolean;
  isOffline: boolean;
  jobs: Job[];
  onToggleOnline: () => void;
  onReached: (jobId: string) => void;
  onStarted: (jobId: string, internalJobId?: string) => void;
  onUpload: (jobId: string, internalJobId?: string, files?: File[]) => Promise<void>;
  onComplete: (jobId: string, internalJobId?: string) => void;
};

export function ActiveJobRoute({
  online,
  isOffline,
  jobs,
  onToggleOnline,
  onReached,
  onStarted,
  onUpload,
  onComplete,
}: Props) {
  const { jobId } = useParams();
  const job = jobId ? jobs.find((j) => j.id === jobId) : jobs[0];
  return (
    <ActiveJobScreen
      online={online}
      isOffline={isOffline}
      job={job}
      onToggleOnline={onToggleOnline}
      onReached={onReached}
      onStarted={onStarted}
      onUpload={onUpload}
      onComplete={onComplete}
    />
  );
}
