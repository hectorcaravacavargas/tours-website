# CODE REVIEW EXHAUSTIVO — NIVEL SENIOR/STAFF ENGINEER
## Tour de Caballos El Abanico
**Fecha:** 24 de marzo de 2026
**Stack:** React 19.2.4 + Vite 8.0.1 + Tailwind CSS v4 + i18next 25.10.5
**Archivos analizados:** 24 archivos (JSX, JS, JSON, CSS, HTML, config)
**Metodología:** OWASP Top 10 · React Best Practices · WCAG 2.1 · Clean Code · SOLID

---

## PUNTUACIÓN GLOBAL

| Categoría | Puntuación | Estado |
|---|---|---|
| Seguridad | 6.0 / 10 | Vulnerabilidades críticas |
| Calidad de código | 8.0 / 10 | Muy bueno |
| Performance | 8.0 / 10 | Muy bueno |
| Buenas prácticas React | 9.0 / 10 | Excelente |
| Escalabilidad | 7.0 / 10 | Mejorable |
| Accesibilidad técnica | 7.0 / 10 | Mejorable |
| Legibilidad | 8.5 / 10 | Muy bueno |
| Deuda técnica | 6.5 / 10 | Moderada |

### PUNTUACIÓN TOTAL: **7.5 / 10 — Código profesional con vulnerabilidades críticas de seguridad**

> **Diagnóstico:** El codebase muestra una estructura limpia, React bien utilizado y patrones modernos consistentes. Sin embargo, expone datos sensibles directamente en el código fuente (coordenadas GPS, número de teléfono, email personal) lo cual es inaceptable antes de un despliegue público. Resolver la seguridad es la prioridad #1 absoluta.

---

## RESUMEN EJECUTIVO DE HALLAZGOS

| Severidad | Cantidad | Categoría principal |
|---|---|---|
| CRÍTICA | 3 | Seguridad — datos sensibles expuestos |
| ALTA | 4 | Accesibilidad, deuda técnica, código muerto |
| MEDIA | 8 | Performance, escalabilidad, magic numbers |
| BAJA | 11 | Mejores prácticas, legibilidad, minor issues |

---

## ANÁLISIS POR ARCHIVO

---

### `package.json`

#### HALLAZGO 1 — BAJA: Dependencia `shadcn` sin usar
**Línea 29:** `"shadcn": "^4.1.0"` en `devDependencies`

**Problema:** No existe ningún archivo en el proyecto que importe o use componentes de shadcn/ui. Está listada pero es código muerto a nivel de dependencias.

**Impacto:** Aumenta el tamaño de `node_modules` (~2–5 MB), genera confusión a futuros colaboradores y suma tiempo de instalación en CI/CD.

**Solución:**
```bash
npm uninstall shadcn
```

---

### `index.html`

#### HALLAZGO 2 — BAJA: Google Fonts cargado sin Subresource Integrity (SRI)

