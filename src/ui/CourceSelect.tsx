import Checkbox from '@material-ui/core/Checkbox'
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { BlackListItem } from '../types/filterSetting'

type CourceSelectProp = {
  disabled?: BlackListItem
  value?: BlackListItem
  onChange: (item: BlackListItem) => void
  parent: HTMLElement
}

const defaultValue = {
  query: false,
  report: false,
  survey: false,
}

const CourceSelect: React.FC<CourceSelectProp> = ({
  value,
  parent,
  disabled,
  onChange,
}) => {
  return ReactDOM.createPortal(
    <div>
      <Checkbox
        disabled={disabled?.query}
        checked={!value?.query}
        onChange={(e, c) => {
          onChange({
            ...(value || defaultValue),
            query: !c,
          })
        }}
      />
      <Checkbox
        disabled={disabled?.survey}
        checked={!value?.survey}
        onChange={(e, c) => {
          onChange({
            ...(value || defaultValue),
            survey: !c,
          })
        }}
      />
      <Checkbox
        disabled={disabled?.report}
        checked={!value?.report}
        onChange={(e, c) => {
          onChange({
            ...(value || defaultValue),
            report: !c,
          })
        }}
      />
    </div>,
    parent
  )
}

export default CourceSelect
