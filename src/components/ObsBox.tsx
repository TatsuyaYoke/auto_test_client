import { useState } from 'react'

import {
  Box,
  useToast,
  VStack,
  Button,
  Flex,
  Input,
  NumberInputField,
  NumberInput,
  HStack,
  Text,
} from '@chakra-ui/react'
import axios from 'axios'
import { useRecoilState, useRecoilValue } from 'recoil'
import { useLocalStorage, useWindowSize } from 'usehooks-ts'
import { v4 as uuid4 } from 'uuid'

import { apiUrlState, testNameState } from '@atoms/SettingAtom'
import { MyPlot } from '@parts'
import { apiDataNumberSchema, apiNoDataSchema, obsPowerDataReturnSchema } from '@types'

import type { StartObsParamsType, GraphDataType, PowerSensorDataType } from '@types'

export const ObsBox = () => {
  const toast = useToast()
  const [isObsLoading, setIsObsLoading] = useState(false)
  const [powerLog, setPowerLog] = useState(0)
  const apiUrl = useRecoilValue(apiUrlState)
  const [testName, setTestName] = useRecoilState(testNameState)
  const [powerSensorData, setPowerSensorData] = useState<PowerSensorDataType | null>(null)
  const [graphData, setGraphData] = useState<GraphDataType>({
    name: 'power',
    x: [],
    y: [],
  })
  const [lossStr, setLossStr] = useLocalStorage('LossStr', '0')
  const [obsDurationStr, setObsDurationStr] = useLocalStorage('ObsDurationStr', '10')
  const [warmUpDurationStr, setWarmUpDurationStr] = useLocalStorage('WarmUpDurationStr', '15')
  const [holdDurationStr, setHoldDurationStr] = useLocalStorage('HoldDurationStr', '10')
  const { width, height } = useWindowSize()

  const startObsTest = async () => {
    if (!apiUrl) {
      toast({
        title: 'API not start',
        status: 'error',
        isClosable: true,
      })
      return
    }

    if (testName.length === 0) {
      toast({
        title: 'Please input test name',
        status: 'error',
        isClosable: true,
      })
      return
    }

    const obsDuration = parseInt(obsDurationStr, 10)
    const warmUpDuration = parseInt(warmUpDurationStr, 10)
    const holdDuration = parseInt(holdDurationStr, 10)
    if (Number.isNaN(obsDuration)) {
      toast({
        title: 'Obs duration setting is not correct',
        status: 'error',
        isClosable: true,
      })
      return
    }
    if (Number.isNaN(warmUpDuration)) {
      toast({
        title: 'Warm-up duration setting is not correct',
        status: 'error',
        isClosable: true,
      })
      return
    }
    if (Number.isNaN(holdDuration)) {
      toast({
        title: 'Hold duration setting is not correct',
        status: 'error',
        isClosable: true,
      })
      return
    }

    setIsObsLoading(true)
    const params: StartObsParamsType = {
      testName: `${testName}-${uuid4()}`,
      obsDuration: obsDuration,
      warmUpDuration: warmUpDuration,
      holdDuration: holdDuration,
    }
    const duration = (obsDuration + warmUpDuration + 5) * 1000
    const responseStartObs = await axios
      .get(`${apiUrl}/obs/test/startObs`, {
        params: params,
      })
      .catch(() => ({
        data: {
          success: false,
          error: 'Not exist: API',
        },
      }))

    const schemaResultStartObs = apiNoDataSchema.safeParse(responseStartObs.data)
    if (!schemaResultStartObs.success) {
      toast({
        title: 'Response data type is not correct',
        status: 'error',
        isClosable: true,
      })
      setIsObsLoading(false)
      return
    }

    const data = schemaResultStartObs.data
    if (!data.success) {
      toast({
        title: data.error,
        status: 'error',
        isClosable: true,
      })
      setIsObsLoading(false)
      return
    }

    const loss = parseInt(lossStr, 10)
    const timerId = setInterval(async () => {
      const responsePowerDataLog = await axios.get(`${apiUrl}/obs/powerSensor/getDataLog`).catch(() => ({
        data: {
          success: false,
          error: 'Not exist: API',
        },
      }))

      const schemaResultPowerDataLog = apiDataNumberSchema.safeParse(responsePowerDataLog.data)
      if (!schemaResultPowerDataLog.success) {
        toast({
          title: 'Response data type is not correct',
          status: 'error',
          isClosable: true,
        })
      } else {
        const powerLogData = schemaResultPowerDataLog.data
        if (!powerLogData.success) {
          toast({
            title: powerLogData.error,
            status: 'error',
            isClosable: true,
          })
        } else {
          const powerLogLoss = Number.isNaN(loss) ? powerLogData.data : powerLogData.data + loss
          setPowerLog(powerLogLoss)
        }
      }
    }, 1000)

    await new Promise((resolve) => {
      setTimeout(() => {
        setIsObsLoading(false)
        clearInterval(timerId)
        resolve(true)
      }, duration)
    })

    const responseObsPowerData = await axios.get(`${apiUrl}/obs/test/getObsPowerSensorData`).catch(() => ({
      data: {
        success: false,
        error: 'Not exist: API',
      },
    }))

    const schemaResultObsPowerData = obsPowerDataReturnSchema.safeParse(responseObsPowerData.data)
    if (!schemaResultObsPowerData.success) {
      toast({
        title: 'Response data type is not correct',
        status: 'error',
        isClosable: true,
      })
      return
    }

    const obsPowerData = schemaResultObsPowerData.data
    if (!obsPowerData.success) {
      toast({
        title: obsPowerData.error,
        status: 'error',
        isClosable: true,
      })
      return
    }

    setPowerSensorData({
      time: obsPowerData.data.time,
      power: obsPowerData.data.power,
    })

    setGraphData({
      name: 'power',
      x: obsPowerData.data.time,
      y: obsPowerData.data.power.map((e) => {
        if (Number.isNaN(loss)) {
          return e
        }
        return e + loss
      }),
    })
    setIsObsLoading(false)
  }

  const reload = () => {
    if (powerSensorData) {
      const loss = parseInt(lossStr, 10)
      setGraphData({
        name: 'power',
        x: powerSensorData.time,
        y: powerSensorData.power.map((e) => {
          if (Number.isNaN(loss)) {
            return e
          }
          return e + loss
        }),
      })
    }
  }

  const save = async () => {
    if (graphData) {
      const response = await window.Main.saveCsv({
        time: graphData?.x,
        power: graphData?.y,
      })
      toast({
        title: response.success ? `success: ${response.path}` : `error: ${response.error}`,
        status: response.success ? 'success' : 'error',
        isClosable: true,
      })
    } else {
      toast({
        title: 'error: graph data not found',
        status: 'error',
        isClosable: true,
      })
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

          <Text>Obs duration</Text>
          <NumberInput w="150px" value={obsDurationStr} onChange={setObsDurationStr}>
            <NumberInputField placeholder="duration [sec]" />
          </NumberInput>
          <Text>Warm-up duration</Text>
          <NumberInput w="150px" value={warmUpDurationStr} onChange={setWarmUpDurationStr}>
            <NumberInputField placeholder="duration [sec]" />
          </NumberInput>
          <Text>Hold duration</Text>
          <NumberInput w="150px" value={holdDurationStr} onChange={setHoldDurationStr}>
            <NumberInputField placeholder="duration [sec]" />
          </NumberInput>

          <Button
            width="150px"
            colorScheme="teal"
            onClick={startObsTest}
            isLoading={isObsLoading}
            loadingText="Getting"
          >
            START
          </Button>
          <Text fontSize="24px" color="red">
            Power {powerLog.toPrecision(3)} dB
          </Text>
        </HStack>
        <HStack w="100%" spacing={4}>
          <Text>Loss</Text>
          <NumberInput w="150px" value={lossStr} onChange={setLossStr}>
            <NumberInputField placeholder="Loss [dB]" />
          </NumberInput>
          <Button width="150px" colorScheme="teal" onClick={reload}>
            RELOAD
          </Button>
          <Button width="150px" colorScheme="teal" onClick={save}>
            SAVE
          </Button>
        </HStack>
        <Flex justifyContent="center" w="100%">
          <MyPlot
            graphData={[graphData]}
            graphWidth={width * 0.8}
            graphHeight={height * 0.75}
            mode="lines+markers"
            showlegend={false}
          />
        </Flex>
      </VStack>
    </Box>
  )
}
