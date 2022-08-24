import { WarningIcon } from '@chakra-ui/icons'
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertIcon,
  Text,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react'

type Props = {
  isError?: boolean
  isWarning?: boolean
  successMessage?: string
  errorMessage?: string
  warningMessages?: string[]
  noDisplayWhenSuccess?: boolean
}
export const Error = (props: Props) => {
  const {
    isError = false,
    isWarning = false,
    successMessage = 'Success',
    errorMessage,
    warningMessages,
    noDisplayWhenSuccess = false,
  } = props

  return isError || isWarning ? (
    <Accordion allowMultiple width="100%">
      <AccordionItem>
        <AccordionButton p={0}>
          <Alert status={isError ? 'error' : 'warning'} variant="solid">
            <AlertIcon />
            {isError ? <Text>Error</Text> : <Text>Warning</Text>}
          </Alert>
        </AccordionButton>
        <AccordionPanel pb={4} textAlign="left">
          {isError ? (
            <Text>{errorMessage}</Text>
          ) : (
            <List spacing={3}>
              {warningMessages?.map((message) => (
                <ListItem key={message} display="flex" alignItems="center">
                  <ListIcon as={WarningIcon} color="orange.300" />
                  {message}
                </ListItem>
              ))}
            </List>
          )}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  ) : (
    <Alert status="success" variant="solid" display={noDisplayWhenSuccess ? 'none' : undefined}>
      <AlertIcon />
      {successMessage}
    </Alert>
  )
}
