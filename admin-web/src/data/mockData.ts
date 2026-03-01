export const kpis = [
  { label: "Total Requests Today", value: "286", delta: "+12% vs yesterday", tone: "success" },
  { label: "Active Owners", value: "1,248", delta: "+3.2% this week", tone: "success" },
  { label: "Total Cranes Onboarded", value: "3,962", delta: "+48 new this month", tone: "info" },
  { label: "Platform Revenue", value: "?28,74,500", delta: "+18.4% MTD", tone: "success" },
  { label: "Avg Response Time", value: "7m 24s", delta: "-41s improved", tone: "success" },
  { label: "Fleet Utilization", value: "74.6%", delta: "+2.1 pts", tone: "success" },
  { label: "Pending Approvals", value: "37", delta: "Needs attention", tone: "warning" },
  { label: "Open Disputes", value: "9", delta: "2 high priority", tone: "danger" }
] as const;

export const revenueTrend = [
  { label: "Mon", value: 6.2 },
  { label: "Tue", value: 7.1 },
  { label: "Wed", value: 8.4 },
  { label: "Thu", value: 9.2 },
  { label: "Fri", value: 10.6 },
  { label: "Sat", value: 12.1 },
  { label: "Sun", value: 11.4 }
];

export const requestsByVariant = [
  { label: "25T Mobile", value: 94 },
  { label: "50T Rough Terrain", value: 68 },
  { label: "100T Crawler", value: 42 },
  { label: "Tower Crane", value: 29 },
  { label: "Pick & Carry", value: 53 }
];

export const recentActivity = [
  "Approved owner Rajesh Crane Services (Bengaluru)",
  "Dispute #DSP-184 marked Under Review",
  "Crane variant 80T All Terrain updated",
  "Suspended user account: anil.k@buildmax.in",
  "Commission settlement exported for February",
  "Driver Onboarding approved: Faisal Khan",
  "Request CRH-REQ-90211 moved to Confirmed",
  "Insurance doc rejected for Shree Lifts Pvt Ltd",
  "Maintenance mode scheduled for 02:00 AM IST",
  "Email template updated: Request Accepted"
];

export const users = [
  { role: "Customers", name: "Rohan Mehta", phone: "+91 98765 11220", email: "rohan.mehta@urbansite.in", city: "Bengaluru", joined: "12 Jan 2025", status: true, verified: true },
  { role: "Customers", name: "Priya Nair", phone: "+91 99872 44510", email: "priya.nair@skylineprojects.in", city: "Mumbai", joined: "24 Mar 2025", status: true, verified: true },
  { role: "Crane Owners", name: "Rajesh Crane Services", phone: "+91 98450 55001", email: "ops@rajeshcranes.com", city: "Bengaluru", joined: "03 Nov 2024", status: true, verified: true },
  { role: "Crane Owners", name: "Shree Lifts Pvt Ltd", phone: "+91 98204 80332", email: "admin@shreelifts.in", city: "Mumbai", joined: "18 Dec 2024", status: false, verified: false },
  { role: "Drivers", name: "Imran Shaikh", phone: "+91 97681 55221", email: "imran.shaikh@fleetmail.in", city: "Delhi", joined: "08 Aug 2025", status: true, verified: true },
  { role: "Drivers", name: "Sandeep Yadav", phone: "+91 99587 11029", email: "sandeep.y@fleetmail.in", city: "Delhi", joined: "17 Sep 2025", status: true, verified: false },
  { role: "Drivers", name: "Harsha Gowda", phone: "+91 99007 33124", email: "harsha.g@fleetmail.in", city: "Bengaluru", joined: "02 Oct 2025", status: false, verified: true }
];

export const ownerApplications = [
  {
    company: "Rajput Heavy Lifts LLP",
    owner: "Vikram Rajput",
    city: "Delhi",
    gst: "07AAGFR2241M1ZR",
    bank: "HDFC Bank • 50200018223611",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
    docs: ["Aadhaar", "PAN", "Crane RC", "Insurance", "Fitness Certificate"]
  },
  {
    company: "Metro Crane Logistics",
    owner: "Saurabh Kulkarni",
    city: "Mumbai",
    gst: "27AAFCM9921N1ZP",
    bank: "ICICI Bank • 218905004992",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
    docs: ["Aadhaar", "PAN", "Crane RC", "Insurance", "Fitness Certificate"]
  },
  {
    company: "Namma Lift Solutions",
    owner: "Srinivas Murthy",
    city: "Bengaluru",
    gst: "29AAECN5422Q1ZD",
    bank: "Axis Bank • 91302003222111",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
    docs: ["Aadhaar", "PAN", "Crane RC", "Insurance", "Fitness Certificate"]
  }
];

