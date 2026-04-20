
## AlloCare — Hero Section

A full-screen, conversion-focused hero that establishes AlloCare's core promise: paper survey → matched volunteer in 60 seconds.

### Layout
- **Desktop**: 50/50 split — copy left, animated mockup right
- **Mobile**: Stacked — copy on top, mockup below
- Full viewport height, with gentle blue→white vertical gradient background

### Left side — Copy & CTAs
- Eyebrow chip: "AI-Powered Volunteer Coordination"
- Headline (64px / clamp for mobile, bold, tight tracking): **"From Paper Survey to Matched Volunteer in 60 Seconds"**
- Subtext (20px, muted): "AlloCare transforms scattered NGO field reports into ranked urgency signals and instantly deploys the right volunteers — closing the loop from problem to action."
- Two CTAs:
  - Primary: **"Watch Live Demo"** — blue gradient (#1A56DB → deeper indigo), soft hover lift + shadow
  - Secondary: **"View Research"** — outline button with subtle hover fill
- Trust row below CTAs: "Built for Google Solution Challenge 2026" + small SDG icons (1, 10, 17)

### Right side — Animated Mumbai Heatmap Mockup
A stylized browser window (chrome with traffic-light dots + URL "allocare.app/dashboard") containing:
- **Map background**: Light Google Maps-style canvas with subtle road grid, labeled neighborhoods (Dharavi, Kurla, Bandra, Andheri, Worli)
- **Heatmap clusters**:
  - 3 red/critical clusters (Dharavi, Kurla, Govandi) with pulsing radial glow every 2s
  - 1 amber cluster (Bandra East)
  - Diffuse green wash across low-urgency zones
- **Floating need cards** that fade in/out on a 4s loop:
  - "🔴 47 families affected — Food shortage, Dharavi"
  - "🟠 Water contamination — Kurla West, 12 households"
  - "✅ Matched: Priya S. → en route (2.3 km)"
- **Live ticker strip** at bottom of mockup: "Urgency score: 92/100 · Top match found in 8s"

### Floating brand badges (around the mockup)
Small pill badges with subtle shadow, gently floating (y-axis bobbing animation):
- "✨ Gemini AI Powered"
- "🗺 Google Maps Platform"
- "🎯 SDG 17 Aligned"

### Visual System
- Palette: #1A56DB (primary blue), #0E9F6E (success green), #E02424 (critical red), #E3A008 (amber), neutral slate text
- Typography: Inter or system sans, tight headline tracking, generous line-height on subtext
- Surfaces: White cards with soft shadows, 12–16px radius, 1px subtle borders
- Background: gradient from #EEF4FF → white, faint dotted grid overlay for texture

### Animation (Framer Motion)
- Copy column: staggered fade-up on mount (eyebrow → headline → subtext → CTAs)
- Mockup: scale-in + fade on mount
- Heatmap clusters: infinite pulse (scale + opacity) on 2s loop, staggered offsets
- Floating cards: AnimatePresence cycle (fade + slight y translate) every ~4s
- Badges: gentle float (y: ±6px, 3–4s ease-in-out infinite)
- CTA hover: lift (-2px) + shadow expansion

### Technical Notes
- Replace placeholder `src/routes/index.tsx` with the new hero
- New component: `src/components/Hero.tsx` (heatmap mockup as SVG + absolutely-positioned animated divs — no external map dependency needed for the mockup)
- Add `framer-motion` dependency
- Update root `<title>` and meta to AlloCare branding
- Fully responsive: 50/50 grid on `lg+`, stacked on mobile with mockup compressed but still animated
