"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Building2, Users, MessageSquare, BookOpen, Settings, Calendar, Bell,
  CheckCircle2, Circle, AlertTriangle, Send, Bot, User, ShieldCheck,
  BarChart3, ListChecks, Plus, Trash2, Pause, Play, ChevronRight, ChevronDown,
  Flame, Sun, Snowflake, ArrowLeftRight, LayoutGrid, FileText, Phone,
  Clock, Tag, Loader2, Edit3, X, Check, LogIn, Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

/* =========================================================================
   TRAVIS PROMPT AI — Business Assistant (MVP Demo)
   Single-file React demo. All AI drafts are generated live via the
   Claude API and gated behind Human Review Mode before anything is
   considered "sent" to a customer. Everything else (booking confirmation,
   CRM sync, messaging channels) is simulated and clearly labeled DEMO.
   ========================================================================= */

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`;

const TOKENS = {
  ink: "#12161C",
  paper: "#F5F3EE",
  surface: "#FFFFFF",
  border: "#E3E0D6",
  primary: "#2953FF",
  primarySoft: "#EAEFFF",
  hot: "#E0562B",
  warm: "#D9A62E",
  cold: "#6B7A8F",
  active: "#1F9D6B",
};

const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 9)}`;

const INDUSTRIES = [
  "Real Estate", "Property Management", "Hotel & Hospitality", "Clinic & Wellness",
  "School & Training", "E-commerce", "Professional Services", "Agency & Consulting",
  "Home Services", "Other",
];

const ONBOARDING_STEPS = [
  { key: "profile", label: "Business profile" },
  { key: "products", label: "Products or services" },
  { key: "knowledge", label: "FAQs & approved knowledge" },
  { key: "chatbot", label: "Chatbot behavior" },
  { key: "leadCapture", label: "Lead-capture settings" },
  { key: "handoff", label: "Human-handoff settings" },
  { key: "appointments", label: "Appointment settings" },
  { key: "testing", label: "Test conversations" },
  { key: "review", label: "Review & activate" },
];

const INTENTS = [
  "general_information", "product_or_service_inquiry", "pricing_request", "buying_interest",
  "appointment_request", "existing_customer_support", "complaint", "refund_or_cancellation",
  "urgent_issue", "partnership_inquiry", "recruitment_inquiry", "human_requested", "unclear_request",
];

const STATUS_COLORS = {
  "Setup Required": TOKENS.cold,
  "Setup In Progress": TOKENS.warm,
  "Ready for Testing": TOKENS.primary,
  "Testing": TOKENS.primary,
  "Active": TOKENS.active,
  "Paused": TOKENS.cold,
  "Suspended": TOKENS.hot,
};

/* --------------------------- Demo seed data ---------------------------- */

function seedDemoBusiness() {
  const id = "biz_demo01";
  return {
    id,
    ownerName: "Amara Solis",
    businessName: "Demo Property Company",
    email: "amara@demopropertyco.example",
    industry: "Real Estate",
    country: "United Kingdom",
    website: "https://demopropertyco.example",
    phone: "+44 20 7946 0958",
    status: "Active",
    createdAt: Date.now() - 86400000 * 12,
    onboarding: { profile: true, products: true, knowledge: true, chatbot: true, leadCapture: true, handoff: true, appointments: true, testing: true, review: true },
    profile: {
      tradingName: "Demo Property Co.",
      description: "A residential lettings and sales agency covering Greater London, helping renters and buyers find their next home.",
      locationsServed: "Greater London",
      address: "14 Riverside Court, London",
      hours: "Mon–Fri 9:00–18:00, Sat 10:00–14:00",
      socialLinks: "instagram.com/demopropertyco",
      customerServiceContact: "support@demopropertyco.example",
      salesContact: "sales@demopropertyco.example",
      privacyUrl: "demopropertyco.example/privacy",
      termsUrl: "demopropertyco.example/terms",
      preferredLanguage: "English",
      additionalLanguages: "—",
    },
    products: [
      {
        id: uid("prod"), name: "2-Bed Apartment, Riverside", shortDesc: "Modern 2-bed near the river, close to transport.",
        fullDesc: "Bright 2-bedroom apartment on the 4th floor with a river-facing balcony, 10 minutes' walk from the tube station. Unfurnished, available for immediate move-in.",
        price: "£2,150", currency: "GBP", availability: "Available now", locations: "Riverside, London",
        requirements: "Minimum 12-month tenancy, referencing required.", deliveryTime: "Move-in within 5 working days of approval",
        benefits: "River views, on-site gym, secure parking available.", restrictions: "No pets.", url: "", appointmentsAvailable: true, status: "Active",
      },
      {
        id: uid("prod"), name: "Sales Valuation Service", shortDesc: "Free home valuation for sellers.",
        fullDesc: "A no-obligation market valuation carried out by a local sales specialist, with a written report and pricing strategy.",
        price: "Free", currency: "GBP", availability: "By appointment", locations: "Greater London",
        requirements: "Proof of ownership.", deliveryTime: "Report within 48 hours of visit",
        benefits: "Local market data, no obligation to sell with us.", restrictions: "", url: "", appointmentsAvailable: true, status: "Active",
      },
    ],
    knowledge: [
      { id: uid("kb"), title: "Viewing bookings", category: "Booking", content: "Viewings can be booked for any active listing. We require a valid ID at the viewing. Viewings run Mon–Sat, 9am–6pm.", priority: "High", status: "Approved", updated: "2026-08-01" },
      { id: uid("kb"), title: "Holding deposit", category: "Pricing", content: "A holding deposit equal to one week's rent is required to reserve a property once an application is approved.", priority: "High", status: "Approved", updated: "2026-08-01" },
      { id: uid("kb"), title: "Pets policy", category: "Policies", content: "Pets are considered case-by-case and must be agreed in writing by the landlord before move-in.", priority: "Medium", status: "Approved", updated: "2026-07-20" },
      { id: uid("kb"), title: "Referencing process", category: "Customer support", content: "Referencing is carried out by a third-party provider and typically takes 2–4 working days once all documents are submitted.", priority: "Medium", status: "Approved", updated: "2026-07-18" },
      { id: uid("kb"), title: "Cancelling a viewing", category: "Refunds and cancellations", content: "Viewings can be cancelled or rescheduled free of charge with at least 2 hours' notice via phone or email.", priority: "Low", status: "Approved", updated: "2026-07-10" },
    ],
    chatbotSettings: {
      assistantName: "Ava", welcomeMessage: "Hello, I'm Ava, the AI assistant for Demo Property Company.",
      tone: "Warm and professional", formality: "Semi-formal", responseLength: "Concise (2-4 sentences)",
      preferredGreeting: "Hello", wordsToUse: "home, viewing, move-in, availability", wordsToAvoid: "guarantee, promise, deal",
      languages: "English", handoffMessage: "I'm going to pass this to a member of the team so you receive the correct help. Please confirm the best contact method.",
      uncertaintyMessage: "I don't have approved information on that yet — let me get a team member to confirm.",
    },
    leadCapture: { questions: ["What product or service are you interested in?", "What are you hoping to achieve?", "Which location applies to you?", "When are you looking to make a decision?", "What is the best way for our team to contact you?"], b2b: false },
    handoff: {
      triggers: ["Customer asks for a human", "Complaint", "Legal or contract matter", "Refund or cancellation", "AI lacks approved information", "High-value or urgent lead"],
      contact: "leasing@demopropertyco.example / +44 20 7946 0958",
    },
    appointments: {
      types: "Property viewing, Sales valuation", duration: "30 minutes", bookingUrl: "(placeholder) demopropertyco.example/book",
      hours: "Mon–Sat 9:00–18:00", requiredDetails: "Name, phone, preferred date/time", cancellationPolicy: "Free cancellation up to 2 hours before.",
      confirmationMessage: "Your requested time has been noted — a team member will confirm shortly.", assignedTeamMember: "Front desk team",
    },
    followUp: { enabled: true, timing: "1–2 business days, then 5–7 business days", maxFollowUps: 2, assignedTeamMember: "Assigned lead owner", stopConditions: "Reply received, booked, declined, do-not-contact, closed" },
    team: [
      { id: uid("team"), name: "Amara Solis", role: "Owner", email: "amara@demopropertyco.example" },
      { id: uid("team"), name: "Ben Ojo", role: "Team Member", email: "ben@demopropertyco.example" },
    ],
    conversations: seedConversations(),
    followUpTasks: [],
    activation: { confirmed: true, activatedAt: Date.now() - 86400000 * 5 },
  };
}

function seedConversations() {
  const c1 = {
    id: uid("conv"), visitorName: "Jordan P.", channel: "Website widget (demo)", startedAt: Date.now() - 3600_000 * 5,
    messages: [
      { id: uid("m"), role: "assistant", text: "Hello, I'm Ava, the AI assistant for Demo Property Company. How can I help you today?", ts: Date.now() - 3600_000 * 5 },
      { id: uid("m"), role: "visitor", text: "Hi, is the 2-bed riverside apartment still available?", ts: Date.now() - 3600_000 * 5 + 20000 },
      { id: uid("m"), role: "assistant", text: "Yes, the 2-bed Riverside Apartment is available now at £2,150/month, unfurnished with a 12-month minimum tenancy. Would you like to book a viewing?", ts: Date.now() - 3600_000 * 5 + 45000 },
      { id: uid("m"), role: "visitor", text: "Yes please, could I view it this Saturday?", ts: Date.now() - 3600_000 * 5 + 70000 },
    ],
    pendingDraft: null, intent: "appointment_request", leadTemperature: "hot", status: "Appointment requested",
    capturedInfo: { name: "Jordan P.", product: "2-Bed Apartment, Riverside", need: "Book a Saturday viewing" },
    escalate: false, assignedTo: "Ben Ojo", notes: [], doNotContact: false,
  };
  const c2 = {
    id: uid("conv"), visitorName: "Priya K.", channel: "Website widget (demo)", startedAt: Date.now() - 86400_000 * 1.2,
    messages: [
      { id: uid("m"), role: "assistant", text: "Hello, I'm Ava, the AI assistant for Demo Property Company. How can I help you today?", ts: Date.now() - 86400_000 * 1.2 },
      { id: uid("m"), role: "visitor", text: "The team never got back to me about my referencing, this is the third time I'm asking.", ts: Date.now() - 86400_000 * 1.2 + 30000 },
      { id: uid("m"), role: "assistant", text: "I'm sorry about the delay — that's frustrating. I'm going to pass this to a member of the team so you receive the correct help. Please confirm the best contact method.", ts: Date.now() - 86400_000 * 1.2 + 60000 },
    ],
    pendingDraft: null, intent: "complaint", leadTemperature: "warm", status: "Human review required",
    capturedInfo: { name: "Priya K.", need: "Referencing delay follow-up" },
    escalate: true, assignedTo: "Amara Solis", notes: [{ id: uid("note"), text: "Escalated automatically — repeated complaint.", ts: Date.now() - 86400_000 * 1.2 + 60000 }], doNotContact: false,
  };
  return [c1, c2];
}

