/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useState, useEffect } from 'react'
import { TextSetting } from '../../types/repositorySettings'
import { Repository } from '../../repositories/repository'
import FormControl from '@material-ui/core/FormControl'
import { TextField } from '@material-ui/core'

type TextSettingComponentProp = {
  repo: Repository
  setting: TextSetting
}

const TextSettingComponent: React.FC<TextSettingComponentProp> = ({
  setting,
  repo,
}) => {
  const [data, setData] = useState('')
  useEffect(() => {
    repo.readChromeStorage(setting.id).then((res) => setData(res))
  }, [])
  return (
    <FormControl>
      <TextField
        value={data}
        onChange={(e) => {
          setData(e.target.value as string)
          repo.writeChromeStorage(setting.id, e.target.value)
        }}
      />
    </FormControl>
  )
}

export default TextSettingComponent
