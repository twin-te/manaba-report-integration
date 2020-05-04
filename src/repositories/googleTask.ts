/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Repository } from './repository'
import { RepositorySetting, DropdownSetting } from '../types/repositorySettings'
import { ManabaTodo } from '../types/manabaTodo'

export class GoogleTaskRepository extends Repository {
  id = 'googletask'
  name = 'GoogleTasks'
  description =
    '注意：同期→拡張機能再インストール→同期　を行うとタスクが重複して作成されます。'

  token = ''

  getIsAuth() {
    return this.readChromeStorage('isAuth')
  }

  async auth() {
    this.token = await this.getToken()
    await this.writeChromeStorage('isAuth', true)
  }

  async getSettings(): Promise<RepositorySetting[]> {
    this.token = await this.getToken()
    const { items: list } = await this.get<{
      items: { title: string; id: string }[]
    }>('https://www.googleapis.com/tasks/v1/users/@me/lists')

    const o: DropdownSetting = {
      id: 'target_tasklist',
      type: 'dropdown',
      title: '同期するタスクリスト',
      description: '選択したタスクリストに追加されます',
      options: list.map((l) => ({ key: l.id, value: l.title })),
    }
    return [o]
  }

  async upsert(todo: ManabaTodo) {
    if (!todo.due) return
    const targetTasklist = await this.readChromeStorage('target_tasklist')
    const rel: { [key: string]: string } =
      (await this.readChromeStorage('relation')) || {}
    if (!rel[todo.link]) {
      const res = await this.post<{ id: string }>(
        `https://www.googleapis.com/tasks/v1/lists/${targetTasklist}/tasks`,
        {
          kind: 'tasks#task',
          title: `${todo.courceName} ${todo.title}`,
          due: todo.due?.toISOString(),
          status: todo.status === 'todo' ? 'needsAction' : 'completed',
          notes: `${todo.due?.toLocaleString()}〆切\n${todo.link}`,
        }
      )
      rel[todo.link] = res.id
      await this.writeChromeStorage('relation', rel)
    } else {
      await this.put(
        `https://www.googleapis.com/tasks/v1/lists/${targetTasklist}/tasks/${
          rel[todo.link]
        }`,
        {
          id: rel[todo.link],
          kind: 'tasks#task',
          title: `${todo.courceName} ${todo.title}`,
          due: todo.due?.toISOString(),
          status: todo.status === 'todo' ? 'needsAction' : 'completed',
          notes: `${todo.due?.toLocaleString()}〆切\n${todo.link}`,
        }
      )
    }
  }

  async changeStatus(id: string, status: 'todo' | 'done'): Promise<void> {
    const targetTasklist = await this.readChromeStorage('target_tasklist')
    const rel: { [key: string]: string } =
      (await this.readChromeStorage('relation')) || {}
    if (rel[id]) {
      const target = await this.get<{ status: string }>(
        `https://www.googleapis.com/tasks/v1/lists/${targetTasklist}/tasks/${rel[id]}`
      )
      target.status = status === 'todo' ? 'needsAction' : 'completed'
      await this.put(
        `https://www.googleapis.com/tasks/v1/lists/${targetTasklist}/tasks/${rel[id]}`,
        target
      )
    } else throw new Error('指定されたIDのタスクは見つかりません')
  }

  getToken(): Promise<string> {
    return new Promise((resolve) => {
      chrome.identity.getAuthToken({ interactive: true }, function (token) {
        resolve(token)
      })
    })
  }

  get<T>(url: string): Promise<T> {
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    }).then<T>((res) => res.json())
  }

  post<T>(url: string, body: any): Promise<T> {
    return fetch(url, {
      method: 'post',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    }).then<T>((res) => res.json())
  }

  put<T>(url: string, body: any): Promise<T> {
    return fetch(url, {
      method: 'put',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    }).then<T>((res) => res.json())
  }
}
