import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

declare const process: any;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // To access env vars in client-side code, we need to define them here
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})
