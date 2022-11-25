import { Link } from '@material-ui/core'
import React, { useEffect, useMemo, useState } from 'react'
import useSWR, { mutate } from 'swr'
import { readStorage, writeStorage } from '../background/utils'
import { BlackList, BlackListItem, readBlackList } from '../types/filterSetting'
import { blacklistDomUtil, Cource, detectType } from './blacklistUtils'
import CourceSelect from './CourceSelect'

type BlackListSettingProp = {
  active: boolean
}

const BlackListSetting: React.FC<BlackListSettingProp> = ({ active }) => {
  const [list, setList] = useState<Cource[]>([])
  const [th, setTh] = useState<HTMLElement | undefined>()
  const { data: blacklist } = useSWR<BlackList>('blacklist', readBlackList)
  useEffect(() => {
    if (active) {
      const [list, th] = blacklistDomUtil().prepare()
      setList(list)
      setTh(th)
    } else if (!active && list.length > 0) {
      blacklistDomUtil().deleteReactRootElement(list)
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
            if (!blacklist) return
            const tmp = { master: item, cources: blacklist.cources }
            await writeStorage('blacklist', tmp)
            mutate('blacklist', tmp)
          }}
          showLabel={detectType() === 'thumb'}
        />
      )}
      {list.map(({ container, link }) => (
        <CourceSelect
          key={link}
          disabled={blacklist?.master}
          parent={container}
          value={blacklist?.cources[link]}
          onChange={handleOnItemChange(link)}
          showLabel={detectType() === 'thumb'}
        />
      ))}
    </div>
  )
}

export default BlackListSetting
