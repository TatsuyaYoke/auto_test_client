import { useEffect, useState } from 'react'

import { Box, useToast, VStack, Button, Flex, Input, HStack, Textarea, Text, Checkbox } from '@chakra-ui/react'
import axios from 'axios'
import { useRecoilState, useRecoilValue } from 'recoil'
import { useWindowSize } from 'usehooks-ts'

import { projectSettingState, projectState, settingState, testNameState } from '@atoms/SettingAtom'

export const TransBox = () => {
  const toast = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const setting = useRecoilValue(settingState)
  const projectSetting = useRecoilValue(projectSettingState)
  const project = useRecoilValue(projectState)
  const [testName, setTestName] = useRecoilState(testNameState)
  const { width } = useWindowSize()

  const record = () => {
    console.log('Record')
  }
  const processing = () => {
    console.log('Processing')
  }

  const stdout = `aa
  aa
  aa
  bb

  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  cc
  `

  return (
    <Box h="100%">
      <VStack spacing={4}>
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
          <Text>Test name</Text>
          <Input
            w="300px"
            placeholder="Test name"
            value={testName}
            onChange={(event) => setTestName(event.target.value)}
          />
          <Checkbox>delete files in qDRA</Checkbox>
        </HStack>
        <Flex justifyContent="space-around" w="100%">
          <Box w={width * 0.45}>
            <Text mb="10px">Stdout</Text>
            <Textarea value={stdout} readOnly h="calc(100vh - 300px)" />
          </Box>
          <Box w={width * 0.45}>
            <Text mb="10px">Stderr</Text>
            <Textarea value={stdout} readOnly h="calc(100vh - 300px)" />
          </Box>
        </Flex>
      </VStack>
    </Box>
  )
}
