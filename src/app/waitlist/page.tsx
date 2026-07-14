"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Section from "@/components/Section";
import { COLORS, DESIGN_H, bgFadeGradient } from "@/components/tokens";

/* ---------------------------------------------------------------------------------------
 * Join Waitlist page (Figma 237:1545) + Thank-you view (Figma 245:1833).
 *
 * The form lives in a scaled 1440×780 stage (like the landing sections). On a valid submit
 * the Join button widens, and clicking it wipes the brand gradient across the whole screen;
 * the gradient then settles to a faint tint and the thank-you view fades in with a back
 * button (→ hero).
 * ------------------------------------------------------------------------------------- */

const INDUSTRIES = [
  "Fintech",
  "Healthtech",
  "E-commerce & Retail",
  "Marketing & AdTech",
  "HR & Recruiting",
  "Developer Tools",
  "Cybersecurity",
  "Education (EdTech)",
  "Real Estate (PropTech)",
  "Data & Analytics",
  "Productivity & Collaboration",
  "Customer Support",
  "Sales & CRM",
  "Logistics & Supply Chain",
  "Legal (LegalTech)",
  "Other",
];

const PILL_BG = "#080809";
const PLACEHOLDER = "#5b5b5b";
const PILL_RADIUS = 74.576;
const FIELD_H = 64.8;
const PILL_PL = 49.717;
const PILL_PR = 24.3;
const TEXT_SIZE = 12.96;
const TEXT_LS = "-0.2592px";

const FILL_GRADIENT = "linear-gradient(to right, #FFC100, #FF7400, #FF0000)";
const emailValid = (v: string) => /\S+@\S+\.\S+/.test(v);

type Mode = "form" | "fill" | "dim" | "thanks";

