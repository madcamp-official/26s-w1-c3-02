/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page: '#f8f6f1',
        pageSoft: '#fbfaf7',
        surface: '#ffffff',
        surfaceMuted: '#f3f5f8',
        primary: {
          DEFAULT: '#0f2547',
          hover: '#173761',
          soft: '#e8eef7',
        },
        text: {
          DEFAULT: '#172033',
          muted: '#68748a',
          subtle: '#9aa4b5',
        },
        line: {
          DEFAULT: '#e3e7ee',
          strong: '#cfd6e2',
        },
        accent: {
          blue: '#dceaf7',
          green: '#e4eee5',
          cream: '#f3eadc',
          rose: '#f1e4e1',
        },
        danger: {
          DEFAULT: '#b54747',
          soft: '#f8e8e8',
        },
      },
      boxShadow: {
        soft: '0 2px 8px rgba(15, 37, 71, 0.06)',
        card: '0 8px 24px rgba(15, 37, 71, 0.10)',
        float: '0 18px 48px rgba(15, 37, 71, 0.14)',
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '18px',
      },
      fontFamily: {
        sans: ['Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        layout: '1200px',
      },
    },
  },
  plugins: [],
};
