# Reservas → Google Sheets, Google Calendar y correos

Cada reserva hecha en el sitio llega a un Google Apps Script que:

1. **Guarda una fila** en la pestaña `Reservas` de una hoja de Google Sheets (el registro central).
2. **Crea un evento** en Google Calendar con la fecha, la hora y los datos del cliente.
3. **Envía un correo al negocio** con la notificación de la nueva reserva.
4. **Envía al cliente un comprobante de reserva** (en español o inglés, según el idioma en que reservó).

Todo corre en la cuenta de Google del negocio, sin servidor propio y sin costo.

## Instalación (una sola vez, con la cuenta de Google del negocio)

1. **Crear la hoja.** En Google Sheets, crear una hoja nueva, por ejemplo `Reservas El Trapiche`. (La zona horaria de la hoja se fija sola en Costa Rica al ejecutar `setup` en el paso 6.)
2. **Abrir Apps Script.** En la hoja: *Extensiones → Apps Script*.
3. **Pegar el código.** Reemplazar el contenido de `Code.gs` por el archivo [`Code.gs`](./Code.gs) de esta carpeta.
4. **Pegar el manifiesto.** En *Configuración del proyecto* (ícono de engranaje), activar *Mostrar el archivo de manifiesto "appsscript.json"* y reemplazar su contenido por [`appsscript.json`](./appsscript.json). Esto fija la zona horaria de Costa Rica y declara los permisos: hojas de cálculo, calendario y envío de correo.
5. **Configurar los correos.** En *Configuración del proyecto → Propiedades del script*, agregar:

   | Propiedad | Valor | ¿Obligatoria? |
   |---|---|---|
   | `NOTIFY_EMAILS` | Correos del negocio que reciben la notificación, separados por coma | Sí |
   | `CALENDAR_ID` | ID de un calendario específico (*Configuración del calendario → Integrar el calendario*) | No; si falta, usa el calendario principal de la cuenta |

   Los correos del negocio viven ahí, no en el código, así no quedan en el repositorio.
6. **Autorizar y preparar.** En el editor, elegir la función `setup` en el selector junto a *Depurar* (por defecto aparece `doPost`, que no prepara nada) y presionar *Ejecutar*. Google pide permisos para la hoja, el calendario y el envío de correos. `setup` fija la zona horaria de la hoja en Costa Rica, guarda el ID de la hoja en `SPREADSHEET_ID` (la aplicación web la abre por ID) y crea la pestaña `Reservas` con sus encabezados.
7. **Publicar.** *Implementar → Nueva implementación → Tipo: Aplicación web*:
   - *Ejecutar como:* **Yo**
   - *Quién tiene acceso:* **Cualquier persona**

   Copiar la URL que termina en `/exec`.
8. **Conectar el sitio.** En Vercel, *Settings → Environment Variables*, crear `VITE_BOOKINGS_URL` con esa URL y volver a desplegar. Para probar en local, crear `.env.local` con la misma variable (mejor apuntando a una hoja de prueba).
9. **Probar antes de anunciarlo.** Hacer una reserva real en el sitio publicado y revisar: la fila nueva en la hoja, el evento en el calendario, el correo del negocio y el comprobante del cliente. Si el sitio muestra un error, revisar *Ejecuciones* en el editor de Apps Script.

> **Actualizar el script más adelante:** pegar el código nuevo, guardar, elegir `setup` en el selector y ejecutarlo otra vez (actualiza el formato; si la pestaña «Reservas» tenía otro orden de columnas, la conserva como «Reservas (formato anterior)» y copia sus filas al formato nuevo) y luego *Implementar → Gestionar implementaciones → Editar (lápiz) → Versión: Nueva versión → Implementar*. Así la URL `/exec` no cambia.

## Qué ven en la hoja

**Pestaña «Panel»** (la primera): celdas amarillas para filtrar por *Desde / Hasta* (fecha del tour), *Estado*, *Código* y *Cliente* (nombre, correo o teléfono). Deja vacío lo que no quieras filtrar; por defecto muestra las reservas de hoy en adelante. Arriba aparecen los totales de lo filtrado (reservas, personas y dinero) y abajo la lista ordenada por fecha y hora. El Panel solo muestra: se puede borrar y volver a crear corriendo `setup`.

**Pestaña «Reservas»**: una fila por reserva, en este orden: Fecha del tour · Hora · Estado · Código · Nombre · Teléfono · Adultos · Niños · Personas · Total · Correo · Comentarios · Idioma · Pago · Precio adulto · Precio niño · Ref. pago · Registrada · Calendario (link «Ver en calendario»). Fecha y hora quedan fijas al desplazarse, hay filas alternadas y botones de filtro en cada encabezado.

