import { rolePreviewValuesByTitle } from "@/lib/role-preview-values";

export type DiscoveryLevel = "Foundation" | "Professional" | "Leadership";

export type DiscoveryRole = {
  slug: string;
  title: string;
  summary: string;
  pathway: string;
  level: DiscoveryLevel;
  ecosystems: string[];
  personaSlug: string;
  personaLabel: string;
  categorySlug: string;
  categoryName: string;
  sortOrder: number;
};

export type DiscoveryCategory = {
  slug: string;
  name: string;
  summary: string;
  sortOrder: number;
  roles: DiscoveryRole[];
};

export type DiscoveryPersona = {
  slug: string;
  label: string;
  prompt: string;
  description: string;
  categorySlugs: string[];
};

export const ecosystemNames = [
  "AgriSphere",
  "AgriNexus",
  "AgriAcademie",
  "AgriExchange",
  "AgriCapital",
  "AgriFunds",
  "AgriShield",
  "AgriCentral",
  "AgriTourisme",
  "AgriFinance",
] as const;

export const discoveryPersonas: DiscoveryPersona[] = [
  {
    slug: "grow-or-produce",
    label: "I grow, raise, or harvest",
    prompt: "Farmers, ranchers, fishers, producers, and cooperative members",
    description: "Start here if your work begins with land, livestock, water, harvests, or producer groups.",
    categorySlugs: [
      "producers-and-primary-agriculture",
      "cooperatives-and-associations",
      "agritourism-and-hospitality",
    ],
  },
  {
    slug: "buy-sell-or-move-food",
    label: "I buy, sell, process, or move food",
    prompt: "Buyers, importers, exporters, traders, processors, logistics, and storage",
    description: "For market access, trade, logistics, processing, distribution, and buyer relationships.",
    categorySlugs: ["trade-and-marketplace"],
  },
  {
    slug: "fund-or-protect-agriculture",
    label: "I fund, insure, or invest",
    prompt: "Investors, donors, banks, grant providers, sponsors, and insurance partners",
    description: "For finance, grants, investment, risk, sponsorship, and capital pathways.",
    categorySlugs: ["finance-and-funding", "strategic-partners-and-sponsors"],
  },
  {
    slug: "teach-research-or-advise",
    label: "I teach, research, or advise",
    prompt: "Educators, researchers, agronomists, vets, advisors, data specialists, and trainers",
    description: "For people who create knowledge, provide technical expertise, or support better decisions.",
    categorySlugs: ["education-and-research", "agricultural-services", "data-and-intelligence"],
  },
  {
    slug: "govern-or-lead-regions",
    label: "I govern, regulate, or lead regions",
    prompt: "Government, institutions, country representatives, compliance, legal, and governance roles",
    description: "For public-sector, policy, compliance, country leadership, standards, and governance work.",
    categorySlugs: [
      "government-and-institutions",
      "country-and-regional-leadership",
      "compliance-and-certification",
      "legal-and-governance",
      "ifu-executive-and-advisory",
    ],
  },
  {
    slug: "support-communities",
    label: "I support communities or food security",
    prompt: "NGOs, foundations, volunteers, food security, nutrition, sustainability, and climate roles",
    description: "For community impact, resilience, food access, sustainability, climate, and nonprofit programs.",
    categorySlugs: [
      "ngo-and-social-impact",
      "food-security-and-nutrition",
      "sustainability-and-agrifuture",
    ],
  },
  {
    slug: "build-or-tell-the-story",
    label: "I build technology or tell the story",
    prompt: "Technology partners, founders, software teams, media, journalists, and creators",
    description: "For digital platforms, AI, data products, media, storytelling, and communications.",
    categorySlugs: ["technology-and-innovation", "media-and-communications"],
  },
  {
    slug: "visit-learn-or-participate",
    label: "I want to learn, visit, or participate",
    prompt: "Consumers, visitors, students, supporters, and public participants",
    description: "For people exploring IFU, learning about agriculture, visiting farms, or supporting the mission.",
    categorySlugs: ["public-and-visitors", "operations-and-administration"],
  },
];

