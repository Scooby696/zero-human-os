import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Search, Filter, GitBranch, Megaphone, Users, Calendar, MapPin, Clock, ChevronDown, ChevronUp, Terminal, Star, Server } from "lucide-react";
import ToolCard from "../components/tools/ToolCard";
import EventCard from "../components/tools/EventCard";

const CATEGORIES = [
  { id: "all", label: "All Tools" },
  { id: "workflow", label: "Workflow & Business" },
  { id: "marketing", label: "Marketing Automation" },
  { id: "community", label: "Community Management" },
];

const TOOLS = [
  // ── Workflow & Business ──────────────────────────────────────────────────────
  {
    id: "n8n",
    name: "n8n",
    category: "workflow",
    tagline: "Powerful node-based workflow automation",
    description: "The open-source alternative to Zapier. Build complex data pipelines between 400+ apps — Slack, Google Sheets, CRMs, and more. Fully self-hostable for complete data control.",
    tags: ["Self-hosted", "Node-based", "400+ integrations", "Zapier alternative"],
    url: "https://n8n.io",
    github: "https://github.com/n8n-io/n8n",
    stars: "47k+",
    license: "Apache 2.0 / Enterprise",
    selfHost: true,
    difficulty: "Intermediate",
    install: [
      "# Docker (recommended)",
      "docker run -it --rm \\",
      "  --name n8n \\",
      "  -p 5678:5678 \\",
      "  -v ~/.n8n:/home/node/.n8n \\",
      "  n8nio/n8n",
      "",
      "# Then open: http://localhost:5678",
      "",
      "# Or via npm",
      "npx n8n",
    ],
    useCase: "Automate: lead capture → CRM sync → Slack alert → email follow-up, all without code.",
  },
  {
    id: "odoo",
    name: "Odoo Community",
    category: "workflow",
    tagline: "All-in-one open-source business suite",
    description: "Massive ERP platform with 30+ modules: CRM, project management, accounting, inventory, HR, and more. Community Edition is fully open source. Acts as the central hub for all business operations.",
    tags: ["ERP", "CRM", "All-in-one", "Self-hosted", "30+ modules"],
    url: "https://www.odoo.com/",
    github: "https://github.com/odoo/odoo",
    stars: "38k+",
    license: "LGPL-3.0",
    selfHost: true,
    difficulty: "Advanced",
    install: [
      "# Docker Compose",
      "version: '3'",
      "services:",
      "  odoo:",
      "    image: odoo:17.0",
      "    ports: ['8069:8069']",
      "    depends_on: [db]",
      "  db:",
      "    image: postgres:15",
      "    environment:",
      "      POSTGRES_PASSWORD: odoo",
      "      POSTGRES_USER: odoo",
      "",
      "docker-compose up -d",
      "# Open: http://localhost:8069",
    ],
    useCase: "Replace: Salesforce CRM + QuickBooks + Asana + Slack with one self-hosted platform.",
  },
  {
    id: "erpnext",
    name: "ERPNext",
    category: "workflow",
    tagline: "Modern, comprehensive open-source ERP",
    description: "Built on Frappe framework. Manages sales, HR, inventory, payroll, manufacturing, and accounting in a unified interface. Widely adopted by SMEs globally as a free alternative to SAP.",
    tags: ["ERP", "Frappe", "HR", "Inventory", "Payroll", "Self-hosted"],
    url: "https://frappe.io/erpnext",
    github: "https://github.com/frappe/erpnext",
    stars: "21k+",
    license: "GPL-3.0",
    selfHost: true,
    difficulty: "Advanced",
    install: [
      "# Frappe Cloud (managed, free trial)",
      "# https://frappecloud.com",
      "",
      "# Self-host via bench CLI",
      "pip install frappe-bench",
      "bench init --frappe-branch version-15 frappe-bench",
      "cd frappe-bench",
      "bench new-site mysite.local",
      "bench get-app erpnext",
      "bench --site mysite.local install-app erpnext",
      "bench start",
    ],
    useCase: "Full business OS: employee onboarding → payroll → inventory tracking → invoicing, all automated.",
  },
  {
    id: "activepieces",
    name: "Activepieces",
    category: "workflow",
    tagline: "No-code automation for non-technical teams",
    description: "User-friendly drag-and-drop automation with 100+ pre-built connectors. Built for business teams that need power without complexity. Modern UI, fully open source, easy Docker deploy.",
    tags: ["No-code", "Beginner-friendly", "Self-hosted", "100+ connectors"],
    url: "https://www.activepieces.com",
    github: "https://github.com/activepieces/activepieces",
    stars: "10k+",
    license: "MIT",
    selfHost: true,
    difficulty: "Beginner",
    install: [
      "# One-command Docker deploy",
      "curl -s https://raw.githubusercontent.com/activepieces/activepieces/main/docker-compose.yml -o docker-compose.yml",
      "docker-compose up -d",
      "",
      "# Open: http://localhost:8080",
      "# Default credentials set on first run",
    ],
    useCase: "Non-technical teams automate: form submissions → spreadsheet updates → email notifications.",
  },

  // ── Marketing Automation ─────────────────────────────────────────────────────
  {
    id: "mautic",
    name: "Mautic",
    category: "marketing",
    tagline: "Leading open-source marketing automation",
    description: "Full-featured marketing automation: multi-channel campaigns, lead scoring, dynamic content, A/B testing, and personalized email sequences. The open-source answer to HubSpot Marketing.",
    tags: ["Email campaigns", "Lead scoring", "Multi-channel", "Self-hosted", "HubSpot alternative"],
    url: "https://www.mautic.org",
    github: "https://github.com/mautic/mautic",
    stars: "7k+",
    license: "GPL-3.0",
    selfHost: true,
    difficulty: "Intermediate",
    install: [
      "# Docker Compose",
      "version: '3'",
      "services:",
      "  mautic:",
      "    image: mautic/mautic:v5",
      "    ports: ['8080:80']",
      "    environment:",
      "      MAUTIC_DB_HOST: db",
      "      MAUTIC_DB_NAME: mautic",
      "      MAUTIC_DB_USER: mautic",
      "      MAUTIC_DB_PASSWORD: mauticpassword",
      "  db:",
      "    image: mysql:8.0",
      "",
      "docker-compose up -d",
    ],
    useCase: "Automate: new signup → welcome sequence → lead score → sales alert → CRM update.",
  },
  {
    id: "listmonk",
    name: "Listmonk",
    category: "marketing",
    tagline: "High-performance self-hosted email list manager",
    description: "Blazing-fast newsletter and mailing list manager written in Go. Handles millions of subscribers, transactional emails, and advanced analytics. Single binary — incredibly easy to self-host.",
    tags: ["Newsletter", "Mass email", "Go binary", "Self-hosted", "High performance"],
    url: "https://listmonk.app/",
    github: "https://github.com/knadh/listmonk",
    stars: "15k+",
    license: "AGPL-3.0",
    selfHost: true,
    difficulty: "Beginner",
    install: [
      "# Docker (single container!)",
      "docker run -p 9000:9000 \\",
      "  -e LISTMONK_db__host=db \\",
      "  -e LISTMONK_db__password=listmonk \\",
      "  listmonk/listmonk:latest",
      "",
      "# Or download binary (Go single file)",
      "# https://listmonk.app/docs/installation",
      "",
      "# Open: http://localhost:9000",
      "# Default: admin / listmonk",
    ],
    useCase: "Send newsletters to 100K+ subscribers at a fraction of Mailchimp costs, fully self-hosted.",
  },
  {
    id: "erxes",
    name: "Erxes",
    category: "marketing",
    tagline: "Experience OS — marketing + customer engagement",
    description: "Unified platform combining marketing automation with customer engagement. Connects advertising, support, and sales into one experience OS. Replaces HubSpot + Intercom + customer.io.",
    tags: ["Experience OS", "Marketing + Support", "Unified", "Self-hosted"],
    url: "https://erxes.io",
    github: "https://github.com/erxes/erxes",
    stars: "3.4k+",
    license: "GPL-3.0",
    selfHost: true,
    difficulty: "Intermediate",
    install: [
      "# Docker Compose (recommended)",
      "git clone https://github.com/erxes/erxes.git",
      "cd erxes/quickstart",
      "docker-compose up -d",
      "",
      "# Full installation docs:",
      "# https://docs.erxes.io/installation",
      "",
      "# Open: http://localhost:3000",
    ],
    useCase: "Unify: ad campaign tracking + live chat + email automation + CRM in one self-hosted platform.",
  },

  // ── Community Management ─────────────────────────────────────────────────────
  {
    id: "botpress",
    name: "Botpress",
    category: "community",
    tagline: "Open-source conversational AI framework",
    description: "Build sophisticated chatbots and conversational agents for Discord, Telegram, Slack, and the web. Drag-and-drop flow builder, NLU engine, and LLM integration — no proprietary servers needed.",
    tags: ["Chatbot", "NLU", "Discord", "Telegram", "Self-hosted", "LLM-ready"],
    url: "https://botpress.com",
    github: "https://github.com/botpress/botpress",
    stars: "13k+",
    license: "MIT",
    selfHost: true,
    difficulty: "Intermediate",
    install: [
      "# Docker",
      "docker pull botpress/server",
      "docker run -d \\",
      "  --name botpress \\",
      "  -p 3000:3000 \\",
      "  -v botpress_data:/botpress/data \\",
      "  botpress/server",
      "",
      "# Open: http://localhost:3000",
      "",
      "# Connect to Discord:",
      "# Settings → Messaging Channels → Discord",
    ],
    useCase: "Build a Discord/Telegram bot that answers community questions, qualifies leads, and handles onboarding 24/7.",
  },
  {
    id: "togethercrew",
    name: "TogetherCrew",
    category: "community",
    tagline: "Community analytics + automated engagement",
    description: "Analyzes Discord and Telegram member data to surface insights and automate engagement recommendations. Tracks retention, identifies at-risk members, and triggers re-engagement flows.",
    tags: ["Discord", "Telegram", "Analytics", "Retention", "Engagement"],
    url: "https://www.togethercrew.com",
    github: "https://github.com/TogetherCrew",
    stars: "500+",
    license: "MIT",
    selfHost: true,
    difficulty: "Intermediate",
    install: [
      "# Clone and run with Docker",
      "git clone https://github.com/TogetherCrew/tc_core",
      "cd tc_core",
      "cp .env.example .env",
      "# Fill in DISCORD_TOKEN, MONGODB_URI",
      "",
      "docker-compose up -d",
      "",
      "# Dashboard: http://localhost:3333",
      "# Docs: https://docs.togethercrew.com",
    ],
    useCase: "Identify disengaged members before they churn, auto-trigger personalized re-engagement DMs.",
  },
  {
    id: "tatsu",
    name: "Tatsu",
    category: "community",
    tagline: "Discord community engagement & economy bot",
    description: "Highly popular Discord bot with server economies, reputation systems, leveling, and minigames to keep communities active. Used by 100K+ Discord servers. Plug-and-play setup.",
    tags: ["Discord", "Economy", "Gamification", "Leveling", "Plug-and-play"],
    url: "https://tatsu.gg",
    github: null,
    stars: "100K+ servers",
    license: "Free / Premium",
    selfHost: false,
    difficulty: "Beginner",
    install: [
      "# No self-hosting needed — invite directly",
      "# 1. Visit: https://tatsu.gg",
      "# 2. Click 'Add to Discord'",
      "# 3. Authorize for your server",
      "",
      "# Quick setup commands in Discord:",
      "t!setup          # Run setup wizard",
      "t!settings       # Configure economy",
      "t!leaderboard    # Show member rankings",
      "t!profile        # View your profile",
    ],
    useCase: "Boost Discord retention with XP leveling, custom currency, and automated role rewards for active members.",
  },
  {
    id: "wonderverse",
    name: "Wonderverse",
    category: "community",
    tagline: "Quest-based community onboarding & engagement",
    description: "Engages community members through quest systems, leaderboards, and achievement tracking. Focuses on onboarding new members and keeping existing ones active via structured challenges.",
    tags: ["Quests", "Onboarding", "Leaderboards", "Web3 friendly", "Gamification"],
    url: "https://www.wonderverse.xyz",
    github: "https://github.com/wondrous-dev/wondrous-frontend",
    stars: "200+",
    license: "MIT",
    selfHost: false,
    difficulty: "Beginner",
    install: [
      "# Hosted platform — no install needed",
      "# 1. Sign up at: https://www.wonderverse.xyz",
      "# 2. Connect your Discord server",
      "# 3. Create your first quest:",
      "#    - Set task (join, post, react)",
      "#    - Set reward (role, points, NFT)",
      "#    - Publish to community",
      "",
      "# API access for custom integration:",
      "# https://docs.wonderverse.xyz/api",
    ],
    useCase: "Onboard 10x more new community members by guiding them through quests that teach platform features.",
  },
];

