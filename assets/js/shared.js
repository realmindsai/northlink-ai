// ABOUTME: Shared animation utilities for NorthLink AI demo pages.
// ABOUTME: Provides typewriter, count-up, shimmer, toast, and other effects.

/**
 * Typewriter effect — types text character by character into an element.
 * @param {HTMLElement} element - Target element
 * @param {string} text - Text to type
 * @param {number} speed - Milliseconds per character (default: 30)
 * @returns {Promise} Resolves when typing is complete
 */
function typeWriter(element, text, speed = 30) {
  return new Promise(resolve => {
    let i = 0;
    element.textContent = '';
    const interval = setInterval(() => {
      element.textContent += text.charAt(i);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}

/**
 * Animated number counter — counts from start to end value.
 * @param {HTMLElement} element - Target element
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} duration - Animation duration in ms (default: 1000)
 * @param {string} prefix - Text before number (default: '')
 * @param {string} suffix - Text after number (default: '')
 * @param {number} decimals - Decimal places (default: 0)
 * @returns {Promise} Resolves when counting is complete
 */
function countUp(element, start, end, duration = 1000, prefix = '', suffix = '', decimals = 0) {
  return new Promise(resolve => {
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = start + (end - start) * eased;
      element.textContent = prefix + current.toFixed(decimals) + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = prefix + end.toFixed(decimals) + suffix;
        resolve();
      }
    }
    requestAnimationFrame(update);
  });
}

/**
 * Shimmer effect — applies a scanning/processing animation overlay.
 * @param {HTMLElement} element - Target element
 * @param {number} duration - Duration in ms (default: 1500)
 * @returns {Promise} Resolves when shimmer is complete
 */
function shimmer(element, duration = 1500) {
  return new Promise(resolve => {
    element.classList.add('shimmer');
    setTimeout(() => {
      element.classList.remove('shimmer');
      resolve();
    }, duration);
  });
}

/**
 * Toast notification — shows a temporary message at bottom-right.
 * @param {string} message - Notification text
 * @param {string} type - 'success' | 'warning' | 'danger' | 'info' (default: 'success')
 * @param {number} duration - Display duration in ms (default: 3000)
 */
function toast(message, type = 'success', duration = 3000) {
  const container = document.querySelector('.toast-container') || createToastContainer();
  const toastEl = document.createElement('div');
  toastEl.className = `toast toast-${type}`;
  toastEl.textContent = message;
  container.appendChild(toastEl);
  // Trigger slide-in
  requestAnimationFrame(() => toastEl.classList.add('toast-visible'));
  setTimeout(() => {
    toastEl.classList.remove('toast-visible');
    setTimeout(() => toastEl.remove(), 300);
  }, duration);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

/**
 * Staggered appear — fades in a list of elements one by one.
 * @param {NodeList|Array} elements - Elements to reveal
 * @param {number} delay - Delay between each element in ms (default: 200)
 * @returns {Promise} Resolves when all elements are visible
 */
function staggeredAppear(elements, delay = 200) {
  return new Promise(resolve => {
    const els = Array.from(elements);
    if (els.length === 0) { resolve(); return; }
    els.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        if (i === els.length - 1) {
          setTimeout(resolve, 300);
        }
      }, delay * i);
    });
  });
}

/**
 * Draw SVG line between two elements with path animation.
 * @param {HTMLElement} from - Source element
 * @param {HTMLElement} to - Target element
 * @param {number} duration - Animation duration in ms (default: 500)
 * @param {string} color - Line colour (default: '#A77ACD')
 * @returns {SVGElement} The created SVG line element
 */
function drawLine(from, to, duration = 500, color = '#A77ACD') {
  let svg = document.querySelector('.line-overlay');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('line-overlay');
    svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10;';
    document.body.appendChild(svg);
  }
  const fromRect = from.getBoundingClientRect();
  const toRect = to.getBoundingClientRect();
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const x1 = fromRect.left + fromRect.width / 2 + scrollX;
  const y1 = fromRect.top + fromRect.height / 2 + scrollY;
  const x2 = toRect.left + toRect.width / 2 + scrollX;
  const y2 = toRect.top + toRect.height / 2 + scrollY;
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', '2');
  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  line.setAttribute('stroke-dasharray', length);
  line.setAttribute('stroke-dashoffset', length);
  line.style.transition = `stroke-dashoffset ${duration}ms ease`;
  svg.appendChild(line);
  requestAnimationFrame(() => line.setAttribute('stroke-dashoffset', '0'));
  return line;
}

/**
 * Reset demo — clears all animations and restores initial state.
 * Removes shimmer classes, SVG overlays, toasts, and resets
 * elements with data-initial-* attributes.
 */
function resetDemo() {
  // Remove shimmer
  document.querySelectorAll('.shimmer').forEach(el => el.classList.remove('shimmer'));
  // Remove SVG line overlays
  document.querySelectorAll('.line-overlay').forEach(el => el.remove());
  // Remove toasts
  document.querySelectorAll('.toast').forEach(el => el.remove());
  // Reset elements that have been marked with data-reset
  document.querySelectorAll('[data-reset-opacity]').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
  });
  document.querySelectorAll('[data-reset-text]').forEach(el => {
    el.textContent = el.dataset.resetText;
  });
  document.querySelectorAll('[data-reset-class]').forEach(el => {
    el.className = el.dataset.resetClass;
  });
}

/**
 * Wait utility — returns a promise that resolves after ms milliseconds.
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise}
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Accordion toggle — expands/collapses an accordion section.
 * Call from onclick on the accordion header.
 * @param {HTMLElement} header - The clicked accordion header
 */
function toggleAccordion(header) {
  const content = header.nextElementSibling;
  const isOpen = content.classList.contains('accordion-open');
  // Close all accordions in the same group
  const group = header.closest('.accordion-group');
  if (group) {
    group.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('accordion-open'));
    group.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('active'));
  }
  if (!isOpen) {
    content.classList.add('accordion-open');
    header.classList.add('active');
  }
}
