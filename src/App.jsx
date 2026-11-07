import { useState } from 'react'
import './styles/global.css'
import './App.css'
import { Outlet } from 'react-router'


//const App = (props) => {

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Outlet />
    </>
  )
}

