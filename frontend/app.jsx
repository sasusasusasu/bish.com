import Router from 'https://esm.sh/preact-router@4.1.1'
import * as React from "https://esm.sh/preact";
import { useState, useEffect } from "https://esm.sh/preact/hooks";

import Navi from './components/Navi.js'
import Frontpage from './pages/Frontpage.js'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Itemlisting from './pages/Listing.jsx'
import Catalog from './pages/Catalog.js'
import Checkout from './pages/Checkout.jsx'
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
      <Catalog path='/catalog'/>
      <Checkout path='/checkout'/>
      <Search path='/search/:input' search={search}/>
      <p path='/products/:id' className='asd'>nothing here</p>
      <div path='*'> <p>nice</p> </div>
   </Router> 
  </div>
  )
}

export default App