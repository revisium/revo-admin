import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'
import { routePaths } from './shared/config'

export default [
  layout('routes/AppLayout.tsx', [
    index('routes/Home.tsx'),
    route(routePaths.runs, 'routes/RunsLayout.tsx', [
      index('routes/RunsBoard.tsx'),
      route(routePaths.runCreate, 'routes/RunCreate.tsx'),
      route(routePaths.runGraphSmoke, 'routes/RunGraphSmoke.tsx'),
      route(routePaths.run, 'routes/RunDetail.tsx'),
    ]),
    route(routePaths.projects, 'routes/Projects.tsx'),
    route(routePaths.project, 'routes/ProjectDetail.tsx'),
    route(routePaths.projectKnowledgeArticle, 'routes/ProjectKnowledgeArticle.tsx'),
    route(routePaths.projectAdr, 'routes/ProjectAdrDetail.tsx'),
    route(routePaths.projectMemoryTable, 'routes/ProjectMemoryTable.tsx'),
    route(routePaths.projectTab, 'routes/ProjectDetailTab.tsx'),
    route(routePaths.inbox, 'routes/Inbox.tsx'),
    route(routePaths.inboxItem, 'routes/InboxItem.tsx'),
    route(routePaths.methodRoles, 'routes/MethodRoles.tsx'),
    route(routePaths.methodRole, 'routes/MethodRoleDetail.tsx'),
    route(routePaths.methodPipelines, 'routes/MethodPipelines.tsx'),
    route(routePaths.methodPipeline, 'routes/MethodPipelineDetail.tsx'),
    route(routePaths.methodPlaybooks, 'routes/MethodPlaybooks.tsx'),
  ]),
  route(routePaths.uiKitPreview, 'routes/UiKitPreview.tsx'),
] satisfies RouteConfig
