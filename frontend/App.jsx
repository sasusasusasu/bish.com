import Router from 'https://esm.sh/preact-router'
import * as React from 'https://esm.sh/preact'
import { useState, useEffect } from 'https://esm.sh/preact/hooks'

import Navi from './components/Navi.js'
import Frontpage from './pages/Frontpage.js'
import Profile from './pages/Profile.js'
import Login from './pages/Login.js'
import Itemlisting from './pages/Listing.js'
import Products from './pages/products.js'
import Checkout from './pages/Checkout.js'
import Search from './pages/Search.js'
import Send from './pages/Send.js'
import ProductPage from './pages/ProductPage.js'

const items = [{name: 'very cool product', price: 123, seller: 123, picture: '../../assets/oj.jpg', id: 123}] //temp cart

const App = () => {

  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [loggedUser, setLoggedUser] = useState(543) //id

  useEffect(() => setCart([items[0], {...items[0], id: 124}]), []) //fetch later

  return (
   <div>
    <Navi search={ search } setSearch={ setSearch } items={cart} setItems={ setCart } loggedUser={loggedUser}/>
    <Router>
      <Send path='/frontend/html/index.html'/>
      <Frontpage path='/'/>
      <Login path='/login'/>
      <Itemlisting path='/listing'/>
      <Profile path='/profile/:id' loggedId={loggedUser}/>
      <Products path='/products'/>
      <Checkout path='/checkout'/>
      <Search path='/search/:input' search={search}/>
      <ProductPage path='/product/:id?'/>
   </Router>
  </div>
  )
}

export default App
