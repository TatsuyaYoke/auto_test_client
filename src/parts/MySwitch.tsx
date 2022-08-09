import { FormControl, FormLabel, Switch } from '@chakra-ui/react'

type Props = {
  label: string
  value: boolean
  toggleValue: (value: boolean) => void
}

export const MySwitch = (props: Props) => {
  const { label, value, toggleValue } = props
  const htmlFor = label
  return (
    <FormControl display="flex" alignItems="center">
      <FormLabel htmlFor={htmlFor} mb="0">
        {label}
      </FormLabel>
      <Switch id={htmlFor} colorScheme="teal" defaultChecked={value} onChange={() => toggleValue(value)} />
    </FormControl>
  )
}
