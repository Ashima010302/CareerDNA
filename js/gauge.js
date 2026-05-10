/* gauge.js — Animated arc score gauge */
(function () {
  window.ScoreGauge = {
    canvas: null,
    ctx: null,
    targetScore: 0,
    currentScore: 0,
    raf: null,

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
    },

    setScore(score) {
      this.targetScore = score;
      this.currentScore = 0;
      this.animateScore();
    },

    animateScore() {
      if (this.raf) cancelAnimationFrame(this.raf);
      const step = () => {
        this.currentScore += (this.targetScore - this.currentScore) * 0.06;
        if (Math.abs(this.targetScore - this.currentScore) < 0.2) {
          this.currentScore = this.targetScore;
        }
        this.render();
        // Animate the score number display
        const el = document.getElementById('score-num');
        if (el) el.textContent = Math.round(this.currentScore);

        if (this.currentScore < this.targetScore) {
          this.raf = requestAnimationFrame(step);
        }
      };
      step();
    },

    render() {
      if (!this.ctx) return;
      const { ctx, canvas, currentScore } = this;
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) * 0.42;
      const strokeW = 14;

      ctx.clearRect(0, 0, W, H);

      // Background arc
      ctx.beginPath();
      ctx.arc(cx, cy, R, Math.PI * 0.75, Math.PI * 2.25);
      ctx.strokeStyle = 'rgba(99,179,237,0.1)';
      ctx.lineWidth = strokeW;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Score arc
      const startAngle = Math.PI * 0.75;
      const totalArc = Math.PI * 1.5;
      const endAngle = startAngle + (currentScore / 100) * totalArc;

      // Color gradient based on score
      const grad = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
      if (currentScore < 40) {
        grad.addColorStop(0, '#fc8181');
        grad.addColorStop(1, '#f6ad55');
      } else if (currentScore < 70) {
        grad.addColorStop(0, '#f6ad55');
        grad.addColorStop(1, '#63b3ed');
      } else {
        grad.addColorStop(0, '#63b3ed');
        grad.addColorStop(1, '#4fd1c5');
      }

      ctx.beginPath();
      ctx.arc(cx, cy, R, startAngle, endAngle);
      ctx.strokeStyle = grad;
      ctx.lineWidth = strokeW;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glow at tip
      const tipX = cx + Math.cos(endAngle) * R;
      const tipY = cy + Math.sin(endAngle) * R;
      const glow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 20);
      glow.addColorStop(0, 'rgba(79,209,197,0.5)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 20, 0, Math.PI * 2);
      ctx.fill();

      // Tick marks
      for (let i = 0; i <= 10; i++) {
        const angle = startAngle + (i / 10) * totalArc;
        const inner = R - strokeW / 2 - 4;
        const outer = R + strokeW / 2 + 4;
        const x1 = cx + Math.cos(angle) * inner;
        const y1 = cy + Math.sin(angle) * inner;
        const x2 = cx + Math.cos(angle) * outer;
        const y2 = cy + Math.sin(angle) * outer;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(99,179,237,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    ScoreGauge.init('score-gauge');
  });
})();
