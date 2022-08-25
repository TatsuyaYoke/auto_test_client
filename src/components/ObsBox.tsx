import { useEffect, useState } from 'react'

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

import { projectSettingState, projectState, settingState, testNameState } from '@atoms/SettingAtom'
import { MyPlot } from '@parts'

export const ObsBox = () => {
  const toast = useToast()
  const [isObsLoading, setIsObsLoading] = useState(false)
  const setting = useRecoilValue(settingState)
  const projectSetting = useRecoilValue(projectSettingState)
  const project = useRecoilValue(projectState)
  const [testName, setTestName] = useRecoilState(testNameState)
  const [lossStr, setLossStr] = useLocalStorage('LossStr', '')
  const { width, height } = useWindowSize()

  const startObsTest = () => {
    console.log('Obs')
  }

  return (
    <Box h="100%">
      <VStack spacing={4}>
        <HStack w="100%" spacing={4}>
          <Button
            width="150px"
            colorScheme="teal"
            onClick={startObsTest}
            isLoading={isObsLoading}
            loadingText="Getting"
          >
            START
          </Button>
          <Text>Test name</Text>
          <Input
            w="300px"
            placeholder="Test name"
            value={testName}
            onChange={(event) => setTestName(event.target.value)}
          />

          <Text>Loss</Text>
          <NumberInput w="150px" value={lossStr} onChange={setLossStr}>
            <NumberInputField placeholder="Loss [dB]" />
          </NumberInput>

          <Button width="150px" colorScheme="teal">
            RELOAD
          </Button>
          <Button width="150px" colorScheme="teal">
            SAVE
          </Button>
        </HStack>
        <Flex justifyContent="center" w="100%">
          <MyPlot
            graphData={[
              {
                name: 'text',
                x: [1, 2, 3],
                y: [1, 2, 3],
              },
            ]}
            graphWidth={width * 0.8}
            graphHeight={height * 0.8}
            mode="lines+markers"
            showlegend={false}
          />
        </Flex>
      </VStack>
    </Box>
  )
}
