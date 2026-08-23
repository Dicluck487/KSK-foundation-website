// public/js/stat-counter.js
// Animates any element with class="stat-number" from 0 up to its original
// value (parsed from its text, so "60+", "400+", "1,200" all work as-is).
// Triggers when the element scrolls into view, plays once.

document.addEventListener('DOMContentLoaded', function () {
  var counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  function parseValue(text) {
    var match = text.trim().match(/^([\d,]+)(.*)$/);
    if (!match) return null;
    return {
      numeric: parseInt(match[1].replace(/,/g, ''), 10),
      suffix: match[2] || '',
    };
  }

  function animateCounter(el) {
    var parsed = parseValue(el.dataset.rawValue);
    if (!parsed || isNaN(parsed.numeric)) return;

    if (prefersReducedMotion) {
      el.textContent = parsed.numeric + parsed.suffix;
      return;
    }

    var target = parsed.numeric;
    var suffix = parsed.suffix;
    var duration = 3400; // ms
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = Math.floor(eased * target);

      el.textContent = progress < 1
        ? Math.max(current, 0)
        : target + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // Store each element's original text, then blank it to "0" until it animates.
  counters.forEach(function (el) {
    el.dataset.rawValue = el.textContent.trim();
    el.textContent = '0';
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach(function (el) {
    observer.observe(el);
  });
});
