/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./Codigo_Fonte/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        escuro: {
          950: '#0B0F17',
          900: '#111827',
          850: '#151E2E',
          800: '#1F2937',
          700: '#374151',
        },
        destaque: {
          azul: '#3B82F6',
          roxo: '#8B5CF6',
          verde: '#10B981',
          vermelho: '#EF4444',
          amarelo: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
}
