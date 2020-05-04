export interface RepositorySetting {
  type: 'text' | 'checkbox' | 'dropdown'
  id: string
  title: string
  description: string
}

export interface TextSetting extends RepositorySetting {
  type: 'text'
}

export interface CheckboxSetting extends RepositorySetting {
  type: 'checkbox'
}

export interface DropdownSetting extends RepositorySetting {
  type: 'dropdown'
  options: { key: string; value: string }[]
}
