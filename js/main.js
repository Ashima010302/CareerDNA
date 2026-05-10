/* main.js — Career DNA Core Application Logic */

// ══════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════
const GEMINI_MODEL = 'gemini-2.5-flash';

// ══════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════
const State = { resumeText:'', jdText:'', analysisResult:null };

// ══════════════════════════════════════════════
// DOM READY
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  setupFileDrops();
  setupCharCounts();
  syncTextareas();
  setupApiKeyToggle();
});

function syncTextareas() {
  document.getElementById('resume-text')?.addEventListener('input', e => State.resumeText = e.target.value);
  document.getElementById('jd-text')?.addEventListener('input',    e => State.jdText     = e.target.value);
}

// ══════════════════════════════════════════════
// API KEY — show/hide toggle + live validation
// ══════════════════════════════════════════════
function setupApiKeyToggle() {
  const input  = document.getElementById('api-key');
  const toggle = document.getElementById('api-key-toggle');
  const status = document.getElementById('api-key-status');
  if (!input) return;

  // Toggle visibility
  toggle?.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    toggle.innerHTML = isHidden ? EYE_CLOSED_SVG : EYE_OPEN_SVG;
  });

  // Live validation feedback
  input.addEventListener('input', () => {
    const val = input.value.trim();
    if (!status) return;
    if (!val) {
      status.textContent = '';
      status.className = 'api-key-status';
    } else if (val.startsWith('AIza') && val.length > 20) {
      status.textContent = '✓ Key looks valid';
      status.className = 'api-key-status valid';
    } else {
      status.textContent = '⚠ Gemini keys start with AIza...';
      status.className = 'api-key-status invalid';
    }
  });
}

const EYE_OPEN_SVG  = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" stroke-width="1.2"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/></svg>`;
const EYE_CLOSED_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M6.5 6.6A2 2 0 0010.4 9.5M4.2 4.3C2.5 5.4 1 8 1 8s2.5 5 7 5c1.4 0 2.6-.4 3.7-1M6 3.1C6.6 3 7.3 3 8 3c4.5 0 7 5 7 5s-.7 1.4-1.8 2.7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`;

// ══════════════════════════════════════════════
// PDF.js — lazy-loaded from CDN
// ══════════════════════════════════════════════
let _pdfJsLoaded = false;
function loadPdfJs() {
  return new Promise((resolve, reject) => {
    if (_pdfJsLoaded || window.pdfjsLib) {
      _pdfJsLoaded = true; return resolve();
    }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      _pdfJsLoaded = true;
      resolve();
    };
    s.onerror = () => reject(new Error('Could not load PDF reader. Please paste text manually.'));
    document.head.appendChild(s);
  });
}

async function extractPdfText(file) {
  await loadPdfJs();
  const buf  = await file.arrayBuffer();
  const pdf  = await window.pdfjsLib.getDocument({ data: buf }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(x => x.str).join(' ') + '\n';
  }
  return text.trim();
}

// ══════════════════════════════════════════════
// FILE DROP SETUP
// ══════════════════════════════════════════════
function setupFileDrops() {
  setupDrop('resume-drop', 'resume-file', 'resume-text', 'resume-count');
  setupDrop('jd-drop',     'jd-file',     'jd-text',     'jd-count');
}

function setupDrop(dropId, fileId, textareaId, countId) {
  const zone      = document.getElementById(dropId);
  const fileInput = document.getElementById(fileId);
  const textarea  = document.getElementById(textareaId);
  if (!zone || !textarea) return;

  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', ()  => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file, textarea, countId, zone);
  });
  fileInput?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) handleFile(file, textarea, countId, zone);
  });
}

async function handleFile(file, textarea, countId, zone) {
  const label = zone.querySelector('.drop-label');
  const orig  = label ? label.textContent : '';
  if (label) label.textContent = 'Reading file...';

  try {
    let text = '';
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      text = await extractPdfText(file);
      if (!text || text.length < 20)
        throw new Error('PDF appears to be image-based or scanned. Please copy-paste the text instead.');
    } else {
      text = await file.text();
    }

    textarea.value = text;
    textarea.dispatchEvent(new Event('input'));

    const ct = document.getElementById(countId);
    if (ct) ct.textContent = `${text.length} characters extracted from "${file.name}"`;
    if (label) label.textContent = `✓ ${file.name}`;
  } catch (err) {
    if (label) label.textContent = orig;
    showError(err.message || 'Failed to read file.');
  }
}

function setupCharCounts() {
  [['resume-text','resume-count'], ['jd-text','jd-count']].forEach(([taId, ctId]) => {
    const ta = document.getElementById(taId);
    const ct = document.getElementById(ctId);
    if (ta && ct) ta.addEventListener('input', () => ct.textContent = `${ta.value.length} characters`);
  });
}

// ══════════════════════════════════════════════
// MAIN ANALYSIS
// ══════════════════════════════════════════════
async function startAnalysis() {
  State.resumeText = document.getElementById('resume-text')?.value?.trim() || '';
  State.jdText     = document.getElementById('jd-text')?.value?.trim()     || '';
  const apiKey     = document.getElementById('api-key')?.value?.trim()     || '';

  if (!apiKey)                         return showError('Please enter your Gemini API key. Get one free at aistudio.google.com');
  if (!apiKey.startsWith('AIza'))      return showError('That doesn\'t look like a Gemini key — it should start with AIza...');
  if (!State.resumeText)               return showError('Please paste your resume text or upload a file.');
  if (!State.jdText)                   return showError('Please paste the job description or upload a file.');
  if (State.resumeText.length < 50)    return showError('Resume text seems too short. Please upload the full resume.');
  if (State.jdText.length < 30)        return showError('Job description is too short. Please add more detail.');

  showLoading(true);
  animateLoadingSteps();

  try {
    const result = await callGeminiAPI(State.resumeText, State.jdText);
    State.analysisResult = result;
    renderResults(result);
  } catch (err) {
    showLoading(false);
    showError('Analysis failed: ' + (err.message || 'Unknown error.'));
  }
}

// ══════════════════════════════════════════════
// GEMINI API CALL
// ══════════════════════════════════════════════
async function callGeminiAPI(resume, jd) {
  const apiKey = document.getElementById('api-key')?.value?.trim();
  if (!apiKey)
    throw new Error('Please enter your Gemini API key. Get one free at aistudio.google.com');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(resume, jd) }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text) throw new Error('Empty response from Gemini. Check your API key or quota.');

  return sanitizeData(parseAnalysis(text));
}

// ══════════════════════════════════════════════
// PROMPT
// ══════════════════════════════════════════════
function buildPrompt(resume, jd) {
  return `You are a Career DNA Analyzer. Analyze the resume and job description below.
