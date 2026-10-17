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
        barber: {
          // Swatches base (Black, White & Gold Luxury Studio)
          gold: '#D4AF37',             // Dorado pulido clásico
          goldLight: '#F3E5AB',        // Champagne / Dorado claro
          goldDark: '#AA820A',         // Dorado oscuro / bronce
          matcha: '#D4AF37',           // Mapeado a Dorado para acentos principales
          pistache: '#A3A3A3',         // Gris plata neutro para texto secundario
          almond: '#E5E5E5',           // Borde claro neutro
          vanilla: '#F3E5AB',          // Champagne
          chai: '#D4AF37',             // Dorado de autor
          carob: '#0A0A0A',            // Negro puro profundo

          // Modo Claro (Blanco puro, texto negro, detalles dorado)
          lightBg: '#FAFAFA',          // Fondo blanco limpio
          lightSurface: '#FFFFFF',     // Tarjetas y modales blancos
          lightBorder: '#E5E5E5',      // Separadores gris claro
          lightText: '#0A0A0A',        // Texto negro nítido
          lightMuted: '#737373',       // Texto secundario gris
          lightPrimary: '#0A0A0A',     // Botones negros de alto impacto
          lightSecondary: '#D4AF37',   // Acentos dorados

          // Modo Oscuro (Negro obsidiana, blanco puro, detalles dorado)
          darkBg: '#0A0A0A',           // Fondo negro azabache
          darkSurface: '#141414',      // Tarjetas negro carbón
          darkBorder: '#262626',       // Separadores gris oscuro
          darkText: '#FFFFFF',         // Texto blanco puro
          darkMuted: '#A3A3A3',        // Texto secundario gris plata
          darkPrimary: '#D4AF37',      // Botones principales dorados
          darkSecondary: '#D4AF37',    // Acentos dorados
        }
      },
      fontFamily: {
        display: ['"Archivo"', 'sans-serif'],
        editorial: ['"Newsreader"', 'Georgia', 'serif'],
        sans: ['"Work Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Azeret Mono"', 'monospace'],
      }
    }
  },
  plugins: [],
}
