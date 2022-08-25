import { useEffect, useState } from 'react'

import {
  Box,
  Button,
  HStack,
  useToast,
  VStack,
  StackDivider,
  Text,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import axios from 'axios'
import { useRecoilState, useRecoilValue } from 'recoil'
import { useLocalStorage } from 'usehooks-ts'

import { projectSettingState, projectState, settingState } from '@atoms/SettingAtom'

export const BusBox = () => {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [setting, setSetting] = useRecoilState(settingState)
  const [projectSetting, setProjectSetting] = useRecoilState(projectSettingState)
  const [projectIndex, setProjectIndex] = useLocalStorage('ProjectIndex', 0)
  const project = useRecoilValue(projectState)
  const [vocStr, setVocStr] = useLocalStorage('VocStr', '50')
  const [iscStr, setIscStr] = useLocalStorage('IscStr', '0.1')
  const [fillFactorStr, setFillFactorStr] = useLocalStorage('FillFactorStr', '0.9')
  const [periodStr, setPeriodStr] = useLocalStorage('PeriodStr', '5400')
  const [sunRateStr, setSunRateStr] = useLocalStorage('SunRateStr', '0.6')
  const [OffsetStr, setOffsetStr] = useLocalStorage('OffsetStr', '0')

  return (
    <Box h="100%">
      <VStack divider={<StackDivider />} spacing={4} align="stretch" mt="10px">
        <VStack spacing={4}>
          <Flex justifyContent="left" w="100%">
            <Text fontSize="1.5em" fontWeight={600} borderBottom="solid 2px">
              SAS
            </Text>
          </Flex>
          <HStack spacing={4} w="100%">
            <Text textAlign="center" w="80px">
              Voc
            </Text>
            <NumberInput w="150px" step={5} min={50} max={140} value={vocStr} onChange={setVocStr}>
              <NumberInputField placeholder="Voc [V]" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text textAlign="center" w="80px">
              Isc
            </Text>
            <NumberInput w="150px" step={0.1} min={0.1} max={4} value={iscStr} onChange={setIscStr}>
              <NumberInputField placeholder="Isc [A]" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text textAlign="center" w="80px">
              Fill Factor
            </Text>
            <NumberInput w="150px" step={0.01} min={0.5} max={0.95} value={fillFactorStr} onChange={setFillFactorStr}>
              <NumberInputField placeholder="F.F" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>
          <HStack spacing={4} w="100%">
            <Text textAlign="center" w="80px">
              Period
            </Text>
            <NumberInput w="150px" step={60} min={10} max={6000} value={periodStr} onChange={setPeriodStr}>
              <NumberInputField placeholder="Period [sec]" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text textAlign="center" w="80px">
              Sun Rate
            </Text>
            <NumberInput w="150px" step={0.01} min={0.1} max={0.9} value={sunRateStr} onChange={setSunRateStr}>
              <NumberInputField placeholder="Sun rate" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text textAlign="center" w="80px">
              Offset
            </Text>
            <NumberInput w="150px" step={60} min={0} max={6000} value={OffsetStr} onChange={setOffsetStr}>
              <NumberInputField placeholder="Offset [sec]" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>
          <HStack spacing={4} w="100%">
            <Button width="150px" colorScheme="teal">
              ON
            </Button>
            <Button width="150px" colorScheme="teal">
              REPEAT
            </Button>
            <Button width="150px" colorScheme="teal">
              STOP
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  )
}
