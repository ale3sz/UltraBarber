/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        carbon: {
          bg: '#0B0B0C',
          surface: '#141416',
          elevated: '#1A1A1E',
          border: 'rgba(255, 255, 255, 0.08)',
          borderSubtle: 'rgba(255, 255, 255, 0.04)',
        },
        pearl: '#EDEDED',
        mutedGrey: '#8A898E',
        champagne: '#D4AF37',
        barber: {
          // Exact Art Direction Palette
          gold: '#D4AF37',             // Oro champán satinado
          goldLight: '#E8D595',        // Champán claro
          goldDark: '#997B1C',         // Champán tenue
          matcha: '#D4AF37',
          pistache: '#8A898E',         // Gris apagado editorial
          almond: 'rgba(255, 255, 255, 0.08)',
          vanilla: '#D4AF37',
          chai: '#D4AF37',             // Acento oro champán satinado
          carob: '#0B0B0C',            // Negro carbón mate
          darkBg: '#0B0B0C',           // Fondo negro carbón mate
          darkSurface: '#141416',      // Superficie tarjeta carbón
          darkBorder: 'rgba(255, 255, 255, 0.08)', // Borde sutil 1px
          darkText: '#EDEDED',         // Blanco perla
          darkMuted: '#8A898E',        // Gris apagado
          darkPrimary: '#EDEDED',      // Botón principal
          darkSecondary: '#D4AF37',    // Acento oro champán
          lightBg: '#0B0B0C',          // Modo uniforme de lujo
          lightSurface: '#141416',
          lightBorder: 'rgba(255, 255, 255, 0.08)',
          lightText: '#EDEDED',
          lightMuted: '#8A898E',
          lightPrimary: '#EDEDED',
          lightSecondary: '#D4AF37',
        }
      },
      fontFamily: {
        display: ['"Archivo"', 'system-ui', 'sans-serif'],
        editorial: ['"Newsreader"', 'Georgia', 'serif'],
        sans: ['"Work Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Azeret Mono"', 'monospace'],
      },
      letterSpacing: {
        editorial: '0.15em',
        tightest: '-0.03em',
      }
    }
  },
  plugins: [],
}
