/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { readStorage, writeStorage } from '../background/utils'
import { FormControlLabel, Switch, Paper } from '@material-ui/core'

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
