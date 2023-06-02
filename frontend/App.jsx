import { useState } from 'react'
import Login from './pages/login'
import Checkout from './pages/checkout'
import Register from './pages/register'
import Listing from './pages/listing'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Listing/>
    </>
  )
}

export default App
