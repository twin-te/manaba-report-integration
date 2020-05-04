import { ManabaTodo } from '../types/manabaTodo'
import { Message } from '../types/message'

/**
 * html文字列からdomを生成
 * @param htmlString {string} ただのhtml文字列
 */
function createElementFromHTML(htmlString: string): HTMLElement {
  const html = document.createElement('html')
  html.innerHTML = htmlString.trim()
  return html
}

/**
 * コース一覧を取得
 * @returns {{link: string, title: string}[]} コース一覧
 */
async function listCource(): Promise<{ link: string; title: string }[]> {
  const raw = await (await fetch('https://manaba.tsukuba.ac.jp/ct/home')).text()
  const dom = createElementFromHTML(raw)

  return [
    ...dom.querySelectorAll<HTMLLinkElement>(
      'table.stdlist.courselist .courselist-title > a'
    ),
  ].map((a) => ({
    link: a.href,
    title: a.textContent || '',
  }))
}

/**
 * 指定されたコースのレポートを取得
 * @param link {string} コースへのリンク
 * @returns {{title: string, link: string, deadline: string, status: string}[]} link
 */
async function getReports(link: string): Promise<ManabaTodo[]> {
  const raw = await (await fetch(`${link}_report`)).text()
  const dom = createElementFromHTML(raw)

  const courceName = dom.querySelector('#coursename')?.textContent || ''
  const lectureCode = dom.querySelector('.coursecode')?.textContent || ''

  return [
    ...dom.querySelectorAll<HTMLTableRowElement>(
      'table.stdlist > tbody > tr:not(.title)'
    ),
  ].map((e) => {
    const tds = e.querySelectorAll('td')
    return {
      type: 'report',
      courceName,
      lectureCode,
      title: tds[0].querySelector('a')?.textContent || '',
      link: tds[0].querySelector('a')?.href || '',
      due: tds[3].textContent ? new Date(tds[3].textContent) : null,
      status: tds[1].querySelector('.deadline') ? 'todo' : 'done',
    }
  })
}

/**
 * 全てのコースのすべてのレポートを取得
 */
async function getAllReports(): Promise<ManabaTodo[]> {
  const list = await listCource()
  return (
    await Promise.all(list.map(async (c) => await getReports(c.link)))
  ).flat()
}

chrome.runtime.onMessage.addListener(
  (request: Message, sender, sendResponse) => {
    console.log(request, sender, sendResponse)
    if (request.type === 'fetchAllReportFromManaba') {
      getAllReports().then(sendResponse)
    } else {
      sendResponse('nodata')
    }
    return true
  }
)

chrome.storage.sync.get('lastSync', (data) => {
  if (
    Date.now() - Number(data['lastSync'] ? data['lastSync'] : 0) >
    1000 * 60 * 60
  )
    chrome.runtime.sendMessage({
      type: 'requestSync',
    })
})
