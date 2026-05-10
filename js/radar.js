/* radar.js — Animated skill genome radar chart */
(function () {
  window.RadarChart = {
    canvas: null,
    ctx: null,
    data: null,
    mode: 'both',
    animProgress: 0,
    animRaf: null,

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    },

    resizeCanvas() {
      if (!this.canvas) return;
      const parent = this.canvas.parentElement;
      const maxW = Math.min(parent.offsetWidth - 40, 560);
      this.canvas.width = maxW;
      this.canvas.height = Math.round(maxW * 0.82);
      if (this.data) this.render();
    },

    setData(skills) {
      // skills: [{ label, you, role }]
      this.data = skills;
      this.animProgress = 0;
      this.animate();
    },

    setMode(mode) {
      this.mode = mode;
      if (this.data) this.animate();
    },

    animate() {
      if (this.animRaf) cancelAnimationFrame(this.animRaf);
      this.animProgress = 0;
      const step = () => {
        this.animProgress = Math.min(1, this.animProgress + 0.025);
        this.render();
        if (this.animProgress < 1) this.animRaf = requestAnimationFrame(step);
      };
      step();
    },

    render() {
      if (!this.ctx || !this.data) return;
      const { ctx, canvas, data, mode, animProgress } = this;
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) * 0.38;
      const N = data.length;
      const levels = 5;

      ctx.clearRect(0, 0, W, H);

      // ── Grid rings ──
      for (let lv = 1; lv <= levels; lv++) {
        const r = (lv / levels) * R;
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = lv === levels
          ? 'rgba(99,179,237,0.25)'
          : 'rgba(99,179,237,0.08)';
        ctx.lineWidth = lv === levels ? 1.5 : 1;
        ctx.stroke();

        // Ring label
        if (lv % 2 === 0) {
          ctx.fillStyle = 'rgba(100,116,139,0.7)';
          ctx.font = '10px DM Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${Math.round((lv / levels) * 100)}`, cx + 4, cy - r + 12);
        }
      }

      // ── Axis spokes ──
      for (let i = 0; i < N; i++) {
        const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * R;
        const y = cy + Math.sin(angle) * R;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(99,179,237,0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node dot on outer ring
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99,179,237,0.3)';
        ctx.fill();

        // Labels
        const labelR = R + 28;
        const lx = cx + Math.cos(angle) * labelR;
        const ly = cy + Math.sin(angle) * labelR;
        ctx.save();
        ctx.font = '600 12px Syne, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = Math.abs(Math.cos(angle)) < 0.1 ? 'center'
          : Math.cos(angle) > 0 ? 'left' : 'right';
        ctx.textBaseline = 'middle';

        // Wrap long labels
        const words = data[i].label.split(' ');
        if (words.length > 1) {
          ctx.fillText(words[0], lx, ly - 7);
          ctx.fillText(words.slice(1).join(' '), lx, ly + 7);
        } else {
          ctx.fillText(data[i].label, lx, ly);
        }
        ctx.restore();
      }

      // ── Ease function ──
      const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const p = ease(animProgress);

      // ── Helper: polygon path ──
      const buildPath = (values) => {
        ctx.beginPath();
        values.forEach((val, i) => {
          const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
          const r = (Math.min(val, 100) / 100) * R * p;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
      };

      // ── Role polygon ──
      if (mode === 'both' || mode === 'jd') {
        buildPath(data.map(d => d.role));
        ctx.fillStyle = 'rgba(246,173,85,0.12)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(246,173,85,0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Role dots
        data.forEach((d, i) => {
          const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
          const r = (Math.min(d.role, 100) / 100) * R * p;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#f6ad55';
          ctx.fill();
        });
      }

      // ── You polygon ──
      if (mode === 'both' || mode === 'resume') {
        buildPath(data.map(d => d.you));

        // Gradient fill
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        grad.addColorStop(0, 'rgba(79,209,197,0.35)');
        grad.addColorStop(1, 'rgba(79,209,197,0.05)');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = 'rgba(79,209,197,0.9)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // You dots + glow
        data.forEach((d, i) => {
          const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
          const r = (Math.min(d.you, 100) / 100) * R * p;
          const dx = cx + Math.cos(angle) * r;
          const dy = cy + Math.sin(angle) * r;

          // Glow
          const glow = ctx.createRadialGradient(dx, dy, 0, dx, dy, 10);
          glow.addColorStop(0, 'rgba(79,209,197,0.4)');
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(dx, dy, 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(dx, dy, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#4fd1c5';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(dx, dy, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
        });
      }

      // ── Center dot ──
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99,179,237,0.5)';
      ctx.fill();
    }
  };

  // Init on load
  document.addEventListener('DOMContentLoaded', () => {
    RadarChart.init('radar-canvas');
  });
})();