export default function WaitlistPage() {
  const router = useRouter();

  // Match the landing page's viewport-height scaling so the pills render at the Figma size.
  useEffect(() => {
    const setScale = () =>
      document.documentElement.style.setProperty(
        "--section-scale",
        String(window.innerHeight / DESIGN_H)
      );
    setScale();
    window.addEventListener("resize", setScale);
    return () => window.removeEventListener("resize", setScale);
  }, []);

  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [joinHover, setJoinHover] = useState(false);

  const [mode, setMode] = useState<Mode>("form");
  const [expanded, setExpanded] = useState(false);
  const originRef = useRef({ x: 0, y: 0 });

  const valid =
    first.trim() !== "" &&
    last.trim() !== "" &&
    emailValid(email) &&
    !!industry &&
    agreed;

  // Choreography: header fades → gradient blasts to full-screen and holds → opacity drops
  // to 10% → the card + back button load in.
  useEffect(() => {
    if (mode === "fill") {
      const t1 = setTimeout(() => setExpanded(true), 380); // let the header fade first
      const t2 = setTimeout(() => setMode("dim"), 1450); // hold once filled, then dim
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    if (mode === "dim") {
      const t = setTimeout(() => setMode("thanks"), 620); // after the opacity settles
      return () => clearTimeout(t);
    }
  }, [mode]);

  const onJoin = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!valid || mode !== "form") return;
    const r = e.currentTarget.getBoundingClientRect();
    originRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    setMode("fill");
  };

  return (
    <main style={{ position: "relative", minHeight: "100vh", background: COLORS.bg, overflow: "hidden" }}>
      {(mode === "form" || mode === "fill") && (
        <div style={{ opacity: mode === "form" ? 1 : 0, transition: "opacity 320ms ease" }}>
          <Nav />
        </div>
      )}

      {/* ---- Form (stays mounted under the wipe, then unmounts before the gradient dims) ---- */}
      {(mode === "form" || mode === "fill") && (
        <Section>
          <div
            style={{
              position: "absolute",
              left: 136.8,
              top: 130.21,
              width: 1166.4,
              height: 581.58,
              paddingLeft: 121.5,
              paddingRight: 121.5,
              paddingBottom: 64.8,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 40.5,
            }}
          >
            {/* Title */}
            <p
              style={{
                margin: 0,
                fontWeight: 500,
                fontSize: 32.4,
                lineHeight: 1.12,
                letterSpacing: "-0.648px",
                color: COLORS.text,
              }}
            >
              Join the <span className="brand-text-gradient">Waitlist</span>
            </p>

            {/* First / Last */}
            <div style={{ display: "flex", gap: 40.5, alignItems: "center" }}>
              <PillTextInput value={first} onChange={setFirst} placeholder="First Name" grow name="given-name" autoComplete="given-name" />
              <PillTextInput value={last} onChange={setLast} placeholder="Last Name" grow name="family-name" autoComplete="family-name" />
            </div>

            {/* Industry */}
            <IndustrySelect value={industry} onChange={setIndustry} />

            {/* Terms */}
            <TermsRow checked={agreed} onToggle={() => setAgreed((a) => !a)} />

            {/* Email + Join */}
            <div style={{ position: "relative", width: "100%" }}>
              <PillTextInput
                value={email}
                onChange={setEmail}
                placeholder="Enter email"
                type="email"
                name="email"
                autoComplete="email"
                paddingRight={PILL_PR + 141.75}
              />
              <button
                onClick={onJoin}
                onMouseEnter={() => setJoinHover(true)}
                onMouseLeave={() => setJoinHover(false)}
                disabled={!valid}
                style={{
                  position: "absolute",
                  top: 0,
                  // Widen leftward when valid, and further on hover.
                  left: valid ? (joinHover ? 711.65 : 751.65) : 781.65,
                  width: valid ? (joinHover ? 211.75 : 171.75) : 141.75,
                  height: FIELD_H,
                  border: "none",
                  borderTopRightRadius: PILL_RADIUS,
                  borderBottomRightRadius: PILL_RADIUS,
                  background: FILL_GRADIENT,
                  opacity: valid ? 1 : 0.5,
                  color: valid ? "#fff" : "rgba(255,255,255,0.75)",
                  fontWeight: 600,
                  fontSize: 14.58,
                  letterSpacing: "-0.2916px",
                  cursor: valid ? "pointer" : "default",
                  transition: "left 320ms cubic-bezier(0.4,0,0.2,1), width 320ms cubic-bezier(0.4,0,0.2,1), opacity 260ms ease",
                  overflow: "hidden",
                }}
              >
                Join
              </button>
            </div>
          </div>
        </Section>
      )}

      {/* ---- Gradient wipe (full while filling) → settled 10% tint (the thank-you bg) ---- */}
      {mode !== "form" && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            background: FILL_GRADIENT,
            opacity: mode === "fill" ? 1 : 0.1,
            // Circle wipe while filling; full-viewport (no clip) once it holds and dims.
            clipPath:
              mode === "fill"
                ? `circle(${expanded ? "150%" : "0%"} at ${originRef.current.x}px ${originRef.current.y}px)`
                : "none",
            transition: "clip-path 900ms cubic-bezier(0.4,0,0.2,1), opacity 550ms ease",
            pointerEvents: "none",
            zIndex: 30,
          }}
        />
      )}

      {/* ---- Thank you (card centered in the viewport; back button pinned top-left) ---- */}
      {mode === "thanks" && <ThankYouView onBack={() => router.push("/")} />}
    </main>
  );
}

/* ---------- Pill text input (First / Last / Email) ---------- */

