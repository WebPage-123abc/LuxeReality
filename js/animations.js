/* ============================================================
   animations.js — Scroll-triggered reveal animations
   Uses IntersectionObserver to add class "visible" to elements
   that have .animate-on-scroll, .animate-slide-left,
   .animate-slide-right, or .animate-stagger classes.

   The actual CSS transitions are defined in animations.css.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     INTERSECTION OBSERVER OPTIONS
     rootMargin: "0px" — trigger when element enters viewport edge
     threshold: 0.15  — trigger when 15% of element is visible
     REPLACE: threshold to a higher value (e.g. 0.3) if you want
     elements to be more visible before animating in.
  ============================================================ */
  const observerOptions = {
    root: null,          // Observe relative to the viewport
    rootMargin: '0px',
    threshold: 0.15      // REPLACE: 0.1–0.4 to adjust trigger point
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add .visible to trigger the CSS transition
        entry.target.classList.add('visible');
        // Unobserve after animating — each element animates only once
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  /* ============================================================
     ELEMENTS TO OBSERVE
     All elements with any of these classes will be watched.
     Add new animation classes here if you extend the system.
  ============================================================ */
  const animatedElements = document.querySelectorAll(
    '.animate-on-scroll, .animate-slide-left, .animate-slide-right, .animate-stagger'
  );

  animatedElements.forEach(el => observer.observe(el));

});
/* ============================================================
   END OF animations.js
   ============================================================ */