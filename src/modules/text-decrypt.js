// src/modules/text-decrypt.js
// Cyberpunk / Matrix-style text decrypt effect for ALL texts across the website on scroll down

const CIPHER_CHARS = '0123456789ABCDEF_#$*<>{}/~+=-X%&!▲■§Ø';

export const TEXT_SELECTOR = [
  'h1',
  'h2',
  'h3',
  'h4',
  'p',
  '.hero-subtitle',
  '.hero-desc',
  '.hero-link',
  '.hero-proof li',
  '.btn',
  '.btn-text',
  '.kicker',
  '.section-lead',
  '.orch-lead',
  '.orch-badge',
  '.orch-cta',
  '.project-card .project-info h3',
  '.project-card .project-info p',
  '.project-tags span',
  '.case-tag',
  '.case-problem',
  '.case-solution',
  '.case-card p',
  '.case-metric-label',
  '.service-card h3',
  '.service-card p',
  '.service-price',
  '.company-name',
  '.company-duration',
  '.role-title',
  '.role-date',
  '.role-desc',
  '.skill-chip',
  '.skill-name',
  '.skills-tab-btn',
  '.about-text p'
].join(', ');

/**
 * Decrypts text nodes within an element progressively from left to right.
 * Preserves inner HTML structure (e.g. <span class="text-gradient">, <br>, <strong>).
 */
export const decryptElement = (element, customDuration) => {
  if (!element || window.prefersReducedMotion) return;
  if (element.dataset.decrypting === 'true') return;

  // Don't scramble empty or whitespace-only elements
  if (!element.textContent || element.textContent.trim().length === 0) return;

  element.dataset.decrypting = 'true';

  // Walk text nodes only, preserving all HTML markup, formatting and gradient classes
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
  const textNodes = [];
  let node;
  let totalChars = 0;

  while ((node = walker.nextNode())) {
    if (node.nodeValue && node.nodeValue.trim().length > 0) {
      textNodes.push({
        node,
        target: node.nodeValue
      });
      totalChars += node.nodeValue.length;
    }
  }

  if (textNodes.length === 0) {
    element.dataset.decrypting = 'false';
    return;
  }

  // Calculate speed: short labels are quick (~320ms), longer paragraphs resolve smoothly (~600ms)
  const duration = customDuration || Math.min(650, Math.max(320, Math.floor(totalChars * 5)));
  const startTime = performance.now();

  const frame = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);

    textNodes.forEach(({ node, target }) => {
      const len = target.length;
      const resolvedCount = Math.floor(progress * len);

      let result = '';
      for (let i = 0; i < len; i++) {
        const char = target[i];
        if (/\s/.test(char)) {
          result += char;
        } else if (i < resolvedCount) {
          result += char;
        } else if (i < resolvedCount + 3 && progress < 1) {
          result += CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
        } else {
          result += CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
        }
      }
      node.nodeValue = result;
    });

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      // Ensure target text is cleanly and exactly restored
      textNodes.forEach(({ node, target }) => {
        node.nodeValue = target;
      });
      element.dataset.decrypting = 'false';
      element.dataset.decrypted = 'true';
    }
  };

  requestAnimationFrame(frame);
};

export const initTextDecryptOnScroll = () => {
  let lastScrollY = window.scrollY;
  let isScrollingDown = true;

  // Track scroll direction
  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    if (Math.abs(currentY - lastScrollY) > 2) {
      isScrollingDown = currentY > lastScrollY;
    }
    lastScrollY = currentY;
  }, { passive: true });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Trigger if scrolling down OR if it hasn't been decrypted yet
        if (isScrollingDown || entry.target.dataset.decrypted !== 'true') {
          decryptElement(entry.target);
        }
      } else {
        // Reset when scrolled past above or below so it can re-trigger on subsequent scroll down
        const rect = entry.boundingClientRect;
        if (rect.top > window.innerHeight || rect.bottom < 0) {
          entry.target.dataset.decrypted = 'false';
        }
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -4% 0px',
    threshold: 0.10
  });

  const observeElements = (root = document) => {
    const elements = root.querySelectorAll(TEXT_SELECTOR);
    elements.forEach(el => observer.observe(el));
  };

  observeElements();

  // MutationObserver to automatically catch dynamically rendered cards (projects, blogs, etc.)
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // ELEMENT_NODE
          if (node.matches && node.matches(TEXT_SELECTOR)) {
            observer.observe(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll(TEXT_SELECTOR).forEach(el => observer.observe(el));
          }
        }
      });
    });
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });

  // Complete Hero Reveal Sequence
  let heroRevealed = false;
  const triggerHeroSequence = () => {
    if (heroRevealed) return;
    heroRevealed = true;

    const logoText = document.querySelector('.logo span');
    const subtitle = document.querySelector('.hero-subtitle');
    const h1 = document.querySelector('.hero h1');
    const desc = document.querySelector('.hero-desc');
    const ctaBtns = document.querySelectorAll('.hero-cta .btn, .hero-cta .hero-link');
    const proofItems = document.querySelectorAll('.hero-proof li');

    if (logoText) decryptElement(logoText, 450);
    if (subtitle) decryptElement(subtitle, 450);

    setTimeout(() => {
      if (h1) decryptElement(h1, 750);
    }, 150);

    setTimeout(() => {
      if (desc) decryptElement(desc, 650);
    }, 350);

    setTimeout(() => {
      ctaBtns.forEach((btn, idx) => {
        setTimeout(() => decryptElement(btn, 400), idx * 90);
      });
    }, 500);

    setTimeout(() => {
      proofItems.forEach((li, idx) => {
        setTimeout(() => decryptElement(li, 350), idx * 80);
      });
    }, 650);
  };

  // Listen to preloader fading event or fallback timeout
  window.addEventListener('preloaderFading', triggerHeroSequence);
  setTimeout(triggerHeroSequence, 1200);

  // Global trigger function for language updates
  window.triggerHeadingDecrypt = () => {
    document.querySelectorAll(TEXT_SELECTOR).forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        decryptElement(el);
      }
    });
  };
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTextDecryptOnScroll);
} else {
  initTextDecryptOnScroll();
}

