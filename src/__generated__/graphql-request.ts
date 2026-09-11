/* eslint-disable */
/* prettier-ignore */
import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: unknown; output: unknown; }
};

export type AdrAlternativeInput = {
  summary: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type AdrAlternativeModel = {
  summary: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type AdrConnectionModel = {
  edges: Array<AdrEdgeModel>;
  pageInfo: PageInfoModel;
  totalCount: Scalars['Int']['output'];
};

export type AdrEdgeModel = {
  cursor: Scalars['String']['output'];
  node: AdrModel;
};

export type AdrInput = {
  alternatives: Array<AdrAlternativeInput>;
  consequences: Scalars['String']['input'];
  context: Scalars['String']['input'];
  decision: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
  relatedRequirements: Array<Scalars['String']['input']>;
  status: AdrStatus;
  supersededBy: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type AdrModel = {
  alternatives: Array<AdrAlternativeModel>;
  consequences: Scalars['String']['output'];
  context: Scalars['String']['output'];
  decision: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  relatedRequirements: Array<Scalars['String']['output']>;
  status: AdrStatus;
  supersededBy: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export enum AdrStatus {
  Accepted = 'accepted',
  Deprecated = 'deprecated',
  Proposed = 'proposed',
  Rejected = 'rejected',
  Superseded = 'superseded'
}

export type AgentCapabilitiesModel = {
  cancellation: Scalars['Boolean']['output'];
  session: AgentSessionCapabilitiesModel;
  structuredResult: Scalars['Boolean']['output'];
  usage: Scalars['Boolean']['output'];
};

export type AgentConfigurationBooleanModel = {
  category?: Maybe<Scalars['String']['output']>;
  currentValue: Scalars['Boolean']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type AgentConfigurationCatalogModel = {
  agent: AgentRefModel;
  catalogRevision: Scalars['String']['output'];
  definitionDigest: Scalars['String']['output'];
  launch: AgentLaunchEvidenceModel;
  model?: Maybe<AgentConfigurationModelView>;
  options: Array<AgentConfigurationOption>;
  schemaVersion: Scalars['String']['output'];
};

export type AgentConfigurationGroupModel = {
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type AgentConfigurationModelView = {
  currentModel: Scalars['String']['output'];
  currentProvider?: Maybe<AgentConfigurationGroupModel>;
  optionId: Scalars['String']['output'];
  providers: Array<AgentConfigurationProviderModel>;
  sessionAvailable: Array<AgentConfigurationValueModel>;
};

export type AgentConfigurationOption = AgentConfigurationBooleanModel | AgentConfigurationSelectModel;

export type AgentConfigurationProviderModel = {
  id: Scalars['String']['output'];
  models: Array<AgentConfigurationValueModel>;
  name: Scalars['String']['output'];
};

export type AgentConfigurationSelectModel = {
  category?: Maybe<Scalars['String']['output']>;
  currentValue: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  values: Array<AgentConfigurationValueModel>;
};

export type AgentConfigurationValueModel = {
  description?: Maybe<Scalars['String']['output']>;
  group?: Maybe<AgentConfigurationGroupModel>;
  name: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type AgentConfigurationsModel = {
  catalogs: Array<AgentConfigurationCatalogModel>;
  status: AgentConfigurationsStatus;
};

export enum AgentConfigurationsStatus {
  Loading = 'LOADING',
  NotInitialized = 'NOT_INITIALIZED',
  Ready = 'READY'
}

export type AgentDefinitionConnectionModel = {
  edges: Array<AgentDescriptorEdge>;
  pageInfo: PageInfoModel;
  totalCount: Scalars['Int']['output'];
};

export type AgentDescriptorEdge = {
  cursor: Scalars['String']['output'];
  node: AgentDescriptorModel;
};

export type AgentDescriptorModel = {
  agent: AgentRefModel;
  capabilities: AgentCapabilitiesModel;
  definitionDigest: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  displayName: Scalars['String']['output'];
};

export type AgentInteractionCapabilitiesModel = {
  input: Scalars['Boolean']['output'];
  permission: Scalars['Boolean']['output'];
};

export type AgentLaunchEvidenceModel = {
  executable: Scalars['String']['output'];
  reportedVersion: Scalars['String']['output'];
};

export type AgentRefModel = {
  id: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

export type AgentSessionCapabilitiesModel = {
  interactions: AgentInteractionCapabilitiesModel;
  multiTurn: Scalars['Boolean']['output'];
  resume: Scalars['String']['output'];
  updates: AgentUpdateCapabilitiesModel;
};

export type AgentUpdateCapabilitiesModel = {
  message: Scalars['Boolean']['output'];
  plan: Scalars['Boolean']['output'];
  progress: Scalars['Boolean']['output'];
  tool: Scalars['Boolean']['output'];
  usage: Scalars['Boolean']['output'];
};

export type CatalogChangeEntryConnection = {
  edges: Array<CatalogChangeEntryEdge>;
  pageInfo: PageInfoModel;
  totalCount: Scalars['Int']['output'];
};

export type CatalogChangeEntryEdge = {
  cursor: Scalars['String']['output'];
  node: CatalogChangeEntryModel;
};

export type CatalogChangeEntryModel = {
  changeType: CatalogChangeType;
  entryId: Scalars['ID']['output'];
  fieldPaths: Array<Scalars['String']['output']>;
  previousRecordId?: Maybe<Scalars['ID']['output']>;
  recordId: Scalars['ID']['output'];
  tableId: CatalogTable;
};

export enum CatalogChangeType {
  Added = 'ADDED',
  Modified = 'MODIFIED',
  Removed = 'REMOVED',
  Renamed = 'RENAMED',
  RenamedAndModified = 'RENAMED_AND_MODIFIED'
}

export type CatalogCommitResultModel = {
  previousRevisionId: Scalars['ID']['output'];
  revisionId: Scalars['ID']['output'];
};

export type CatalogImportResultModel = {
  tables: Array<CatalogImportTableResultModel>;
};

export type CatalogImportTableResultModel = {
  created: Scalars['Int']['output'];
  tableId: CatalogTable;
  updated: Scalars['Int']['output'];
};

export type CatalogMutationResultModel = {
  changes: CatalogChangeEntryConnection;
  status: CatalogStatusModel;
};

export enum CatalogScope {
  Draft = 'DRAFT',
  Head = 'HEAD',
  Revision = 'REVISION'
}

export type CatalogSnapshotModel = {
  isHead: Scalars['Boolean']['output'];
  launchProfiles: Array<LaunchProfileModel>;
  methodDocuments: Array<MethodDocumentModel>;
  pipelineRoles: Array<PipelineRoleModel>;
  pipelines: Array<PipelineModel>;
  playbooks: Array<PlaybookModel>;
  revisionId: Scalars['ID']['output'];
  roleRefs: Array<RoleRefModel>;
  roles: Array<RoleModel>;
  sharedReferences: Array<SharedReferenceModel>;
  stackRefs: Array<StackRefModel>;
  stacks: Array<StackModel>;
};

export type CatalogStatusModel = {
  draftRevisionId: Scalars['ID']['output'];
  hasChanges: Scalars['Boolean']['output'];
  headRevisionId: Scalars['ID']['output'];
  totalChanges: Scalars['Int']['output'];
};

export enum CatalogTable {
  LaunchProfiles = 'launchProfiles',
  MethodDocuments = 'methodDocuments',
  PipelineRoles = 'pipelineRoles',
  Pipelines = 'pipelines',
  Playbooks = 'playbooks',
  RoleRefs = 'roleRefs',
  Roles = 'roles',
  SharedReferences = 'sharedReferences',
  StackRefs = 'stackRefs',
  Stacks = 'stacks'
}

export type CreateDialogueInput = {
  agentConfiguration?: InputMaybe<Scalars['JSON']['input']>;
  agentId: Scalars['String']['input'];
  agentVersion: Scalars['String']['input'];
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  systemContext?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type DialogueChangeModel = {
  baseItemVersion?: Maybe<Scalars['String']['output']>;
  cursor: Scalars['String']['output'];
  dialogueId: Scalars['ID']['output'];
  item?: Maybe<DialogueHistoryItemModel>;
  itemId?: Maybe<Scalars['ID']['output']>;
  itemKind?: Maybe<Scalars['String']['output']>;
  itemSequence?: Maybe<Scalars['String']['output']>;
  itemSource?: Maybe<Scalars['String']['output']>;
  itemVersion?: Maybe<Scalars['String']['output']>;
  kind: Scalars['String']['output'];
  summary?: Maybe<DialogueSummaryModel>;
  textDelta?: Maybe<Scalars['String']['output']>;
  turnId?: Maybe<Scalars['ID']['output']>;
};

export type DialogueHistoryItemConnectionModel = {
  edges: Array<DialogueHistoryItemEdge>;
  observedSignificantSequence?: Maybe<Scalars['String']['output']>;
  pageInfo: PageInfoModel;
  snapshotCursor: Scalars['String']['output'];
  totalCount: Scalars['Int']['output'];
};

export type DialogueHistoryItemEdge = {
  cursor: Scalars['String']['output'];
  node: DialogueHistoryItemModel;
};

export type DialogueHistoryItemModel = {
  createdAt: Scalars['DateTime']['output'];
  dialogueId: Scalars['ID']['output'];
  historical: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  kind: Scalars['String']['output'];
  payload?: Maybe<Scalars['JSON']['output']>;
  sequence: Scalars['String']['output'];
  source: Scalars['String']['output'];
  status: Scalars['String']['output'];
  text: Scalars['String']['output'];
  turnId?: Maybe<Scalars['ID']['output']>;
  version: Scalars['String']['output'];
};

export type DialogueInteractionConnectionModel = {
  edges: Array<DialogueInteractionEdge>;
  pageInfo: PageInfoModel;
  snapshotCursor: Scalars['String']['output'];
  totalCount: Scalars['Int']['output'];
};

export type DialogueInteractionEdge = {
  cursor: Scalars['String']['output'];
  node: DialogueInteractionModel;
};

export type DialogueInteractionModel = {
  dialogueId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  request: Scalars['JSON']['output'];
  response?: Maybe<Scalars['JSON']['output']>;
  responseCommandId?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  turnId?: Maybe<Scalars['ID']['output']>;
};

export type DialogueSummaryConnectionModel = {
  edges: Array<DialogueSummaryEdge>;
  pageInfo: PageInfoModel;
  snapshotCursor: Scalars['String']['output'];
  totalCount: Scalars['Int']['output'];
};

export type DialogueSummaryEdge = {
  cursor: Scalars['String']['output'];
  node: DialogueSummaryModel;
};

export type DialogueSummaryModel = {
  activeTurnId?: Maybe<Scalars['ID']['output']>;
  agentConfiguration: Scalars['JSON']['output'];
  agentId: Scalars['String']['output'];
  agentVersion: Scalars['String']['output'];
  contextMode: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  lastOutcome?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['JSON']['output']>;
  originDialogueId?: Maybe<Scalars['ID']['output']>;
  originItemSequence?: Maybe<Scalars['String']['output']>;
  originTurnId?: Maybe<Scalars['ID']['output']>;
  pendingCount: Scalars['Int']['output'];
  progress: Scalars['String']['output'];
  readSignificantSequence: Scalars['String']['output'];
  runtimeSessionId?: Maybe<Scalars['ID']['output']>;
  significantSequence: Scalars['String']['output'];
  status: Scalars['String']['output'];
  systemContext: Scalars['String']['output'];
  title: Scalars['String']['output'];
  unreadCount: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  version: Scalars['String']['output'];
};

export type DialogueTurnConnectionModel = {
  edges: Array<DialogueTurnEdge>;
  pageInfo: PageInfoModel;
  snapshotCursor: Scalars['String']['output'];
  totalCount: Scalars['Int']['output'];
};

export type DialogueTurnEdge = {
  cursor: Scalars['String']['output'];
  node: DialogueTurnModel;
};

export type DialogueTurnModel = {
  cancelRequested: Scalars['Boolean']['output'];
  commandId: Scalars['String']['output'];
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  dialogueId: Scalars['ID']['output'];
  dispatchState: Scalars['String']['output'];
  endItemSequence?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  outcome?: Maybe<Scalars['JSON']['output']>;
  runtimeSessionId?: Maybe<Scalars['ID']['output']>;
  status: Scalars['String']['output'];
  userItemId: Scalars['ID']['output'];
};

export type ForkDialogueInput = {
  dialogueId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
  turnId: Scalars['ID']['input'];
};

export type LaunchProfileConnection = {
  edges: Array<LaunchProfileEdge>;
  pageInfo: PageInfoModel;
  totalCount: Scalars['Int']['output'];
};

export type LaunchProfileEdge = {
  cursor: Scalars['String']['output'];
  node: LaunchProfileModel;
};

export type LaunchProfileInput = {
  id: Scalars['ID']['input'];
  pipelineId: Scalars['ID']['input'];
  profile: Scalars['JSON']['input'];
  status: LaunchProfileStatus;
};

export type LaunchProfileModel = {
  id: Scalars['ID']['output'];
  isHead: Scalars['Boolean']['output'];
  pipelineId: Scalars['ID']['output'];
  profile: Scalars['JSON']['output'];
  revisionId: Scalars['ID']['output'];
  status: LaunchProfileStatus;
};

export enum LaunchProfileStatus {
  Active = 'active',
  Deprecated = 'deprecated'
}

export type MethodDocumentConnection = {
  edges: Array<MethodDocumentEdge>;
  pageInfo: PageInfoModel;
  totalCount: Scalars['Int']['output'];
};

export type MethodDocumentEdge = {
  cursor: Scalars['String']['output'];
  node: MethodDocumentModel;
};

export type MethodDocumentInput = {
  body: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  kind: MethodDocumentKind;
  playbookId: Scalars['ID']['input'];
};

export enum MethodDocumentKind {
  Checklist = 'checklist',
  Method = 'method',
  Nav = 'nav',
  Template = 'template'
}

export type MethodDocumentModel = {
  body: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isHead: Scalars['Boolean']['output'];
  kind: MethodDocumentKind;
  playbookId: Scalars['ID']['output'];
  revisionId: Scalars['ID']['output'];
};

export type Mutation = {
  archiveProject: Scalars['Boolean']['output'];
  cancelDialogueTurn: DialogueTurnModel;
  commitCatalog: CatalogCommitResultModel;
  createAdr: AdrModel;
  createDialogue: DialogueSummaryModel;
  createLaunchProfile: LaunchProfileModel;
  createMethodDocument: MethodDocumentModel;
  createPipeline: PipelineModel;
  createPipelineRole: PipelineRoleModel;
  createPlaybook: PlaybookModel;
  createProject: ProjectCreatedModel;
  createRequirement: RequirementModel;
  createRole: RoleModel;
  createRoleRef: RoleRefModel;
  createSharedReference: SharedReferenceModel;
  createStack: StackModel;
  createStackRef: StackRefModel;
  createWorkItem: WorkItemModel;
  createWorkPlan: WorkPlanModel;
  deleteAdr: Scalars['Boolean']['output'];
  deleteLaunchProfile: Scalars['Boolean']['output'];
  deleteMethodDocument: Scalars['Boolean']['output'];
  deletePipeline: Scalars['Boolean']['output'];
  deletePipelineRole: Scalars['Boolean']['output'];
  deletePlaybook: Scalars['Boolean']['output'];
  deleteRequirement: Scalars['Boolean']['output'];
  deleteRole: Scalars['Boolean']['output'];
  deleteRoleRef: Scalars['Boolean']['output'];
  deleteSharedReference: Scalars['Boolean']['output'];
  deleteStack: Scalars['Boolean']['output'];
  deleteStackRef: Scalars['Boolean']['output'];
  deleteWorkItem: Scalars['Boolean']['output'];
  deleteWorkPlan: Scalars['Boolean']['output'];
  discardCatalog: CatalogMutationResultModel;
  forkDialogue: DialogueSummaryModel;
  importCatalog: CatalogImportResultModel;
  markDialogueRead: DialogueSummaryModel;
  reopenDialogue: DialogueSummaryModel;
  respondDialogue: DialogueInteractionModel;
  restoreProject: Scalars['Boolean']['output'];
  sendDialogueMessage: DialogueTurnModel;
  startRun: StartRunResultModel;
  updateAdr: AdrModel;
  updateLaunchProfile: LaunchProfileModel;
  updateMethodDocument: MethodDocumentModel;
  updatePipeline: PipelineModel;
  updatePlaybook: PlaybookModel;
  updateProject: Scalars['Boolean']['output'];
  updateRequirement: RequirementModel;
  updateRole: RoleModel;
  updateRoleRef: RoleRefModel;
  updateSharedReference: SharedReferenceModel;
  updateStack: StackModel;
  updateStackRef: StackRefModel;
  updateWorkItem: WorkItemModel;
  updateWorkPlan: WorkPlanModel;
};


export type MutationArchiveProjectArgs = {
  data: ProjectInput;
};


export type MutationCancelDialogueTurnArgs = {
  dialogueId: Scalars['ID']['input'];
  turnId: Scalars['ID']['input'];
};


export type MutationCommitCatalogArgs = {
  message: Scalars['String']['input'];
};


export type MutationCreateAdrArgs = {
  data: AdrInput;
};


export type MutationCreateDialogueArgs = {
  input: CreateDialogueInput;
};


export type MutationCreateLaunchProfileArgs = {
  data: LaunchProfileInput;
};


export type MutationCreateMethodDocumentArgs = {
  data: MethodDocumentInput;
};


export type MutationCreatePipelineArgs = {
  data: PipelineInput;
};


export type MutationCreatePipelineRoleArgs = {
  data: PipelineRoleInput;
};


export type MutationCreatePlaybookArgs = {
  data: PlaybookInput;
};


export type MutationCreateProjectArgs = {
  data: ProjectCreateInput;
};


export type MutationCreateRequirementArgs = {
  data: RequirementInput;
};


export type MutationCreateRoleArgs = {
  data: RoleInput;
};


export type MutationCreateRoleRefArgs = {
  data: RoleRefInput;
};


export type MutationCreateSharedReferenceArgs = {
  data: SharedReferenceInput;
};


export type MutationCreateStackArgs = {
  data: StackInput;
};


export type MutationCreateStackRefArgs = {
  data: StackRefInput;
};


export type MutationCreateWorkItemArgs = {
  data: WorkItemInput;
};


export type MutationCreateWorkPlanArgs = {
  data: WorkPlanInput;
};


export type MutationDeleteAdrArgs = {
  data: RecordDeleteInput;
};


export type MutationDeleteLaunchProfileArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteMethodDocumentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePipelineArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePipelineRoleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePlaybookArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteRequirementArgs = {
  data: RecordDeleteInput;
};


export type MutationDeleteRoleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteRoleRefArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSharedReferenceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteStackArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteStackRefArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWorkItemArgs = {
  data: RecordDeleteInput;
};


export type MutationDeleteWorkPlanArgs = {
  data: RecordDeleteInput;
};


export type MutationForkDialogueArgs = {
  input: ForkDialogueInput;
};


export type MutationImportCatalogArgs = {
  data: Scalars['JSON']['input'];
};


export type MutationMarkDialogueReadArgs = {
  dialogueId: Scalars['ID']['input'];
  through: Scalars['String']['input'];
};


export type MutationReopenDialogueArgs = {
  dialogueId: Scalars['ID']['input'];
};


export type MutationRespondDialogueArgs = {
  input: RespondDialogueInput;
};


export type MutationRestoreProjectArgs = {
  data: ProjectInput;
};


export type MutationSendDialogueMessageArgs = {
  input: SendDialogueInput;
};


export type MutationStartRunArgs = {
  data: StartRunInput;
};


export type MutationUpdateAdrArgs = {
  data: AdrInput;
};


export type MutationUpdateLaunchProfileArgs = {
  data: LaunchProfileInput;
};


export type MutationUpdateMethodDocumentArgs = {
  data: MethodDocumentInput;
};


export type MutationUpdatePipelineArgs = {
  data: PipelineInput;
};


export type MutationUpdatePlaybookArgs = {
  data: PlaybookInput;
};


export type MutationUpdateProjectArgs = {
  data: ProjectUpdateInput;
};


export type MutationUpdateRequirementArgs = {
  data: RequirementInput;
};


export type MutationUpdateRoleArgs = {
  data: RoleInput;
};


export type MutationUpdateRoleRefArgs = {
  data: RoleRefInput;
};


export type MutationUpdateSharedReferenceArgs = {
  data: SharedReferenceInput;
};


export type MutationUpdateStackArgs = {
  data: StackInput;
};


export type MutationUpdateStackRefArgs = {
  data: StackRefInput;
};


export type MutationUpdateWorkItemArgs = {
  data: WorkItemInput;
};


export type MutationUpdateWorkPlanArgs = {
  data: WorkPlanInput;
};

export type PageInfoModel = {
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PipelineConnection = {
  edges: Array<PipelineEdge>;
  pageInfo: PageInfoModel;
  totalCount: Scalars['Int']['output'];
};

export type PipelineEdge = {
  cursor: Scalars['String']['output'];
  node: PipelineModel;
};

export type PipelineInput = {
  id: Scalars['ID']['input'];
  pipeline: Scalars['JSON']['input'];
  playbookId: Scalars['ID']['input'];
};

export type PipelineModel = {
  id: Scalars['ID']['output'];
  isHead: Scalars['Boolean']['output'];
  pipeline: Scalars['JSON']['output'];
  playbookId: Scalars['ID']['output'];
  revisionId: Scalars['ID']['output'];
};

export type PipelineRoleConnection = {
  edges: Array<PipelineRoleEdge>;
  pageInfo: PageInfoModel;
  totalCount: Scalars['Int']['output'];
};

export type PipelineRoleEdge = {
  cursor: Scalars['String']['output'];
  node: PipelineRoleModel;
};

export type PipelineRoleInput = {
  id: Scalars['ID']['input'];
  membership: PipelineRoleMembership;
  pipelineId: Scalars['ID']['input'];
  roleId: Scalars['ID']['input'];
};

export enum PipelineRoleMembership {
  Alternative = 'alternative',
  Optional = 'optional',
  Required = 'required'
}

export type PipelineRoleModel = {
  id: Scalars['ID']['output'];
  isHead: Scalars['Boolean']['output'];
  membership: PipelineRoleMembership;
  pipelineId: Scalars['ID']['output'];
  revisionId: Scalars['ID']['output'];
  roleId: Scalars['ID']['output'];
};

export type PlaybookConnection = {
  edges: Array<PlaybookEdge>;
  pageInfo: PageInfoModel;
  totalCount: Scalars['Int']['output'];
};

export type PlaybookEdge = {
  cursor: Scalars['String']['output'];
  node: PlaybookModel;
};

export type PlaybookInput = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};

export type PlaybookModel = {
  id: Scalars['ID']['output'];
  isHead: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  revisionId: Scalars['ID']['output'];
};

export type ProjectConnectionModel = {
  edges: Array<ProjectEdgeModel>;
  pageInfo: PageInfoModel;
  totalCount: Scalars['Int']['output'];
};

export type ProjectCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type ProjectCreatedModel = {
  projectId: Scalars['ID']['output'];
};

export type ProjectEdgeModel = {
  cursor: Scalars['String']['output'];
  node: ProjectModel;
};

export type ProjectInput = {
  id: Scalars['ID']['input'];
};

export type ProjectListInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};

export type ProjectModel = {
  adr?: Maybe<AdrModel>;
  adrs: AdrConnectionModel;
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  requirement?: Maybe<RequirementModel>;
  requirements: RequirementConnectionModel;
  status: ProjectStatus;
  updatedAt: Scalars['String']['output'];
  workItem?: Maybe<WorkItemModel>;
  workItems: WorkItemConnectionModel;
  workPlan?: Maybe<WorkPlanModel>;
  workPlans: WorkPlanConnectionModel;
};


export type ProjectModelAdrArgs = {
  id: Scalars['ID']['input'];
};


export type ProjectModelAdrsArgs = {
  data: RecordListInput;
};


export type ProjectModelRequirementArgs = {
  id: Scalars['ID']['input'];
};


export type ProjectModelRequirementsArgs = {
  data: RecordListInput;
};


export type ProjectModelWorkItemArgs = {
  id: Scalars['ID']['input'];
};


export type ProjectModelWorkItemsArgs = {
  data: RecordListInput;
};


export type ProjectModelWorkPlanArgs = {
  id: Scalars['ID']['input'];
};


export type ProjectModelWorkPlansArgs = {
  data: RecordListInput;
};

export enum ProjectStatus {
  Active = 'active',
  Archived = 'archived'
}

export type ProjectUpdateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  agentConfigurations: AgentConfigurationsModel;
  agentDefinition?: Maybe<AgentDescriptorModel>;
  agentDefinitions: AgentDefinitionConnectionModel;
  catalogChangeSet: CatalogChangeEntryConnection;
  catalogSnapshot: CatalogSnapshotModel;
  catalogStatus: CatalogStatusModel;
  dialogue: DialogueSummaryModel;
  dialogueHistory: DialogueHistoryItemConnectionModel;
  dialogueHistoryItem: DialogueHistoryItemModel;
  dialogueInteractions: DialogueInteractionConnectionModel;
  dialogueTurns: DialogueTurnConnectionModel;
  dialogues: DialogueSummaryConnectionModel;
  inspectAgentConfiguration: AgentConfigurationCatalogModel;
  launchProfile: LaunchProfileModel;
  launchProfiles: LaunchProfileConnection;
  methodDocument: MethodDocumentModel;
  methodDocuments: MethodDocumentConnection;
  pipeline: PipelineModel;
  pipelineRole: PipelineRoleModel;
  pipelineRoles: PipelineRoleConnection;
  pipelines: PipelineConnection;
  playbook: PlaybookModel;
  playbooks: PlaybookConnection;
  project?: Maybe<ProjectModel>;
  projects: ProjectConnectionModel;
  role: RoleModel;
  roleRef: RoleRefModel;
  roleRefs: RoleRefConnection;
  roles: RoleConnection;
  run?: Maybe<RunModel>;
  sharedReference: SharedReferenceModel;
  sharedReferences: SharedReferenceConnection;
  stack: StackModel;
  stackRef: StackRefModel;
  stackRefs: StackRefConnection;
  stacks: StackConnection;
  systemInfo: SystemInfoModel;
};


export type QueryAgentDefinitionArgs = {
  agentId: Scalars['String']['input'];
  agentVersion: Scalars['String']['input'];
};


export type QueryAgentDefinitionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCatalogChangeSetArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
};


export type QueryCatalogSnapshotArgs = {
  revisionId: Scalars['ID']['input'];
};


export type QueryDialogueArgs = {
  dialogueId: Scalars['ID']['input'];
};


export type QueryDialogueHistoryArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  dialogueId: Scalars['ID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDialogueHistoryItemArgs = {
  dialogueId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
};


export type QueryDialogueInteractionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  dialogueId: Scalars['ID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDialogueTurnsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  dialogueId: Scalars['ID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDialoguesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryInspectAgentConfigurationArgs = {
  agentId: Scalars['String']['input'];
  agentVersion: Scalars['String']['input'];
};


export type QueryLaunchProfileArgs = {
  id: Scalars['ID']['input'];
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QueryLaunchProfilesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  pipelineId?: InputMaybe<Scalars['ID']['input']>;
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QueryMethodDocumentArgs = {
  id: Scalars['ID']['input'];
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QueryMethodDocumentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  playbookId?: InputMaybe<Scalars['ID']['input']>;
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QueryPipelineArgs = {
  id: Scalars['ID']['input'];
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QueryPipelineRoleArgs = {
  id: Scalars['ID']['input'];
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QueryPipelineRolesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  pipelineId?: InputMaybe<Scalars['ID']['input']>;
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QueryPipelinesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  playbookId?: InputMaybe<Scalars['ID']['input']>;
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QueryPlaybookArgs = {
  id: Scalars['ID']['input'];
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QueryPlaybooksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QueryProjectArgs = {
  data: ProjectInput;
};


export type QueryProjectsArgs = {
  data: ProjectListInput;
};


export type QueryRoleArgs = {
  id: Scalars['ID']['input'];
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QueryRoleRefArgs = {
  id: Scalars['ID']['input'];
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QueryRoleRefsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  roleId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QueryRolesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  playbookId?: InputMaybe<Scalars['ID']['input']>;
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QueryRunArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySharedReferenceArgs = {
  id: Scalars['ID']['input'];
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QuerySharedReferencesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  playbookId?: InputMaybe<Scalars['ID']['input']>;
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QueryStackArgs = {
  id: Scalars['ID']['input'];
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QueryStackRefArgs = {
  id: Scalars['ID']['input'];
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};


export type QueryStackRefsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
  stackId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryStacksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  playbookId?: InputMaybe<Scalars['ID']['input']>;
  revisionId?: InputMaybe<Scalars['ID']['input']>;
  scope?: CatalogScope;
};

export type RecordDeleteInput = {
  id: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};

export type RecordListInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type RequirementConnectionModel = {
  edges: Array<RequirementEdgeModel>;
  pageInfo: PageInfoModel;
  totalCount: Scalars['Int']['output'];
};

export type RequirementEdgeModel = {
  cursor: Scalars['String']['output'];
  node: RequirementModel;
};

export type RequirementInput = {
  acceptance: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
  relatedAdr: Array<Scalars['String']['input']>;
  statement: Scalars['String']['input'];
  status: RequirementStatus;
  title: Scalars['String']['input'];
};

export type RequirementModel = {
  acceptance: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  relatedAdr: Array<Scalars['String']['output']>;
  statement: Scalars['String']['output'];
  status: RequirementStatus;
  title: Scalars['String']['output'];
};

export enum RequirementStatus {
  Accepted = 'accepted',
  Deferred = 'deferred',
  Proposed = 'proposed',
  Rejected = 'rejected'
}

export type RespondDialogueInput = {
  commandId: Scalars['String']['input'];
  dialogueId: Scalars['ID']['input'];
  interactionId: Scalars['ID']['input'];
  response: Scalars['JSON']['input'];
};

export type RoleConnection = {
  edges: Array<RoleEdge>;
  pageInfo: PageInfoModel;
  totalCount: Scalars['Int']['output'];
};

export type RoleEdge = {
  cursor: Scalars['String']['output'];
  node: RoleModel;
};

export type RoleInput = {
  body: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  playbookId: Scalars['ID']['input'];
};

export type RoleModel = {
  body: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isHead: Scalars['Boolean']['output'];
  playbookId: Scalars['ID']['output'];
  revisionId: Scalars['ID']['output'];
};

export type RoleRefConnection = {
  edges: Array<RoleRefEdge>;
  pageInfo: PageInfoModel;
  totalCount: Scalars['Int']['output'];
};

export type RoleRefEdge = {
  cursor: Scalars['String']['output'];
  node: RoleRefModel;
};

export type RoleRefInput = {
  body: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  roleId: Scalars['ID']['input'];
};

export type RoleRefModel = {
  body: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isHead: Scalars['Boolean']['output'];
  revisionId: Scalars['ID']['output'];
  roleId: Scalars['ID']['output'];
};

export type RunModel = {
  createdAt: Scalars['String']['output'];
  runId: Scalars['ID']['output'];
  schemaVersion: Scalars['String']['output'];
  status: Scalars['String']['output'];
  terminal?: Maybe<Scalars['JSON']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type SendDialogueInput = {
  commandId: Scalars['String']['input'];
  dialogueId: Scalars['ID']['input'];
  prompt: Scalars['String']['input'];
};

export type SharedReferenceConnection = {
  edges: Array<SharedReferenceEdge>;
  pageInfo: PageInfoModel;
  totalCount: Scalars['Int']['output'];
};

export type SharedReferenceEdge = {
  cursor: Scalars['String']['output'];
  node: SharedReferenceModel;
};

export type SharedReferenceInput = {
  body: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  playbookId: Scalars['ID']['input'];
};

export type SharedReferenceModel = {
  body: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isHead: Scalars['Boolean']['output'];
  playbookId: Scalars['ID']['output'];
  revisionId: Scalars['ID']['output'];
};

export type StackConnection = {
  edges: Array<StackEdge>;
  pageInfo: PageInfoModel;
  totalCount: Scalars['Int']['output'];
};

export type StackEdge = {
  cursor: Scalars['String']['output'];
  node: StackModel;
};

export type StackInput = {
  body: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  playbookId: Scalars['ID']['input'];
};

export type StackModel = {
  body: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isHead: Scalars['Boolean']['output'];
  playbookId: Scalars['ID']['output'];
  revisionId: Scalars['ID']['output'];
};

export type StackRefConnection = {
  edges: Array<StackRefEdge>;
  pageInfo: PageInfoModel;
  totalCount: Scalars['Int']['output'];
};

export type StackRefEdge = {
  cursor: Scalars['String']['output'];
  node: StackRefModel;
};

export type StackRefInput = {
  body: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  stackId: Scalars['ID']['input'];
};

export type StackRefModel = {
  body: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isHead: Scalars['Boolean']['output'];
  revisionId: Scalars['ID']['output'];
  stackId: Scalars['ID']['output'];
};

export type StartRunInput = {
  input: Scalars['JSON']['input'];
  pipeline?: InputMaybe<Scalars['JSON']['input']>;
  pipelineId?: InputMaybe<Scalars['ID']['input']>;
  profile?: InputMaybe<Scalars['JSON']['input']>;
  profileId?: InputMaybe<Scalars['ID']['input']>;
};

export type StartRunResultModel = {
  runId: Scalars['ID']['output'];
};

export type Subscription = {
  agentConfigurations: AgentConfigurationsModel;
  dialogueChanges: DialogueChangeModel;
  dialogueSummaryChanges: DialogueChangeModel;
};


export type SubscriptionDialogueChangesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  dialogueIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};


export type SubscriptionDialogueSummaryChangesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  dialogueIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type SystemInfoModel = {
  name: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type WorkItemConnectionModel = {
  edges: Array<WorkItemEdgeModel>;
  pageInfo: PageInfoModel;
  totalCount: Scalars['Int']['output'];
};

export type WorkItemEdgeModel = {
  cursor: Scalars['String']['output'];
  node: WorkItemModel;
};

export type WorkItemInput = {
  acceptance: Scalars['String']['input'];
  cancelled: Scalars['Boolean']['input'];
  constraints: Scalars['String']['input'];
  dependsOn: Array<Scalars['String']['input']>;
  goal: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  inputs: Scalars['String']['input'];
  owner: Scalars['String']['input'];
  plan: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
  relatedAdr: Array<Scalars['String']['input']>;
  relatedRequirements: Array<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type WorkItemModel = {
  acceptance: Scalars['String']['output'];
  cancelled: Scalars['Boolean']['output'];
  constraints: Scalars['String']['output'];
  dependsOn: Array<Scalars['String']['output']>;
  goal: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  inputs: Scalars['String']['output'];
  owner: Scalars['String']['output'];
  plan: Scalars['String']['output'];
  relatedAdr: Array<Scalars['String']['output']>;
  relatedRequirements: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type WorkPlanConnectionModel = {
  edges: Array<WorkPlanEdgeModel>;
  pageInfo: PageInfoModel;
  totalCount: Scalars['Int']['output'];
};

export type WorkPlanEdgeModel = {
  cursor: Scalars['String']['output'];
  node: WorkPlanModel;
};

export type WorkPlanInput = {
  acceptance: Scalars['String']['input'];
  baselineId: Scalars['String']['input'];
  bounds: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  outcome: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
  status: WorkPlanStatus;
  title: Scalars['String']['input'];
};

export type WorkPlanModel = {
  acceptance: Scalars['String']['output'];
  baselineId: Scalars['String']['output'];
  bounds: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  outcome: Scalars['String']['output'];
  status: WorkPlanStatus;
  title: Scalars['String']['output'];
};

export enum WorkPlanStatus {
  Closed = 'closed',
  Draft = 'draft',
  Ready = 'ready'
}

export type PageInfoFieldsFragment = { endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null };

export type ProjectNodeFragment = { id: string, name: string, description: string, status: ProjectStatus, createdAt: string, updatedAt: string };

export type ProjectsQueryVariables = Exact<{
  query?: InputMaybe<Scalars['String']['input']>;
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ProjectsQuery = { projects: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, name: string, description: string, status: ProjectStatus, createdAt: string, updatedAt: string } }>, pageInfo: { endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type CreateProjectMutationVariables = Exact<{
  data: ProjectCreateInput;
}>;


export type CreateProjectMutation = { createProject: { projectId: string } };

export type ProjectQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ProjectQuery = { project?: { id: string, name: string, description: string, status: ProjectStatus, createdAt: string, updatedAt: string } | null };

export type SystemInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type SystemInfoQuery = { systemInfo: { name: string, status: string } };

export const PageInfoFieldsFragmentDoc = gql`
    fragment PageInfoFields on PageInfoModel {
  endCursor
  hasNextPage
  hasPreviousPage
  startCursor
}
    `;
export const ProjectNodeFragmentDoc = gql`
    fragment ProjectNode on ProjectModel {
  id
  name
  description
  status
  createdAt
  updatedAt
}
    `;
export const ProjectsDocument = gql`
    query Projects($query: String, $includeArchived: Boolean, $after: String, $first: Int) {
  projects(
    data: {query: $query, includeArchived: $includeArchived, after: $after, first: $first}
  ) {
    edges {
      cursor
      node {
        ...ProjectNode
      }
    }
    pageInfo {
      ...PageInfoFields
    }
    totalCount
  }
}
    ${ProjectNodeFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const CreateProjectDocument = gql`
    mutation CreateProject($data: ProjectCreateInput!) {
  createProject(data: $data) {
    projectId
  }
}
    `;
export const ProjectDocument = gql`
    query Project($id: ID!) {
  project(data: {id: $id}) {
    ...ProjectNode
  }
}
    ${ProjectNodeFragmentDoc}`;
export const SystemInfoDocument = gql`
    query SystemInfo {
  systemInfo {
    name
    status
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    Projects(variables?: ProjectsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ProjectsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ProjectsQuery>(ProjectsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Projects', 'query', variables);
    },
    CreateProject(variables: CreateProjectMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CreateProjectMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateProjectMutation>(CreateProjectDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CreateProject', 'mutation', variables);
    },
    Project(variables: ProjectQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ProjectQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ProjectQuery>(ProjectDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Project', 'query', variables);
    },
    SystemInfo(variables?: SystemInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SystemInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SystemInfoQuery>(SystemInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SystemInfo', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;