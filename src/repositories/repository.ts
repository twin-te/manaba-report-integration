import { ManabaTodo } from '../types/manabaTodo'
import { RepositorySetting } from '../types/repositorySettings'

/**
 * 外部サービスを表す
 * このクラスを継承して外部連携サービスを作成する
 */
export abstract class Repository {
  /**
   * レポジトリのID
   * 他のレポジトリと重複してはいけない。
   */
  abstract id: string
  /**
   * レポジトリの名前
   * ポップアップUIに表示される。
   */
  abstract name: string
  /**
   * 説明を記述する
   */
  abstract description: string
  /**
   * ログイン済みかを返す。
   * ポップアップUIでログインボタンを出すかどうかに使われる。
   */
  abstract getIsAuth(): Promise<boolean>
  /**
   * ログインボタンを押すと呼び出されるほか
   * 一応同期時にも呼び出される。
   * そのためログイン済みの場合は何もしないといった処理を記述する必要がある。
   */
  abstract auth(): Promise<void>
  /**
   * 同期中に呼び出される
   * Manabaのレポートを表すオブジェクトが引数に与えられるので
   * 対応するものを外部サービスに登録/更新する。
   * 既に外部サービスに登録されていれば更新
   * 無ければ追加という挙動を示す必要がある。
   * @param todo 更新するTodo
   */
  abstract upsert(todo: ManabaTodo): Promise<void>
  /**
   * レポートを提出したり、取り消した場合に呼び出される。
   * 外部サービスの状態を更新する必要がある。
   * @param id レポートページのurl
   * @param status 新しい状態
   */
  abstract changeStatus(id: string, status: 'todo' | 'done'): Promise<void>
  /**
   * ポップアップUIが表示されたときに呼び出させる。
   * このレポジトリの設定セクションに表示される設定を返す必要がある。
   */
  abstract getSettings(): Promise<RepositorySetting[]>

  writeChromeStorage(key: string, value: any): Promise<void> {
    return new Promise<void>((resolve) => {
      const fkey = `${this.id}:${key}`
      const fobj: any = {}
      fobj[fkey] = value
      chrome.storage.sync.set(fobj, () => resolve())
    })
  }

  readChromeStorage(key: string): Promise<any> {
    return new Promise<void>((resolve) => {
      chrome.storage.sync.get((items) => resolve(items[`${this.id}:${key}`]))
    })
  }
}
