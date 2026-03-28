import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Job } from "../../types";
import { ScreenWithNav } from "../../components/ScreenWithNav";
import { Action, Card, SafeArea } from "../../styles/shared";
import { TabBtn, TabRow } from "./styles";

type Props = {
  jobs: Job[];
  onRefresh?: () => void;
};

export function JobsScreen({ jobs, onRefresh }: Props) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"assigned" | "completed">("assigned");
  const filtered = jobs.filter((j) =>
    tab === "assigned"
      ? j.status === "assigned" || j.status === "in_progress"
      : j.status === "completed",
  );

  return (
    <ScreenWithNav active="jobs">
      <SafeArea>
        <TabRow>
          <TabBtn
            $active={tab === "assigned"}
            onClick={() => setTab("assigned")}
          >
            Assigned
          </TabBtn>
          <TabBtn
            $active={tab === "completed"}
            onClick={() => setTab("completed")}
          >
            Completed
          </TabBtn>
        </TabRow>
        {onRefresh ? (
          <Action style={{ marginBottom: 6 }} onClick={onRefresh}>
            Refresh Jobs
          </Action>
        ) : null}
        {filtered.map((job) => {
          const jobKey = job.id || job.jobId || job.requestId;
          return (
            <Card
              key={jobKey}
              style={{ cursor: tab === "assigned" ? "pointer" : "default" }}
              onClick={() => {
                if (tab !== "assigned" || !jobKey) return;
                navigate(`/active-job/${jobKey}`);
              }}
            >
              <strong>{jobKey || "Job"}</strong>
              <p style={{ margin: "4px 0" }}>{job.location}</p>
              <small style={{ color: "#64748B" }}>
                {job.variant} | ₹{job.amount.toLocaleString("en-IN")}
              </small>
              {tab === "assigned" ? (
                <Action
                  style={{ marginTop: 8 }}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!jobKey) return;
                    navigate(`/active-job/${jobKey}`);
                  }}
                >
                  Open Job
                </Action>
              ) : null}
            </Card>
          );
        })}
      </SafeArea>
    </ScreenWithNav>
  );
}
