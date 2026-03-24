import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

const FAQ_KEYS = ['q1','q2','q3','q4','q5','q6','q7','q8']
const ANIM_MS  = 220

function ChevronDown({ open }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export function FAQ() {
  const { t } = useTranslation()
  const [openIdx,    setOpenIdx]    = useState(null)
  const [closingIdx, setClosingIdx] = useState(null)
  const timerRef = useRef(null)

  const toggle = (i) => {
    if (openIdx === i) {
      // Cerrar: animar salida, luego quitar del DOM
      setClosingIdx(i)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setOpenIdx(null)
        setClosingIdx(null)
      }, ANIM_MS)
    } else {
      // Abrir: cancelar cualquier cierre pendiente
      clearTimeout(timerRef.current)
      setClosingIdx(null)
      setOpenIdx(i)
    }
  }

  // Split into two columns
  const left  = FAQ_KEYS.slice(0, 4)
  const right = FAQ_KEYS.slice(4, 8)

  const Item = ({ faqKey, idx }) => {
    const isOpen    = openIdx    === idx
    const isClosing = closingIdx === idx
    return (
      <div className="border-b border-gray-100 py-4">
        <button
          onClick={() => toggle(idx)}
          className="group flex items-center justify-between w-full text-left gap-4 cursor-pointer"
        >
          <span className="text-gray-800 font-medium text-[0.97rem] leading-snug">
            {t(`faq.${faqKey}.q`)}
          </span>
          <div
            className="flex-shrink-0 w-9 h-9 rounded-full bg-forest-600
                        flex items-center justify-center text-white
                        group-hover:bg-forest-500 group-hover:scale-110
                        transition-all duration-200 cursor-pointer"
          >
            <ChevronDown open={isOpen} />
          </div>
        </button>

        {/* Respuesta — slideDown al abrir, slideUp al cerrar */}
        {(isOpen || isClosing) && (
          <p
            className="pt-3 pb-1 text-gray-500 text-sm leading-relaxed"
            style={{
              animation: isClosing
                ? `slideUp ${ANIM_MS}ms ease-in forwards`
                : 'slideDown 0.25s ease-out forwards',
            }}
          >
            {t(`faq.${faqKey}.a`)}
          </p>
        )}
      </div>
    )
  }

  return (
    <section
      id="faq"
      className="bg-white -mt-10 relative z-10 py-20 pt-24 px-5 md:px-8"
    >
      <div className="max-w-5xl mx-auto">

        {/* Cabecera */}
        <div className="text-center mb-14">
          <h2
            className="font-heading font-bold text-gray-900 leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)' }}
          >
            {t('faq.title')}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed text-base">
            {t('faq.subtitle')}
          </p>
          <div className="mx-auto mt-6 w-14 h-0.5 bg-gray-200 rounded-full" />
        </div>

        {/* Grid 2 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
          <div>
            {left.map((key, i) => (
              <Item key={key} faqKey={key} idx={i} />
            ))}
          </div>
          <div>
            {right.map((key, i) => (
              <Item key={key} faqKey={key} idx={i + 4} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
