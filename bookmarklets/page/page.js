/**
 * A11Y Auditor — Página: renderiza las tarjetas de bookmarklets
 * Consume window.A11Y_BOOKMARKLETS generado por build.js
 */

(function () {
  'use strict';

  var grid = document.getElementById('tools-grid');
  var fallback = document.getElementById('fallback-msg');

  if (!window.A11Y_BOOKMARKLETS || window.A11Y_BOOKMARKLETS.length === 0) {
    if (grid) grid.innerHTML = '';
    if (fallback) fallback.hidden = false;
    return;
  }

  var html = '';
  window.A11Y_BOOKMARKLETS.forEach(function (tool) {
    html +=
      '<article class="tool-card" role="listitem">' +
        '<div class="card-header">' +
          '<div class="card-icon" aria-hidden="true">' + escapeHtml(tool.icon || '◈') + '</div>' +
          '<h3 class="card-title">' + escapeHtml(tool.label) + '</h3>' +
        '</div>' +
        '<p class="card-description">' + escapeHtml(tool.description) + '</p>' +
        '<a href="' + tool.url + '" class="bookmarklet-link" ' +
           'draggable="true" ' +
           'title="Arrastra este enlace a tu barra de favoritos para instalar: ' + escapeHtml(tool.label) + '" ' +
           'aria-label="Instalar bookmarklet: ' + escapeHtml(tool.label) + ' (arrastra a favoritos)">' +
          '<span class="link-drag-icon" aria-hidden="true">⊕</span>' +
          escapeHtml(tool.label) +
        '</a>' +
        '<span class="drag-hint" aria-hidden="true">← arrastra a favoritos</span>' +
      '</article>';
  });

  grid.innerHTML = html;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
