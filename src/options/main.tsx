/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react'
import ReactDOM from 'react-dom'
import mstyled from '@material-ui/core/styles/styled'
import RepositoryItem from './repositoryItem'
import {
  repositories,
  getActiveRepository,
  setActiveRepository,
} from '../repositories/repositoryManager'
import { Container, Typography, Paper } from '@material-ui/core'
import useSWR, { mutate } from 'swr'
import { MainTheme } from '../uiTheme'

const Root = mstyled(Container)({
  paddingTop: '1rem',
  paddingBottom: '1rem',
})

const Repositories = mstyled(Paper)({
  padding: '1rem',
  marginBottom: '1rem',
})

const App = () => {
  const { data: activeRepoID } = useSWR('activeRepo', async () => {
    const repo = await getActiveRepository()
    return repo ? repo.id : undefined
  })

  return (
    <MainTheme>
      <Root maxWidth="sm">
        <Repositories elevation={0}>
          <Typography variant="h2" gutterBottom>
            同期サービス選択
          </Typography>
          {repositories.map((r) => (
            <RepositoryItem
              key={r.id}
              repo={r}
              isActive={activeRepoID === r.id}
              onRadioClick={() =>
                mutate('activeRepo', async () => {
                  await setActiveRepository(r.id)
                  return r.id
                })
              }
            />
          ))}
        </Repositories>
      </Root>
    </MainTheme>
  )
}

ReactDOM.render(<App />, document.querySelector('#app'))