**Líneas 10–12:**
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display..." rel="stylesheet">
```

**Problema:** Un recurso externo de CDN sin atributo `integrity` podría servir contenido malicioso si la CDN fuera comprometida, sin que el navegador lo detecte.

**Impacto:** Bajo en la práctica (Google Fonts es extremadamente confiable), pero es una gap de Supply Chain Security.

**Solución:** Considerar self-hosting de las fuentes via `@fontsource` (paquetes npm):
```bash
npm install @fontsource/playfair-display @fontsource/inter
```
```css
/* src/index.css */
@import '@fontsource/playfair-display/400.css';
@import '@fontsource/playfair-display/700.css';
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/600.css';
```
Ventajas adicionales: sin latencia de DNS externa, GDPR más limpio, funciona offline.

---

### `vite.config.js`

#### HALLAZGO 3 — BAJA: Sin configuración explícita de build

**Problema:** No hay sección `build` configurada. Vite usa defaults razonables, pero para producción se recomienda ser explícito con:

```javascript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    sourcemap: false,               // No exponer sourcemaps en prod
    chunkSizeWarningLimit: 500,     // Avisar si chunks superan 500 KB
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          i18n: ['i18next', 'react-i18next'],
        },
      },
    },
  },
})
```

**Impacto:** Sin manualChunks, React + i18next + app van en un solo bundle. Separar vendor chunks mejora cache hits en navegadores de usuarios recurrentes.

---

### `eslint.config.js`

#### HALLAZGO 4 — MEDIA: Regla `no-unused-vars` con patrón peligroso

**Línea 26:**
```javascript
'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }]
```

**Problema:** Este patrón silencia warnings para cualquier variable que empiece con mayúscula. En React, eso incluye todos los componentes importados. Un import con typo nunca generará advertencia:

```javascript
// Esto NO generará warning aunque Gallery nunca se use:
import { Galleri } from './components/Gallery'  // typo
```

**Impacto:** Medio — puede ocultar imports obsoletos y acumular deuda técnica silenciosamente.

**Solución:**
```javascript
// Patrón más restrictivo: solo ignorar variables con _ prefijo (convención explícita)
'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }]
```

---

### `src/main.jsx`

**Estado:** ✅ Sin hallazgos. Implementación correcta y moderna.
- `StrictMode` habilitado correctamente
- `createRoot` (API React 18+) correctamente usado
- Import de i18n antes de App garantiza inicialización correcta

---

### `src/index.css`

#### HALLAZGO 5 — ALTA: Sin `prefers-reduced-motion`

**Problema:** El archivo define 4 keyframe animations (`slideDown`, `slideUp`, `blurFade`, `progress`) y varios componentes usan `animate-bounce`. Ninguna animación respeta la preferencia del sistema operativo del usuario.

**Usuarios afectados:** Personas con epilepsia fotosensible, vértigo vestibular, mareos causados por movimiento en pantalla.

**Cumplimiento:** WCAG 2.1 criterio 2.3.3 (AAA) y recomendación 2.3.1 (AA).

**Solución — añadir al final de index.css:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

### `src/app/App.jsx`

**Estado:** ✅ Sin hallazgos. Separación limpia entre `App` y `AppContent`. Correcto orden de proveedores.

---

### `src/app/providers/AppProviders.jsx`

#### HALLAZGO 6 — BAJA: Solo envuelve ThemeProvider

**Problema:** El componente existe para centralizar providers, pero solo envuelve `ThemeProvider`. El provider de i18n se inicializa en `main.jsx` de forma imperativa, no como provider React. Esto es funcional pero inconsistente con el patrón establecido.

**Impacto:** Muy bajo. No genera errores.

**Mejora de cohesión (opcional):**
```jsx
// AppProviders.jsx
import { Suspense } from 'react'
import { ThemeProvider } from '../features/theme/context/ThemeContext'

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <Suspense fallback={<div>Loading...</div>}>
        {children}
      </Suspense>
    </ThemeProvider>
  )
}
```
El `<Suspense>` es recomendado por i18next para manejar el estado de carga de traducciones.

---

### `src/app/components/Navbar.jsx`

#### HALLAZGO 7 — BAJA: Link `/tours` apunta a ruta inexistente

**Línea 7 (NAV_LINKS array):**
```javascript
{ key: 'nav.tours', href: '/tours' }
```

**Problema:** La app es Single Page Application sin React Router. El href `/tours` causará una navegación completa del navegador a `/tours`, que devuelve 404 en producción (solo existe `index.html`).

**Solución:** Cambiar a anchor hash `#tours` igual que las demás secciones:
```javascript
{ key: 'nav.tours', href: '#tours' }
```

#### HALLAZGO 8 — BAJA POSITIVA: Passive event listener implementado correctamente

**Línea 54:**
```javascript
window.addEventListener('scroll', onScroll, { passive: true })
```
El flag `{ passive: true }` es excelente — indica al navegador que el listener nunca llamará `preventDefault()`, permitiendo scroll más fluido en móviles. Muy buena práctica.

#### HALLAZGO 9 — BAJA: Umbral de scroll hardcodeado como magic number

**Línea 43:**
```javascript
if (Math.abs(current - lastScrollY.current) < 6) return
```

El `6` es un magic number. Su propósito (evitar micro-movimientos) no es obvio.

**Solución:**
```javascript
const SCROLL_THRESHOLD_PX = 6 // Ignore micro-movements below this threshold
if (Math.abs(current - lastScrollY.current) < SCROLL_THRESHOLD_PX) return
```

---

### `src/app/components/Hero.jsx`

#### HALLAZGO 10 — MEDIA: Imágenes sin `loading` attribute

**Líneas 17, 28, 119:** Tres `<img>` sin `loading` attribute.

```jsx
// Actual:
<img src={image1} className="..." alt="..." />

// Correcto:
// Imagen central (probable LCP - Largest Contentful Paint):
<img src={image1} fetchpriority="high" alt="..." />

// Imágenes decorativas laterales (solo visibles en desktop):
<img src={image2} loading="lazy" alt="..." />
<img src={image3} loading="lazy" alt="..." />
```

**Impacto:** Con imágenes reales (no placeholder), esto afectará directamente el score de Core Web Vitals (LCP).

#### HALLAZGO 11 — BAJA: `focus:outline-none` en botón de scroll

**Línea 88 (aproximada):**
```jsx
className="... focus:outline-none ..."
```

**Problema:** Elimina completamente el indicador de focus. Un usuario navegando con teclado pierde toda indicación visual de dónde está el foco.

**Solución:**
```jsx
className="... focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ..."
```
`focus-visible` solo muestra el ring cuando se navega con teclado, no con mouse. Solución correcta.

---

### `src/app/components/Tours.jsx`

#### HALLAZGO 12 — ALTA: Precio, duración y grupo hardcodeados en JSX

**Líneas 154, 161, 187:**
```jsx
// Línea 154 - duración hardcodeada:
<strong className="...">2 hrs</strong>

// Línea 161 - grupo hardcodeado:
2–20<br />{t('tours.card.people')}

// Línea 187 - PRECIO hardcodeado:
<span className="font-heading text-3xl font-bold text-forest-600">$50</span>
```

