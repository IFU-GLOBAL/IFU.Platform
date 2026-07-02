export type DiscoveryRole = {
  slug: string;
  title: string;
  summary: string;
  pathway: string;
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

const categorySeeds = [
  ["farmers-producers", "Farmers & Producers", "Primary growers, ranchers, and farm operators seeking practical tools, learning, market access, and stronger representation."],
  ["cooperatives-unions", "Cooperatives & Unions", "Member-owned organizations coordinating services, aggregation, advocacy, and shared operating systems."],
  ["agribusiness-smes", "Agribusiness & SMEs", "Small and mid-sized agriculture businesses building supply, services, processing, and rural employment."],
  ["buyers-offtakers", "Buyers & Offtakers", "Food companies, distributors, and institutional buyers looking for trusted supply and transparent sourcing."],
  ["research-universities", "Researchers & Universities", "Academic, research, and technical institutions connecting knowledge to field-level adoption."],
  ["extension-training", "Extension & Training", "Educators, trainers, and extension teams translating knowledge into practical farmer support."],
  ["development-agencies", "Development Agencies", "Multilateral, bilateral, and development organizations aligning programs with measurable agricultural impact."],
  ["government-policy", "Government & Policy", "Public agencies and policy teams focused on agricultural resilience, food systems, and rural economies."],
  ["finance-investment", "Finance & Investment", "Banks, investors, donors, and funders connecting capital to credible agricultural opportunities."],
  ["insurance-risk", "Insurance & Risk", "Risk, insurance, and resilience partners supporting farms and enterprises through uncertainty."],
  ["input-suppliers", "Input Suppliers", "Seed, fertilizer, crop protection, feed, and service suppliers reaching producers responsibly."],
  ["equipment-logistics", "Equipment & Logistics", "Machinery, storage, transport, cold-chain, and infrastructure partners improving movement and productivity."],
  ["technology-data", "Technology & Data", "Digital, AI, data, and platform teams building intelligent agricultural systems."],
  ["sustainability-climate", "Sustainability & Climate", "Climate, environment, and regenerative agriculture leaders advancing long-term stewardship."],
  ["food-security-nutrition", "Food Security & Nutrition", "Programs focused on hunger reduction, school meals, local food systems, and nutrition outcomes."],
  ["youth-education", "Youth & Education", "Students, young professionals, and educators preparing the next generation of agricultural leaders."],
  ["women-agriculture", "Women in Agriculture", "Women producers, leaders, entrepreneurs, and networks strengthening inclusive growth."],
  ["rural-communities", "Rural Communities", "Community groups and local institutions improving rural livelihoods and participation."],
  ["ngos-foundations", "NGOs & Foundations", "Civil society and philanthropic partners delivering services, funding, and field support."],
  ["certification-compliance", "Certification & Compliance", "Standards, verification, food safety, traceability, and compliance professionals building trust."],
  ["export-trade", "Export & Trade", "Trade, export, import, customs, and market-entry teams expanding cross-border opportunity."],
  ["processing-manufacturing", "Processing & Manufacturing", "Processors and manufacturers turning raw production into value-added goods."],
  ["media-communications", "Media & Communications", "Storytellers, content teams, and communications partners amplifying agricultural impact."],
  ["health-safety", "Health & Safety", "Practitioners connecting agriculture with worker safety, public health, and resilient communities."],
  ["legal-governance", "Legal & Governance", "Legal, governance, ethics, and board leaders supporting accountable institutions."],
  ["volunteers-ambassadors", "Volunteers & Ambassadors", "Community champions and advocates helping people discover and join the IFU ecosystem."],
] as const;

const roleTemplates = [
  ["ecosystem-explorer", "Ecosystem Explorer", "Discover how this group fits into IFU programs, tools, learning, and global collaboration.", "Discovery"],
  ["member-candidate", "Member Candidate", "Express interest in membership, onboarding, and access to the IFU role-based pathway.", "Membership"],
  ["training-participant", "Training Participant", "Connect to education, skills development, and practical learning through AgriAcademie.", "Education"],
  ["program-contributor", "Program Contributor", "Offer expertise, services, content, field insight, or operational support to IFU initiatives.", "Contribution"],
  ["local-coordinator", "Local Coordinator", "Help organize local participation, referrals, meetings, and community-level activation.", "Coordination"],
  ["regional-advisor", "Regional Advisor", "Advise IFU on regional needs, priorities, partnerships, and implementation realities.", "Advisory"],
  ["data-steward", "Data Steward", "Support responsible data gathering, validation, mapping, and agricultural intelligence workflows.", "Data"],
  ["marketplace-partner", "Marketplace Partner", "Explore buying, selling, sourcing, logistics, or service participation through the IFU marketplace.", "Marketplace"],
  ["program-sponsor", "Program Sponsor", "Support funding, sponsorship, grants, or resources for targeted IFU programs and communities.", "Sponsorship"],
  ["leadership-nominee", "Leadership Nominee", "Signal interest in councils, committees, advisory boards, or future governance pathways.", "Leadership"],
] as const;

export const discoveryCategories: DiscoveryCategory[] = categorySeeds.map(
  ([slug, name, summary], categoryIndex) => ({
    slug,
    name,
    summary,
    sortOrder: categoryIndex + 1,
    roles: roleTemplates.map(([roleSlug, roleName, roleSummary, pathway], roleIndex) => ({
      slug: `${slug}-${roleSlug}`,
      title: `${name} ${roleName}`,
      summary: roleSummary,
      pathway,
      categorySlug: slug,
      categoryName: name,
      sortOrder: roleIndex + 1,
    })),
  }),
);

export const discoveryRoles = discoveryCategories.flatMap((category) => category.roles);

export const discoveryMetrics = {
  categories: discoveryCategories.length,
  roles: discoveryRoles.length,
  countries: "190+",
  pathways: 10,
};
