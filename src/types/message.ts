export type Message =
  | FetchAllReportFromManaba
  | UpdateTodoStatusMessage
  | RequestSyncMessage
  | SyncStatusChangedMessage
  | EditBlackListMessage

export interface FetchAllReportFromManaba {
  type: 'fetchAllReportFromManaba'
}

export interface UpdateTodoStatusMessage {
  type: 'updateTodoStatus'
  link: string
  status: 'todo' | 'done'
}

export interface RequestSyncMessage {
  type: 'requestSync'
}

export interface SyncStatusChangedMessage {
  type: 'syncStatusChanged'
  status: 'progress' | 'done'
  statusText: string
  progress: string
}

export interface EditBlackListMessage {
  type: 'editBlackList'
}