**Problema crítico:** El precio ($50), duración (2 hrs) y tamaño de grupo (2–20) son información comercial que cambia frecuentemente. Están directamente en el JSX, lo que significa que **cambiar el precio requiere modificar código fuente, hacer commit, rebuild y redeploy**.

**Impacto:** Alto para mantenibilidad. Error común que crea deuda técnica acumulable.

**Solución — crear archivo de configuración:**
```javascript
// src/config/tourConfig.js
export const TOUR_CONFIG = {
  price: {
    adult: 50,
    child: 35,
    currency: 'USD',
  },
  duration: '2 hrs',
  groupSize: { min: 2, max: 20 },
  location: {
    type: 'Natural Farm',
    name: 'Finca El Abanico',
  },
}
```

```jsx
// Tours.jsx - importar y usar
import { TOUR_CONFIG } from '../../config/tourConfig'

<span>${TOUR_CONFIG.price.adult}</span>
<strong>{TOUR_CONFIG.duration}</strong>
```

#### HALLAZGO 13 — MEDIA: SVG filter con ID global potencialmente duplicable

**Línea 80:**
```jsx
<filter id="foldShadow">
```

**Problema:** Los IDs de SVG filters son globales en el DOM. Si `Tours.jsx` se renderizara más de una vez, habría dos elementos con `id="foldShadow"` y el segundo sobreescribiría al primero silenciosamente.

**Contexto actual:** Tours se renderiza una sola vez — sin impacto presente.

