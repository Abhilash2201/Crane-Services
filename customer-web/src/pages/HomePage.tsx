import { ArrowRight, BadgeCheck, Clock3, MapPinned, ShieldCheck, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";

const Hero = styled.section`
  border-radius: 20px; overflow: hidden;
  background: linear-gradient(120deg, rgba(10,37,64,.95), rgba(10,37,64,.75)), url("https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=80") center/cover;
  color: white; padding: 30px 22px; @media (min-width: 900px) { padding: 52px; }
`;
const Grid = styled.section`display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;`;
const StepRow = styled.section`display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px;`;
const Footer = styled.footer`margin-top: 26px; padding: 16px; border-top: 1px solid ${({ theme }) => theme.colors.border}; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; color: ${({ theme }) => theme.colors.muted};`;

const variants = [
  { name: "25T Mobile Crane", specs: "12m boom | 3-axle", rate: "?2,800-?3,900/hr" },
  { name: "50T Rough Terrain", specs: "18m boom | 4x4", rate: "?4,800-?6,200/hr" },
  { name: "100T Crawler", specs: "30m boom | heavy lift", rate: "?9,500-?12,500/hr" },
  { name: "Tower Crane", specs: "60m jib | high-rise", rate: "?14,000-?18,000/day" },
  { name: "Hydra 14T", specs: "Compact city jobs", rate: "?1,700-?2,500/hr" },
  { name: "Pick & Carry 20T", specs: "Factory movement", rate: "?2,300-?3,200/hr" },
  { name: "All Terrain 80T", specs: "Fast highway transit", rate: "?7,200-?10,100/hr" },
  { name: "Telescopic 35T", specs: "Mid-rise projects", rate: "?3,700-?5,000/hr" }
];

const testimonials = [
  { quote: "Booked a 50T crane in Whitefield within 18 minutes. Smooth and transparent pricing.", name: "Rohan Kulkarni", company: "Site Engineer, BrickNova Infra" },
  { quote: "Excellent support and verified operators. We shifted 3 chillers in Mumbai without delays.", name: "Meera Shah", company: "Facilities Lead, WestBay Malls" },
  { quote: "Live tracking made coordination easy across our Delhi NCR warehouses.", name: "Arjun Sethi", company: "Ops Manager, ShipGrid Logistics" }
];

export function HomePage() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  return (
    <div style={{ display: "grid", gap: 22 }}>
      <Hero>
        <Badge variant="outline">Trusted by 1,400+ contractors across India</Badge>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", margin: "10px 0" }}>Book Any Crane in Minutes</h1>
        <p style={{ maxWidth: 640, color: "#e2e8f0" }}>Compare verified crane owners in Bengaluru, Mumbai, and Delhi. Confirm availability, operator details, and best-market pricing in one place.</p>
        <div style={{ marginTop: 14, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", maxWidth: 760 }}>
          <Input placeholder="Enter pincode (e.g. 560066)" />
          <Input placeholder="Crane variant (e.g. 50T Rough Terrain)" />
          <Link to="/new-request"><Button size="lg" style={{ width: "100%" }}>Search Cranes <ArrowRight size={16} /></Button></Link>
        </div>
      </Hero>

      <section>
        <h2>Popular Crane Variants</h2>
        <Grid>
          {variants.map((variant, idx) => (
            <Card key={variant.name}>
              <div style={{ height: 122, background: `linear-gradient(120deg, #0A2540, #1e3a8a ${35 + idx * 4}%)`, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700 }}>{variant.name}</div>
              <CardContent>
                <h3 style={{ marginTop: 0 }}>{variant.name}</h3>
                <p style={{ color: "#64748B", margin: "6px 0" }}>{variant.specs}</p>
                <Badge>{variant.rate}</Badge>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </section>

      <section>
        <h2>How it Works</h2>
        <StepRow>
          {[["1", "Choose Variant", "Filter by capacity, type, and radius."], ["2", "Add Job Details", "Pin exact location and upload site photos."], ["3", "Get Owner Matches", "Receive offers with ETA and pricing."], ["4", "Track Live", "Monitor crane dispatch until job completion."]].map(([step, title, text]) => (
            <Card key={title}><CardContent><Badge>{`Step ${step}`}</Badge><h3>{title}</h3><p style={{ color: "#64748B", marginBottom: 0 }}>{text}</p></CardContent></Card>
          ))}
        </StepRow>
      </section>

      <section>
        <h2>What Clients Say</h2>
        <Card>
          <CardContent>
            <p style={{ fontSize: "1.05rem", marginTop: 0 }}>"{testimonials[testimonialIndex].quote}"</p>
            <p style={{ marginBottom: 0, fontWeight: 700 }}>{testimonials[testimonialIndex].name}</p>
            <p style={{ color: "#64748B", marginTop: 4 }}>{testimonials[testimonialIndex].company}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="outline" onClick={() => setTestimonialIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}>Previous</Button>
              <Button onClick={() => setTestimonialIndex((prev) => (prev + 1) % testimonials.length)}>Next</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2>Desktop + Mobile Views</h2>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <Card><CardContent><Badge variant="outline">Desktop</Badge><h3>Operations Dashboard</h3><p style={{ color: "#64748B" }}>Wide cards, timeline rail, side actions and request funnel.</p><div style={{ display: "flex", gap: 8, color: "#64748B" }}><ShieldCheck size={16} /> Verified Owners <Clock3 size={16} /> Fast ETA <Star size={16} /> Rated Operators</div></CardContent></Card>
          <Card><CardContent><Badge variant="outline">Mobile</Badge><h3>Field-Friendly Touch UI</h3><p style={{ color: "#64748B" }}>Large buttons, stacked forms, one-tap call/chat, live location pin.</p><div style={{ display: "flex", gap: 8, color: "#64748B" }}><MapPinned size={16} /> Geo picker <BadgeCheck size={16} /> OTP login</div></CardContent></Card>
        </div>
      </section>

      <Footer><span>CraneHub India Pvt Ltd | GSTIN 29AACCC9283D1ZX</span><span>support@cranehub.in | +91 80 4567 2233</span></Footer>
    </div>
  );
}