/* ------------------------------ AI helper ------------------------------- */

function buildSystemPrompt(biz) {
  const kb = biz.knowledge.filter(k => k.status !== "Archived")
    .map(k => `- [${k.category}] ${k.title}: ${k.content}`).join("\n");
  const products = biz.products.filter(p => p.status === "Active").map(p =>
    `- ${p.name} | ${p.shortDesc} | Price: ${p.price} ${p.currency} | Availability: ${p.availability} | Locations: ${p.locations} | Requirements: ${p.requirements} | Benefits: ${p.benefits} | Restrictions: ${p.restrictions || "none"}`
  ).join("\n");

  return `You are ${biz.chatbotSettings.assistantName}, the AI assistant for ${biz.businessName}, a ${biz.industry} business.
Business description: ${biz.profile.description}
Hours: ${biz.profile.hours}. Locations served: ${biz.profile.locationsServed}.
Tone: ${biz.chatbotSettings.tone}. Formality: ${biz.chatbotSettings.formality}. Response length: ${biz.chatbotSettings.responseLength}.
Words to use where natural: ${biz.chatbotSettings.wordsToUse}. Words to avoid: ${biz.chatbotSettings.wordsToAvoid}.

APPROVED PRODUCTS/SERVICES:
${products || "(none added yet)"}

APPROVED KNOWLEDGE BASE:
${kb || "(none added yet)"}

RULES (must follow strictly):
- Always identify as an AI assistant. Never claim to be human.
- Use ONLY the approved information above. Never invent prices, availability, policies, or facts.
- If information is missing or uncertain, say so plainly and offer to get a human to confirm — use this uncertainty message as a base: "${biz.chatbotSettings.uncertaintyMessage}"
- Ask at most one or two relevant questions per turn. Do not interrogate the visitor.
- Never promise a sale, booking, delivery, refund, approval, or result without human confirmation. Bookings are requests only, not confirmations.
- If the visitor asks for a human, is distressed, files a complaint, raises a legal/contract/medical/financial/refund matter, or repeats a question because a prior answer didn't help — escalate and use this handoff message as a base: "${biz.chatbotSettings.handoffMessage}"
- Respect "do not contact" requests immediately.
- Be professional, helpful, and never use pressure or manipulation tactics.

You must respond with STRICT JSON ONLY — no markdown fences, no preamble, no commentary outside the JSON object. Shape:
{
  "reply": "the suggested reply to show the visitor, in your voice as the assistant",
  "intent": "one of: ${INTENTS.join(" | ")}",
  "lead_temperature": "hot | warm | cold | none",
  "captured_info": { "name": null, "email": null, "phone": null, "company": null, "product": null, "need": null, "location": null, "timeline": null, "contact_method": null },
  "escalate": true or false,
  "escalation_reason": "string or null",
  "next_action": "short recommended next step for the human reviewer",
  "do_not_contact": true or false
}
Only fill captured_info fields you can actually infer from the conversation; leave the rest null. Output nothing but the JSON object.`;
}

async function generateAIDraft(biz, conversation, latestVisitorText) {
  const history = conversation.messages.map(m => ({
    role: m.role === "visitor" ? "user" : "assistant",
    content: m.role === "visitor" ? m.text : m.text,
  }));
  const messages = [...history, { role: "user", content: latestVisitorText }];

  try {
    // Calls our own server route (app/api/chat/route.ts) instead of
    // Anthropic directly, so the API key stays server-side.
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: buildSystemPrompt(biz),
        messages,
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    const raw = (data.content || []).map(b => (b.type === "text" ? b.text : "")).join("").trim();
    const clean = raw.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(clean);
    return { ok: true, ...parsed };
  } catch (err) {
    return {
      ok: false,
      reply: "Thanks for your message — I want to make sure you get accurate information, so I'm flagging this for a team member to confirm.",
      intent: "unclear_request", lead_temperature: "none", captured_info: {}, escalate: true,
      escalation_reason:String(err?.message || err),next_action: "Review manually.", do_not_contact: false,
    };
  }
}

/* ------------------------------ UI atoms -------------------------------- */

function Badge({ children, color, soft }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999,
      fontSize: 12, fontWeight: 600, fontFamily: "'IBM Plex Sans', sans-serif",
      color: soft ? color : "#fff", background: soft ? `${color}1A` : color, border: soft ? `1px solid ${color}55` : "none",
    }}>{children}</span>
  );
}

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || TOKENS.cold;
  return <Badge color={c} soft>{status}</Badge>;
}

function TempBadge({ temp }) {
  const map = {
    hot: { c: TOKENS.hot, icon: <Flame size={12} />, label: "Hot" },
    warm: { c: TOKENS.warm, icon: <Sun size={12} />, label: "Warm" },
    cold: { c: TOKENS.cold, icon: <Snowflake size={12} />, label: "Cold" },
    none: { c: TOKENS.cold, icon: <Circle size={12} />, label: "—" },
  };
  const m = map[temp] || map.none;
  return <Badge color={m.c} soft><span style={{ display: "flex", alignItems: "center", gap: 4 }}>{m.icon}{m.label}</span></Badge>;
}

function Card({ children, style }) {
  return <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 14, padding: 20, ...style }}>{children}</div>;
}

function SectionTitle({ eyebrow, title, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
      <div>
        {eyebrow && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 1.5, color: TOKENS.primary, textTransform: "uppercase", marginBottom: 4 }}>{eyebrow}</div>}
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: TOKENS.ink, margin: 0 }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function Button({ children, onClick, variant = "primary", icon, disabled, small, type = "button" }) {
  const base = { display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", border: "none", borderRadius: 10, padding: small ? "7px 12px" : "10px 16px", fontSize: small ? 13 : 14, transition: "opacity .15s", opacity: disabled ? 0.5 : 1 };
  const variants = {
    primary: { background: TOKENS.ink, color: "#fff" },
    accent: { background: TOKENS.primary, color: "#fff" },
    outline: { background: "transparent", color: TOKENS.ink, border: `1px solid ${TOKENS.border}` },
    ghost: { background: "transparent", color: TOKENS.ink },
    danger: { background: "#FBEAE5", color: "#B23A17" },
    success: { background: "#E4F5EC", color: TOKENS.active },
  };
  return (
    <button type={type} onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant] }}>
      {icon}{children}
    </button>
  );
}

