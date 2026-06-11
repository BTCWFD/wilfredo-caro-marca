// --- Skills Tab Switching ---
const tabButtons = document.querySelectorAll('.skills-tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

if (tabButtons.length && tabContents.length) {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // Update active button
      tabButtons.forEach(b => b.classList.toggle('active', b === btn));

      // Update active content
      tabContents.forEach(content => {
        if (content.id === `skills-${targetTab}`) {
          content.classList.add('active');
          // Force reveal items inside the active tab
          content.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('active');
          });
        } else {
          content.classList.remove('active');
        }
      });
    });
  });
}
