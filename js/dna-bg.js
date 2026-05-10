/* dna-bg.js — Animated double-helix particle background */
(function () {
  const canvas = document.getElementById('dna-bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], helixPoints = [];
  let raf;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildHelix();
  }

  function buildHelix() {
    helixPoints = [];
    const num = 60;
    for (let i = 0; i < num; i++) {
      const t = (i / num) * Math.PI * 8;
      const x = W * 0.5 + Math.cos(t) * 120;
      const y = (i / num) * H;
      helixPoints.push({ t, x, y, phase: Math.random() * Math.PI * 2 });

      // Opposite strand
      const x2 = W * 0.5 + Math.cos(t + Math.PI) * 120;
      helixPoints.push({ t: t + Math.PI, x: x2, y, phase: Math.random() * Math.PI * 2, opposite: true });
    }
  }

  // Particle pool
  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -Math.random() * 0.4 - 0.1;
      this.life = Math.random();
      this.maxLife = 0.5 + Math.random() * 0.5;
      this.size = 1 + Math.random() * 2;
      this.color = Math.random() > 0.5 ? '#63b3ed' : '#4fd1c5';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life += 0.003;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.6;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  let time = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    time += 0.008;

    // Draw helix strands
    const strand1 = [], strand2 = [];
    const count = 80;
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 10 + time;
      const y = (i / count) * H;
      const amplitude = 90 + 30 * Math.sin(y * 0.003);
      strand1.push({ x: W * 0.5 + Math.cos(t) * amplitude, y });
      strand2.push({ x: W * 0.5 + Math.cos(t + Math.PI) * amplitude, y });
    }

    // Draw strand 1
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(99,179,237,0.35)';
    ctx.lineWidth = 1.5;
    strand1.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // Draw strand 2
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(79,209,197,0.25)';
    ctx.lineWidth = 1.5;
    strand2.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // Draw rungs (connections between strands)
    for (let i = 0; i < count; i += 4) {
      const p1 = strand1[i], p2 = strand2[i];
      if (!p1 || !p2) continue;
      const alpha = 0.15 + 0.1 * Math.sin(i + time * 3);
      ctx.beginPath();
      ctx.strokeStyle = `rgba(183,148,244,${alpha})`;
      ctx.lineWidth = 1;
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Node dots
      ctx.beginPath();
      ctx.fillStyle = `rgba(99,179,237,${alpha * 2})`;
      ctx.arc(p1.x, p1.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = `rgba(79,209,197,${alpha * 2})`;
      ctx.arc(p2.x, p2.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Secondary ghost helix (right side)
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 6 - time * 0.7;
      const y = (i / count) * H;
      const x = W * 0.75 + Math.cos(t) * 50;
      if (i === 0) { ctx.beginPath(); ctx.moveTo(x, y); }
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(246,224,94,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Particles
    particles.forEach(p => { p.update(); p.draw(); });

    // Glow at center
    const grd = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, 300);
    grd.addColorStop(0, 'rgba(99,179,237,0.04)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    raf = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();

  // Loading DNA spinner
  const loadCanvas = document.getElementById('loading-dna');
  if (loadCanvas) {
    const lctx = loadCanvas.getContext('2d');
    let lt = 0;
    function drawLoadDNA() {
      lctx.clearRect(0, 0, 120, 120);
      lt += 0.05;
      const cx = 60, num = 12;
      for (let i = 0; i < num; i++) {
        const t = (i / num) * Math.PI * 4 + lt;
        const y = 10 + (i / num) * 100;
        const x1 = cx + Math.cos(t) * 30;
        const x2 = cx + Math.cos(t + Math.PI) * 30;
        const alpha = 0.5 + 0.5 * Math.sin(t);

        lctx.beginPath();
        lctx.fillStyle = `rgba(99,179,237,${alpha})`;
        lctx.arc(x1, y, 3, 0, Math.PI * 2);
        lctx.fill();

        lctx.beginPath();
        lctx.fillStyle = `rgba(79,209,197,${alpha})`;
        lctx.arc(x2, y, 3, 0, Math.PI * 2);
        lctx.fill();

        // Rung
        lctx.beginPath();
        lctx.strokeStyle = `rgba(183,148,244,${alpha * 0.4})`;
        lctx.lineWidth = 1;
        lctx.moveTo(x1, y);
        lctx.lineTo(x2, y);
        lctx.stroke();
      }
      requestAnimationFrame(drawLoadDNA);
    }
    drawLoadDNA();
  }
})();
