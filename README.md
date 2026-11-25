# Tour de Caballos El Trapiche

Sitio web del tour (React + Vite + Tailwind). Público principal: huéspedes que escanean un QR y reservan desde el celular.

- `npm run dev` · `npm run build` · `npm run lint`
- **Reservas:** cada reserva se guarda en Google Sheets, crea un evento en Google Calendar y envía correos al negocio y al cliente. Instalación y detalles en [`integrations/google-apps-script/README.md`](integrations/google-apps-script/README.md). Variable de entorno: `VITE_BOOKINGS_URL`.
- `npm run test:apps-script` prueba el script de reservas.
- Datos públicos del negocio (WhatsApp, coordenadas, precio, horarios): `src/config/business.js`.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