Return ONLY raw valid JSON. No markdown. No backticks. No explanation. No trailing commas. No comments.

RESUME:
${resume.slice(0, 2500)}

JOB DESCRIPTION:
${jd.slice(0, 1800)}

Rules:
- Replace ALL example values with real analysis from the documents above
- All skill level numbers must be integers 0-100
- "severity" must be exactly one of: "critical", "moderate", "strong"
- "impact" must be exactly one of: "high", "medium", "low"
- Every string must be a complete meaningful sentence or phrase — no angle brackets, no placeholders
- Do not truncate — complete the entire JSON

Return this exact structure with real values:
{"matchScore":72,"matchSummary":"Write 2 real sentences here about fit between resume and JD.","skills":[{"label":"Technical Skills","you":70,"role":85},{"label":"Leadership","you":50,"role":80},{"label":"Communication","you":65,"role":75},{"label":"Problem Solving","you":75,"role":85},{"label":"Domain Knowledge","you":60,"role":90},{"label":"Tools & Tech","you":72,"role":80},{"label":"Soft Skills","you":68,"role":70},{"label":"Industry Exp.","you":55,"role":85}],"gaps":[{"skill":"Real skill from JD","yourLevel":40,"requiredLevel":85,"severity":"critical","insight":"Specific actionable advice."},{"skill":"Real skill from JD","yourLevel":50,"requiredLevel":82,"severity":"critical","insight":"Specific actionable advice."},{"skill":"Real skill from JD","yourLevel":60,"requiredLevel":80,"severity":"moderate","insight":"Specific actionable advice."},{"skill":"Real skill from JD","yourLevel":65,"requiredLevel":80,"severity":"moderate","insight":"Specific actionable advice."},{"skill":"Real skill from JD","yourLevel":70,"requiredLevel":78,"severity":"strong","insight":"Specific actionable advice."},{"skill":"Real skill from JD","yourLevel":72,"requiredLevel":78,"severity":"strong","insight":"Specific actionable advice."}],"trajectories":[{"id":"A","title":"Real Path Name","targetRole":"Real Job Title","timeToReady":"6-8 months","salaryGrowth":"+35%","description":"Two real sentences about this path.","skillsToFocus":["Real skill 1","Real skill 2","Real skill 3"],"points":[{"year":0,"value":1.0},{"year":1,"value":1.25},{"year":2,"value":1.5},{"year":3,"value":1.75},{"year":4,"value":2.05},{"year":5,"value":2.35}]},{"id":"B","title":"Real Path Name","targetRole":"Real Job Title","timeToReady":"12-15 months","salaryGrowth":"+55%","description":"Two real sentences about this path.","skillsToFocus":["Real skill 4","Real skill 5","Real skill 6"],"points":[{"year":0,"value":1.0},{"year":1,"value":1.1},{"year":2,"value":1.42},{"year":3,"value":1.8},{"year":4,"value":2.25},{"year":5,"value":2.85}]},{"id":"C","title":"Real Path Name","targetRole":"Real Job Title","timeToReady":"18-24 months","salaryGrowth":"+75%","description":"Two real sentences about this path.","skillsToFocus":["Real skill 7","Real skill 8","Real skill 9"],"points":[{"year":0,"value":1.0},{"year":1,"value":1.05},{"year":2,"value":1.28},{"year":3,"value":1.65},{"year":4,"value":2.15},{"year":5,"value":3.1}]}],"actionPlan":{"month1_30":[{"task":"Real specific action for days 1-30 based on gaps","impact":"high"},{"task":"Real specific action for days 1-30 based on gaps","impact":"high"},{"task":"Real specific action for days 1-30","impact":"medium"}],"month2_60":[{"task":"Real specific action for days 31-60","impact":"high"},{"task":"Real specific action for days 31-60","impact":"medium"},{"task":"Real specific action for days 31-60","impact":"medium"}],"month3_90":[{"task":"Real specific action for days 61-90","impact":"high"},{"task":"Real specific action for days 61-90","impact":"high"},{"task":"Real specific action for days 61-90","impact":"medium"}]}}`;
}

// ══════════════════════════════════════════════
// JSON PARSER — 5-layer robust recovery
// ══════════════════════════════════════════════
function parseAnalysis(text) {
  let clean = text.trim()
    .replace(/^\uFEFF/, '')
    .replace(/^```[\w]*\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // Layer 1: direct parse
  try { return JSON.parse(clean); } catch (_) {}

  // Layer 2: extract outermost {}
  const s = clean.indexOf('{'), e = clean.lastIndexOf('}');
  if (s === -1 || e <= s) throw new Error('No JSON found in response. Please try again.');
  const extracted = clean.slice(s, e + 1);

  // Layer 3: extracted as-is
  try { return JSON.parse(extracted); } catch (_) {}

  // Layer 4: common repairs
  const repaired = extracted
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":')
    .replace(/:\s*'([^']*)'/g, ':"$1"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');
  try { return JSON.parse(repaired); } catch (_) {}

  // Layer 5: close open brackets from truncation
  let partial = extracted.replace(/,\s*$/, '').replace(/:\s*$/, ':null');
  const openB = (partial.match(/\[/g)||[]).length - (partial.match(/\]/g)||[]).length;
  const openC = (partial.match(/\{/g)||[]).length - (partial.match(/\}/g)||[]).length;
  for (let i = 0; i < openB; i++) partial += ']';
  for (let i = 0; i < openC; i++) partial += '}';
  try { return JSON.parse(partial); } catch (_) {}

  throw new Error('Gemini returned malformed JSON. Please try again.');
}

