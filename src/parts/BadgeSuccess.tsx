import { Badge, Box } from '@chakra-ui/react'

type Props = {
  isSuccess: boolean | null
  width?: string | number
  successText: string
  failText: string
  nullText?: string
  successColor?: string
  failColor?: string
}
export const BadgeSuccessBox = (props: Props) => {
  const {
    isSuccess,
    width = '80px',
    successText,
    failText,
    nullText = 'UNSTABLE',
    successColor = 'green',
    failColor = 'red',
  } = props

  if (isSuccess === null) {
    return (
      <Box>
        <Badge textAlign="center" colorScheme="red" variant="solid" fontSize="20px" w={width}>
          {nullText}
        </Badge>
      </Box>
    )
  }
  return (
    <Box>
      {isSuccess ? (
        <Badge textAlign="center" colorScheme={successColor} variant="solid" fontSize="20px" w={width}>
          {successText}
        </Badge>
      ) : (
        <Badge textAlign="center" colorScheme={failColor} variant="solid" fontSize="20px" w={width}>
          {failText}
        </Badge>
      )}
    </Box>
  )
}
