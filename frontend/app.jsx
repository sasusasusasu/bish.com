import Router from 'https://esm.sh/preact-router@4.1.1'
import * as React from "https://esm.sh/preact";
import { useState, useEffect } from "https://esm.sh/preact/hooks";

import Navi from './components/Navi.js'
import Frontpage from './pages/Frontpage.js'
import Register from './pages/Register.js'
import Login from './pages/Login.js'
import Itemlisting from './pages/Listing.js'
import Checkout from './pages/Checkout.js'
import Search from './pages/Search.js'

const items = [{name: 'very cool product', price: 123, seller: 123, picture: '', id: 123}]

const App = () => {
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  useEffect(() => setCart(items), [])

  return (
   <div>
    <Navi search={ search } setSearch={ setSearch } items={cart} setItems={ setCart } />
    <Router>
      <p path='/frontend/html/index.html' className='asd'>...</p>
      <Frontpage path='/'/>
      <Login path='/login'/>
      <Itemlisting path='/listing'/>
      <Login path='/login'/>
      <Register path='/register'/>
      <Checkout path='/checkout'/>
      <Search path='/search/:input' search={search}/>
      <p path='/products/:id' className='asd'>nothing here</p>
      <div path='*'> <p>nice</p> </div>
   </Router> 
  </div>
  )
}

export default App