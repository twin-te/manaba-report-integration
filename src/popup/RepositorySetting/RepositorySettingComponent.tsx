import React from 'react'
import { Repository } from '../../repositories/repository'
import {
  RepositorySetting,
  DropdownSetting,
  TextSetting,
  CheckboxSetting,
} from '../../types/repositorySettings'
import useSWR from 'swr'
import DropdownSettingComponent from './DropdownSettingComponent'
import { Typography, Tooltip } from '@material-ui/core'
import TextSettingComponent from './TextSettingComponent'
import styled from 'styled-components'
import HelpIcon from '@material-ui/icons/Help'
import CheckboxSettingComponent from './CheckboxSettingComponent'

type RepositorySettingComponentProp = {
  repo: Repository
}

const selectComponentForSetting = (
  repo: Repository,
  setting: RepositorySetting
): JSX.Element => {
  switch (setting.type) {
    case 'dropdown':
      return (
        <DropdownSettingComponent
          repo={repo}
          setting={setting as DropdownSetting}
        />
      )
    case 'text':
      return (
        <TextSettingComponent repo={repo} setting={setting as TextSetting} />
      )
    case 'checkbox':
      return (
        <CheckboxSettingComponent
          repo={repo}
          setting={setting as CheckboxSetting}
        />
      )
    default:
      return <div />
  }
}

const Root = styled.section`
  width: 100%;
`

const Form = styled.div`
  display: grid;
  align-items: center;
  justify-content: space-between;
  grid-template-columns: 0.5fr 30px 0.5fr;
  padding: 0.5rem 0;
`

const RepositorySettingComponent: React.FC<RepositorySettingComponentProp> = ({
  repo,
}) => {
  const { data: settings } = useSWR(`${repo.id}:settings`, () =>
    repo.getSettings()
  )
  return (
    <Root>
      <Typography variant="h5" gutterBottom>
        設定
      </Typography>
      {settings?.map((s, i) => (
        <Form key={i}>
          <Typography variant="subtitle1">{s.title}</Typography>
          <Tooltip title={s.description} placement="top">
            <HelpIcon color="primary" />
          </Tooltip>
          {selectComponentForSetting(repo, s)}
        </Form>
      ))}
    </Root>
  )
}

export default RepositorySettingComponent
