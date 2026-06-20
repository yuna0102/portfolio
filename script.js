// ── NAV SCROLL (main page only) ──
function showMain(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    const offset = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
  setActiveNav(sectionId);
}

function setActiveNav(id) {
  const mapped = (id === 'experience') ? 'education' : id;
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === mapped);
  });
}

// ── NAV ACTIVE ON SCROLL (main page) ──
const sections = ['about','impact','education','experience','awards','activities','projects','contact']
  .map(id => document.getElementById(id)).filter(Boolean);

if (sections.length) {
  const navObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) setActiveNav(e.target.id);
    });
  }, { rootMargin: '-68px 0px -80% 0px', threshold: 0 });
  sections.forEach(s => navObs.observe(s));
}

// ── TOC ACTIVE ON SCROLL (project detail) ──
const tocLinks = document.querySelectorAll('.detail-toc .toc-link');
const projSections = document.querySelectorAll('.proj-body-inner [id^="proj-"]');

if (projSections.length) {
  const tocObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        tocLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.detail-toc .toc-link[href="#${e.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-84px 0px -60% 0px', threshold: 0 });
  projSections.forEach(s => tocObs.observe(s));
}

// ── IMAGE MODAL ──
function openModal(src) {
  const modal = document.getElementById('imgModal');
  document.getElementById('imgModalImg').src = src;
  modal.classList.add('visible');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  const modal = document.getElementById('imgModal');
  modal.classList.remove('visible');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.querySelectorAll('.img-frame img').forEach(img => {
  img.addEventListener('click', () => { if (img.src) openModal(img.src); });
});

// ── SCROLL REVEAL ──
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.section, .exp-task-card, .img-frame, .impact-card, .proj-card, .kpi-row, .callout, .proj-block, .edu-card, .award-card').forEach(el => {
  if (el.getBoundingClientRect().top > window.innerHeight) {
    el.classList.add('fade-up');
    revealObs.observe(el);
  }
});
