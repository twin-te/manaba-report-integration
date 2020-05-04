/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useState, useEffect } from 'react'
import { CheckboxSetting } from '../../types/repositorySettings'
import { Repository } from '../../repositories/repository'
import FormControl from '@material-ui/core/FormControl'
import { Switch } from '@material-ui/core'

type CheckboxSettingComponentProp = {
  repo: Repository
  setting: CheckboxSetting
}

const CheckboxSettingComponent: React.FC<CheckboxSettingComponentProp> = ({
  setting,
  repo,
}) => {
  const [data, setData] = useState(false)
  useEffect(() => {
    repo.readChromeStorage(setting.id).then((res) => setData(res))
  }, [])
  return (
    <FormControl>
      <Switch
        checked={data}
        onChange={(e, c) => {
          setData(c)
          repo.writeChromeStorage(setting.id, c)
        }}
      />
    </FormControl>
  )
}

export default CheckboxSettingComponent
