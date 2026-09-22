import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const allowedHostsFromEnv = process.env.VITE_ALLOWED_HOSTS
  ? process.env.VITE_ALLOWED_HOSTS.split(',').map((h) => h.trim()).filter(Boolean)
  : true

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    // Sandbox / dev environments need permissive host resolution.
    // Set VITE_ALLOWED_HOSTS=your.domain.com,other.domain.com in production.
    allowedHosts: allowedHostsFromEnv,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    // NOTE: `vite preview` is only for local testing of production builds.
    // Real deployments (Vercel, Netlify, Supabase) serve the static `dist/`
    // folder directly — this setting does not apply there.
    // Set VITE_ALLOWED_HOSTS when self-hosting with `vite preview`.
    allowedHosts: allowedHostsFromEnv,
  },
})
