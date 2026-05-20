import { ArrowRight, Briefcase, CheckCircle2, IndianRupee, Lock, MapPin, RefreshCw, Truck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Job } from "../../types";
import { sid } from "../../lib/sid";
import { ScreenWithNav } from "../../components/ScreenWithNav";
import {
  Body,
  EarningsBadge,
  EmptyState,
  Header,
  HeaderName,
  HeaderSub,
  HeaderTitle,
  IdPill,
  JobCard,
  JobCardBody,
  JobCardHeader,
  JobField,
  JobFieldIcon,
  JobFieldLabel,
  JobFieldValue,
  LockedBadge,
  OpenBtn,
  RefreshBtn,
  SectionLabel,
  StatusPill,
  TabBtn,
  TabRow,
} from "./styles";

type Props = {
  jobs: Job[];
  onRefresh?: () => void;
};

function fmtStatus(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function JobsScreen({ jobs, onRefresh }: Props) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"assigned" | "completed">("assigned");

  const activeJob = jobs.find(
    (j) => j.status === "in_progress" || j.status === "assigned",
  );

  const assignedJobs = jobs.filter(
    (j) => j.status === "assigned" || j.status === "in_progress",
  );
  const completedJobs = jobs.filter((j) => j.status === "completed");
  const filtered = tab === "assigned" ? assignedJobs : completedJobs;

  const totalEarnings = completedJobs.reduce((sum, j) => sum + j.amount, 0);

  return (
    <ScreenWithNav active="jobs">
      {/* ── Header ─────────────────────────────────── */}
      <Header>
        <div>
          <HeaderTitle>CraneHub Driver</HeaderTitle>
          <HeaderName>My Jobs</HeaderName>
          <HeaderSub>
            {assignedJobs.length} active · {completedJobs.length} completed
          </HeaderSub>
        </div>
        {onRefresh ? (
          <RefreshBtn onClick={onRefresh} aria-label="Refresh">
            <RefreshCw size={16} />
          </RefreshBtn>
        ) : null}
      </Header>

      {/* ── Body ───────────────────────────────────── */}
      <Body>
        {/* ── Tab bar ── */}
        <TabRow>
          <TabBtn $active={tab === "assigned"} onClick={() => setTab("assigned")}>
            Active ({assignedJobs.length})
          </TabBtn>
          <TabBtn $active={tab === "completed"} onClick={() => setTab("completed")}>
            Completed ({completedJobs.length})
          </TabBtn>
        </TabRow>

        {/* ── Earnings summary (completed tab) ── */}
        {tab === "completed" && completedJobs.length > 0 ? (
          <EarningsBadge>
            <IndianRupee size={14} />
            {totalEarnings.toLocaleString("en-IN")} total earnings
          </EarningsBadge>
        ) : null}

        {/* ── Job list ── */}
        <SectionLabel>
          {tab === "assigned" ? "Active Jobs" : "Completed Jobs"}
        </SectionLabel>

        {filtered.length === 0 ? (
          <EmptyState>
            <Briefcase size={32} strokeWidth={1.4} />
            <div style={{ fontWeight: 700, fontSize: 14, color: "#475569" }}>
              {tab === "assigned" ? "No active jobs" : "No completed jobs yet"}
            </div>
            <div style={{ fontSize: 12 }}>
              {tab === "assigned"
                ? "New assignments will appear here"
                : "Completed jobs will show up here"}
            </div>
          </EmptyState>
        ) : (
          filtered.map((job) => {
            const jobKey = job.id || job.jobId || job.requestId;
            const isActive = activeJob?.id === job.id;
            const locked = Boolean(activeJob) && !isActive && tab === "assigned";

            return (
              <JobCard
                key={jobKey}
                $clickable={tab === "assigned" && !locked}
                $locked={locked}
                onClick={() => {
                  if (tab !== "assigned" || !jobKey || locked) return;
                  navigate(`/active-job/${jobKey}`);
                }}
              >
                {/* Card header — ID + status */}
                <JobCardHeader $status={job.status}>
                  <IdPill>{job.jobRefId ?? `JOB-${sid(jobKey)}`}</IdPill>
                  <StatusPill $status={job.status}>
                    {job.status === "in_progress" ? (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#f59e0b",
                          display: "inline-block",
                        }}
                      />
                    ) : job.status === "completed" ? (
                      <CheckCircle2 size={10} />
                    ) : null}
                    {fmtStatus(job.status)}
                  </StatusPill>
                </JobCardHeader>

                {/* Card body */}
                <JobCardBody>
                  <JobField>
                    <JobFieldIcon>
                      <Truck size={13} color="#FF6200" />
                    </JobFieldIcon>
                    <div>
                      <JobFieldLabel>Crane</JobFieldLabel>
                      <JobFieldValue>{job.variant}</JobFieldValue>
                    </div>
                  </JobField>

                  <JobField>
                    <JobFieldIcon>
                      <MapPin size={13} color="#FF6200" />
                    </JobFieldIcon>
                    <div>
                      <JobFieldLabel>Pickup</JobFieldLabel>
                      <JobFieldValue>{job.location}</JobFieldValue>
                    </div>
                  </JobField>

                  {job.amount > 0 ? (
                    <JobField>
                      <JobFieldIcon>
                        <IndianRupee size={13} color="#16a34a" />
                      </JobFieldIcon>
                      <div>
                        <JobFieldLabel>Amount</JobFieldLabel>
                        <JobFieldValue>
                          ₹{job.amount.toLocaleString("en-IN")}
                        </JobFieldValue>
                      </div>
                    </JobField>
                  ) : null}

                  {locked ? (
                    <LockedBadge>
                      <Lock size={12} />
                      Finish your current job to open this one
                    </LockedBadge>
                  ) : tab === "assigned" ? (
                    <OpenBtn
                      $active={isActive}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!jobKey) return;
                        navigate(`/active-job/${jobKey}`);
                      }}
                    >
                      {isActive ? "Continue Job" : "Open Job"}
                      <ArrowRight size={15} />
                    </OpenBtn>
                  ) : null}
                </JobCardBody>
              </JobCard>
            );
          })
        )}
      </Body>
    </ScreenWithNav>
  );
}
