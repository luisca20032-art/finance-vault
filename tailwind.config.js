/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // GT Walsheim → Nunito Sans como sustituto fiel (mismo espíritu: clean, bold, digital-first)
        sans: ['"Nunito Sans"', 'Arial', 'sans-serif'],
      },
      colors: {
        // ── Grant Thornton Core Colours ──────────────────────────────
        'gt-purple':    '#4F2D7F',   // Color de marca principal
        'gt-purple-80': '#72579A',   // Tint 80%
        'gt-purple-60': '#9581B2',   // Tint 60%
        'gt-purple-40': '#B9ABCC',   // Tint 40%
        'gt-purple-20': '#DCD5E5',   // Tint 20%
        'gt-white':     '#FFFFFF',
        'gt-warm-grey': '#CBC4BC',   // Solo fondos, nunca texto
        'gt-black':     '#000000',   // Solo body copy

        // ── Grant Thornton Accent Colours ────────────────────────────
        'gt-teal':      '#00A7B5',
        'gt-green':     '#9BD732',
        'gt-orange':    '#FF7D1E',
        'gt-red':       '#DE002E',

        // ── Alias semánticos para la app ─────────────────────────────
        primary:        '#4F2D7F',   // gt-purple
        'primary-light':'#DCD5E5',   // gt-purple-20
        'primary-mid':  '#9581B2',   // gt-purple-60
        surface:        '#F9F8FB',   // blanco con tinte purple muy sutil
        'surface-dark': '#1e1a2e',
        accent:         '#00A7B5',   // gt-teal como acento principal de la app
      },
    },
  },
  plugins: [],
}
