import {
  upsertAll,
  getActiveRepository,
} from '../repositories/repositoryManager'
import { ManabaTodo } from '../types/manabaTodo'
import { Message } from '../types/message'

let isSync = false

function broadcastMessage(msg: Message): void {
  chrome.runtime.sendMessage(msg)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    chrome.tabs.sendMessage(tabs[0].id!!, msg)
  )
}

chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'manaba.tsukuba.ac.jp' },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ])
  })
})

chrome.runtime.onMessage.addListener(
  (request: Message, sender, sendResponse) => {
    console.log(request, sender, sendResponse)
    switch (request.type) {
      case 'updateTodoStatus':
        getActiveRepository().then((repo) => {
          if (!repo) {
            sendResponse(false)
          } else
            repo
              .auth()
              .then(() => repo.changeStatus(request.link, request.status))
              .then(() => sendResponse(true))
        })
        break
      case 'requestSync':
        if (isSync) return
        isSync = true
        chrome.runtime.sendMessage({
          type: 'syncStatusChanged',
          status: 'progress',
          statusText: 'Manabaから情報を取得しています',
          progress: -1,
        })
        chrome.tabs.query({ active: true, currentWindow: true }, function (
          tabs
        ) {
          chrome.tabs.sendMessage(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            tabs[0].id!!,
            { type: 'fetchAllReportFromManaba' },
            async (data: ManabaTodo[]) => {
              if (!data) {
                broadcastMessage({
                  type: 'syncStatusChanged',
                  status: 'done',
                  statusText: `エラー\n Manabaタブを再読込してください`,
                  progress: '0',
                })
                isSync = false
                return
              }
              try {
                await upsertAll(data, (crr, all) => {
                  broadcastMessage({
                    type: 'syncStatusChanged',
                    status: 'progress',
                    statusText: '同期中です',
                    progress: ((crr / all) * 100).toString(),
                  })
                })
                broadcastMessage({
                  type: 'syncStatusChanged',
                  status: 'done',
                  statusText: '完了しました',
                  progress: '100',
                })
                chrome.storage.sync.set({ lastSync: Date.now() })
              } catch (e) {
                broadcastMessage({
                  type: 'syncStatusChanged',
                  status: 'done',
                  statusText: `エラー\n ${e.message}`,
                  progress: '0',
                })
              }
              isSync = false
            }
          )
        })
        break
    }
    return true
  }
)
