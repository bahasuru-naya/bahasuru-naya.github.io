document.addEventListener('DOMContentLoaded', () => {

  // ─── Accordion Logic ────────────────────────────────────────────────────────
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close all items
      document.querySelectorAll('.accordion-item').forEach(accItem => {
        accItem.classList.remove('active');
      });
      
      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // ─── Progress Bar Animation on Scroll ───────────────────────────────────────
  const progressFills = document.querySelectorAll('.progress-fill');

  const animateProgress = () => {
    progressFills.forEach(fill => {
      const fillPosition = fill.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.1; // trigger when element is in view
      if (fillPosition < screenPosition) {
        fill.style.width = fill.getAttribute('data-width');
      }
    });
  };

  window.addEventListener('scroll', animateProgress);
  animateProgress(); // trigger on load in case elements are already in view
});
