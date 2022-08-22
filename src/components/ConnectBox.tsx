import { useEffect } from 'react'

import { Box, Button, HStack } from '@chakra-ui/react'

import { BadgeSuccessBox } from '@parts'

export const ConnectBox = () => {
  const initializeSetting = () => {
    const response = window.Main.getSettings()
    console.log(response)
  }
  const startApi = () => {
    window.Main.startApi()
  }
  useEffect(() => {
    initializeSetting()
  }, [])

  return (
    <Box h="100%">
      <HStack spacing="20px">
        <Button width="150px" colorScheme="teal" onClick={startApi}>
          START
        </Button>
        <BadgeSuccessBox isSuccess={true} successText="OPEN" failText="CLOSE" />
      </HStack>
    </Box>
  )
}
