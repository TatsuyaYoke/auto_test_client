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
import { apiNoDataSchema, processingReturnSchema } from '@types'

import type { TransRecordStartParamsType, TransProcessingParamsType, TransGetDataParamsType } from '@types'
import type { AxiosError } from 'axios'

export const TransBox = () => {
  const toast = useToast()
  const apiUrl = useRecoilValue(apiUrlState)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [testName, setTestName] = useRecoilState(testNameState)
  const [sessionName, setSessionName] = useState('')
  const [recordDurationStr, setRecordDurationStr] = useLocalStorage('RecordDurationStr', '300')
  const [qmrStatus, setQmrStatus] = useState<boolean | null>(null)
  const [processingDataPath, setProcessingDataPath] = useLocalStorage('ProcessingDataPath', '')
  const [processingScriptPath, setProcessingScriptPath] = useLocalStorage('ProcessingScriptPath', '')
  const [stdout, setStdout] = useState('')
  const [stderr, setStderr] = useState('')
  const [deleteFlag, setDeleteFlag] = useLocalStorage('DeleteFlag', false)
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

  const cancel = async () => {
    if (!apiUrl) {
      toast({
        title: 'API not start',
        status: 'error',
        isClosable: true,
      })
      return
    }

    const response = await axios.get(`${apiUrl}/trans/qdra/recordStart`).catch(() => ({
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
      setIsRecording(false)
    } else {
      toast({
        title: data.error,
        status: 'error',
        isClosable: true,
      })
    }
  }

  const processing = async () => {
    if (!apiUrl) {
      toast({
        title: 'API not start',
        status: 'error',
        isClosable: true,
      })
      return
    }

    if (processingDataPath.length === 0) {
      toast({
        title: 'Processing data path setting is not correct',
        status: 'error',
        isClosable: true,
      })
      return
    }
    if (!processingScriptPath.endsWith('.sh')) {
      toast({
        title: 'Processing script path setting is not correct',
        status: 'error',
        isClosable: true,
      })
      return
    }

    const params: TransProcessingParamsType = {
      sessionName: sessionName,
      pathStr: processingDataPath,
      pathScriptStr: processingScriptPath,
    }
    setIsProcessing(true)
    const response = await axios
      .get(`${apiUrl}/trans/test/processing`, {
        params: params,
        timeout: 300 * 1000,
      })
      .catch((e: AxiosError) => {
        let errorMessage = 'Not exist: API'
        if (e.message.indexOf('timeout') !== -1) {
          errorMessage = 'Timeout error'
        }

        return {
          data: {
            success: false,
            error: errorMessage,
          },
        }
      })

    const schemaResult = processingReturnSchema.safeParse(response.data)
    setIsProcessing(false)
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
      setStdout(data.stdout)
      setStderr(data.stderr)
    } else {
      toast({
        title: data.error,
        status: 'error',
        isClosable: true,
      })
    }
  }

  const getData = async () => {
    if (!apiUrl) {
      toast({
        title: 'API not start',
        status: 'error',
        isClosable: true,
      })
      return
    }

    if (processingDataPath.length === 0) {
      toast({
        title: 'Processing data path setting is not correct',
        status: 'error',
        isClosable: true,
      })
      return
    }

    const params: TransGetDataParamsType = {
      sessionName: sessionName,
      pathStr: processingDataPath,
      deleteFlag: deleteFlag,
    }
    const response = await axios
      .get(`${apiUrl}/trans/test/getProcessingData`, {
        params: params,
        timeout: 300 * 1000,
      })
      .catch((e: AxiosError) => {
        let errorMessage = 'Not exist: API'
        if (e.message.indexOf('timeout') !== -1) {
          errorMessage = 'Timeout error'
        }

        return {
          data: {
            success: false,
            error: errorMessage,
          },
        }
      })

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
      toast({
        title: 'Processing data saved successfully',
        status: 'success',
        isClosable: true,
      })
    } else {
      toast({
        title: data.error,
        status: 'error',
        isClosable: true,
      })
    }
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
        <HStack w="100%" spacing={2}>
          <Text w="180px">Processing Data path</Text>
          <Text>~/</Text>
          <Input
            w="500px"
            placeholder="path"
            value={processingDataPath}
            onChange={(event) => setProcessingDataPath(event.target.value)}
          />
        </HStack>
        <HStack w="100%" spacing={2}>
          <Text w="180px">Processing Script path</Text>
          <Text>~/</Text>
          <Input
            w="500px"
            placeholder="path"
            value={processingScriptPath}
            onChange={(event) => setProcessingScriptPath(event.target.value)}
          />
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
          <Button width="150px" colorScheme="teal" onClick={getData}>
            DATA
          </Button>
          <Button width="150px" colorScheme="red" onClick={cancel}>
            CANCEL
          </Button>
          <Checkbox isChecked={deleteFlag} onChange={(event) => setDeleteFlag(event.target.checked)}>
            delete files in qDRA
          </Checkbox>
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
            <Textarea value={stdout} readOnly h="calc(100vh - 500px)" />
          </Box>
          <Box w={width * 0.45}>
            <Text mb="10px">Stderr</Text>
            <Textarea value={stderr} readOnly h="calc(100vh - 500px)" />
          </Box>
        </Flex>
      </VStack>
    </Box>
  )
}
