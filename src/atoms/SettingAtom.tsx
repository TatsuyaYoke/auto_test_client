import { atom } from 'recoil'

import type { ApiReturnType, AppSettingsType, PjSettingType, SelectOptionType } from '@types'
import type { SingleValue } from 'chakra-react-select'

export const isMaximizeState = atom<boolean>({
  key: 'isMaximizeState',
  default: true,
})

export const projectState = atom<SingleValue<SelectOptionType>>({
  key: 'projectState',
  default: null,
})

export const settingState = atom<ApiReturnType<AppSettingsType> | null>({
  key: 'settingState',
  default: null,
})

export const projectSettingState = atom<PjSettingType | null>({
  key: 'projectSettingState',
  default: null,
})

export const testNameState = atom<string>({
  key: 'testNameState',
  default: '',
})
