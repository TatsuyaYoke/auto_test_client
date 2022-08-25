import { useEffect, useState } from 'react'

import { Box, Button, HStack, useToast, VStack, StackDivider, Text, Flex } from '@chakra-ui/react'
import axios from 'axios'
import { useRecoilState, useRecoilValue } from 'recoil'
import { useLocalStorage } from 'usehooks-ts'

import { projectSettingState, projectState, settingState } from '@atoms/SettingAtom'
import { Error, ProjectSelect } from '@components'
import { stringToSelectOption } from '@functions'
import { BadgeSuccessBox } from '@parts'
import { connectSchema, getPidSchema } from '@types'

import type { SelectOptionType } from '@types'

const getPid = (
  apiUrl: string,
  waitSec: number
): Promise<{ success: true; data: number[] } | { success: false; error: string }> =>
  new Promise((resolve) => {
    setTimeout(async () => {
      const response = await axios.get(`${apiUrl}/getPid`).catch(() => ({
        data: {
          success: false,
          error: 'Not exist: API',
        },
      }))
      const schemaResult = getPidSchema.safeParse(response.data)
      if (!schemaResult.success) {
        resolve({
          success: false,
          error: 'Cannot parse response',
        })
        return
      }
      if (!schemaResult.data.success) {
        resolve({
          success: false,
          error: schemaResult.data.error,
        })
        return
      }
      resolve({
        success: true,
        data: schemaResult.data.data,
      })
    }, waitSec * 1000)
  })

const CONNECT_ENDPOINT = {
  powerSensor: 'obs/power_sensor',
  signalAnalyzer: 'obs/signal_analyzer',
  qdra: 'trans/qdra',
  qmr: 'trans/qmr',
} as const
type ConnectTargetType = keyof typeof CONNECT_ENDPOINT

