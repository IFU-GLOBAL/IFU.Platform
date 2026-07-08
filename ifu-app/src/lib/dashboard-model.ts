export type DashboardIconKey =
  | "archive"
  | "badgeDollarSign"
  | "briefcaseBusiness"
  | "checkSquare"
  | "fileText"
  | "globe"
  | "graduationCap"
  | "layoutDashboard"
  | "map"
  | "messageSquareText"
  | "network"
  | "panelsTopLeft"
  | "route"
  | "searchCheck"
  | "settings"
  | "shieldCheck"
  | "shoppingBasket"
  | "sprout"
  | "star"
  | "tractor"
  | "usersRound";

export type DashboardDrawerItem = {
  id: string;
  title: string;
  type: string;
  summary: string;
  description: string;
  details?: string[];
  actions?: string[];
  iconKey?: DashboardIconKey;
  metric?: string;
};

export type DashboardProfile = {
  fullName: string;
  email?: string;
  role: string;
  category: string;
  city: string;
  stateProvince: string;
  region: string;
  country: string;
  timezone?: string;
  profileCompletion: number;
  sessionExpiresAt?: string;
  latitude?: number;
  longitude?: number;
};

export type DashboardViewModel = {
  profile: DashboardProfile;
  menu: DashboardDrawerItem[];
  cards: DashboardDrawerItem[];
  ecosystemItems: DashboardDrawerItem[];
  workspaceItems: DashboardDrawerItem[];
};

export type DashboardSeedItem = DashboardDrawerItem & {
  dashboardType:
    | "OPPORTUNITY"
    | "TRAINING"
    | "FUNDING"
    | "MARKETPLACE"
    | "EXPERT"
    | "COMMUNITY"
    | "MAP_COUNTRY"
    | "DOCUMENT"
    | "MESSAGE"
    | "APPLICATION"
    | "ECOSYSTEM"
    | "RESOURCE";
  group: "menu" | "card" | "ecosystem";
  order: number;
};

