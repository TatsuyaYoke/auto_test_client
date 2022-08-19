import { Badge, Box } from '@chakra-ui/react'

type Props = {
  isSuccess: boolean
  successText: string
  failText: string
}
export const BadgeSuccessBox = (props: Props) => {
  const { isSuccess, successText, failText } = props

  return (
    <Box>
      {isSuccess ? (
        <Badge textAlign="center" colorScheme="green" variant="solid" fontSize="20px" w="80px">
          {successText}
        </Badge>
      ) : (
        <Badge textAlign="center" colorScheme="red" variant="solid" fontSize="20px" w="80px">
          {failText}
        </Badge>
      )}
    </Box>
  )
}
