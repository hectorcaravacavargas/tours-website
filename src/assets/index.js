/* ─────────────────────────────────────────────────────────────
   Módulo central de assets.

   Estructura:
     images/cabalgatas/   → fotos de los tours a caballo
     images/fauna/        → fauna de Costa Rica (portada)
     images/placeholders/ → imágenes temporales
     videos/              → videos y sus pósters

   Importar siempre desde aquí, nunca con rutas directas:
     import { ranaOjosRojos, videoCabalgata } from '../../assets'
──────────────────────────────────────────────────────────── */
export * from './images'
export * from './videos'
