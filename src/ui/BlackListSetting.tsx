import { Link } from '@material-ui/core'
import React, { useEffect, useMemo, useState } from 'react'
import useSWR, { mutate } from 'swr'
import { readStorage, writeStorage } from '../background/utils'
import { BlackList, BlackListItem } from '../types/filterSetting'
import CourceSelect from './CourceSelect'

function listCourceDOM(): Cource[] {
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
}

function prepare(list: Cource[]): [Cource[], HTMLElement] {
  const tableTitle = document.querySelector('.stdlist.courselist .title')
  if (!tableTitle) throw new Error('テーブルが見つかりません')
  const th = document.createElement('th')
  th.innerHTML = '同期するものにチェック<br>小テスト・アンケート・レポート'
  th.className = 'th-filter'
  th.setAttribute('width', '30%')
  tableTitle.insertBefore(th, tableTitle.firstChild)
  return [
    list.map(({ container, link }) => {
      container.removeAttribute('onclick')
      const nc = container.cloneNode(true)
      container.parentNode?.replaceChild(nc, container)
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
}

function deleteReactRootElement(list: Cource[]): void {
  const tableTitle = document.querySelector('.stdlist.courselist .title')
  if (tableTitle && tableTitle.firstChild && tableTitle.lastChild) {
    tableTitle.removeChild(tableTitle.firstChild)
  }
  list.map(({ container }) => {
    if (container?.parentElement) container.parentElement.removeChild(container)
  })
}

type Cource = { container: HTMLElement; link: string }

type BlackListSettingProp = {
  active: boolean
}

const BlackListSetting: React.FC<BlackListSettingProp> = ({ active }) => {
  const [list, setList] = useState<Cource[]>([])
  const [th, setTh] = useState<HTMLElement | undefined>()
  const { data: blacklist } = useSWR<BlackList>('blacklist', readStorage)
  useEffect(() => {
    if (active) {
      const [list, th] = prepare(listCourceDOM())
      setList(list)
      setTh(th)
    } else if (!active && list.length > 0) {
      deleteReactRootElement(list)
      setList([])
    }
  }, [active])

  const handleOnItemChange = (url: string) => async (item: BlackListItem) => {
    if (!blacklist) return
    const tmp = { master: blacklist.master, cources: { ...blacklist.cources } }
    tmp.cources[url] = item
    await writeStorage('blacklist', tmp)
    mutate('blacklist', tmp)
  }

  return (
    <div>
      {th && (
        <CourceSelect
          parent={th}
          value={blacklist?.master}
          onChange={async (item) => {
            console.log(item, blacklist)
            if (!blacklist) return
            const tmp = { master: item, cources: blacklist.cources }
            await writeStorage('blacklist', tmp)
            mutate('blacklist', tmp)
          }}
        />
      )}
      {list.map(({ container, link }) => (
        <CourceSelect
          key={link}
          disabled={blacklist?.master}
          parent={container}
          value={blacklist?.cources[link]}
          onChange={handleOnItemChange(link)}
        />
      ))}
    </div>
  )
}

export default BlackListSetting
