import { useRef, useState } from 'react'

import { SmallCloseIcon, AddIcon } from '@chakra-ui/icons'
import {
  VStack,
  Text,
  Flex,
  IconButton,
  Button,
  useToast,
  useDisclosure,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel,
  HStack,
  Spacer,
} from '@chakra-ui/react'

import { useTlmListSetting } from '@hooks'
import { MySelect } from '@parts'

import type { SelectOptionType } from '@types'
import type { SingleValue } from 'chakra-react-select'

type Props = {
  options?: SelectOptionType[]
}

const TLM_SELECT_INSTANCE_ID_PREFIX = 'tlmListId'

export const TelemetrySelect = (props: Props) => {
  const { options } = props

  const toast = useToast()
  const { isOpen: isOpenSave, onOpen: onOpenSave, onClose: onCloseSave } = useDisclosure()
  const initialRefSave = useRef(null)
  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure()
  const initialRefDelete = useRef(null)

  const [tlmListSelectInstanceList, setTlmListSelectInstanceList] = useState<number[]>([1])
  const [tlmListName, setTlmListName] = useState<string>('')
  const [selectedTlmListName, setSelectedTlmListName] = useState<SingleValue<SelectOptionType>>()
  const {
    tlmList,
    filteredOptions,
    savedTlmList,
    addTlmList,
    deleteTlmList,
    selectValue,
    filterOption,
    replaceTlmList,
    saveTlmList,
    deleteSavedTlmList,
  } = useTlmListSetting(options, TLM_SELECT_INSTANCE_ID_PREFIX)

  const saveBeforeCheck = () => {
    let errorTitle: string | null = null
    if (tlmListName.length === 0) {
      errorTitle = 'Name empty error, please input name'
    }
    if (savedTlmList.some((e) => e.tlmListName.value === tlmListName)) {
      errorTitle = 'Same name found, please input different name'
    }
    if (tlmList.some((e) => e.tlm.length === 0)) {
      errorTitle = 'TLM List empty error, please input TLM'
    }
    if (errorTitle) {
      toast({
        title: errorTitle,
        status: 'error',
        isClosable: true,
      })
      return
    }

    saveTlmList(tlmListName)
    setTlmListName('')
    onCloseSave()
  }

  const checkTlmListNameExist = () => {
    const selectedTlmListNameValue = selectedTlmListName?.value
    if (!selectedTlmListNameValue) {
      toast({
        title: 'tlmListName not selected',
        status: 'error',
        isClosable: true,
      })
      return { success: false } as const
    }
    return { success: true, data: selectedTlmListNameValue } as const
  }

  const replaceBeforeCheck = () => {
    const result = checkTlmListNameExist()
    if (result.success) {
      const success = replaceTlmList(result.data)
      if (!success) {
        toast({
          title: `${result.data} not found`,
          status: 'error',
          isClosable: true,
        })
      }
    }
  }

  const deleteBeforeCheck = () => {
    const result = checkTlmListNameExist()
    if (result.success) {
      const success = deleteSavedTlmList(result.data)
      if (success) {
        setTlmListSelectInstanceList((prev) => [...prev, prev.length + 1])
        setSelectedTlmListName(null)
        toast({
          title: `${result.data} deleted`,
          status: 'info',
          isClosable: true,
        })
      } else {
        toast({
          title: `${result.data} not found`,
          status: 'error',
          isClosable: true,
        })
      }
    }
    onCloseDelete()
  }

  return (
    <>
      <VStack>
        <Flex w="100%">
          <Text fontWeight={600}>Choose telemetries</Text>
        </Flex>
        {tlmListSelectInstanceList.map((element) =>
          tlmListSelectInstanceList.length === element ? (
            <MySelect
              key={`tlmListSelect${element}`}
              instanceId={`tlmListSelect${element}`}
              color="teal.500"
              width="100%"
              height="40px"
              options={savedTlmList.map((e) => e.tlmListName)}
              selectValue={setSelectedTlmListName}
            />
          ) : null
        )}
        <HStack spacing="20px" w="100%">
          <Spacer />
          <Button onClick={replaceBeforeCheck} colorScheme="teal" w="80px">
            Select
          </Button>
          <Button onClick={onOpenSave} colorScheme="blue" w="80px">
            Save
          </Button>
          <Button
            onClick={onOpenDelete}
            colorScheme="red"
            w="80px"
            isDisabled={savedTlmList.length === 0 || !selectedTlmListName?.value}
          >
            Delete
          </Button>
        </HStack>
        <VStack w="100%">
          {tlmList.map((element, index) => (
            <Flex key={`tlm${element.id}`} w="100%" alignItems="center">
              <MySelect
                instanceId={`${TLM_SELECT_INSTANCE_ID_PREFIX}${element.id}`}
                color="teal.500"
                width="100%"
                height="40px"
                options={filteredOptions}
                isMulti={true}
                selectValue={selectValue}
                filterOption={filterOption}
                defaultValue={element.tlm}
              />
              <IconButton
                aria-label="delete telemetry list"
                variant="outline"
                colorScheme="teal"
                fontSize="15px"
                size="xs"
                icon={<SmallCloseIcon />}
                mx={2}
                onClick={() => deleteTlmList(index)}
              />
            </Flex>
          ))}
        </VStack>
        <Flex w="100%" justifyContent="right">
          <IconButton
            aria-label="add telemetry list"
            colorScheme="teal"
            size="xs"
            icon={<AddIcon />}
            mt={2}
            mr={2}
            onClick={() => addTlmList()}
          />
        </Flex>
      </VStack>
      <Modal isOpen={isOpenSave} onClose={onCloseSave} initialFocusRef={initialRefSave}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save TLM Setting</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl my="10px">
              <Flex alignItems="center">
                <FormLabel fontWeight="normal" m={0} mr="10px" w="50px">
                  Name
                </FormLabel>
                <Input ref={initialRefSave} w="250px" onChange={(event) => setTlmListName(event.target.value)} />
              </Flex>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={saveBeforeCheck}>
              Save
            </Button>
            <Button onClick={onCloseSave}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpenDelete} onClose={onCloseDelete} initialFocusRef={initialRefDelete}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>TLM List Delete Check</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>{`Delete TLM List name: ${selectedTlmListName?.value}?`}</ModalBody>

          <ModalFooter>
            <Button ref={initialRefDelete} colorScheme="red" mr={3} onClick={deleteBeforeCheck}>
              Delete
            </Button>
            <Button onClick={onCloseDelete}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