// ══════════════════════════════════════════════
// SANITIZE — guarantee every field always has content
// ══════════════════════════════════════════════
function sanitizeData(d) {
  if (!d || typeof d !== 'object') d = {};

  // ── matchScore ──
  d.matchScore   = typeof d.matchScore === 'number' ? Math.min(100, Math.max(0, Math.round(d.matchScore))) : 65;
  d.matchSummary = (typeof d.matchSummary === 'string' && d.matchSummary.length > 10)
    ? d.matchSummary
    : 'Analysis complete. Your skill genome has been decoded — review your radar chart, gaps, and trajectory options below.';

  // ── skills (always 8) ──
  const defSkills = [
    { label:'Technical Skills', you:70, role:85 }, { label:'Leadership',      you:50, role:80 },
    { label:'Communication',    you:65, role:75 }, { label:'Problem Solving', you:75, role:85 },
    { label:'Domain Knowledge', you:60, role:90 }, { label:'Tools & Tech',    you:72, role:80 },
    { label:'Soft Skills',      you:68, role:70 }, { label:'Industry Exp.',   you:55, role:85 },
  ];
  if (!Array.isArray(d.skills) || d.skills.length === 0) {
    d.skills = defSkills;
  } else {
    d.skills = d.skills.slice(0, 8).map((s, i) => ({
      label: (typeof s.label === 'string' && s.label.length) ? s.label : defSkills[i]?.label || `Skill ${i+1}`,
      you:   typeof s.you  === 'number' ? Math.min(100, Math.max(0, s.you))  : 60,
      role:  typeof s.role === 'number' ? Math.min(100, Math.max(0, s.role)) : 80,
    }));
    while (d.skills.length < 8) d.skills.push(defSkills[d.skills.length]);
  }

  // ── gaps (always 4-6) ──
  const defGaps = [
    { skill:'Core Technical Skills',   yourLevel:40, requiredLevel:85, severity:'critical', insight:'Pursue hands-on projects and relevant certification to close this gap rapidly.' },
    { skill:'Leadership & Management', yourLevel:45, requiredLevel:80, severity:'critical', insight:'Volunteer to lead a team initiative at your current role to build leadership evidence.' },
    { skill:'Domain Knowledge',        yourLevel:55, requiredLevel:85, severity:'moderate', insight:'Read 2 industry reports monthly and pursue a domain-specific certification.' },
    { skill:'Communication Skills',    yourLevel:65, requiredLevel:80, severity:'moderate', insight:'Practice presenting technical ideas to non-technical stakeholders.' },
    { skill:'Tools & Technologies',    yourLevel:70, requiredLevel:82, severity:'strong',   insight:'Explore required tools through free online courses and a side project.' },
    { skill:'Strategic Thinking',      yourLevel:72, requiredLevel:78, severity:'strong',   insight:'Engage with business strategy discussions and read one business book per month.' },
  ];
  if (!Array.isArray(d.gaps) || d.gaps.length === 0) {
    d.gaps = defGaps;
  } else {
    d.gaps = d.gaps.map((g, i) => ({
      skill:         (typeof g.skill === 'string' && g.skill.length)   ? g.skill         : defGaps[i % defGaps.length].skill,
      yourLevel:     typeof g.yourLevel     === 'number' ? Math.min(100, Math.max(0, g.yourLevel))     : 50,
      requiredLevel: typeof g.requiredLevel === 'number' ? Math.min(100, Math.max(0, g.requiredLevel)) : 80,
      severity:      ['critical','moderate','strong'].includes(g.severity) ? g.severity : 'moderate',
      insight:       (typeof g.insight === 'string' && g.insight.length > 5) ? g.insight : defGaps[i % defGaps.length].insight,
    }));
    while (d.gaps.length < 4) d.gaps.push(defGaps[d.gaps.length % defGaps.length]);
  }

  // ── trajectories (always exactly 3) ──
  const defPoints = [
    [{year:0,value:1.0},{year:1,value:1.25},{year:2,value:1.5},{year:3,value:1.75},{year:4,value:2.05},{year:5,value:2.35}],
    [{year:0,value:1.0},{year:1,value:1.1},{year:2,value:1.42},{year:3,value:1.8},{year:4,value:2.25},{year:5,value:2.85}],
    [{year:0,value:1.0},{year:1,value:1.05},{year:2,value:1.28},{year:3,value:1.65},{year:4,value:2.15},{year:5,value:3.1}],
  ];
  const defTrajs = [
    { id:'A', title:'Fast Track Specialist', targetRole:'Senior Professional',    timeToReady:'6-8 months',   salaryGrowth:'+35%',
      description:'Leverage existing strengths and close the most critical gaps quickly. This path offers the fastest route to the target role with manageable risk.',
      skillsToFocus:['Core Technical Skills','Portfolio Projects','Certification'] },
    { id:'B', title:'Pivot & Grow',         targetRole:'Team Lead or Manager',    timeToReady:'12-15 months', salaryGrowth:'+55%',
      description:'Invest in leadership and cross-functional skills. A slightly slower start leads to a significantly higher ceiling at the management track.',
      skillsToFocus:['Leadership','Stakeholder Management','Strategic Planning'] },
    { id:'C', title:'Deep Domain Expert',   targetRole:'Principal or Staff Level',timeToReady:'18-24 months', salaryGrowth:'+75%',
      description:'Become the go-to authority in your domain. This path requires the most investment but opens the highest-paying and most impactful senior roles.',
      skillsToFocus:['Domain Mastery','Thought Leadership','Advanced Certification'] },
  ];

  if (!Array.isArray(d.trajectories) || d.trajectories.length === 0) {
    d.trajectories = defTrajs.map((t, i) => ({ ...t, points: defPoints[i] }));
  } else {
    d.trajectories = d.trajectories.slice(0, 3).map((t, i) => {
      const def = defTrajs[i];
      const pts = Array.isArray(t.points) && t.points.length >= 6
        ? t.points.slice(0, 6).map((p, yi) => ({
            year:  typeof p.year  === 'number' ? p.year  : yi,
            value: typeof p.value === 'number' && p.value > 0 ? p.value : defPoints[i][yi].value,
          }))
        : defPoints[i];
      return {
        id:           t.id           || def.id,
        title:        (typeof t.title       === 'string' && t.title.length > 2)       ? t.title       : def.title,
        targetRole:   (typeof t.targetRole  === 'string' && t.targetRole.length > 2)  ? t.targetRole  : def.targetRole,
        timeToReady:  (typeof t.timeToReady === 'string' && t.timeToReady.length > 1) ? t.timeToReady : def.timeToReady,
        salaryGrowth: (typeof t.salaryGrowth=== 'string' && t.salaryGrowth.length > 1)? t.salaryGrowth: def.salaryGrowth,
        description:  (typeof t.description === 'string' && t.description.length > 10)? t.description : def.description,
        skillsToFocus: Array.isArray(t.skillsToFocus) && t.skillsToFocus.length > 0
          ? t.skillsToFocus.filter(s => typeof s === 'string' && s.length > 0)
          : def.skillsToFocus,
        points: pts,
      };
    });
    while (d.trajectories.length < 3) {
      const i = d.trajectories.length;
      d.trajectories.push({ ...defTrajs[i], points: defPoints[i] });
    }
  }

  // ── actionPlan (always 3 columns, 3 items each) ──
  const defPlan = {
    month1_30: [
      { task:'Enroll in the top certification course addressing your most critical skill gap.', impact:'high' },
      { task:'Reach out to 3 professionals currently in your target role for 30-minute informational interviews.', impact:'high' },
      { task:'Rewrite your resume to quantify achievements and align keywords with the job description.', impact:'medium' },
    ],
    month2_60: [
      { task:'Complete a hands-on project that directly demonstrates your most critical missing skill.', impact:'high' },
      { task:'Attend 2 industry events, webinars, or meetups to expand your professional network.', impact:'medium' },
      { task:'Begin a weekly learning habit — document progress in a public GitHub repo or blog.', impact:'medium' },
    ],
    month3_90: [
      { task:'Apply to 10 targeted roles using your updated, gap-addressed resume and cover letter.', impact:'high' },
      { task:'Schedule 2 mock interviews with peers or a career coach to sharpen your pitch.', impact:'high' },
      { task:'Publish a project, article, or case study showcasing your newly developed skills online.', impact:'medium' },
    ],
  };

  if (!d.actionPlan || typeof d.actionPlan !== 'object') {
    d.actionPlan = defPlan;
  } else {
    ['month1_30','month2_60','month3_90'].forEach(key => {
      if (!Array.isArray(d.actionPlan[key]) || d.actionPlan[key].length === 0) {
        d.actionPlan[key] = defPlan[key];
      } else {
        d.actionPlan[key] = d.actionPlan[key].map((item, ii) => ({
          task:   (typeof item.task === 'string' && item.task.length > 5) ? item.task : defPlan[key][ii % 3]?.task || 'Complete a targeted learning activity this period.',
          impact: ['high','medium','low'].includes(item.impact) ? item.impact : 'medium',
        }));
        while (d.actionPlan[key].length < 3) {
          d.actionPlan[key].push(defPlan[key][d.actionPlan[key].length % 3]);
        }
      }
    });
  }

  return d;
}

