/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Snackbar, CircularProgress, Button } from '@material-ui/core'
import { Message } from '../types/message'
import { MainTheme } from '../uiTheme'
import BlackListSetting from '../ui/BlackListSetting'
import { readStorage, writeStorage } from '../background/utils'
import useSWR from 'swr'

const App = () => {
  const [progress, setProgress] = useState(0)
  const [importing, setImporting] = useState(false)
  const [importingText, setImportingText] = useState('')

  const [editBlackList, setEditBlackList] = useState(false)

  useEffect(() => {
    const listener = (request: Message) => {
      if (request.type === 'syncStatusChanged') {
        if (request.status === 'progress') setImporting(true)
        else setTimeout(() => setImporting(false), 3000)
        setImportingText(request.statusText)
        setProgress(Number(request.progress))
      } else if (request.type === 'editBlackList') {
        setEditBlackList(true)
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [])

  const {
    data: blackListFeatureNotify,
    mutate: updateBlackListFeatureNotify,
  } = useSWR('special-notify:black-list-feature', readStorage)

  return (
    <MainTheme>
      {!editBlackList && (
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={importing}
          message={'Manaba Report Integration:　' + importingText}
          action={<CircularProgress variant="static" value={progress} />}
        />
      )}
      {editBlackList && (
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={editBlackList}
          message={
            <>
              <div>フィルタ設定中</div>
              <div>(次回の同期から反映されます)</div>
            </>
          }
          action={
            <Button color="secondary" onClick={() => setEditBlackList(false)}>
              完了
            </Button>
          }
        />
      )}
      {!blackListFeatureNotify && (
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={!editBlackList}
          message={'小テストやレポートも同期できるようになりました！'}
          action={
            <Button
              color="secondary"
              onClick={async () => {
                setEditBlackList(true)
                await writeStorage('special-notify:black-list-feature', true)
                updateBlackListFeatureNotify(true)
              }}
            >
              設定する
            </Button>
          }
        />
      )}
      <BlackListSetting active={editBlackList} />
    </MainTheme>
  )
}

const reactRoot = document.createElement('div')
reactRoot.id = 'react-root'
reactRoot.style.position = 'fixed'
reactRoot.style.right = '0'
reactRoot.style.bottom = '0'
document.body.appendChild(reactRoot)
ReactDOM.render(<App />, document.querySelector('#react-root'))
