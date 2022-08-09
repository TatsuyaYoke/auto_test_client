import { useState, useEffect } from 'react'

import { VStack, Box, Text, useColorModeValue } from '@chakra-ui/react'
import { SingleDatepicker } from 'chakra-dayzed-datepicker'

import type { PropsConfigs } from 'chakra-dayzed-datepicker/dist/utils/commonTypes'

type Props = {
  selectDate: (startDate: Date, endDate: Date) => void
}

export const DayPicker = (props: Props) => {
  const { selectDate } = props
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const hoverBg = useColorModeValue('teal.300', 'teal.400')
  const selectedBg = useColorModeValue('teal.100', 'teal.700')

  const dayPickerConfig: PropsConfigs = {
    dateNavBtnProps: {
      variant: 'outline',
    },
    dayOfMonthBtnProps: {
      borderColor: 'blue.300',
      selectedBg: selectedBg,
      _hover: {
        bg: hoverBg,
      },
    },
  }

  useEffect(() => {
    if (startDate > endDate) {
      setEndDate(() => startDate)
    }
    selectDate(startDate, endDate)
  }, [startDate])

  useEffect(() => {
    if (startDate > endDate) {
      setStartDate(() => endDate)
    }
    selectDate(startDate, endDate)
  }, [endDate])

  return (
    <VStack spacing={3}>
      <Box w="100%">
        <Text fontWeight={600}>Start Date</Text>
        <SingleDatepicker date={startDate} onDateChange={setStartDate} propsConfigs={dayPickerConfig} />
      </Box>
      <Box w="100%">
        <Text fontWeight={600}>End Date</Text>
        <SingleDatepicker date={endDate} onDateChange={setEndDate} propsConfigs={dayPickerConfig} />
      </Box>
    </VStack>
  )
}
