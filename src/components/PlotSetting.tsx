import { useEffect, useState } from 'react'
import type { ComponentProps } from 'react'

import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { VStack, StackDivider, IconButton, useColorMode, useColorModeValue, Button, Flex } from '@chakra-ui/react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { useLocalStorage } from 'usehooks-ts'

import { projectState, settingState, dateSettingState } from '@atoms/PlotSettingAtom'
import { ProjectSelect, TelemetrySelect, Error } from '@components'
import { stringToSelectOption } from '@functions'
import { DayPicker, MySwitch } from '@parts'

import type { SelectOptionType } from '@types'

type Props = {
  width?: ComponentProps<typeof VStack>['width']
  flexShrink?: ComponentProps<typeof VStack>['flexShrink']
}

export const PlotSetting = (props: Props) => {
  const { width, flexShrink } = props
  const { colorMode, toggleColorMode } = useColorMode()
  const sidebarBg = useColorModeValue('gray.50', 'gray.700')
  const [isOrbit, setIsOrbit] = useLocalStorage('IsOrbit', false)
  const [isStored, setIsStored] = useLocalStorage('IsStored', false)
  const [_, setIsChosen] = useLocalStorage('IsChosen', false)
  const [projectIndex, setProjectIndex] = useLocalStorage('ProjectIndex', 0)
  const setDate = useSetRecoilState(dateSettingState)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isWarning, setIsWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState<string[]>([])
  const [projectOptionList, setProjectOptionList] = useState<SelectOptionType[]>([])
  const project = useRecoilValue(projectState)
  const [setting, setSetting] = useRecoilState(settingState)

  const toggleIsOrbit = (value: boolean) => {
    if (!value) setIsChosen(false)
    setIsOrbit(() => !value)
  }
  const toggleIsStored = (value: boolean) => {
    setIsStored(() => !value)
  }

  const selectDate = (startDate: Date, endDate: Date) => {
    setDate(() => ({
      startDate: startDate,
      endDate: endDate,
    }))
  }

  const initializeSetting = () => {
    const response = window.Main.getSettings()
    if (!response.success) {
      setErrorMessage(response.error)
      setIsError(true)
      return
    }
    const settings = response.data
    let settingIndex = projectIndex

    if (settings) {
      if (project) {
        settingIndex = settings.findIndex((element) => element.pjName === project.value)
        setProjectIndex(settingIndex)
      }
      const foundSetting = settings[settingIndex]
      if (foundSetting?.tlmId) {
        setSetting(foundSetting)
        setProjectOptionList(() => settings.map((element) => stringToSelectOption(element.pjName)))
        setIsError(false)
      } else {
        setErrorMessage(`tlm_id.json for ${project?.value} not found`)
        setIsError(true)
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    initializeSetting()
  }, [project])

  useEffect(() => {
    if (!project?.value) return
    if (isOrbit && !setting?.orbitDatasetPath) {
      setIsWarning(true)
      setWarningMessage(() => [`orbitDatasetPath for ${project.value} not found`])
      return
    }
    if (!isOrbit && !setting?.testCase) {
      setIsWarning(true)
      setWarningMessage(() => [`groundTestPath or telemetry for ${project.value} not found`])
      return
    }
    setIsWarning(false)
    setIsError(false)
  }, [isOrbit, setting])

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
        <Button width="100%" colorScheme="teal" onClick={initializeSetting}>
          Reconnect
        </Button>
        <Error isError={isError} errorMessage={errorMessage} isWarning={isWarning} warningMessages={warningMessage} />
      </VStack>
      {!isLoading && (
        <ProjectSelect
          options={projectOptionList}
          defaultValue={setting?.pjName ? stringToSelectOption(setting.pjName) : undefined}
        />
      )}
      {!isError && (
        <Flex>
          <MySwitch label="isOrbit" value={isOrbit} toggleValue={toggleIsOrbit} />
          <MySwitch label="isStored" value={isStored} toggleValue={toggleIsStored} />
        </Flex>
      )}
      {!isError && <DayPicker selectDate={selectDate} />}
      {!isError && (
        <TelemetrySelect
          options={setting?.tlmId ? Object.keys(setting.tlmId).map((e) => stringToSelectOption(e)) : undefined}
        />
      )}
    </VStack>
  )
}
