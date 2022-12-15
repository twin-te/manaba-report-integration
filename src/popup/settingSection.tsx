/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { readStorage, writeStorage } from '../background/utils'
import { FormControlLabel, Switch, Paper } from '@material-ui/core'
import WhiteButton from './whiteButton'

const Root = styled(Paper)({
  padding: '1rem',
})

const SettingSection: React.FC = () => {
  const [autoSync, setAutoSync] = useState(false)

  useEffect(() => {
    ;(async () => {
      setAutoSync(await readStorage('autoSync'))
    })()
  }, [])

  return (
    <Root elevation={0}>
      <section>
        <WhiteButton
          color="primary"
          variant="contained"
          onClick={() => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              chrome.tabs.sendMessage(tabs[0].id!, { type: 'editBlackList' })
            })
            window.close()
          }}
        >
          フィルタの設定
        </WhiteButton>
        <p>授業ごとや、カテゴリごとに同期するものを選択できます</p>
      </section>
      <FormControlLabel
        control={
          <Switch
            checked={autoSync}
            onChange={(e, c) => {
              writeStorage('autoSync', c)
              setAutoSync(c)
            }}
            color="primary"
          />
        }
        label="自動同期"
      />
      <p>
        manabaのページを読み込んだ際、前回の同期から１時間以上経過していた場合に同期を実行します
      </p>
    </Root>
  )
}

export default SettingSection
