import { Repository } from './repository'
import { ManabaTodo, ManabaTodoStatus } from '../types/manabaTodo'
import { RepositorySetting, DropdownSetting } from '../types/repositorySettings'
import config from '../config/config.json'
import { GraphQLClient } from 'graphql-request'
import { getSdk, Sdk } from '../graphql/generated/sdk'

export class GithubProjectV2 extends Repository {
  id = 'githubprojectv2'
  name = 'GitHub Project (beta)'
  description =
    '指定されたリポジトリに issue を作成し、作成した issue を指定された project にリンクします。課題のステータスは issue の open/closed で表現するので、GitHub Project 上のステータス管理は自分で build-in automation 等を設定してください。注意：同期→拡張機能再インストール→同期　を行うとタスクが重複して作成されます。'

  async getIsAuth(): Promise<boolean> {
    try {
      await this.githubRestApi('GET', '/')
    } catch {
      return false
    }
    return true
  }

  // https://docs.github.com/ja/developers/apps/building-oauth-apps/authorizing-oauth-apps#device-flow
  async auth(): Promise<void> {
    if (await this.getIsAuth()) {
      return
    }

    type DeviceCode = {
      device_code: string
      user_code: string
      verification_uri: string
      expires_in: number
      interval: number
    }
    const deviceCodeResponse = await fetch(
      'https://github.com/login/device/code?' +
        new URLSearchParams([
          ['client_id', config.github.client_id],
          ['scope', config.github.scope],
        ]),
      {
        method: 'POST',
        headers: [['Accept', 'application/json']],
      }
    )
    if (!deviceCodeResponse.ok) {
      throw new Error('GitHub での認可に失敗しました')
    }
    const deviceCode: DeviceCode = await deviceCodeResponse.json()

    await navigator.clipboard.writeText(deviceCode.user_code)
    alert('クリップボードにコードをコピーしました')

    await new Promise<void>((resolve) =>
      chrome.identity.launchWebAuthFlow(
        { url: deviceCode.verification_uri, interactive: true },
        () => resolve()
      )
    )

    type AccessToken = {
      access_token: string
      scope: string
      token_type: string
    }
    const wait = (sec: number) => {
      return new Promise((resolve) => {
        setTimeout(resolve, sec * 1000)
      })
    }
    let accessToken: AccessToken | null = null
    for (let i = 0; !accessToken && i < 900 / deviceCode.interval; i++) {
      const accessTokenResponse = await fetch(
        'https://github.com/login/oauth/access_token?' +
          new URLSearchParams([
            ['client_id', config.github.client_id],
            ['device_code', deviceCode.device_code],
            ['grant_type', 'urn:ietf:params:oauth:grant-type:device_code'],
          ]),
        {
          method: 'POST',
          headers: [['Accept', 'application/json']],
        }
      )

      if (!accessTokenResponse.ok) {
        await wait(deviceCode.interval)
      }

      accessToken = await accessTokenResponse.json()
      break
    }

    if (!accessToken) {
      throw Error('GitHub での認可に失敗しました')
    }

    await this.writeChromeStorage('token', accessToken.access_token)
  }

  async upsert(todo: ManabaTodo): Promise<void> {
    const rel = await this.readChromeStorage('relation')
    const link2number: Map<string, string> = new Map(rel != null ? rel : [])
    const projectId: string = await this.readChromeStorage('target_project_id')
    if (!projectId) {
      throw new Error('設定が完了していないため GitHub に同期できません')
    }
    const [owner, repo] = await (async () => {
      const repoFullName: string | undefined = await this.readChromeStorage(
        'target_repo_full_name'
      )
      if (!repoFullName) {
        throw new Error('設定が完了していないため GitHub に同期できません')
      }
      return repoFullName.split('/')
    })()

    // issue がこの拡張機能の管理下にない場合
    if (!link2number.has(todo.link)) {
      // issue がこの拡張機能の管理下になく、すでに完了または期限切れならスキップする
      if (todo.status !== 'todo') {
        return
      }

      const postIssueResponse = await this.githubRestApi<
        {
          owner: string
          repo: string
          title: string
          body: string
          assignees: string[]
        },
        { number: number; node_id: string }
      >('POST', `/repos/${owner}/${repo}/issues`, {
        owner,
        repo,
        title: `${todo.courceName}: ${todo.title}`,
        body: `- ${todo.link}`,
        assignees: [owner],
      })
      link2number.set(todo.link, postIssueResponse.number.toString())

      const sdk = await this.buildGitHubGraphQlSdk()
      const addProjectItemResponse = await sdk.AddIssueToProjectV2({
        issueId: postIssueResponse.node_id,
        projectId,
      })

      if (todo.due) {
        const getDueFieldResponse = await sdk
          .GetField({
            projectId,
            fieldName: 'Due',
          })
          .catch((reason: any) => {
            if (
              reason.response?.errors[0]?.message ===
              'Could not resolve to a Unions::ProjectV2FieldConfiguration with the name Due'
            ) {
              throw new Error(
                'project のフィールドに Date 型の Due という名前のフィールドを追加してください'
              )
            } else {
              throw new Error(
                `${reason.response?.errors[0]?.message}: ${JSON.stringify(
                  reason
                )}`
              )
            }
          })

        const fieldId = (() => {
          const projectUnion = getDueFieldResponse.node
          if (!projectUnion || projectUnion.__typename !== 'ProjectV2') {
            throw new Error(
              `不正な API レスポンス: ${JSON.stringify(getDueFieldResponse)}`
            )
          }
          const fieldUnion = projectUnion.field
          if (!fieldUnion || fieldUnion.__typename !== 'ProjectV2Field') {
            throw new Error(
              `不正な API レスポンス: ${JSON.stringify(getDueFieldResponse)}`
            )
          }

          return fieldUnion.id
        })()

        const itemId = (() => {
          const itemId = addProjectItemResponse.addProjectV2ItemById?.item?.id
          if (itemId == null) {
            throw new Error(
              `不正な API レスポンス: ${JSON.stringify(addProjectItemResponse)}`
            )
          }

          return itemId
        })()

        await sdk.AddDueDateToProjectV2Item({
          fieldId,
          itemId,
          projectId,
          value: {
            date: todo.due.toISOString(),
          },
        })
      }

      await this.writeChromeStorage(
        'relation',
        Array.from(link2number.entries())
      )

      // この時点では必ず issue と課題の状態は同期されている
      return
    }

    await this.changeStatus(todo.link, todo.status)
  }

