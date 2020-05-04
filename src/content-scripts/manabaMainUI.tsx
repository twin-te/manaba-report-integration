/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Snackbar, CircularProgress } from '@material-ui/core'
import { Message } from '../types/message'
import { MainTheme } from '../uiTheme'

const App = () => {
  const [progress, setProgress] = useState(0)
  const [importing, setImporting] = useState(false)
  const [importingText, setImportingText] = useState('')
  useEffect(() => {
    const listener = (request: Message) => {
      console.log(request)
      if (request.type === 'syncStatusChanged') {
        if (request.status === 'progress') setImporting(true)
        else setTimeout(() => setImporting(false), 3000)
        setImportingText(request.statusText)
        setProgress(Number(request.progress))
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [])
  return (
    <MainTheme>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={importing}
        message={'Manaba Report Integration:　' + importingText}
        action={<CircularProgress variant="static" value={progress} />}
      />
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
