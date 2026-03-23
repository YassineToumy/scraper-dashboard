export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    },
  },

  app: {
    head: {
      title: 'Scraper Dashboard',
      meta: [{ name: 'description', content: 'Real Estate Scraper Dashboard' }],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
      ],
    },
  },

  tailwindcss: {
    config: {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'sans-serif'] },
          colors: {
            dark: {
              900: '#0a0a0f',
              800: '#111118',
              700: '#1a1a24',
              600: '#23232f',
              500: '#2e2e3d',
            },
          },
        },
      },
    },
  },

  compatibilityDate: '2024-07-01',
})
