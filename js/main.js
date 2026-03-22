/* ============================================================
   main.js — Global JavaScript for ARIA Interiors
   Handles: navbar, hamburger, smooth scroll, parallax,
            counter animation, lightbox, portfolio filter,
            active nav link, WhatsApp button
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. STICKY NAVBAR
     Adds .scrolled class to <header class="navbar"> after
     scrolling 80px, triggering the frosted-glass background.
  ============================================================ */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ============================================================
     2. ACTIVE NAV LINK
     Compares the current page URL to each nav link's href
     and adds class="active" to the matching link.
     The HTML already sets the active class statically;
     this JS version ensures it works dynamically too.
  ============================================================ */
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
  navLinks.forEach(link => {
    const linkPath = new URL(link.href, window.location.origin).pathname;
    // Match exact path or home page
    if (
      currentPath === linkPath ||
      (currentPath === '/' && linkPath.endsWith('index.html'))
    ) {
      link.classList.add('active');
    }
  });

  /* ============================================================
     3. HAMBURGER MENU
     Toggles the fullscreen mobile menu open/closed.
     Closes on outside click or any nav link click.
  ============================================================ */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');

      if (mobileMenu.classList.contains('open')) {
        // Save scroll position and lock body in place so page content doesn't show through
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflow = 'hidden';
        document.body.dataset.scrollY = scrollY;
      } else {
        // Restore scroll position on close
        const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      }
    });

    // Helper to close menu and restore scroll
    const closeMenu = () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };

    // Close menu when any mobile nav link is clicked
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });

    // Close menu on click outside (on the overlay itself)
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeMenu();
    });
  }

  /* ============================================================
     4. SMOOTH SCROLLING for anchor links (#section)
     CSS scroll-behavior: smooth handles most cases,
     this JS handles edge cases and any anchor with href="#".
  ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return; // Ignore pure # links

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ============================================================
     5. HERO PARALLAX EFFECT
     Shifts the hero background image slightly on scroll
     to create a depth/parallax feel.
     Only active on the hero or page-hero background element.
  ============================================================ */
  const heroBg = document.querySelector('.hero-bg, .page-hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      // 0.3 = parallax intensity — lower = subtler
      heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
    }, { passive: true });
  }

  /* ============================================================
     6. COUNTER ANIMATION
     Animates the stat numbers on the home page from 0
     to their data-target value using requestAnimationFrame.
     Triggered by IntersectionObserver when scrolled into view.

     REPLACE: data-target values on each .stat-number in index.html
     to match your real statistics.
  ============================================================ */
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10);
          const duration = 2000; // ms — REPLACE to change animation speed
          const start = performance.now();

          const updateCounter = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic — slows down near the target
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = target; // Ensure exact final value
            }
          };

          requestAnimationFrame(updateCounter);
          counterObserver.unobserve(el); // Only animate once
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => counterObserver.observe(stat));
  }

  /* ============================================================
     7. PORTFOLIO LIGHTBOX (Vanilla JS — no external library)
     Opens a fullscreen overlay with the project image,
     title, and category when a portfolio card is clicked.
     Close: click X button | click outside | press Escape key.
  ============================================================ */
  const initLightbox = () => {
    // Create lightbox overlay DOM element
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
      <div class="lightbox-inner">
        <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
        <img class="lightbox-img" src="" alt="Portfolio project image">
        <div class="lightbox-caption">
          <h3></h3>
          <p></p>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const lbImg     = overlay.querySelector('.lightbox-img');
    const lbTitle   = overlay.querySelector('.lightbox-caption h3');
    const lbCat     = overlay.querySelector('.lightbox-caption p');
    const closeBtn  = overlay.querySelector('.lightbox-close');

    // Open lightbox on card click
    document.querySelectorAll('.portfolio-card').forEach(card => {
      card.addEventListener('click', () => {
        const img   = card.querySelector('img');
        const title = card.querySelector('.portfolio-overlay h3');
        const cat   = card.querySelector('.portfolio-overlay p');

        lbImg.src        = img.src;
        lbImg.alt        = img.alt;
        lbTitle.textContent = title ? title.textContent : '';
        lbCat.textContent   = cat   ? cat.textContent   : '';

        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    // Close functions
    const closeLightbox = () => {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      // Clear src after transition to avoid flash on reopen
      setTimeout(() => { lbImg.src = ''; }, 300);
    };

    closeBtn.addEventListener('click', closeLightbox);

    // Click outside the inner box to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeLightbox();
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closeLightbox();
      }
    });
  };

  // Only initialise lightbox on pages with portfolio cards
  if (document.querySelector('.portfolio-card')) {
    initLightbox();
  }

  /* ============================================================
     8. PORTFOLIO FILTER
     Filters portfolio cards by data-category attribute.
     Filter button data-filter values must exactly match
     the data-category values on each .portfolio-card.

     Available categories: all | residential | commercial | renovation
     REPLACE: Add new categories by adding a new filter button
     in portfolio.html and using the new category as data-category.
  ============================================================ */
  const filterBtns    = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active button state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        portfolioCards.forEach(card => {
          const category = card.getAttribute('data-category');

          if (filterValue === 'all' || filterValue === category) {
            // Show card with animation
            card.style.display = 'block';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, 10);
          } else {
            // Hide card with animation
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300); // Matches CSS transition duration
          }
        });
      });
    });
  }

});
/* ============================================================
   END OF main.js
   ============================================================ */