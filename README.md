# A11Y Auditor

Kit de **bookmarklets gratuitos** para auditar la accesibilidad web ([WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/)) de cualquier página en tiempo real.

Ejecuta los análisis directamente desde tu navegador y obtén:
- 🎨 **Panel visual** con errores, avisos y verificaciones correctas
- 💾 **JSON exportable** para compartir resultados con un LLM
- ⚡ **Cero dependencias** (excepto axe-core, que se carga desde CDN)

---

## ¿Qué hace?

Cada bookmarklet se especializa en un aspecto diferente de la accesibilidad:

| Herramienta | Qué analiza |
|------------|-----------|
| **Headings** | Jerarquía h1-h6, niveles saltados, headings vacíos, múltiples H1 |
| **Axe-core** | Auditoría completa WCAG 2.1 usando el motor de Deque |
| **Imágenes** | Alt text ausente/vacío/largo, SVGs sin nombre accesible |
| **Contraste** | Ratio de colores (AA 4.5:1, AAA 7:1) |
| **Links** | Texto genérico, enlaces sin destino, nuevas pestañas sin aviso |
| **Formularios** | Labels asociados, fieldsets, autocomplete, botones sin texto |
| **Landmarks** | Regiones ARIA (main, nav, header), duplicados sin label |

---

## Instalación rápida

### 1. Obtén los bookmarklets

Abre [`page/index.html`](./page/index.html) en tu navegador.

> Si accedes desde local (`file://`), primero ejecuta:
> ```bash
> # Desde la carpeta bookmarklets/
> node build.js
> ```

### 2. Arrastra a favoritos

En la página verás 7 tarjetas. **Arrastra cada enlace a tu barra de favoritos** del navegador.

### 3. ¡Usa los bookmarklets!

1. Navega a cualquier página web
2. Haz clic en el bookmarklet que quieras ejecutar
3. Aparecerá un **panel lateral** con los resultados
4. Haz clic en **"Copiar JSON"** para obtener el informe completo

---

## Ejemplo de uso

### 1. Panel visual

Cuando ejecutas un bookmarklet, aparece un panel a la derecha de la pantalla:

```
╔════════════════════════╗
║  A11Y AUDITOR         ║
║  Headings             ║
╠════════════════════════╣
║  ✗ 2  ⚠ 1  ✓ 5      ║
╠════════════════════════╣
║ Errores                ║
│ · Nivel saltado H2→H4  │
│ · H1 vacío             │
│ Advertencias           ║
│ · Múltiple H1          ║
╚════════════════════════╝
```

**Al pasar el ratón sobre un ítem**, el elemento correspondiente en la página se resalta en tiempo real.

### 2. Resultado JSON

Cuando presionas "Copiar JSON", obtienes esto:

```json
{
  "tool": "headings",
  "url": "https://ejemplo.com",
  "timestamp": "2026-03-07T12:00:00.000Z",
  "summary": {
    "errors": 2,
    "warnings": 1,
    "passes": 5,
    "total": 8
  },
  "issues": [
    {
      "severity": "error",
      "message": "Nivel saltado: H2 → H4",
      "selector": "body > main > div > h4",
      "element": "<h4 class='subtitle'>...<\/h4>",
      "wcag": "1.3.1"
    }
  ]
}
```

**Pega este JSON en tu LLM favorito** (ChatGPT, Claude, etc.) para obtener recomendaciones de corrección.

---

## Estructura del proyecto

```
bookmarklets/
├── build.js                ← Ejecuta esto para compilar
├── src/
│   ├── shared/             ← Módulo compartido por todos los bookmarklets
│   │   ├── panel.js        ← Panel lateral (UI)
│   │   ├── panel.css
│   │   ├── overlay.js      ← Indicadores visuales sobre la página
│   │   ├── overlay.css
│   │   └── output.js       ← Generación de JSON
│   ├── headings/
│   ├── axe/
│   ├── images/
│   ├── contrast/
│   ├── links/
│   ├── forms/
│   └── landmarks/     ← Cada uno tiene .js + .css
└── page/
    ├── index.html          ← Página de instalación
    ├── page.css            ← Estilos de la página
    ├── page.js             ← Renderiza las tarjetas
    ├── bookmarklets.json   ← Generado por build.js
    └── bookmarklets-data.js ← Generado por build.js
```

---

## Desarrollo

### Compilar los bookmarklets

```bash
cd bookmarklets
node build.js
```

Esto genera:
- `page/bookmarklets.json` — Datos en JSON
- `page/bookmarklets-data.js` — Datos embebidos en JS (consumido por `index.html`)

Cada bookmarklet se comprime a **~35 KB** (incluyendo CSS y dependencias compartidas).

### Añadir un nuevo bookmarklet

1. **Crea la carpeta**: `src/mi-herramienta/`
2. **Crea los archivos**:
   ```
   src/mi-herramienta/
   ├── mi-herramienta.js
   └── mi-herramienta.css
   ```

3. **Codifica la lógica** (ver ejemplos en `headings.js`, `images.js`, etc.)

4. **Registra en `build.js`**: Añade una entrada en el array `TOOLS` al principio del script:
   ```javascript
   { 
     id: 'mi-herramienta',
     label: 'Mi Herramienta',
     description: 'Qué analiza',
     icon: '⚙'
   }
   ```