function Field({ label, children, hint }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#4A5568", marginBottom: 5, fontFamily: "'IBM Plex Sans', sans-serif" }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 11.5, color: "#8A93A3", marginTop: 4 }}>{hint}</div>}
    </label>
  );
}

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${TOKENS.border}`,
  fontSize: 14, fontFamily: "'IBM Plex Sans', sans-serif", background: "#FCFBF9", color: TOKENS.ink, boxSizing: "border-box",
};

function TextInput(props) { return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />; }
function TextArea(props) { return <textarea {...props} rows={props.rows || 3} style={{ ...inputStyle, resize: "vertical", ...(props.style || {}) }} />; }
function Select({ options, ...props }) {
  return <select {...props} style={inputStyle}>{options.map(o => <option key={o} value={o}>{o}</option>)}</select>;
}

/* ------------------------------ App shell -------------------------------- */

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "onboarding", label: "Setup checklist", icon: ListChecks },
  { key: "profile", label: "Business profile", icon: Building2 },
  { key: "products", label: "Products & services", icon: LayoutGrid },
  { key: "knowledge", label: "Knowledge base", icon: BookOpen },
  { key: "chatbot", label: "Chatbot behavior", icon: Bot },
  { key: "appointments", label: "Appointments", icon: Calendar },
  { key: "followup", label: "Follow-up", icon: Bell },
  { key: "conversations", label: "Conversations & review", icon: MessageSquare },
  { key: "leads", label: "Leads", icon: Users },
  { key: "activate", label: "Review & activate", icon: ShieldCheck },
];

function persistBusiness(biz) {
  supabase.from("businesses").upsert({
    id: biz.id,
    data: biz,
    updated_at: new Date().toISOString(),
  }).then(({ error }) => {
    if (error) console.error("Failed to save business to Supabase", error);
  });
}

export default function App() {
  const [businesses, setBusinesses] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [currentBusinessId, setCurrentBusinessId] = useState("biz_demo01");
  const [role, setRole] = useState("owner");
  const [view, setView] = useState("dashboard");
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("businesses").select("id, data");
        if (error) throw error;
        if (data && data.length > 0) {
          const loadedBiz = {};
          data.forEach(row => { loadedBiz[row.id] = row.data; });
          setBusinesses(loadedBiz);
          if (!loadedBiz[currentBusinessId]) {
            setCurrentBusinessId(Object.keys(loadedBiz)[0]);
          }
        } else {
          const demo = seedDemoBusiness();
          setBusinesses({ [demo.id]: demo });
          persistBusiness(demo);
        }
      } catch (e) {
        console.error("Failed to load from Supabase, using local demo data", e);
        const demo = seedDemoBusiness();
        setBusinesses({ [demo.id]: demo });
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const biz = businesses[currentBusinessId];

  const updateBiz = useCallback((id, updater) => {
    setBusinesses(prev => {
      const updated = updater(prev[id]);
      persistBusiness(updated);
      return { ...prev, [id]: updated };
    });
  }, []);

  const createBusiness = (fields) => {
    const id = uid("biz");
    const nb = {
      id, ...fields, status: "Setup Required", createdAt: Date.now(),
      onboarding: { profile: false, products: false, knowledge: false, chatbot: false, leadCapture: false, handoff: false, appointments: false, testing: false, review: false },
      profile: { tradingName: fields.businessName, description: "", locationsServed: "", address: "", hours: "", socialLinks: "", customerServiceContact: "", salesContact: "", privacyUrl: "", termsUrl: "", preferredLanguage: "English", additionalLanguages: "" },
      products: [], knowledge: [],
      chatbotSettings: { assistantName: "Assistant", welcomeMessage: `Hello, I'm the AI assistant for ${fields.businessName}.`, tone: "Professional and friendly", formality: "Semi-formal", responseLength: "Concise (2-4 sentences)", preferredGreeting: "Hello", wordsToUse: "", wordsToAvoid: "", languages: "English", handoffMessage: "I'm going to pass this to a member of the team so you receive the correct help. Please confirm the best contact method.", uncertaintyMessage: "I don't have approved information on that yet — let me get a team member to confirm." },
      leadCapture: { questions: ["What product or service are you interested in?", "What are you hoping to achieve?", "Which location applies to you, if relevant?", "When are you looking to make a decision?", "What is the best way for our team to contact you?"], b2b: false },
      handoff: { triggers: ["Customer asks for a human", "Complaint", "Legal or contract matter", "Refund or cancellation", "AI lacks approved information", "High-value or urgent lead"], contact: fields.email },
      appointments: { types: "", duration: "30 minutes", bookingUrl: "(placeholder — connect a calendar)", hours: "", requiredDetails: "Name, phone, preferred date/time", cancellationPolicy: "", confirmationMessage: "Your requested time has been noted — a team member will confirm shortly.", assignedTeamMember: "" },
      followUp: { enabled: true, timing: "1–2 business days, then 5–7 business days", maxFollowUps: 2, assignedTeamMember: "", stopConditions: "Reply received, booked, declined, do-not-contact, closed" },
      team: [{ id: uid("team"), name: fields.ownerName, role: "Owner", email: fields.email }],
      conversations: [], followUpTasks: [], activation: { confirmed: false, activatedAt: null },
    };
    setBusinesses(prev => ({ ...prev, [id]: nb }));
    setCurrentBusinessId(id);
    setRole("owner");
    setShowSignUp(false);
    setView("onboarding");
  };

  const businessList = Object.values(businesses);

  return (
    <div style={{ minHeight: "100vh", background: TOKENS.paper, fontFamily: "'IBM Plex Sans', sans-serif", color: TOKENS.ink }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        ::placeholder { color: #A8AFBB; }
        button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid ${TOKENS.primary}; outline-offset: 1px; }
      `}</style>

      <TopBar
        role={role} setRole={setRole} businessList={businessList} currentBusinessId={currentBusinessId}
        setCurrentBusinessId={setCurrentBusinessId} setView={setView} onNewBusiness={() => setShowSignUp(true)}
      />

      {showSignUp && <SignUpModal onClose={() => setShowSignUp(false)} onCreate={createBusiness} />}

      {role === "super_admin" ? (
        <SuperAdminView businesses={businessList} updateBiz={updateBiz} />
      ) : role === "visitor" ? (
        <VisitorView biz={biz} updateBiz={updateBiz} businessList={businessList} currentBusinessId={currentBusinessId} setCurrentBusinessId={setCurrentBusinessId} />
      ) : biz ? (
        <div style={{ display: "flex", maxWidth: 1400, margin: "0 auto" }}>
          <SideNav view={view} setView={setView} role={role} />
          <main style={{ flex: 1, padding: "28px 32px 80px", minWidth: 0 }}>
            {view === "dashboard" && <DashboardView biz={biz} setView={setView} />}
            {view === "onboarding" && <OnboardingView biz={biz} updateBiz={updateBiz} setView={setView} />}
            {view === "profile" && <ProfileView biz={biz} updateBiz={updateBiz} />}
            {view === "products" && <ProductsView biz={biz} updateBiz={updateBiz} />}
            {view === "knowledge" && <KnowledgeView biz={biz} updateBiz={updateBiz} />}
            {view === "chatbot" && <ChatbotSettingsView biz={biz} updateBiz={updateBiz} />}
            {view === "appointments" && <AppointmentsView biz={biz} updateBiz={updateBiz} />}
            {view === "followup" && <FollowUpView biz={biz} updateBiz={updateBiz} />}
            {view === "conversations" && <ConversationsView biz={biz} updateBiz={updateBiz} role={role} />}
            {view === "leads" && <LeadsView biz={biz} />}
            {view === "activate" && <ActivateView biz={biz} updateBiz={updateBiz} />}
          </main>
        </div>
      ) : (
        <div style={{ padding: 60, textAlign: "center", color: TOKENS.cold }}>No business selected.</div>
      )}
    </div>
  );
}

/* -------------------------------- Top bar -------------------------------- */

function TopBar({ role, setRole, businessList, currentBusinessId, setCurrentBusinessId, setView, onNewBusiness }) {
  return (
    <div style={{ borderBottom: `1px solid ${TOKENS.border}`, background: TOKENS.surface, position: "sticky", top: 0, zIndex: 30 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: TOKENS.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: -0.3 }}>
            TRAVIS PROMPT AI <span style={{ fontWeight: 500, color: TOKENS.cold, fontSize: 13 }}>· Business Assistant</span>
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {role !== "super_admin" && role !== "visitor" && businessList.length > 0 && (
            <select value={currentBusinessId || ""} onChange={e => { setCurrentBusinessId(e.target.value); setView("dashboard"); }}
              style={{ ...inputStyle, width: "auto", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5 }}>
              {businessList.map(b => <option key={b.id} value={b.id}>{b.businessName} — {b.id}</option>)}
            </select>
          )}
          <Button variant="outline" small icon={<Plus size={14} />} onClick={onNewBusiness}>New business</Button>

          <div style={{ display: "flex", background: TOKENS.paper, borderRadius: 10, padding: 3, gap: 2, border: `1px solid ${TOKENS.border}` }}>
            {[
              { k: "owner", l: "Owner" }, { k: "team", l: "Team" }, { k: "visitor", l: "Customer" }, { k: "super_admin", l: "Platform admin" },
            ].map(r => (
              <button key={r.k} onClick={() => { setRole(r.k); setView("dashboard"); }}
                style={{
                  border: "none", borderRadius: 8, padding: "6px 11px", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                  background: role === r.k ? TOKENS.ink : "transparent", color: role === r.k ? "#fff" : TOKENS.ink,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}>{r.l}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background: TOKENS.ink, color: "#C9D0DE", fontSize: 11.5, textAlign: "center", padding: "4px 12px", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 0.3 }}>
        DEMO MODE — mock/placeholder integrations, no real messages sent, no real appointments booked, no live channel connections
      </div>
    </div>
  );
}

/* -------------------------------- Side nav -------------------------------- */

function SideNav({ view, setView, role }) {
  return (
    <nav style={{ width: 236, flexShrink: 0, padding: "24px 12px", borderRight: `1px solid ${TOKENS.border}`, minHeight: "calc(100vh - 76px)" }}>
      {NAV.map(item => {
        const Icon = item.icon;
        const active = view === item.key;
        return (
          <button key={item.key} onClick={() => setView(item.key)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", marginBottom: 2,
              border: "none", borderRadius: 9, cursor: "pointer", textAlign: "left",
              background: active ? TOKENS.primarySoft : "transparent", color: active ? TOKENS.primary : "#4A5568",
              fontSize: 13.5, fontWeight: active ? 600 : 500, fontFamily: "'IBM Plex Sans', sans-serif",
            }}>
            <Icon size={16} />{item.label}
          </button>
        );
      })}
      <div style={{ marginTop: 20, padding: "10px 12px", fontSize: 11, color: TOKENS.cold, fontFamily: "'IBM Plex Mono', monospace" }}>
        role: {role}
      </div>
    </nav>
  );
}

/* ------------------------------- Sign up --------------------------------- */

function SignUpModal({ onClose, onCreate }) {
  const [f, setF] = useState({ ownerName: "", businessName: "", email: "", industry: INDUSTRIES[0], country: "", website: "", phone: "", agree: false });
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));
  const canSubmit = f.ownerName && f.businessName && f.email && f.agree;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(18,22,28,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <div style={{ background: TOKENS.surface, borderRadius: 16, padding: 28, width: 480, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: TOKENS.primary, letterSpacing: 1 }}>NEW WORKSPACE</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", margin: "2px 0 18px" }}>Create your business workspace</h2>

        <Field label="Owner full name"><TextInput value={f.ownerName} onChange={e => set("ownerName", e.target.value)} placeholder="Jordan Smith" /></Field>
        <Field label="Business name"><TextInput value={f.businessName} onChange={e => set("businessName", e.target.value)} placeholder="Acme Clinic" /></Field>
        <Field label="Business email"><TextInput value={f.email} onChange={e => set("email", e.target.value)} placeholder="owner@business.com" /></Field>
        <Field label="Password"><TextInput type="password" placeholder="••••••••" disabled /></Field>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}><Field label="Industry"><Select options={INDUSTRIES} value={f.industry} onChange={e => set("industry", e.target.value)} /></Field></div>
          <div style={{ flex: 1 }}><Field label="Country"><TextInput value={f.country} onChange={e => set("country", e.target.value)} placeholder="United States" /></Field></div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}><Field label="Business website"><TextInput value={f.website} onChange={e => set("website", e.target.value)} placeholder="https://" /></Field></div>
          <div style={{ flex: 1 }}><Field label="Phone number"><TextInput value={f.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 555 000 0000" /></Field></div>
        </div>
        <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "#4A5568", margin: "8px 0 18px" }}>
          <input type="checkbox" checked={f.agree} onChange={e => set("agree", e.target.checked)} style={{ marginTop: 2 }} />
          I agree to the Terms of Service and Privacy Policy (demo placeholders).
        </label>
        <Button variant="accent" disabled={!canSubmit} onClick={() => onCreate(f)}>Create workspace<ChevronRight size={15} /></Button>
      </div>
    </div>
  );
}

/* ------------------------------- Dashboard -------------------------------- */

function DashboardView({ biz, setView }) {
  const convs = biz.conversations;
  const leads = convs.filter(c => c.capturedInfo && (c.capturedInfo.name || c.capturedInfo.email || c.capturedInfo.phone));
  const hot = convs.filter(c => c.leadTemperature === "hot").length;
  const warm = convs.filter(c => c.leadTemperature === "warm").length;
  const cold = convs.filter(c => c.leadTemperature === "cold").length;
  const apptReq = convs.filter(c => c.status === "Appointment requested").length;
  const apptBooked = convs.filter(c => c.status === "Appointment booked").length;
  const handoffs = convs.filter(c => c.escalate).length;
  const pendingReview = convs.filter(c => c.pendingDraft).length;
  const unresolved = convs.filter(c => !["Closed", "Not interested"].includes(c.status)).length;

  const stats = [
    { label: "Total inquiries", value: convs.length },
    { label: "Leads captured", value: leads.length },
    { label: "Hot leads", value: hot, color: TOKENS.hot },
    { label: "Warm leads", value: warm, color: TOKENS.warm },
    { label: "Cold leads", value: cold, color: TOKENS.cold },
    { label: "Appointments requested", value: apptReq },
    { label: "Appointments booked", value: apptBooked },
    { label: "Human handoffs", value: handoffs },
    { label: "Pending AI review", value: pendingReview, color: TOKENS.primary },
    { label: "Unresolved conversations", value: unresolved },
  ];

  const topQuestions = biz.knowledge.slice(0, 3).map(k => k.title);

  return (
    <div>
      <SectionTitle eyebrow={biz.id} title={`${biz.businessName} — Dashboard`} action={<StatusBadge status={biz.status} />} />
      {biz.status !== "Active" && (
        <Card style={{ marginBottom: 20, background: "#FFF7E8", border: "1px solid #F0DBA6", display: "flex", gap: 10, alignItems: "center" }}>
          <AlertTriangle size={18} color="#B5860B" />
          <div style={{ fontSize: 13.5 }}>This workspace is <strong>{biz.status}</strong>. Finish the <button onClick={() => setView("onboarding")} style={{ border: "none", background: "none", color: TOKENS.primary, fontWeight: 600, cursor: "pointer", padding: 0 }}>setup checklist</button> to activate the assistant.</div>
        </Card>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        {stats.map(s => (
          <Card key={s.label} style={{ padding: 16 }}>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: s.color || TOKENS.ink }}>{s.value}</div>
            <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 12 }}>Recent leads</div>
          <LeadsTable biz={biz} compact />
        </Card>
        <Card>
          <div style={{ fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 12 }}>Top approved topics</div>
          {topQuestions.length ? topQuestions.map(q => (
            <div key={q} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${TOKENS.border}`, fontSize: 13 }}>
              <FileText size={14} color={TOKENS.cold} />{q}
            </div>
          )) : <div style={{ color: TOKENS.cold, fontSize: 13 }}>No knowledge items yet.</div>}
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------ Onboarding -------------------------------- */

