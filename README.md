# David Barber Studio - Sistema de Turnos, Membresía & Handshake WhatsApp

Aplicación web integral para barbería de autor con estética **Earth & Botanical Studio**, diseñada para una experiencia ágil tanto para los clientes como para el barbero David.

---

## 🎨 Paleta de Colores (Earth & Botanical Studio)

Configurada con tokens en `tailwind.config.js` y soporte completo para **Modo Claro** y **Modo Oscuro**:

- **Swatches base:**
  - `matcha`: `#809671`
  - `pistache`: `#B3B792`
  - `almond`: `#E5E0D8`
  - `vanilla`: `#E5D2B8`
  - `chai`: `#D2AB80`
  - `carob`: `#725C3A`

- **Modo Claro:**
  - `lightBg`: `#F7F6F2` (Fondo suave)
  - `lightSurface`: `#FFFFFF` (Tarjetas y modales)
  - `lightBorder`: `#E5E0D8` (Separadores)
  - `lightText`: `#2B2620` (Texto principal)
  - `lightMuted`: `#725C3A` (Texto secundario / DNI)
  - `lightPrimary`: `#809671` (Botones de acción Matcha)
  - `lightSecondary`: `#D2AB80` (Acentos y badges Chai)

- **Modo Oscuro:**
  - `darkBg`: `#181715` (Fondo oscuro tostado)
  - `darkSurface`: `#24221E` (Tarjetas oscuras)
  - `darkBorder`: `#3D372E` (Separadores)
  - `darkText`: `#F7F6F2` (Texto principal claro)
  - `darkMuted`: `#B3B792` (Texto secundario Pistache)
  - `darkPrimary`: `#809671` (Botones principales Matcha)
  - `darkSecondary`: `#D2AB80` (Acentos y badges Chai)

---

## 🚀 Funcionamiento y Lógica Implementada

### A. Flujo de Reserva y Verificación Antifraude (Handshake por WhatsApp)
1. **Identificación por DNI:**
   - El cliente ingresa su DNI en la web pública.
   - Si ya existe: precarga automáticamente Nombre, Apellido, Celular y muestra su tarjeta de membresía digital con los puntos acumulados y cortes históricos.
   - Si no existe: solicita Nombre, Apellido, Celular (WhatsApp) y Fecha de Nacimiento (para promo de cumpleaños).
2. **Selección de Servicio:**
   - Catálogo extraído de los precios oficiales:
     1. Corte ($18.000)
     2. Corte + Bebida ($20.000) - con selector de bebida (Agua mineral, Gaseosa, Cerveza)
     3. Barba Premium ($20.000)
     4. Barba Premium + Bebida ($22.000) - con selector de bebida
     5. Experiencia Completa (Corte + Barba + Facial) ($24.000) - con selector de bebida
3. **Selección de Horario & Bloqueo Temporal (15 minutos):**
   - El cliente selecciona fecha y horario libre (detección en tiempo real de slots ocupados).
   - Al tocar "Solicitar Turno", se crea la reserva con estado `pendiente`, código único de 4 dígitos (ej: `#4821`) y temporizador de bloqueo por 15 minutos (`expires_at`).
   - Botón directo a WhatsApp con el mensaje prearmado exacto:
     *"Hola David! Quiero confirmar mi turno para el [FECHA] a las [HORA] hs. Código de turno: #4821 - Cliente: [NOMBRE] (DNI: [DNI])"*
4. **Confirmación por parte de David:**
   - David recibe el mensaje en su WhatsApp (validando línea activa y persona real).
   - En su panel web ve la tarjeta `Pendiente #4821` con cuenta regresiva en vivo y presiona **[Confirmar Turno]**.
   - En la pantalla del cliente se detecta automáticamente la confirmación y se festeja con confetti.
   - Si pasan 15 minutos sin confirmación, el worker en segundo plano expira el turno y libera el horario automáticamente.

---

### B. Membresía y Puntos
- Cada corte completado suma **+1 punto** al balance del DNI del cliente.
- Tarjeta de fidelización digital con nivel de socio, balance de puntos y barra de progreso hacia corte gratis.
- **Sección de Cumpleaños:** En el panel de David se listan los clientes que cumplen años en la semana y en el mes, con un botón en 1 toque para enviarles el saludo y promo directo a su WhatsApp.

---

### C. Control de Cortes y Cobro
- Desde la agenda, David marca **[Cobrar y Finalizar]**.
- Registra el método de pago (`Efectivo`, `Transferencia`, `Canje de Puntos`), monto y notas.
- El sistema incrementa automáticamente el historial de visitas (+1 corte) y el balance (+1 punto).
- Opción **[No Asistió]**, cancelando el turno sin sumar puntos.

---

## 🛠️ Cómo Ejecutar el Proyecto

```bash
# Instalar dependencias (ya instaladas)
npm install

# Iniciar servidor backend y frontend concurrentemente
npm run dev
```

- **Frontend (Vite):** `http://localhost:5173/`
- **Backend API (Express):** `http://localhost:3001/api`