function PillTextInput({
  value,
  onChange,
  placeholder,
  grow = false,
  type = "text",
  paddingRight = PILL_PR,
  autoComplete,
  name,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  grow?: boolean;
  type?: string;
  paddingRight?: number;
  autoComplete?: string;
  name?: string;
}) {
  const [focused, setFocused] = useState(false);
  const showPlaceholder = !focused && value === "";

  return (
    <div
      style={{
        position: "relative",
        flex: grow ? "1 0 0" : undefined,
        minWidth: grow ? 0 : undefined,
        width: grow ? undefined : "100%",
        height: FIELD_H,
        background: PILL_BG,
        borderRadius: PILL_RADIUS,
        display: "flex",
        alignItems: "center",
      }}
    >
      <input
        className="wl-input"
        type={type}
        name={name}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
          border: "none",
          outline: "none",
          paddingLeft: PILL_PL,
          paddingRight,
          color: COLORS.text,
          caretColor: "#FF7400",
          fontSize: TEXT_SIZE,
          letterSpacing: TEXT_LS,
          fontWeight: 400,
          fontFamily: "inherit",
        }}
      />
      {showPlaceholder && (
        <span
          style={{
            position: "absolute",
            left: PILL_PL,
            fontSize: TEXT_SIZE,
            letterSpacing: TEXT_LS,
            lineHeight: 1.12,
            color: PLACEHOLDER,
            pointerEvents: "none",
          }}
        >
          {placeholder}
        </span>
      )}
      {/* The "line" that pops up to type on once the placeholder clears. */}
      <span
        style={{
          position: "absolute",
          left: PILL_PL,
          bottom: FIELD_H / 2 - TEXT_SIZE / 2 - 5,
          width: 16,
          height: 1.5,
          borderRadius: 1,
          background: "rgba(255,255,255,0.35)",
          opacity: focused && value === "" ? 1 : 0,
          transition: "opacity 180ms ease",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

/* ---------- Industry dropdown ---------- */

function IndustrySelect({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", alignSelf: "flex-start" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          height: 37.26,
          background: PILL_BG,
          borderRadius: PILL_RADIUS,
          border: "none",
          paddingLeft: 49.41,
          paddingRight: PILL_PR,
          display: "flex",
          alignItems: "center",
          gap: 24.3,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <span style={{ fontSize: TEXT_SIZE, letterSpacing: TEXT_LS, color: value ? COLORS.text : PLACEHOLDER, whiteSpace: "nowrap" }}>
          {value ?? "Industry"}
        </span>
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 180ms ease" }}>
          <path d="M4 6 L8 10 L12 6" stroke={PLACEHOLDER} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 37.26 + 8,
            left: 0,
            minWidth: 220,
            maxHeight: 240,
            overflowY: "auto",
            background: "#0b0b0b",
            border: "0.5px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: 6,
            zIndex: 5,
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
          }}
        >
          {INDUSTRIES.map((it) => (
            <div
              key={it}
              onClick={() => {
                onChange(it);
                setOpen(false);
              }}
              style={{
                padding: "8px 14px",
                borderRadius: 12,
                fontSize: 11,
                letterSpacing: "-0.1px",
                color: it === value ? "#fff" : "#c9c9c9",
                background: it === value ? "rgba(255,255,255,0.05)" : "transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = it === value ? "rgba(255,255,255,0.05)" : "transparent")}
            >
              {it}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Terms checkbox (box or sentence toggles) ---------- */

function TermsRow({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{ display: "flex", alignItems: "center", gap: 15.39, paddingLeft: 15.39, cursor: "pointer", userSelect: "none", alignSelf: "flex-start" }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: 3.5,
          border: checked ? "none" : "1.5px solid #f7f8f8",
          background: checked ? "linear-gradient(to right, #FF7400, #FF0000)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M3.5 8.5 L6.5 11.5 L12.5 4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span style={{ fontSize: TEXT_SIZE, letterSpacing: TEXT_LS, color: "#fff", whiteSpace: "nowrap" }}>
        I agree to receive emails from Tavyn regarding my waitlist sign up.
      </span>
    </div>
  );
}

/* ---------- Thank-you view (Figma 245:1833) ---------- */

function ThankYouView({ onBack }: { onBack: () => void }) {
  return (
    <>
      {/* Back button — pinned to the viewport's top-left corner (half the old padding). */}
      <button
        onClick={onBack}
        aria-label="Back to home"
        className="wl-fade-in"
        style={{
          position: "fixed",
          left: 30,
          top: 30,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
          zIndex: 41,
        }}
      >
        {/* Symmetric left arrow, centred in the 24×24 box (x 6–18, y 6–18). */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
          <path d="M18 12 H6 M12 6 L6 12 L12 18" stroke="#d9d9d9" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Card — centered in the viewport, independent of the back button. */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 40,
          pointerEvents: "none",
        }}
      >
        <div
          className="wl-fade-in"
          style={{
            position: "relative",
            flexShrink: 0,
            width: 768,
            height: 499,
            transform: "scale(var(--section-scale))",
            pointerEvents: "auto",
            background: COLORS.bg,
            borderRadius: 20,
            overflow: "hidden",
            paddingLeft: 65,
            paddingRight: 40,
            paddingTop: 80,
            display: "flex",
            flexDirection: "column",
            gap: 30,
          }}
        >
        <p style={{ margin: 0, fontWeight: 400, fontSize: 32, lineHeight: 1.12, letterSpacing: "-0.64px", color: COLORS.text, whiteSpace: "nowrap" }}>
          You&rsquo;re on the <span className="brand-text-gradient">waitlist!</span>
        </p>
        <div style={{ fontWeight: 300, fontSize: 18, lineHeight: 1.5, letterSpacing: "-0.36px", color: COLORS.text }}>
          <p style={{ margin: 0 }}>You&rsquo;ve successfully taken the first step to SEO conversions.</p>
          <p style={{ margin: 0 }}>Check your inbox for an update from Tavyn.</p>
        </div>

        {/* Blog illustrations (tops intact — no mask so the negative-top overhang shows). */}
        <div style={{ position: "absolute", left: 126, top: 336, width: 685.332, height: 310.15 }}>
          <ThankYouBlog left={0} top={17} illus="/figma/ship-blog-illus-1.svg" title="Keyword Research: The Complete Guide for B2B SaaS" body="A step-by-step framework for finding, prioritizing, and targeting keywords that drive qualified B2B SaaS traffic." />
          <ThankYouBlog left={184} top={-28} illus="/figma/ship-blog-illus-2.svg" title="Keyword Research: The Complete Guide for B2B SaaS" body="A ready-to-use spreadsheet to organize, score, and prioritize keywords for your SaaS content strategy." />
          <ThankYouMockBlog />
        </div>

        {/* Overlay fades to the card background at the right and bottom (matches the Figma
            overlays) — painted on top so it dissolves the blogs without clipping them. */}
        <div style={{ position: "absolute", inset: 0, background: bgFadeGradient("to right", 55.769), pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: bgFadeGradient("to bottom", 55.769), pointerEvents: "none" }} />
        </div>
      </div>
    </>
  );
}

function ThankYouBlog({ left, top, illus, title, body }: { left: number; top: number; illus: string; title: string; body: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: 159.156,
        height: 160.176,
        background: "#0b0b0b",
        borderRadius: 20.405,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={illus} alt="" style={{ width: 159.156, height: 81.619, display: "block" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6.121, padding: "10.202px 20.405px 20.405px" }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 8.162, lineHeight: 1.12, letterSpacing: "-0.1632px", color: "#fff" }}>{title}</p>
        <p style={{ margin: 0, fontWeight: 200, fontSize: 6.121, lineHeight: 1.12, letterSpacing: "-0.1224px", color: "#5b5b5b" }}>{body}</p>
      </div>
    </div>
  );
}

function ThankYouMockBlog() {
  return (
    <div
      style={{
        position: "absolute",
        left: 366,
        top: -80,
        width: 319.332,
        height: 310.15,
        background: "#0b0b0b",
        borderRadius: 20.405,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: 10.202,
      }}
    >
      <div style={{ position: "relative", width: 319.332, height: 99.983, background: "rgba(152,145,119,0.05)", overflow: "hidden", flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/ship-mockblog-graphic.svg" alt="" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 97.789, height: 72.436 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6.121, padding: "0 20.405px" }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 8.162, lineHeight: 1.12, letterSpacing: "-0.1632px", color: "#fff" }}>How to do Keyword Research for SaaS Products</p>
        <p style={{ margin: 0, fontWeight: 200, fontSize: 6.121, lineHeight: 1.12, letterSpacing: "-0.1224px", color: "#5b5b5b" }}>A practical, step-by-step guide to finding the keywords your SaaS buyers are actually searching for.</p>
      </div>
      <div style={{ padding: "0 20.405px" }}>
        <p style={{ margin: 0, fontWeight: 400, fontSize: 6.121, lineHeight: 2.5, letterSpacing: "-0.1224px", color: "#fff" }}>
          Keyword research is often the first step in any SEO strategy, but for SaaS companies, it&rsquo;s easy to get it wrong. Generic keyword tools are built for broad consumer searches, not the specific, often technical language your buyers use when they&rsquo;re evaluating software solutions.
        </p>
      </div>
    </div>
  );
}
