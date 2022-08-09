import { useState, useEffect } from 'react'

import { useLocalStorage } from 'usehooks-ts'

import { stringToSelectOption } from '@functions'

import type { SavedTlmListType, SelectOptionType, TlmListType } from '@types'
import type { MultiValue } from 'chakra-react-select'

const MAX_OPTION_LENGTH = 2000

export const useTlmListSetting = (options: SelectOptionType[] | undefined, prefixId: string) => {
  const [tlmList, setTlmList] = useLocalStorage<TlmListType[]>('TlmList', [{ id: 1, tlm: [] }])
  const [savedTlmList, setSavedTlmList] = useLocalStorage<SavedTlmListType[]>('SavedTlmList', [])
  const [countList, setCountList] = useState(1)
  const [filteredOptions, setFilteredOptions] = useState<SelectOptionType[] | undefined>([])

  useEffect(() => {
    setTlmList((prev) => {
      const newTlmList = [...prev]
      setCountList(newTlmList.length)
      return newTlmList.map((element, index) => ({ id: index + 1, tlm: element.tlm }))
    })
  }, [])

  const addTlmList = () => {
    const newTlmList = [...tlmList]
    newTlmList.push({ id: countList + 1, tlm: [] })
    setCountList(() => countList + 1)
    setTlmList(newTlmList)
  }

  const deleteTlmList = (index: number) => {
    if (tlmList.length === 1) return
    const newTlmList = [...tlmList]
    newTlmList.splice(index, 1)
    setTlmList(newTlmList)
  }

  const selectValue = (value: MultiValue<SelectOptionType>, instanceId?: string) => {
    const newTlmList = tlmList.map((list) => ({ ...list }))
    const foundIndex = newTlmList.findIndex((element) => `${prefixId}${element.id}` === instanceId)
    const item = newTlmList[foundIndex]
    if (item) {
      if (Array.isArray(value)) {
        item.tlm = value
      }
    }

    setTlmList(() => newTlmList)
  }

  const filterOption = (value: string) => {
    const result = options?.filter((option) => option.value.indexOf(value.toLocaleUpperCase()) !== -1)
    const resultLength = result?.length
    if (resultLength && resultLength > MAX_OPTION_LENGTH) return
    setFilteredOptions(() => result)
  }

  const replaceTlmList = (tlmListName: string): boolean => {
    const foundIndex = savedTlmList.findIndex((e) => e.tlmListName.value === tlmListName)
    const selectedTlmList = savedTlmList[foundIndex]?.tlm
    if (selectedTlmList) {
      const latestId = tlmList.map((e) => e.id).sort()[tlmList.length - 1] ?? 100
      setTlmList(
        selectedTlmList.map((tlm, index) => ({
          id: latestId + index + 1,
          tlm: tlm,
        }))
      )
      return true
    }
    return false
  }

  const saveTlmList = (tlmListName: string) => {
    setSavedTlmList([
      ...savedTlmList,
      {
        tlmListName: stringToSelectOption(tlmListName),
        tlm: tlmList.map((e) => e.tlm),
      },
    ])
  }

  const deleteSavedTlmList = (tlmListName: string): boolean => {
    const foundIndex = savedTlmList.findIndex((e) => e.tlmListName.value === tlmListName)
    if (foundIndex !== -1) {
      const newTlmList = [...savedTlmList]
      newTlmList.splice(foundIndex, 1)
      setSavedTlmList(newTlmList)
      return true
    }
    return false
  }

  return {
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
  }
}
