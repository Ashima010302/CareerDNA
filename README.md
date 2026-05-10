<div align="center">

```
   ██████╗ █████╗ ██████╗ ███████╗███████╗██████╗     ██████╗ ███╗   ██╗ █████╗
  ██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗    ██╔══██╗████╗  ██║██╔══██╗
  ██║     ███████║██████╔╝█████╗  █████╗  ██████╔╝    ██║  ██║██╔██╗ ██║███████║
  ██║     ██╔══██║██╔══██╗██╔══╝  ██╔══╝  ██╔══██╗    ██║  ██║██║╚██╗██║██╔══██║
  ╚██████╗██║  ██║██║  ██║███████╗███████╗██║  ██║    ██████╔╝██║ ╚████║██║  ██║
   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝
```

### ⬡ Skill Genome Visualizer

**Decode your career. Simulate your future. No login. No backend. Pure intelligence.**

---

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Canvas API](https://img.shields.io/badge/Canvas_API-FF6B35?style=for-the-badge&logo=html5&logoColor=white)

![License](https://img.shields.io/badge/License-MIT-4fd1c5?style=flat-square)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-63b3ed?style=flat-square)
![No Backend](https://img.shields.io/badge/Backend-None-b794f4?style=flat-square)
![Free to Use](https://img.shields.io/badge/Cost-Free-f6ad55?style=flat-square)

</div>

---

## ✦ What is Career DNA?

Career DNA is a **browser-based AI career intelligence tool** that analyzes your resume against a job description and visualizes the results as an animated **skill genome** — complete with radar charts, gap analysis, 3 career trajectory simulations, and a personalized 90-day action plan.

It runs entirely in your browser. No account. No server. No data stored anywhere. Just paste your documents, enter your free Gemini API key, and watch your career genome come alive.

---

## ✦ Live Demo

> **Try it instantly — no API key needed**
> Open the app and click **"Load demo analysis →"** to see the full experience with pre-loaded data.

---

## ✦ Feature Showcase

| Feature | Career DNA | Typical Resume Tools |
|---|---|---|
| 🧬 **Skill Genome Radar** | Animated radar — YOU vs ROLE, toggleable layers | Static bar charts |
| 🚀 **Career Trajectory Simulator** | 3 AI-simulated futures with 5-year growth curves | None |
| 🎯 **DNA Match Score** | Arc gauge with gradient fill, glow tip & tick marks | Plain text percentage |
| 🔬 **Skill Gap Analysis** | Severity-ranked gaps with specific actionable insights | Vague suggestions |
| 📅 **90-Day Activation Plan** | Impact-ranked, phased week-by-week action steps | Generic advice |
| 🌊 **Living Background** | Animated double-helix canvas art reacts to the page | Static UI |
| 🔒 **Zero Backend** | All AI runs client-side via your own API key | Requires account creation |
| 📄 **Export Report** | Structured plain-text download | PDF locked behind paywall |

---

## ✦ How It Works

```
  ┌─────────────┐     ┌─────────────────────┐     ┌──────────────────────┐
  │  Your        │     │                     │     │                      │
  │  Resume  ───┼────▶│   Google Gemini AI  │────▶│   Skill Genome       │
  │              │     │   (your API key,    │     │   Radar · Gap Map    │
  │  Job         │     │   runs in browser)  │     │   Trajectories ·     │
  │  Description ┼────▶│                     │     │   Action Plan        │
  └─────────────┘     └─────────────────────┘     └──────────────────────┘
         ▲                                                    │
         │              Your data never touches               │
         └──────────────── any server we own ────────────────┘
```

The app sends a **single structured prompt** to Gemini and parses the JSON response to render everything client-side with Canvas API animations.

What Gemini returns:
1. **Match Score** (0–100) with a plain-English summary
2. **8 Skill Categories** — your level vs. role requirement
3. **6–8 Skill Gaps** — severity-ranked with targeted advice
4. **3 Career Trajectories** — distinct paths with 5-year salary growth projections
5. **90-Day Action Plan** — phased, impact-ranked tasks

---

## ✦ Quick Start

### Option A — Open Directly (Recommended)

No server, no build step, no npm. It literally just opens.

```bash
# Clone the repo
git clone https://github.com/yourusername/career-dna.git

# Open in browser — that's it
open career-dna/index.html
```

Then:
1. Paste your **resume text** (or drop a PDF)
2. Paste the **job description** (or drop a PDF)
3. Enter your **free Gemini API key** (`AIza...`)
4. Click **Decode Career DNA** ✦

> ✅ Works in Chrome · Firefox · Safari · Edge

### Option B — Demo Mode (No API Key)

Click **"Load demo analysis →"** on the main screen to instantly see the full visualizer with sample data — no key required.

---

## ✦ Getting Your Free Gemini API Key

1. Go to **[aistudio.google.com](https://aistudio.google.com)**
2. Sign in with your Google account (free)
3. Click **Get API Key → Create API Key**
4. Copy the key — it starts with `AIza...`
5. Paste it into the **"Google Gemini API Key"** field in the app

```
Free tier limits:
  · Model used    →  gemini-2.5-flash
  · Requests/day  →  1,500 (more than enough)
  · Cost          →  $0.00
  · Card required →  No
```

> Your key is held **in memory only** for the session. It is never stored in localStorage, cookies, or sent to any server other than Google's API.

---

## ✦ Project Structure

```
career-dna/
│
├── index.html              ← App shell — all sections, layout, canvas containers
│
├── css/
│   └── style.css           ← Full dark bioluminescent UI, animations, responsive
│
├── js/
│   ├── dna-bg.js           ← Animated double-helix background (Canvas API)
│   ├── radar.js            ← Skill genome radar chart with eased animation
│   ├── gauge.js            ← Arc score gauge with gradient + glow tip
│   ├── timeline.js         ← 5-year career trajectory chart (bezier curves)
│   └── main.js             ← App logic · Gemini API · JSON parsing · rendering
│
└── README.md
```

**Zero dependencies · Zero npm · Zero build step**

---

## ✦ Design System

```
  Aesthetic   →   Dark Bioluminescent / Genomics Lab
  
  Typography  →   Syne 800         (hero titles)
                  Syne 600         (section headers)
                  DM Mono 400      (code, labels, metadata)
                  Fraunces Italic  (accent quotations)

  Palette     →   Cyan    #63b3ed   ← primary accent
                  Teal    #4fd1c5   ← "you" genome
                  Purple  #b794f4   ← trajectory B / rungs
                  Amber   #f6ad55   ← "role" genome / trajectory C
                  Red     #fc8181   ← critical gaps
                  Dark    #0d1421   ← background base

  Motion      →   Canvas RAF loops · CSS transitions · Staggered scroll reveals
                  Cubic + ease-in-out curves · Glow radial gradients
```

---

## ✦ Deployment

Career DNA is a static site — deploy anywhere for free in under 2 minutes.

### Netlify (Drag & Drop — Fastest)
1. Zip your project folder
2. Drag it onto [netlify.com/drop](https://netlify.com/drop)
3. Live instantly at `https://your-project.netlify.app`

### GitHub Pages
1. Push this repo to GitHub
2. Go to **Settings → Pages → Source → main / root**
3. Live at `https://yourusername.github.io/career-dna`

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Cloudflare Pages
Connect your GitHub repo at [pages.cloudflare.com](https://pages.cloudflare.com) — leave build command blank, output directory as `/`.

---

## ✦ Roadmap / Extension Ideas

These features would make Career DNA significantly more powerful:

- [ ] **Genome Mutation Mode** — drag radar points to simulate "what if I learned X?"
- [ ] **Market Pulse Layer** — overlay live job demand data via web search
- [ ] **Peer Benchmarking** — anonymous aggregated genome comparison
- [ ] **Interview Question Generator** — gap-targeted questions from analysis
- [ ] **LinkedIn Import** — paste profile URL → auto-parse as resume
- [ ] **Team DNA View** — upload multiple resumes → team skill heatmap
- [ ] **PDF Export** — export the full report as a designed PDF
- [ ] **Time Machine Mode** — spaced-repetition genome growth simulation

---

## ✦ Privacy & Security

```
  ✓  No account required
  ✓  No database — nothing is stored anywhere
  ✓  No analytics or tracking scripts
  ✓  Your resume & JD are sent only to Google's Gemini API
  ✓  Your API key lives in memory only — gone on page refresh
  ✓  All rendering happens locally in your browser
```

Google's data handling is governed by their [AI Studio privacy policy](https://policies.google.com/privacy).

---

## ✦ Browser Support

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 15+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Mobile Chrome / Safari | ✅ Responsive |

---

## ✦ Contributing

Contributions are welcome! If you have an idea for an extension or find a bug:

1. Fork the repo
2. Create a feature branch — `git checkout -b feature/genome-mutation`
3. Commit your changes — `git commit -m 'Add genome mutation mode'`
4. Push and open a Pull Request

Since this is vanilla JS with no build tooling, changes are easy to test — just refresh the browser.

---

## ✦ License

MIT License — free to use, modify, and distribute. See `LICENSE` for details.

---

<div align="center">

**Built with Google Gemini AI · Canvas API · Pure Vanilla JS**

*No frameworks were harmed in the making of this project.*

⬡

</div>
