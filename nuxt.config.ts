// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ["~/assets/css/tailwind.css"],
  runtimeConfig: {
    public: {
      rapidKey: process.env.RAPID_API_KEY,
    },
    spotifyId: process.env.SPOTIFY_CLIENT_ID,
    spotifySecret: process.env.SPOTIFY_CLIENT_SECRET,
  },

  modules: ["@nuxt/image", "shadcn-nuxt"],
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
