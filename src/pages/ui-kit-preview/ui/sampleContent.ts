import { routes } from 'src/shared/config'
// Preview-only sample copy for /ui-kit-preview. Do not import from product code.

export const PREVIEW_PROJECT_ID = 'prj_uikitpreview'
export const PREVIEW_PROJECT_NAME = 'Sample project'
export const PREVIEW_PROJECT_DESCRIPTION = 'Static preview copy for the UI kit route — not a real project.'

export const PREVIEW_NAV_ITEMS: ReadonlyArray<{
  readonly label: string
  readonly href: string
  readonly current: boolean
}> = [
  { label: 'Home', href: routes.home(), current: false },
  { label: 'Runs', href: routes.runs(), current: false },
  { label: 'Projects', href: routes.projects(), current: false },
  { label: 'UI kit preview', href: routes.uiKitPreview(), current: true },
]

export const PREVIEW_SECTION_NAV_SECTIONS: ReadonlyArray<{
  readonly key: string
  readonly label: string
  readonly href: string
}> = [
  { key: 'overview', label: 'Overview', href: '#' },
  { key: 'entries', label: 'Entries', href: '#' },
  { key: 'workspaces', label: 'Workspaces', href: '#' },
  { key: 'runs', label: 'Runs', href: '#' },
  { key: 'activity', label: 'Activity', href: '#' },
  { key: 'settings', label: 'Settings', href: '#' },
]

export const BUTTON_CREATE_LABEL = 'Create project'
export const BUTTON_CREATE_BUSY_LABEL = 'Creating…'
export const BUTTON_SECONDARY_LABEL = 'Secondary action'
export const BUTTON_QUIET_LABEL = 'Quiet action'
export const BUTTON_DISABLED_LABEL = 'Disabled'

export const TEXTINPUT_PLACEHOLDER = 'Project name'
export const TEXTINPUT_HINT = 'Between 3 and 255 characters'
export const TEXTINPUT_ERROR = 'Project name already exists'

export const TEXTAREA_PLACEHOLDER = 'Project description'
export const TEXTAREA_HINT = 'Markdown supported'
export const TEXTAREA_ERROR = 'Description is too long'

export const FORM_FIELD_LABEL_REQUIRED = 'Required field'
export const FORM_FIELD_LABEL_OPTIONAL = 'Optional field'

export const CONFIRM_DIALOG_TITLE = 'Archive project?'
export const CONFIRM_DIALOG_DESCRIPTION =
  'Archived rows stay fully readable — no dimming. You can unarchive at any time.'
export const CONFIRM_DIALOG_BLOCKER_TEXT = 'All active runs must complete or be cancelled first.'
export const CONFIRM_DIALOG_CONFIRM_LABEL = 'Archive'
export const CONFIRM_DIALOG_CANCEL_LABEL = 'Cancel'
export const CONFIRM_DIALOG_TRIGGER_LABEL = 'Open confirm dialog'

export const EMPTY_STATE_TITLE = 'No projects yet'
export const EMPTY_STATE_DESCRIPTION = 'Create your first project to get started.'
export const EMPTY_STATE_ACTION_LABEL = 'Create project'

export const NO_RESULTS_QUERY = 'production'
export const NO_RESULTS_FILTER_SUMMARY = 'Active projects only'
export const NO_RESULTS_TITLE = 'No projects match your search'
export const NO_RESULTS_DESCRIPTION = 'Try adjusting your filters or search terms.'
export const NO_RESULTS_CLEAR_SEARCH_LABEL = 'Clear search'

export const INLINE_ERROR_TITLE = 'Error loading projects'
export const INLINE_ERROR_DESCRIPTION = 'Failed to load project details.'
export const INLINE_ERROR_RETRY_LABEL = 'Retry'

export const INLINE_NOTICE_CHILDREN = 'This is a verification-only route. Changes here are not persisted.'
export const INLINE_NOTICE_ACTION_LABEL = 'Learn more'

export const CARD_DEFAULT_DESCRIPTION = 'This project contains workflows for data processing.'
export const CARD_ARCHIVED_DESCRIPTION = 'Archived rows stay fully readable — no dimming.'
export const CARD_WORKSPACE_LABEL = 'workspace'

export const PROJECT_STATUS_ACTIVE = 'active'
export const PROJECT_STATUS_ARCHIVED = 'archived'

export const PROJECT_IDENTITY_COPY_BUTTON_LABEL = 'Copy ID'
export const PROJECT_IDENTITY_COPY_FAILED = 'Could not copy the project id'
export const PROJECT_IDENTITY_COPY_SUCCESS = 'Copied to clipboard'
export const PROJECT_IDENTITY_PRIMARY_ACTION_LABEL = 'Settings'

export const PROJECT_SUMMARY_READY_TEXT =
  'This project was last updated 3 minutes ago. It has 14 active runs and 3 archived entries.'
export const PROJECT_SUMMARY_ERROR_TEXT = 'Connection lost. The project may have been archived or deleted.'

export const SEARCH_TOOLBAR_PLACEHOLDER = 'Search projects…'
export const SEARCH_TOOLBAR_INCLUDE_ARCHIVED_LABEL = 'Include archived'

export const ICON_BUTTON_LABEL = 'Settings'

export const BREADCRUMB_HOME_LABEL = 'Home'
export const BREADCRUMB_CURRENT_LABEL = 'Sample project'

export const BADGE_DEFAULT_TONE_LABEL = 'Default tone'
export const BADGE_QUIET_TONE_LABEL = 'Quiet tone'

export const PROJECT_STATUS_BADGE_ACTIVE_LABEL = 'Active'
export const PROJECT_STATUS_BADGE_ARCHIVED_LABEL = 'Archived'

export const CARD_DEFAULT_TITLE = 'Default card'
export const CARD_DEFAULT_CONTENT = 'This is a card with default padding.'

export const CARD_COMPACT_TITLE = 'Compact card'
export const CARD_COMPACT_CONTENT = 'This card uses compact padding for dense layouts.'

export const CARD_SUMMARY_TITLE = 'Summary card'
export const CARD_SUMMARY_CONTENT = 'This card variant is used for summary content.'

export const CARD_INTERACTIVE_TITLE = 'Interactive card'
export const CARD_INTERACTIVE_CONTENT = 'This card has interactive styling on hover.'

export const PROJECT_CARD_ACTIVE_UPDATED = 'Updated 2 minutes ago'
export const PROJECT_CARD_ARCHIVED_UPDATED = 'Updated 1 week ago'

export const PROJECT_CARD_COUNTER_RUNS = '8 runs'
export const PROJECT_CARD_COUNTER_ENTRIES = '24 entries'
export const PROJECT_CARD_COUNTER_WORKSPACES = '3 workspaces'

export const PROJECT_SUMMARY_TITLE_RECORDS = 'Records'
export const PROJECT_SUMMARY_TITLE_WORKSPACES = 'Workspaces'
export const PROJECT_SUMMARY_LINK_LABEL_RECORDS = 'Open records'
export const PROJECT_SUMMARY_LINK_LABEL_WORKSPACES = 'Open workspaces'

export const CONTINUATION_PROGRESS_LABEL = 'Loading more projects…'
export const CONTINUATION_ERROR_TITLE = 'Failed to load more projects'
export const CONTINUATION_ERROR_RETRY_LABEL = 'Retry'

export const SUMMARY_LOADING_LINES = 2