// ══════════════════════════════════════════════
// RENDER RESULTS
// ══════════════════════════════════════════════
function renderResults(data) {
  showLoading(false);

  const resultsSection = document.getElementById('results');
  resultsSection.classList.remove('hidden');
  setTimeout(() => resultsSection.scrollIntoView({ behavior:'smooth', block:'start' }), 100);

  // Score gauge
  ScoreGauge.init('score-gauge');
  ScoreGauge.setScore(data.matchScore);
  const sumEl = document.getElementById('match-summary');
  if (sumEl) sumEl.textContent = data.matchSummary;

  // Radar
  RadarChart.init('radar-canvas');
  RadarChart.setData(data.skills);

  // Sections
  renderGaps(data.gaps);
  renderTrajectories(data.trajectories);

  // Timeline
  TimelineChart.init('timeline-canvas');
  TimelineChart.setData(data.trajectories.map((t, i) => ({
    label:  t.title,
    points: t.points,
    color:  ['#4fd1c5','#b794f4','#f6ad55'][i],
  })));

  renderActionPlan(data.actionPlan);
}

// ──────────── GAPS ────────────
function renderGaps(gaps) {
  const grid = document.getElementById('gap-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const colorMap = { critical:'#fc8181', moderate:'#f6ad55', strong:'#4fd1c5' };

  gaps.forEach(gap => {
    const sev   = gap.severity || 'moderate';
    const color = colorMap[sev] || colorMap.moderate;
    const card  = document.createElement('div');
    card.className = 'gap-card';
    card.innerHTML = `
      <div class="gap-card-top">
        <div class="gap-skill">${escHtml(gap.skill)}</div>
        <div class="gap-badge ${sev}">${sev}</div>
      </div>
      <div class="gap-bar-track">
        <div class="gap-bar-fill" style="width:0%;background:${color};transition:width 1s ease"></div>
      </div>
      <div class="gap-meta">
        <span>You: ${gap.yourLevel}%</span>
        <span>Required: ${gap.requiredLevel}%</span>
      </div>
      <p style="font-size:12px;color:#94a3b8;margin-top:10px;line-height:1.5">${escHtml(gap.insight)}</p>
    `;
    grid.appendChild(card);
    requestAnimationFrame(() => setTimeout(() => {
      const bar = card.querySelector('.gap-bar-fill');
      if (bar) bar.style.width = gap.yourLevel + '%';
    }, 150));
  });
}

// ──────────── TRAJECTORIES ────────────
function renderTrajectories(trajectories) {
  const grid = document.getElementById('traj-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const COLORS = ['#4fd1c5','#b794f4','#f6ad55'];

  trajectories.forEach((traj, i) => {
    const color = COLORS[i] || COLORS[0];
    const card  = document.createElement('div');
    card.className = 'traj-card' + (i === 0 ? ' selected' : '');
    card.style.setProperty('--traj-color', color);

    const skillTags = traj.skillsToFocus.map(s => `<span class="traj-skill-tag">${escHtml(s)}</span>`).join('');

    card.innerHTML = `
      <div class="traj-num">Path ${traj.id}</div>
      <div class="traj-title" style="color:${color}">${escHtml(traj.title)}</div>
      <div class="traj-role">→ ${escHtml(traj.targetRole)}</div>
      <div class="traj-stats">
        <div class="traj-stat">
          <div class="traj-stat-val" style="color:${color}">${escHtml(traj.timeToReady)}</div>
          <div class="traj-stat-key">Time to Ready</div>
        </div>
        <div class="traj-stat">
          <div class="traj-stat-val" style="color:${color}">${escHtml(traj.salaryGrowth)}</div>
          <div class="traj-stat-key">Salary Growth</div>
        </div>
      </div>
      <p style="font-size:13px;color:#94a3b8;margin-bottom:14px;line-height:1.6">${escHtml(traj.description)}</p>
      <div class="traj-skills">${skillTags}</div>
    `;
    card.addEventListener('click', () => {
      document.querySelectorAll('.traj-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
    grid.appendChild(card);
  });
}

// ──────────── ACTION PLAN ────────────
function renderActionPlan(plan) {
  const grid = document.getElementById('action-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const cols = [
    { key:'month1_30', label:'Days 1–30',  color:'#4fd1c5' },
    { key:'month2_60', label:'Days 31–60', color:'#b794f4' },
    { key:'month3_90', label:'Days 61–90', color:'#f6ad55' },
  ];
  const dotColors = { high:'#4fd1c5', medium:'#f6ad55', low:'#94a3b8' };

  cols.forEach(col => {
    const items = plan[col.key] || [];
    const colEl = document.createElement('div');
    colEl.className = 'action-col';
    colEl.innerHTML = `<div class="action-col-title" style="color:${col.color}">${col.label}</div>`;

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'action-item';
      div.innerHTML = `
        <div class="action-dot" style="background:${dotColors[item.impact]||dotColors.medium}"></div>
        <div class="action-text">${escHtml(item.task)}</div>
      `;
      colEl.appendChild(div);
    });
    grid.appendChild(colEl);
  });
}

// ══════════════════════════════════════════════
// RADAR TAB SWITCH
// ══════════════════════════════════════════════
function switchRadar(mode, btn) {
  document.querySelectorAll('.viz-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  RadarChart.setMode(mode);
}

// ══════════════════════════════════════════════
// LOADING UI
// ══════════════════════════════════════════════
function showLoading(show) {
  const overlay = document.getElementById('loading-overlay');
  const btn     = document.getElementById('analyze-btn');
  if (!overlay) return;

  if (show) {
    overlay.style.display = 'flex';
    document.querySelectorAll('.load-step').forEach(s => s.classList.remove('active','done'));
    if (btn) {
      btn.disabled = true;
      btn.querySelector('.btn-text').style.display = 'none';
      btn.querySelector('.btn-loader').style.display = 'flex';
    }
  } else {
    overlay.style.display = 'none';
    if (btn) {
      btn.disabled = false;
      btn.querySelector('.btn-text').style.display = '';
      btn.querySelector('.btn-loader').style.display = 'none';
    }
  }
}

function animateLoadingSteps() {
  const steps    = document.querySelectorAll('.load-step');
  const statuses = [
    'Parsing your documents...','Extracting skill markers...',
    'Computing genome alignment...','Simulating trajectories...','Generating your report...',
  ];
  let current = 0;
  const iv = setInterval(() => {
    if (current > 0 && steps[current-1]) {
      steps[current-1].classList.remove('active');
      steps[current-1].classList.add('done');
    }
    if (current < steps.length) {
      steps[current]?.classList.add('active');
      const el = document.getElementById('loading-status');
      if (el) el.textContent = statuses[current] || 'Processing...';
      current++;
    } else {
      clearInterval(iv);
    }
  }, 1400);
  return iv;
}

// ══════════════════════════════════════════════
// DEMO DATA
// ══════════════════════════════════════════════
function loadDemo() {
  const demo = {
    matchScore: 72,
    matchSummary: "Your profile shows strong technical foundations with notable gaps in cloud architecture and team leadership — precisely what this senior role demands. With targeted upskilling over 6-9 months, you'd be a compelling candidate.",
    skills: [
      { label:'Technical Skills', you:78, role:92 }, { label:'Leadership',      you:45, role:80 },
      { label:'Communication',    you:70, role:75 }, { label:'Problem Solving', you:82, role:88 },
      { label:'Domain Knowledge', you:65, role:90 }, { label:'Tools & Tech',    you:80, role:85 },
      { label:'Soft Skills',      you:72, role:70 }, { label:'Industry Exp.',   you:55, role:85 },
    ],
    gaps: [
      { skill:'Cloud Architecture',  yourLevel:35, requiredLevel:85, severity:'critical', insight:'Take AWS Solutions Architect course — 3 months to certification.' },
      { skill:'Team Leadership',     yourLevel:45, requiredLevel:80, severity:'critical', insight:'Lead a cross-functional project at your current role to build this immediately.' },
      { skill:'System Design',       yourLevel:60, requiredLevel:88, severity:'moderate', insight:'Practice system design interviews and study distributed systems patterns.' },
      { skill:'Domain Expertise',    yourLevel:65, requiredLevel:90, severity:'moderate', insight:'Read 2 industry reports monthly and contribute to open source in this domain.' },
      { skill:'Data Analysis',       yourLevel:70, requiredLevel:80, severity:'strong',   insight:'Add SQL and Python analytics to your portfolio with 2 personal projects.' },
      { skill:'Stakeholder Mgmt',    yourLevel:72, requiredLevel:78, severity:'strong',   insight:"You're close — document and quantify your existing stakeholder work." },
    ],
    trajectories: [
      { id:'A', title:'Fast Track Specialist', targetRole:'Senior Software Engineer', timeToReady:'6–8 months', salaryGrowth:'+32%',
        description:'Double down on your existing technical strengths while patching the cloud gap. Fastest path to the target role with lower risk.',
        skillsToFocus:['AWS Certification','System Design','Technical Writing'],
        points:[{year:0,value:1.0},{year:1,value:1.28},{year:2,value:1.52},{year:3,value:1.78},{year:4,value:2.05},{year:5,value:2.30}] },
      { id:'B', title:'Pivot to Leadership', targetRole:'Engineering Team Lead', timeToReady:'12–15 months', salaryGrowth:'+58%',
        description:'Invest heavily in leadership and communication. Slightly slower start but dramatically higher ceiling — management track opens at year 2.',
        skillsToFocus:['Team Leadership','Stakeholder Mgmt','Agile/Scrum'],
        points:[{year:0,value:1.0},{year:1,value:1.1},{year:2,value:1.42},{year:3,value:1.80},{year:4,value:2.28},{year:5,value:2.90}] },
      { id:'C', title:'Deep Domain Expert', targetRole:'Principal / Staff Engineer', timeToReady:'18–24 months', salaryGrowth:'+85%',
        description:'Become the undisputed domain authority. Combines technical depth with strategic thinking — highest risk, highest reward trajectory.',
        skillsToFocus:['Cloud Architecture','Domain Knowledge','System Design'],
        points:[{year:0,value:1.0},{year:1,value:1.05},{year:2,value:1.25},{year:3,value:1.60},{year:4,value:2.15},{year:5,value:3.20}] },
    ],
    actionPlan: {
      month1_30: [
        { task:'Enroll in AWS Cloud Practitioner course on A Cloud Guru', impact:'high' },
        { task:'Schedule weekly 1:1s with a mentor in a leadership role', impact:'high' },
        { task:'Publish your first technical blog post on system design', impact:'medium' },
      ],
      month2_60: [
        { task:'Complete 2 system design mock interviews on Pramp or IGotAnOffer', impact:'high' },
        { task:'Volunteer to lead the next sprint retrospective at your team', impact:'high' },
        { task:'Contribute to an open-source project in the target domain', impact:'medium' },
      ],
      month3_90: [
        { task:'Sit AWS Solutions Architect Associate exam', impact:'high' },
        { task:'Present a technical proposal to senior stakeholders at work', impact:'high' },
        { task:'Apply to 5 target roles with updated, gap-addressed resume', impact:'high' },
      ],
    },
  };
  State.analysisResult = sanitizeData(demo);
  renderResults(State.analysisResult);
}

// ══════════════════════════════════════════════
// EXPORT REPORT
// ══════════════════════════════════════════════
function exportReport() {
  const data = State.analysisResult;
  if (!data) return;
  const lines = [
    'CAREER DNA ANALYSIS REPORT', 'Generated: ' + new Date().toLocaleDateString(),
    '═'.repeat(50), '',
    `MATCH SCORE: ${data.matchScore}%`, data.matchSummary, '',
    'SKILL GENOME:',
    ...data.skills.map(s => `  ${s.label.padEnd(22)} You: ${String(s.you).padStart(3)}%  Role: ${s.role}%`),
    '', 'SKILL GAPS:',
    ...data.gaps.flatMap(g => [
      `  [${g.severity.toUpperCase()}] ${g.skill}: ${g.yourLevel}% → ${g.requiredLevel}%`,
      `    → ${g.insight}`,
    ]),
    '', 'CAREER TRAJECTORIES:',
    ...data.trajectories.flatMap(t => [
      `  Path ${t.id}: ${t.title}`,
      `    Role: ${t.targetRole}  |  Ready In: ${t.timeToReady}  |  Growth: ${t.salaryGrowth}`,
      `    ${t.description}`,
      `    Skills: ${t.skillsToFocus.join(', ')}`,
    ]),
    '', '90-DAY ACTION PLAN:',
    ...(['month1_30','month2_60','month3_90']).flatMap((k, i) => [
      `  ${['Days 1-30','Days 31-60','Days 61-90'][i]}:`,
      ...data.actionPlan[k].map(item => `    [${item.impact.toUpperCase()}] ${item.task}`),
    ]),
  ];
  const blob = new Blob([lines.join('\n')], { type:'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'career-dna-report.txt'; a.click();
  URL.revokeObjectURL(url);
}

// ══════════════════════════════════════════════
// RESET
// ══════════════════════════════════════════════
function resetTool() {
  document.getElementById('results')?.classList.add('hidden');
  ['resume-text','jd-text'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('resume-count').textContent = '0 characters';
  document.getElementById('jd-count').textContent     = '0 characters';
  State.resumeText = ''; State.jdText = ''; State.analysisResult = null;
  window.scrollTo({ top:0, behavior:'smooth' });
  setTimeout(() => document.getElementById('upload')?.scrollIntoView({ behavior:'smooth' }), 300);
}

// ══════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════
function showError(msg) {
  document.getElementById('error-toast')?.remove();
  const t = document.createElement('div');
  t.id = 'error-toast';
  t.style.cssText = `position:fixed;bottom:32px;left:50%;transform:translateX(-50%);
    background:#fc8181;color:#1a0000;padding:14px 28px;border-radius:12px;
    font-family:Syne,sans-serif;font-weight:700;font-size:14px;
    z-index:9999;box-shadow:0 8px 32px rgba(252,129,129,0.3);max-width:90vw;text-align:center;`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 7000);
}

function escHtml(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
