/**
 * A11Y AUDITOR — Overlays
 * Coloca badges e indicadores visuales sobre los elementos de la página.
 */

var A11yOverlay = (function () {
  var badges = [];
  var highlights = [];
  var elementMap = [];

  /**
   * Añade un overlay sobre un elemento del DOM.
   * @param {number} index - Índice del issue (para conectar con el panel)
   * @param {Element} element - Elemento del DOM
   * @param {'error'|'warning'|'pass'} type
   * @param {string} label - Texto del badge
   */
  function add(index, element, type, label) {
    if (!element || !document.body.contains(element)) return;

    // Aplicar clase de resaltado al propio elemento
    element.classList.add('a11y-overlay-highlight', type);
    highlights.push({ el: element, type: type });
    elementMap[index] = element;

    // Crear badge flotante
    var badge = document.createElement('div');
    badge.className = 'a11y-overlay-badge ' + type;
    badge.textContent = label;
    badge.setAttribute('aria-hidden', 'true');

    positionBadge(badge, element);
    document.body.appendChild(badge);
    badges.push(badge);

    // Reposicionar al hacer scroll o resize
    var reposition = function () { positionBadge(badge, element); };
    window.addEventListener('scroll', reposition, { passive: true });
    window.addEventListener('resize', reposition, { passive: true });
  }

  /**
   * Elimina todos los overlays de la página.
   */
  function clearAll() {
    badges.forEach(function (b) { b.remove(); });
    highlights.forEach(function (h) {
      h.el.classList.remove(
        'a11y-overlay-highlight', 'a11y-overlay-hover',
        'error', 'warning', 'pass'
      );
    });
    badges = [];
    highlights = [];
    elementMap = [];
  }

  /**
   * Muestra u oculta todos los badges.
   * @param {boolean} visible
   */
  function toggle(visible) {
    badges.forEach(function (b) {
      b.style.display = visible ? '' : 'none';
    });
    highlights.forEach(function (h) {
      if (visible) {
        h.el.classList.add('a11y-overlay-highlight');
      } else {
        h.el.classList.remove('a11y-overlay-highlight');
      }
    });
  }

  /**
   * Resalta temporalmente el elemento correspondiente a un issue.
   * @param {number} index
   * @param {boolean} active
   */
  function highlight(index, active) {
    var el = elementMap[index];
    if (!el) return;
    if (active) {
      el.classList.add('a11y-overlay-hover');
    } else {
      el.classList.remove('a11y-overlay-hover');
    }
  }

  /**
   * Hace scroll hasta el elemento correspondiente a un issue.
   * @param {number} index
   */
  function scrollTo(index) {
    var el = elementMap[index];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    highlight(index, true);
    setTimeout(function () { highlight(index, false); }, 1500);
  }

  // --- Helpers ---

  /**
   * Posiciona un badge en la esquina superior izquierda del elemento destino.
   */
  function positionBadge(badge, element) {
    var rect = element.getBoundingClientRect();
    var scrollX = window.scrollX || window.pageXOffset;
    var scrollY = window.scrollY || window.pageYOffset;
    badge.style.position = 'absolute';
    badge.style.top = (rect.top + scrollY) + 'px';
    badge.style.left = (rect.left + scrollX) + 'px';
  }

  return { add: add, clearAll: clearAll, toggle: toggle, highlight: highlight, scrollTo: scrollTo };
})();
