/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useState, useEffect } from 'react'
import WhiteButton from '../ui/whiteButton'
import { Button, ButtonGroup, LinearProgress, Paper } from '@material-ui/core'
import useSWR, { mutate } from 'swr'
import { readStorage } from '../background/utils'
import { Message } from '../types/message'
import styled from 'styled-components'

const Root = styled(Paper)({
  padding: '1rem',
  marginBottom: '1rem',
})
type SyncSectionProp = {
  hasActiveRepo: boolean
}

const onImportClick = (): void => {
  chrome.runtime.sendMessage({
    type: 'requestSync',
  })
}

const SyncSection: React.FC<SyncSectionProp> = ({ hasActiveRepo }) => {
  const [progress, setProgress] = useState(0)
  const [importing, setImporting] = useState(false)
  const [importingText, setImportingText] = useState('')

  const { data: lastSync } = useSWR(
    'lastSync',
    async () => await readStorage<string>('lastSync')
  )

  useEffect(() => {
    const listener = (request: Message) => {
      if (request.type === 'syncStatusChanged') {
        setImporting(request.status === 'progress')
        setImportingText(request.statusText)
        setProgress(Number(request.progress))
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [])

  useEffect(() => {
    mutate('lastSync', () => readStorage<Date | undefined>('lastSync'))
  }, [importing])

  return (
    <Root elevation={0}>
      <ButtonGroup>
        <WhiteButton
          disabled={importing || !hasActiveRepo}
          variant="contained"
          color="primary"
          onClick={() => onImportClick()}
        >
          同期
        </WhiteButton>
        <Button
          color="primary"
          onClick={() => { chrome.runtime.openOptionsPage() }}
        >設定</Button>
      </ButtonGroup>
      <p>{importingText}</p>
      <LinearProgress
        style={{ marginBottom: '1rem' }}
        variant={progress >= 0 ? 'determinate' : 'indeterminate'}
        value={progress}
      />
      <p>最終同期：{lastSync ? new Date(lastSync).toLocaleString() : '無し'}</p>
      <p>
        同期ボタンを押すと、新しい課題を含めすべてが同期されます。
        <br />
        また、このブラウザから提出・提出取り消しをした課題についてはボタンを押さなくても即座に同期されます。
      </p>
    </Root>
  )
}

export default SyncSection
