import { memo } from 'react'

import { Flex, Text, useColorModeValue, VStack } from '@chakra-ui/react'
import Plot from 'react-plotly.js'

import type { GraphDataType } from '@types'

type PlotType = 'markers' | 'lines' | 'lines+markers'

type Props = {
  name?: string
  graphData: GraphDataType[]
  xMax?: string
  xMin?: string
  xDiv?: number
  yMax?: number
  yMin?: number
  yDiv?: number
  graphWidth: number
  graphHeight: number
  markerSize?: number
  mode?: PlotType
  showlegend?: boolean
  tickformat?: string
}

export const MyPlot = memo((props: Props) => {
  const {
    name,
    graphData,
    xMax,
    xMin,
    xDiv,
    yMax,
    yMin,
    yDiv,
    graphWidth,
    graphHeight,
    markerSize,
    mode = 'markers',
    showlegend,
    tickformat,
  } = props
  const graphBgColor = useColorModeValue('#FFFFFF', '#1A202C')
  const graphFontColor = useColorModeValue('#000000', '#FFFFFF')
  const graphGridColor = useColorModeValue('#A0AEC0', '#636363')
  const graphLineColor = useColorModeValue('#A0AEC0', '#636363')

  return (
    <VStack>
      {name && (
        <Flex justifyContent="left" w="100%">
          <Text fontSize="1.5em" fontWeight={600} borderBottom="solid 2px">
            {name}
          </Text>
        </Flex>
      )}
      <Plot
        data={graphData.map((element) => ({
          x: element.x,
          y: element.y,
          type: 'scattergl',
          mode: mode,
          name: element.name,
          marker: {
            size: markerSize,
          },
        }))}
        layout={{
          width: graphWidth,
          height: graphHeight,
          margin: {
            l: 80,
            r: 10,
            t: 35,
            b: 120,
          },
          xaxis: {
            dtick: xDiv ? xDiv * 1000 : undefined, // msec
            range: [xMin, xMax],
            tickformat: tickformat,
            tickangle: -45,
            gridcolor: graphGridColor,
            linecolor: graphLineColor,
            zerolinecolor: graphLineColor,
            mirror: 'ticks',
            showgrid: true,
            zeroline: true,
            showline: true,
          },
          yaxis: {
            dtick: yDiv,
            range: [yMin, yMax],
            gridcolor: graphGridColor,
            linecolor: graphLineColor,
            zerolinecolor: graphLineColor,
            mirror: 'ticks',
            showgrid: true,
            zeroline: true,
            showline: true,
          },
          font: {
            color: graphFontColor,
          },
          plot_bgcolor: graphBgColor,
          paper_bgcolor: graphBgColor,
          showlegend: showlegend,
        }}
        config={{
          responsive: false,
        }}
      />
    </VStack>
  )
})
