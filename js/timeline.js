/* timeline.js — 5-Year Career Trajectory Chart */
(function () {
  window.TimelineChart = {
    canvas: null,
    ctx: null,
    trajectories: null,
    animProgress: 0,
    raf: null,

    COLORS: ['#4fd1c5', '#b794f4', '#f6ad55'],
    LABELS: ['Path A', 'Path B', 'Path C'],

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
      this.canvas.width = parent.offsetWidth || 860;
      this.canvas.height = 260;
      if (this.trajectories) this.render();
    },

    setData(trajectories) {
      // trajectories: [{ label, growthRate, points:[{year,salaryMultiplier}] }]
      this.trajectories = trajectories;
      this.animProgress = 0;
      this.animate();
    },

    animate() {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.animProgress = 0;
      const step = () => {
        this.animProgress = Math.min(1, this.animProgress + 0.018);
        this.render();
        if (this.animProgress < 1) this.raf = requestAnimationFrame(step);
      };
      step();
    },

    render() {
      if (!this.ctx || !this.trajectories) return;
      const { ctx, canvas, trajectories, animProgress, COLORS } = this;
      const W = canvas.width, H = canvas.height;
      const padL = 60, padR = 30, padT = 24, padB = 48;
      const chartW = W - padL - padR;
      const chartH = H - padT - padB;

      ctx.clearRect(0, 0, W, H);

      // X: years 0-5
      const years = [0, 1, 2, 3, 4, 5];
      // Y: salary multiplier range
      const allVals = trajectories.flatMap(t => t.points.map(p => p.value));
      const minVal = Math.min(...allVals) * 0.92;
      const maxVal = Math.max(...allVals) * 1.05;

      const toX = (yr) => padL + (yr / 5) * chartW;
      const toY = (val) => padT + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

      // ── Grid lines ──
      for (let i = 0; i <= 4; i++) {
        const y = padT + (i / 4) * chartH;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + chartW, y);
        ctx.strokeStyle = 'rgba(99,179,237,0.07)';
        ctx.lineWidth = 1;
        ctx.stroke();

        const val = maxVal - (i / 4) * (maxVal - minVal);
        ctx.fillStyle = 'rgba(100,116,139,0.6)';
        ctx.font = '10px DM Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${val.toFixed(1)}x`, padL - 8, y + 4);
      }

      // ── X axis labels ──
      years.forEach(yr => {
        const x = toX(yr);
        ctx.fillStyle = 'rgba(100,116,139,0.6)';
        ctx.font = '10px DM Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Y${yr}`, x, H - padB + 18);

        if (yr > 0) {
          ctx.beginPath();
          ctx.moveTo(x, padT);
          ctx.lineTo(x, padT + chartH);
          ctx.strokeStyle = 'rgba(99,179,237,0.05)';
          ctx.stroke();
        }
      });

      // ── X axis base line ──
      ctx.beginPath();
      ctx.moveTo(padL, padT + chartH);
      ctx.lineTo(padL + chartW, padT + chartH);
      ctx.strokeStyle = 'rgba(99,179,237,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── Draw each trajectory ──
      const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const p = ease(animProgress);

      trajectories.forEach((traj, ti) => {
        const color = COLORS[ti];
        const pts = traj.points;

        // How far along the x-axis to draw
        const maxX = toX(5 * p);

        // Build clipped path
        ctx.save();
        ctx.beginPath();
        ctx.rect(padL, padT, (chartW * p), chartH + 10);
        ctx.clip();

        // Area fill (gradient)
        ctx.beginPath();
        pts.forEach((pt, i) => {
          const x = toX(pt.year);
          const y = toY(pt.value);
          i === 0 ? ctx.moveTo(x, y) : ctx.bezierCurveTo(
            toX(pts[i - 1].year + 0.5), toY(pts[i - 1].value),
            x - (toX(pt.year) - toX(pts[i - 1].year)) * 0.5, y,
            x, y
          );
        });
        // close area
        ctx.lineTo(toX(5), padT + chartH);
        ctx.lineTo(toX(0), padT + chartH);
        ctx.closePath();

        const areaGrad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
        areaGrad.addColorStop(0, color.replace(')', ',0.15)').replace('rgb', 'rgba'));
        areaGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = areaGrad;
        ctx.fill();

        // Line
        ctx.beginPath();
        pts.forEach((pt, i) => {
          const x = toX(pt.year);
          const y = toY(pt.value);
          i === 0 ? ctx.moveTo(x, y) : ctx.bezierCurveTo(
            toX(pts[i - 1].year + 0.5), toY(pts[i - 1].value),
            x - (toX(pt.year) - toX(pts[i - 1].year)) * 0.5, y,
            x, y
          );
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([]);
        ctx.stroke();

        ctx.restore();

        // Dots at each year
        pts.forEach((pt) => {
          const x = toX(pt.year);
          const y = toY(pt.value);
          if (x > padL + chartW * p) return;

          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#0d1421';
          ctx.fill();
        });

        // End label
        if (p > 0.95) {
          const last = pts[pts.length - 1];
          const lx = toX(last.year);
          const ly = toY(last.value);
          ctx.font = '600 12px Syne, sans-serif';
          ctx.fillStyle = color;
          ctx.textAlign = 'left';
          ctx.fillText(traj.label, lx + 8, ly + 4);
        }
      });

      // ── Today marker ──
      ctx.beginPath();
      ctx.moveTo(padL, padT);
      ctx.lineTo(padL, padT + chartH);
      ctx.strokeStyle = 'rgba(246,224,94,0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(246,224,94,0.7)';
      ctx.font = '10px DM Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('TODAY', padL + 4, padT + 14);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    TimelineChart.init('timeline-canvas');
  });
})();