export const dashboardMenuSeeds: DashboardSeedItem[] = [
  {
    id: "dashboard-home",
    title: "Dashboard Home",
    type: "Menu Section",
    summary: "Overview of the user's IFU command center.",
    description:
      "Dashboard Home consolidates the user's profile, recommended next actions, saved items, current opportunities, and IFU ecosystem entry points.",
    actions: ["Open Overview", "Save Current View", "Continue"],
    iconKey: "layoutDashboard",
    dashboardType: "RESOURCE",
    group: "menu",
    order: 1,
  },
  {
    id: "workspace",
    title: "My IFU Workspace",
    type: "Workspace",
    summary: "Active IFU tasks, saved workflows, notes, and next actions.",
    description:
      "The workspace keeps applications, training, marketplace listings, expert requests, documents, and reminders in one operating area.",
    details: ["Current action plan", "In-progress training", "Saved opportunities"],
    actions: ["Continue Workspace", "Add Task", "Mark Complete"],
    iconKey: "briefcaseBusiness",
    dashboardType: "RESOURCE",
    group: "menu",
    order: 2,
  },
  {
    id: "daily-journey",
    title: "My Daily Journey",
    type: "Journey",
    summary: "Today priority actions and recommended tasks.",
    description:
      "Daily Journey gives the member a clear sequence of short actions based on role, country, profile status, and current IFU opportunities.",
    actions: ["Mark Complete", "Set Reminder", "Move to Workspace"],
    iconKey: "route",
    dashboardType: "RESOURCE",
    group: "menu",
    order: 3,
  },
  {
    id: "recommended-pathway",
    title: "Recommended Pathway",
    type: "Pathway",
    summary: "Role-based sequence for onboarding, training, and contribution.",
    description:
      "Recommended Pathway maps the member from profile setup to role-specific opportunities, certifications, funding, and community connections.",
    actions: ["View Pathway", "Save Pathway", "Update Role"],
    iconKey: "searchCheck",
    dashboardType: "RESOURCE",
    group: "menu",
    order: 4,
  },
  {
    id: "top-opportunities",
    title: "Top Opportunities",
    type: "Opportunities",
    summary: "Matched grants, buyers, events, partnerships, and project openings.",
    description:
      "Top Opportunities is personalized from the member's role, location, category, and selected interests across the IFU ecosystem.",
    actions: ["Open Opportunity", "Save to Bookmarks", "Apply"],
    iconKey: "star",
    dashboardType: "OPPORTUNITY",
    group: "menu",
    order: 5,
  },
  {
    id: "recommended-training",
    title: "Recommended Training",
    type: "Training",
    summary: "Courses and certifications from AgriAcademie.",
    description:
      "Recommended Training routes members to skill-building modules, courses, certifications, and practical learning resources.",
    actions: ["Start Training", "Continue Course", "Save Course"],
    iconKey: "graduationCap",
    dashboardType: "TRAINING",
    group: "menu",
    order: 6,
  },
  {
    id: "funding-opportunities",
    title: "Funding Opportunities",
    type: "Funding",
    summary: "Grants, donor programs, loans, investors, and climate finance.",
    description:
      "Funding Opportunities surfaces financing pathways and keeps document requests close to applications and workspace items.",
    actions: ["Apply Now", "Upload Documents", "Move to Workspace"],
    iconKey: "badgeDollarSign",
    dashboardType: "FUNDING",
    group: "menu",
    order: 7,
  },
  {
    id: "marketplace-opportunities",
    title: "Marketplace Opportunities",
    type: "Marketplace",
    summary: "Buyer requests, seller listings, export openings, and agritourism offers.",
    description:
      "Marketplace Opportunities connects producers, buyers, cooperatives, exporters, and partners to structured demand and supply signals.",
    actions: ["View Buyer", "Submit Product", "Post Listing"],
    iconKey: "shoppingBasket",
    dashboardType: "MARKETPLACE",
    group: "menu",
    order: 8,
  },
  {
    id: "expert-network",
    title: "Expert Network",
    type: "Network",
    summary: "Specialists, mentors, advisors, and technical contacts.",
    description:
      "Expert Network helps the member connect with agronomists, veterinarians, export consultants, finance advisors, and certification specialists.",
    actions: ["Connect", "Message", "Schedule"],
    iconKey: "network",
    dashboardType: "EXPERT",
    group: "menu",
    order: 9,
  },
  {
    id: "agrinexus-community",
    title: "AgriNexus Community",
    type: "Community",
    summary: "IFU member groups, discussions, and regional collaboration spaces.",
    description:
      "AgriNexus Community supports discussions, peer introductions, group coordination, and country or regional collaboration.",
    actions: ["Open Community", "Join Group", "Message Members"],
    iconKey: "usersRound",
    dashboardType: "COMMUNITY",
    group: "menu",
    order: 10,
  },
  {
    id: "agritourism",
    title: "Agritourism",
    type: "Tourism",
    summary: "Rural experiences, farm visits, and community tourism opportunities.",
    description:
      "Agritourism connects farm-based experiences, cultural routes, rural destinations, and partner opportunities across IFU regions.",
    actions: ["Explore Listings", "Create Offer", "Save"],
    iconKey: "tractor",
    dashboardType: "MARKETPLACE",
    group: "menu",
    order: 11,
  },
  {
    id: "global-map",
    title: "Global Map",
    type: "Map",
    summary: "Country-level agricultural intelligence and IFU ecosystem context.",
    description:
      "Global Map gives members a lightweight entry into country dashboards, regional signals, and nearby IFU connections.",
    actions: ["Open Map", "Save Region", "View Country"],
    iconKey: "map",
    dashboardType: "MAP_COUNTRY",
    group: "menu",
    order: 12,
  },
  {
    id: "intelligence-hub",
    title: "Intelligence Hub",
    type: "Data",
    summary: "Market signals, analytics, research, and country intelligence.",
    description:
      "Intelligence Hub brings together market trends, production signals, research resources, and future QuickSight analytics.",
    actions: ["View Signals", "Save Report", "Request Data"],
    iconKey: "panelsTopLeft",
    dashboardType: "RESOURCE",
    group: "menu",
    order: 13,
  },
  {
    id: "bookmarks",
    title: "My IFU Bookmarks / Saved Items",
    type: "Bookmarks",
    summary: "Saved resources, opportunities, training, contacts, and documents.",
    description:
      "Bookmarks keep every saved item accessible from the command center, so members can return to important resources quickly.",
    actions: ["Open Saved Items", "Move to Workspace", "Remove Saved Item"],
    iconKey: "archive",
    dashboardType: "RESOURCE",
    group: "menu",
    order: 14,
  },
  {
    id: "applications",
    title: "My Applications",
    type: "Applications",
    summary: "Funding, training, leadership, marketplace, and membership requests.",
    description:
      "Applications tracks submitted and draft requests, current steps, missing documents, and status updates.",
    actions: ["Continue Application", "Upload Document", "Submit"],
    iconKey: "checkSquare",
    dashboardType: "APPLICATION",
    group: "menu",
    order: 15,
  },
  {
    id: "messages",
    title: "My Messages",
    type: "Messages",
    summary: "Member, expert, partner, and IFU team communication.",
    description:
      "Messages centralizes communication tied to opportunities, expert introductions, community groups, and application follow-up.",
    actions: ["Open Inbox", "Start Message", "Schedule"],
    iconKey: "messageSquareText",
    dashboardType: "MESSAGE",
    group: "menu",
    order: 16,
  },
  {
    id: "documents",
    title: "My Documents",
    type: "Documents",
    summary: "Uploaded files, certificates, forms, and required application records.",
    description:
      "Documents will connect to private storage and help members manage files used across applications, funding, training, and marketplace workflows.",
    actions: ["Upload Document", "View Files", "Attach to Application"],
    iconKey: "fileText",
    dashboardType: "DOCUMENT",
    group: "menu",
    order: 17,
  },
  {
    id: "settings",
    title: "My Settings",
    type: "Settings",
    summary: "Profile, privacy, notification, role, and account preferences.",
    description:
      "Settings gives members control over profile completion, preferred role, location, communication preferences, and account details.",
    actions: ["Edit Profile", "Update Notifications", "Manage Account"],
    iconKey: "settings",
    dashboardType: "RESOURCE",
    group: "menu",
    order: 18,
  },
];

