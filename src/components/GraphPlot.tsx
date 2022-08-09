import { useEffect, useRef, useState } from 'react'

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spacer,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useRecoilValue } from 'recoil'
import { useLocalStorage, useReadLocalStorage, useWindowSize } from 'usehooks-ts'

import { testCaseListState, settingState, dateSettingState } from '@atoms/PlotSettingAtom'
import { Error } from '@components'
import { checkDivSetting, stringToSelectOption } from '@functions'
import { Graph, MySelect } from '@parts'
import { dateGraphSchema, nonNullable, signList } from '@types'

import type {
  RequestDataType,
  RequestTlmType,
  GraphDataArrayType,
  AxisType,
  ResponseDataType,
  SelectOptionType,
  TlmListType,
  TlmObject,
  TlmObjectArray,
} from '@types'
import type { SingleValue } from 'chakra-react-select'

export const GraphPlot = () => {
  const isStored = useReadLocalStorage<boolean>('IsStored') ?? false
  const isChosen = useReadLocalStorage<boolean>('IsChosen') ?? false
  const isOrbit = useReadLocalStorage<boolean>('IsOrbit') ?? false
  const testCaseList = useRecoilValue(testCaseListState)
  const tlmList = useReadLocalStorage<TlmListType[]>('TlmList') ?? [{ id: 1, tlm: [] }]
  const setting = useRecoilValue(settingState)
  const dateSetting = useRecoilValue(dateSettingState)

  const [isWarning, setIsWarning] = useState(false)
  const [warningMessages, setWarningMessages] = useState<string[]>([])
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [responseTlmData, setResponseTlmData] = useState<ResponseDataType | null>(null)
  const [graphData, setGraphData] = useState<GraphDataArrayType>([])

  const [filteredGraphData, setFilteredGraphData] = useState<GraphDataArrayType>([])
  const [filterTlmName, setFilterTlmName] = useState<SingleValue<SelectOptionType>>()
  const [filterSign, setFilterSign] = useState<SingleValue<SelectOptionType>>()
  const [filterThresholdValue, setFilterThresholdValue] = useState<number>()

  const toast = useToast()
  const { isOpen: isOpenSet, onOpen: onOpenSet, onClose: onCloseSet } = useDisclosure()
  const { isOpen: isOpenFilter, onOpen: onOpenFilter, onClose: onCloseFilter } = useDisclosure()
  const initialRefSet = useRef(null)
  const [xaxisMax, setXaxisMax] = useState<string | undefined>(undefined)
  const [xaxisMin, setXaxisMin] = useState<string | undefined>(undefined)
  const [xaxisDiv, setXaxisDiv] = useState<number | undefined>(undefined)
  const [activatePlotSetting, setActivatePlotSetting] = useState<boolean>(false)
  const [axis, setAxis] = useState<AxisType>({
    x: {
      max: undefined,
      min: undefined,
      div: undefined,
    },
    y: {
      max: undefined,
      min: undefined,
      div: undefined,
    },
  })

  const [graphConfig, setGraphConfig] = useLocalStorage('GraphConfig', {
    columnNumber: 3,
    graphWidth: 680,
    graphHeight: 500,
    markerSize: 3,
  })
  const [columnNumber, setColumnNumber] = useState(graphConfig.columnNumber)
  const [graphHeight, setGraphHeight] = useState(graphConfig.graphHeight)
  const [markerSize, setMarkerSize] = useState(graphConfig.markerSize)

  const { width } = useWindowSize()

  const setPlot = async (
    response: ResponseDataType,
    filteredTlmList: { plotId: number; tlm: SelectOptionType[] }[]
  ) => {
    const timeList = response.tlm.time
    const sortedTimeList = [...timeList].sort()
    setAxis((prev) => {
      const newAxis = { ...prev }
      newAxis.x.max = sortedTimeList[sortedTimeList.length - 1]
      newAxis.x.min = sortedTimeList[0]
      setXaxisMin(newAxis.x.min)
      setXaxisMax(newAxis.x.max)
      return newAxis
    })

    setResponseTlmData(response)
    setGraphData(() => {
      const data = filteredTlmList.map((plotObject) => {
        const tlmListEachPlotId = plotObject.tlm.map((e) => e.value)
        return {
          plotId: plotObject.plotId,
          tlm: tlmListEachPlotId
            .map((tlmName) => {
              const xData = timeList
              const yData = response.tlm.data[tlmName]
              if (xData && yData)
                return {
                  tlmName: tlmName,
                  x: xData,
                  y: yData,
                }
              return null
            })
            .filter(nonNullable),
        }
      })
      setFilteredGraphData(data)
      return data
    })
  }

  const initializeWarningError = () => {
    setIsWarning(false)
    setIsError(false)
    setWarningMessages(() => [])
  }

  const plot = async (isReload = false) => {
    initializeWarningError()
    if (setting) {
      const { pjName, tlmId: tlmIdList, testCase, ...restSetting } = setting
      if (!tlmIdList) return

      if (isOrbit && !restSetting.orbitDatasetPath && !isReload) {
        setIsError(true)
        setErrorMessage(`Orbit telemetry for ${pjName} not found`)
        return
      }
      if (!isOrbit && !testCase && !isReload) {
        setIsError(true)
        setErrorMessage(`Ground test telemetry for ${pjName} not found`)
        return
      }

      // delete test cases if no test cases in selected project
      const filteredTestCaseList = testCaseList.filter((element) => {
        if (testCase?.indexOf(element.value) === -1 && !isReload) {
          setIsWarning(true)
          setWarningMessages((prev) => [...prev, `Test case: ${element.value} deleted because not exist`])
          return false
        }
        return true
      })

      if (isChosen && filteredTestCaseList.length === 0 && !isReload) {
        setErrorMessage('Test case not selected, although Choose test cases is on')
        setIsError(true)
        return
      }

      // delete telemetries if no telemetries in selected project
      const projectTlmList = Object.keys(tlmIdList)
      const filteredTlmList = tlmList
        .map((element) => {
          const filteredList = element.tlm.filter((tlm) => {
            if (projectTlmList.indexOf(tlm.value) === -1 && !isReload) {
              setIsWarning(true)
              setWarningMessages((prev) => [...prev, `TLM list: ${tlm.value} deleted because not exist`])
              return false
            }
            return true
          })
          return {
            plotId: element.id,
            tlm: filteredList,
          }
        })
        .filter((e) => e.tlm.length > 0)

      const requestTlmList: RequestTlmType[] = []
      filteredTlmList.forEach((filteredElement) => {
        filteredElement.tlm.forEach((tlm) => {
          const tlmId = tlmIdList[tlm.value]
          const selectedTlmIdList = requestTlmList.map((requestElement) => requestElement.tlmId)
          if (tlmId !== undefined && selectedTlmIdList.indexOf(tlmId) === -1) {
            requestTlmList.push({
              tlmId: tlmId,
              tlmList: [tlm.value],
            })
          } else {
            const foundIndex = requestTlmList.findIndex((requestElement) => requestElement.tlmId === tlmId)
            const foundTlmElement = requestTlmList[foundIndex]
            if (foundTlmElement && foundTlmElement.tlmList.indexOf(tlm.value) === -1)
              foundTlmElement.tlmList.push(tlm.value)
          }
        })
      })

      if (requestTlmList.length === 0 && !isReload) {
        setErrorMessage('Telemetry not selected')
        setIsError(true)
        return
      }

      setIsLoading(true)
      const request: RequestDataType = {
        pjName: pjName,
        isOrbit: isOrbit,
        isStored: isStored,
        isChosen: isChosen,
        dateSetting: dateSetting,
        testCase: filteredTestCaseList,
        tlm: requestTlmList,
        ...restSetting,
      }

      let response: ResponseDataType | null
      if (isReload) {
        response = responseTlmData
      } else {
        response = await window.Main.getData(request)
      }
      if (response && response.success) {
        await setPlot(response, filteredTlmList)
      } else if (response) {
        setIsWarning(true)
        setGraphData([])
        const errorMessages = response.errorMessages
        setWarningMessages((prev) => [...prev, ...errorMessages])
      }
      setIsLoading(false)
    }
  }

  const activateSetting = () => {
    const xaxisMaxResult = dateGraphSchema.safeParse(xaxisMax)
    const xaxisMinResult = dateGraphSchema.safeParse(xaxisMin)
    if (!(xaxisMaxResult.success && xaxisMinResult.success)) {
      toast({
        title: 'X-axis Format (yyyy-MM-dd HH:mm:ss) error',
        status: 'error',
        isClosable: true,
      })
      return
    }

    const xaxisMaxNumber = new Date(xaxisMaxResult.data)
    const xaxisMinNumber = new Date(xaxisMinResult.data)
    const checkXaxisDivResult = checkDivSetting(xaxisMaxNumber, xaxisMinNumber, xaxisDiv)
    if (!checkXaxisDivResult.success) {
      toast({
        title: `X-axis ${checkXaxisDivResult.error}`,
        status: 'error',
        isClosable: true,
      })
      return
    }

    setAxis((prev) => {
      const newAxis = { ...prev }
      newAxis.x.max = xaxisMax
      newAxis.x.min = xaxisMin
      newAxis.x.div = xaxisDiv
      return newAxis
    })
    setGraphConfig((prev) => {
      const newConfig = { ...prev }
      newConfig.columnNumber = columnNumber
      newConfig.graphHeight = graphHeight
      newConfig.markerSize = markerSize
      return newConfig
    })
    setActivatePlotSetting((prev) => !prev)
    onCloseSet()
  }

  const activateFilter = () => {
    const timeList = graphData[0]?.tlm[0]?.x
    const tlmObjectList = graphData.map((e) => e.tlm.map((tlm) => ({ tlmName: tlm.tlmName, data: tlm.y }))).flat()
    const tlmNameList = tlmObjectList.map((e) => e.tlmName)
    const tlmArrayObject: TlmObject[] = []
    setFilteredGraphData(graphData)

    if (!filterSign) {
      toast({
        title: 'error: Sign not selected',
        status: 'error',
        isClosable: true,
      })
      return
    }

    if (!filterTlmName) {
      toast({
        title: 'error: TLM Name not selected',
        status: 'error',
        isClosable: true,
      })
      return
    }

    if (tlmNameList.indexOf(filterTlmName.value) === -1) {
      toast({
        title: 'error: TLM Name not correct',
        status: 'error',
        isClosable: true,
      })
      return
    }

    if (!filterThresholdValue) {
      toast({
        title: 'error: Threshold value not input',
        status: 'error',
        isClosable: true,
      })
      return
    }

    if (timeList) {
      timeList.forEach((time, index) => {
        const record: TlmObject = { Time: time }
        tlmNameList.forEach((tlm) => {
          const foundIndex = tlmObjectList.findIndex((e) => tlm === e.tlmName)
          record[tlm] = tlmObjectList[foundIndex]?.data[index] ?? null
        })
        tlmArrayObject.push(record)
      })

      let filteredTlmArrayObject: TlmObject[] = []

      switch (filterSign.value) {
        case '==': {
          filteredTlmArrayObject = tlmArrayObject.filter((e) => {
            const value = e[filterTlmName.value]
            if (value) {
              return value === filterThresholdValue
            }
            return false
          })
          break
        }
        case '!=': {
          filteredTlmArrayObject = tlmArrayObject.filter((e) => {
            const value = e[filterTlmName.value]
            if (value) {
              return value !== filterThresholdValue
            }
            return false
          })
          break
        }
        case '>': {
          filteredTlmArrayObject = tlmArrayObject.filter((e) => {
            const value = e[filterTlmName.value]
            if (value) {
              return value > filterThresholdValue
            }
            return false
          })
          break
        }
        case '>=': {
          filteredTlmArrayObject = tlmArrayObject.filter((e) => {
            const value = e[filterTlmName.value]
            if (value) {
              return value >= filterThresholdValue
            }
            return false
          })
          break
        }
        case '<': {
          filteredTlmArrayObject = tlmArrayObject.filter((e) => {
            const value = e[filterTlmName.value]
            if (value) {
              return value < filterThresholdValue
            }
            return false
          })
          break
        }
        case '<=': {
          filteredTlmArrayObject = tlmArrayObject.filter((e) => {
            const value = e[filterTlmName.value]
            if (value) {
              return value <= filterThresholdValue
            }
            return false
          })
          break
        }
        default: {
          break
        }
      }

      if (filteredTlmArrayObject.length === 0) {
        toast({
          title: 'error: Filter result: Empty',
          status: 'error',
          isClosable: true,
        })
        return
      }

      const filteredTlmObjectArray: TlmObjectArray = { Time: [] }
      tlmNameList.forEach((tlm) => {
        filteredTlmObjectArray[tlm] = []
      })

      filteredTlmArrayObject.forEach((object) => {
        filteredTlmObjectArray.Time.push(object.Time)
        tlmNameList.forEach((tlm) => {
          filteredTlmObjectArray[tlm]?.push(object[tlm] ?? null)
        })
      })

      setFilteredGraphData((prev) =>
        prev.map((plotData) => ({
          plotId: plotData.plotId,
          tlm: plotData.tlm.map((tlm) => ({
            tlmName: tlm.tlmName,
            x: filteredTlmObjectArray.Time,
            y: filteredTlmObjectArray[tlm.tlmName] as (number | null)[],
          })),
        }))
      )
    }
  }

  const deactivateFilter = () => {
    setFilteredGraphData(graphData)
  }

  const outputCsv = async () => {
    if (responseTlmData) {
      const response = await window.Main.saveFile(responseTlmData.tlm)
      toast({
        title: response.success ? `success: ${response.path}` : `error: ${response.error}`,
        status: response.success ? 'success' : 'error',
        isClosable: true,
      })
    } else {
      toast({
        title: 'error: tlm data not found',
        status: 'error',
        isClosable: true,
      })
    }
  }

  useEffect(() => {
    if (width !== 0) {
      setGraphConfig((prev) => {
        const newConfig = { ...prev }
        newConfig.graphWidth = (width - 600) / graphConfig.columnNumber
        return newConfig
      })
    }
  }, [width, graphConfig.columnNumber])

  useEffect(() => {
    if (width !== 0) plot(true)
  }, [width, graphConfig.graphHeight, graphConfig.columnNumber])

  return (
    <>
      <Box p={8} w="100%">
        <Flex>
          <Error
            isError={isError}
            errorMessage={errorMessage}
            isWarning={isWarning}
            warningMessages={warningMessages}
            noDisplayWhenSuccess={true}
          />
          <Spacer />
          <Button colorScheme="teal" onClick={() => plot()} mx="2" flexShrink={0} width="100px">
            Plot
          </Button>
          <Button
            colorScheme="teal"
            onClick={onOpenSet}
            mx="2"
            flexShrink={0}
            width="100px"
            isDisabled={responseTlmData === null}
          >
            Graph Set
          </Button>
          <Button
            colorScheme="teal"
            onClick={onOpenFilter}
            mx="2"
            flexShrink={0}
            width="100px"
            isDisabled={responseTlmData === null}
          >
            Filter
          </Button>
          <Button
            colorScheme="teal"
            onClick={() => plot(true)}
            mx="2"
            flexShrink={0}
            width="100px"
            isDisabled={responseTlmData === null}
          >
            Reload
          </Button>
          <Button
            colorScheme="teal"
            onClick={outputCsv}
            mx="2"
            flexShrink={0}
            width="100px"
            isDisabled={responseTlmData === null}
          >
            CSV
          </Button>
        </Flex>
        <Flex wrap="wrap" mt="20px">
          {!isLoading ? (
            filteredGraphData.map((element, index) => (
              <Graph
                key={element.plotId}
                graphData={element}
                graphNumber={index + 1}
                xMax={axis.x.max}
                xMin={axis.x.min}
                xDiv={axis.x.div}
                graphWidth={graphConfig.graphWidth}
                graphHeight={graphConfig.graphHeight}
                markerSize={graphConfig.markerSize}
                activatePlotSetting={activatePlotSetting}
              />
            ))
          ) : (
            <Spinner thickness="5px" speed="0.5s" emptyColor="gray.200" color="blue.500" size="xl" />
          )}
        </Flex>
      </Box>
      <Modal isOpen={isOpenSet} onClose={onCloseSet} initialFocusRef={initialRefSet}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Graph Set</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl my="10px">
              <Flex alignItems="center">
                <FormLabel fontWeight="normal" m={0} mr="10px" w="130px">
                  Column Number
                </FormLabel>
                <NumberInput
                  w="160px"
                  defaultValue={graphConfig.columnNumber}
                  onChange={(_, value) => setColumnNumber(value)}
                  step={1}
                  min={1}
                  max={5}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Flex>
            </FormControl>
            <FormControl my="10px">
              <Flex alignItems="center">
                <FormLabel fontWeight="normal" m={0} mr="10px" w="130px">
                  Graph height
                </FormLabel>
                <NumberInput
                  w="160px"
                  defaultValue={graphConfig.graphHeight}
                  onChange={(_, value) => setGraphHeight(value)}
                  step={50}
                  min={300}
                  max={1200}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text ml="10px">px</Text>
              </Flex>
            </FormControl>
            <FormControl my="10px">
              <Flex alignItems="center">
                <FormLabel fontWeight="normal" m={0} mr="10px" w="130px">
                  Marker size
                </FormLabel>
                <NumberInput
                  w="160px"
                  defaultValue={graphConfig.markerSize}
                  onChange={(_, value) => setMarkerSize(value)}
                  step={1}
                  min={1}
                  max={20}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Flex>
            </FormControl>
            <Text fontWeight="bold">X-axis</Text>
            <FormControl my="10px">
              <Flex alignItems="center">
                <FormLabel fontWeight="normal" m={0} mr="10px" w="40px">
                  Min
                </FormLabel>
                <Input
                  ref={initialRefSet}
                  w="250px"
                  placeholder="yyyy-MM-dd HH:mm:ss"
                  defaultValue={axis.x.min}
                  onChange={(event) => setXaxisMin(event.target.value)}
                />
              </Flex>
            </FormControl>
            <FormControl my="10px">
              <Flex alignItems="center">
                <FormLabel fontWeight="normal" m={0} mr="10px" w="40px">
                  Max
                </FormLabel>
                <Input
                  w="250px"
                  placeholder="yyyy-MM-dd HH:mm:ss"
                  defaultValue={axis.x.max}
                  onChange={(event) => setXaxisMax(event.target.value)}
                />
              </Flex>
            </FormControl>
            <FormControl my="10px">
              <Flex alignItems="center">
                <FormLabel fontWeight="normal" m={0} mr="10px" w="40px">
                  Div
                </FormLabel>
                <NumberInput w="250px" defaultValue={axis.x.div} onChange={(_, value) => setXaxisDiv(value)}>
                  <NumberInputField />
                </NumberInput>
                <Text ml="10px">sec</Text>
              </Flex>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={activateSetting}>
              Activate
            </Button>
            <Button onClick={onCloseSet}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpenFilter} onClose={onCloseFilter}>
        <ModalOverlay />
        <ModalContent maxW="600px">
          <ModalHeader>Filter</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Flex alignItems="center">
              <MySelect
                instanceId="filterTlmNameSelect"
                color="teal.500"
                width="300px"
                height="40px"
                options={graphData
                  .map((e) => e.tlm.map((tlm) => tlm.tlmName))
                  .flat()
                  .map((e) => stringToSelectOption(e))}
                selectValue={setFilterTlmName}
                defaultValue={filterTlmName}
              />
              <Spacer />
              <MySelect
                instanceId="filterSignSelect"
                color="teal.500"
                width="100px"
                height="40px"
                options={signList.map((e) => stringToSelectOption(e))}
                selectValue={setFilterSign}
                defaultValue={filterSign}
              />
              <Spacer />
              <NumberInput
                w="120px"
                onChange={(_, value) => setFilterThresholdValue(value)}
                defaultValue={filterThresholdValue}
              >
                <NumberInputField />
              </NumberInput>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={activateFilter}>
              Activate
            </Button>
            <Button colorScheme="red" mr={3} onClick={deactivateFilter}>
              Deactivate
            </Button>
            <Button onClick={onCloseFilter}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
