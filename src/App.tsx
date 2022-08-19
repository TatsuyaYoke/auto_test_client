import { useEffect } from 'react'

import { Box } from '@chakra-ui/react'
import { useSetRecoilState } from 'recoil'
import { useWindowSize } from 'usehooks-ts'

import { isMaximizeState } from '@atoms/PlotSettingAtom'
import { AppBar, BodyBox } from '@components'

export const App = () => {
  const headerHeight = '30px'
  const setIsMaximize = useSetRecoilState(isMaximizeState)

  const handleResize = async () => {
    setIsMaximize(await window.Main.isMaximize())
  }

  const { width, height } = useWindowSize()
  useEffect(() => {
    handleResize()
  }, [width, height])

  return (
    <Box>
      {window.Main && <AppBar height={headerHeight} />}
      <BodyBox headerHeight={headerHeight} />
    </Box>
  )
}
