/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useState, useEffect } from 'react'
import { DropdownSetting } from '../../types/repositorySettings'
import { Repository } from '../../repositories/repository'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'

type DropdownSettingComponentProp = {
  repo: Repository
  setting: DropdownSetting
}

const DropdownSettingComponent: React.FC<DropdownSettingComponentProp> = ({
  setting,
  repo,
}) => {
  const [data, setData] = useState('')
  useEffect(() => {
    repo.readChromeStorage(setting.id).then((res) => setData(res))
  }, [])
  return (
    <FormControl>
      <Select
        value={data}
        onChange={(e) => {
          setData(e.target.value as string)
          repo.writeChromeStorage(setting.id, e.target.value)
        }}
      >
        {setting.options.map((e) => (
          <MenuItem key={e.key} value={e.key}>
            {e.value}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default DropdownSettingComponent
