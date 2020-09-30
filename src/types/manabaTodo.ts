export interface ManabaTodo {
  type: TodoType
  courceName: string
  lectureCode: string
  title: string
  link: string
  due: Date | null
  status: ManabaTodoStatus
}

export type ManabaTodoStatus = 'todo' | 'done' | 'overdue'

export type TodoType = 'report' | 'survey' | 'query'
