# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 18 + Vite + Tailwind CSS (Frontend) y Node.js + Express + Native SQLite `node:sqlite` (Backend con persistencia ACID y autenticación JWT).

## Users

1. **Clientes de la Barbería (público masculino joven y adulto):** Buscan reservar su turno rápido desde el celular (muchas veces entrando desde el link en bio de Instagram o WhatsApp), consultar cuántos puntos y cortes llevan en su membresía, y no perder tiempo con formularios largos, manteniendo su cuenta protegida con su DNI + PIN de 4 dígitos.
2. **David (Barbero propietario y administrador):** Necesita gestionar su agenda diaria desde el celular o PC entre corte y corte, evitar turnos falsos mediante el handshake de WhatsApp (código de 4 dígitos con bloqueo de 15 minutos), cobrar turnos (Efectivo, Transferencia, Canje de Puntos), llevar la caja diaria, bloquear horarios libres, recordar qué corte se hace cada cliente, y fidelizar cumpleañeros con promos por WhatsApp en un toque.

## Product Purpose

Sistema integral de reservas antifraude, membresía por puntos y gestión operativa para **David Barber Studio**, diseñado para funcionar con costo operativo $0/mes (sin pasarelas de SMS pagas ni servidores externos costosos) combinando una base de datos SQLite local transaccional, cuentas protegidas por PIN y validación humana vía WhatsApp.

## Positioning

Combina la estética y experiencia de una app nativa de club de barbería moderno (pase de socio con QR, puntos, niveles, reserva en 3 toques) con un protocolo antifraude de bloqueo temporal de 15 minutos y confirmación por WhatsApp (`#código`), eliminando los turnos fantasma sin requerir pagos con tarjeta por adelantado.

## Operating Context

- Los clientes acceden mayoritariamente desde pantallas móviles verticales (iOS / Android) a través de redes sociales o acceso directo guardado en su teléfono.
- David utiliza su panel administrativo con sesión autenticada durante la jornada laboral en el estudio para confirmar códigos recibidos en su WhatsApp, registrar cobros al terminar cada corte y consultar su agenda.

## Capabilities and Constraints

- **Base de datos SQLite nativa (`node:sqlite`):** Persistencia relacional real en archivo `server/data/barberfade.sqlite` sin costo.
- **Protección de identidad de clientes ($0 costo):** Cuentas por DNI + PIN personal de 4 dígitos + sesión JWT persistente en el dispositivo, enmascaramiento de datos ante consultas no autenticadas y recuperación asistida por WhatsApp.
- **Acceso exclusivo de David:** Autenticación de administrador con usuario, contraseña hasheada y JWT (`requireAdmin` middleware en todas las rutas administrativas).
- **Handshake de WhatsApp con expiración automática:** Bloqueo de 15 minutos (`expires_at`), código de 4 dígitos y liberación automática del turno si no se confirma a tiempo.
- **Programa de Puntos y Cumpleaños:** +1 punto automático por cada corte cobrado y finalizado, canje de puntos, y alertas de cumpleaños semanales/mensuales con mensaje prearmado de WhatsApp.
- **Gestión completa del estudio:** Turnos manuales, bloqueo de horarios/días libres, reporte de caja (Efectivo/Transferencia/Canjes) y edición de precios/servicios en vivo.

## Brand Commitments

- **Paleta obligatoria Earth & Botanical Studio:**
  - Swatches base: `matcha` (`#809671`), `pistache` (`#B3B792`), `almond` (`#E5E0D8`), `vanilla` (`#E5D2B8`), `chai` (`#D2AB80`), `carob` (`#725C3A`).
  - Modo Oscuro (predeterminado): `darkBg` (`#181715`), `darkSurface` (`#24221E`), `darkBorder` (`#3D372E`), `darkText` (`#F7F6F2`), `darkMuted` (`#B3B792`), `darkPrimary` (`#809671`), `darkSecondary` (`#D2AB80`).
  - Modo Claro: `lightBg` (`#F7F6F2`), `lightSurface` (`#FFFFFF`), `lightBorder` (`#E5E0D8`), `lightText` (`#2B2620`), `lightMuted` (`#725C3A`), `lightPrimary` (`#809671`), `lightSecondary` (`#D2AB80`).
- **Tono visual:** Urbano, masculino, juvenil y profesional; inspirado en clubes de barbería contemporáneos con navegación tipo app móvil.

## Evidence on Hand

- Catálogo oficial y precios en `precios.txt` (Corte $18.000, Corte + Bebida $20.000, Barba Premium $20.000, Barba Premium + Bebida $22.000, Experiencia Completa $24.000; bebidas: Agua mineral, Gaseosa, Cerveza).
- Video de referencia visual de experiencia móvil (`video de ejemplo DE INSPIRACION, NO FUNCIONAMIENTO NI COLORES.mp4`).

## Product Principles

1. **Fricción cero para el cliente real, barrera total para el intruso:** Sesión persistente y PIN de 4 dígitos para proteger el DNI, sumado al handshake por WhatsApp para validar la reserva.
2. **Estética de Club Urbano Contemporáneo:** Tipografía geométrica con carácter, alto contraste sobre fondos oscuros tostados (`#181715`), tarjetas visuales de servicios en grilla y navegación inferior tipo app nativa.
3. **Control total para el barbero en un toque:** Confirmar un turno, cobrarlo o saludar a un cumpleañero nunca debe llevar más de dos toques desde el celular de David.
