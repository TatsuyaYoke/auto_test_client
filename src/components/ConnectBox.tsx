import { useEffect, useState } from 'react'

import { Box, Button, HStack, useToast, VStack, StackDivider, Text } from '@chakra-ui/react'
import axios from 'axios'
import { useRecoilState } from 'recoil'

import { settingState } from '@atoms/SettingAtom'
import { Error } from '@components'
import { BadgeSuccessBox } from '@parts'
import { getPidSchema } from '@types'

const BASE_URL = 'http://127.0.0.1:8001'
const WAIT_SEC_API_STARTUP = 10

const getPid = (): Promise<{ success: true; data: number[] } | { success: false; error: string }> =>
  new Promise((resolve) => {
    setTimeout(async () => {
      const response = await axios.get(`${BASE_URL}/getPid`).catch(() => ({
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
    }, WAIT_SEC_API_STARTUP * 1000)
  })

export const ConnectBox = () => {
  const toast = useToast()
  const [isWorkingApi, setIsWorkingApi] = useState(false)
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [pidList, setPidList] = useState<number[]>([])
  const [setting, setSetting] = useRecoilState(settingState)
  const initializeSetting = () => {
    const response = window.Main.getSettings()
    setSetting(response)
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
    const response = await getPid()
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

  useEffect(() => {
    initializeSetting()
  }, [])

  return (
    <Box h="100%">
      <Error
        isError={!setting?.success ?? false}
        successMessage="Setting Success"
        errorMessage={!setting?.success ? setting?.error : ''}
      />
      {setting?.success && (
        <VStack divider={<StackDivider />} spacing={4} align="stretch" mt="10px">
          <Box>
            <Text fontSize="1.5em" fontWeight={600} mb="10px">
              Common
            </Text>
            <HStack spacing="20px">
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
          </Box>
          <Box>
            <Text fontSize="1.5em" fontWeight={600} mb="10px">
              Observation
            </Text>
          </Box>
        </VStack>
      )}
    </Box>
  )
}
