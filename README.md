# ⬡ Career DNA — Skill Genome Visualizer

> Decode your career. Simulate your future. No login. No backend. Pure intelligence.

---

## 🧬 What Makes It Unique

| Feature | Career DNA | Typical Resume Tools |
|---|---|---|
| **Skill Genome Radar** | Animated live radar — YOU vs ROLE, toggleable layers | Static bar charts |
| **Career Trajectory Simulator** | 3 AI-simulated futures with 5-year growth curves | None |
| **DNA Background** | Live animated double-helix canvas art | Static UI |
| **Animated Score Gauge** | Arc gauge with gradient, glow tip, tick marks | Plain text % |
| **90-Day Genome Activation Plan** | Ranked by impact, phased by week | Generic advice |
| **Zero Backend** | All AI runs client-side via your API key | Requires account |
| **Export Report** | Structured plain-text export | PDF behind paywall |

---

## 🚀 Quick Start

### Option A — Open Directly (No Server Needed)

1. Unzip the project folder
2. Open `index.html` in any modern browser
3. Paste your resume + JD
4. Enter your Anthropic API key (`sk-ant-...`)
5. Click **Decode Career DNA**

> ✅ Works in Chrome, Firefox, Safari, Edge

### Option B — Demo Mode (No API Key)

Click **"Load demo analysis →"** below the button to see a full sample analysis instantly.

---

## 📁 Project Structure

```
career-dna/
├── index.html          # Main app shell
├── css/
│   └── style.css       # Full dark bioluminescent UI
├── js/
│   ├── dna-bg.js       # Animated double-helix background canvas
│   ├── radar.js        # Skill genome radar chart (animated)
│   ├── gauge.js        # Score arc gauge (animated)
│   ├── timeline.js     # 5-year trajectory chart
│   └── main.js         # App logic, API calls, rendering
└── README.md
```

**Zero dependencies. Zero npm. Zero build step.** Pure HTML/CSS/JS.

---

## 🔑 API Key — Free via Google AI Studio

Get yours FREE at **[aistudio.google.com](https://aistudio.google.com)** — no credit card needed.

1. Sign in with your Google account
2. Click **"Get API Key"** → **"Create API key"**
3. Copy the key (starts with `AIza...`)
4. Paste into the **"Google Gemini API Key"** field in the app

- Used **client-side only** — never sent to any server except Anthropic
- Never stored in localStorage or cookies
- Model: `gemini-2.0-flash` · Free tier: 1,500 requests/day

---

## 🎨 Design System

- **Aesthetic:** Dark Bioluminescent / Genomics Lab
- **Fonts:** Syne (display) + DM Mono (code/body) + Fraunces (italic accent)
- **Color:** Cyan `#63b3ed` · Teal `#4fd1c5` · Purple `#b794f4` · Amber `#f6ad55` · Red `#fc8181`
- **Motion:** Canvas animations, CSS transitions, staggered reveals

---

## 🧠 How the AI Works

The app sends a single structured prompt to Claude Sonnet 4 asking for:

1. **Match Score** (0–100) with summary
2. **8 Skill Categories** with your level vs role requirement
3. **6–8 Skill Gaps** with severity + actionable insight
4. **3 Career Trajectories** with 5-year data points
5. **90-Day Action Plan** split into 3 phases

The response is parsed as JSON and rendered entirely in the browser with canvas animations.

---

## 💡 Uniqueness Ideas (To Extend Further)

- **Genome Mutation Mode** — Let users drag radar points to simulate "what if I learned X"
- **Market Pulse Layer** — Overlay live job market demand (via web search MCP)
- **Peer Benchmarking** — Anonymous aggregated genome comparison (shared storage)
- **Interview Question Generator** — Generate gap-targeted questions based on analysis
- **LinkedIn Import** — Paste LinkedIn profile URL → auto-parse resume
- **Team DNA View** — Upload multiple resumes → team skill heatmap
- **Time Machine** — Predict genome evolution over time with spaced repetition

---

## 🛡️ Privacy

- No server, no database, no tracking
- Your resume and JD are sent only to Anthropic's API (per their privacy policy)
- Your API key is held in memory only for the session

---

Built with ❤️ using Claude Sonnet 4 · Canvas API · Pure Vanilla JS
