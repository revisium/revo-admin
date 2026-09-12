import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import type { Config } from '@react-router/dev/config'

export default {
  appDirectory: 'src',
  ssr: false,
  buildEnd: async ({ reactRouterConfig }) => {
    if (reactRouterConfig.ssr) return

    await rm(join(reactRouterConfig.buildDirectory, 'server'), {
      force: true,
      recursive: true,
    })
  },
} satisfies Config
