import type { CodegenConfig } from '@graphql-codegen/cli'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseEnv } from 'node:util'

const args = process.argv.slice(2)
const isDownload = args.includes('--download')

const DEFAULT_GRAPHQL_ENDPOINT = 'http://127.0.0.1:19323/graphql'
const ENV_DIR = '.env'
const SCHEMA_SNAPSHOT = './src/__generated__/schema.graphql'

function readEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {}
  return parseEnv(readFileSync(filePath, 'utf8'))
}

function loadLocalEnv(mode: string): Record<string, string> {
  return Object.assign(
    {},
    readEnvFile(resolve(ENV_DIR, '.env')),
    readEnvFile(resolve(ENV_DIR, '.env.local')),
    readEnvFile(resolve(ENV_DIR, `.env.${mode}`)),
    readEnvFile(resolve(ENV_DIR, `.env.${mode}.local`)),
  )
}

const env = { ...loadLocalEnv(process.env.NODE_ENV ?? 'development'), ...process.env }

const graphqlEndpoint =
  env.REVO_ADMIN_GRAPHQL_ENDPOINT ??
  (env.REVO_ADMIN_GRAPHQL_TARGET ? `${env.REVO_ADMIN_GRAPHQL_TARGET}/graphql` : DEFAULT_GRAPHQL_ENDPOINT)

const scalars = {
  DateTime: 'string',
  JSON: 'unknown',
}

const disablePlugin = {
  add: {
    content: ['/* eslint-disable */', '/* prettier-ignore */'],
  },
}

const config: CodegenConfig = {
  overwrite: true,
  schema: isDownload ? graphqlEndpoint : SCHEMA_SNAPSHOT,
  ignoreNoDocuments: false,
  generates: {
    ...(isDownload
      ? {
          [SCHEMA_SNAPSHOT]: {
            plugins: ['schema-ast'],
            config: {
              includeDirectives: true,
            },
          },
        }
      : {
          './src/__generated__/graphql-request.ts': {
            documents: ['src/shared/**/*.graphql'],
            plugins: [disablePlugin, 'typescript', 'typescript-operations', 'typescript-graphql-request'],
            config: {
              rawRequest: false,
              skipTypename: true,
              scalars,
            },
          },
          './src/modules/dialogue-engine/transport/graphql/__generated__/graphql-request.ts': {
            documents: ['src/modules/dialogue-engine/transport/graphql/*.graphql'],
            plugins: [disablePlugin, 'typescript', 'typescript-operations', 'typescript-graphql-request'],
            config: {
              rawRequest: false,
              skipTypename: true,
              scalars,
              documentMode: 'external',
              importDocumentNodeExternallyFrom: './typed-document-nodes',
            },
          },
          './src/modules/dialogue-engine/transport/graphql/__generated__/typed-document-nodes.ts': {
            documents: ['src/modules/dialogue-engine/transport/graphql/*.graphql'],
            plugins: [
              disablePlugin,
              { add: { content: "import type * as Types from './graphql-request';" } },
              'typed-document-node',
            ],
            config: { importOperationTypesFrom: 'Types' },
          },
        }),
  },
}

export default config
