# Design System — DAVID BARBER / BARBER FADE (Surgical & Club Master Craft)

## 1. Visual Direction & Atmosphere

- **Concept:** David Barber & Barber Fade (Sillón en V.I.P Barberías, Eva Perón 52, Capitán Bermúdez).
- **Core Aesthetic Pillars:**
  - **Surgical Precision:** Laser hairlines (`rgba(255, 255, 255, 0.08)`), high-contrast tabular numbers (`Azeret Mono`), zero decorative noise.
  - **Muted Satin Champagne & Carbon:** Base obsidian surfaces (`#0B0B0C`, `#141416`), illuminated by delicate brushed champagne accents (`#D4AF37`, `#E5C378`), replacing harsh yellow-golds.
  - **Tactile Digital Black Pass:** Apple-Wallet-inspired card with dynamic metal shimmer, micro-etched security chip, and integrated QR modal.

## 2. Definitive Color Tokens

Configured in `tailwind.config.js`:

| Token | Hex / Value | Architectural Role |
|---|---|---|
| `carbon.bg` / `barber.darkBg` | `#0B0B0C` | Deep obsidian matte background |
| `carbon.surface` / `barber.darkSurface` | `#141416` | Elevated cards, sheets, bottom dock |
| `carbon.elevated` | `#1B1B1F` | High-elevation overlays, modales & popovers |
| `champagne` / `barber.gold` | `#D4AF37` | Satin pure champagne for badges, active states & metrics |
| `champagneLight` / `barber.goldLight` | `#E5C378` | Soft champagne for hover states, progress bars & highlights |
| `champagneDark` / `barber.goldDark` | `#997B1C` | Deep metallic bronze for structural gradients & borders |
| `pearl` / `barber.darkText` | `#EDEDED` | Crisp off-white display typography |
| `mutedGrey` / `barber.pistache` | `#8A898E` | Titanium muted text for secondary details & labels |
| `borderHairline` / `barber.darkBorder`| `rgba(255, 255, 255, 0.08)` | 1px precision hairline borders |

## 3. Typography Architecture

- **Display & Large Headlines (`font-display`):** `'Archivo', system-ui, sans-serif` — Bold geometric neo-grotesk with tight tracking (`-0.03em`).
- **Technical & Calibration Codes (`font-mono`):** `'Azeret Mono', monospace` with `tabular-nums` — Handshake code (`#4821`), DNI numbers, countdown timers, points odometer (`08 PTS`).
- **UI & Form Body (`font-sans`):** `'Work Sans', system-ui, sans-serif` — High readability and optimal x-height on mobile touchscreens.
- **Authorial Signature Accent (`font-editorial`):** `'Newsreader', Georgia, serif` (Italic) — Used with restraint for expressive highlights (`¿Qué te *servimos* hoy?`, `Hola, *Lucas*`).

## 4. Components & Elevation

- `.black-card`: 145° titanium gradient with dynamic metal shimmer sweep and subtle top hairline reflection.
- `.card-hairline`: Architectural containment with `rgba(255, 255, 255, 0.08)` and inner highlight.
- `.badge-champagne`: Technical status tag with micro-mono typography and hairline gold border.
- `.security-keyplate`: Laser-etched code container for the 15-minute anti-fraud handshake.