// Source: Current-IFU_Complete_AWS_GitHub_GoogleDrive_Developer_Package-Josiah1 (1).docx, section "IFU Role Master Seed Table".
const categorySeeds = [
  ["producers-and-primary-agriculture", "Producers & Primary Agriculture", "IFU role options for Producers & Primary Agriculture across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["trade-and-marketplace", "Trade & Marketplace", "IFU role options for Trade & Marketplace across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["finance-and-funding", "Finance & Funding", "IFU role options for Finance & Funding across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["government-and-institutions", "Government & Institutions", "IFU role options for Government & Institutions across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["education-and-research", "Education & Research", "IFU role options for Education & Research across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["ngo-and-social-impact", "NGO & Social Impact", "IFU role options for NGO & Social Impact across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["agricultural-services", "Agricultural Services", "IFU role options for Agricultural Services across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["technology-and-innovation", "Technology & Innovation", "IFU role options for Technology & Innovation across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["media-and-communications", "Media & Communications", "IFU role options for Media & Communications across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["public-and-visitors", "Public & Visitors", "IFU role options for Public & Visitors across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["agritourism-and-hospitality", "AgriTourism & Hospitality", "IFU role options for AgriTourism & Hospitality across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["sustainability-and-agrifuture", "Sustainability & AgriFuture", "IFU role options for Sustainability & AgriFuture across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["cooperatives-and-associations", "Cooperatives & Associations", "IFU role options for Cooperatives & Associations across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["food-security-and-nutrition", "Food Security & Nutrition", "IFU role options for Food Security & Nutrition across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["compliance-and-certification", "Compliance & Certification", "IFU role options for Compliance & Certification across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["data-and-intelligence", "Data & Intelligence", "IFU role options for Data & Intelligence across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["legal-and-governance", "Legal & Governance", "IFU role options for Legal & Governance across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["operations-and-administration", "Operations & Administration", "IFU role options for Operations & Administration across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["country-and-regional-leadership", "Country & Regional Leadership", "IFU role options for Country & Regional Leadership across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["strategic-partners-and-sponsors", "Strategic Partners & Sponsors", "IFU role options for Strategic Partners & Sponsors across preview discovery, onboarding, partnership, and follow-up workflows."],
  ["ifu-executive-and-advisory", "IFU Executive & Advisory", "IFU role options for IFU Executive & Advisory across preview discovery, onboarding, partnership, and follow-up workflows."],
] as const;

const roleSeeds = [
  ["farmer", "Farmer", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Professional"],
  ["smallholder-farmer", "Smallholder Farmer", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Professional"],
  ["commercial-farmer", "Commercial Farmer", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Intermediate"],
  ["crop-producer", "Crop Producer", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Professional"],
  ["rancher", "Rancher", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Professional"],
  ["livestock-producer", "Livestock Producer", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Intermediate"],
  ["dairy-farmer", "Dairy Farmer", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Professional"],
  ["poultry-farmer", "Poultry Farmer", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Professional"],
  ["pig-farmer", "Pig Farmer", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Intermediate"],
  ["goat-farmer", "Goat Farmer", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Professional"],
  ["sheep-farmer", "Sheep Farmer", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Professional"],
  ["beekeeper", "Beekeeper", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Intermediate"],
  ["fisherman", "Fisherman", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Professional"],
  ["aquaculture-producer", "Aquaculture Producer", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Professional"],
  ["forester", "Forester", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Intermediate"],
  ["agroforestry-producer", "Agroforestry Producer", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Professional"],
  ["greenhouse-farmer", "Greenhouse Farmer", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Professional"],
  ["hydroponic-grower", "Hydroponic Grower", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Intermediate"],
  ["organic-farmer", "Organic Farmer", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Professional"],
  ["specialty-crop-farmer", "Specialty Crop Farmer", "producers-and-primary-agriculture", "Producers & Primary Agriculture", "Professional"],
  ["buyer", "Buyer", "trade-and-marketplace", "Trade & Marketplace", "Intermediate"],
  ["importer", "Importer", "trade-and-marketplace", "Trade & Marketplace", "Professional"],
  ["exporter", "Exporter", "trade-and-marketplace", "Trade & Marketplace", "Professional"],
  ["trader", "Trader", "trade-and-marketplace", "Trade & Marketplace", "Intermediate"],
  ["distributor", "Distributor", "trade-and-marketplace", "Trade & Marketplace", "Professional"],
  ["wholesaler", "Wholesaler", "trade-and-marketplace", "Trade & Marketplace", "Professional"],
  ["retailer", "Retailer", "trade-and-marketplace", "Trade & Marketplace", "Intermediate"],
  ["food-processor", "Food Processor", "trade-and-marketplace", "Trade & Marketplace", "Professional"],
  ["commodity-broker", "Commodity Broker", "trade-and-marketplace", "Trade & Marketplace", "Professional"],
  ["procurement-officer", "Procurement Officer", "trade-and-marketplace", "Trade & Marketplace", "Leadership"],
  ["export-agent", "Export Agent", "trade-and-marketplace", "Trade & Marketplace", "Professional"],
  ["import-agent", "Import Agent", "trade-and-marketplace", "Trade & Marketplace", "Professional"],
  ["warehouse-operator", "Warehouse Operator", "trade-and-marketplace", "Trade & Marketplace", "Intermediate"],
  ["cold-chain-operator", "Cold Chain Operator", "trade-and-marketplace", "Trade & Marketplace", "Professional"],
  ["logistics-provider", "Logistics Provider", "trade-and-marketplace", "Trade & Marketplace", "Professional"],
  ["freight-forwarder", "Freight Forwarder", "trade-and-marketplace", "Trade & Marketplace", "Intermediate"],
  ["packaging-supplier", "Packaging Supplier", "trade-and-marketplace", "Trade & Marketplace", "Professional"],
  ["quality-inspector", "Quality Inspector", "trade-and-marketplace", "Trade & Marketplace", "Professional"],
  ["market-analyst", "Market Analyst", "trade-and-marketplace", "Trade & Marketplace", "Intermediate"],
  ["agriexchange-seller", "AgriExchange Seller", "trade-and-marketplace", "Trade & Marketplace", "Professional"],
  ["investor", "Investor", "finance-and-funding", "Finance & Funding", "Professional"],
  ["impact-investor", "Impact Investor", "finance-and-funding", "Finance & Funding", "Intermediate"],
  ["donor", "Donor", "finance-and-funding", "Finance & Funding", "Professional"],
  ["philanthropist", "Philanthropist", "finance-and-funding", "Finance & Funding", "Professional"],
  ["lender", "Lender", "finance-and-funding", "Finance & Funding", "Intermediate"],
  ["microfinance-provider", "Microfinance Provider", "finance-and-funding", "Finance & Funding", "Professional"],
  ["insurance-provider", "Insurance Provider", "finance-and-funding", "Finance & Funding", "Professional"],
  ["grant-provider", "Grant Provider", "finance-and-funding", "Finance & Funding", "Intermediate"],
  ["venture-capital-partner", "Venture Capital Partner", "finance-and-funding", "Finance & Funding", "Professional"],
  ["angel-investor", "Angel Investor", "finance-and-funding", "Finance & Funding", "Professional"],
  ["development-finance-officer", "Development Finance Officer", "finance-and-funding", "Finance & Funding", "Leadership"],
  ["bank-officer", "Bank Officer", "finance-and-funding", "Finance & Funding", "Leadership"],
  ["crowdfunding-partner", "Crowdfunding Partner", "finance-and-funding", "Finance & Funding", "Professional"],
  ["sponsorship-partner", "Sponsorship Partner", "finance-and-funding", "Finance & Funding", "Intermediate"],
  ["esg-investor", "ESG Investor", "finance-and-funding", "Finance & Funding", "Professional"],
  ["carbon-finance-partner", "Carbon Finance Partner", "finance-and-funding", "Finance & Funding", "Professional"],
  ["loan-officer", "Loan Officer", "finance-and-funding", "Finance & Funding", "Leadership"],
  ["risk-analyst", "Risk Analyst", "finance-and-funding", "Finance & Funding", "Professional"],
  ["agricultural-economist", "Agricultural Economist", "finance-and-funding", "Finance & Funding", "Professional"],
  ["funding-advisor", "Funding Advisor", "finance-and-funding", "Finance & Funding", "Leadership"],
  ["ministry-official", "Ministry Official", "government-and-institutions", "Government & Institutions", "Professional"],
  ["trade-authority", "Trade Authority", "government-and-institutions", "Government & Institutions", "Professional"],
  ["development-agency-officer", "Development Agency Officer", "government-and-institutions", "Government & Institutions", "Leadership"],
  ["municipality-representative", "Municipality Representative", "government-and-institutions", "Government & Institutions", "Leadership"],
  ["policy-maker", "Policy Maker", "government-and-institutions", "Government & Institutions", "Professional"],
  ["regulator", "Regulator", "government-and-institutions", "Government & Institutions", "Intermediate"],
  ["agricultural-extension-department", "Agricultural Extension Department", "government-and-institutions", "Government & Institutions", "Professional"],
  ["customs-officer", "Customs Officer", "government-and-institutions", "Government & Institutions", "Leadership"],
  ["food-safety-authority", "Food Safety Authority", "government-and-institutions", "Government & Institutions", "Intermediate"],
  ["standards-agency-officer", "Standards Agency Officer", "government-and-institutions", "Government & Institutions", "Leadership"],
  ["rural-development-officer", "Rural Development Officer", "government-and-institutions", "Government & Institutions", "Leadership"],
  ["embassy-trade-officer", "Embassy Trade Officer", "government-and-institutions", "Government & Institutions", "Leadership"],
  ["public-procurement-officer", "Public Procurement Officer", "government-and-institutions", "Government & Institutions", "Leadership"],
  ["climate-agency-officer", "Climate Agency Officer", "government-and-institutions", "Government & Institutions", "Leadership"],
  ["land-administration-officer", "Land Administration Officer", "government-and-institutions", "Government & Institutions", "Leadership"],
  ["professor", "Professor", "education-and-research", "Education & Research", "Professional"],
  ["university-partner", "University Partner", "education-and-research", "Education & Research", "Professional"],
  ["researcher", "Researcher", "education-and-research", "Education & Research", "Intermediate"],
  ["educator", "Educator", "education-and-research", "Education & Research", "Professional"],
  ["training-center", "Training Center", "education-and-research", "Education & Research", "Professional"],
  ["student", "Student", "education-and-research", "Education & Research", "Intermediate"],
  ["curriculum-developer", "Curriculum Developer", "education-and-research", "Education & Research", "Professional"],
  ["instructional-designer", "Instructional Designer", "education-and-research", "Education & Research", "Professional"],
  ["agricultural-scientist", "Agricultural Scientist", "education-and-research", "Education & Research", "Intermediate"],
  ["soil-scientist", "Soil Scientist", "education-and-research", "Education & Research", "Professional"],
  ["climate-researcher", "Climate Researcher", "education-and-research", "Education & Research", "Professional"],
  ["food-systems-researcher", "Food Systems Researcher", "education-and-research", "Education & Research", "Intermediate"],
  ["innovation-lab-director", "Innovation Lab Director", "education-and-research", "Education & Research", "Leadership"],
  ["extension-educator", "Extension Educator", "education-and-research", "Education & Research", "Professional"],
  ["certification-trainer", "Certification Trainer", "education-and-research", "Education & Research", "Intermediate"],
  ["ngo-representative", "NGO Representative", "ngo-and-social-impact", "NGO & Social Impact", "Leadership"],
  ["foundation-representative", "Foundation Representative", "ngo-and-social-impact", "NGO & Social Impact", "Leadership"],
  ["volunteer", "Volunteer", "ngo-and-social-impact", "NGO & Social Impact", "Intermediate"],
  ["community-leader", "Community Leader", "ngo-and-social-impact", "NGO & Social Impact", "Leadership"],
  ["women-organization-leader", "Women Organization Leader", "ngo-and-social-impact", "NGO & Social Impact", "Leadership"],
  ["youth-organization-leader", "Youth Organization Leader", "ngo-and-social-impact", "NGO & Social Impact", "Leadership"],
  ["food-bank-manager", "Food Bank Manager", "ngo-and-social-impact", "NGO & Social Impact", "Leadership"],
  ["humanitarian-program-manager", "Humanitarian Program Manager", "ngo-and-social-impact", "NGO & Social Impact", "Leadership"],
  ["rural-development-advocate", "Rural Development Advocate", "ngo-and-social-impact", "NGO & Social Impact", "Intermediate"],
  ["food-security-officer", "Food Security Officer", "ngo-and-social-impact", "NGO & Social Impact", "Leadership"],
  ["nutrition-program-officer", "Nutrition Program Officer", "ngo-and-social-impact", "NGO & Social Impact", "Leadership"],
  ["social-enterprise-founder", "Social Enterprise Founder", "ngo-and-social-impact", "NGO & Social Impact", "Intermediate"],
  ["cooperative-support-officer", "Cooperative Support Officer", "ngo-and-social-impact", "NGO & Social Impact", "Leadership"],
  ["impact-measurement-specialist", "Impact Measurement Specialist", "ngo-and-social-impact", "NGO & Social Impact", "Professional"],
  ["community-organizer", "Community Organizer", "ngo-and-social-impact", "NGO & Social Impact", "Intermediate"],
  ["agronomist", "Agronomist", "agricultural-services", "Agricultural Services", "Professional"],
  ["veterinarian", "Veterinarian", "agricultural-services", "Agricultural Services", "Professional"],
  ["extension-officer", "Extension Officer", "agricultural-services", "Agricultural Services", "Leadership"],
  ["seed-supplier", "Seed Supplier", "agricultural-services", "Agricultural Services", "Professional"],
  ["equipment-dealer", "Equipment Dealer", "agricultural-services", "Agricultural Services", "Professional"],
  ["irrigation-specialist", "Irrigation Specialist", "agricultural-services", "Agricultural Services", "Intermediate"],
  ["certification-agency", "Certification Agency", "agricultural-services", "Agricultural Services", "Professional"],
  ["soil-testing-provider", "Soil Testing Provider", "agricultural-services", "Agricultural Services", "Professional"],
  ["pest-management-advisor", "Pest Management Advisor", "agricultural-services", "Agricultural Services", "Leadership"],
  ["farm-mechanization-specialist", "Farm Mechanization Specialist", "agricultural-services", "Agricultural Services", "Professional"],
  ["animal-health-advisor", "Animal Health Advisor", "agricultural-services", "Agricultural Services", "Leadership"],
  ["crop-consultant", "Crop Consultant", "agricultural-services", "Agricultural Services", "Intermediate"],
  ["fertilizer-supplier", "Fertilizer Supplier", "agricultural-services", "Agricultural Services", "Professional"],
  ["feed-supplier", "Feed Supplier", "agricultural-services", "Agricultural Services", "Professional"],
  ["post-harvest-specialist", "Post-Harvest Specialist", "agricultural-services", "Agricultural Services", "Intermediate"],
  ["ai-provider", "AI Provider", "technology-and-innovation", "Technology & Innovation", "Professional"],
  ["data-partner", "Data Partner", "technology-and-innovation", "Technology & Innovation", "Professional"],
  ["startup-founder", "Startup Founder", "technology-and-innovation", "Technology & Innovation", "Intermediate"],
  ["innovation-hub", "Innovation Hub", "technology-and-innovation", "Technology & Innovation", "Professional"],
  ["software-developer", "Software Developer", "technology-and-innovation", "Technology & Innovation", "Professional"],
  ["drone-operator", "Drone Operator", "technology-and-innovation", "Technology & Innovation", "Intermediate"],
  ["iot-sensor-provider", "IoT Sensor Provider", "technology-and-innovation", "Technology & Innovation", "Professional"],
  ["gis-specialist", "GIS Specialist", "technology-and-innovation", "Technology & Innovation", "Professional"],
  ["precision-agriculture-advisor", "Precision Agriculture Advisor", "technology-and-innovation", "Technology & Innovation", "Leadership"],
  ["digital-identity-provider", "Digital Identity Provider", "technology-and-innovation", "Technology & Innovation", "Professional"],
  ["blockchain-traceability-partner", "Blockchain Traceability Partner", "technology-and-innovation", "Technology & Innovation", "Professional"],
  ["robotics-provider", "Robotics Provider", "technology-and-innovation", "Technology & Innovation", "Intermediate"],
  ["climate-tech-founder", "Climate Tech Founder", "technology-and-innovation", "Technology & Innovation", "Professional"],
  ["agtech-product-manager", "AgTech Product Manager", "technology-and-innovation", "Technology & Innovation", "Leadership"],
  ["cybersecurity-advisor", "Cybersecurity Advisor", "technology-and-innovation", "Technology & Innovation", "Leadership"],
  ["journalist", "Journalist", "media-and-communications", "Media & Communications", "Professional"],
  ["media-partner", "Media Partner", "media-and-communications", "Media & Communications", "Professional"],
  ["broadcaster", "Broadcaster", "media-and-communications", "Media & Communications", "Intermediate"],
  ["content-creator", "Content Creator", "media-and-communications", "Media & Communications", "Professional"],
  ["influencer", "Influencer", "media-and-communications", "Media & Communications", "Professional"],
  ["documentary-producer", "Documentary Producer", "media-and-communications", "Media & Communications", "Intermediate"],
  ["agricultural-writer", "Agricultural Writer", "media-and-communications", "Media & Communications", "Professional"],
  ["podcast-host", "Podcast Host", "media-and-communications", "Media & Communications", "Professional"],
  ["public-relations-partner", "Public Relations Partner", "media-and-communications", "Media & Communications", "Intermediate"],
  ["video-story-producer", "Video Story Producer", "media-and-communications", "Media & Communications", "Professional"],
  ["consumer", "Consumer", "public-and-visitors", "Public & Visitors", "Professional"],
  ["community-supporter", "Community Supporter", "public-and-visitors", "Public & Visitors", "Intermediate"],
  ["visitor", "Visitor", "public-and-visitors", "Public & Visitors", "Professional"],
  ["agritourism-visitor", "Agritourism Visitor", "public-and-visitors", "Public & Visitors", "Professional"],
  ["food-enthusiast", "Food Enthusiast", "public-and-visitors", "Public & Visitors", "Intermediate"],
  ["student-visitor", "Student Visitor", "public-and-visitors", "Public & Visitors", "Professional"],
  ["public-advocate", "Public Advocate", "public-and-visitors", "Public & Visitors", "Professional"],
  ["family-supporter", "Family Supporter", "public-and-visitors", "Public & Visitors", "Intermediate"],
  ["cultural-exchange-visitor", "Cultural Exchange Visitor", "public-and-visitors", "Public & Visitors", "Professional"],
  ["volunteer-visitor", "Volunteer Visitor", "public-and-visitors", "Public & Visitors", "Professional"],
  ["agritourism-partner", "Agritourism Partner", "agritourism-and-hospitality", "AgriTourism & Hospitality", "Intermediate"],
  ["farm-stay-host", "Farm Stay Host", "agritourism-and-hospitality", "AgriTourism & Hospitality", "Professional"],
  ["farm-tour-operator", "Farm Tour Operator", "agritourism-and-hospitality", "AgriTourism & Hospitality", "Professional"],
  ["eco-tourism-operator", "Eco-Tourism Operator", "agritourism-and-hospitality", "AgriTourism & Hospitality", "Intermediate"],
  ["food-trail-organizer", "Food Trail Organizer", "agritourism-and-hospitality", "AgriTourism & Hospitality", "Professional"],
  ["rural-tourism-board", "Rural Tourism Board", "agritourism-and-hospitality", "AgriTourism & Hospitality", "Leadership"],
  ["culinary-tourism-partner", "Culinary Tourism Partner", "agritourism-and-hospitality", "AgriTourism & Hospitality", "Intermediate"],
  ["harvest-experience-host", "Harvest Experience Host", "agritourism-and-hospitality", "AgriTourism & Hospitality", "Professional"],
  ["educational-farm-host", "Educational Farm Host", "agritourism-and-hospitality", "AgriTourism & Hospitality", "Professional"],
  ["farm-event-organizer", "Farm Event Organizer", "agritourism-and-hospitality", "AgriTourism & Hospitality", "Intermediate"],
  ["sustainability-advisor", "Sustainability Advisor", "sustainability-and-agrifuture", "Sustainability & AgriFuture", "Leadership"],
  ["climate-smart-agriculture-specialist", "Climate Smart Agriculture Specialist", "sustainability-and-agrifuture", "Sustainability & AgriFuture", "Professional"],
  ["renewable-energy-partner", "Renewable Energy Partner", "sustainability-and-agrifuture", "Sustainability & AgriFuture", "Intermediate"],
  ["solar-irrigation-provider", "Solar Irrigation Provider", "sustainability-and-agrifuture", "Sustainability & AgriFuture", "Professional"],
  ["biogas-project-developer", "Biogas Project Developer", "sustainability-and-agrifuture", "Sustainability & AgriFuture", "Professional"],
  ["carbon-credit-developer", "Carbon Credit Developer", "sustainability-and-agrifuture", "Sustainability & AgriFuture", "Intermediate"],
  ["esg-reporting-specialist", "ESG Reporting Specialist", "sustainability-and-agrifuture", "Sustainability & AgriFuture", "Professional"],
  ["regenerative-agriculture-advisor", "Regenerative Agriculture Advisor", "sustainability-and-agrifuture", "Sustainability & AgriFuture", "Leadership"],
  ["water-conservation-specialist", "Water Conservation Specialist", "sustainability-and-agrifuture", "Sustainability & AgriFuture", "Intermediate"],
  ["biodiversity-specialist", "Biodiversity Specialist", "sustainability-and-agrifuture", "Sustainability & AgriFuture", "Professional"],
  ["circular-agriculture-specialist", "Circular Agriculture Specialist", "sustainability-and-agrifuture", "Sustainability & AgriFuture", "Professional"],
  ["clean-energy-investor", "Clean Energy Investor", "sustainability-and-agrifuture", "Sustainability & AgriFuture", "Intermediate"],
  ["climate-risk-analyst", "Climate Risk Analyst", "sustainability-and-agrifuture", "Sustainability & AgriFuture", "Professional"],
  ["cooperative-leader", "Cooperative Leader", "cooperatives-and-associations", "Cooperatives & Associations", "Leadership"],
  ["farmer-association-leader", "Farmer Association Leader", "cooperatives-and-associations", "Cooperatives & Associations", "Leadership"],
  ["producer-organization-manager", "Producer Organization Manager", "cooperatives-and-associations", "Cooperatives & Associations", "Leadership"],
  ["cooperative-member", "Cooperative Member", "cooperatives-and-associations", "Cooperatives & Associations", "Professional"],
  ["union-representative", "Union Representative", "cooperatives-and-associations", "Cooperatives & Associations", "Leadership"],
  ["membership-coordinator", "Membership Coordinator", "cooperatives-and-associations", "Cooperatives & Associations", "Professional"],
  ["cooperative-finance-officer", "Cooperative Finance Officer", "cooperatives-and-associations", "Cooperatives & Associations", "Leadership"],
  ["cooperative-export-manager", "Cooperative Export Manager", "cooperatives-and-associations", "Cooperatives & Associations", "Leadership"],
  ["cooperative-training-lead", "Cooperative Training Lead", "cooperatives-and-associations", "Cooperatives & Associations", "Professional"],
  ["association-secretary", "Association Secretary", "cooperatives-and-associations", "Cooperatives & Associations", "Professional"],
  ["nutritionist", "Nutritionist", "food-security-and-nutrition", "Food Security & Nutrition", "Intermediate"],
  ["food-security-analyst", "Food Security Analyst", "food-security-and-nutrition", "Food Security & Nutrition", "Professional"],
  ["school-meal-program-manager", "School Meal Program Manager", "food-security-and-nutrition", "Food Security & Nutrition", "Leadership"],
  ["food-relief-coordinator", "Food Relief Coordinator", "food-security-and-nutrition", "Food Security & Nutrition", "Intermediate"],
  ["emergency-food-response-officer", "Emergency Food Response Officer", "food-security-and-nutrition", "Food Security & Nutrition", "Leadership"],
  ["community-kitchen-manager", "Community Kitchen Manager", "food-security-and-nutrition", "Food Security & Nutrition", "Leadership"],
  ["nutrition-educator", "Nutrition Educator", "food-security-and-nutrition", "Food Security & Nutrition", "Intermediate"],
  ["food-systems-planner", "Food Systems Planner", "food-security-and-nutrition", "Food Security & Nutrition", "Professional"],
  ["public-health-food-advisor", "Public Health Food Advisor", "food-security-and-nutrition", "Food Security & Nutrition", "Leadership"],
  ["food-access-coordinator", "Food Access Coordinator", "food-security-and-nutrition", "Food Security & Nutrition", "Intermediate"],
  ["compliance-officer", "Compliance Officer", "compliance-and-certification", "Compliance & Certification", "Leadership"],
  ["organic-certifier", "Organic Certifier", "compliance-and-certification", "Compliance & Certification", "Professional"],
  ["fairtrade-auditor", "Fairtrade Auditor", "compliance-and-certification", "Compliance & Certification", "Intermediate"],
  ["globalgap-advisor", "GlobalGAP Advisor", "compliance-and-certification", "Compliance & Certification", "Leadership"],
  ["traceability-specialist", "Traceability Specialist", "compliance-and-certification", "Compliance & Certification", "Professional"],
  ["food-safety-auditor", "Food Safety Auditor", "compliance-and-certification", "Compliance & Certification", "Intermediate"],
  ["export-compliance-advisor", "Export Compliance Advisor", "compliance-and-certification", "Compliance & Certification", "Leadership"],
  ["import-compliance-advisor", "Import Compliance Advisor", "compliance-and-certification", "Compliance & Certification", "Leadership"],
  ["risk-manager", "Risk Manager", "compliance-and-certification", "Compliance & Certification", "Leadership"],
  ["standards-consultant", "Standards Consultant", "compliance-and-certification", "Compliance & Certification", "Professional"],
  ["data-analyst", "Data Analyst", "data-and-intelligence", "Data & Intelligence", "Professional"],
  ["data-scientist", "Data Scientist", "data-and-intelligence", "Data & Intelligence", "Intermediate"],
  ["business-intelligence-analyst", "Business Intelligence Analyst", "data-and-intelligence", "Data & Intelligence", "Professional"],
  ["agricultural-statistician", "Agricultural Statistician", "data-and-intelligence", "Data & Intelligence", "Professional"],
  ["data-engineer", "Data Engineer", "data-and-intelligence", "Data & Intelligence", "Intermediate"],
  ["data-steward", "Data Steward", "data-and-intelligence", "Data & Intelligence", "Professional"],
  ["api-partner", "API Partner", "data-and-intelligence", "Data & Intelligence", "Professional"],
  ["dashboard-designer", "Dashboard Designer", "data-and-intelligence", "Data & Intelligence", "Leadership"],
  ["quicksight-analyst", "QuickSight Analyst", "data-and-intelligence", "Data & Intelligence", "Professional"],
  ["research-data-partner", "Research Data Partner", "data-and-intelligence", "Data & Intelligence", "Professional"],
  ["legal-advisor", "Legal Advisor", "legal-and-governance", "Legal & Governance", "Leadership"],
  ["contract-specialist", "Contract Specialist", "legal-and-governance", "Legal & Governance", "Professional"],
  ["mediation-advisor", "Mediation Advisor", "legal-and-governance", "Legal & Governance", "Leadership"],
  ["board-member", "Board Member", "legal-and-governance", "Legal & Governance", "Leadership"],
  ["governance-advisor", "Governance Advisor", "legal-and-governance", "Legal & Governance", "Leadership"],
  ["ethics-officer", "Ethics Officer", "legal-and-governance", "Legal & Governance", "Leadership"],
  ["ip-advisor", "IP Advisor", "legal-and-governance", "Legal & Governance", "Leadership"],
  ["policy-counsel", "Policy Counsel", "legal-and-governance", "Legal & Governance", "Professional"],
  ["regulatory-counsel", "Regulatory Counsel", "legal-and-governance", "Legal & Governance", "Professional"],
  ["international-trade-lawyer", "International Trade Lawyer", "legal-and-governance", "Legal & Governance", "Intermediate"],
  ["platform-administrator", "Platform Administrator", "operations-and-administration", "Operations & Administration", "Professional"],
  ["program-manager", "Program Manager", "operations-and-administration", "Operations & Administration", "Leadership"],
  ["operations-manager", "Operations Manager", "operations-and-administration", "Operations & Administration", "Leadership"],
  ["customer-support-agent", "Customer Support Agent", "operations-and-administration", "Operations & Administration", "Professional"],
  ["qa-tester", "QA Tester", "operations-and-administration", "Operations & Administration", "Professional"],
  ["product-owner", "Product Owner", "operations-and-administration", "Operations & Administration", "Intermediate"],
  ["project-manager", "Project Manager", "operations-and-administration", "Operations & Administration", "Leadership"],
  ["community-manager", "Community Manager", "operations-and-administration", "Operations & Administration", "Leadership"],
  ["crm-manager", "CRM Manager", "operations-and-administration", "Operations & Administration", "Leadership"],
  ["administrative-assistant", "Administrative Assistant", "operations-and-administration", "Operations & Administration", "Professional"],
  ["country-representative", "Country Representative", "country-and-regional-leadership", "Country & Regional Leadership", "Leadership"],
  ["regional-representative", "Regional Representative", "country-and-regional-leadership", "Country & Regional Leadership", "Leadership"],
  ["global-ambassador", "Global Ambassador", "country-and-regional-leadership", "Country & Regional Leadership", "Leadership"],
  ["chapter-director", "Chapter Director", "country-and-regional-leadership", "Country & Regional Leadership", "Leadership"],
  ["country-coordinator", "Country Coordinator", "country-and-regional-leadership", "Country & Regional Leadership", "Intermediate"],
  ["pilot-country-lead", "Pilot Country Lead", "country-and-regional-leadership", "Country & Regional Leadership", "Professional"],
  ["regional-program-lead", "Regional Program Lead", "country-and-regional-leadership", "Country & Regional Leadership", "Professional"],
  ["partnership-ambassador", "Partnership Ambassador", "country-and-regional-leadership", "Country & Regional Leadership", "Leadership"],
  ["youth-ambassador", "Youth Ambassador", "country-and-regional-leadership", "Country & Regional Leadership", "Leadership"],
  ["women-program-ambassador", "Women Program Ambassador", "country-and-regional-leadership", "Country & Regional Leadership", "Leadership"],
  ["strategic-partner", "Strategic Partner", "strategic-partners-and-sponsors", "Strategic Partners & Sponsors", "Intermediate"],
  ["corporate-sponsor", "Corporate Sponsor", "strategic-partners-and-sponsors", "Strategic Partners & Sponsors", "Professional"],
  ["university-sponsor", "University Sponsor", "strategic-partners-and-sponsors", "Strategic Partners & Sponsors", "Professional"],
  ["foundation-sponsor", "Foundation Sponsor", "strategic-partners-and-sponsors", "Strategic Partners & Sponsors", "Intermediate"],
  ["technology-sponsor", "Technology Sponsor", "strategic-partners-and-sponsors", "Strategic Partners & Sponsors", "Professional"],
  ["equipment-sponsor", "Equipment Sponsor", "strategic-partners-and-sponsors", "Strategic Partners & Sponsors", "Professional"],
  ["input-supplier-sponsor", "Input Supplier Sponsor", "strategic-partners-and-sponsors", "Strategic Partners & Sponsors", "Intermediate"],
  ["media-sponsor", "Media Sponsor", "strategic-partners-and-sponsors", "Strategic Partners & Sponsors", "Professional"],
  ["training-sponsor", "Training Sponsor", "strategic-partners-and-sponsors", "Strategic Partners & Sponsors", "Professional"],
  ["event-sponsor", "Event Sponsor", "strategic-partners-and-sponsors", "Strategic Partners & Sponsors", "Intermediate"],
  ["advisory-board-member", "Advisory Board Member", "ifu-executive-and-advisory", "IFU Executive & Advisory", "Leadership"],
  ["executive-member", "Executive Member", "ifu-executive-and-advisory", "IFU Executive & Advisory", "Leadership"],
] as const;

const primaryEcosystemByCategory: Record<string, string> = {
  "producers-and-primary-agriculture": "AgriExchange",
  "trade-and-marketplace": "AgriExchange",
  "finance-and-funding": "AgriCapital",
  "government-and-institutions": "AgriSphere",
  "education-and-research": "AgriAcademie",
  "ngo-and-social-impact": "AgriFunds",
  "agricultural-services": "AgriCentral",
  "technology-and-innovation": "AgriNexus",
  "media-and-communications": "AgriNexus",
  "public-and-visitors": "AgriNexus",
  "agritourism-and-hospitality": "AgriTourisme",
  "sustainability-and-agrifuture": "AgriSphere",
  "cooperatives-and-associations": "AgriCentral",
  "food-security-and-nutrition": "AgriFunds",
  "compliance-and-certification": "AgriShield",
  "data-and-intelligence": "AgriSphere",
  "legal-and-governance": "AgriShield",
  "operations-and-administration": "AgriCentral",
  "country-and-regional-leadership": "AgriSphere",
  "strategic-partners-and-sponsors": "AgriCapital",
  "ifu-executive-and-advisory": "AgriSphere",
};

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function getPrimaryEcosystem(categorySlug: string) {
  return primaryEcosystemByCategory[categorySlug] ?? "AgriNexus";
}

function getPersonaForCategory(categorySlug: string) {
  return (
    discoveryPersonas.find((persona) => persona.categorySlugs.includes(categorySlug)) ??
    discoveryPersonas[0]
  );
}

function normalizeRoleLevel(title: string, categorySlug: string, rawLevel?: string | null): DiscoveryLevel {
  const previewValue = rolePreviewValuesByTitle[title];

  if (previewValue) {
    return previewValue.level;
  }

  if (rawLevel === "Foundation" || rawLevel === "Professional" || rawLevel === "Leadership") {
    return rawLevel;
  }

  const lowerTitle = title.toLowerCase();

  if (
    /\b(student|visitor|consumer|volunteer|supporter|member|smallholder|assistant)\b/.test(
      lowerTitle,
    )
  ) {
    return "Foundation";
  }

  if (
    categorySlug === "country-and-regional-leadership" ||
    categorySlug === "ifu-executive-and-advisory" ||
    /\b(leader|director|representative|ambassador|board|executive|official|authority|minister|ministry|founder|manager|coordinator|sponsor|partner)\b/.test(
      lowerTitle,
    )
  ) {
    return "Leadership";
  }

  return "Professional";
}

function buildFallbackPreviewValue(title: string, categorySlug: string) {
  const primaryEcosystem = getPrimaryEcosystem(categorySlug);

  return `${title} members access ${primaryEcosystem} plus the IFU community in AgriNexus and training in AgriAcademie. Full role benefits published at platform launch.`;
}

function isPlaceholderSummary(summary?: string | null) {
  return !summary || /^Express interest in the .+ role within .+\.$/.test(summary);
}

export function buildDiscoveryRole({
  slug,
  title,
  categorySlug,
  categoryName,
  rawLevel,
  summary,
  sortOrder,
}: {
  slug: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  rawLevel?: string | null;
  summary?: string | null;
  sortOrder: number;
}): DiscoveryRole {
  const persona = getPersonaForCategory(categorySlug);
  const previewValue = rolePreviewValuesByTitle[title];
  const primaryEcosystem = getPrimaryEcosystem(categorySlug);
  const level = normalizeRoleLevel(title, categorySlug, rawLevel);

  return {
    slug,
    title,
    summary:
      previewValue?.previewValue ??
      (isPlaceholderSummary(summary) ? buildFallbackPreviewValue(title, categorySlug) : summary),
    pathway: level,
    level,
    ecosystems: previewValue?.ecosystems ?? uniqueValues([primaryEcosystem, "AgriNexus", "AgriAcademie"]),
    personaSlug: persona.slug,
    personaLabel: persona.label,
    categorySlug,
    categoryName,
    sortOrder,
  };
}

export const discoveryCategories: DiscoveryCategory[] = categorySeeds.map(
  ([slug, name, summary], categoryIndex) => ({
    slug,
    name,
    summary,
    sortOrder: categoryIndex + 1,
    roles: roleSeeds
      .filter(([, , categorySlug]) => categorySlug === slug)
      .map(([roleSlug, roleName, , categoryName, level], roleIndex) =>
        buildDiscoveryRole({
          slug: roleSlug,
          title: roleName,
          categorySlug: slug,
          categoryName,
          rawLevel: level,
          sortOrder: roleIndex + 1,
        }),
      ),
  }),
);

export const discoveryRoles = discoveryCategories.flatMap((category) => category.roles);

export const discoveryMetrics = {
  categories: discoveryCategories.length,
  roles: discoveryRoles.length,
  countries: "190+",
  ecosystems: ecosystemNames.length,
};
