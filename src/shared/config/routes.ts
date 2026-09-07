const HOME = '/'
const RUNS = '/runs'
const PROJECTS = '/projects'
const INBOX = '/inbox'
const METHOD = '/method'
const UI_KIT_PREVIEW = '/ui-kit-preview'

export const routePaths = {
  runs: RUNS,
  runCreate: 'new',
  runGraphSmoke: 'graph-smoke',
  run: ':runId',

  projects: PROJECTS,
  projectCreate: `${PROJECTS}/new`,
  project: `${PROJECTS}/:projectId`,
  projectSettings: `${PROJECTS}/:projectId/settings`,

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

  runs: (): string => RUNS,
  runCreate: (): string => `${RUNS}/new`,
  runGraphSmoke: (): string => `${RUNS}/graph-smoke`,
  run: (runId: string): string => `${RUNS}/${runId}`,

  projects: (): string => PROJECTS,
  projectCreate: (): string => `${PROJECTS}/new`,
  project: (projectId: string): string => `${PROJECTS}/${projectId}`,
  projectSettings: (projectId: string): string => `${PROJECTS}/${projectId}/settings`,

  inbox: (): string => INBOX,
  inboxItem: (itemId: string): string => `${INBOX}/${itemId}`,

  methodRoles: (): string => `${METHOD}/roles`,
  methodRole: (roleId: string): string => `${METHOD}/roles/${roleId}`,
  methodPipelines: (): string => `${METHOD}/pipelines`,
  methodPipeline: (pipelineId: string): string => `${METHOD}/pipelines/${pipelineId}`,
  methodPlaybooks: (): string => `${METHOD}/playbooks`,

  uiKitPreview: (): string => UI_KIT_PREVIEW,
} as const