export const dashboardCardSeeds: DashboardSeedItem[] = [
  { ...dashboardMenuSeeds[2], metric: "3 next steps", group: "card", order: 1 },
  {
    ...dashboardMenuSeeds[4],
    id: "top-opportunities-card",
    title: "Top Opportunities For You",
    metric: "12 matches",
    group: "card",
    order: 2,
  },
  { ...dashboardMenuSeeds[5], id: "recommended-training-card", metric: "4 courses", group: "card", order: 3 },
  { ...dashboardMenuSeeds[6], id: "funding-opportunities-card", metric: "7 programs", group: "card", order: 4 },
  { ...dashboardMenuSeeds[7], id: "marketplace-opportunities-card", metric: "9 listings", group: "card", order: 5 },
  { ...dashboardMenuSeeds[8], id: "expert-network-card", metric: "18 experts", group: "card", order: 6 },
];

export const ecosystemSeeds: DashboardSeedItem[] = [
  {
    id: "agrisphere",
    title: "AgriSphere",
    type: "IFU Ecosystem",
    summary: "Member discovery, onboarding, profiles, and role-based navigation.",
    description:
      "AgriSphere is the gateway that helps users identify who they are, where they are, what they need, and which IFU pathway fits them.",
    actions: ["Open AgriSphere", "Save Ecosystem", "Continue"],
    iconKey: "sprout",
    dashboardType: "ECOSYSTEM",
    group: "ecosystem",
    order: 1,
  },
  {
    id: "agrinexus",
    title: "AgriNexus",
    type: "IFU Ecosystem",
    summary: "Community, networking, regional groups, and expert collaboration.",
    description:
      "AgriNexus connects members, organizations, communities, and specialists for practical collaboration across agriculture.",
    actions: ["Open Community", "Join Group", "Message"],
    iconKey: "sprout",
    dashboardType: "ECOSYSTEM",
    group: "ecosystem",
    order: 2,
  },
  {
    id: "agriacademie",
    title: "AgriAcademie",
    type: "IFU Ecosystem",
    summary: "Training, certification, courses, and learning pathways.",
    description:
      "AgriAcademie supports structured agricultural education, certification, video training, and member learning progress.",
    actions: ["Start Training", "View Courses", "Save"],
    iconKey: "sprout",
    dashboardType: "ECOSYSTEM",
    group: "ecosystem",
    order: 3,
  },
  {
    id: "agriexchange",
    title: "AgriExchange",
    type: "IFU Ecosystem",
    summary: "Marketplace, buyer and seller flows, trade, export, and listings.",
    description:
      "AgriExchange helps producers, buyers, cooperatives, exporters, and partners coordinate marketplace opportunities.",
    actions: ["Open Marketplace", "Post Product", "View Buyers"],
    iconKey: "sprout",
    dashboardType: "ECOSYSTEM",
    group: "ecosystem",
    order: 4,
  },
  {
    id: "agricapital",
    title: "AgriCapital",
    type: "IFU Ecosystem",
    summary: "Investment, investor matching, project scoring, and capital readiness.",
    description:
      "AgriCapital organizes investment-readiness signals, capital pathways, and project opportunities for qualified members.",
    actions: ["Open Capital Pathway", "Save", "Request Review"],
    iconKey: "sprout",
    dashboardType: "ECOSYSTEM",
    group: "ecosystem",
    order: 5,
  },
  {
    id: "agrifunds",
    title: "AgriFunds",
    type: "IFU Ecosystem",
    summary: "Grants, donor programs, funding applications, and finance tracking.",
    description:
      "AgriFunds routes funding opportunities, document requests, program criteria, and status updates into member workflows.",
    actions: ["View Funding", "Apply", "Upload Documents"],
    iconKey: "sprout",
    dashboardType: "ECOSYSTEM",
    group: "ecosystem",
    order: 6,
  },
  {
    id: "agrishield",
    title: "AgriShield",
    type: "IFU Ecosystem",
    summary: "Compliance, quality assurance, risk monitoring, and trust workflows.",
    description:
      "AgriShield supports compliance checks, quality assurance, traceability, and risk workflows for the IFU platform.",
    actions: ["Open Compliance", "Review Checklist", "Save"],
    iconKey: "sprout",
    dashboardType: "ECOSYSTEM",
    group: "ecosystem",
    order: 7,
  },
  {
    id: "agricentral",
    title: "AgriCentral",
    type: "IFU Ecosystem",
    summary: "Operations, monitoring, activity logs, and administration signals.",
    description:
      "AgriCentral gives IFU operators a future view into platform activity, support needs, readiness signals, and audit history.",
    actions: ["View Activity", "Save", "Request Support"],
    iconKey: "sprout",
    dashboardType: "ECOSYSTEM",
    group: "ecosystem",
    order: 8,
  },
  {
    id: "data-engine",
    title: "Data Engine",
    type: "IFU Ecosystem",
    summary: "Country dashboards, analytics, intelligence, and reporting foundations.",
    description:
      "The Data Engine powers agricultural intelligence, role-based recommendations, country dashboards, and future QuickSight reporting.",
    actions: ["Open Intelligence", "Save Report", "Request Data"],
    iconKey: "sprout",
    dashboardType: "ECOSYSTEM",
    group: "ecosystem",
    order: 9,
  },
];

