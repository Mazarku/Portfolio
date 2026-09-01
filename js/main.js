document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in-view'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  }
}

const sections = document.querySelectorAll('main section[id]');
const sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');
if (sections.length && sectionLinks.length && 'IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach((section) => navObserver.observe(section));
}

const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 480);
  }, { passive: true });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

const bgCanvas = document.getElementById('bgCanvas');
if (bgCanvas) {
  const ctx = bgCanvas.getContext('2d');
  let nodes = [];
  let width = 0;
  let height = 0;
  let animationFrame = null;

  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1d4ed8';

  function resize() {
    width = document.documentElement.clientWidth;
    height = document.documentElement.scrollHeight;
    bgCanvas.width = width * window.devicePixelRatio;
    bgCanvas.height = height * window.devicePixelRatio;
    bgCanvas.style.width = `${width}px`;
    bgCanvas.style.height = `${height}px`;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    const count = Math.min(220, Math.max(30, Math.round((width * height) / 20000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const linkDistance = 130;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      if (!prefersReducedMotion) {
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > width) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;
        a.x = Math.min(Math.max(a.x, 0), width);
        a.y = Math.min(Math.max(a.y, 0), height);
      }
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < linkDistance) {
          ctx.strokeStyle = accentColor;
          ctx.globalAlpha = (1 - dist / linkDistance) * 0.35;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 0.6;
    ctx.fillStyle = accentColor;
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function loop() {
    draw();
    animationFrame = requestAnimationFrame(loop);
  }

  resize();
  if (prefersReducedMotion) {
    draw();
  } else {
    loop();
  }

  let resizeTimeout;
  function scheduleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      resize();
      if (prefersReducedMotion) {
        draw();
      } else {
        loop();
      }
    }, 150);
  }

  window.addEventListener('resize', scheduleResize);
  window.addEventListener('load', scheduleResize);
}
