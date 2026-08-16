/* ==========================================================================
   YEAR
   ========================================================================== */
document.getElementById("year").textContent = new Date().getFullYear();

/* ==========================================================================
   MOBILE MENU
   ========================================================================== */
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  menuBtn.classList.toggle("open", isOpen);
  menuBtn.setAttribute("aria-expanded", isOpen);
});

document.querySelectorAll(".mobile-link").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuBtn.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  });
});

/* ==========================================================================
   SCROLL REVEAL
   ========================================================================== */
const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
);

revealEls.forEach((el) => revealObserver.observe(el));

/* ==========================================================================
   ACTIVE SECTION -> RAIL DOTS + FILL
   ========================================================================== */
const sections = document.querySelectorAll(".section[id]");
const railDots = document.querySelectorAll(".rail-dot");
const railFill = document.getElementById("railFill");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        railDots.forEach((dot) => {
          dot.classList.toggle("active", dot.dataset.section === id);
        });
        const idx = Array.from(sections).findIndex((s) => s.id === id);
        const pct = (idx / (sections.length - 1)) * 100;
        if (railFill) railFill.style.height = pct + "%";
      }
    });
  },
  { threshold: 0.5 },
);

sections.forEach((s) => sectionObserver.observe(s));

/* ==========================================================================
   ANIMATED STAT COUNTERS
   ========================================================================== */
const statEls = document.querySelectorAll(".stat-num");

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 },
);

statEls.forEach((el) => statObserver.observe(el));

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ==========================================================================
   HERO PARTICLE NETWORK
   ========================================================================== */
const canvas = document.getElementById("net");
const ctx = canvas.getContext("2d");
let particles = [];
let mouse = { x: null, y: null };
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function resizeCanvas() {
  const hero = canvas.parentElement;
  canvas.width = hero.offsetWidth;
  canvas.height = hero.offsetHeight;
  initParticles();
}

function initParticles() {
  const count = Math.min(
    70,
    Math.floor((canvas.width * canvas.height) / 18000),
  );
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.6 + 0.6,
  }));
}

function drawNetwork() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const maxDist = 140;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    // subtle attraction toward cursor
    if (mouse.x !== null) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 160) {
        p.x += dx * 0.0025;
        p.y += dy * 0.0025;
      }
    }

    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        ctx.strokeStyle = `rgba(124,92,255,${(1 - dist / maxDist) * 0.35})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = "rgba(34,211,238,0.75)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!prefersReducedMotion) requestAnimationFrame(drawNetwork);
}

window.addEventListener("resize", resizeCanvas);
canvas.parentElement.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});
canvas.parentElement.addEventListener("mouseleave", () => {
  mouse.x = null;
  mouse.y = null;
});

resizeCanvas();
drawNetwork();
if (prefersReducedMotion) drawNetwork(); // draw a single static frame