**Solución preventiva:**
```jsx
// Usar un ID único por instancia
const filterId = useId() // Hook de React 18+

<filter id={`foldShadow-${filterId}`}>
  ...
</filter>
<path filter={`url(#foldShadow-${filterId})`} ... />
```

#### HALLAZGO 14 — MEDIA: Íconos SVG definidos como funciones dentro del componente

**Líneas ~60–110:** `ClockIcon`, `GroupIcon`, `FarmIcon`, `ArrowIcon` se definen como funciones dentro de `Tours` y se recrean en cada render.

**Impacto:** Muy bajo en términos de CPU (funciones simples), pero acumula complejidad visual en el archivo.

**Solución:**
```jsx
// src/app/components/icons/TourIcons.jsx
export const ClockIcon = () => (
  <svg ...>...</svg>
)
// Importar en Tours.jsx: import { ClockIcon, GroupIcon } from '../icons/TourIcons'
```

---

### `src/app/components/Gallery.jsx`

#### HALLAZGO 15 — BAJA POSITIVA: Cleanup de intervalo implementado correctamente

**Líneas 41–47:**
```javascript
useEffect(() => {
  if (hovering) return
  intervalRef.current = setInterval(() => {
    setCurrent((c) => (c + 1) % SLIDES.length)
  }, SLIDE_DURATION)
  return () => clearInterval(intervalRef.current) // ✅ cleanup
}, [current, hovering])
```

Excelente uso del cleanup. Evita memory leaks y efectos fantasma. El uso de `useRef` para el ID del intervalo evita re-renders innecesarios.

#### HALLAZGO 16 — MEDIA: `key` dinámico fuerza re-mount del elemento

**Línea 143:**
```jsx
key={`${current}-${hovering}`}
```

**Problema:** Cambiar el `key` de un elemento causa que React lo **desmonte y vuelva a montar completamente** en lugar de actualizar. Aquí se usa para resetear la animación CSS de la barra de progreso — es un hack funcional pero poco obvio.

**Impacto:** La animación funciona correctamente, pero el patrón confunde a otros desarrolladores.

**Solución más clara:**
```jsx
// Usar animationKey separado para la barra de progreso
// y un comentario explicativo:
{/* key changes force remount to restart the CSS progress animation */}
<div
  key={`progress-${current}`}  // Solo el slide current como key, no hovering
  className="h-full bg-forest-400"
  style={{ animation: `progress ${SLIDE_DURATION}ms linear` }}
/>
```

#### HALLAZGO 17 — MEDIA: `focus:outline-none` en botones de navegación

**Líneas ~107, ~118:**
```jsx
className="... focus:outline-none ..."
```

Mismo problema que en Hero.jsx — elimina indicador de focus para usuarios de teclado.

**Solución:** `focus-visible:ring-2 focus-visible:ring-white`

---

### `src/app/components/About.jsx`

#### HALLAZGO 18 — BAJA: Tres imágenes idénticas (placeholder)

**Líneas 5–7:**
```javascript
import aboutImg1 from '../../assets/hero.png'
import aboutImg2 from '../../assets/hero.png'
import aboutImg3 from '../../assets/hero.png'
```

**Problema:** Tres imports del mismo archivo. En producción, cuando lleguen las imágenes reales, hay que recordar actualizar los tres imports en lugares separados.

**Estado actual:** Documentado con comentarios, no es un bug.

**Mejora:**
```javascript
// src/config/assets.js
export const ASSETS = {
  hero: {
    left: () => import('../assets/hero-left.jpg'),
    center: () => import('../assets/hero-center.jpg'),
    right: () => import('../assets/hero-right.jpg'),
  },
  about: {
    portrait: () => import('../assets/about-portrait.jpg'),
    mid1: () => import('../assets/about-mid1.jpg'),
    mid2: () => import('../assets/about-mid2.jpg'),
  },
}
```

---

### `src/app/components/Location.jsx`

#### HALLAZGO 19 — CRÍTICA: Coordenadas GPS hardcodeadas en código fuente

**Línea 3:**
```javascript
const DESTINATION = '10.4266613,-84.5951054'
```

**Problema de seguridad:** Las coordenadas GPS exactas de la finca están expuestas directamente en el código fuente JavaScript que se sirve al navegador. Cualquier persona puede:
1. Abrir DevTools → Sources → encontrar el archivo
2. Si el repositorio es público, verlas en GitHub
3. Usarlas para ubicar la propiedad física con precisión de metros

**Riesgo:** Para una propiedad privada en zona rural de Costa Rica, exponer coordenadas exactas puede representar un riesgo de seguridad física (robos, intrusiones).

**Solución inmediata:**
```bash
# .env.local (NO commitear, añadir a .gitignore)
VITE_MAPS_DESTINATION=10.4266613,-84.5951054
VITE_MAPS_EMBED_URL=https://maps.google.com/maps?q=10.4266613,-84.5951054&z=14&output=embed
```

```javascript
// Location.jsx
const DESTINATION = import.meta.env.VITE_MAPS_DESTINATION
const MAPS_EMBED = import.meta.env.VITE_MAPS_EMBED_URL
```

```bash
# .gitignore — verificar que existe esta línea:
.env.local
.env*.local
```

#### HALLAZGO 20 — MEDIA: `getCurrentPosition()` sin timeout

**Líneas 6–28:**
```javascript
navigator.geolocation.getCurrentPosition(
  ({ coords }) => { ... },
  () => { ... }
  // Falta: options con timeout
)
```

**Problema:** Sin timeout, `getCurrentPosition` puede quedar pendiente indefinidamente si el usuario no responde al prompt de permisos o si la señal GPS es débil.

**Solución:**
```javascript
navigator.geolocation.getCurrentPosition(
  ({ coords }) => { ... },
  () => { ... },
  {
    timeout: 10000,          // Máximo 10 segundos
    maximumAge: 300000,      // Aceptar posición cacheada de hasta 5 minutos
    enableHighAccuracy: false // No necesitamos precisión GPS alta
  }
)
```

#### HALLAZGO 21 — BAJA: iframe de Google Maps sin `sandbox`

**Líneas 109–116:**
```jsx
<iframe
  src={MAPS_EMBED}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
  title="Finca El Abanico location"
/>
```

**Problema:** El atributo `sandbox` restringe qué puede hacer el contenido del iframe. Sin él, el iframe tiene más permisos de los necesarios.

**Solución:**
```jsx
<iframe
  src={MAPS_EMBED}
  sandbox="allow-scripts allow-same-origin"
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
  title="Finca El Abanico location"
/>
```

---

### `src/app/components/FAQ.jsx`

#### HALLAZGO 22 — MEDIA: Falta cleanup de timeout al desmontar

**Línea 23:**
```javascript
const timerRef = useRef(null)
```

**Problema:** Si el componente FAQ se desmonta mientras hay un timeout de animación pendiente (220ms), el timeout intentará actualizar el estado de un componente desmontado.

**Contexto actual:** FAQ nunca se desmonta en esta app (está en App.jsx de forma permanente). No genera error presente.

**Solución preventiva (buena práctica):**
```javascript
// Añadir al componente FAQ:
useEffect(() => {
  return () => clearTimeout(timerRef.current) // Cleanup al desmontar
}, [])
```

#### HALLAZGO 23 — MEDIA: Componente `Item` definido dentro de `FAQ`

**Líneas ~46–83:** El componente interno `Item` se define dentro del scope de `FAQ`.

**Problema:** React recrea la definición de `Item` en cada render de `FAQ`. Si `FAQ` se re-renderiza por cualquier razón, React tratará `Item` como un componente diferente, desmontará y remontará todos los items del FAQ (perdiendo estado de animación).

**Solución:**
```jsx
// Extraer a archivo separado o al menos fuera del componente padre:
// src/app/components/FAQItem.jsx

function FAQItem({ question, answer }) {
  const [openIdx, setOpenIdx] = useState(null)
  // ...
}

// FAQ.jsx
import { FAQItem } from './FAQItem'
```

---

### `src/app/components/Footer.jsx`

#### HALLAZGO 24 — CRÍTICA: Número de teléfono personal hardcodeado

**Línea 14:**
```javascript
const WA_NUMBER = '50688804133'
```

**Problema:** Número de teléfono real expuesto en código fuente. Si el repositorio es público o el código es accesible, el número queda indexado por bots de spam y scrapers.

**Solución:**
```bash
# .env.local
VITE_WA_NUMBER=50688804133
```

```javascript
// Footer.jsx
const WA_NUMBER = import.meta.env.VITE_WA_NUMBER
```

#### HALLAZGO 25 — CRÍTICA: Email personal del desarrollador expuesto

**Línea 110:**
```jsx
<p className="text-gray-400 text-xs mt-0.5">hcaravacvargas@gmail.com</p>
```

**Problema:** Email personal del desarrollador visible en producción. Cualquier bot de scraping lo indexará para spam. Además, es un email personal en un sitio de negocio — mala práctica profesional.

**Solución:**
```bash
# .env.local
VITE_CONTACT_EMAIL=contacto@tourdecaballosElabanico.com
```

```jsx
// Footer.jsx
<p className="text-gray-400 text-xs mt-0.5">
  {import.meta.env.VITE_CONTACT_EMAIL}
</p>
```

#### HALLAZGO 26 — BAJA POSITIVA: `encodeURIComponent` correctamente usado

**Líneas 25–27:**
```javascript
const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  WA_MSG[i18n.language] ?? WA_MSG.en
)}`
```

