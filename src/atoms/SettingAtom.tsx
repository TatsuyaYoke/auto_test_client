import { atom } from 'recoil'

import type { AppSettingsType, SelectOptionType } from '@types'
import type { SingleValue } from 'chakra-react-select'

export const isMaximizeState = atom<boolean>({
  key: 'isMaximizeState',
  default: true,
})

export const projectState = atom<SingleValue<SelectOptionType>>({
  key: 'projectState',
  default: null,
})

export const settingState = atom<AppSettingsType | null>({
  key: 'settingState',
  default: null,
})
