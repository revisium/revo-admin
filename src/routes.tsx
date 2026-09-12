import { Route, Routes } from 'react-router'
import AppLayout from './routes/AppLayout'
import Assistant from './routes/Assistant'
import Chat from './routes/Chat'
import Home from './routes/Home'
import Inbox from './routes/Inbox'
import InboxItem from './routes/InboxItem'
import MethodPipelineDetail from './routes/MethodPipelineDetail'
import MethodPipelines from './routes/MethodPipelines'
import MethodPlaybooks from './routes/MethodPlaybooks'
import MethodRoleDetail from './routes/MethodRoleDetail'
import MethodRoles from './routes/MethodRoles'
import ProjectAdrDetail from './routes/ProjectAdrDetail'
import ProjectCreate from './routes/ProjectCreate'
import ProjectDetail from './routes/ProjectDetail'
import ProjectDetailTab from './routes/ProjectDetailTab'
import ProjectKnowledgeArticle from './routes/ProjectKnowledgeArticle'
import ProjectMemoryTable from './routes/ProjectMemoryTable'
import Projects from './routes/Projects'
import RunCreate from './routes/RunCreate'
import RunDetail from './routes/RunDetail'
import RunGraphSmoke from './routes/RunGraphSmoke'
import RunsBoard from './routes/RunsBoard'
import RunsLayout from './routes/RunsLayout'
import UiKitPreview from './routes/UiKitPreview'
import { routePaths } from './shared/config'

const NotFound = () => (
  <main style={{ padding: '2rem' }}>
    <h1>404</h1>
    <p>Page not found.</p>
  </main>
)

export const AppRoutes = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<Home />} />
      <Route path={routePaths.assistant} element={<Assistant />} />
      <Route path={routePaths.chat} element={<Chat />} />
      <Route path={routePaths.runs} element={<RunsLayout />}>
        <Route index element={<RunsBoard />} />
        <Route path={routePaths.runCreate} element={<RunCreate />} />
        <Route path={routePaths.runGraphSmoke} element={<RunGraphSmoke />} />
        <Route path={routePaths.run} element={<RunDetail />} />
      </Route>
      <Route path={routePaths.projects} element={<Projects />} />
      <Route path={routePaths.projectCreate} element={<ProjectCreate />} />
      <Route path={routePaths.project} element={<ProjectDetail />} />
      <Route path={routePaths.projectKnowledgeArticle} element={<ProjectKnowledgeArticle />} />
      <Route path={routePaths.projectAdr} element={<ProjectAdrDetail />} />
      <Route path={routePaths.projectMemoryTable} element={<ProjectMemoryTable />} />
      <Route path={routePaths.projectTab} element={<ProjectDetailTab />} />
      <Route path={routePaths.inbox} element={<Inbox />} />
      <Route path={routePaths.inboxItem} element={<InboxItem />} />
      <Route path={routePaths.methodRoles} element={<MethodRoles />} />
      <Route path={routePaths.methodRole} element={<MethodRoleDetail />} />
      <Route path={routePaths.methodPipelines} element={<MethodPipelines />} />
      <Route path={routePaths.methodPipeline} element={<MethodPipelineDetail />} />
      <Route path={routePaths.methodPlaybooks} element={<MethodPlaybooks />} />
    </Route>
    <Route path={routePaths.uiKitPreview} element={<UiKitPreview />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
)