const EVENTS = [
  {
    id: "intro-ai",
    title: "Introduction to AI Tools",
    date: "May 16, 2026",
    time: "12:30 PM",
    venue: "The Chattery",
    address: "1800 Rossville Avenue, Chattanooga, TN",
    description: "Hands-on workshop for beginners and small business owners. Covers tools like Gemini and Reclaim.ai for everyday productivity.",
    type: "Workshop",
    level: "Beginner",
    mapUrl: "https://maps.google.com/?q=1800+Rossville+Avenue+Chattanooga+TN",
  },
  {
    id: "wade",
    title: "W.A.D.E. Presents: The Execution Era",
    date: "May 2, 2026",
    time: "2:00 PM",
    venue: "Music City Work Club",
    address: "4909 Alabama Avenue, Nashville, TN",
    description: "Focused on helping entrepreneurs build smarter systems using AI. Practical frameworks for implementing automation in real businesses.",
    type: "Workshop",
    level: "Intermediate",
    mapUrl: "https://maps.google.com/?q=4909+Alabama+Avenue+Nashville+TN",
  },
];

export default function OpenSourceTools() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedTool, setExpandedTool] = useState(null);

  const filtered = TOOLS.filter((t) => {
    const matchCat = activeCategory === "all" || t.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="h-4 w-px bg-border/50" />
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-foreground">Open Source Tools Directory</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-400/10 border border-green-400/20">
            <span className="text-xs font-bold text-green-400">{TOOLS.length} Tools</span>
            <span className="text-xs text-muted-foreground">· Free to use</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-3">
              Open Source Automation Stack
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Self-hosted, zero-recurring-cost tools for workflow automation, marketing, and community management. Every tool includes install commands and real use cases.
            </p>
          </div>
        </motion.div>

        {/* Search + Filter */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools, tags, use cases..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  activeCategory === cat.id
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border/40 text-muted-foreground hover:bg-secondary/30"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tools Grid */}
        <div className="space-y-4">
          {filtered.map((tool, i) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              expanded={expandedTool === tool.id}
              onToggle={() => setExpandedTool(expandedTool === tool.id ? null : tool.id)}
              index={i}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">No tools found for "{search}"</div>
          )}
        </div>

        {/* Events Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Upcoming Events — Tennessee</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {EVENTS.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Source links */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="p-5 rounded-2xl bg-secondary/30 border border-border/40">
            <p className="text-xs text-muted-foreground mb-3 font-medium">Sources & Further Reading</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "n8n: OS Workflow Tools", url: "https://blog.n8n.io/open-source-workflow-management/" },
                { label: "Top 15 Automation Tools", url: "https://medium.com/@techlatest.net/top-15-open-source-workflow-automation-tools-e2822e65c842" },
                { label: "n8n: OS Marketing Tools", url: "https://blog.n8n.io/open-source-marketing-automation-tools/" },
                { label: "Activepieces Blog", url: "https://www.activepieces.com/blog/top-10-open-source-workflow-automation-tools-in-2024" },
              ].map((src) => (
                <a key={src.url} href={src.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> {src.label}
                </a>
              ))}
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}