export type Cource = { container: HTMLElement; link: string }

const listType = {
  listCourceDOM(): Cource[] {
    return [
      ...document.querySelectorAll<HTMLTableRowElement>(
        'table.stdlist.courselist tr.courselist-c'
      ),
    ]
      .map<Partial<Cource>>((d) => ({
        container: d,
        link: d.querySelector<HTMLLinkElement>('.courselist-title > a')?.href,
      }))
      .filter(({ container, link }) => container && link) as Cource[]
  },
  prepare(): [Cource[], HTMLElement] {
    const list = this.listCourceDOM()
    const tableTitle = document.querySelector('.stdlist.courselist .title')
    if (!tableTitle) throw new Error('テーブルが見つかりません')
    const th = document.createElement('th')
    th.innerHTML = '同期するものにチェック<br>小テスト・アンケート・レポート'
    th.className = 'th-filter'
    th.setAttribute('width', '30%')
    tableTitle.insertBefore(th, tableTitle.firstChild)
    ;[...tableTitle.querySelectorAll('th')].forEach((e) => {
      e.style.position = 'sticky'
      e.style.top = '0'
      e.style.zIndex = '1'
    })
    return [
      list.map(({ container, link }) => {
        container.removeAttribute('onclick')
        const nc = container.cloneNode(true) as HTMLElement
        container.parentNode?.replaceChild(nc, container)
        if (nc.children[3]) nc.removeChild(nc.children[3])
        const reactRoot = document.createElement('td')
        reactRoot.className = 'react-root'
        reactRoot.style.textAlign = 'center'
        return {
          container: nc.insertBefore(reactRoot, nc.firstChild),
          link,
        }
      }),
      th,
    ]
  },
  deleteReactRootElement(list: Cource[]): void {
    const tableTitle = document.querySelector('.stdlist.courselist .title')
    if (tableTitle && tableTitle.firstChild && tableTitle.lastChild) {
      tableTitle.removeChild(tableTitle.firstChild)
    }
    list.forEach(({ container }) => {
      if (container?.parentElement)
        container.parentElement.removeChild(container)
    })
  },
}

const thumbType = {
  listCourceDOM(): Cource[] {
    return [
      ...document.querySelectorAll<HTMLElement>(
        '.my-infolist-mycourses .coursecard'
      ),
    ]
      .map<Partial<Cource>>((d) => ({
        container: d,
        link: d.querySelector<HTMLLinkElement>('a')?.href,
      }))
      .filter(({ container, link }) => container && link) as Cource[]
  },
  prepare(): [Cource[], HTMLElement] {
    const list = this.listCourceDOM()
    const courceBody = document.querySelector('.mycourses-body')
    const reactRoot = document.createElement('div')
    reactRoot.className = 'react-root'
    courceBody?.insertBefore(reactRoot, courceBody.firstChild)
    return [
      list.map(({ container, link }) => {
        container.removeAttribute('onclick')
        container.style.height = '120px'
        const nc = container.cloneNode(true) as HTMLElement
        container.parentNode?.replaceChild(nc, container)
        const reactRoot = document.createElement('div')
        reactRoot.className = 'react-root'
        reactRoot.style.marginTop = '8px'
        return {
          link,
          container: nc.appendChild(reactRoot),
        }
      }),
      reactRoot,
    ]
  },
  deleteReactRootElement(list: Cource[]): void {
    const courceBody = document.querySelector('.mycourses-body')
    const reactRoot = courceBody?.querySelector('.react-root')
    if (reactRoot) courceBody?.removeChild(reactRoot)
    list.forEach(({ container }) => {
      if (container.parentElement) {
        container.parentElement.style.height = '88px'
        container.parentElement.removeChild(container)
      }
    })
  },
}

export function detectType(): 'list' | 'thumb' {
  return document.querySelector('.stdlist.courselist') ? 'list' : 'thumb'
}

export function blacklistDomUtil() {
  return detectType() === 'list' ? listType : thumbType
}
