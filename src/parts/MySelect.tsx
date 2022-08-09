import { Select } from 'chakra-react-select'

import type { SelectOptionType } from '@types'
import type { SingleValue, MultiValue } from 'chakra-react-select'

type Props<IsMulti extends boolean = false> = {
  instanceId: string
  color: string
  width: number | string
  height: number | string
  options?: SelectOptionType[]
  isMulti?: IsMulti
  selectValue: (
    value: IsMulti extends true ? MultiValue<SelectOptionType> : SingleValue<SelectOptionType>,
    instanceId?: string
  ) => void
  defaultValue?: IsMulti extends true ? MultiValue<SelectOptionType> : SingleValue<SelectOptionType>
  filterOption?: (value: string) => void
}

export const MySelect = <IsMulti extends boolean = false>(props: Props<IsMulti>) => {
  const { instanceId, color, width, height, options, isMulti, selectValue, defaultValue, filterOption } = props

  return (
    <Select
      instanceId={instanceId}
      size="sm"
      isMulti={isMulti}
      options={options}
      placeholder=""
      focusBorderColor={color}
      defaultValue={defaultValue}
      onChange={(value) => selectValue(value, instanceId)}
      onInputChange={filterOption}
      chakraStyles={{
        valueContainer: (provided) => ({
          ...provided,
          minHeight: height,
        }),
        control: (provided) => ({
          ...provided,
          borderRadius: '0.375rem',
          width: width,
        }),
        container: (provided) => ({
          ...provided,
          width: width,
        }),
      }}
    />
  )
}
