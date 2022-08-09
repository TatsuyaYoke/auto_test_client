import { useEffect, useRef, useState } from 'react'

import {
  Box,
  Flex,
  Input,
  useToast,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from '@chakra-ui/react'

import { average, checkDivSetting, max, median, min, standardDeviation } from '@functions'
import { MyPlot } from '@parts/MyPlot'
import { dateGraphSchema, nonNullable, isNotString } from '@types'

import type { GraphDataEachPlotIdType, AxisType } from '@types'

type Props = {
  graphNumber: number
  graphData: GraphDataEachPlotIdType
  xMax: string | undefined
  xMin: string | undefined
  xDiv: number | undefined
  graphWidth: number
  graphHeight: number
  markerSize: number
  activatePlotSetting: boolean
}

type StatisticsData = {
  tlmName: string
  max: number | null
  min: number | null
  ave: number | null
  std: number | null
  med: number | null
}

export const Graph = (props: Props) => {
  const { graphNumber, graphData, xMax, xMin, xDiv, graphWidth, graphHeight, markerSize, activatePlotSetting } = props
  const { isOpen: isOpenSet, onOpen: onOpenSet, onClose: onCloseSet } = useDisclosure()
  const { isOpen: isOpenAnalyze, onOpen: onOpenAnalyze, onClose: onCloseAnalyze } = useDisclosure()
  const initialRefSet = useRef(null)
  const initialRefAnalyze = useRef(null)
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
  const [statisticsData, setStatisticsData] = useState<StatisticsData[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activateGraphSetting, setActivateGraphSetting] = useState<boolean>(true)
  const [xaxisMax, setXaxisMax] = useState<string | undefined>(undefined)
  const [xaxisMaxStatistics, setXaxisMaxStatistics] = useState<string | undefined>(undefined)
  const [xaxisMin, setXaxisMin] = useState<string | undefined>(undefined)
  const [xaxisMinStatistics, setXaxisMinStatistics] = useState<string | undefined>(undefined)
  const [xaxisDiv, setXaxisDiv] = useState<number | undefined>(undefined)
  const [yaxisMax, setYaxisMax] = useState<number | undefined>(undefined)
  const [yaxisMin, setYaxisMin] = useState<number | undefined>(undefined)
  const [yaxisDiv, setYaxisDiv] = useState<number | undefined>(undefined)

  const toast = useToast()

  const activateAxis = () => {
    if (Number.isNaN(yaxisMax ?? NaN) || Number.isNaN(yaxisMin ?? NaN)) {
      toast({
        title: 'Max and Min required',
        status: 'error',
        isClosable: true,
      })
      return
    }

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

    const checkYaxisDivResult = checkDivSetting(yaxisMax, yaxisMin, yaxisDiv)
    if (!checkYaxisDivResult.success) {
      toast({
        title: `Y-axis ${checkYaxisDivResult.error}`,
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
      newAxis.y.max = yaxisMax
      newAxis.y.min = yaxisMin
      newAxis.y.div = yaxisDiv
      return newAxis
    })
    setActivateGraphSetting((prev) => !prev)
    onCloseSet()
  }

  const analyzeTlm = () => {
    const xaxisMaxResult = dateGraphSchema.safeParse(xaxisMaxStatistics)
    const xaxisMinResult = dateGraphSchema.safeParse(xaxisMinStatistics)
    if (!(xaxisMaxResult.success && xaxisMinResult.success)) {
      toast({
        title: 'X-axis Format (yyyy-MM-dd HH:mm:ss) error',
        status: 'error',
        isClosable: true,
      })
      return
    }

    if (xaxisMinStatistics && xaxisMaxStatistics) {
      setStatisticsData(
        graphData.tlm.map((tlm) => {
          const reversedXaxisMinIndex = tlm.x
            .slice()
            .reverse()
            .findIndex((e) => new Date(e) <= new Date(xaxisMinStatistics))
          const xaxisMinIndex = reversedXaxisMinIndex === -1 ? 0 : tlm.x.length - (reversedXaxisMinIndex + 1)
          const foundXaxisMaxIndex = tlm.x.findIndex((e) => new Date(e) >= new Date(xaxisMaxStatistics))
          const xaxisMaxIndex = foundXaxisMaxIndex === -1 ? tlm.x.length - 1 : foundXaxisMaxIndex
          const extractedY = tlm.y.slice(xaxisMinIndex, xaxisMaxIndex).filter(nonNullable)
          return {
            tlmName: tlm.tlmName,
            max: max(extractedY),
            min: min(extractedY),
            ave: average(extractedY),
            med: median(extractedY),
            std: standardDeviation(extractedY),
          }
        })
      )
    }
  }

  const openAndAnalyze = () => {
    analyzeTlm()
    onOpenAnalyze()
  }

  useEffect(() => {
    const yDataAll = graphData.tlm
      .map((e) => e.y)
      .flat()
      .filter(isNotString)
      .filter(nonNullable)

    const yMax = max(yDataAll)
    const yMin = min(yDataAll)
    const yOutside = yMax && yMin ? ((yMax - yMin) / 4) * 0.2 : undefined

    setAxis((prev) => {
      const newAxis = { ...prev }
      newAxis.x.max = xMax
      newAxis.x.min = xMin
      newAxis.y.max = yMax && yOutside ? yMax + yOutside : undefined
      newAxis.y.min = yMin && yOutside ? yMin - yOutside : undefined
      return newAxis
    })
    setXaxisMax(() => axis.x.max)
    setXaxisMin(() => axis.x.min)
    setYaxisMax(() => axis.y.max)
    setYaxisMin(() => axis.y.min)
    setXaxisMaxStatistics(xMax)
    setXaxisMinStatistics(xMin)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    setAxis((prev) => {
      const newAxis = { ...prev }
      newAxis.x.max = xMax
      newAxis.x.min = xMin
      newAxis.x.div = xDiv
      return newAxis
    })
    setXaxisMax(() => axis.x.max)
    setXaxisMin(() => axis.x.min)
    setXaxisDiv(() => axis.x.div)
  }, [activatePlotSetting])

  return (
    <>
      <Box mb="20px">
        <Flex alignItems="center" mb="5px">
          <Text mx="20px">Graph No.{graphNumber}</Text>
          <Button colorScheme="teal" h="1.8em" w="80px" mx="3px" fontSize="1em" onClick={onOpenSet}>
            Set
          </Button>
          <Button colorScheme="teal" h="1.8em" w="80px" mx="3px" fontSize="1em" onClick={openAndAnalyze}>
            Analyze
          </Button>
        </Flex>
        {!isLoading && (
          <MyPlot
            graphData={graphData}
            xMax={axis.x.max}
            xMin={axis.x.min}
            xDiv={axis.x.div}
            yMax={axis.y.max}
            yMin={axis.y.min}
            yDiv={axis.y.div}
            graphWidth={graphWidth}
            graphHeight={graphHeight}
            markerSize={markerSize}
            activatePlotSetting={activatePlotSetting}
            activateGraphSetting={activateGraphSetting}
          />
        )}
      </Box>
      <Modal isOpen={isOpenSet} onClose={onCloseSet} initialFocusRef={initialRefSet}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Set axis</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
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
            <Text fontWeight="bold">Y-axis</Text>
            <FormControl my="10px">
              <Flex alignItems="center">
                <FormLabel fontWeight="normal" m={0} mr="10px" w="40px">
                  Min
                </FormLabel>
                <NumberInput w="250px" defaultValue={axis.y.min} onChange={(_, value) => setYaxisMin(value)}>
                  <NumberInputField />
                </NumberInput>
              </Flex>
            </FormControl>
            <FormControl my="10px">
              <Flex alignItems="center">
                <FormLabel fontWeight="normal" m={0} mr="10px" w="40px">
                  Max
                </FormLabel>
                <NumberInput w="250px" defaultValue={axis.y.max} onChange={(_, value) => setYaxisMax(value)}>
                  <NumberInputField />
                </NumberInput>
              </Flex>
            </FormControl>
            <FormControl my="10px">
              <Flex alignItems="center">
                <FormLabel fontWeight="normal" m={0} mr="10px" w="40px">
                  Div
                </FormLabel>
                <NumberInput w="250px" defaultValue={axis.y.div} onChange={(_, value) => setYaxisDiv(value)}>
                  <NumberInputField />
                </NumberInput>
              </Flex>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={activateAxis}>
              Activate
            </Button>
            <Button onClick={onCloseSet}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpenAnalyze} onClose={onCloseAnalyze} initialFocusRef={initialRefAnalyze}>
        <ModalOverlay />
        <ModalContent maxW="1100px">
          <ModalHeader>Analyze</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text fontWeight="bold">X-axis range</Text>
            <FormControl my="10px">
              <Flex alignItems="center">
                <FormLabel fontWeight="normal" m={0} mr="10px" w="40px">
                  Min
                </FormLabel>
                <Input
                  ref={initialRefAnalyze}
                  w="250px"
                  placeholder="yyyy-MM-dd HH:mm:ss"
                  defaultValue={xaxisMinStatistics}
                  onChange={(event) => setXaxisMinStatistics(event.target.value)}
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
                  defaultValue={xaxisMaxStatistics}
                  onChange={(event) => setXaxisMaxStatistics(event.target.value)}
                />
              </Flex>
            </FormControl>
            <Text fontWeight="bold">Statistics</Text>
            <TableContainer>
              <Table variant="striped" colorScheme="teal" size="sm">
                <Thead>
                  <Tr>{statisticsData[0] && Object.keys(statisticsData[0]).map((key) => <Th key={key}>{key}</Th>)}</Tr>
                </Thead>
                <Tbody>
                  {statisticsData &&
                    statisticsData.map((data) => (
                      <Tr key={data.tlmName}>
                        {Object.values(data).map((value, index) => (
                          <Td key={`${data.tlmName}_${index.toString()}`}>
                            {typeof value === 'string' ? value : value?.toString().slice(0, 15)}
                          </Td>
                        ))}
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={analyzeTlm}>
              Analyze
            </Button>
            <Button onClick={onCloseAnalyze}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