export const workspaceSeedItems: DashboardDrawerItem[] = [
  {
    id: "complete-location-and-role-profile",
    title: "Complete location and role profile",
    type: "Workspace Item",
    summary: "A recommended action for this member's current IFU pathway.",
    description:
      "This action belongs in the user's workspace and connects to profile, location, and role data in PostgreSQL.",
    actions: ["Move to Workspace", "Set Reminder", "Mark Complete"],
    iconKey: "checkSquare",
  },
  {
    id: "review-recommended-funding-pathway",
    title: "Review recommended funding pathway",
    type: "Workspace Item",
    summary: "Review funding matches and determine the next application step.",
    description:
      "This workspace item tracks funding readiness and document preparation for the member.",
    actions: ["Move to Workspace", "Set Reminder", "Mark Complete"],
    iconKey: "checkSquare",
  },
  {
    id: "save-marketplace-opportunities",
    title: "Save three relevant marketplace opportunities",
    type: "Workspace Item",
    summary: "Build a short list of buyer, seller, or service opportunities.",
    description:
      "This action helps the member start using marketplace signals in a practical workflow.",
    actions: ["Move to Workspace", "Set Reminder", "Mark Complete"],
    iconKey: "checkSquare",
  },
  {
    id: "choose-agriacademie-course",
    title: "Choose one AgriAcademie course",
    type: "Workspace Item",
    summary: "Select an education pathway from the training ecosystem.",
    description:
      "This action links the member's role to a course or certification pathway.",
    actions: ["Move to Workspace", "Set Reminder", "Mark Complete"],
    iconKey: "checkSquare",
  },
];

export const dashboardItemSeeds = [
  ...dashboardMenuSeeds,
  ...dashboardCardSeeds,
  ...ecosystemSeeds,
];
