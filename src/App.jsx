import './styles/global.css'
import '@mantine/core/styles.css';
import './App.css'

import { MantineProvider } from '@mantine/core';
import { useState } from 'react'

import { Outlet } from 'react-router'
import { SettingsProvider } from './context/SettingsContext';


//const App = (props) => {

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <MantineProvider>
      <div id="main">
        <SettingsProvider>
          <Outlet />
      </SettingsProvider>
      </div>
    </MantineProvider>

  )
}