Excelente. Usa `encodeURIComponent` para sanitizar el mensaje antes de incluirlo en la URL. Previene URL injection. El nullish coalescing `??` como fallback a inglés también es correcto.

#### HALLAZGO 27 — BAJA: Magic number en timeout del overlay

**Línea 33:**
```javascript
setTimeout(() => setOverlay(false), 700)
```

El `700` debe coincidir exactamente con la duración de la animación `blurFade` en `index.css`. Si uno cambia y el otro no, el overlay puede cerrarse antes o después de que termine la animación.

**Solución — centralizar en una constante:**
```javascript
// src/config/animations.js
export const ANIM = {
  blurFade: 700,
  faqSlide: 220,
  gallerySlide: 700,
  galleryAutoplay: 5500,
}

// Footer.jsx
import { ANIM } from '../../config/animations'
setTimeout(() => setOverlay(false), ANIM.blurFade)
```

---

### `src/features/theme/context/ThemeContext.jsx`

#### HALLAZGO 28 — BAJA POSITIVA: Inicializador lazy de useState

**Líneas 6–8:**
```javascript
const [theme, setTheme] = useState(
  () => localStorage.getItem('theme') || 'light'
)
```

Uso correcto de la función inicializadora (lazy initial state). Evita que `localStorage.getItem` se ejecute en cada re-render. Solo se ejecuta una vez al montar.

#### HALLAZGO 29 — BAJA POSITIVA: Functional update en setTheme

**Líneas 15–16:**
```javascript
const toggleTheme = () =>
  setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
```

Correcto: usa callback form de setTheme para evitar stale closures. Si `toggleTheme` se pasara como prop a un componente hijo y ese hijo lo llamara múltiples veces seguidas, siempre usaría el valor más reciente de `theme`.

---

### `src/features/theme/hooks/useTheme.js`

#### HALLAZGO 30 — MEDIA: Hook sin validación de contexto

**Líneas 4–6:**
```javascript
export function useTheme() {
  return useContext(ThemeContext)
}
```

**Problema:** Si `useTheme` se usa fuera de `ThemeProvider`, retorna `undefined` silenciosamente, causando errores de tipo `Cannot read properties of undefined (reading 'theme')` en runtime.

**Solución — patrón estándar de validación:**
```javascript
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
```

Este patrón produce errores descriptivos en desarrollo y evita bugs silenciosos.

---

### `src/features/theme/components/ThemeToggle.jsx`

#### HALLAZGO 31 — ALTA: Componente completo nunca utilizado (código muerto)

**Búsqueda global:** Ningún archivo en el proyecto importa o renderiza `ThemeToggle`. El componente existe como código muerto.

**Problema adicional:** El botón tampoco tiene estilos ni aria-label:
```jsx
// Actual — botón desnudo sin accesibilidad:
<button onClick={toggleTheme}>
  {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
</button>
```

**Opciones:**

**A) Eliminar el código muerto:**
```bash
rm src/features/theme/components/ThemeToggle.jsx
rm src/features/theme/hooks/useTheme.js
rm src/features/theme/context/ThemeContext.jsx
# Limpiar AppProviders.jsx de ThemeProvider
# Limpiar @variant dark en index.css
```

**B) Integrar correctamente:**
```jsx
// Navbar.jsx — añadir junto al LanguageToggle
import { ThemeToggle } from '../../features/theme/components/ThemeToggle'

// ThemeToggle.jsx — con estilos y accesibilidad:
<button
  onClick={toggleTheme}
  aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
  className="w-9 h-9 rounded-xl bg-forest-800/60 border border-forest-600/40
             flex items-center justify-center text-white/75 hover:text-white
             transition-colors duration-200"
>
  {theme === 'light' ? <MoonIcon /> : <SunIcon />}
</button>
```

