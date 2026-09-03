import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

export default [
  layout('routes/AppLayout.tsx', [
    index('routes/Home.tsx'),
    route('/runs', 'routes/RunsLayout.tsx', [
      index('routes/RunsBoard.tsx'),
      route('new', 'routes/RunCreate.tsx'),
      route('graph-smoke', 'routes/RunGraphSmoke.tsx'),
      route(':runId', 'routes/RunDetail.tsx'),
    ]),
    route('/projects', 'routes/Projects.tsx'),
    route('/projects/:projectId', 'routes/ProjectDetail.tsx'),
    route('/projects/:projectId/knowledge/:articleId', 'routes/ProjectKnowledgeArticle.tsx'),
    route('/projects/:projectId/adrs/:adrId', 'routes/ProjectAdrDetail.tsx'),
    route('/projects/:projectId/memory/:tableId', 'routes/ProjectMemoryTable.tsx'),
    route('/projects/:projectId/:tab', 'routes/ProjectDetailTab.tsx'),
    route('/inbox', 'routes/Inbox.tsx'),
    route('/inbox/:itemId', 'routes/InboxItem.tsx'),
    route('/method/roles', 'routes/MethodRoles.tsx'),
    route('/method/roles/:roleId', 'routes/MethodRoleDetail.tsx'),
    route('/method/pipelines', 'routes/MethodPipelines.tsx'),
    route('/method/pipelines/:id', 'routes/MethodPipelineDetail.tsx'),
    route('/method/playbooks', 'routes/MethodPlaybooks.tsx'),
  ]),
  route('/ui-kit-preview', 'routes/UiKitPreview.tsx'),
] satisfies RouteConfig
