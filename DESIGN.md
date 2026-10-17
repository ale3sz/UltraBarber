# Design System — DAVID BARBER STUDIO (Urban Botanical Club)

## 1. Visual Direction & Atmosphere

- **Concept:** Contemporary Barber Club & Street-Luxury Grooming Studio (inspired by mobile club apps like *Il Figaro* in the reference video, engineered in the **Earth & Botanical Studio** color palette).
- **Why the previous look felt outdated ("de señora") & how this replaces it:**
  - *Out:* Soft beige tea-room cards, wedding-style serif headings on every label, centered corporate web forms, floral/botanical icons, and generic top navbars.
  - *In:* **Dark Tostado (`#181715`) & Espresso Surface (`#24221E`)** dominant club interface; sharp **Space Grotesk** geometric display typography paired with **Plus Jakarta Sans** UI type and selective editorial italic accents (*Instrument Serif* / *Playfair Display Italic* only for expressive emphasis like *"¿Qué te *servimos* hoy?"*); bold oversized tabular numbers (`08 PTS`, `$18.000`, `#4821`); 2-column visual service cards with atmospheric photography; Apple-Wallet-style Club Membership Pass with QR; and a floating native-app Bottom Dock.

## 2. Color Tokens (Earth & Botanical Studio)

Configured in `tailwind.config.js` under `colors.barber`:

| Token | Hex | Role |
|---|---|---|
| `barber.matcha` | `#809671` | Primary brand action, active states, confirmed badges, progress bars |
| `barber.pistache` | `#B3B792` | Secondary muted text in dark mode, subtle highlights |
| `barber.chai` | `#D2AB80` | Warm metallic gold/chai accent, VIP club pass footer, points & level badges |
| `barber.vanilla` | `#E5D2B8` | Warm highlights, gradient stops on membership pass |
| `barber.almond` | `#E5E0D8` | Light mode borders and subtle dividers |
| `barber.carob` | `#725C3A` | Deep earth bronze, secondary muted text in light mode, level 3 accents |
| `barber.darkBg` | `#181715` | Primary background in Dark Mode (warm toasted obsidian) |
| `barber.darkSurface` | `#24221E` | Elevated cards, sheets, and dock in Dark Mode |
| `barber.darkBorder` | `#3D372E` | Crisp 1px structural hairlines in Dark Mode |
| `barber.darkText` | `#F7F6F2` | Primary high-contrast off-white text in Dark Mode |
| `barber.lightBg` | `#F7F6F2` | Primary background in Light Mode |
| `barber.lightSurface` | `#FFFFFF` | Elevated cards and sheets in Light Mode |
| `barber.lightBorder` | `#E5E0D8` | Crisp 1px structural hairlines in Light Mode |
| `barber.lightText` | `#2B2620` | Deep espresso primary text in Light Mode |

## 3. Typography & Hierarchy

- **Display / Headings (`font-display`):** `'Space Grotesk', sans-serif` — bold, tight tracking (`-0.03em`), urban and architectural. Used for big numbers (`8 PTS`, `$18.000`), screen titles, and service names.
- **Editorial Accent (`font-editorial`):** `'Instrument Serif', 'Playfair Display', serif` (italic) — used sparingly inside display headlines (e.g., `¿Qué te *servimos* hoy?`, `Hola, *Lucas*`) to replicate the exact luxury barber club vibe from the reference video.
- **UI & Body (`font-sans`):** `'Plus Jakarta Sans', sans-serif` — clean, fast-scanning for descriptions, schedules, and admin controls.
- **Data / Codes (`font-mono`):** `'JetBrains Mono', monospace` with `tabular-nums` — exclusively for DNI, 4-digit handshake codes (`#4821`), countdown timers (`14:59`), and timestamps.

## 4. Layout & App Shell Architecture

- **Mobile-First Club Shell + Desktop Studio Workspace:**
  - **Client View:** Structured like an installed mobile club app (`max-w-lg` centered shell on mobile/tablet, expanding to a 2-column split on desktop where the left column holds the sticky **Club Member Pass & Active Turn** and the right column holds the interactive **Booking / Services / History** stage).
  - **Floating Bottom Navigation Dock:** 4 primary client destinations (`Club / Inicio`, `Reservar`, `Mis Turnos`, `Precios`) + discreet `Barbero` lock button for David's authenticated portal.
  - **David's Admin Workspace:** Full-width (`max-w-6xl`) operational cockpit with live audio/visual handshake radar, 1-tap WhatsApp actions, daily agenda timeline, manual turn booking, schedule blocker, cash register summary, and client PIN/points manager.