---

### `src/features/i18n/config/i18n.config.js`

#### HALLAZGO 32 — BAJA: Lectura de localStorage sin validación

**Línea 11:**
```javascript
lng: localStorage.getItem('lang') || 'es',
```

**Problema:** Si por alguna razón `localStorage` contuviera un valor inválido (ej: `'zh'`, `'undefined'`, `'null'`), i18next lo aceptaría como idioma, no encontraría traducciones y usaría el fallback silenciosamente.

**Solución — whitelist de idiomas:**
```javascript
const SUPPORTED_LANGS = ['es', 'en']
const savedLang = localStorage.getItem('lang')
const initialLang = SUPPORTED_LANGS.includes(savedLang) ? savedLang : 'es'

i18n.init({
  lng: initialLang,
  // ...
})
```

---

### `src/features/i18n/components/LanguageToggle.jsx`

#### HALLAZGO 33 — MEDIA: Lógica de UI con valores hardcodeados en estilos inline

**Líneas 13–31:**
```javascript
const pill = (w, h, circleSize, margin) => {
  return (
    <button
      style={{
        width: w,
        height: h,
        background: 'rgba(255,255,255,0.15)',
        boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.22)',
        // ...
      }}
    >
```

**Problema:** Mezcla CSS inline con lógica de negocio. Los valores de colores `rgba(255,255,255,0.15)` están duplicados en varios lugares y son difíciles de actualizar consistentemente. No siguen el sistema de design tokens del proyecto (que usa CSS custom properties en `index.css`).

**Impacto:** Medio — si la paleta cambia, hay que buscar y reemplazar valores RGBA manuales.

**Solución:**
```css
/* index.css — añadir tokens para el toggle */
--toggle-bg: rgba(255, 255, 255, 0.15);
--toggle-border: rgba(255, 255, 255, 0.22);
--toggle-circle: #ffffff;
```

```jsx
// LanguageToggle.jsx — usar Tailwind + CSS vars
<button
  className="relative rounded-full bg-white/15 ring-1 ring-inset ring-white/20
             transition-colors duration-300"
  style={{ width: w, height: h }}
>
```

---

### `src/features/i18n/locales/es.json` y `en.json`

#### HALLAZGO 34 — BAJA POSITIVA: Estructura completa y consistente

Ambos archivos tienen exactamente las mismas claves. Las traducciones son de calidad. Cubierto: footer, nav, hero, tours, gallery, about, location, faq.

#### HALLAZGO 35 — MEDIA: Datos de negocio mezclados en traducciones

**`es.json` línea aproximada:**
```json
"locValue": "Finca Natural",
"from": "Desde",
"perPerson": "persona"
```

El precio `$50` no está en los JSON (está hardcodeado en JSX — ver Hallazgo 12), pero otros datos de negocio como la duración y ubicación sí pasan por i18n. Inconsistencia que confunde: ¿dónde vive cada dato?

**Recomendación:** Mover todos los datos dinámicos de negocio (precio, duración, grupo) a `tourConfig.js` y solo los textos de interfaz a los archivos JSON. Separación clara entre configuración y localización.

---

## ANÁLISIS CONSOLIDADO POR CATEGORÍA

---

### SEGURIDAD

**Puntuación: 6.0 / 10**

| # | Severidad | Hallazgo | Archivo | Línea |
|---|---|---|---|---|
| 19 | **CRÍTICA** | Coordenadas GPS expuestas en código | Location.jsx | 3 |
| 24 | **CRÍTICA** | Número de teléfono expuesto | Footer.jsx | 14 |
| 25 | **CRÍTICA** | Email personal expuesto | Footer.jsx | 110 |
| 21 | BAJA | iframe sin `sandbox` attribute | Location.jsx | 109 |
| 2 | BAJA | Google Fonts sin SRI | index.html | 10–12 |

**Los tres puntos CRÍTICOS son todos de la misma naturaleza: datos sensibles hardcodeados en código fuente.**

La solución es crear un archivo `.env.local` (no commitar) y acceder a los valores con `import.meta.env.VITE_*`. Esto toma menos de 30 minutos de trabajo.

---

### BUGS Y ERRORES POTENCIALES

**Puntuación: 8.5 / 10 — El código es muy robusto**

| # | Severidad | Hallazgo | Archivo |
|---|---|---|---|
| 7 | MEDIA | Link `/tours` rompe navegación SPA | Navbar.jsx |
| 22 | BAJA | Falta cleanup de timeout al desmontar | FAQ.jsx |
| 23 | MEDIA | Componente `Item` en scope incorrecto | FAQ.jsx |
| 20 | MEDIA | `getCurrentPosition` sin timeout | Location.jsx |
| 16 | MEDIA | `key` dinámico fuerza re-mount | Gallery.jsx |

No se encontraron race conditions, efectos infinitos, ni null reference crashes reales en el flujo normal de la app.

