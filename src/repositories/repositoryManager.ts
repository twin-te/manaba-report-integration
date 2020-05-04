import { ManabaTodo } from '../types/manabaTodo'
import { GoogleTaskRepository } from './googleTask'
import { Repository } from './repository'
import { Trello } from './trello'
import { readStorage, writeStorage } from '../background/utils'

export const repositories = [new GoogleTaskRepository(), new Trello()]

export async function getActiveRepository(): Promise<Repository | undefined> {
  const id = await readStorage<string>('activeRepository')
  return repositories.find((r) => r.id === id)
}

export function setActiveRepository(repoID: string): Promise<void> {
  return writeStorage('activeRepository', repoID)
}

export async function upsertAll(
  data: ManabaTodo[],
  progressNotifer?: (crr: number, all: number) => void
): Promise<void> {
  const repo = await getActiveRepository()
  if (!repo) throw new Error('同期先が設定されていません')

  await repo.auth()
  data = data.map(({ due, ...t }) => ({
    due: due ? new Date(due) : null,
    ...t,
  }))
  for (let i = 0; i < data.length; i++) {
    await repo.upsert(data[i])
    if (progressNotifer) progressNotifer(i + 1, data.length)
  }
}