export const craneVariants = [
  { name: "25T Mobile Crane", capacity: 25, type: "Mobile", rate: "?2,800 - ?3,600/hr", status: true, icon: "Truck" },
  { name: "50T Rough Terrain", capacity: 50, type: "Rough Terrain", rate: "?4,400 - ?5,800/hr", status: true, icon: "Mountain" },
  { name: "100T Crawler Crane", capacity: 100, type: "Crawler", rate: "?8,500 - ?11,200/hr", status: true, icon: "Construction" },
  { name: "Tower Crane", capacity: 20, type: "Tower", rate: "?6,000 - ?8,000/hr", status: true, icon: "Building2" },
  { name: "Pick & Carry 14T", capacity: 14, type: "Pick & Carry", rate: "?1,900 - ?2,700/hr", status: false, icon: "Factory" }
];

export const serviceRequests = [
  { id: "CRH-REQ-90211", customer: "UrbanEdge Infra", variant: "50T Rough Terrain", location: "Whitefield, Bengaluru", time: "01 Mar 2026, 10:30 AM", status: "Confirmed", owner: "Rajesh Crane Services", driver: "Harsha Gowda" },
  { id: "CRH-REQ-90207", customer: "Mahalaxmi Projects", variant: "25T Mobile Crane", location: "Andheri East, Mumbai", time: "01 Mar 2026, 09:15 AM", status: "In Progress", owner: "Metro Crane Logistics", driver: "Imran Shaikh" },
  { id: "CRH-REQ-90198", customer: "Northline Buildcon", variant: "100T Crawler Crane", location: "Dwarka, Delhi", time: "28 Feb 2026, 04:45 PM", status: "Accepted", owner: "Rajput Heavy Lifts LLP", driver: "Sandeep Yadav" },
  { id: "CRH-REQ-90181", customer: "Kaveri Developers", variant: "Tower Crane", location: "Hebbal, Bengaluru", time: "28 Feb 2026, 01:10 PM", status: "Open", owner: "-", driver: "-" },
  { id: "CRH-REQ-90162", customer: "Skyline Metro Works", variant: "25T Mobile Crane", location: "BKC, Mumbai", time: "27 Feb 2026, 11:00 AM", status: "Completed", owner: "Shree Lifts Pvt Ltd", driver: "Faisal Khan" }
];

export const payments = [
  { id: "JOB-55321", requestId: "CRH-REQ-90162", amount: 12450, commission: 1868, ownerPayout: 10582, city: "Mumbai" },
  { id: "JOB-55320", requestId: "CRH-REQ-90156", amount: 28900, commission: 4335, ownerPayout: 24565, city: "Delhi" },
  { id: "JOB-55318", requestId: "CRH-REQ-90141", amount: 17600, commission: 2640, ownerPayout: 14960, city: "Bengaluru" },
  { id: "JOB-55314", requestId: "CRH-REQ-90123", amount: 36200, commission: 5430, ownerPayout: 30770, city: "Mumbai" }
];

export const disputes = [
  { id: "DSP-184", requestId: "CRH-REQ-90201", complainant: "Priya Nair", reason: "Late crane arrival by 90 minutes", status: "Under Review" },
  { id: "DSP-177", requestId: "CRH-REQ-90178", complainant: "Rajesh Crane Services", reason: "Incorrect overtime charge", status: "Resolved" },
  { id: "DSP-171", requestId: "CRH-REQ-90155", complainant: "Northline Buildcon", reason: "Driver no-show", status: "Under Review" }
];

export const cityRequestData = [
  { city: "Bengaluru", requests: 432 },
  { city: "Mumbai", requests: 389 },
  { city: "Delhi", requests: 344 },
  { city: "Chennai", requests: 188 },
  { city: "Hyderabad", requests: 206 }
];

export const peakHourData = [
  { hour: "06:00", value: 18 },
  { hour: "09:00", value: 45 },
  { hour: "12:00", value: 62 },
  { hour: "15:00", value: 81 },
  { hour: "18:00", value: 59 },
  { hour: "21:00", value: 26 }
];

export const ownerPerformance = [
  { owner: "Rajesh Crane Services", jobs: 126, rating: 4.8 },
  { owner: "Metro Crane Logistics", jobs: 102, rating: 4.6 },
  { owner: "Namma Lift Solutions", jobs: 84, rating: 4.7 },
  { owner: "Rajput Heavy Lifts LLP", jobs: 71, rating: 4.5 }
];