---

### PERFORMANCE

**Puntuación: 8.0 / 10**

| # | Severidad | Hallazgo | Impacto |
|---|---|---|---|
| 10 | MEDIA | Imágenes sin `loading` attribute | Core Web Vitals (LCP) |
| 17 | MEDIA | `focus:outline-none` en botones | Accesibilidad, no performance |
| 14 | BAJA | Íconos SVG recreados por render | Negligible |
| 3 | BAJA | Sin manualChunks en vite.config | Cache hits en usuarios recurrentes |

**Nota positiva:** El uso de `{ passive: true }` en el scroll listener, `useRef` para intervalos y cleanup correcto en `useEffect` demuestra buen entendimiento de performance en React.

---

### CALIDAD Y LEGIBILIDAD

**Puntuación: 8.0 / 10**

| Aspecto | Estado | Detalle |
|---|---|---|
| Nombres descriptivos | ✅ Excelente | Variables y funciones claras |
| Código duplicado | ⚠️ Bajo | 3 imports idénticos en About.jsx |
| Magic numbers | ⚠️ Presente | 4 instancias sin constantes nombradas |
| Funciones largas | ✅ Bien | Componentes compactos (<200 líneas) |
| Comentarios | ✅ Estratégicos | Donde la lógica no es obvia |
| Separación de concerns | ⚠️ Mejorable | Datos de negocio mezclados con presentación |

---

### MEJORES PRÁCTICAS REACT

**Puntuación: 9.0 / 10 — El punto más fuerte del proyecto**

| Aspecto | Estado | Notas |
|---|---|---|
| Hooks correctamente usados | ✅ Excelente | Sin violaciones de reglas de hooks |
| useEffect con cleanup | ✅ Correcto | Gallery y Navbar correcto. FAQ mejorable |
| Dependencias de useEffect | ✅ Correcto | Arrays de dependencias bien definidos |
| Keys en listas | ✅ Correcto | FAQ usa keys semánticos, Gallery usa índice |
| Lazy initial state | ✅ Correcto | ThemeContext usa función inicializadora |
| Functional updates en setState | ✅ Correcto | Gallery y ThemeContext lo usan |
| React 19 patterns | ✅ Moderno | Sin patrones obsoletos |

---

### ESCALABILIDAD

**Puntuación: 7.0 / 10**

| Aspecto | Estado | Recomendación |
|---|---|---|
| Estructura de carpetas | ✅ Excelente | Feature-based, escalable |
| Configuración centralizada | ❌ Ausente | Crear `src/config/` para datos de negocio |
| Separación datos/UI | ❌ Deficiente | Precio, coords, teléfono en componentes |
| TypeScript | ⚠️ Ausente | Aceptable para proyecto pequeño; considerar al escalar |
| Componentes reutilizables | ✅ Bien | Estructura permite reutilización |
| Testing | ❌ Sin setup | No hay tests ni configuración de testing |

---

### DEUDA TÉCNICA

**Puntuación: 6.5 / 10**

| Tipo | Cantidad | Detalle |
|---|---|---|
| Código muerto | 1 componente | ThemeToggle.jsx — nunca renderizado |
| Dependencia no usada | 1 paquete | shadcn en package.json |
| Imágenes placeholder | 12 referencias | Todas apuntan a hero.png |
| Configuración en JSX | 4 valores | Precio, duración, grupo, distancia |
| CSS inline hardcodeado | 1 componente | LanguageToggle.jsx |
| Falta de tests | Todo | 0% cobertura de tests |

---

## VULNERABILIDADES DE SEGURIDAD — DETALLE OWASP

| OWASP Categoría | Estado | Detalle |
|---|---|---|
| A01: Broken Access Control | ✅ N/A | App pública sin auth |
| A02: Cryptographic Failures | ✅ Bien | HTTPS expected, no secrets en código* |
| A03: Injection | ✅ Bien | No hay SQL/NoSQL, URL sanitizada con encodeURIComponent |
| A04: Insecure Design | ⚠️ Parcial | Datos sensibles en código cliente |
| A05: Security Misconfiguration | ⚠️ Parcial | iframe sin sandbox, sin CSP headers |
| A06: Vulnerable Components | ⚠️ Revisar | Dependencias actualizadas, pero shadcn no usado |
| A07: Auth Failures | ✅ N/A | Sin sistema de auth |
| A08: Software Integrity | ⚠️ Parcial | Sin SRI para recursos externos |
| A09: Logging Failures | ✅ N/A | App frontend |
| A10: SSRF | ✅ N/A | Sin requests server-side |

*Excepción: coordenadas GPS, teléfono y email son datos sensibles en código cliente

---

## ROADMAP DE CORRECCIONES PRIORIZADAS

### BLOQUE 1 — Urgente (< 1 hora de trabajo)

