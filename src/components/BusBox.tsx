import { useState } from 'react'

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
import { useRecoilValue } from 'recoil'
import { useLocalStorage } from 'usehooks-ts'

import { apiUrlState } from '@atoms/SettingAtom'
import { BadgeSuccessBox } from '@parts'
import { apiNoDataSchema } from '@types'

export const BusBox = () => {
  const toast = useToast()
  const apiUrl = useRecoilValue(apiUrlState)
  const [vocStr, setVocStr] = useLocalStorage('VocStr', '50')
  const [iscStr, setIscStr] = useLocalStorage('IscStr', '0.1')
  const [fillFactorStr, setFillFactorStr] = useLocalStorage('FillFactorStr', '0.9')
  const [periodStr, setPeriodStr] = useLocalStorage('PeriodStr', '5400')
  const [sunRateStr, setSunRateStr] = useLocalStorage('SunRateStr', '0.6')
  const [OffsetStr, setOffsetStr] = useLocalStorage('OffsetStr', '0')
  const [satStatus, setSatStatus] = useState(false)
  const [recordStatus, setRecordStatus] = useState(false)

  const changeSatStatus = async (modeEndPoint: 'satEna' | 'satDis') => {
    if (!apiUrl) {
      toast({
        title: 'API not start',
        status: 'error',
        isClosable: true,
      })
      return
    }

    const response = await axios.get(`${apiUrl}/bus/busJig/${modeEndPoint}`).catch(() => ({
      data: {
        success: false,
        error: 'Not exist: API',
      },
    }))

    const schemaResult = apiNoDataSchema.safeParse(response.data)
    if (!schemaResult.success) {
      toast({
        title: 'Response data type is not correct',
        status: 'error',
        isClosable: true,
      })
      return
    }

    if (!schemaResult.data.success) {
      toast({
        title: 'SAT Status change failed',
        status: 'error',
        isClosable: true,
      })
    } else if (modeEndPoint === 'satEna') {
      setSatStatus(true)
    } else {
      setSatStatus(false)
    }
  }

  const changeRecordStatus = async (modeEndPoint: 'recordStart' | 'recordStop') => {
    if (!apiUrl) {
      toast({
        title: 'API not start',
        status: 'error',
        isClosable: true,
      })
      return
    }

    const response = await axios.get(`${apiUrl}/bus/gl840/${modeEndPoint}`).catch(() => ({
      data: {
        success: false,
        error: 'Not exist: API',
      },
    }))
    const schemaResult = apiNoDataSchema.safeParse(response.data)
    if (!schemaResult.success) {
      toast({
        title: 'Response data type is not correct',
        status: 'error',
        isClosable: true,
      })
      return
    }

    if (!schemaResult.data.success) {
      toast({
        title: 'GL840 Record Status change failed',
        status: 'error',
        isClosable: true,
      })
    } else if (modeEndPoint === 'recordStart') {
      setRecordStatus(true)
    } else {
      setRecordStatus(false)
    }
  }

  return (
    <Box h="100%">
      <VStack divider={<StackDivider />} spacing={4} align="stretch" mt="10px">
        <VStack spacing={4}>
          <Flex justifyContent="left" w="100%">
            <Text fontSize="1.5em" fontWeight={600} borderBottom="solid 2px">
              BUS JIG
            </Text>
          </Flex>
          <HStack spacing={4} w="100%">
            <Button width="150px" colorScheme="blue" onClick={() => changeSatStatus('satEna')}>
              SAT ENA
            </Button>
            <Button width="150px" colorScheme="red" onClick={() => changeSatStatus('satDis')}>
              SAT DIS
            </Button>
            <BadgeSuccessBox isSuccess={satStatus} successText="ENA" failText="DIS" />
          </HStack>
        </VStack>
        <VStack spacing={4}>
          <Flex justifyContent="left" w="100%">
            <Text fontSize="1.5em" fontWeight={600} borderBottom="solid 2px">
              GL840
            </Text>
          </Flex>
          <HStack spacing={4} w="100%">
            <Button width="150px" colorScheme="blue" onClick={() => changeRecordStatus('recordStart')}>
              REC START
            </Button>
            <Button width="150px" colorScheme="red" onClick={() => changeRecordStatus('recordStop')}>
              REC STOP
            </Button>
            <BadgeSuccessBox isSuccess={recordStatus} successText="REC" failText="STOP" />
          </HStack>
        </VStack>
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
