/**
 * SAMIN PIANO & KEYBOARD ACADEMY
 * Interactive portfolio script: Navigation, Web Audio Piano Synthesizer,
 * FAQ Accordion, Booking Modal & WhatsApp Integration.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initFaqAccordion();
  initPianoKeyboard();
  initBookingModal();
  initBackToTop();
  initWhatsAppLinks();
});

/* ==========================================================================
   0. WhatsApp Link Injection (number loaded securely from config.js)
   ========================================================================== */
function initWhatsAppLinks() {
  // Read number from config.js → set by Netlify env var at build time
  const num = (window.SITE_CONFIG && window.SITE_CONFIG.whatsappNumber) || '';

  const ctaLink      = document.getElementById('ctaWhatsAppLink');
  const floatingLink = document.getElementById('floatingWhatsAppLink');

  if (ctaLink && num) {
    ctaLink.href = `https://wa.me/${num}?text=Hello!%20I%20would%20like%20to%20inquire%20about%20piano%2Fkeyboard%20lessons%20for%20my%20child.`;
  }
  if (floatingLink && num) {
    floatingLink.href = `https://wa.me/${num}?text=Hello%20Teacher!%20I%20am%20interested%20in%20booking%20a%20piano%2Fkeyboard%20trial%20class%20for%20my%20child.`;
  }

  // Store number globally so initBookingModal can use it
  window._waNumber = num;
}

/* ==========================================================================
   1. Navigation & Scroll Tracking
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('header');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky header shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking any nav link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // Active link highlighting on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const targetNavLink = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);

      if (targetNavLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          targetNavLink.classList.add('active');
        } else {
          targetNavLink.classList.remove('active');
        }
      }
    });
  });
}

/* ==========================================================================
   2. Interactive Piano Synthesizer (Web Audio API)
   ========================================================================== */
function initPianoKeyboard() {
  const pianoBoard = document.getElementById('pianoBoard');
  const displayHint = document.getElementById('playedNoteDisplay');
  if (!pianoBoard) return;

  // Standard frequencies for octave 4-5
  const noteFrequencies = {
    'C4': 261.63,
    'C#4': 277.18,
    'D4': 293.66,
    'D#4': 311.13,
    'E4': 329.63,
    'F4': 349.23,
    'F#4': 369.99,
    'G4': 392.00,
    'G#4': 415.30,
    'A4': 440.00,
    'A#4': 466.16,
    'B4': 493.88,
    'C5': 523.25
  };

  let audioCtx = null;

  function playTone(freq, noteName) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Soft triangle/sine blend for piano-like bell timbre
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Natural piano attack and decay curve
      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.4, audioCtx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);

      if (displayHint) {
        displayHint.textContent = `Playing note: ${noteName} (${Math.round(freq)} Hz)`;
        displayHint.style.color = '#f4cf0c';
      }
    } catch (e) {
      console.warn('AudioContext not allowed or supported', e);
    }
  }

  const keys = pianoBoard.querySelectorAll('.p-key');
  keys.forEach(key => {
    const note = key.getAttribute('data-note');
    const freq = noteFrequencies[note];

    key.addEventListener('mousedown', (e) => {
      e.preventDefault();
      key.classList.add('active');
      if (freq) playTone(freq, note);
    });

    key.addEventListener('mouseup', () => {
      key.classList.remove('active');
    });

    key.addEventListener('mouseleave', () => {
      key.classList.remove('active');
    });

    // Touch support for mobile devices
    key.addEventListener('touchstart', (e) => {
      e.preventDefault();
      key.classList.add('active');
      if (freq) playTone(freq, note);
    });

    key.addEventListener('touchend', () => {
      key.classList.remove('active');
    });
  });
}

/* ==========================================================================
   3. FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all items
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ==========================================================================
   4. Booking Modal & Interactive WhatsApp Link Form
   ========================================================================== */
function initBookingModal() {
  const modal = document.getElementById('trialModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const bookingForm = document.getElementById('bookingForm');
  const bookingSuccess = document.getElementById('bookingSuccess');
  const closeSuccessBtn = document.getElementById('closeSuccessModalBtn');
  const planSelect = document.getElementById('selectedPlan');
  const openButtons = document.querySelectorAll('.open-trial-btn');
  const directWhatsAppLink = document.getElementById('directWhatsAppLink');
  const successSummaryText = document.getElementById('successSummaryText');

  if (!modal) return;

  function openModal(preselectedPlan) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Reset view
    if (bookingForm) bookingForm.style.display = 'flex';
    if (bookingSuccess) bookingSuccess.style.display = 'none';

    // Auto-select package if triggered from package card
    if (preselectedPlan && planSelect) {
      for (let i = 0; i < planSelect.options.length; i++) {
        if (planSelect.options[i].value.toLowerCase().includes(preselectedPlan.toLowerCase()) ||
            planSelect.options[i].text.toLowerCase().includes(preselectedPlan.toLowerCase())) {
          planSelect.selectedIndex = i;
          break;
        }
      }
    }
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Open triggers
  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const plan = btn.getAttribute('data-plan') || '';
      openModal(plan);
    });
  });

  // Close triggers
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeModal);

  // Close on outside overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Form Submission
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const parentName   = document.getElementById('parentName').value.trim();
      const studentName  = document.getElementById('studentName').value.trim();
      const studentAge   = document.getElementById('studentAge').value.trim();
      const instrument   = document.getElementById('instrument').value;
      const plan         = document.getElementById('selectedPlan').value;
      const phone        = document.getElementById('contactPhone').value.trim();
      const email        = document.getElementById('contactEmail').value.trim();
      const time         = document.getElementById('preferredTime').value.trim();
      const experience   = document.getElementById('studentExperience').value;
      const notes        = document.getElementById('specialNotes').value.trim();

      // ── 1. Send to Formspree (email to Samin) ──────────────────────────────
      const formData = new FormData(bookingForm);
      try {
        await fetch(bookingForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
      } catch (err) {
        // Silent fail – WhatsApp is the backup channel
        console.warn('Formspree submission error:', err);
      }

      // ── 2. Build WhatsApp pre-filled message ───────────────────────────────
      const waMessage =
`🎹 *New Music Lesson Booking / Trial Inquiry* 🎹
-----------------------------------------
👤 *Parent Name:* ${parentName}
👦 *Student Name:* ${studentName} (Age: ${studentAge})
🎼 *Instrument:* ${instrument}
📦 *Selected Plan:* ${plan}
📱 *Phone / WhatsApp:* ${phone}
📧 *Email:* ${email || 'Not specified'}
⏰ *Preferred Time:* ${time || 'Flexible'}
🎵 *Experience:* ${experience}
📝 *Notes:* ${notes || 'None'}
-----------------------------------------
Looking forward to confirming our trial session!`;

      const encodedMessage = encodeURIComponent(waMessage);
      const waNum = window._waNumber || '';
      const waUrl = `https://wa.me/${waNum}?text=${encodedMessage}`;

      if (directWhatsAppLink) {
        directWhatsAppLink.setAttribute('href', waUrl);
      }

      if (successSummaryText) {
        successSummaryText.innerHTML = `Thank you <strong>${parentName}</strong>! Your request for <strong>${studentName}</strong> (${plan}) has been sent to our email & is ready to share via WhatsApp too.`;
      }

      // Show success screen
      bookingForm.style.display = 'none';
      bookingSuccess.style.display = 'block';
    });
  }
}

/* ==========================================================================
   5. Back to Top Button
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
