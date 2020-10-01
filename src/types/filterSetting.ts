import { readStorage, writeStorage } from '../background/utils'

export interface BlackList {
  master: {
    report: boolean
    survey: boolean
    query: boolean
  }
  cources: {
    [key: string]: {
      report: boolean
      survey: boolean
      query: boolean
    }
  }
}

const defaultList: BlackList = {
  master: {
    report: false,
    survey: false,
    query: false,
  },
  cources: {},
}

export function saveBlackList(list: BlackList): Promise<void> {
  return writeStorage('blacklist', list)
}

export async function readBlackList(): Promise<BlackList> {
  const res = await readStorage<BlackList | undefined>('blacklist')
  return res || defaultList
}
