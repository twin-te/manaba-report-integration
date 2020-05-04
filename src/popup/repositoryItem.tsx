/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useState } from 'react'
import { Repository } from '../repositories/repository'
import useSWR, { mutate } from 'swr'
import RepositorySettingComponent from './RepositorySetting/RepositorySettingComponent'

import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Radio from '@material-ui/core/Radio'
import { styled } from '@material-ui/core/styles'
import './fix.css'
import WhiteButton from './whiteButton'

type RepositoryItemProp = {
  repo: Repository
  isActive: boolean
  onRadioClick: () => void
}

const StyledExpansionPanelSummary = styled(ExpansionPanelSummary)({
  alignItems: 'center',
})

const StyledExpansionPanelDetails = styled(ExpansionPanelDetails)({
  display: 'block',
})

const RepositoryItem: React.FC<RepositoryItemProp> = ({
  repo,
  onRadioClick,
  isActive,
}) => {
  const { data: isAuth } = useSWR(`${repo.id}:isAuth`, () => repo.getIsAuth())
  const [expand, setExpand] = useState(false)
  return (
    <ExpansionPanel expanded={expand} onChange={(_, e) => setExpand(e)}>
      <StyledExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Radio
          checked={isActive}
          onChange={onRadioClick}
          disabled={!isAuth}
          onClick={(e) => e.stopPropagation()}
        />
        <Typography>{repo.name}</Typography>
        {!isAuth ? (
          <WhiteButton
            style={{ marginLeft: '1rem' }}
            variant="contained"
            color="primary"
            onClick={async (e) => {
              e.stopPropagation()
              await repo.auth()
              if (await repo.getIsAuth()) setExpand(true)
              mutate(`${repo.id}:isAuth`, () => repo.getIsAuth())
            }}
          >
            ログイン
          </WhiteButton>
        ) : undefined}
      </StyledExpansionPanelSummary>
      <StyledExpansionPanelDetails>
        {isAuth ? <RepositorySettingComponent repo={repo} /> : undefined}
        <p>{repo.description}</p>
      </StyledExpansionPanelDetails>
    </ExpansionPanel>
  )
}

export default RepositoryItem