La columna **Estado** es la única pensada para editar a mano: desplegable con *Confirmada* (verde), *Realizada* (azul), *Cancelada* (rojo) y *No se presentó* (ámbar). El script busca cada columna por su nombre, así que se pueden reordenar columnas o agregar otras (por ejemplo «Notas internas») sin romper nada; solo no hay que cambiar los nombres de los encabezados.

## Seguridad

La URL `/exec` es pública: cualquiera que la conozca puede enviarle datos. Por eso el script desconfía de todo lo que recibe:

- **Valida otra vez en el servidor:** nombre (solo letras, espacios, apóstrofo y guion), correo, teléfono, fecha real y futura, horario permitido, mínimo y máximo de personas, y que la salida no esté a menos de 1 hora (hora de Costa Rica).
- **El comprobante del cliente nunca repite texto libre** que haya escrito el visitante (comentarios, referencias). Como se envía a una dirección que nadie verificó, eso evita que alguien use el sitio para mandar spam o phishing desde el Gmail del negocio. Los comentarios sí aparecen en el correo del negocio, la hoja y el calendario.
- **Calcula el precio él mismo** (personas × precio); ignora cualquier total que mande el navegador.
- **Nunca marca un pago como "pagado" por lo que diga el navegador.** Mientras `PAYMENT_MODE` sea `'demo'`, el pago figura como *Simulado (demo) — sin cobro*.
- **Campo trampa (honeypot):** los bots que lo llenan reciben un "ok" falso y no se guarda nada.
- **Límites:** máximo 3 reservas por dirección cada 10 minutos (también cuenta variantes como `ana+promo@gmail.com`). No hay un límite global a propósito: un atacante podría usarlo para bloquear las reservas reales. Antes de enviar, el script revisa la cuota diaria de Gmail; si no alcanza, la reserva igual se guarda y el sitio se entera de que no salió el correo.
- **Escapa el HTML** de los correos y del calendario, y **guarda todo texto del visitante como texto** en la hoja: un comentario como `=HYPERLINK(...)` no se ejecuta, y los teléfonos conservan el `+` o los ceros iniciales.
- Para analizar los datos fuera de Google, descargar como **.xlsx** (*Archivo → Descargar → Microsoft Excel*). Evitar CSV: ahí Sheets quita la marca de texto y Excel podría interpretar un comentario malicioso como fórmula.

## Límites de la cuenta gratuita de Google

Con una cuenta de Gmail gratuita, Apps Script permite 100 destinatarios de correo por día y 5.000 eventos de calendario por día ([cuotas oficiales](https://developers.google.com/apps-script/guides/services/quotas)). Cada reserva usa 1 destinatario por cada correo de `NOTIFY_EMAILS` más 1 para el cliente: con un solo correo del negocio son 2, o sea unas 50 reservas por día, muy por encima de lo esperado. Si se llega al límite, primero se envía la notificación al negocio; la reserva igual se guarda en la hoja y el calendario, y la confirmación en el sitio no dice "te enviamos el comprobante" (el código de reserva siempre se muestra en pantalla).

## Pasarela de pago (pendiente)

Hoy el pago es simulado (`src/features/booking/services/payment.js`) y el navegador registra la reserva. Cuando se conecte una pasarela real:

1. El cobro lo confirma la pasarela, y el registro de la reserva debe dispararlo **su webhook** (de servidor a servidor), no el navegador.
2. Apps Script no puede leer los encabezados HTTP de una petición, y la mayoría de las pasarelas firman sus webhooks en un encabezado. Por eso conviene una función serverless pequeña (en el mismo hosting del sitio) que verifique la firma y luego llame a este script con un secreto compartido.
3. Recién entonces se cambia `PAYMENT_MODE` y el estado pasa a *Pagado*.

## Factura electrónica

El correo al cliente es un **comprobante de reserva**, no una factura. En Costa Rica, la factura electrónica se emite por el sistema de Hacienda o por un proveedor de facturación (Hacienda ofrece uno gratuito, TICO-Factura). Por eso el comprobante lo aclara en su pie.

## Tests

```bash
npm run test:apps-script
```

Prueban la validación, el precio calculado en el servidor, el honeypot, los límites por dirección, que el comprobante del cliente no repita texto del visitante, el escape de HTML (correos y calendario), la protección contra fórmulas, el número de WhatsApp, la cuota de correo, el idioma del comprobante y que una falla de correo no pierda la reserva.
