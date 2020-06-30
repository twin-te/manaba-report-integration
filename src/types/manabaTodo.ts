export interface ManabaTodo {
  type: 'report' | 'survey'
  courceName: string
  lectureCode: string
  title: string
  link: string
  due: Date | null
  status: ManabaTodoStatus
}

export type ManabaTodoStatus = 'todo' | 'done' | 'overdue'
