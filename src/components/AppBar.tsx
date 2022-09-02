import { Flex, Spacer, Text, Box, useColorModeValue } from '@chakra-ui/react'
import { useRecoilState, useRecoilValue } from 'recoil'

import { isMaximizeState, pidListState } from '@atoms/SettingAtom'

type Props = {
  height: number | string
}

export const AppBar = (props: Props) => {
  const { height } = props
  const [isMaximize, setIsMaximize] = useRecoilState(isMaximizeState)
  const bgColor = useColorModeValue('gray.200', 'gray.600')
  const pidList = useRecoilValue(pidListState)

  const handleToggle = () => {
    if (isMaximize) {
      setIsMaximize(false)
    } else {
      setIsMaximize(true)
    }
    window.Main.Maximize()
  }

  return (
    <Flex align="center" h={height} w="100%" bg={bgColor} top={0} left={0} zIndex={2} className="draggable">
      <Text fontSize="xs" pl={3}>
        SAT AUTO CLIENT
      </Text>
      <Spacer />
      <Box
        as="button"
        onClick={window.Main.Minimize}
        borderRadius={0}
        h="inherit"
        px={5}
        _hover={{ bgColor: 'gray.300' }}
        className="undraggable"
      >
        &#8211;
      </Box>
      <Box
        as="button"
        onClick={handleToggle}
        borderRadius={0}
        h="inherit"
        px={5}
        _hover={{ bgColor: 'gray.300' }}
        className="undraggable"
      >
        {isMaximize ? '\u2752' : '⃞'}
      </Box>
      <Box
        as="button"
        onClick={() => {
          window.Main.stopApi(pidList)
          window.Main.Close()
        }}
        borderRadius={0}
        h="inherit"
        px={5}
        _hover={{ bgColor: 'red.500', color: 'white' }}
        className="undraggable"
      >
        &#10005;
      </Box>
    </Flex>
  )
}