export const ConnectBox = () => {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isWorkingApi, setIsWorkingApi] = useState(false)
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [pidList, setPidList] = useState<number[]>([])
  const [setting, setSetting] = useRecoilState(settingState)
  const [projectSetting, setProjectSetting] = useRecoilState(projectSettingState)
  const [projectIndex, setProjectIndex] = useLocalStorage('ProjectIndex', 0)
  const project = useRecoilValue(projectState)
  const [projectOptionList, setProjectOptionList] = useState<SelectOptionType[]>([])

  const [isConnecting, setIsConnecting] = useState({
    powerSensor: false,
    signalAnalyzer: false,
    qdra: false,
    qmr: false,
  })

  const initializeSetting = () => {
    const response = window.Main.getSettings()
    setSetting(response)
    if (response.success) {
      setProjectOptionList(() => response.data.project.map((e) => stringToSelectOption(e.pjName)))
      if (project) {
        setProjectIndex(() => {
          const foundIndex = response.data.project.findIndex((e) => e.pjName === project.value)
          const foundPjSetting = response.data.project[foundIndex]
          if (foundPjSetting) setProjectSetting(foundPjSetting)
          return foundIndex
        })
      } else {
        const foundPjSetting = response.data.project[projectIndex]
        if (foundPjSetting) setProjectSetting(foundPjSetting)
      }
    }
    setIsLoading(false)
  }
  const startApi = async () => {
    if (!setting?.success) return
    const isSuccess = window.Main.startApi(setting.data.common.apiPath)
    if (!isSuccess) {
      toast({
        title: 'Cannot start API',
        status: 'error',
        isClosable: true,
      })
      return
    }

    setIsLoadingApi(true)
    const apiUrl = setting.data.common.apiUrl
    const waitSec = setting.data.common.waitSecApiStartup
    const response = await getPid(apiUrl, waitSec)
    if (!response.success) {
      toast({
        title: response.error,
        status: 'error',
        isClosable: true,
      })
      setIsLoadingApi(false)
      return
    }
    const data = response.data
    if (data.length === 0) {
      toast({
        title: 'Not found PID for API',
        status: 'error',
        isClosable: true,
      })
      setIsLoadingApi(false)
      return
    }
    setPidList(data)
    setIsWorkingApi(true)
    setIsLoadingApi(false)
  }

  const stopApi = async () => {
    window.Main.stopApi(pidList)
    setPidList([])
    setIsWorkingApi(false)
  }

  const checkConnection = async (action: 'connect' | 'disconnect', target: ConnectTargetType) => {
    if (setting?.success) {
      const apiUrl = setting.data.common.apiUrl
      const response = await axios.get(`${apiUrl}/${CONNECT_ENDPOINT[target]}/${action}`).catch(() => ({
        data: {
          success: false,
          error: 'Not exist: API',
        },
      }))
      const schemaResult = connectSchema.safeParse(response.data)
      if (schemaResult.success) {
        setIsConnecting((prev) => {
          const newObject = { ...prev }
          newObject[target] = schemaResult.data.isOpen
          return newObject
        })
      }
    }
  }

  const checkAll = () => {
    const instList = Object.keys(CONNECT_ENDPOINT) as ConnectTargetType[]
    instList.forEach((inst) => {
      checkConnection('connect', inst)
    })
  }

  useEffect(() => {
    initializeSetting()
  }, [project])

  return (
    <Box h="100%">
      <Error
        isError={!setting?.success ?? false}
        successMessage="Setting Success"
        errorMessage={!setting?.success ? setting?.error : ''}
      />
      {setting?.success && (
        <VStack divider={<StackDivider />} spacing={4} align="stretch" mt="10px">
          <VStack spacing={4}>
            <Flex justifyContent="left" w="100%">
              <Text fontSize="1.5em" fontWeight={600} borderBottom="solid 2px">
                Common
              </Text>
            </Flex>
            <HStack spacing={4} w="100%">
              <Text w="100px" textAlign="center" fontSize="1.2em" fontWeight={600}>
                Project
              </Text>
              {!isLoading && (
                <ProjectSelect
                  options={projectOptionList}
                  defaultValue={projectSetting?.pjName ? stringToSelectOption(projectSetting.pjName) : undefined}
                  width="200px"
                />
              )}
            </HStack>
            <HStack spacing={4} w="100%">
              <Text w="100px" textAlign="center" fontSize="1.2em" fontWeight={600}>
                API
              </Text>
              <Button
                width="150px"
                colorScheme="teal"
                onClick={startApi}
                isDisabled={isWorkingApi}
                isLoading={isLoadingApi}
                loadingText="Starting"
              >
                START
              </Button>
              <Button width="150px" colorScheme="teal" onClick={stopApi} isDisabled={!isWorkingApi}>
                STOP
              </Button>
              <BadgeSuccessBox isSuccess={isWorkingApi} successText="OPEN" failText="CLOSE" />
            </HStack>
            <HStack spacing={4} w="100%">
              <Text w="100px" textAlign="center" fontSize="1.2em" fontWeight={600}>
                Connect
              </Text>
              <Button width="150px" colorScheme="teal" onClick={checkAll}>
                All
              </Button>
            </HStack>
          </VStack>
          <VStack spacing={4}>
            <Flex justifyContent="left" w="100%">
              <Text fontSize="1.5em" fontWeight={600} borderBottom="solid 2px">
                Observation
              </Text>
            </Flex>
            <HStack spacing={4} w="100%">
              <Text w="200px" textAlign="center" fontSize="1.2em" fontWeight={600}>
                POWER SENSOR
              </Text>
              <Button
                width="150px"
                colorScheme="teal"
                onClick={() => checkConnection('connect', 'powerSensor')}
                isDisabled={isConnecting.powerSensor}
              >
                CONNECT
              </Button>
              <Button
                width="150px"
                colorScheme="teal"
                onClick={() => checkConnection('disconnect', 'powerSensor')}
                isDisabled={!isConnecting.powerSensor}
              >
                DISCONNECT
              </Button>
              <BadgeSuccessBox isSuccess={isConnecting.powerSensor} successText="OPEN" failText="CLOSE" />
            </HStack>
            <HStack spacing={4} w="100%">
              <Text w="200px" textAlign="center" fontSize="1.2em" fontWeight={600}>
                SIGNAL ANALYZER
              </Text>
              <Button
                width="150px"
                colorScheme="teal"
                onClick={() => checkConnection('connect', 'signalAnalyzer')}
                isDisabled={isConnecting.signalAnalyzer}
              >
                CONNECT
              </Button>
              <Button
                width="150px"
                colorScheme="teal"
                onClick={() => checkConnection('disconnect', 'signalAnalyzer')}
                isDisabled={!isConnecting.signalAnalyzer}
              >
                DISCONNECT
              </Button>
              <BadgeSuccessBox isSuccess={isConnecting.signalAnalyzer} successText="OPEN" failText="CLOSE" />
            </HStack>
          </VStack>
          <VStack spacing={4}>
            <Flex justifyContent="left" w="100%">
              <Text fontSize="1.5em" fontWeight={600} borderBottom="solid 2px">
                Transfer
              </Text>
            </Flex>
            <HStack spacing={4} w="100%">
              <Text w="200px" textAlign="center" fontSize="1.2em" fontWeight={600}>
                qDRA
              </Text>
              <Button
                width="150px"
                colorScheme="teal"
                onClick={() => checkConnection('connect', 'qdra')}
                isDisabled={isConnecting.qdra}
              >
                CONNECT
              </Button>
              <BadgeSuccessBox isSuccess={isConnecting.qdra} successText="OPEN" failText="CLOSE" />
            </HStack>
            <HStack spacing={4} w="100%">
              <Text w="200px" textAlign="center" fontSize="1.2em" fontWeight={600}>
                qMR
              </Text>
              <Button
                width="150px"
                colorScheme="teal"
                onClick={() => checkConnection('connect', 'qmr')}
                isDisabled={isConnecting.qmr}
              >
                CONNECT
              </Button>
              <BadgeSuccessBox isSuccess={isConnecting.qmr} successText="OPEN" failText="CLOSE" />
            </HStack>
          </VStack>
        </VStack>
      )}
    </Box>
  )
}
