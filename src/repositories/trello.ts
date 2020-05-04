import { Repository } from './repository'
import { ManabaTodo } from '../types/manabaTodo'
import { RepositorySetting, DropdownSetting } from '../types/repositorySettings'
import config from '../config/config.json'

export class Trello extends Repository {
  id = 'trello'
  name = 'Trello'
  description =
    '一番左の列に未完了、右の列に完了した課題が同期されます。注意：同期→拡張機能再インストール→同期　を行うとタスクが重複して作成されます。'

  async getIsAuth(): Promise<boolean> {
    return (await this.readChromeStorage('isAuth')) === true
  }

  async auth(): Promise<void> {
    if ((await this.readChromeStorage('isAuth')) === true) {
      return
    }
    return new Promise<void>((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        {
          url:
            'https://trello.com/1/OAuthAuthorizeToken?expiration=never' +
            `&name=${config.trello.app_name}&scope=${config.trello.scopes}&key=${config.trello.key}&return_url=https://${chrome.runtime.id}.chromiumapp.org/`,
          interactive: true,
        },
        async (responseUrl) => {
          if (responseUrl && !responseUrl.includes('error')) {
            await this.writeChromeStorage(
              'token',
              responseUrl.split('#token=').slice(-1)[0]
            )
            await this.writeChromeStorage('isAuth', true)
            resolve()
          } else reject()
        }
      )
    })
  }

  async upsert(todo: ManabaTodo): Promise<void> {
    if (!todo.due) return
    const rel: { [key: string]: string } =
      (await this.readChromeStorage('relation')) || {}
    const lists = await this.get<{ id: string }[]>(
      `https://api.trello.com/1/boards/${await this.readChromeStorage(
        'target_board'
      )}/lists`
    )
    if (lists.length < 2)
      throw new Error('Trello上のボードに列が最低２つ必要です')
    const listForTodo = lists[0]
    const listForDone = lists[lists.length - 1]
    let targetList = todo.status === 'done' ? listForDone : listForTodo

    if (!rel[todo.link]) {
      const res = await this.post<{ id: string }>(
        'https://api.trello.com/1/cards',
        {
          idList: targetList.id,
          name: `${todo.courceName} ${todo.title}`,
          due: todo.due,
          urlSource: todo.link,
        }
      )
      rel[todo.link] = res.id
      await this.writeChromeStorage('relation', rel)
    } else {
      const target = await this.get<{ idList: string }>(
        `https://api.trello.com/1/cards/${rel[todo.link]}`
      )

      // todoなタスクが未知のリストにある場合はそのまま
      if (
        target.idList != listForTodo.id &&
        target.idList != listForDone.id &&
        todo.status === 'todo'
      )
        targetList = { id: target.idList }

      await this.put(`https://api.trello.com/1/cards/${rel[todo.link]}`, {
        idList: targetList.id,
        name: `${todo.courceName} ${todo.title}`,
        due: todo.due,
        urlSource: todo.link,
      })
    }
  }
  async changeStatus(id: string, status: 'todo' | 'done'): Promise<void> {
    const rel: { [key: string]: string } =
      (await this.readChromeStorage('relation')) || {}
    if (!rel[id])
      throw new Error('指定されたレポートはtrelloに登録されていません')
    const lists = await this.get<{ id: string }[]>(
      `https://api.trello.com/1/boards/${await this.readChromeStorage(
        'target_board'
      )}/lists`
    )
    const listForTodo = lists[0]
    const listForDone = lists[lists.length - 1]
    let targetList = status === 'done' ? listForDone : listForTodo

    const target = await this.get<{ idList: string }>(
      `https://api.trello.com/1/cards/${rel[id]}`
    )

    // todoなタスクが未知のリストにある場合はそのまま
    if (
      target.idList != listForTodo.id &&
      target.idList != listForDone.id &&
      status === 'todo'
    )
      targetList = { id: target.idList }

    await this.put(`https://api.trello.com/1/cards/${rel[id]}`, {
      idList: targetList.id,
    })
  }
  async getSettings(): Promise<RepositorySetting[]> {
    const boards = await this.get<{ name: string; id: string }[]>(
      'https://api.trello.com/1/members/me/boards'
    )
    const selectBoardSetting: DropdownSetting = {
      type: 'dropdown',
      id: 'target_board',
      title: '同期するボード',
      description: '選択したボードと同期します',
      options: boards.map((b) => ({
        key: b.id,
        value: b.name,
      })),
    }
    return [selectBoardSetting]
  }

  async get<T>(url: string): Promise<T> {
    return fetch(
      `${url}?key=${config.trello.key}&token=${await this.readChromeStorage(
        'token'
      )}`
    ).then<T>((res) => res.json())
  }

  async post<T>(url: string, body: any): Promise<T> {
    return fetch(
      `${url}?key=${config.trello.key}&token=${await this.readChromeStorage(
        'token'
      )}`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    ).then<T>((res) => res.json())
  }

  async put<T>(url: string, body: any): Promise<T> {
    return fetch(
      `${url}?key=${config.trello.key}&token=${await this.readChromeStorage(
        'token'
      )}`,
      {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    ).then<T>((res) => res.json())
  }
}