```
1. Crear .env.local con datos sensibles:
   VITE_MAPS_DESTINATION=10.4266613,-84.5951054
   VITE_MAPS_EMBED_URL=...
   VITE_WA_NUMBER=50688804133
   VITE_CONTACT_EMAIL=contacto@elabanico.com

2. Verificar que .env.local está en .gitignore

3. Actualizar Location.jsx línea 3:
   const DESTINATION = import.meta.env.VITE_MAPS_DESTINATION

4. Actualizar Footer.jsx línea 14:
   const WA_NUMBER = import.meta.env.VITE_WA_NUMBER

5. Actualizar Footer.jsx línea 110:
   {import.meta.env.VITE_CONTACT_EMAIL}

6. Corregir href de tours en Navbar.jsx línea 7:
   href: '#tours'  (no '/tours')
```

### BLOQUE 2 — Esta semana

```
7. Añadir prefers-reduced-motion en index.css

8. Reemplazar focus:outline-none en:
   - Hero.jsx
   - Gallery.jsx (botones de navegación)
   → por: focus-visible:ring-2 focus-visible:ring-white

9. Añadir timeout a getCurrentPosition() en Location.jsx

10. Añadir sandbox al iframe en Location.jsx

11. Crear src/config/tourConfig.js y mover:
    - Precio $50
    - Duración "2 hrs"
    - Grupo "2–20"
    - Distancia "14.4 km / 9.0 miles"

12. Añadir cleanup a timerRef en FAQ.jsx:
    useEffect(() => () => clearTimeout(timerRef.current), [])

13. Validar idioma en i18n.config.js:
    const SUPPORTED = ['es', 'en']
    lng: SUPPORTED.includes(localStorage.getItem('lang')) ? ... : 'es'
```

### BLOQUE 3 — Este mes

```
14. Decidir: integrar o eliminar ThemeToggle / dark mode

15. Eliminar shadcn de package.json si no se usa

16. Extraer íconos SVG de Tours.jsx a src/app/components/icons/

17. Extraer componente FAQItem de FAQ.jsx

18. Añadir useId() al SVG filter en Tours.jsx

19. Centralizar constantes de animación en src/config/animations.js

20. Añadir loading="lazy" a imágenes secundarias

21. Considerar self-hosting de Google Fonts (eliminar dependencia externa)

22. Añadir setup de testing (Vitest + React Testing Library)
```

---

## INVENTARIO DE DEUDA TÉCNICA

| Archivo | Tipo de deuda | Esfuerzo estimado |
|---|---|---|
| `Location.jsx:3` | Dato sensible en código | 10 min |
| `Footer.jsx:14` | Dato sensible en código | 5 min |
| `Footer.jsx:110` | Email personal expuesto | 5 min |
| `Navbar.jsx:7` | href roto en SPA | 2 min |
| `index.css` | Sin prefers-reduced-motion | 10 min |
| `Hero.jsx`, `Gallery.jsx` | focus:outline-none | 15 min |
| `FAQ.jsx` | Sin cleanup en desmontar | 5 min |
| `FAQ.jsx` | Componente `Item` inline | 30 min |
| `Location.jsx` | Sin timeout en geolocation | 5 min |
| `Location.jsx` | iframe sin sandbox | 2 min |
| `Tours.jsx` | Precio/duración hardcodeados | 1h |
| `Tours.jsx` | SVG filter ID global | 15 min |
| `ThemeToggle.jsx` | Componente muerto | 30 min (integrar o eliminar) |
| `package.json` | shadcn no usado | 2 min |
| `LanguageToggle.jsx` | CSS inline vs tokens | 1h |
| `i18n.config.js` | Sin validación de idioma | 10 min |

**Deuda total estimada: ~5–6 horas de trabajo**

---

## MÉTRICAS DE CALIDAD FINAL

```
Seguridad:              ██████░░░░  6.0/10  [3 críticos que bloquean deploy]
Calidad de código:      ████████░░  8.0/10  [Sólido, minor issues]
Performance:            ████████░░  8.0/10  [Buena base, optimizable]
Buenas prácticas React: █████████░  9.0/10  [Punto más fuerte]
Escalabilidad:          ███████░░░  7.0/10  [Necesita capa de config]
Accesibilidad técnica:  ███████░░░  7.0/10  [Focus indicators pendientes]
Legibilidad:            ████████░░  8.5/10  [Código claro y limpio]
Deuda técnica:          ██████░░░░  6.5/10  [Moderada, manejable]
```

### PUNTUACIÓN FINAL: **7.5 / 10**

**El código es profesional, moderno y bien estructurado. La arquitectura es sana y los patrones React son correctos. Los únicos bloqueadores reales para un deploy seguro son los 3 hallazgos críticos de seguridad, que tienen solución en menos de 30 minutos.**

---

*Code Review generado el 24/03/2026*
*Metodología: OWASP Top 10 · React 19 Best Practices · WCAG 2.1 AA · Clean Code (R. Martin) · Heurísticas de refactoring*
*Archivos analizados: 24 · Hallazgos totales: 35 (3 críticos, 4 altos, 8 medios, 11 bajos, 9 positivos)*
