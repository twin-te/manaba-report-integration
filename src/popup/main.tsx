/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import mstyled from '@material-ui/core/styles/styled'
//import RepositoryItem from '../options/repositoryItem'
import { getActiveRepository } from '../repositories/repositoryManager'
import { Container, Typography, Paper } from '@material-ui/core'
import useSWR, { mutate } from 'swr'
import { MainTheme } from '../uiTheme'
import SyncSection from './syncSection'
import SettingSection from './settingSection'
import WhiteButton from '../ui/whiteButton'

const Root = mstyled(Container)({
  paddingTop: '1rem',
  paddingBottom: '1rem',
  background: '#f5f5f5',
})

const Header = mstyled(Paper)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  padding: '1rem',
  color: '#00c0c0',
  marginBottom: '1rem',
})

const Logo = styled.img`
  width: 64px;
`

const TwinteLogo = styled.img`
  height: 1.5rem;
  vertical-align: sub;
`

const Brand = styled.div``

const AppName = styled.h1`
  font-size: 1.3rem;
  font-weight: bold;
`

const SubName = styled.h2`
  font-size: 1rem;
  font-weight: normal;
`

const App = () => {
  const { data: activeRepoID } = useSWR('activeRepo', async () => {
    const repo = await getActiveRepository()
    return repo ? repo.id : undefined
  })

  return (
    <MainTheme>
      <Root maxWidth="sm">
        <Header elevation={0}>
          <Logo src="./icons/128.png" alt="logo" />
          <Brand>
            <AppName>
              Manaba Report
              <br />
              Integration
            </AppName>
            <SubName>
              by Twin:te <TwinteLogo src="./icons/twinte.png" />
            </SubName>
          </Brand>
        </Header>
        <SyncSection hasActiveRepo={!!activeRepoID} />
        <SettingSection />
      </Root>
    </MainTheme>
  )
}

ReactDOM.render(<App />, document.querySelector('#app'))
