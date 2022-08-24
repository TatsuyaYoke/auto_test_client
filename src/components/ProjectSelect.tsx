import { useEffect } from 'react'

import { Box } from '@chakra-ui/react'
import { useSetRecoilState } from 'recoil'

import { projectState } from '@atoms/SettingAtom'
import { MySelect } from '@parts'

import type { SelectOptionType } from '@types'
import type { SingleValue } from 'chakra-react-select'

type Props = {
  options: SelectOptionType[]
  defaultValue?: SingleValue<SelectOptionType>
  width?: number | string
}

export const ProjectSelect = (props: Props) => {
  const { options, defaultValue, width = '100%' } = props
  const setProject = useSetRecoilState(projectState)

  const selectValue = (value: SingleValue<SelectOptionType>) => {
    setProject(() => value)
  }

  useEffect(() => {
    if (defaultValue) selectValue(defaultValue)
  }, [])
  return (
    <Box>
      <MySelect
        instanceId="projectSelect"
        color="teal.500"
        width={width}
        height="40px"
        options={options}
        selectValue={selectValue}
        defaultValue={defaultValue}
      />
    </Box>
  )
}
