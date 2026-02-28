import { ArrowRight, IndianRupee, ShieldCheck, Timer, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

const Hero = styled.section`
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(120deg, rgba(10, 37, 64, 0.95), rgba(10, 37, 64, 0.78));
  color: white;
  padding: 30px 22px;
  @media (min-width: 900px) {
    padding: 52px;
  }
`;

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
`;

const flows = [
  ["1", "Receive Lead", "Customer requests from user-web enter your queue with SLA timer."],
  ["2", "Send Quote", "Set crane, operator, price, and estimated arrival in one quote card."],
  ["3", "Dispatch Driver", "Assign confirmed jobs to driver-pwa with route and instructions."],
  ["4", "Close Job", "Track completion, upload proof, and trigger invoice + payout."]
];

export function HomePage() {
  return (
    <div style={{ display: "grid", gap: 22 }}>
      <Hero>
        <Badge variant="outline">Owner Console | CraneHub Marketplace</Badge>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", margin: "10px 0" }}>
          Run Your Crane Business in One Workspace
        </h1>
        <p style={{ maxWidth: 680, color: "#e2e8f0" }}>
          Manage incoming leads from Bengaluru, Mumbai, and Delhi. Quote faster, assign drivers,
          and monitor live jobs with full operational visibility.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          <Link to="/incoming">
            <Button size="lg">
              View Incoming Leads <ArrowRight size={16} />
            </Button>
          </Link>
          <Link to="/dispatch">
            <Button variant="outline" size="lg">
              Open Dispatch Board
            </Button>
          </Link>
        </div>
      </Hero>

      <section>
        <h2>Today At A Glance</h2>
        <Grid>
          <Card>
            <CardContent>
              <p style={{ color: "#64748B", marginTop: 0 }}>New Leads</p>
              <h3 style={{ margin: "0 0 6px 0" }}>18</h3>
              <Badge>4 priority within 15 mins</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p style={{ color: "#64748B", marginTop: 0 }}>Quote Win Rate (7d)</p>
              <h3 style={{ margin: "0 0 6px 0" }}>61%</h3>
              <Badge variant="success">+8% vs last week</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p style={{ color: "#64748B", marginTop: 0 }}>Active Jobs</p>
              <h3 style={{ margin: "0 0 6px 0" }}>9</h3>
              <Badge variant="warning">3 in transit, 6 on-site</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p style={{ color: "#64748B", marginTop: 0 }}>Pending Payouts</p>
              <h3 style={{ margin: "0 0 6px 0" }}>₹4,82,000</h3>
              <Badge variant="outline">2 invoices due today</Badge>
            </CardContent>
          </Card>
        </Grid>
      </section>

      <section>
        <h2>Owner Workflow</h2>
        <Grid>
          {flows.map(([step, title, text]) => (
            <Card key={title}>
              <CardContent>
                <Badge>{`Step ${step}`}</Badge>
                <h3>{title}</h3>
                <p style={{ color: "#64748B", marginBottom: 0 }}>{text}</p>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </section>

      <section>
        <h2>Operational Control Panels</h2>
        <Grid>
          <Card>
            <CardContent>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Timer size={16} /> SLA Queue
              </h3>
              <p style={{ color: "#64748B" }}>
                Prioritize leads by response window to improve win rate and ranking.
              </p>
              <Link to="/incoming">
                <Button variant="outline">Open Queue</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Truck size={16} /> Driver Dispatch
              </h3>
              <p style={{ color: "#64748B" }}>
                Assign driver/operator tasks synced with driver-pwa and route ETA.
              </p>
              <Link to="/dispatch">
                <Button variant="outline">Manage Dispatch</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <IndianRupee size={16} /> Billing & Payouts
              </h3>
              <p style={{ color: "#64748B" }}>
                Mark jobs complete, trigger invoice, and track settlement release.
              </p>
              <Link to="/dashboard">
                <Button variant="outline">View Jobs</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={16} /> Compliance
              </h3>
              <p style={{ color: "#64748B" }}>
                Keep crane insurance, operator certifications, and RC records active.
              </p>
              <Button variant="outline">Check Documents</Button>
            </CardContent>
          </Card>
        </Grid>
      </section>
    </div>
  );
}