  async changeStatus(link: string, status: ManabaTodoStatus): Promise<void> {
    const link2number: Map<string, string> = new Map(
      (await this.readChromeStorage('relation')) || []
    )
    if (!link2number.has(link)) {
      throw new Error('指定された課題は GitHub に登録されていません')
    }
    const [owner, repo] = await (async () => {
      const repoFullName: string | undefined = await this.readChromeStorage(
        'target_repo_full_name'
      )
      if (!repoFullName) {
        throw new Error('設定が完了していないため GitHub に同期できません')
      }
      return repoFullName.split('/')
    })()

    if (status === 'overdue') {
      // 期限切れの場合
      this.githubRestApi(
        'PATCH',
        `/repos/${owner}/${repo}/issues/${link2number.get(link)}`,
        {
          owner,
          repo,
          state: 'closed',
          state_reason: 'not_planned',
        }
      )
      return
    } else if (status === 'done') {
      // 完了の場合
      this.githubRestApi(
        'PATCH',
        `/repos/${owner}/${repo}/issues/${link2number.get(link)}`,
        {
          owner,
          repo,
          state: 'closed',
          state_reason: 'completed',
        }
      )
    } else {
      // 未完了の場合
      this.githubRestApi(
        'PATCH',
        `/repos/${owner}/${repo}/issues/${link2number.get(link)}`,
        {
          owner,
          repo,
          state: 'open',
        }
      )
    }
  }

  async getSettings(): Promise<RepositorySetting[]> {
    const sdk = await this.buildGitHubGraphQlSdk()

    let repositories = []
    {
      const res = await sdk.ListFirst100Repositories()
      repositories = (res.viewer.repositories.nodes || []).filter(
        (p): p is NonNullable<typeof p> => p != null
      )
      if (res.viewer.repositories.pageInfo.hasNextPage) {
        let pageInfo = res.viewer.repositories.pageInfo
        while (pageInfo.hasNextPage && pageInfo.endCursor) {
          const res = await sdk.ListNext100Repositories({
            after: pageInfo.endCursor,
          })
          repositories = repositories.concat(
            (res.viewer.repositories.nodes || []).filter(
              (p): p is NonNullable<typeof p> => p != null
            )
          )
          pageInfo = res.viewer.repositories.pageInfo
        }
      }
    }
    const selectRepositorySetting: DropdownSetting = {
      type: 'dropdown',
      id: 'target_repo_full_name',
      title: 'リポジトリ',
      description: '選択したリポジトリに issue をポストします',
      options: repositories.map((b) => ({
        key: b.nameWithOwner,
        value: b.nameWithOwner,
      })),
    }

    let projects = []
    {
      const res = await sdk.ListFirst100ProjectsV2()
      projects = (res.viewer.projectsV2.nodes || []).filter(
        (p): p is NonNullable<typeof p> => p != null
      )
      if (res.viewer.projectsV2.pageInfo.hasNextPage) {
        let pageInfo = res.viewer.projectsV2.pageInfo
        while (pageInfo.hasNextPage && pageInfo.endCursor) {
          const res = await sdk.ListNext100ProjectsV2({
            after: pageInfo.endCursor,
          })
          projects = projects.concat(
            (res.viewer.projectsV2.nodes || []).filter(
              (p): p is NonNullable<typeof p> => p != null
            )
          )
          pageInfo = res.viewer.projectsV2.pageInfo
        }
      }
    }
    const selectProjectSetting: DropdownSetting = {
      type: 'dropdown',
      id: 'target_project_id',
      title: 'プロジェクト',
      description:
        '作成した issue を選択したプロジェクトに item として追加します',
      options: projects.map((p) => ({
        key: p.id,
        value: `${p.title} #${p.number}`,
      })),
    }

    return [selectRepositorySetting, selectProjectSetting]
  }

  async githubRestApi<T, U>(
    method: string,
    path: string,
    body?: T
  ): Promise<U> {
    const response = await fetch(`https://api.github.com${path}`, {
      method: method,
      headers: [
        ['Authorization', `Bearer ${await this.readChromeStorage('token')}`],
        ['Accept', 'application/vnd.github+json'],
      ],
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      throw Error(
        `${method} ${response.url}: ` +
          `${response.status} ${response.statusText}\n` +
          `${await response.text()}`
      )
    }

    return await response.json()
  }

  async buildGitHubGraphQlSdk(): Promise<Sdk> {
    const client = new GraphQLClient('https://api.github.com/graphql', {
      headers: [
        ['Authorization', `Bearer ${await this.readChromeStorage('token')}`],
      ],
    })
    return getSdk(client)
  }
}
