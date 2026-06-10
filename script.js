// =================================================================
// == BLOCK 1: NAVBAR SCROLL
// =================================================================

// SECTION 1.1: Scrolled state
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});


// =================================================================
// == BLOCK 2: MOBILE MENU
// =================================================================

// SECTION 2.1: Toggle
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// SECTION 2.2: Close on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});


// =================================================================
// == BLOCK 3: FAN CARD LAYOUT
// =================================================================

// SECTION 3.1: Fan state
const fanStage  = document.getElementById('fan-stage');
const fanCards  = Array.from(document.querySelectorAll('.fan-card'));
const fanDotsEl = document.getElementById('fan-dots');
const fanPrev   = document.getElementById('fan-prev');
const fanNext   = document.getElementById('fan-next');

const TOTAL     = fanCards.length;
let   activeIdx = Math.floor(TOTAL / 2); // start at center card

// SECTION 3.2: Fan angle config
// Cards spread like a hand — center is 0°, sides tilt outward
function getFanAngle(position) {
  // position: -2, -1, 0, 1, 2 relative to active
  const maxAngle = 22; // degrees each step
  return position * maxAngle;
}

function getFanX(position) {
  // horizontal spread per step in px
  const spread = 72;
  return position * spread;
}

function getFanZ(position) {
  // cards behind center are lower z
  return 10 - Math.abs(position) * 2;
}

function getFanY(position) {
  // cards further from center drop slightly
  return Math.abs(position) * 18;
}

// SECTION 3.3: Render fan positions
function renderFan() {
  fanCards.forEach((card, i) => {
    const position = i - activeIdx; // relative to active

    const angle   = getFanAngle(position);
    const tx      = getFanX(position);
    const ty      = getFanY(position);
    const zIndex  = getFanZ(position);

    card.style.zIndex    = zIndex;
    card.style.transform = `translateX(${tx}px) translateY(${ty}px) rotate(${angle}deg)`;

    // Active state
    if (i === activeIdx) {
      card.classList.add('fan-active');
    } else {
      card.classList.remove('fan-active');
    }
  });

  // Update dots
  document.querySelectorAll('.fan-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === activeIdx);
  });
}

// SECTION 3.4: Build dots
fanCards.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.classList.add('fan-dot');
  dot.setAttribute('aria-label', `Go to project ${i + 1}`);
  dot.addEventListener('click', () => setActive(i));
  fanDotsEl.appendChild(dot);
});

// SECTION 3.5: Set active card
function setActive(index) {
  activeIdx = (index + TOTAL) % TOTAL;
  renderFan();
}

// SECTION 3.6: Arrow navigation
fanPrev.addEventListener('click', () => setActive(activeIdx - 1));
fanNext.addEventListener('click', () => setActive(activeIdx + 1));

// SECTION 3.7: Hover any card to bring it to center
fanCards.forEach((card, i) => {
  // SECTION 3.7.1: Hover brings card to center
  card.addEventListener('mouseenter', () => {
    if (i !== activeIdx) {
      setActive(i);
    }
  });

  // SECTION 3.7.2: Click on non-active also brings to center (touch support)
  card.addEventListener('click', () => {
    if (i !== activeIdx) {
      setActive(i);
    }
  });
});

// SECTION 3.8: Keyboard navigation
document.addEventListener('keydown', (e) => {
  const workSection = document.getElementById('work');
  const rect = workSection.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    if (e.key === 'ArrowLeft')  setActive(activeIdx - 1);
    if (e.key === 'ArrowRight') setActive(activeIdx + 1);
  }
});

// SECTION 3.9: Initial state — all cards stacked before visible
fanCards.forEach(card => card.classList.add('fan-stacked'));

// SECTION 3.10: Spread on enter, fold on leave
const fanObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {

    if (entry.isIntersecting) {
      // SECTION 3.10.1: Remove stacked/folded — spread the fan
      fanCards.forEach((card, i) => {
        // Stagger each card slightly for a dealt-cards effect
        setTimeout(() => {
          card.classList.remove('fan-stacked', 'fan-folded');
        }, i * 60);
      });

    } else {
      // SECTION 3.10.2: Fold cards back when section leaves view
      fanCards.forEach((card, i) => {
        setTimeout(() => {
          card.classList.add('fan-folded');
        }, i * 40);
      });
    }
  });
}, {
  threshold: 0.25, // trigger when 25% of section is visible
});

fanObserver.observe(document.getElementById('work'));

// SECTION 3.11: Initial render (positions set, overridden by stacked class)
renderFan();


// =================================================================
// == BLOCK 4: LIGHTBOX
// =================================================================

// SECTION 4.1: Elements
const lightbox         = document.getElementById('lightbox');
const lightboxContent  = document.getElementById('lightbox-content');
const lightboxFrame    = document.getElementById('lightbox-frame');
const lightboxClose    = document.getElementById('lightbox-close');
const lightboxBackdrop = document.getElementById('lightbox-backdrop');

// SECTION 4.2: Open
function openLightbox(videoId, videoType) {
  lightboxContent.classList.toggle('portrait', videoType === 'short');
  lightboxFrame.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>`;
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

// SECTION 4.3: Close
function closeLightbox() {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxFrame.innerHTML = '';
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// SECTION 4.4: Attach to fan play buttons
document.querySelectorAll('.fan-card').forEach(card => {
  const videoId   = card.dataset.videoId;
  const videoType = card.dataset.videoType;
  if (!videoId) return;

  const playBtn = card.querySelector('.fan-play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // don't trigger fan rotation
      openLightbox(videoId, videoType);
    });
  }
});


// =================================================================
// == BLOCK 5: SCROLL REVEAL
// =================================================================

// SECTION 5.1: Targets
const revealEls = document.querySelectorAll(
  '.difference-headline, .difference-desc, .pillars, ' +
  '.why-card, .timeline-item, ' +
  '.contact-headline, .contact-details, .contact-socials'
);

revealEls.forEach(el => el.classList.add('reveal'));

// SECTION 5.2: Stagger why cards
document.querySelectorAll('.why-card').forEach((el, i) => {
  el.classList.add(`reveal-delay-${Math.min(i + 1, 4)}`);
});

// SECTION 5.3: Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

revealEls.forEach(el => observer.observe(el));


// =================================================================
// == BLOCK 6: ACTIVE NAV HIGHLIGHT
// =================================================================

// SECTION 6.1: Highlight on scroll
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a:not(.nav-cta)');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 140) current = sec.getAttribute('id');
  });
  navAnchors.forEach(a => {
    a.style.color = '';
    if (a.getAttribute('href') === `#${current}`) a.style.color = 'var(--accent)';
  });
});