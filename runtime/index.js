import { fileURLToPath } from 'node:url'

const clientDirectoryUrl = new URL('../build/client/', import.meta.url)

export const getRevoAdminClientDirectory = () => fileURLToPath(clientDirectoryUrl)
