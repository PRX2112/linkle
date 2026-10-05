import { ProfileTemplate, TemplateId } from "./types";

export const PROFILE_TEMPLATES: Record<TemplateId, ProfileTemplate> = {
  creator: {
    id: "creator",
    name: "Creator",
    tagline: "Video creators, writers, podcasters & digital artists",
    description: "Built for storytellers and community builders looking to share fresh drops, videos, and sponsorships.",
    icon: "🎬",
    badgeColor: "#8b5cf6",
    theme: {
      primaryColor: "#8b5cf6",
      buttonStyle: "pill",
      fontFamily: "Inter",
    },
    bioScaffolding: "Content creator & digital storyteller 🎬 Sharing weekly videos, projects & behind-the-scenes.",
    suggestedSocial: [
      { platform: "youtube", urlPrefix: "https://youtube.com/@", label: "YouTube", placeholder: "yourchannel" },
      { platform: "instagram", urlPrefix: "https://instagram.com/", label: "Instagram", placeholder: "yourhandle" },
      { platform: "twitter", urlPrefix: "https://x.com/", label: "X / Twitter", placeholder: "yourhandle" },
    ],
    suggestedBusinessLinks: [
      {
        title: "Latest Video Release",
        defaultUrl: "https://youtube.com",
        description: "Watch my newest video and join the discussion",
      },
      {
        title: "Creator Gear & Studio Setup",
        defaultUrl: "https://kit.co",
        description: "The cameras, mics, and lighting I use every day",
      },
      {
        title: "Brand Partnerships & Inquiries",
        defaultUrl: "mailto:collaborate@example.com",
        description: "Work together on sponsored videos and campaigns",
      },
    ],
    emailCapture: {
      enabled: true,
      title: "Join my VIP Creator Community",
      placeholder: "Enter your email for weekly drops",
    },
    suggestedContactActions: [
      {
        type: "book_appointment",
        label: "Book a Brand Collaboration",
      },
    ],
    paymentPrompt: {
      platform: "upi",
      title: "Tip Jar & Support",
      description: "Allow your fans to support your independent work directly.",
    },
  },

  freelancer: {
    id: "freelancer",
    name: "Freelancer",
    tagline: "Consultants, designers, writers & independent pros",
    description: "Designed to showcase recent client results, transparent pricing, and instant meeting booking.",
    icon: "💼",
    badgeColor: "#10b981",
    theme: {
      primaryColor: "#10b981",
      buttonStyle: "rounded",
      fontFamily: "Inter",
    },
    bioScaffolding: "Independent specialist helping clients scale, design & launch high-impact digital projects.",
    suggestedSocial: [
      { platform: "linkedin", urlPrefix: "https://linkedin.com/in/", label: "LinkedIn", placeholder: "yourprofile" },
      { platform: "twitter", urlPrefix: "https://x.com/", label: "X / Twitter", placeholder: "yourhandle" },
      { platform: "website", urlPrefix: "https://", label: "Portfolio", placeholder: "yourportfolio.com" },
    ],
    suggestedBusinessLinks: [
      {
        title: "Client Case Studies & Work",
        defaultUrl: "https://",
        description: "Recent client deliverables and measurable business outcomes",
      },
      {
        title: "Services & Engagement Pricing",
        defaultUrl: "https://",
        description: "Explore sprint options, retainers, and scope tiers",
      },
      {
        title: "Schedule a Discovery Call",
        defaultUrl: "https://calendly.com",
        description: "15-minute alignment call for upcoming client engagements",
      },
    ],
    emailCapture: {
      enabled: true,
      title: "Get My Client Playbook",
      placeholder: "Enter your work email address",
    },
    suggestedContactActions: [
      {
        type: "book_appointment",
        label: "Schedule Discovery Call",
      },
      {
        type: "download_resume",
        label: "Download Capabilities Deck",
      },
    ],
    paymentPrompt: {
      platform: "upi",
      title: "Client Retainers & Invoices",
      description: "Accept fast UPI or direct client deposit payments.",
    },
  },

  developer: {
    id: "developer",
    name: "Developer",
    tagline: "Software engineers, OSS contributors & tech builders",
    description: "Highlight your GitHub repos, technical articles, live web apps, and developer profile.",
    icon: "💻",
    badgeColor: "#06b6d4",
    theme: {
      primaryColor: "#06b6d4",
      buttonStyle: "rounded",
      fontFamily: "Inter",
    },
    bioScaffolding: "Full-stack engineer & open-source builder 💻 Turning ideas into fast, resilient software.",
    suggestedSocial: [
      { platform: "github", urlPrefix: "https://github.com/", label: "GitHub", placeholder: "yourusername" },
      { platform: "twitter", urlPrefix: "https://x.com/", label: "X / Twitter", placeholder: "yourhandle" },
      { platform: "linkedin", urlPrefix: "https://linkedin.com/in/", label: "LinkedIn", placeholder: "yourprofile" },
    ],
    suggestedBusinessLinks: [
      {
        title: "Open Source Repositories",
        defaultUrl: "https://github.com",
        description: "Explore my open-source libraries, packages, and CLI tools",
      },
      {
        title: "Technical Blog & Architecture Notes",
        defaultUrl: "https://",
        description: "Articles on distributed systems, React patterns, and web perf",
      },
      {
        title: "Live Product Demos",
        defaultUrl: "https://",
        description: "Interactive full-stack web applications and experiments",
      },
    ],
    emailCapture: {
      enabled: true,
      title: "Developer Newsletter",
      placeholder: "Get notified when I ship new tools",
    },
    suggestedContactActions: [
      {
        type: "download_resume",
        label: "View Engineering Resume",
      },
      {
        type: "vcard",
        label: "Save Contact Details",
      },
    ],
    paymentPrompt: {
      platform: "upi",
      title: "Buy Me a Coffee",
      description: "Support open source contributions and educational guides.",
    },
  },

  photographer: {
    id: "photographer",
    name: "Photographer",
    tagline: "Visual artists, portrait & commercial photographers",
    description: "Curated for visual portfolios, client session bookings, and selling print collections.",
    icon: "📷",
    badgeColor: "#f59e0b",
    theme: {
      primaryColor: "#f59e0b",
      buttonStyle: "pill",
      fontFamily: "Inter",
    },
    bioScaffolding: "Commercial & editorial photographer capturing natural light, raw emotion & timeless stories 📸",
    suggestedSocial: [
      { platform: "instagram", urlPrefix: "https://instagram.com/", label: "Instagram", placeholder: "yourhandle" },
      { platform: "behance", urlPrefix: "https://behance.net/", label: "Behance", placeholder: "yourportfolio" },
      { platform: "website", urlPrefix: "https://", label: "Gallery Website", placeholder: "yourgallery.com" },
    ],
    suggestedBusinessLinks: [
      {
        title: "Commercial & Editorial Gallery",
        defaultUrl: "https://",
        description: "Curated high-resolution portfolios from recent productions",
      },
      {
        title: "Book a Photoshoot Session",
        defaultUrl: "https://",
        description: "Inquire about portraits, weddings, and commercial campaigns",
      },
      {
        title: "Lightroom Presets & Print Shop",
        defaultUrl: "https://",
        description: "Download digital editing presets and order museum-grade prints",
      },
    ],
    emailCapture: {
      enabled: true,
      title: "Print Drops & Studio Updates",
      placeholder: "Enter email for new collection notices",
    },
    suggestedContactActions: [
      {
        type: "book_appointment",
        label: "Inquire for Photoshoot",
      },
    ],
    paymentPrompt: {
      platform: "upi",
      title: "Booking Deposits",
      description: "Quickly receive shoot deposits and print payments.",
    },
  },

  influencer: {
    id: "influencer",
    name: "Influencer",
    tagline: "Fashion, lifestyle, beauty & content ambassadors",
    description: "Optimized for shop-my-look affiliate links, brand collaborations, and community growth.",
    icon: "✨",
    badgeColor: "#ec4899",
    theme: {
      primaryColor: "#ec4899",
      buttonStyle: "pill",
      fontFamily: "Inter",
    },
    bioScaffolding: "Daily lifestyle, travel & wellness ✨ Inspiring intentional everyday living and joyful discovery.",
    suggestedSocial: [
      { platform: "instagram", urlPrefix: "https://instagram.com/", label: "Instagram", placeholder: "yourhandle" },
      { platform: "youtube", urlPrefix: "https://youtube.com/@", label: "YouTube", placeholder: "yourchannel" },
      { platform: "twitter", urlPrefix: "https://x.com/", label: "X / Twitter", placeholder: "yourhandle" },
    ],
    suggestedBusinessLinks: [
      {
        title: "Shop My Daily Outfits & Essentials",
        defaultUrl: "https://",
        description: "Links to outfits, skincare, and home products I use",
      },
      {
        title: "Exclusive Brand Discounts & Promo Codes",
        defaultUrl: "https://",
        description: "Special savings codes for my community",
      },
      {
        title: "Media Kit & Brand Partnerships",
        defaultUrl: "mailto:pr@example.com",
        description: "Audience demographics, engagement metrics, and rates",
      },
    ],
    emailCapture: {
      enabled: true,
      title: "Join My Close Friends Club",
      placeholder: "Get exclusive giveaways & early access",
    },
    suggestedContactActions: [
      {
        type: "book_appointment",
        label: "Brand PR Inquiries",
      },
    ],
    paymentPrompt: {
      platform: "upi",
      title: "Supporter Tips",
      description: "Give fans a direct way to support your daily content.",
    },
  },

  business: {
    id: "business",
    name: "Business",
    tagline: "Startups, agencies, local businesses & brands",
    description: "Built to drive conversions, demo bookings, case study views, and customer acquisition.",
    icon: "🏢",
    badgeColor: "#3b82f6",
    theme: {
      primaryColor: "#3b82f6",
      buttonStyle: "rounded",
      fontFamily: "Inter",
    },
    bioScaffolding: "Delivering modern software solutions and premium products built for ambitious teams 🚀",
    suggestedSocial: [
      { platform: "linkedin", urlPrefix: "https://linkedin.com/company/", label: "LinkedIn", placeholder: "company" },
      { platform: "twitter", urlPrefix: "https://x.com/", label: "X / Twitter", placeholder: "companyhandle" },
      { platform: "website", urlPrefix: "https://", label: "Official Website", placeholder: "company.com" },
    ],
    suggestedBusinessLinks: [
      {
        title: "Explore Our Product Solutions",
        defaultUrl: "https://",
        description: "See how our platform empowers teams to ship faster",
      },
      {
        title: "Request an Enterprise Walkthrough",
        defaultUrl: "https://",
        description: "Schedule a personalized product demo with our team",
      },
      {
        title: "Customer Case Studies & ROI",
        defaultUrl: "https://",
        description: "Read how market leaders achieve measurable results",
      },
    ],
    emailCapture: {
      enabled: true,
      title: "Subscribe to Product Changelog",
      placeholder: "Enter your business email",
    },
    suggestedContactActions: [
      {
        type: "book_appointment",
        label: "Schedule Product Demo",
      },
      {
        type: "vcard",
        label: "Save Company Contact",
      },
    ],
  },

  coach: {
    id: "coach",
    name: "Coach",
    tagline: "Executive, fitness, life & career mentors",
    description: "Tailored to book strategy sessions, showcase transformations, and deliver course materials.",
    icon: "🎯",
    badgeColor: "#7c3aed",
    theme: {
      primaryColor: "#7c3aed",
      buttonStyle: "pill",
      fontFamily: "Inter",
    },
    bioScaffolding: "Certified mindset & performance coach 🎯 Empowering leaders to reach clarity, habits & peak potential.",
    suggestedSocial: [
      { platform: "linkedin", urlPrefix: "https://linkedin.com/in/", label: "LinkedIn", placeholder: "yourprofile" },
      { platform: "youtube", urlPrefix: "https://youtube.com/@", label: "YouTube", placeholder: "yourchannel" },
      { platform: "instagram", urlPrefix: "https://instagram.com/", label: "Instagram", placeholder: "yourhandle" },
    ],
    suggestedBusinessLinks: [
      {
        title: "Apply for 1-on-1 Mentorship",
        defaultUrl: "https://",
        description: "Personalized coaching roadmap designed for lasting growth",
      },
      {
        title: "Free 15-Minute Strategy Alignment Call",
        defaultUrl: "https://calendly.com",
        description: "Audit your current routine and identify quick breakthrough wins",
      },
      {
        title: "Client Testimonials & Transformations",
        defaultUrl: "https://",
        description: "Real stories and feedback from previous coaching cohorts",
      },
    ],
    emailCapture: {
      enabled: true,
      title: "Get My Free 7-Day Habit Blueprint",
      placeholder: "Where should we send your guide?",
    },
    suggestedContactActions: [
      {
        type: "book_appointment",
        label: "Book Strategy Session",
      },
    ],
    paymentPrompt: {
      platform: "upi",
      title: "Coaching Sessions",
      description: "Receive instant consultation and session deposits.",
    },
  },

  job_seeker: {
    id: "job_seeker",
    name: "Job Seeker",
    tagline: "Professionals seeking their next impactful role",
    description: "Structured to put your resume, case studies, and recommendations front-and-center for recruiters.",
    icon: "📄",
    badgeColor: "#0284c7",
    theme: {
      primaryColor: "#0284c7",
      buttonStyle: "rounded",
      fontFamily: "Inter",
    },
    bioScaffolding: "Product-minded professional actively seeking new opportunities in high-growth tech & design 🔍",
    suggestedSocial: [
      { platform: "linkedin", urlPrefix: "https://linkedin.com/in/", label: "LinkedIn", placeholder: "yourprofile" },
      { platform: "github", urlPrefix: "https://github.com/", label: "GitHub / Portfolio", placeholder: "yourusername" },
      { platform: "twitter", urlPrefix: "https://x.com/", label: "X / Twitter", placeholder: "yourhandle" },
    ],
    suggestedBusinessLinks: [
      {
        title: "Download Full Resume / CV (PDF)",
        defaultUrl: "https://",
        description: "Detailed career timeline, verified credentials, and achievements",
      },
      {
        title: "Selected Case Studies & Impact",
        defaultUrl: "https://",
        description: "Deep dive into problems solved and measurable business value",
      },
      {
        title: "Peer Recommendations & References",
        defaultUrl: "https://linkedin.com",
        description: "Written feedback from past managers, teammates, and clients",
      },
    ],
    emailCapture: {
      enabled: false,
      title: "Stay in Touch",
      placeholder: "Enter your email",
    },
    suggestedContactActions: [
      {
        type: "download_resume",
        label: "Download Full Resume",
      },
      {
        type: "book_appointment",
        label: "Schedule Recruiter Screen",
      },
    ],
  },

  student: {
    id: "student",
    name: "Student",
    tagline: "University students, researchers & aspiring talent",
    description: "Ideal for sharing coursework, hackathon victories, academic research, and campus projects.",
    icon: "🎓",
    badgeColor: "#14b8a6",
    theme: {
      primaryColor: "#14b8a6",
      buttonStyle: "pill",
      fontFamily: "Inter",
    },
    bioScaffolding: "Undergraduate student & aspiring researcher 🎓 Exploring technology, design & collaborative problem solving.",
    suggestedSocial: [
      { platform: "linkedin", urlPrefix: "https://linkedin.com/in/", label: "LinkedIn", placeholder: "yourprofile" },
      { platform: "github", urlPrefix: "https://github.com/", label: "GitHub", placeholder: "yourusername" },
      { platform: "instagram", urlPrefix: "https://instagram.com/", label: "Instagram", placeholder: "yourhandle" },
    ],
    suggestedBusinessLinks: [
      {
        title: "Academic Projects & Hackathons",
        defaultUrl: "https://github.com",
        description: "Coursework highlights, capstone projects, and team hackathons",
      },
      {
        title: "My Student Resume & Coursework",
        defaultUrl: "https://",
        description: "Academic honors, GPA, relevant modules, and internships",
      },
      {
        title: "Campus Leadership & Society Roles",
        defaultUrl: "https://",
        description: "Student organizations, volunteering, and mentoring initiatives",
      },
    ],
    emailCapture: {
      enabled: false,
      title: "Follow My Learning Journey",
      placeholder: "Your email address",
    },
    suggestedContactActions: [
      {
        type: "download_resume",
        label: "Download Resume / CV",
      },
    ],
  },

  scratch: {
    id: "scratch",
    name: "Start from scratch",
    tagline: "Blank slate with no prefilled content",
    description: "Start with an empty profile and build your Linkle step-by-step at your own pace.",
    icon: "⚡",
    badgeColor: "#64748b",
    theme: {
      primaryColor: "#6366f1",
      buttonStyle: "pill",
      fontFamily: "Inter",
    },
    bioScaffolding: "",
    suggestedSocial: [],
    suggestedBusinessLinks: [],
    emailCapture: {
      enabled: false,
      title: "Subscribe to my newsletter",
      placeholder: "Enter your email",
    },
    suggestedContactActions: [],
  },
};

export const TEMPLATE_LIST = Object.values(PROFILE_TEMPLATES);
