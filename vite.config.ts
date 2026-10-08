import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { localApi } from './dev/localApi.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'SUPABASE_'])
  const publicKey = env.VITE_SUPABASE_PUBLISHABLE_KEY
  let legacyRole: unknown
  if (publicKey?.startsWith('eyJ')) {
    try { legacyRole = JSON.parse(Buffer.from(publicKey.split('.')[1], 'base64url').toString()).role } catch { /* Invalid keys are handled by the API client. */ }
  }
  if (publicKey?.startsWith('sb_secret_') || legacyRole === 'service_role') {
    throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY must contain a publishable/anon key. Keep secret/service-role keys server-only.')
  }
  return {
    plugins: [react(), localApi(env)],
    server: { host: '0.0.0.0', port: 5173, strictPort: true },
  }
})
