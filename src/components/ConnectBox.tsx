import { Badge, Box, Button, Flex, HStack } from '@chakra-ui/react'

import { BadgeSuccess } from '@parts'

export const ConnectBox = () => {
  console.log('Connect')

  const hello = () => {
    console.log('hello')
  }

  return (
    <Box h="100%">
      <HStack spacing="20px">
        <Button width="150px" colorScheme="teal" onClick={hello}>
          Hello
        </Button>
        <BadgeSuccess isSuccess={true} successText="OPEN" failText="CLOSE" />
      </HStack>
    </Box>
  )
}
