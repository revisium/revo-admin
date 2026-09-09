import { defineConfig, loadEnv } from 'vite'
import { reactRouter } from '@react-router/dev/vite'
import checker from 'vite-plugin-checker'
import { resolve } from 'node:path'

const ENV_DIR = '.env'
const ENV_PREFIX = 'REACT_APP_'
const DEFAULT_ADMIN_PORT = 5173
const DEFAULT_GRAPHQL_PORT = 19222
const MAX_TCP_PORT = 65_535

function parsePort(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback
  const port = Number.parseInt(raw, 10)
  if (!Number.isInteger(port) || port <= 0 || port > MAX_TCP_PORT) return fallback
  return port
}

function graphqlBackend(env: Record<string, string | undefined>) {
  const endpoint = env.REVO_ADMIN_GRAPHQL_HTTP_URL ?? env.REVO_ADMIN_GRAPHQL_ENDPOINT
  let target = env.REVO_ADMIN_GRAPHQL_TARGET
  if (target === undefined && endpoint) target = new URL(endpoint).origin
  if (target === undefined && env.REVO_DEV_GRAPHQL_PORT) {
    target = `http://127.0.0.1:${parsePort(env.REVO_DEV_GRAPHQL_PORT, DEFAULT_GRAPHQL_PORT)}`
  }

  return target ? { target, endpoint: endpoint ?? new URL('/graphql', target).toString() } : undefined
}

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, ENV_DIR, '')
  const env = { ...fileEnv, ...process.env }

  const adminPort = parsePort(env.REVO_ADMIN_PORT, DEFAULT_ADMIN_PORT)
  const backend = graphqlBackend(process.env) ??
    graphqlBackend(fileEnv) ?? {
      target: `http://127.0.0.1:${DEFAULT_GRAPHQL_PORT}`,
      endpoint: `http://127.0.0.1:${DEFAULT_GRAPHQL_PORT}/graphql`,
    }

  return {
    plugins: [
      {
        name: 'graphql-development-env',
        configureServer() {
          // SSR reads process.env; these backend URLs are not exposed to browser modules.
          process.env.REVO_ADMIN_GRAPHQL_ENDPOINT ??= backend.endpoint
        },
      },
      reactRouter(),
      checker({
        typescript: true,
      }),
    ],

    resolve: {
      alias: {
        src: resolve(import.meta.dirname, 'src'),
      },
    },

    envDir: ENV_DIR,
    envPrefix: ENV_PREFIX,

    server: {
      host: '127.0.0.1',
      port: adminPort,
      proxy: {
        '/graphql': {
          target: backend.target,
          changeOrigin: true,
        },
      },
    },
  }
})
