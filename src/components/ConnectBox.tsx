import { useEffect, useState } from 'react'

import { Box, Button, HStack, useToast, VStack, StackDivider, Text, Flex, Input } from '@chakra-ui/react'
import axios from 'axios'
import { useRecoilState, useRecoilValue } from 'recoil'
import { useLocalStorage } from 'usehooks-ts'

import { apiUrlState, projectSettingState, projectState, settingState } from '@atoms/SettingAtom'
import { Error, ProjectSelect } from '@components'
import { stringToSelectOption } from '@functions'
import { BadgeSuccessBox } from '@parts'
import { apiDataStringSchema, connectSchema, getPidSchema } from '@types'

import type { SelectOptionType, ConnectParamsType } from '@types'
import type { AxiosError } from 'axios'

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
  busJig: 'bus/busJig',
  gl840: 'bus/gl840',
  sas: 'bus/sas',
  powerSensor: 'obs/powerSensor',
  signalAnalyzer: 'obs/signalAnalyzer',
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
  const [apiUrl, setApiUrl] = useRecoilState(apiUrlState)
  const [projectSetting, setProjectSetting] = useRecoilState(projectSettingState)
  const [projectIndex, setProjectIndex] = useLocalStorage('ProjectIndex', 0)
  const project = useRecoilValue(projectState)
  const [projectOptionList, setProjectOptionList] = useState<SelectOptionType[]>([])

  const [isConnecting, setIsConnecting] = useState<{ [key in ConnectTargetType]: boolean }>({
    busJig: false,
    gl840: false,
    sas: false,
    powerSensor: false,
    signalAnalyzer: false,
    qdra: false,
    qmr: false,
  })
  const [accessPoint, setAccessPoint] = useLocalStorage<{ [key in ConnectTargetType]: string }>('AccessPoint', {
    busJig: '',
    gl840: '',
    sas: '',
    powerSensor: '',
    signalAnalyzer: '',
    qdra: '',
    qmr: '',
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

  const makeDir = async (apiUrlCopy: string, saveDirPath: string, projectValue: string) => {
    const responseObs = await axios
      .get(`${apiUrlCopy}/obs/common/makeDir`, {
        params: {
          pathStr: saveDirPath,
          project: projectValue,
        },
      })
      .catch(() => ({
        data: {
          success: false,
          error: 'Not exist: API',
        },
      }))
    const schemaResultObs = apiDataStringSchema.safeParse(responseObs.data)
    if (schemaResultObs.success) {
      if (!schemaResultObs.data.success) {
        toast({
          title: 'Cannot make dir for obs',
          status: 'error',
          isClosable: true,
        })
      }
    }

    const responseTrans = await axios
      .get(`${apiUrlCopy}/trans/common/makeDir`, {
        params: {
          pathStr: saveDirPath,
          project: projectValue,
        },
      })
      .catch(() => ({
        data: {
          success: false,
          error: 'Not exist: API',
        },
      }))
    const schemaResultTrans = apiDataStringSchema.safeParse(responseTrans.data)
    if (schemaResultTrans.success) {
      if (!schemaResultTrans.data.success) {
        toast({
          title: 'Cannot make dir for trans',
          status: 'error',
          isClosable: true,
        })
      }
    }
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
    const apiUrlCopy = setting.data.common.apiUrl
    setApiUrl(apiUrlCopy)
    const waitSec = setting.data.common.waitSecApiStartup
    const saveDirPath = setting.data.common.saveDirPath
    const projectValue = project?.value
    if (!apiUrlCopy) {
      toast({
        title: 'API URL not defined',
        status: 'error',
        isClosable: true,
      })
      setIsLoadingApi(false)
      return
    }

    const response = await getPid(apiUrlCopy, waitSec)
    if (!projectValue) {
      toast({
        title: 'Project not defined',
        status: 'error',
        isClosable: true,
      })
      setIsLoadingApi(false)
      return
    }
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
    makeDir(apiUrlCopy, saveDirPath, projectValue)
    setPidList(data)
    setIsWorkingApi(true)
    setIsLoadingApi(false)
  }

  const stopApi = async () => {
    window.Main.stopApi(pidList)
    setPidList([])
    setIsWorkingApi(false)
    setIsConnecting((prev) => {
      const newObject = { ...prev }
      const keys = Object.keys(newObject) as ConnectTargetType[]
      keys.forEach((key) => {
        newObject[key] = false
      })
      return newObject
    })
  }

  const checkConnection = async (action: 'connect' | 'disconnect', target: ConnectTargetType) => {
    if (apiUrl) {
      const params: ConnectParamsType = { accessPoint: accessPoint[target] }
      const response = await axios
        .get(`${apiUrl}/${CONNECT_ENDPOINT[target]}/${action}`, {
          params: params,
          timeout: 5000,
        })
        .catch((e: AxiosError) => {
          let errorMessage = `(${target}) Not exist: API`
          if (e.message.indexOf('timeout') !== -1) {
            errorMessage = `(${target}) Timeout error`
          }

          return {
            data: {
              success: false,
              error: errorMessage,
            },
          }
        })
      const schemaResult = connectSchema.safeParse(response.data)
      if (schemaResult.success) {
        const data = schemaResult.data
        if (data.success) {
          setIsConnecting((prev) => {
            const newObject = { ...prev }
            newObject[target] = data.isOpen
            return newObject
          })
        } else {
          toast({
            title: `(${target}) ${data.error}`,
            status: 'error',
            isClosable: true,
          })
        }
      } else {
        toast({
          title: `(${target}) Response data type is not correct`,
          status: 'error',
          isClosable: true,
        })
      }
      setIsLoadingApi(false)
    } else {
      toast({
        title: 'API not start',
        status: 'error',
        isClosable: true,
      })
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
                Bus
              </Text>
            </Flex>
            <HStack spacing={4} w="100%">
              <Text w="200px" textAlign="center" fontSize="1.2em" fontWeight={600}>
                BUS JIG
              </Text>
              <Button
                width="150px"
                colorScheme="teal"
                onClick={() => checkConnection('connect', 'busJig')}
                isDisabled={isConnecting.busJig}
              >
                CONNECT
              </Button>
              <Button
                width="150px"
                colorScheme="teal"
                onClick={() => checkConnection('disconnect', 'busJig')}
                isDisabled={!isConnecting.busJig}
              >
                DISCONNECT
              </Button>
              <BadgeSuccessBox isSuccess={isConnecting.busJig} successText="OPEN" failText="CLOSE" />
              <Input
                w="400px"
                placeholder="Serial Port"
                value={accessPoint.busJig}
                onChange={(event) =>
                  setAccessPoint((prev) => {
                    const newObject = { ...prev }
                    newObject.busJig = event.target.value
                    return newObject
                  })
                }
              />
            </HStack>
            <HStack spacing={4} w="100%">
              <Text w="200px" textAlign="center" fontSize="1.2em" fontWeight={600}>
                GL840
              </Text>
              <Button
                width="150px"
                colorScheme="teal"
                onClick={() => checkConnection('connect', 'gl840')}
                isDisabled={isConnecting.gl840}
              >
                CONNECT
              </Button>
              <Button
                width="150px"
                colorScheme="teal"
                onClick={() => checkConnection('disconnect', 'gl840')}
                isDisabled={!isConnecting.gl840}
              >
                DISCONNECT
              </Button>
              <BadgeSuccessBox isSuccess={isConnecting.gl840} successText="OPEN" failText="CLOSE" />
              <Input
                w="400px"
                placeholder="VISA Address"
                value={accessPoint.gl840}
                onChange={(event) =>
                  setAccessPoint((prev) => {
                    const newObject = { ...prev }
                    newObject.gl840 = event.target.value
                    return newObject
                  })
                }
              />
            </HStack>
            <HStack spacing={4} w="100%">
              <Text w="200px" textAlign="center" fontSize="1.2em" fontWeight={600}>
                SAS
              </Text>
              <Button
                width="150px"
                colorScheme="teal"
                onClick={() => checkConnection('connect', 'sas')}
                isDisabled={isConnecting.sas}
              >
                CONNECT
              </Button>
              <Button
                width="150px"
                colorScheme="teal"
                onClick={() => checkConnection('disconnect', 'sas')}
                isDisabled={!isConnecting.sas}
              >
                DISCONNECT
              </Button>
              <BadgeSuccessBox isSuccess={isConnecting.sas} successText="OPEN" failText="CLOSE" />
              <Input
                w="400px"
                placeholder="Serial Port"
                value={accessPoint.sas}
                onChange={(event) =>
                  setAccessPoint((prev) => {
                    const newObject = { ...prev }
                    newObject.sas = event.target.value
                    return newObject
                  })
                }
              />
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
              <Input
                w="400px"
                placeholder="VISA Address"
                value={accessPoint.powerSensor}
                onChange={(event) =>
                  setAccessPoint((prev) => {
                    const newObject = { ...prev }
                    newObject.powerSensor = event.target.value
                    return newObject
                  })
                }
              />
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
              <Input
                w="400px"
                placeholder="VISA Address"
                value={accessPoint.signalAnalyzer}
                onChange={(event) =>
                  setAccessPoint((prev) => {
                    const newObject = { ...prev }
                    newObject.signalAnalyzer = event.target.value
                    return newObject
                  })
                }
              />
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
              <Button width="150px" colorScheme="teal" onClick={() => checkConnection('connect', 'qdra')}>
                CHECK
              </Button>
              <BadgeSuccessBox isSuccess={isConnecting.qdra} successText="OPEN" failText="CLOSE" />
              <Input
                w="400px"
                placeholder="IP Address"
                value={accessPoint.qdra}
                onChange={(event) =>
                  setAccessPoint((prev) => {
                    const newObject = { ...prev }
                    newObject.qdra = event.target.value
                    return newObject
                  })
                }
              />
            </HStack>
            <HStack spacing={4} w="100%">
              <Text w="200px" textAlign="center" fontSize="1.2em" fontWeight={600}>
                qMR
              </Text>
              <Button width="150px" colorScheme="teal" onClick={() => checkConnection('connect', 'qmr')}>
                CHECK
              </Button>
              <BadgeSuccessBox isSuccess={isConnecting.qmr} successText="OPEN" failText="CLOSE" />
              <Input
                w="400px"
                placeholder="IP Address"
                value={accessPoint.qmr}
                onChange={(event) =>
                  setAccessPoint((prev) => {
                    const newObject = { ...prev }
                    newObject.qmr = event.target.value
                    return newObject
                  })
                }
              />
            </HStack>
          </VStack>
        </VStack>
      )}
    </Box>
  )
}
