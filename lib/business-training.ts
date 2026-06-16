export type TrainingBadge = "Most Popular" | "Enterprise Favorite" | "New" | "AI Focused"

export type BusinessTrainingProgram = {
  slug: string
  title: string
  shortDescription: string
  overview: string
  duration: string
  deliveryOptions: string[]
  prerequisites: string[]
  learningOutcomes: string[]
  whoShouldAttend: string[]
  curriculum: string[]
  faqs: Array<{ question: string; answer: string }>
  badge: TrainingBadge
}

const sharedFaqs = [
  {
    question: "Can this programme be customized for our team?",
    answer:
      "Yes. We can tailor examples, labs, case studies, and delivery schedules around your business goals, tools, and learner profiles.",
  },
  {
    question: "Do you offer private corporate cohorts?",
    answer:
      "Yes. We can run dedicated sessions for your organization only, either online, onsite, or in a blended hybrid format.",
  },
  {
    question: "Will learners receive certificates?",
    answer:
      "Yes. Learners receive completion certificates once they finish the programme requirements and attendance criteria.",
  },
]

export const businessTrainingPrograms: BusinessTrainingProgram[] = [
  {
    slug: "power-bi",
    title: "Data Analytics & Power BI",
    shortDescription: "Build executive dashboards, automate reporting, and create self-service analytics across teams.",
    overview:
      "This programme equips business teams with the skills to model data, design dashboards, and deliver actionable insights using Power BI. It balances analytics fundamentals with practical reporting workflows used in modern organizations.",
    duration: "2-4 weeks",
    deliveryOptions: ["Online", "Onsite", "Hybrid"],
    prerequisites: ["Comfort using Excel or reporting tools", "Basic understanding of tables and business metrics"],
    learningOutcomes: [
      "Model and transform data for business reporting",
      "Create interactive dashboards and executive scorecards",
      "Apply DAX fundamentals for calculations and KPIs",
      "Publish and manage reports securely for stakeholders",
    ],
    whoShouldAttend: ["Business analysts", "Finance teams", "Operations managers", "Reporting specialists"],
    curriculum: [
      "Introduction to analytics strategy and Power BI architecture",
      "Data loading, transformation, and Power Query workflows",
      "Data modeling, relationships, and star schema basics",
      "DAX calculations, KPIs, and time intelligence",
      "Dashboard design, storytelling, and stakeholder reporting",
      "Publishing, workspaces, governance, and refresh automation",
    ],
    faqs: sharedFaqs,
    badge: "Most Popular",
  },
  {
    slug: "python-for-business",
    title: "Python for Business",
    shortDescription: "Use Python to automate tasks, clean data, and improve business decision-making workflows.",
    overview:
      "Designed for business professionals and technical teams, this programme teaches Python through practical use cases such as reporting automation, data analysis, and workflow optimization.",
    duration: "2-3 weeks",
    deliveryOptions: ["Online", "Onsite", "Hybrid"],
    prerequisites: ["Comfort using spreadsheets", "Basic logic and problem-solving skills"],
    learningOutcomes: [
      "Write Python scripts for business tasks",
      "Automate repetitive manual processes",
      "Analyze structured datasets with Python libraries",
      "Build reusable scripts for internal reporting workflows",
    ],
    whoShouldAttend: ["Analysts", "Operations teams", "Finance professionals", "Technical business users"],
    curriculum: [
      "Python fundamentals for non-developers",
      "Working with variables, conditions, loops, and functions",
      "Reading and cleaning business datasets",
      "Automation with files, reports, and repeatable scripts",
      "Data analysis using pandas",
      "Practical business mini-project and deployment considerations",
    ],
    faqs: sharedFaqs,
    badge: "Enterprise Favorite",
  },
  {
    slug: "data-engineering",
    title: "Data Engineering",
    shortDescription: "Design robust pipelines, scalable data models, and modern ingestion workflows for analytics.",
    overview:
      "This programme focuses on the foundations of enterprise data engineering, from ingestion and transformation to orchestration and data quality. Teams learn how to build reliable pipelines that support reporting and AI initiatives.",
    duration: "4-6 weeks",
    deliveryOptions: ["Online", "Onsite", "Hybrid"],
    prerequisites: ["Basic SQL knowledge", "Exposure to data platforms or databases"],
    learningOutcomes: [
      "Design reliable ingestion and transformation pipelines",
      "Apply data modeling principles for analytics workloads",
      "Understand orchestration, monitoring, and data quality",
      "Support downstream BI and machine learning use cases",
    ],
    whoShouldAttend: ["Data engineers", "BI developers", "Data platform teams", "Technical analysts"],
    curriculum: [
      "Modern data engineering foundations",
      "Batch and streaming ingestion patterns",
      "Data modeling for analytics and warehousing",
      "Transformation pipelines and orchestration",
      "Data quality, observability, and governance",
      "Production readiness, security, and platform operations",
    ],
    faqs: sharedFaqs,
    badge: "Enterprise Favorite",
  },
  {
    slug: "ai-machine-learning",
    title: "Artificial Intelligence & Machine Learning",
    shortDescription: "Understand modern AI use cases and apply machine learning concepts in business contexts.",
    overview:
      "This programme introduces enterprise teams to AI and machine learning concepts, practical business applications, and responsible adoption. It combines technical foundations with real-world implementation thinking.",
    duration: "4-6 weeks",
    deliveryOptions: ["Online", "Onsite", "Hybrid"],
    prerequisites: ["Basic data literacy", "Comfort working with business datasets"],
    learningOutcomes: [
      "Understand core AI and machine learning concepts",
      "Identify business use cases for predictive and generative AI",
      "Evaluate models, risks, and implementation choices",
      "Apply responsible AI and governance principles",
    ],
    whoShouldAttend: ["Innovation teams", "Analysts", "Technical managers", "Data and product leaders"],
    curriculum: [
      "AI, machine learning, and generative AI foundations",
      "Supervised and unsupervised learning concepts",
      "Model evaluation, bias, and practical limitations",
      "Business use cases for forecasting, classification, and automation",
      "Responsible AI, governance, and change management",
      "Adoption roadmap and enterprise implementation planning",
    ],
    faqs: sharedFaqs,
    badge: "AI Focused",
  },
  {
    slug: "microsoft-fabric",
    title: "Microsoft Fabric",
    shortDescription: "Build end-to-end analytics solutions using Fabric, Lakehouse, data pipelines, and reporting.",
    overview:
      "This programme helps teams adopt Microsoft Fabric as a unified analytics platform. Learners explore data integration, Lakehouse design, reporting, and governance in one connected environment.",
    duration: "2-4 weeks",
    deliveryOptions: ["Online", "Onsite", "Hybrid"],
    prerequisites: ["Familiarity with Microsoft data tools", "Basic analytics or reporting experience"],
    learningOutcomes: [
      "Navigate core workloads inside Microsoft Fabric",
      "Build Lakehouse-centric analytics workflows",
      "Create pipelines and reports in a unified platform",
      "Understand governance and workspace administration",
    ],
    whoShouldAttend: ["Data teams", "Power BI developers", "Analytics leads", "Platform administrators"],
    curriculum: [
      "Fabric overview and workspace architecture",
      "Lakehouse concepts and data organization",
      "Pipelines, notebooks, and transformation workflows",
      "Semantic models and reporting integration",
      "Security, governance, and operational considerations",
      "Enterprise deployment patterns and roadmap planning",
    ],
    faqs: sharedFaqs,
    badge: "New",
  },
  {
    slug: "azure-data-platform",
    title: "Azure Data Platform",
    shortDescription: "Use Azure services to ingest, store, transform, and govern enterprise data effectively.",
    overview:
      "This programme covers core Azure data services and patterns for modern analytics platforms. Teams learn how to combine storage, integration, security, and reporting capabilities into production-ready solutions.",
    duration: "3-5 weeks",
    deliveryOptions: ["Online", "Onsite", "Hybrid"],
    prerequisites: ["Basic cloud awareness", "Exposure to data systems or SQL"],
    learningOutcomes: [
      "Understand Azure services used in analytics platforms",
      "Design secure and scalable data workflows",
      "Support warehousing, lake, and reporting use cases",
      "Apply governance and operational best practices",
    ],
    whoShouldAttend: ["Cloud data teams", "Platform engineers", "BI specialists", "Technical architects"],
    curriculum: [
      "Azure data platform foundations",
      "Storage and integration services for analytics",
      "Transformation and warehouse design patterns",
      "Identity, security, and governance",
      "Monitoring, cost optimization, and operations",
      "Reference architectures and deployment planning",
    ],
    faqs: sharedFaqs,
    badge: "Enterprise Favorite",
  },
  {
    slug: "cybersecurity-awareness",
    title: "Cybersecurity Awareness",
    shortDescription: "Strengthen employee security habits and reduce business risk with practical awareness training.",
    overview:
      "This programme focuses on the human side of security by helping staff identify threats, follow security policies, and respond appropriately to common attack vectors such as phishing and social engineering.",
    duration: "1-2 weeks",
    deliveryOptions: ["Online", "Onsite", "Hybrid"],
    prerequisites: ["No technical prerequisites required"],
    learningOutcomes: [
      "Recognize common cyber threats and risky behaviors",
      "Respond better to phishing and social engineering attempts",
      "Apply secure password and access practices",
      "Support a stronger day-to-day security culture",
    ],
    whoShouldAttend: ["All employees", "Line managers", "Support teams", "New hires"],
    curriculum: [
      "Cybersecurity risk overview for modern workplaces",
      "Phishing, social engineering, and threat indicators",
      "Passwords, MFA, and secure access habits",
      "Safe browsing, file sharing, and device usage",
      "Incident reporting and internal security procedures",
      "Building a lasting security-aware culture",
    ],
    faqs: sharedFaqs,
    badge: "Most Popular",
  },
  {
    slug: "project-management",
    title: "Project Management",
    shortDescription: "Deliver projects with stronger planning, stakeholder alignment, and execution discipline.",
    overview:
      "This programme equips teams with practical project management skills covering planning, risk, governance, stakeholder communication, and delivery management across traditional and agile environments.",
    duration: "2-4 weeks",
    deliveryOptions: ["Online", "Onsite", "Hybrid"],
    prerequisites: ["No formal prerequisites", "Experience working on team initiatives is helpful"],
    learningOutcomes: [
      "Plan projects with clearer scope, timeline, and ownership",
      "Manage risks, dependencies, and stakeholder expectations",
      "Use delivery frameworks more effectively",
      "Improve project reporting and governance practices",
    ],
    whoShouldAttend: ["Project managers", "Team leads", "PMO staff", "Business coordinators"],
    curriculum: [
      "Project initiation, scope, and stakeholder analysis",
      "Planning schedules, resources, and milestones",
      "Risk, issues, and governance management",
      "Communication, status reporting, and stakeholder engagement",
      "Agile and hybrid delivery approaches",
      "Project closure, lessons learned, and performance review",
    ],
    faqs: sharedFaqs,
    badge: "Enterprise Favorite",
  },
  {
    slug: "leadership-management",
    title: "Leadership & Management",
    shortDescription: "Develop managers who can lead teams, coach performance, and drive execution confidently.",
    overview:
      "This programme is designed for new and experienced managers who need stronger leadership communication, coaching, delegation, and decision-making capabilities in fast-moving organizations.",
    duration: "2-4 weeks",
    deliveryOptions: ["Online", "Onsite", "Hybrid"],
    prerequisites: ["No formal prerequisites", "Current or aspiring people-management responsibility preferred"],
    learningOutcomes: [
      "Lead teams with clearer direction and accountability",
      "Coach and develop staff more effectively",
      "Handle performance conversations with confidence",
      "Improve team engagement and managerial impact",
    ],
    whoShouldAttend: ["Team leaders", "Supervisors", "Managers", "High-potential employees"],
    curriculum: [
      "Leadership mindset and management fundamentals",
      "Communication, delegation, and expectation setting",
      "Coaching, feedback, and performance conversations",
      "Decision-making, conflict resolution, and motivation",
      "Team culture, trust, and accountability",
      "Personal leadership plan and management action roadmap",
    ],
    faqs: sharedFaqs,
    badge: "Most Popular",
  },
  {
    slug: "microsoft-excel-advanced",
    title: "Microsoft Excel Advanced",
    shortDescription: "Master advanced Excel tools for analysis, modeling, automation, and executive reporting.",
    overview:
      "This programme helps business teams move beyond spreadsheet basics and use Excel as a high-value productivity and reporting tool. It covers advanced functions, analysis workflows, and dashboard-friendly reporting techniques.",
    duration: "1-2 weeks",
    deliveryOptions: ["Online", "Onsite", "Hybrid"],
    prerequisites: ["Confident use of basic Excel formulas and worksheets"],
    learningOutcomes: [
      "Use advanced formulas to solve business reporting problems",
      "Improve data cleaning and transformation in Excel",
      "Build stronger summaries, pivots, and analysis outputs",
      "Create more efficient spreadsheet workflows",
    ],
    whoShouldAttend: ["Finance teams", "Administrators", "Analysts", "Operations staff"],
    curriculum: [
      "Advanced formulas and logical functions",
      "Lookup patterns, text handling, and validation",
      "Tables, pivots, and analytical summarization",
      "Power Query and data preparation basics",
      "Dashboard-style reporting in Excel",
      "Productivity tips, controls, and spreadsheet quality practices",
    ],
    faqs: sharedFaqs,
    badge: "Most Popular",
  },
  {
    slug: "sql-database-development",
    title: "SQL & Database Development",
    shortDescription: "Write better SQL, design efficient databases, and support reporting and application needs.",
    overview:
      "This programme teaches teams how to work confidently with relational databases, write performant SQL, and apply database design principles to common enterprise scenarios.",
    duration: "2-4 weeks",
    deliveryOptions: ["Online", "Onsite", "Hybrid"],
    prerequisites: ["Basic exposure to data tables or reporting tools"],
    learningOutcomes: [
      "Write accurate SQL queries for business and technical use cases",
      "Design normalized schemas and understand key relationships",
      "Improve query quality and maintainability",
      "Support reporting, apps, and integration workflows with SQL",
    ],
    whoShouldAttend: ["Developers", "Analysts", "Data professionals", "Application support teams"],
    curriculum: [
      "Relational database concepts and schema design",
      "SELECT queries, filtering, joins, and aggregations",
      "Subqueries, views, and reusable SQL patterns",
      "Data modification and transaction basics",
      "Database design, normalization, and constraints",
      "Performance fundamentals and enterprise SQL practices",
    ],
    faqs: sharedFaqs,
    badge: "Enterprise Favorite",
  },
  {
    slug: "cloud-computing-aws-azure",
    title: "Cloud Computing (AWS/Azure)",
    shortDescription: "Understand cloud platforms, core architecture, and practical deployment models for business teams.",
    overview:
      "This programme introduces teams to cloud computing principles, major platform services, and common architectural patterns across AWS and Azure. It is ideal for organizations building cloud literacy across technical and business roles.",
    duration: "3-5 weeks",
    deliveryOptions: ["Online", "Onsite", "Hybrid"],
    prerequisites: ["Basic IT awareness", "No prior cloud certification required"],
    learningOutcomes: [
      "Understand core cloud concepts and service models",
      "Navigate common services across AWS and Azure",
      "Evaluate cloud security, cost, and architecture considerations",
      "Communicate more effectively with cloud project teams",
    ],
    whoShouldAttend: ["IT teams", "Technical managers", "Architects", "Cloud project stakeholders"],
    curriculum: [
      "Cloud fundamentals and service models",
      "Core compute, storage, networking, and identity services",
      "Architecture patterns and resilience basics",
      "Security, compliance, and governance in the cloud",
      "Cost optimization and operational visibility",
      "Migration planning and cloud adoption roadmap",
    ],
    faqs: sharedFaqs,
    badge: "New",
  },
]

export function getBusinessTrainingProgram(slug: string) {
  return businessTrainingPrograms.find((program) => program.slug === slug)
}
