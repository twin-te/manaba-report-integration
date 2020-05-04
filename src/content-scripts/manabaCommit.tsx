/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useState } from 'react'
import { Snackbar } from '@material-ui/core'
import ReactDOM from 'react-dom'
import { MainTheme } from '../uiTheme'

const reactRoot = document.createElement('div')
reactRoot.id = 'react-root'
reactRoot.style.position = 'fixed'
reactRoot.style.right = '0'
reactRoot.style.bottom = '0'
document.body.appendChild(reactRoot)

const App: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState(
    'Manaba Report Integration:　更新中...'
  )
  useEffect(() => {
    if (location.search === '?action=commited') {
      setOpen(true)
      chrome.runtime.sendMessage(
        {
          type: 'updateTodoStatus',
          link: location.origin + location.pathname,
          status: 'done',
        },
        (res) => {
          setMessage(
            'Manaba Report Integration:　' +
              (res ? '更新しました' : '失敗しました')
          )
        }
      )
    } else if (
      location.search === '' &&
      document.querySelector(
        'table.stdlist.stdlist-report tr:last-child td strong'
      )?.textContent === 'まだ提出していません'
    ) {
      setOpen(true)
      chrome.runtime.sendMessage(
        {
          type: 'updateTodoStatus',
          link: location.origin + location.pathname,
          status: 'todo',
        },
        (res) => {
          setMessage(
            'Manaba Report Integration:　' +
              (res ? '更新しました' : '失敗しました')
          )
        }
      )
    }
  }, [])

  return (
    <MainTheme>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        message={message}
      />
    </MainTheme>
  )
}

ReactDOM.render(<App />, document.querySelector('#react-root'))
