import { useLanguage } from '../hooks/useLanguage'

/* ── Banderas SVG ────────────────────────────────────────────── */

function USAFlag() {
  // 13 franjas horizontales + cantón azul
  return (
    <svg viewBox="0 0 60 30" className="w-full h-full" aria-hidden="true">
      {/* Fondo rojo (franjas impares) */}
      <rect width="60" height="30" fill="#B22234" />
      {/* Franjas blancas (pares) */}
      <rect y="2.31"  width="60" height="2.31" fill="white" />
      <rect y="6.92"  width="60" height="2.31" fill="white" />
      <rect y="11.54" width="60" height="2.31" fill="white" />
      <rect y="16.15" width="60" height="2.31" fill="white" />
      <rect y="20.77" width="60" height="2.31" fill="white" />
      <rect y="25.38" width="60" height="2.31" fill="white" />
      {/* Cantón azul (union) */}
      <rect width="24" height="16.15" fill="#3C3B6E" />
    </svg>
  )
}

function CostaRicaFlag() {
  // 5 franjas horizontales: azul, blanco, rojo (ancho), blanco, azul
  return (
    <svg viewBox="0 0 60 30" className="w-full h-full" aria-hidden="true">
      <rect y="0"  width="60" height="5"  fill="#002B7F" />
      <rect y="5"  width="60" height="5"  fill="white"   />
      <rect y="10" width="60" height="10" fill="#CE1126" />
      <rect y="20" width="60" height="5"  fill="white"   />
      <rect y="25" width="60" height="5"  fill="#002B7F" />
    </svg>
  )
}

/* ── Componente toggle ───────────────────────────────────────── */

export function LanguageToggle({ variant = 'default' }) {
  const { language, toggleLanguage } = useLanguage()
  const isES = language === 'es'

  const pill = (w, h, circleSize, circleMargin) => {
    const translateRight = w - circleSize - circleMargin
    return (
      <button
        onClick={toggleLanguage}
        aria-label={isES ? 'Switch to English' : 'Cambiar a Español'}
        style={{ width: w, height: h, boxShadow: 'inset 0 0 0 2.5px rgba(0,0,0,0.45)' }}
        className="relative rounded-full overflow-hidden flex-shrink-0 cursor-pointer focus:outline-none"
      >
        {/* Bandera como fondo */}
        <div className="absolute inset-0">
          {isES ? <CostaRicaFlag /> : <USAFlag />}
        </div>

        {/* Círculo deslizante — centrado verticalmente */}
        <div
          style={{
            top: '50%',
            width: circleSize,
            height: circleSize,
            transform: `translate(${isES ? translateRight : circleMargin}px, -50%)`,
          }}
          className="absolute bg-white rounded-full shadow-lg z-10 transition-transform duration-300"
        />
      </button>
    )
  }

  if (variant === 'navbar') {
    return (
      <div className="flex items-center gap-2">
        <span
          className={`text-[11px] font-bold tracking-widest uppercase transition-colors duration-200 ${
            !isES ? 'text-white' : 'text-white/35'
          }`}
        >
          EN
        </span>

        {pill(58, 28, 22, 3)}

        <span
          className={`text-[11px] font-bold tracking-widest uppercase transition-colors duration-200 ${
            isES ? 'text-white' : 'text-white/35'
          }`}
        >
          ES
        </span>
      </div>
    )
  }

  /* variant="default" — para el dropdown mobile u otros usos */
  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-sm font-bold tracking-widest uppercase transition-colors duration-200 ${
          !isES ? 'text-white' : 'text-white/40'
        }`}
      >
        EN
      </span>

      {pill(64, 32, 24, 4)}

      <span
        className={`text-sm font-bold tracking-widest uppercase transition-colors duration-200 ${
          isES ? 'text-white' : 'text-white/40'
        }`}
      >
        ES
      </span>
    </div>
  )
}
