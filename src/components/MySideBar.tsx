import type { ComponentProps } from 'react'

import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { VStack, StackDivider, IconButton, useColorMode, useColorModeValue, Button } from '@chakra-ui/react'
import axios from 'axios'

type Props = {
  width?: ComponentProps<typeof VStack>['width']
  flexShrink?: ComponentProps<typeof VStack>['flexShrink']
}

export const MySideBar = (props: Props) => {
  const { width, flexShrink } = props
  const { colorMode, toggleColorMode } = useColorMode()
  const sidebarBg = useColorModeValue('gray.50', 'gray.700')
  
  const hello = () => {
      const baseUrl= "http://127.0.0.1:8001"
      axios.get(baseUrl).then((response) => {
        console.log(response.data)
      })
  }

  return (
    <VStack
      divider={<StackDivider borderColor="gray.200" />}
      spacing={3}
      p={8}
      align="stretch"
      flexShrink={flexShrink}
      width={width}
      bg={sidebarBg}
    >
      <VStack>
        <IconButton
          aria-label="change color theme"
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          width="100%"
        />
        <Button width="100%" colorScheme="teal" onClick={hello}>
          Hello
        </Button>
      </VStack>
    </VStack>
  )
}
