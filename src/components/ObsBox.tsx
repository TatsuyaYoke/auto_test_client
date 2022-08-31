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

import { settingState, testNameState } from '@atoms/SettingAtom'
import { MyPlot } from '@parts'
import { startObsReturnSchema } from '@types'

import type { StartObsParamsType, GraphDataType, PowerSensorDataType } from '@types'

export const ObsBox = () => {
  const toast = useToast()
  const [isObsLoading, setIsObsLoading] = useState(false)
  const setting = useRecoilValue(settingState)
  const [testName, setTestName] = useRecoilState(testNameState)
  const [powerSensorData, setPowerSensorData] = useState<PowerSensorDataType | null>(null)
  const [graphData, setGraphData] = useState<GraphDataType | null>(null)
  const [lossStr, setLossStr] = useLocalStorage('LossStr', '0')
  const [obsDurationStr, setObsDurationStr] = useLocalStorage('ObsDurationStr', '10')
  const [warmUpDurationStr, setWarmUpDurationStr] = useLocalStorage('WarmUpDurationStr', '15')
  const [holdDurationStr, setHoldDurationStr] = useLocalStorage('HoldDurationStr', '10')
  const { width, height } = useWindowSize()

  const startObsTest = async () => {
    if (!setting?.success) return
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
    const apiUrl = setting.data.common.apiUrl
    const params: StartObsParamsType = {
      testName: testName,
      obsDuration: obsDuration,
      warmUpDuration: warmUpDuration,
      holdDuration: holdDuration,
    }
    const response = await axios
      .get(`${apiUrl}/obs/test/startObs`, {
        params: params,
      })
      .catch(() => ({
        data: {
          success: false,
          error: 'Not exist: API',
        },
      }))
    const schemaResult = startObsReturnSchema.safeParse(response.data)
    if (schemaResult.success) {
      const data = schemaResult.data
      if (data.success) {
        const loss = parseInt(lossStr, 10)
        setPowerSensorData({
          time: data.data.time,
          power: data.data.power,
        })
        setGraphData({
          name: 'power',
          x: data.data.time,
          y: data.data.power.map((e) => {
            if (Number.isNaN(loss)) {
              return e
            }
            return e + loss
          }),
        })
      }
    }
    setIsObsLoading(false)
  }

  const reload = () => {
    console.log('reload')
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
          {graphData && (
            <MyPlot
              graphData={[graphData]}
              graphWidth={width * 0.8}
              graphHeight={height * 0.8}
              mode="lines+markers"
              showlegend={false}
            />
          )}
        </Flex>
      </VStack>
    </Box>
  )
}
