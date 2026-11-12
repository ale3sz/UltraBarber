# DAVID BARBER - Sistema de Gestión, Turnos & Fidelización de Autor

Plataforma web integral para el estudio de barbería de autor de **David** (ubicado en **V.I.P Barberías**, Eva Perón 52, Capitán Bermúdez). Diseñada con enfoque mobile-first, protección de concurrencia en base de datos, motor de fidelización con ledger contable y handshake bidireccional vía WhatsApp.

---

## 💎 Identidad Visual & Look & Feel

- **Estética:** *Dark Luxury Minimalist & Botanical Studio*.
- **Acentos:** Dorado champán (`#D4AF37` / `#E5C378`), fondos oscuros carbón técnico (`#0D0D0F`, `#141416`), bordes ultra finos *hairline* (`white/[0.08]`) y tipografías display con toques técnicos monoespaciados.
- **Pase de Socio:** Tarjeta digital estilo *Black Card / Apple Wallet* con efecto metal shimmer, balance en odómetro animado y selector de solapas (*Pase de Socio*, *Beneficios & Canjes*, *Invitar Amigos*).

---

## 🚀 Arquitectura Técnica y Lógica de Negocio

### 1. Motor de Concurrencia y Turnos (WhatsApp Handshake)
- **Bloqueo atómico con SQLite WAL (`BEGIN IMMEDIATE`)**:
  - Evita colisiones o doble reserva simultánea mediante un índice único parcial en base de datos (`idx_unique_active_slot` sobre turnos pendientes y confirmados).
  - Cálculo de disponibilidad con franja de 15 minutos de anticipación mínima y validación horaria estricta contra la zona de Argentina (`America/Argentina/Buenos_Aires`).
- **Hold de cortesía (15–25 minutos)**:
  - Al solicitar turno, se genera un código identificador (`#XXXX`) y se bloquea el slot con expiración temporal.
  - El cliente dispara el mensaje de WhatsApp preformateado a David con un toque.
  - David confirma desde su panel y el cliente recibe feedback inmediato con animación festiva. Si transcurre el tiempo límite sin confirmación, un worker en segundo plano libera el horario automáticamente.
- **Protección antifraude y no-shows**:
  - Límite de cancelaciones abusivas por cliente en ventana de 24 horas.
  - Registro de incidentes: si David marca **[No Asistió]**, se incrementa el contador `no_show_count` del cliente, generando una advertencia visual preventiva (`⚠️ X NO-SHOW`) en la agenda y directorio ante futuras citas.

---

### 2. Motor de Fidelización y Club de Socios (Escala en Centenas)

Los puntos se auditan de forma inmutable en una tabla `points_ledger` (con delta, balance posterior, referencia y motivo contable).

- **Escala de puntos:**
  - **10 PTS base:** Por cada corte o servicio de autor completado.
  - **100 PTS:** Canje directo por 1 corte de autor 100% bonificado ($0).
  - **Catálogo de premios:** Canjes por productos de cuidado facial, barba y bebidas exclusivas configurables por stock.
- **Bonus dinámico por días de menor demanda (+5 PTS):**
  - El backend analiza automáticamente la última semana activa de trabajo y determina los 2 días con menor cantidad de turnos (con fallback por defecto a **Martes y Miércoles** en semanas vacacionales o sin datos).
  - Cortarse en esos días bonifica con **+5 PTS extra**.
- **Racha de recurrencia (+5 PTS):**
  - Si el socio vuelve al sillón dentro de los **≤ 21 días** desde su última visita, el sistema premia la constancia sumando **+5 PTS extra** (pudiendo acumular hasta 20 PTS en una sola visita combinada con día valle).
- **Programa de referidos (Anti-multicuentas):**
  - Cada cliente posee su código personal (`referral_code`, ej: `MAT9888`) y enlace directo (`?ref=MAT9888`).
  - **Regla de liberación:** El referente recibe **+25 PTS** (exactamente un cuarto de un corte gratis) **únicamente cuando el amigo referido completa su primer corte en el sillón**.
- **Caducidad gradual por inactividad (Points Decay):**
  - A partir de los **60 días (2 meses)** sin visitas, el sistema aplica un descuento gradual preventivo de **10 PTS cada 21 días (3 semanas)** adicionales de inactividad (nunca bajando de 0).
- **Atención de cumpleaños (Bebida de cortesía de regalo):**
  - Dentro de una ventana de **±2 días** respecto a la fecha de cumpleaños del cliente.
  - Condición de actividad: Haber visitado el sillón en los últimos **35 días**.
  - Regalo: **1 bebida de cortesía bonificada** (cerveza helada, gaseosa o agua) para brindar en el sillón.

---

### 3. Panel de Administración de David
- **Agenda diaria:** Vista cronológica de citas con selector de fecha, desglose de servicios, bebidas seleccionadas y alertas de DNA de estilo / No-shows.
- **Acciones en 1 toque:** Confirmación, cobro con selección de método de pago, anulación/reembolso controlado y bloqueo manual de días u horarios.
- **Directorio de clientes:** Segmentación inteligente (Al día, Toca corte, En riesgo, Inactivos), métricas de visitas, saldo de puntos, PIN web y disparadores directos de WhatsApp para reactivación.
- **Gestor de Trabajos de Autor:** Alta, edición y categorización de fotos del portfolio (Fades, Freestyle, Barba, Relax VIP) con flags de destacados.
- **Configuraciones del estudio:** Parámetros de horarios comerciales, precios de servicios, WhatsApp oficial y beneficios del club.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 18, Vite 6, Tailwind CSS 3.4, Lucide React, Canvas Confetti, QR Code.
- **Backend:** Node.js (ESM), Express 4, `node:sqlite` (SQLite embebido nativo con modo WAL), bcryptjs, Helmet, Express Rate Limit.
- **Seguridad:** Hash bcrypt (cost 10) para credenciales administrativas y PINes de 4 dígitos de clientes, limitadores de tasa por IP en reservas y autenticación.

---

## 💻 Ejecución en Entorno Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor backend y frontend concurrentemente
npm run dev
```

- **Frontend (Vite):** `http://localhost:5173/`
- **Backend API (Express):** `http://localhost:7201/api`

### Scripts disponibles
- `npm run dev`: Ejecuta Express y Vite en paralelo.
- `npm run build`: Genera el bundle de producción en `/dist`.
- `npm run server`: Inicia únicamente el servidor backend (`node server/index.js`).
- `npm run client`: Inicia únicamente el servidor de desarrollo de Vite.
