import { VStack } from '@chakra-ui/react'
import { useSetRecoilState } from 'recoil'
import { useLocalStorage } from 'usehooks-ts'

import { testCaseListState } from '@atoms/PlotSettingAtom'
import { MySwitch, MySelect } from '@parts'

import type { SelectOptionType } from '@types'
import type { MultiValue } from 'chakra-react-select'

type Props = {
  options?: SelectOptionType[]
}

export const TestCaseSelect = (props: Props) => {
  const { options } = props
  const [isChosen, setIsChosen] = useLocalStorage('IsChosen', false)
  const setTestCaseList = useSetRecoilState(testCaseListState)

  const toggleValue = (value: boolean) => {
    setIsChosen(() => !value)
  }

  const selectValue = (value: MultiValue<SelectOptionType>) => {
    setTestCaseList(() => value)
  }

  return (
    <VStack>
      <MySwitch label="Choose test cases" value={isChosen} toggleValue={toggleValue} />
      <MySelect
        instanceId="testCase"
        color="teal.500"
        width="100%"
        height="40px"
        options={options}
        isMulti={true}
        selectValue={selectValue}
      />
    </VStack>
  )
}
