import { useState } from 'react'
import { useTranslation } from 'react-i18next'

/* q9 (horario) sits right after q6 (duración) */
const FAQ_KEYS = ['q1','q2','q3','q4','q5','q6','q9','q7','q8']

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
  const [openIdx, setOpenIdx] = useState(null)

  // Split into two columns
  const half  = Math.ceil(FAQ_KEYS.length / 2)
  const left  = FAQ_KEYS.slice(0, half)
  const right = FAQ_KEYS.slice(half)

  /* Render function, not a nested component: a nested component remounts every render and kills the transition */
  const renderItem = (faqKey, idx) => {
    const isOpen  = openIdx === idx
    const panelId = `faq-${faqKey}`
    return (
      <div key={faqKey} className="border-b border-gray-100 py-4">
        <button
          onClick={() => setOpenIdx(isOpen ? null : idx)}
          aria-expanded={isOpen}
          aria-controls={panelId}
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

        {/* Respuesta — grid 0fr→1fr anima la altura real, así lo de abajo (footer) se desliza en vez de saltar */}
        <div
          id={panelId}
          inert={!isOpen}
          className={`grid transition-[grid-template-rows,opacity] duration-250
                      ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none
                      ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
          <div className="overflow-hidden">
            <p className="pt-3 pb-1 text-gray-500 text-sm leading-relaxed">
              {t(`faq.${faqKey}.a`)}
            </p>
          </div>
        </div>
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
            {left.map((key, i) => renderItem(key, i))}
          </div>
          <div>
            {right.map((key, i) => renderItem(key, i + half))}
          </div>
        </div>
      </div>
    </section>
  )
}
