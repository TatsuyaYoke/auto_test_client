import React from 'react'
import ReactDOM from 'react-dom'

import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { RecoilRoot } from 'recoil'

import { App } from './App'
import './index.css'

import type { ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}
const theme = extendTheme({ config })

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
