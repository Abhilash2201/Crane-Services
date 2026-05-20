import { BellRing } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Job } from "../../types";
import { sid } from "../../lib/sid";
import { ScreenWithNav } from "../../components/ScreenWithNav";
import { Action, Card, SafeArea } from "../../styles/shared";
import { MapBox, NotifyBanner } from "./styles";

type Props = {
  online: boolean;
  isOffline: boolean;
  job?: Job;
  onAccept: (jobId: string, internalJobId?: string) => void;
  onReject: (jobId: string, internalJobId?: string) => void;
};

export function JobAlertScreen({
  online,
  isOffline,
  job,
  onAccept,
  onReject,
}: Props) {
  const navigate = useNavigate();
  if (!job) {
    return (
      <ScreenWithNav active="jobs">
        <SafeArea>
          <Card>No new assignments right now.</Card>
        </SafeArea>
      </ScreenWithNav>
    );
  }

  const disabled = !online || isOffline;
  return (
    <ScreenWithNav active="jobs">
      <SafeArea>
        <NotifyBanner>
          <BellRing size={16} />
          New Assignment Nearby ({job.distanceKm} km)
        </NotifyBanner>
        <Card>
          <h3 style={{ margin: "0 0 6px", fontFamily: "monospace" }}>
            {job.requestRefId ?? `REQ-${sid(job.id)}`}
          </h3>
          <p style={{ margin: "4px 0" }}>
            <b>Variant:</b> {job.variant} ({job.capacity})
          </p>
          <p style={{ margin: "4px 0" }}>
            <b>Customer:</b> {job.customer} | {job.mobile}
          </p>
          <p style={{ margin: "4px 0" }}>
            <b>Location:</b> {job.location}
          </p>
          <p style={{ margin: "4px 0" }}>
            <b>Schedule:</b> {job.schedule}
          </p>
          <p style={{ margin: "4px 0" }}>
            <b>Load:</b> {job.load}
          </p>
          <MapBox>Map snippet</MapBox>
        </Card>
        <Action
          $tone="success"
          disabled={disabled}
          onClick={() => {
            onAccept(job.id, job.jobId);
            navigate("/active-job");
          }}
        >
          Accept Job
        </Action>
        <Action
          $tone="danger"
          disabled={disabled}
          onClick={() => {
            onReject(job.id, job.jobId);
            navigate("/home");
          }}
        >
          Reject
        </Action>
        {disabled ? (
          <small style={{ color: "#b45309" }}>
            Go online to respond to new jobs.
          </small>
        ) : null}
      </SafeArea>
    </ScreenWithNav>
  );
}
