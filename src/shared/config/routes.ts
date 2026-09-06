const HOME = '/'
const ASSISTANT = '/assistant'
const RUNS = '/runs'
const PROJECTS = '/projects'
const INBOX = '/inbox'
const METHOD = '/method'
const UI_KIT_PREVIEW = '/ui-kit-preview'

// Route templates feed the router config; builders feed links and navigation. Both come from
// the same constants, so a renamed segment cannot leave one of them behind. Templates nested
// under a layout stay relative, exactly as the router expects them.
export const routePaths = {
  assistant: ASSISTANT,
  chat: `${ASSISTANT}/:chatId`,
  runs: RUNS,
  runCreate: 'new',
  runGraphSmoke: 'graph-smoke',
  run: ':runId',

  projects: PROJECTS,
  projectCreate: `${PROJECTS}/new`,
  project: `${PROJECTS}/:projectId`,
  projectKnowledgeArticle: `${PROJECTS}/:projectId/knowledge/:articleId`,
  projectAdr: `${PROJECTS}/:projectId/adrs/:adrId`,
  projectMemoryTable: `${PROJECTS}/:projectId/memory/:tableId`,
  projectTab: `${PROJECTS}/:projectId/:tab`,

  inbox: INBOX,
  inboxItem: `${INBOX}/:itemId`,

  methodRoles: `${METHOD}/roles`,
  methodRole: `${METHOD}/roles/:roleId`,
  methodPipelines: `${METHOD}/pipelines`,
  methodPipeline: `${METHOD}/pipelines/:id`,
  methodPlaybooks: `${METHOD}/playbooks`,

  uiKitPreview: UI_KIT_PREVIEW,
} as const

export const routes = {
  home: (): string => HOME,
  assistant: (): string => ASSISTANT,
  chat: (chatId: string): string => `${ASSISTANT}/${chatId}`,

  runs: (): string => RUNS,
  runCreate: (): string => `${RUNS}/new`,
  runGraphSmoke: (): string => `${RUNS}/graph-smoke`,
  run: (runId: string): string => `${RUNS}/${runId}`,

  projects: (): string => PROJECTS,
  projectCreate: (): string => `${PROJECTS}/new`,
  project: (projectId: string): string => `${PROJECTS}/${projectId}`,
  projectTab: (projectId: string, tab: string): string => `${PROJECTS}/${projectId}/${tab}`,
  projectKnowledgeArticle: (projectId: string, articleId: string): string =>
    `${PROJECTS}/${projectId}/knowledge/${articleId}`,
  projectAdr: (projectId: string, adrId: string): string => `${PROJECTS}/${projectId}/adrs/${adrId}`,
  projectMemoryTable: (projectId: string, tableId: string): string => `${PROJECTS}/${projectId}/memory/${tableId}`,

  inbox: (): string => INBOX,
  inboxItem: (itemId: string): string => `${INBOX}/${itemId}`,

  methodRoles: (): string => `${METHOD}/roles`,
  methodRole: (roleId: string): string => `${METHOD}/roles/${roleId}`,
  methodPipelines: (): string => `${METHOD}/pipelines`,
  methodPipeline: (pipelineId: string): string => `${METHOD}/pipelines/${pipelineId}`,
  methodPlaybooks: (): string => `${METHOD}/playbooks`,

  uiKitPreview: (): string => UI_KIT_PREVIEW,
} as const
