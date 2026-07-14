# Tavyn — Landing Page

Marketing site for Tavyn (email-first blog ops for founder-led SaaS teams). Built with the
**Next.js App Router**. This README is written so a new engineer — or an AI assistant — can
get oriented fast and know exactly where to plug in a backend.

---

## Tech stack

| | |
|---|---|
| Framework | **Next.js 15** (App Router, React Server + Client Components) |
| Language | **TypeScript** |
| UI | **React 19 (RC)** |
| Styling | Mostly **inline styles** driven by shared design tokens; **Tailwind 3.4** is installed and configured but used sparingly |
| Font | **Inter** via `next/font/google` |
| Assets | Static SVGs in `public/figma/` |

There is **no backend yet** — see [Wiring up a backend](#wiring-up-a-backend).

---

## Getting started

```bash
npm install
npm run dev      # dev server at http://localhost:3000
```

Scripts:

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint (next lint)
```

Node 18+ recommended.

---

## Routes

| Path | File | What it is |
|---|---|---|
| `/` | `src/app/page.tsx` | Landing page (hero + 5 workflow sections + execution gap + CTA + footer) |
| `/waitlist` | `src/app/waitlist/page.tsx` | Waitlist **form** → animated **thank-you** view. **This is the main backend hook.** |
| `/faq` | `src/app/faq/page.tsx` | FAQ accordion |
| `/privacy` | `src/app/privacy/page.tsx` | Privacy Policy |
| `/terms` | `src/app/terms/page.tsx` | Terms of Service |
| `/security` | `src/app/security/page.tsx` | Security |

Every "Join Waitlist" button (nav, hero, final CTA) links to `/waitlist`. "Contact" in the
footer is a `mailto:` link.

---

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx          # Root layout: Inter font, sets --section-scale before first paint
│  ├─ globals.css         # Global CSS + keyframes (animations, autofill, gradient text)
│  ├─ page.tsx            # Landing page (composes the sections below)
│  ├─ waitlist/page.tsx   # Waitlist form + thank-you  ← backend hook
│  ├─ faq/page.tsx
│  ├─ privacy/page.tsx    # (privacy/terms/security all render <LegalPage/>)
│  ├─ terms/page.tsx
│  └─ security/page.tsx
├─ components/
│  ├─ tokens.ts           # ★ Design tokens: colors, gradients, dimensions, faderMask(), bgFadeGradient()
│  ├─ Section.tsx         # Wraps a section and scales it to the viewport (see Design system)
│  ├─ Nav.tsx             # Fixed top nav + the two "Join Waitlist" button variants
│  ├─ Footer.tsx          # Footer with FAQ/legal/contact links
│  ├─ LegalPage.tsx       # Shared layout for privacy/terms/security
│  ├─ StepCaption.tsx     # "More →" caption at the bottom of each step section
│  ├─ StickyWorkflowHeader.tsx  # The "One agent. Five steps." header that pins on scroll
│  └─ sections/           # One file per landing-page section:
│     ├─ Hero.tsx         #   headline + inline email field + dashboard mockup
│     ├─ Learn.tsx  Target.tsx  Plan.tsx  Create.tsx  Ship.tsx   # the 5 workflow steps
│     ├─ ExecutionGap.tsx #   "Close the execution gap" feature cards
│     └─ Cta.tsx          #   final call-to-action (typewriter headline)
public/figma/             # SVG illustration assets used by the sections
```

---

## Design system (read this before editing the landing page)

The landing page and the waitlist page are **designed at a fixed 1440×780 "design canvas"**
and scaled to fit the viewport height. Understanding this is essential before moving things.

- Every landing section is wrapped in **`<Section>`** (`src/components/Section.tsx`), which
  renders a `1440×780` stage and applies `transform: scale(var(--section-scale))`.
- **`--section-scale` = `window.innerHeight / 780`.** It is set _before first paint_ by an
  inline script in `layout.tsx` (to avoid a scale flash), and updated on resize.
- **So all coordinates/sizes inside sections are in "design pixels"** (e.g. `top: 192`,
  `fontSize: 48`) — they are automatically scaled. Do not use `vw`/`vh`/`%` for section
  layout; use design px positioned absolutely, matching Figma.
- **Document pages are the exception.** `/faq`, `/privacy`, `/terms`, `/security` and the
  `Footer` are **normal scrollable pages** (NOT scaled) — they use ordinary responsive px.

**Tokens (`src/components/tokens.ts`) — always prefer these over hardcoded values:**

- `COLORS` — `bg #050506`, `card #080809`, `text #f7f8f8`, `textMuted #8a8f98`, etc.
- `BRAND_GRADIENT` / `BRAND_TEXT_GRADIENT` — the yellow→orange→red brand gradient.
  In JSX, apply gradient text with `className="brand-text-gradient"`.
- `faderMask({ top, bottom, left, right })` — returns a CSS mask that fades an element's
  edges to transparent (used to dissolve illustrations into the background).
- `bgFadeGradient(dir, hold)` — an overlay gradient that fades to the page background (used
  where a mask would clip a drop shadow, e.g. the hero dashboard).
- `DESIGN_W = 1440`, `DESIGN_H = 780`, `CTA_DESIGN_H = 537`.

Components reference their source **Figma node IDs** in comments (e.g. `Figma 300:596`) so
you can cross-check the design.

---

## Wiring up a backend

There is currently **no data submission and no API** — form submits only trigger UI
animation. Here is exactly where to connect things.

### 1. Waitlist form (primary integration point)

**File:** `src/app/waitlist/page.tsx`

The form collects these fields in React state:

```ts
first: string        // First Name
last: string         // Last Name
email: string        // Enter email
industry: string|null // Industry dropdown (see INDUSTRIES list in the file)
agreed: boolean      // "I agree to receive emails…" checkbox
```

`valid` is true only when all of the above are filled (and the email matches a basic regex).
The submit handler is **`onJoin`** (~line 101). Today it just starts the gradient animation:

```ts
const onJoin = (e) => {
  if (!valid || mode !== "form") return;
  // ...captures button position, then:
  setMode("fill");   // ← play the fill → dim → thanks animation
};
```

**To connect a backend**, POST the fields here before/while the animation plays. Recommended
approach — add a Next.js **Route Handler** at `src/app/api/waitlist/route.ts`:

```ts
// src/app/api/waitlist/route.ts
export async function POST(req: Request) {
  const data = await req.json(); // { first, last, email, industry }
  // TODO: persist (DB), add to email provider (Resend/Mailchimp/etc.), etc.
  return Response.json({ ok: true });
}
```

…and call it in `onJoin`:

```ts
const onJoin = (e) => {
  if (!valid || mode !== "form") return;
  // capture origin (existing code) ...
  setMode("fill");
  fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ first, last, email, industry }),
  }).catch(() => { /* TODO: surface an error state */ });
};
```

The animation (`fill → dim → thanks`) is decoupled from the request, so you can keep the nice
UX and add real submission + error handling independently.

### 2. Hero inline email field

**File:** `src/components/sections/Hero.tsx`

The hero has an `<input className="hero-email">` and a **Join Waitlist** button that currently
just links to `/waitlist` (the typed email is not captured). Options:
- Carry the email to the form: link to `/waitlist?email=...` and prefill `email` state there, or
- Submit directly from the hero to `/api/waitlist`.

### 3. Other CTAs & contact

- All "Join Waitlist" buttons are in `src/components/Nav.tsx` (`WaitlistButton`,
  `HeroWaitlistButton`) and link to `/waitlist`.
- Footer "Contact" is `mailto:nishchay@tavyn.dev` in `src/components/Footer.tsx` — change the
  address there.

### 4. Environment variables

None are used yet. Add secrets (DB URL, email API keys, etc.) to `.env.local`
(already gitignored). Access server-side keys only inside Route Handlers / server code.

---

## Updating / adding to the landing page

- **Edit an existing section:** open the matching file in `src/components/sections/`. Keep
  values in design px and pull colors/gradients from `tokens.ts`.
- **Add a new landing section:** create a component, wrap it in `<Section>` inside
  `src/app/page.tsx`. (Note: the landing page has a scroll-pinned "workflow header" and a
  step counter tied to the 5 middle sections — see `src/app/page.tsx` if you add/remove
  sections in that group.)
- **Add a new document page** (like FAQ/legal): make a normal responsive page — do NOT wrap
  it in `<Section>`. Reuse `LegalPage.tsx` for policy-style pages, and include `<Footer/>`.

---

## Notes / gotchas

- **`npm run build` / `tsc` shows ~4 type warnings in `src/components/sections/Ship.tsx`**
  about `RefObject<T | null>`. These are a known mismatch between React 19 RC and
  `@types/react` v18 and are harmless — the app builds and runs. (Fixable later by aligning
  `@types/react` to v19.)
- `--section-scale` scales by **viewport height**, so sections are sized to fit vertically;
  on very wide/narrow windows the 1440-wide canvas is centered with background gutters.
- Images are plain `<img>` tags (not `next/image`) to keep the pixel-exact Figma layout.

---

Live repo layout is stable; the biggest single thing to know is the **1440×780 design-px +
`--section-scale`** convention and that the **waitlist `onJoin` handler** is where real
submission belongs.