function OnboardingView({ biz, updateBiz, setView }) {
  const done = Object.values(biz.onboarding).filter(Boolean).length;
  const toggle = (key) => updateBiz(biz.id, b => ({ ...b, onboarding: { ...b.onboarding, [key]: !b.onboarding[key] }, status: b.status === "Setup Required" ? "Setup In Progress" : b.status }));

  const stepView = { profile: "profile", products: "products", knowledge: "knowledge", chatbot: "chatbot", leadCapture: "chatbot", handoff: "chatbot", appointments: "appointments", testing: "conversations", review: "activate" };

  return (
    <div>
      <SectionTitle eyebrow="Guided setup" title="Onboarding checklist" />
      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13.5, fontWeight: 600 }}>
          <span>{done} of {ONBOARDING_STEPS.length} setup steps completed</span>
          <span style={{ color: TOKENS.primary }}>{Math.round((done / ONBOARDING_STEPS.length) * 100)}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: TOKENS.paper, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(done / ONBOARDING_STEPS.length) * 100}%`, background: TOKENS.primary, transition: "width .3s" }} />
        </div>
      </Card>
      <Card>
        {ONBOARDING_STEPS.map((s, i) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 4px", borderBottom: i < ONBOARDING_STEPS.length - 1 ? `1px solid ${TOKENS.border}` : "none" }}>
            <button onClick={() => toggle(s.key)} style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}>
              {biz.onboarding[s.key] ? <CheckCircle2 size={20} color={TOKENS.active} /> : <Circle size={20} color={TOKENS.cold} />}
            </button>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 500, textDecoration: biz.onboarding[s.key] ? "none" : "none", color: biz.onboarding[s.key] ? "#6B7280" : TOKENS.ink }}>{i + 1}. {s.label}</div>
            <Button variant="ghost" small onClick={() => setView(stepView[s.key])}>Open <ChevronRight size={13} /></Button>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* -------------------------------- Profile --------------------------------- */

function ProfileView({ biz, updateBiz }) {
  const p = biz.profile;
  const set = (k, v) => updateBiz(biz.id, b => ({ ...b, profile: { ...b.profile, [k]: v } }));
  const markDone = () => updateBiz(biz.id, b => ({ ...b, onboarding: { ...b.onboarding, profile: true } }));

  return (
    <div>
      <SectionTitle eyebrow="Setup step 1" title="Business profile" action={<Button variant="success" small icon={<Check size={14} />} onClick={markDone}>Mark complete</Button>} />
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <Field label="Business name"><TextInput value={biz.businessName} disabled /></Field>
          <Field label="Trading name"><TextInput value={p.tradingName} onChange={e => set("tradingName", e.target.value)} /></Field>
          <Field label="Industry"><TextInput value={biz.industry} disabled /></Field>
          <Field label="Country"><TextInput value={biz.country} disabled /></Field>
        </div>
        <Field label="Business description"><TextArea value={p.description} onChange={e => set("description", e.target.value)} placeholder="What does this business do, and for whom?" /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <Field label="Locations served"><TextInput value={p.locationsServed} onChange={e => set("locationsServed", e.target.value)} /></Field>
          <Field label="Physical address"><TextInput value={p.address} onChange={e => set("address", e.target.value)} /></Field>
          <Field label="Business hours"><TextInput value={p.hours} onChange={e => set("hours", e.target.value)} placeholder="Mon–Fri 9:00–18:00" /></Field>
          <Field label="Phone number"><TextInput value={biz.phone} disabled /></Field>
          <Field label="Business email"><TextInput value={biz.email} disabled /></Field>
          <Field label="Social media links"><TextInput value={p.socialLinks} onChange={e => set("socialLinks", e.target.value)} /></Field>
          <Field label="Customer service contact"><TextInput value={p.customerServiceContact} onChange={e => set("customerServiceContact", e.target.value)} /></Field>
          <Field label="Sales contact"><TextInput value={p.salesContact} onChange={e => set("salesContact", e.target.value)} /></Field>
          <Field label="Privacy policy URL"><TextInput value={p.privacyUrl} onChange={e => set("privacyUrl", e.target.value)} /></Field>
          <Field label="Terms of service URL"><TextInput value={p.termsUrl} onChange={e => set("termsUrl", e.target.value)} /></Field>
          <Field label="Preferred language"><TextInput value={p.preferredLanguage} onChange={e => set("preferredLanguage", e.target.value)} /></Field>
          <Field label="Additional languages"><TextInput value={p.additionalLanguages} onChange={e => set("additionalLanguages", e.target.value)} /></Field>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------- Products --------------------------------- */

function emptyProduct() {
  return { id: uid("prod"), name: "", shortDesc: "", fullDesc: "", price: "", currency: "USD", availability: "", locations: "", requirements: "", deliveryTime: "", benefits: "", restrictions: "", url: "", appointmentsAvailable: false, status: "Draft" };
}

function ProductsView({ biz, updateBiz }) {
  const [editing, setEditing] = useState(null);
  const markDone = () => updateBiz(biz.id, b => ({ ...b, onboarding: { ...b.onboarding, products: true } }));
  const save = (prod) => updateBiz(biz.id, b => {
    const exists = b.products.some(p => p.id === prod.id);
    return { ...b, products: exists ? b.products.map(p => p.id === prod.id ? prod : p) : [...b.products, prod] };
  });
  const remove = (id) => updateBiz(biz.id, b => ({ ...b, products: b.products.filter(p => p.id !== id) }));

  return (
    <div>
      <SectionTitle eyebrow="Setup step 2" title="Products & services" action={
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline" small icon={<Plus size={14} />} onClick={() => setEditing(emptyProduct())}>Add product/service</Button>
          <Button variant="success" small icon={<Check size={14} />} onClick={markDone}>Mark complete</Button>
        </div>
      } />
      {editing && <ProductForm product={editing} onCancel={() => setEditing(null)} onSave={(p) => { save(p); setEditing(null); }} />}
      <div style={{ display: "grid", gap: 12 }}>
        {biz.products.map(p => (
          <Card key={p.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15.5 }}>{p.name}</div>
                <div style={{ color: "#6B7280", fontSize: 13.5, margin: "4px 0" }}>{p.shortDesc}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  <Badge color={TOKENS.primary} soft>{p.price} {p.currency}</Badge>
                  <Badge color={TOKENS.cold} soft>{p.availability || "Availability not set"}</Badge>
                  {p.appointmentsAvailable && <Badge color={TOKENS.active} soft>Appointments available</Badge>}
                  <Badge color={p.status === "Active" ? TOKENS.active : TOKENS.cold} soft>{p.status}</Badge>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Button variant="ghost" small icon={<Edit3 size={13} />} onClick={() => setEditing(p)}>Edit</Button>
                <Button variant="ghost" small icon={<Trash2 size={13} />} onClick={() => remove(p.id)}>Remove</Button>
              </div>
            </div>
          </Card>
        ))}
        {!biz.products.length && !editing && <Card style={{ textAlign: "center", color: TOKENS.cold }}>No products or services yet. Add at least one to activate the assistant.</Card>}
      </div>
    </div>
  );
}

function ProductForm({ product, onSave, onCancel }) {
  const [p, setP] = useState(product);
  const set = (k, v) => setP(prev => ({ ...prev, [k]: v }));
  return (
    <Card style={{ marginBottom: 18, border: `1.5px solid ${TOKENS.primary}` }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="Name"><TextInput value={p.name} onChange={e => set("name", e.target.value)} /></Field>
        <Field label="Target customer"><TextInput value={p.targetCustomer || ""} onChange={e => set("targetCustomer", e.target.value)} /></Field>
      </div>
      <Field label="Short description"><TextInput value={p.shortDesc} onChange={e => set("shortDesc", e.target.value)} /></Field>
      <Field label="Full description"><TextArea value={p.fullDesc} onChange={e => set("fullDesc", e.target.value)} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 20px" }}>
        <Field label="Price / price range"><TextInput value={p.price} onChange={e => set("price", e.target.value)} /></Field>
        <Field label="Currency"><TextInput value={p.currency} onChange={e => set("currency", e.target.value)} /></Field>
        <Field label="Availability"><TextInput value={p.availability} onChange={e => set("availability", e.target.value)} /></Field>
        <Field label="Locations served"><TextInput value={p.locations} onChange={e => set("locations", e.target.value)} /></Field>
        <Field label="Requirements"><TextInput value={p.requirements} onChange={e => set("requirements", e.target.value)} /></Field>
        <Field label="Delivery/completion time"><TextInput value={p.deliveryTime} onChange={e => set("deliveryTime", e.target.value)} /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="Approved benefits"><TextInput value={p.benefits} onChange={e => set("benefits", e.target.value)} /></Field>
        <Field label="Restrictions"><TextInput value={p.restrictions} onChange={e => set("restrictions", e.target.value)} /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 20px", alignItems: "end" }}>
        <Field label="Relevant URL"><TextInput value={p.url} onChange={e => set("url", e.target.value)} /></Field>
        <Field label="Status"><Select options={["Draft", "Active", "Archived"]} value={p.status} onChange={e => set("status", e.target.value)} /></Field>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: 13 }}>
          <input type="checkbox" checked={p.appointmentsAvailable} onChange={e => set("appointmentsAvailable", e.target.checked)} /> Appointments available
        </label>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="accent" onClick={() => onSave(p)} disabled={!p.name}>Save</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </Card>
  );
}

/* -------------------------------- Knowledge --------------------------------- */

const KB_CATEGORIES = ["About the business", "Products and services", "Pricing", "Availability", "Booking", "Delivery", "Customer support", "Refunds and cancellations", "Policies", "Contact information", "Other"];

function emptyKB() { return { id: uid("kb"), title: "", category: KB_CATEGORIES[0], content: "", priority: "Medium", status: "Draft", updated: new Date().toISOString().slice(0, 10) }; }

function KnowledgeView({ biz, updateBiz }) {
  const [editing, setEditing] = useState(null);
  const markDone = () => updateBiz(biz.id, b => ({ ...b, onboarding: { ...b.onboarding, knowledge: true } }));
  const save = (item) => updateBiz(biz.id, b => {
    const exists = b.knowledge.some(k => k.id === item.id);
    return { ...b, knowledge: exists ? b.knowledge.map(k => k.id === item.id ? item : k) : [...b.knowledge, item] };
  });
  const remove = (id) => updateBiz(biz.id, b => ({ ...b, knowledge: b.knowledge.filter(k => k.id !== id) }));
  const enough = biz.knowledge.length >= 5;

  return (
    <div>
      <SectionTitle eyebrow="Setup step 3" title="Knowledge base" action={
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline" small icon={<Plus size={14} />} onClick={() => setEditing(emptyKB())}>Add knowledge item</Button>
          <Button variant="success" small icon={<Check size={14} />} onClick={markDone}>Mark complete</Button>
        </div>
      } />
      <Card style={{ marginBottom: 16, background: "#FFF7E8", border: "1px solid #F0DBA6" }}>
        <div style={{ fontSize: 13, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <AlertTriangle size={16} color="#B5860B" style={{ flexShrink: 0, marginTop: 1 }} />
          Keep this information accurate. The chatbot uses only approved knowledge to draft responses — it will not invent answers. {!enough && "Add at least 5 items before activating."}
        </div>
      </Card>
      {editing && (
        <Card style={{ marginBottom: 18, border: `1.5px solid ${TOKENS.primary}` }}>
          <Field label="Title"><TextInput value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 20px" }}>
            <Field label="Category"><Select options={KB_CATEGORIES} value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} /></Field>
            <Field label="Priority"><Select options={["High", "Medium", "Low"]} value={editing.priority} onChange={e => setEditing({ ...editing, priority: e.target.value })} /></Field>
            <Field label="Status"><Select options={["Draft", "Approved", "Archived"]} value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })} /></Field>
          </div>
          <Field label="Content"><TextArea rows={4} value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })} /></Field>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="accent" disabled={!editing.title || !editing.content} onClick={() => { save({ ...editing, updated: new Date().toISOString().slice(0, 10) }); setEditing(null); }}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </Card>
      )}
      <div style={{ display: "grid", gap: 10 }}>
        {biz.knowledge.map(k => (
          <Card key={k.id} style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{k.title}</span>
                  <Badge color={TOKENS.cold} soft>{k.category}</Badge>
                  <Badge color={k.status === "Approved" ? TOKENS.active : TOKENS.warm} soft>{k.status}</Badge>
                </div>
                <div style={{ fontSize: 13, color: "#4A5568" }}>{k.content}</div>
                <div style={{ fontSize: 11, color: TOKENS.cold, marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>updated {k.updated} · priority {k.priority}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <Button variant="ghost" small icon={<Edit3 size={13} />} onClick={() => setEditing(k)}>Edit</Button>
                <Button variant="ghost" small icon={<Trash2 size={13} />} onClick={() => remove(k.id)}>Remove</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Chatbot settings ------------------------------ */

function ChatbotSettingsView({ biz, updateBiz }) {
  const c = biz.chatbotSettings;
  const set = (k, v) => updateBiz(biz.id, b => ({ ...b, chatbotSettings: { ...b.chatbotSettings, [k]: v } }));
  const markDone = () => updateBiz(biz.id, b => ({ ...b, onboarding: { ...b.onboarding, chatbot: true, leadCapture: true, handoff: true } }));

  const lc = biz.leadCapture;
  const updateQuestion = (i, v) => updateBiz(biz.id, b => { const qs = [...b.leadCapture.questions]; qs[i] = v; return { ...b, leadCapture: { ...b.leadCapture, questions: qs } }; });
  const addQuestion = () => updateBiz(biz.id, b => ({ ...b, leadCapture: { ...b.leadCapture, questions: [...b.leadCapture.questions, ""] } }));
  const removeQuestion = (i) => updateBiz(biz.id, b => ({ ...b, leadCapture: { ...b.leadCapture, questions: b.leadCapture.questions.filter((_, idx) => idx !== i) } }));

  const h = biz.handoff;
  const toggleTrigger = (t) => updateBiz(biz.id, b => {
    const has = b.handoff.triggers.includes(t);
    return { ...b, handoff: { ...b.handoff, triggers: has ? b.handoff.triggers.filter(x => x !== t) : [...b.handoff.triggers, t] } };
  });
  const ALL_TRIGGERS = ["Customer asks for a human", "Angry, distressed, or frustrated", "Complaint", "Legal matter", "Contract matter", "Financial advice or negotiation", "Medical or safety matter", "Refund or cancellation", "AI lacks approved information", "High-value or urgent lead", "Repeats a question"];

  return (
    <div>
      <SectionTitle eyebrow="Setup steps 4–6" title="Chatbot behavior, lead capture & human handoff" action={<Button variant="success" small icon={<Check size={14} />} onClick={markDone}>Mark complete</Button>} />
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 12 }}>Personality & rules</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <Field label="Assistant name"><TextInput value={c.assistantName} onChange={e => set("assistantName", e.target.value)} /></Field>
          <Field label="Preferred greeting"><TextInput value={c.preferredGreeting} onChange={e => set("preferredGreeting", e.target.value)} /></Field>
          <Field label="Brand tone"><TextInput value={c.tone} onChange={e => set("tone", e.target.value)} /></Field>
          <Field label="Formality level"><Select options={["Casual", "Semi-formal", "Formal"]} value={c.formality} onChange={e => set("formality", e.target.value)} /></Field>
          <Field label="Response length"><Select options={["Concise (2-4 sentences)", "Standard", "Detailed"]} value={c.responseLength} onChange={e => set("responseLength", e.target.value)} /></Field>
          <Field label="Supported languages"><TextInput value={c.languages} onChange={e => set("languages", e.target.value)} /></Field>
          <Field label="Words to use"><TextInput value={c.wordsToUse} onChange={e => set("wordsToUse", e.target.value)} /></Field>
          <Field label="Words to avoid"><TextInput value={c.wordsToAvoid} onChange={e => set("wordsToAvoid", e.target.value)} /></Field>
        </div>
        <Field label="Welcome message"><TextArea value={c.welcomeMessage} onChange={e => set("welcomeMessage", e.target.value)} /></Field>
        <Field label="Uncertainty message" hint="Used when the AI doesn't have approved information."><TextArea value={c.uncertaintyMessage} onChange={e => set("uncertaintyMessage", e.target.value)} /></Field>
        <Field label="Human-handoff message"><TextArea value={c.handoffMessage} onChange={e => set("handoffMessage", e.target.value)} /></Field>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4 }}>Sales lead qualification questions</div>
        <div style={{ fontSize: 12.5, color: TOKENS.cold, marginBottom: 12 }}>The assistant asks only what's relevant — not every question, every time.</div>
        {lc.questions.map((q, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <TextInput value={q} onChange={e => updateQuestion(i, e.target.value)} />
            <Button variant="ghost" small icon={<Trash2 size={13} />} onClick={() => removeQuestion(i)} />
          </div>
        ))}
        <Button variant="outline" small icon={<Plus size={14} />} onClick={addQuestion}>Add question</Button>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13 }}>
          <input type="checkbox" checked={lc.b2b} onChange={e => updateBiz(biz.id, b => ({ ...b, leadCapture: { ...b.leadCapture, b2b: e.target.checked } }))} />
          Include B2B qualification questions (company, role, users/locations, timeline)
        </label>
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4 }}>Human handoff triggers</div>
        <div style={{ fontSize: 12.5, color: TOKENS.cold, marginBottom: 12 }}>The assistant escalates to a human whenever any of these apply.</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {ALL_TRIGGERS.map(t => (
            <button key={t} onClick={() => toggleTrigger(t)} style={{
              border: `1px solid ${h.triggers.includes(t) ? TOKENS.primary : TOKENS.border}`, borderRadius: 999, padding: "6px 12px", fontSize: 12.5,
              background: h.triggers.includes(t) ? TOKENS.primarySoft : "transparent", color: h.triggers.includes(t) ? TOKENS.primary : "#4A5568", cursor: "pointer",
            }}>{t}</button>
          ))}
        </div>
        <Field label="Escalation contact"><TextInput value={h.contact} onChange={e => updateBiz(biz.id, b => ({ ...b, handoff: { ...b.handoff, contact: e.target.value } }))} /></Field>
      </Card>
    </div>
  );
}

/* ------------------------------- Appointments -------------------------------- */

function AppointmentsView({ biz, updateBiz }) {
  const a = biz.appointments;
  const set = (k, v) => updateBiz(biz.id, b => ({ ...b, appointments: { ...b.appointments, [k]: v } }));
  const markDone = () => updateBiz(biz.id, b => ({ ...b, onboarding: { ...b.onboarding, appointments: true } }));
  return (
    <div>
      <SectionTitle eyebrow="Setup step 7" title="Appointment settings" action={<Button variant="success" small icon={<Check size={14} />} onClick={markDone}>Mark complete</Button>} />
      <Card style={{ marginBottom: 16, background: "#FFF7E8", border: "1px solid #F0DBA6", fontSize: 13, display: "flex", gap: 8 }}>
        <AlertTriangle size={16} color="#B5860B" style={{ flexShrink: 0, marginTop: 1 }} />
        No live calendar is connected in this demo. The assistant will collect a preferred date/time as a <strong>request</strong> and clearly state it isn't confirmed yet.
      </Card>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <Field label="Appointment types"><TextInput value={a.types} onChange={e => set("types", e.target.value)} placeholder="Viewing, Consultation, ..." /></Field>
          <Field label="Duration"><TextInput value={a.duration} onChange={e => set("duration", e.target.value)} /></Field>
          <Field label="Booking URL (placeholder)"><TextInput value={a.bookingUrl} onChange={e => set("bookingUrl", e.target.value)} /></Field>
          <Field label="Business hours"><TextInput value={a.hours} onChange={e => set("hours", e.target.value)} /></Field>
          <Field label="Required customer details"><TextInput value={a.requiredDetails} onChange={e => set("requiredDetails", e.target.value)} /></Field>
          <Field label="Assigned team member"><TextInput value={a.assignedTeamMember} onChange={e => set("assignedTeamMember", e.target.value)} /></Field>
        </div>
        <Field label="Cancellation policy"><TextArea value={a.cancellationPolicy} onChange={e => set("cancellationPolicy", e.target.value)} /></Field>
        <Field label="Confirmation message"><TextArea value={a.confirmationMessage} onChange={e => set("confirmationMessage", e.target.value)} /></Field>
      </Card>
    </div>
  );
}

/* -------------------------------- Follow-up ---------------------------------- */

function FollowUpView({ biz, updateBiz }) {
  const f = biz.followUp;
  const set = (k, v) => updateBiz(biz.id, b => ({ ...b, followUp: { ...b.followUp, [k]: v } }));
  return (
    <div>
      <SectionTitle eyebrow="Follow-up automation" title="Follow-up settings" />
      <Card>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: 13.5, fontWeight: 600 }}>
          <input type="checkbox" checked={f.enabled} onChange={e => set("enabled", e.target.checked)} /> Follow-up enabled
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <Field label="Follow-up timing"><TextInput value={f.timing} onChange={e => set("timing", e.target.value)} /></Field>
          <Field label="Maximum number of follow-ups"><TextInput type="number" value={f.maxFollowUps} onChange={e => set("maxFollowUps", e.target.value)} /></Field>
          <Field label="Assigned team member"><TextInput value={f.assignedTeamMember} onChange={e => set("assignedTeamMember", e.target.value)} /></Field>
        </div>
        <Field label="Stop conditions"><TextArea value={f.stopConditions} onChange={e => set("stopConditions", e.target.value)} /></Field>
      </Card>
      <div style={{ marginTop: 16 }}>
        <Card>
          <div style={{ fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 10 }}>Follow-up tasks</div>
          {biz.followUpTasks.length ? biz.followUpTasks.map(t => (
            <div key={t.id} style={{ fontSize: 13, padding: "8px 0", borderBottom: `1px solid ${TOKENS.border}` }}>{t.leadName} — {t.reason} — due {t.date}</div>
          )) : <div style={{ color: TOKENS.cold, fontSize: 13 }}>No follow-up tasks yet. Create one from a conversation.</div>}
        </Card>
      </div>
    </div>
  );
}

/* ----------------------------- Conversations / review ------------------------------ */

function ConversationsView({ biz, updateBiz, role }) {
  const [selectedId, setSelectedId] = useState(biz.conversations[0]?.id || null);
  const selected = biz.conversations.find(c => c.id === selectedId) || null;

  return (
    <div>
      <SectionTitle eyebrow="Setup step 8 · Human Review Mode" title="Conversations & AI review" />
      <Card style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center", background: TOKENS.primarySoft, border: `1px solid ${TOKENS.primary}55` }}>
        <ShieldCheck size={16} color={TOKENS.primary} />
        <span style={{ fontSize: 13 }}>Human Review Mode: AI suggestions require approval before a customer ever sees them.</span>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
        <Card style={{ padding: 8 }}>
          {biz.conversations.map(c => (
            <button key={c.id} onClick={() => setSelectedId(c.id)} style={{
              width: "100%", textAlign: "left", border: "none", background: selectedId === c.id ? TOKENS.paper : "transparent",
              borderRadius: 10, padding: "10px 12px", marginBottom: 4, cursor: "pointer",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>{c.visitorName}</span>
                {c.pendingDraft && <span style={{ width: 8, height: 8, borderRadius: 999, background: TOKENS.primary, display: "inline-block" }} />}
              </div>
              <div style={{ fontSize: 11.5, color: TOKENS.cold, margin: "2px 0" }}>{c.status}</div>
              <TempBadge temp={c.leadTemperature} />
            </button>
          ))}
          {!biz.conversations.length && <div style={{ padding: 12, color: TOKENS.cold, fontSize: 13 }}>No conversations yet. Try the customer chat as the "Customer" role.</div>}
        </Card>
        {selected ? <ConversationDetail biz={biz} conv={selected} updateBiz={updateBiz} /> : <Card style={{ color: TOKENS.cold }}>Select a conversation.</Card>}
      </div>
    </div>
  );
}

const STATUS_OPTIONS = ["New inquiry", "In progress", "Qualified", "Appointment requested", "Appointment booked", "Follow-up required", "Human review required", "Closed", "Not interested", "Do not contact"];

function ConversationDetail({ biz, conv, updateBiz }) {
  const [note, setNote] = useState("");
  const [editText, setEditText] = useState(null);

  const patchConv = (patch) => updateBiz(biz.id, b => ({ ...b, conversations: b.conversations.map(c => c.id === conv.id ? { ...c, ...patch } : c) }));

  const approveDraft = () => {
    const draft = conv.pendingDraft;
    if (!draft) return;
    const msg = { id: uid("m"), role: "assistant", text: draft.reply, ts: Date.now() };
    patchConv({
      messages: [...conv.messages, msg], pendingDraft: null,
      intent: draft.intent, leadTemperature: draft.lead_temperature,
      capturedInfo: { ...conv.capturedInfo, ...Object.fromEntries(Object.entries(draft.captured_info || {}).filter(([, v]) => v)) },
      escalate: draft.escalate, doNotContact: draft.do_not_contact || conv.doNotContact,
      status: draft.do_not_contact ? "Do not contact" : draft.escalate ? "Human review required" : conv.status,
    });
  };
  const rejectDraft = () => patchConv({ pendingDraft: null });
  const saveEdit = () => {
    if (editText === null) return;
    const msg = { id: uid("m"), role: "assistant", text: editText, ts: Date.now() };
    patchConv({ messages: [...conv.messages, msg], pendingDraft: null });
    setEditText(null);
  };
  const escalateNow = () => patchConv({ escalate: true, status: "Human review required", pendingDraft: null });
  const markQualified = () => patchConv({ status: "Qualified" });
  const closeConv = () => patchConv({ status: "Closed" });
  const doNotContact = () => patchConv({ status: "Do not contact", doNotContact: true });
  const addNote = () => { if (!note.trim()) return; patchConv({ notes: [...conv.notes, { id: uid("note"), text: note, ts: Date.now() }] }); setNote(""); };
  const createFollowUp = () => {
    updateBiz(biz.id, b => ({ ...b, followUpTasks: [...b.followUpTasks, { id: uid("task"), leadName: conv.visitorName, reason: conv.capturedInfo?.need || "General follow-up", date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10), assignedTo: conv.assignedTo, status: "Open" }] }));
  };

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${TOKENS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700 }}>{conv.visitorName} <span style={{ fontWeight: 400, color: TOKENS.cold, fontSize: 12.5 }}>· {conv.channel}</span></div>
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <TempBadge temp={conv.leadTemperature} />
            {conv.intent && <Badge color={TOKENS.cold} soft>{conv.intent.replaceAll("_", " ")}</Badge>}
            {conv.escalate && <Badge color={TOKENS.hot} soft>Escalated</Badge>}
          </div>
        </div>
        <Select options={STATUS_OPTIONS} value={conv.status} onChange={e => patchConv({ status: e.target.value })} />
      </div>

      <div style={{ padding: 18, maxHeight: 340, overflowY: "auto", background: "#FBFAF7" }}>
        {conv.messages.map(m => (
          <div key={m.id} style={{ display: "flex", gap: 8, marginBottom: 12, flexDirection: m.role === "visitor" ? "row" : "row-reverse" }}>
            <div style={{ width: 26, height: 26, borderRadius: 999, background: m.role === "visitor" ? TOKENS.cold : TOKENS.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {m.role === "visitor" ? <User size={13} color="#fff" /> : <Bot size={13} color="#fff" />}
            </div>
            <div style={{ maxWidth: "72%", background: m.role === "visitor" ? "#fff" : TOKENS.primarySoft, border: `1px solid ${TOKENS.border}`, borderRadius: 12, padding: "8px 12px", fontSize: 13.5 }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {conv.pendingDraft && (
        <div style={{ padding: 16, borderTop: `1px solid ${TOKENS.border}`, background: "#FFF9EC" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#B5860B", marginBottom: 8, display: "flex", alignItems: "center", gap: 6, fontFamily: "'IBM Plex Mono', monospace" }}>
            <Sparkles size={13} /> AI SUGGESTED RESPONSE — AWAITING REVIEW
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10, fontSize: 12 }}>
            <div><strong>Intent:</strong> {conv.pendingDraft.intent?.replaceAll("_", " ")}</div>
            <div><strong>Lead temp:</strong> {conv.pendingDraft.lead_temperature}</div>
            <div style={{ gridColumn: "1 / -1" }}><strong>Next action:</strong> {conv.pendingDraft.next_action}</div>
            {conv.pendingDraft.escalate && <div style={{ gridColumn: "1 / -1", color: TOKENS.hot }}><strong>Escalation reason:</strong> {conv.pendingDraft.escalation_reason}</div>}
          </div>
          {editText === null ? (
            <div style={{ background: "#fff", border: `1px solid ${TOKENS.border}`, borderRadius: 10, padding: 12, fontSize: 13.5, marginBottom: 10 }}>{conv.pendingDraft.reply}</div>
          ) : (
            <TextArea value={editText} onChange={e => setEditText(e.target.value)} rows={3} style={{ marginBottom: 10 }} />
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {editText === null ? (
              <>
                <Button variant="success" small icon={<Check size={13} />} onClick={approveDraft}>Approve response</Button>
                <Button variant="outline" small icon={<Edit3 size={13} />} onClick={() => setEditText(conv.pendingDraft.reply)}>Edit response</Button>
                <Button variant="danger" small icon={<X size={13} />} onClick={rejectDraft}>Reject response</Button>
                <Button variant="ghost" small icon={<AlertTriangle size={13} />} onClick={escalateNow}>Escalate to human</Button>
              </>
            ) : (
              <>
                <Button variant="success" small onClick={saveEdit}>Send edited response</Button>
                <Button variant="ghost" small onClick={() => setEditText(null)}>Cancel edit</Button>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ padding: 16, borderTop: `1px solid ${TOKENS.border}`, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button variant="outline" small icon={<CheckCircle2 size={13} />} onClick={markQualified}>Mark qualified</Button>
        <Button variant="outline" small icon={<Bell size={13} />} onClick={createFollowUp}>Create follow-up</Button>
        <Button variant="outline" small icon={<X size={13} />} onClick={closeConv}>Close conversation</Button>
        <Button variant="outline" small icon={<AlertTriangle size={13} />} onClick={doNotContact}>Do not contact</Button>
      </div>

      <div style={{ padding: 16, borderTop: `1px solid ${TOKENS.border}` }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>Internal notes</div>
        {conv.notes.map(n => <div key={n.id} style={{ fontSize: 12.5, color: "#4A5568", padding: "5px 0", borderBottom: `1px solid ${TOKENS.border}` }}>{n.text}</div>)}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <TextInput value={note} onChange={e => setNote(e.target.value)} placeholder="Add an internal note…" />
          <Button variant="outline" small onClick={addNote}>Add</Button>
        </div>
      </div>
    </Card>
  );
}

/* ---------------------------------- Leads ------------------------------------ */

function LeadsView({ biz }) {
  return (
    <div>
      <SectionTitle eyebrow="Pipeline" title="Leads" />
      <Card style={{ padding: 0 }}><LeadsTable biz={biz} /></Card>
    </div>
  );
}

function LeadsTable({ biz, compact }) {
  const [tempFilter, setTempFilter] = useState("all");
  const rows = biz.conversations.filter(c => tempFilter === "all" || c.leadTemperature === tempFilter);

  return (
    <div>
      {!compact && (
        <div style={{ display: "flex", gap: 8, padding: 14, borderBottom: `1px solid ${TOKENS.border}` }}>
          {["all", "hot", "warm", "cold"].map(t => (
            <button key={t} onClick={() => setTempFilter(t)} style={{
              border: "none", borderRadius: 999, padding: "5px 12px", fontSize: 12, cursor: "pointer",
              background: tempFilter === t ? TOKENS.ink : TOKENS.paper, color: tempFilter === t ? "#fff" : TOKENS.ink, textTransform: "capitalize",
            }}>{t}</button>
          ))}
        </div>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", color: TOKENS.cold, fontSize: 11.5 }}>
            <th style={{ padding: "8px 14px" }}>Name</th>
            <th>Product / need</th>
            <th>Temp</th>
            <th>Status</th>
            {!compact && <th>Assigned</th>}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, compact ? 5 : 100).map(c => (
            <tr key={c.id} style={{ borderTop: `1px solid ${TOKENS.border}` }}>
              <td style={{ padding: "10px 14px", fontWeight: 600 }}>{c.visitorName}</td>
              <td>{c.capturedInfo?.product || c.capturedInfo?.need || "—"}</td>
              <td><TempBadge temp={c.leadTemperature} /></td>
              <td>{c.status}</td>
              {!compact && <td>{c.assignedTo || "Unassigned"}</td>}
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5} style={{ padding: 20, textAlign: "center", color: TOKENS.cold }}>No leads yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------- Activate ------------------------------------ */

function ActivateView({ biz, updateBiz }) {
  const checks = [
    { label: "Business profile completed", ok: !!biz.profile.description },
    { label: "At least one product or service added", ok: biz.products.length > 0 },
    { label: "At least five FAQs or approved answers added", ok: biz.knowledge.filter(k => k.status === "Approved").length >= 5 },
    { label: "Human contact configured", ok: !!biz.handoff.contact },
    { label: "Privacy notice added", ok: !!biz.profile.privacyUrl },
    { label: "Test conversations completed", ok: biz.conversations.length > 0 },
  ];
  const allOk = checks.every(c => c.ok);
  const [confirmed, setConfirmed] = useState(biz.activation.confirmed);

  const setStatus = (status) => updateBiz(biz.id, b => ({ ...b, status, activation: { ...b.activation, confirmed, activatedAt: status === "Active" ? Date.now() : b.activation.activatedAt }, onboarding: { ...b.onboarding, review: status === "Active" ? true : b.onboarding.review } }));

  return (
    <div>
      <SectionTitle eyebrow="Setup step 9" title="Review & activate" action={<StatusBadge status={biz.status} />} />
      <Card style={{ marginBottom: 16 }}>
        {checks.map(c => (
          <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
            {c.ok ? <CheckCircle2 size={17} color={TOKENS.active} /> : <Circle size={17} color={TOKENS.cold} />}
            <span style={{ fontSize: 13.5, color: c.ok ? TOKENS.ink : "#6B7280" }}>{c.label}</span>
          </div>
        ))}
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5 }}>
          <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} style={{ marginTop: 3 }} />
          I confirm that the business information, approved answers, contact details, policies, and escalation rules are accurate. I understand that the assistant should be monitored and updated when business information changes.
        </label>
      </Card>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Button variant="outline" onClick={() => setStatus("Setup In Progress")}>Save as draft</Button>
        <Button variant="outline" icon={<MessageSquare size={15} />} onClick={() => setStatus("Testing")}>Test assistant</Button>
        <Button variant="accent" disabled={!allOk || !confirmed} icon={<Play size={15} />} onClick={() => setStatus("Active")}>Activate assistant</Button>
        {biz.status === "Active" && <Button variant="danger" icon={<Pause size={15} />} onClick={() => setStatus("Paused")}>Pause assistant</Button>}
      </div>

      {biz.status === "Active" && (
        <Card style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 10 }}>Assistant is live (demo)</div>
          <div style={{ fontSize: 13, color: "#4A5568", marginBottom: 10 }}>Preview link, embed code, and channel integrations are placeholders in this MVP:</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, background: TOKENS.paper, padding: 12, borderRadius: 8 }}>
            {`<script src="https://cdn.travispromptai.example/widget.js" data-business="${biz.id}"></script>`}
          </div>
          <div style={{ fontSize: 12, color: TOKENS.cold, marginTop: 8 }}>Shareable demo link: travispromptai.example/chat/{biz.id} (placeholder)</div>
        </Card>
      )}
    </div>
  );
}

/* --------------------------------- Super admin --------------------------------- */

function SuperAdminView({ businesses, updateBiz }) {
  const totals = {
    total: businesses.length,
    active: businesses.filter(b => b.status === "Active").length,
    setup: businesses.filter(b => b.status.startsWith("Setup")).length,
    paused: businesses.filter(b => ["Paused", "Suspended"].includes(b.status)).length,
    conversations: businesses.reduce((s, b) => s + b.conversations.length, 0),
    leads: businesses.reduce((s, b) => s + b.conversations.filter(c => c.capturedInfo?.name).length, 0),
    handoffs: businesses.reduce((s, b) => s + b.conversations.filter(c => c.escalate).length, 0),
  };
  const toggleSuspend = (id) => updateBiz(id, b => ({ ...b, status: b.status === "Suspended" ? "Active" : "Suspended" }));

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
      <SectionTitle eyebrow="Platform" title="Super admin — platform overview" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          ["Total businesses", totals.total], ["Active", totals.active], ["Setup in progress", totals.setup], ["Paused/suspended", totals.paused],
          ["Total conversations", totals.conversations], ["Total leads", totals.leads], ["Human handoffs", totals.handoffs],
        ].map(([l, v]) => (
          <Card key={l} style={{ padding: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{v}</div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>{l}</div>
          </Card>
        ))}
      </div>
      <Card style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead><tr style={{ textAlign: "left", color: TOKENS.cold, fontSize: 11.5 }}>
            <th style={{ padding: "10px 16px" }}>Business</th><th>ID</th><th>Industry</th><th>Status</th><th>Leads</th><th></th>
          </tr></thead>
          <tbody>
            {businesses.map(b => (
              <tr key={b.id} style={{ borderTop: `1px solid ${TOKENS.border}` }}>
                <td style={{ padding: "10px 16px", fontWeight: 600 }}>{b.businessName}</td>
                <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: TOKENS.cold }}>{b.id}</td>
                <td>{b.industry}</td>
                <td><StatusBadge status={b.status} /></td>
                <td>{b.conversations.filter(c => c.capturedInfo?.name).length}</td>
                <td><Button variant="ghost" small onClick={() => toggleSuspend(b.id)}>{b.status === "Suspended" ? "Reactivate" : "Suspend"}</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div style={{ fontSize: 11.5, color: TOKENS.cold, marginTop: 14, fontFamily: "'IBM Plex Mono', monospace" }}>
        Platform admin cannot view or edit individual business knowledge bases, leads, or conversation content without explicit administrative access (demo simulates isolation via separate workspace records).
      </div>
    </div>
  );
}

/* --------------------------------- Visitor chat --------------------------------- */

function VisitorView({ biz, updateBiz, businessList, currentBusinessId, setCurrentBusinessId }) {
  const [conversationId, setConversationId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [visitorName] = useState("Guest visitor");
  const bottomRef = useRef(null);

  const activeBusinesses = businessList.filter(b => b.status === "Active");
  const conv = conversationId ? biz?.conversations.find(c => c.id === conversationId) : null;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conv?.messages?.length, conv?.pendingDraft]);

  if (!biz || biz.status !== "Active") {
    return (
      <div style={{ maxWidth: 640, margin: "60px auto", padding: 24 }}>
        <Card style={{ textAlign: "center" }}>
          <AlertTriangle size={22} color={TOKENS.warm} style={{ marginBottom: 8 }} />
          <div style={{ fontWeight: 700, marginBottom: 6 }}>No active assistant selected</div>
          <div style={{ fontSize: 13.5, color: "#6B7280", marginBottom: 14 }}>Pick an active business workspace to try its public chatbot as a customer would see it.</div>
          <select value={currentBusinessId || ""} onChange={e => setCurrentBusinessId(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
            <option value="">Select a business…</option>
            {activeBusinesses.map(b => <option key={b.id} value={b.id}>{b.businessName}</option>)}
          </select>
          {!activeBusinesses.length && <div style={{ fontSize: 12.5, color: TOKENS.cold, marginTop: 10 }}>No businesses are Active yet — activate one from the Owner view first.</div>}
        </Card>
      </div>
    );
  }

  const startConversation = () => {
    const newConv = {
      id: uid("conv"), visitorName, channel: "Website widget (demo)", startedAt: Date.now(),
      messages: [{ id: uid("m"), role: "assistant", text: biz.chatbotSettings.welcomeMessage, ts: Date.now() }],
      pendingDraft: null, intent: null, leadTemperature: "none", status: "New inquiry", capturedInfo: {}, escalate: false, assignedTo: null, notes: [], doNotContact: false,
    };
    updateBiz(biz.id, b => ({ ...b, conversations: [...b.conversations, newConv] }));
    setConversationId(newConv.id);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !conv || conv.doNotContact) return;
    const visitorMsg = { id: uid("m"), role: "visitor", text, ts: Date.now() };
    updateBiz(biz.id, b => ({ ...b, conversations: b.conversations.map(c => c.id === conv.id ? { ...c, messages: [...c.messages, visitorMsg] } : c) }));
    setInput("");
    setLoading(true);
    const updatedConv = { ...conv, messages: [...conv.messages, visitorMsg] };
    const draft = await generateAIDraft(biz, updatedConv, text);
    setLoading(false);
    updateBiz(biz.id, b => ({ ...b, conversations: b.conversations.map(c => c.id === conv.id ? { ...c, pendingDraft: draft, status: draft.escalate ? "Human review required" : c.status } : c) }));
  };

  const quickReplies = [
    "I want information", "I'm interested in a product or service", "I want a price or quote",
    "I want to book an appointment", "I need customer support", "I want to speak to a human",
  ];

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 12.5, color: TOKENS.cold }}>Previewing as a public visitor of <strong style={{ color: TOKENS.ink }}>{biz.businessName}</strong></div>
        {activeBusinesses.length > 1 && (
          <select value={currentBusinessId} onChange={e => { setCurrentBusinessId(e.target.value); setConversationId(null); }} style={{ ...inputStyle, width: "auto", fontSize: 12 }}>
            {activeBusinesses.map(b => <option key={b.id} value={b.id}>{b.businessName}</option>)}
          </select>
        )}
      </div>

      <Card style={{ padding: 0, overflow: "hidden", height: 560, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${TOKENS.border}`, display: "flex", alignItems: "center", gap: 10, background: TOKENS.ink, color: "#fff" }}>
          <div style={{ width: 30, height: 30, borderRadius: 999, background: TOKENS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><Bot size={16} /></div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{biz.chatbotSettings.assistantName}</div>
            <div style={{ fontSize: 11, color: "#B9C0CE" }}>AI assistant for {biz.businessName} · Demo Mode</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16, background: "#FBFAF7" }}>
          {!conv ? (
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <Button variant="accent" icon={<MessageSquare size={15} />} onClick={startConversation}>Start a conversation</Button>
            </div>
          ) : (
            <>
              {conv.messages.map(m => (
                <div key={m.id} style={{ display: "flex", gap: 8, marginBottom: 12, flexDirection: m.role === "visitor" ? "row-reverse" : "row" }}>
                  <div style={{ width: 24, height: 24, borderRadius: 999, background: m.role === "visitor" ? TOKENS.primary : TOKENS.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {m.role === "visitor" ? <User size={12} color="#fff" /> : <Bot size={12} color="#fff" />}
                  </div>
                  <div style={{ maxWidth: "75%", background: m.role === "visitor" ? TOKENS.primary : "#fff", color: m.role === "visitor" ? "#fff" : TOKENS.ink, border: `1px solid ${TOKENS.border}`, borderRadius: 14, padding: "9px 13px", fontSize: 13.5 }}>{m.text}</div>
                </div>
              ))}
              {conv.pendingDraft && (
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 999, background: TOKENS.warm, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Clock size={12} color="#fff" /></div>
                  <div style={{ fontSize: 12, color: TOKENS.cold, fontStyle: "italic", padding: "9px 0" }}>Your message has been received — a response is pending human review before it's sent.</div>
                </div>
              )}
              {loading && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", color: TOKENS.cold, fontSize: 12.5 }}><Loader2 size={14} className="spin" style={{ animation: "spin 1s linear infinite" }} /> Drafting a response…</div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {conv && conv.messages.length <= 1 && !conv.pendingDraft && (
          <div style={{ padding: "0 16px 10px", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {quickReplies.map(q => (
              <button key={q} onClick={() => sendMessage(q)} style={{ border: `1px solid ${TOKENS.border}`, background: "#fff", borderRadius: 999, padding: "6px 11px", fontSize: 12, cursor: "pointer" }}>{q}</button>
            ))}
          </div>
        )}

        {conv && (
          <div style={{ padding: 14, borderTop: `1px solid ${TOKENS.border}`, display: "flex", gap: 8 }}>
            <TextInput
              value={input} onChange={e => setInput(e.target.value)} placeholder={conv.doNotContact ? "This conversation is marked do-not-contact." : "Type a message…"}
              disabled={conv.doNotContact || !!conv.pendingDraft}
              onKeyDown={e => { if (e.key === "Enter") sendMessage(input); }}
            />
            <Button variant="accent" icon={<Send size={14} />} disabled={conv.doNotContact || !!conv.pendingDraft || loading} onClick={() => sendMessage(input)} />
          </div>
        )}
      </Card>
      <div style={{ fontSize: 11, color: TOKENS.cold, marginTop: 10, textAlign: "center" }}>
        This is an AI assistant, not a human. Demo Mode — no real messages are sent externally.
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  );
}
