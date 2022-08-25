import { Box, Tabs, Tab, TabPanel, TabPanels, TabList } from '@chakra-ui/react'

import { ObsBox, ConnectBox, TransBox, BusBox } from '@components'

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
            <BusBox />
          </TabPanel>
          <TabPanel h="100%">
            <ObsBox />
          </TabPanel>
          <TabPanel h="100%">
            <TransBox />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
