import { Box, Tabs, Tab, TabPanel, TabPanels, TabList, Text } from '@chakra-ui/react'

import { ConnectBox } from '@components/ConnectBox'

type Props = {
  headerHeight: number | string
}

export const BodyBox = (props: Props) => {
  const { headerHeight } = props

  return (
    <Box p={8} w="100%" h={`calc(100vh - ${headerHeight})`}>
      <Tabs size="lg" variant="enclosed" h="100%">
        <TabList>
          <Tab w="150px">Connect</Tab>
          <Tab w="150px">Bus</Tab>
          <Tab w="150px">Obs</Tab>
          <Tab w="150px">Trans</Tab>
        </TabList>
        <TabPanels h={`calc(100% - ${headerHeight})`}>
          <TabPanel h="100%">
            <ConnectBox />
          </TabPanel>
          <TabPanel h="100%">
            <Text>Bus</Text>
          </TabPanel>
          <TabPanel h="100%">
            <Text>Obs</Text>
          </TabPanel>
          <TabPanel h="100%">
            <Text>Trans</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
