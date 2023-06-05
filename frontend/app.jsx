import * as React from "https://esm.sh/preact";
import * as Hooks from "https://esm.sh/preact/hooks";
import Login from './pages/login.js'
import Checkout from './pages/checkout.js'
import Register from './pages/register.js'
import Listing from './pages/listing.js'

function App() {
  const [count, setCount] = Hooks.useState(0)

  return (
    <>
      <Listing/>
    </>
  )
}

export default App
