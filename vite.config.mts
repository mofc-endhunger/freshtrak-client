import { defineConfig, transformWithEsbuild, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const pantryApiTarget = env.REACT_APP_PANTRY_FINDER_API || 'http://localhost:3002';
  const registrationApiTarget = env.REACT_APP_REGISTRATION_API || 'http://localhost:3001';

  return {
    plugins: [
      {
        name: 'treat-js-files-as-jsx',
        enforce: 'pre',
        async transform(code, id) {
          if (!id.includes('/src/') || !id.endsWith('.js')) {
            return null;
          }

          return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic',
          });
        },
      },
      react({
        include: /\.[jt]sx?$/,
      }),
    ],
    envPrefix: ['REACT_APP_', 'VITE_'],
    optimizeDeps: {
      entries: ['index.html'],
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    server: {
      port: 5000,
      strictPort: true,
      proxy: {
        '/api/agencies': {
          target: pantryApiTarget,
          changeOrigin: true,
        },
        '/api/foodbanks': {
          target: pantryApiTarget,
          changeOrigin: true,
        },
        '/api/events': {
          target: pantryApiTarget,
          changeOrigin: true,
        },
        '/api/event_dates': {
          target: pantryApiTarget,
          changeOrigin: true,
        },
        '/api/guest-authentications': {
          target: registrationApiTarget,
          changeOrigin: true,
        },
        '/api/registrations': {
          target: registrationApiTarget,
          changeOrigin: true,
        },
        '/twilio': {
          target: registrationApiTarget,
          changeOrigin: true,
        },
        '/households': {
          target: registrationApiTarget,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