5. **Compila**: `node build.js`

### Patrón de desarrollo

Cada bookmarklet sigue este patrón:

```javascript
(function () {
  'use strict';
  
  var TOOL_NAME = 'Nombre de mi análisis';
  var issues = [];
  
  // 1. Buscar elementos en el DOM
  var elements = document.querySelectorAll('...');
  
  // 2. Analizar y crear issues
  elements.forEach(function (el) {
    issues.push({
      severity: 'error|warning|pass',
      message: 'Descripción del problema',
      selector: A11yOutput.getSelector(el),
      element: A11yOutput.getElementHtml(el),
      wcag: '1.3.1'  // Criterio WCAG
    });
    A11yOverlay.add(issues.length - 1, el, 'error', 'etiqueta corta');
  });
  
  // 3. Generar salida
  var summary = A11yOutput.buildSummary(issues);
  A11yOutput.set(TOOL_NAME, issues, summary);
  A11yPanel.create(TOOL_NAME, issues, summary);
})();
```

### API disponible

**Panel lateral:**
```javascript
A11yPanel.create(toolName, issues, summary);
A11yPanel.toast('Mensaje flotante');
A11yPanel.destroy();
```

**Overlays (indicadores visuales):**
```javascript
A11yOverlay.add(index, element, type, label);
A11yOverlay.toggle(visible);
A11yOverlay.highlight(index, active);
A11yOverlay.scrollTo(index);
```

**JSON y consola:**
```javascript
A11yOutput.set(toolName, issues, summary, extra);
A11yOutput.copy(); // Copiar al portapapeles
A11yOutput.buildSummary(issues);
A11yOutput.getSelector(element);
A11yOutput.getElementHtml(element);
```

---

## Decisiones de diseño

### Vanilla JavaScript (sin frameworks)

- ✅ Funciona en cualquier navegador (IE11+ con ajustes)
- ✅ Mínimo peso (~35 KB por bookmarklet)
- ✅ Sin dependencias excepto axe-core
- ✅ Fácil de debuguear

### CSS separado en desarrollo

- Los archivos `.css` se mantienen legibles durante el desarrollo
- Al compilar, `build.js` los minifica e inyecta como `<style>` dentro del bookmarklet
- Esto permite trabajar con herramientas de desarrollo del navegador de forma normal

### axe-core desde CDN

- El bookmarklet de Axe-core carga la librería desde CDNJS
- Reduce el tamaño del código generado
- Los usuarios deben tener conexión a internet (se detecta con un toast si falla)

### Esquema JSON unificado

Todos los bookmarklets devuelven el mismo formato para que un LLM pueda procesarlos con un único prompt:

```
{
  tool: string
  url: string
  timestamp: ISO8601
  summary: { errors, warnings, passes, total }
  issues: Array<{ severity, message, selector, element, wcag }>
  extra: Object (específico de cada bookmarklet)
}
```

---

## Compatibilidad

| Navegador | Soporte |
|-----------|---------|
| Chrome/Edge | ✅ 90+ |
| Firefox | ✅ 88+ |
| Safari | ✅ 14+ |
| IE 11 | ⚠️ Con polyfills |

Los bookmarklets funcionan incluso en sitios HTTPS con restricciones CSP (no inyectan script externo, solo estilos e iframes).

---

## Referencias

- [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/) — Pautas de Accesibilidad Web
- [Axe DevTools](https://www.deque.com/axe/devtools/) — Motor de auditoría WCAG
- [MDN: ARIA](https://developer.mozilla.org/es/docs/Web/Accessibility/ARIA) — Atributos accesibles

---

## Licencia

Código abierto. Úsalo, modifica, comparte.

---

## Desarrollo futuro

Ideas para nuevos bookmarklets:

- **Texto alternativo multilista** — Valida alt text contra listas de palabras prohibidas
- **Orden de lectura** — Verifica el orden lógico del contenido por teclado
- **Estructura semántica** — Análisis profundo de HTML semántico
- **Colores y patrones** — Información no transmitida solo por color
- **Fuentes y espaciado** — Tamaños de texto, interlineado, espaciado de letras

---

## Preguntas frecuentes

### ¿Por qué no funciona en mi sitio?

Comprueba:
1. ¿Abriste la consola del navegador? (F12) — busca errores rojos
2. ¿El sitio tiene Content Security Policy? Algunos bookmarklets pueden estar bloqueados
3. ¿La página cargó completamente? Algunos análisis necesitan que el DOM esté listo

### ¿Cómo comparto los resultados?

El JSON se copia automáticamente al portapapeles. Puedes:
- Pegarlo en un LLM (ChatGPT, Claude, etc.)
- Guardarlo en un archivo `.json` para referencia
- Insertarlo en un reporte HTML/Markdown

### ¿Qué significa "WCAG 1.4.3"?

WCAG 2.1 tiene este formato: `X.Y.Z`

- **X** — Pilares (1. Perceptible, 2. Operable, 3. Comprensible, 4. Robusto)
- **Y** — Directrices dentro del pilar
- **Z** — Criterio específico de éxito

`1.4.3` = Pillar 1 (Perceptible) → Directriz 4 (Distinguible) → Criterio 3 (Contraste).

Lee la [guía completa de WCAG](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html).

---

**Mantén la web accesible para todos.**
