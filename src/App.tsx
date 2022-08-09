import { useEffect } from 'react'

import { Box, Container } from '@chakra-ui/react'
import { useSetRecoilState } from 'recoil'
import { useWindowSize } from 'usehooks-ts'

import { isMaximizeState } from '@atoms/PlotSettingAtom'
import { AppBar, MySideBar } from '@components'

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
      <Container maxW="container.2xl" p={0} pt={headerHeight} display="flex" minH="100vh">
        <MySideBar width="450px" flexShrink={0} />
      </Container>
    </Box>
  )
}
