import { memo, useEffect, useState } from 'react'

import { useColorModeValue } from '@chakra-ui/react'
import Plot from 'react-plotly.js'
import { useRecoilValue } from 'recoil'

import { settingState } from '@atoms/PlotSettingAtom'

import type { GraphDataEachPlotIdType } from '@types'

type Props = {
  graphData: GraphDataEachPlotIdType
  xMax: string | undefined
  xMin: string | undefined
  xDiv: number | undefined
  yMax: number | undefined
  yMin: number | undefined
  yDiv: number | undefined
  graphWidth: number
  graphHeight: number
  markerSize: number
  activatePlotSetting: boolean
  activateGraphSetting: boolean
}

export const MyPlot = memo((props: Props) => {
  const {
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
    activatePlotSetting: _activatePlotSetting,
    activateGraphSetting: _activateGraphSetting,
  } = props
  const graphBgColor = useColorModeValue('#FFFFFF', '#1A202C')
  const graphFontColor = useColorModeValue('#000000', '#FFFFFF')
  const graphGridColor = useColorModeValue('#A0AEC0', '#636363')
  const graphLineColor = useColorModeValue('#A0AEC0', '#636363')
  const setting = useRecoilValue(settingState)
  const [tickvals, setTickvals] = useState<number[] | undefined>(undefined)
  const [ticktext, setTicktext] = useState<string[] | undefined>(undefined)

  useEffect(() => {
    const tlmStSetting = setting?.tlmSt
    if (tlmStSetting) {
      const tlmNameForPlot = graphData.tlm.map((e) => e.tlmName)
      const tlmNameForSt = Object.keys(tlmStSetting)
      const tlmNameHasSt = tlmNameForSt.filter((e) => tlmNameForPlot.indexOf(e) !== -1)
      if (tlmNameHasSt.length > 0) {
        const foundTlmName = tlmNameHasSt[0]
        if (foundTlmName) {
          const tickSetting = tlmStSetting[foundTlmName]
          if (tickSetting) {
            setTickvals(tickSetting.value)
            setTicktext(tickSetting.text)
          }
        }
      }
    }
  }, [])

  return (
    <Plot
      data={graphData.tlm.map((element) => ({
        x: element.x,
        y: element.y,
        type: 'scattergl',
        mode: 'markers',
        name: element.tlmName,
        marker: {
          size: markerSize,
        },
      }))}
      layout={{
        width: graphWidth,
        height: graphHeight,
        margin: {
          l: 180,
          r: 10,
          t: 35,
          b: 80,
        },
        xaxis: {
          dtick: xDiv ? xDiv * 1000 : undefined, // msec
          range: [xMin, xMax],
          tickformat: '%m-%d, %H:%M:%S',
          tickangle: -40,
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
          tickvals: tickvals,
          ticktext: ticktext,
        },
        font: {
          color: graphFontColor,
        },
        plot_bgcolor: graphBgColor,
        paper_bgcolor: graphBgColor,
        showlegend: true,
        legend: {
          orientation: 'h',
          x: 0,
          xanchor: 'left',
          y: -10000 * graphHeight ** -1.65,
          yanchor: 'top',
        },
      }}
      config={{
        responsive: false,
      }}
    />
  )
})
