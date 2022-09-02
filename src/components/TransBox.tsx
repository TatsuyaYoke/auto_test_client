import { useState } from 'react'

import {
  Box,
  useToast,
  VStack,
  Button,
  Flex,
  Input,
  HStack,
  Textarea,
  Text,
  Checkbox,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react'
import axios from 'axios'
import { useRecoilState, useRecoilValue } from 'recoil'
import { useLocalStorage, useWindowSize } from 'usehooks-ts'
import { v4 as uuid4 } from 'uuid'

import { apiUrlState, testNameState } from '@atoms/SettingAtom'
import { BadgeSuccessBox } from '@parts'
import { apiNoDataSchema } from '@types'

import type { TransRecordStartParamsType } from '@types'

export const TransBox = () => {
  const toast = useToast()
  const apiUrl = useRecoilValue(apiUrlState)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [testName, setTestName] = useRecoilState(testNameState)
  const [sessionName, setSessionName] = useState('')
  const [recordDurationStr, setRecordDurationStr] = useLocalStorage('RecordDurationStr', '300')
  const [qmrStatus, setQmrStatus] = useState<boolean | null>(null)
  const { width } = useWindowSize()

  const record = async () => {
    if (!apiUrl) {
      toast({
        title: 'API not start',
        status: 'error',
        isClosable: true,
      })
      return
    }

    const duration = parseInt(recordDurationStr, 10)
    if (Number.isNaN(duration)) {
      toast({
        title: 'Record duration setting is not correct',
        status: 'error',
        isClosable: true,
      })
      return
    }

    if (qmrStatus === null) {
      toast({
        title: 'qMR not set',
        status: 'error',
        isClosable: true,
      })
      return
    }

    const sessionNameCopy = `${testName}-${uuid4()}`
    setSessionName(sessionNameCopy)
    const params: TransRecordStartParamsType = { sessionName: sessionNameCopy, duration: duration }
    const response = await axios
      .get(`${apiUrl}/trans/qdra/recordStart`, {
        params: params,
      })
      .catch(() => ({
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
    const data = schemaResult.data
    if (data.success) {
      setIsRecording(true)
      setTimeout(() => {
        setIsRecording(false)
      }, duration * 1000)
    } else {
      toast({
        title: data.error,
        status: 'error',
        isClosable: true,
      })
    }
  }

  const processing = async () => {
    console.log('Processing')
  }

  const changeModcod = async (modeEndPoint: '8psk_2_3 ' | '8psk_5_6') => {
    if (!apiUrl) {
      toast({
        title: 'API not start',
        status: 'error',
        isClosable: true,
      })
      return
    }

    const response = await axios.get(`${apiUrl}/trans/qmr/${modeEndPoint}`).catch(() => ({
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
        title: 'qMR mode change failed',
        status: 'error',
        isClosable: true,
      })
    } else if (modeEndPoint === '8psk_2_3 ') {
      setQmrStatus(true)
    } else {
      setQmrStatus(false)
    }
  }

  return (
    <Box h="100%">
      <VStack spacing={4}>
        <HStack w="100%" spacing={4}>
          <Text>Test name</Text>
          <Input
            w="300px"
            placeholder="Test name"
            value={testName}
            onChange={(event) => setTestName(event.target.value)}
          />
          <Text>Record duration</Text>
          <NumberInput w="150px" value={recordDurationStr} onChange={setRecordDurationStr}>
            <NumberInputField placeholder="duration [sec]" />
          </NumberInput>
        </HStack>
        <HStack w="100%" spacing={4}>
          <Button width="150px" colorScheme="teal" onClick={record} isLoading={isRecording} loadingText="Recording">
            RECORD
          </Button>
          <Button
            width="150px"
            colorScheme="teal"
            onClick={processing}
            isLoading={isProcessing}
            loadingText="Processing"
          >
            PROCESSING
          </Button>
          <Button width="150px" colorScheme="red" onClick={processing}>
            CANCEL
          </Button>
          <Checkbox>delete files in qDRA</Checkbox>
        </HStack>
        <HStack w="100%" spacing={4}>
          <Button width="150px" colorScheme="teal" onClick={() => changeModcod('8psk_2_3 ')}>
            8PSK 2/3
          </Button>
          <Button width="150px" colorScheme="teal" onClick={() => changeModcod('8psk_5_6')}>
            8PSK 5/6
          </Button>

          <BadgeSuccessBox isSuccess={qmrStatus} width="120px" successText="2/3" failText="5/6" failColor="green" />
        </HStack>
        <Flex justifyContent="space-around" w="100%">
          <Box w={width * 0.45}>
            <Text mb="10px">Stdout</Text>
            <Textarea value="aaa" readOnly h="calc(100vh - 400px)" />
          </Box>
          <Box w={width * 0.45}>
            <Text mb="10px">Stderr</Text>
            <Textarea value="aaa" readOnly h="calc(100vh - 400px)" />
          </Box>
        </Flex>
      </VStack>
    </Box>
  )
}
