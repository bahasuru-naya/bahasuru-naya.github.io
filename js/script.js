const preloader = document.querySelector(".preloader");
window.addEventListener("load", () => {
  preloader.style.opacity = "0";

  setTimeout(() => {
    preloader.style.visibility = "hidden";
    preloader.style.display = "none";
  }, 500);

  // Initialize custom mouse cursor
  initCustomCursor();  

  // Initialize galaxy star field
  initGalaxyStars();
  

});

window.addEventListener("resize", () => {
  // Initialize galaxy star field
  initGalaxyStars();
  
});

// ─── Galaxy Star Field Animation ────────────────────────────────────────────
function initGalaxyStars() {
  const canvas = document.getElementById('galaxy-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId = null;
  let isVisible = true;

  // ── Resize: debounced via rAF to avoid thrashing ──
  let resizePending = false;
  function resizeCanvas() {
    if (resizePending) return;
    resizePending = true;
    requestAnimationFrame(() => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      resizePending = false;
    });
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // ── Pause when tab is hidden (saves CPU/GPU) ──
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
    if (isVisible && !animationId) animate();
  });

  // ── Star class ──
  // Pre-compute colors as strings to avoid repeated template literals in hot loop
  const COLORS = [
    'rgba(255,255,255,',   // white  – 50 %
    'rgba(99,102,241,',    // indigo – 25 %
    'rgba(139,92,246,',    // purple – 15 %
    'rgba(34,211,238,',    // cyan   – 10 %
  ];

  class Star {
    constructor(randomY = true) {
      this.reset(randomY);
    }

    reset(randomY = false) {
      this.x = Math.random() * canvas.width;
      this.y = randomY ? Math.random() * canvas.height : Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedY = Math.random() * 0.2 - 0.05;
      this.speedX = Math.random() * 0.2 - 0.05;

      const r = Math.random();
      const base = r < 0.5 ? COLORS[0] : r < 0.75 ? COLORS[1] : r < 0.9 ? COLORS[2] : COLORS[3];
      this.baseColor = base;
      this.opacity = Math.random() * 0.4 + 0.7;
      this.twinkleSpeed = Math.random() * 0.04 + 0.01;
      this.twinkleDir = Math.random() > 0.5 ? 1 : -1;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.opacity += this.twinkleSpeed * this.twinkleDir;
      if (this.opacity <= 0.5 || this.opacity >= 1) this.twinkleDir *= -1;
      if (this.y < 0 || this.y > canvas.height || this.x < 0 || this.x > canvas.width) this.reset();
    }

    draw() {
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.baseColor + '1)';
      // shadowBlur only on larger stars to cut overdraw cost
      if (this.size > 1.5) {
        ctx.shadowBlur = this.size * 3;
        ctx.shadowColor = this.baseColor + '0.8)';
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Create stars ──
  const starCount = Math.min(220, Math.floor((canvas.width * canvas.height) / 3500));
  const stars = Array.from({ length: starCount }, () => new Star(true));

  // ── Shooting Star class ──
  class ShootingStar {
    constructor() { this.reset(); }

    reset() {
      this.x = Math.random() * canvas.width + canvas.width * 0.5;
      this.y = Math.random() * canvas.height * 0.3 - 100;
      this.length = Math.random() * 120 + 80;
      this.speed = Math.random() * 3 + 4;
      this.size = Math.random() * 1.5 + 1.2;
      this.angle = Math.random() * 0.5 + 0.5;

      const r = Math.random();
      this.color = r < 0.4 ? 'rgba(255,255,255,1)' : r < 0.7 ? 'rgba(99,102,241,1)' : 'rgba(139,92,246,1)';
      this.colorBase = this.color.slice(0, -2); // strip trailing '1)'
      this.opacity = Math.random() * 0.3 + 0.7;
      this.trailOpacity = this.opacity * 0.85;
    }

    update() {
      this.x -= Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.opacity -= 0.009;
      this.trailOpacity -= 0.009;
    }

    draw() {
      if (this.opacity <= 0) return;
      ctx.save();

      const tx = this.x + Math.cos(this.angle) * this.length;
      const ty = this.y - Math.sin(this.angle) * this.length;
      const gradient = ctx.createLinearGradient(this.x, this.y, tx, ty);
      gradient.addColorStop(0, this.colorBase + this.opacity + ')');
      gradient.addColorStop(0.5, this.colorBase + (this.trailOpacity * 0.5) + ')');
      gradient.addColorStop(1, this.colorBase + '0)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = this.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    isOffScreen() {
      return this.x < -100 || this.y > canvas.height + 100 || this.opacity <= 0;
    }
  }

  const shootingStars = [];
  let lastShootingStarTime = 0;

  function spawnShootingStar(now) {
    if (now - lastShootingStarTime > 2000 + Math.random() * 2000) {
      shootingStars.push(new ShootingStar());
      lastShootingStarTime = now;
    }
  }

  // ── Animation loop ──
  function animate(now = 0) {
    if (!isVisible) { animationId = null; return; }
    animationId = requestAnimationFrame(animate);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Batch all stars in a single save/restore
    ctx.save();
    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw();
    }
    ctx.restore();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    spawnShootingStar(now);
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      shootingStars[i].update();
      shootingStars[i].draw();
      if (shootingStars[i].isOffScreen()) shootingStars.splice(i, 1);
    }
  }

  animate();
}


// ─── Scroll-to-top button & navbar blur  ─────────────────
const mybutton = document.getElementById("myBtn");
const nav = document.getElementsByClassName("navbar");
let scrollTicking = false;

window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    const scrolled = document.documentElement.scrollTop > 20;
    if (mybutton) mybutton.style.display = scrolled ? "block" : "none";
    if (nav[0]) nav[0].style.backdropFilter = scrolled ? "blur(30px)" : "blur(1px)";
    scrollTicking = false;
  });
}, { passive: true });

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Custom Animated Mouse Pointer ────────────────────────────────────────────
function initCustomCursor() {
  // Only initialize on devices with a fine pointer (like a mouse)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const dot = document.createElement('div');
  dot.classList.add('custom-cursor-dot');

  const ring = document.createElement('div');
  ring.classList.add('custom-cursor-ring');

  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.body.classList.add('has-custom-cursor');

  // Hide initially until the first mouse movement
  dot.style.opacity = '0';
  ring.style.opacity = '0';
  let hasMoved = false;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    if (!hasMoved) {
      hasMoved = true;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
      // Snap ring immediately to first position
      ringX = e.clientX;
      ringY = e.clientY;
    }
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Hide when mouse leaves the document, show when it returns
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    if (hasMoved) {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    }
  });

  // Handle mousedown/mouseup for click effect
  window.addEventListener('mousedown', () => ring.classList.add('clicked'));
  window.addEventListener('mouseup', () => ring.classList.remove('clicked'));

  // Optimize animation with requestAnimationFrame
  function renderCursor() {
    // Dot follows instantly
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

    // Ring follows with easing (lerp)
    ringX += (mouseX - ringX) * 0.3;
    ringY += (mouseY - ringY) * 0.3;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Event delegation for hover states on interactive elements
  const interactiveSelector = 'a, button, input, textarea, .projectimage img, .social-icon, .tabs div';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      dot.classList.add('hovered');
      ring.classList.add('hovered');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      dot.classList.remove('hovered');
      ring.classList.remove('hovered');
    }
  });
}
