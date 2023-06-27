import { useState } from 'react'
import Products from './pages/thankyou'

function App() {
  const [count, setCount] = useState(false)

  return (
    <>
      <Products/>
    </>
  )
}

export default App
