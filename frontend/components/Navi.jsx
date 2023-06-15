import Cart from './Cart-preview.js'
import { route } from 'https://esm.sh/preact-router@4.1.1'
import * as React from "https://esm.sh/preact";

const Navi = ({ search, setSearch, items, setItems }) => {

  const goSearch = (e) => { 
    if (e.key === 'Enter') {
      if (!search) route('/');
      else route(`/search/${search}`)

      document.querySelector('input').blur()
  }}

  return (
  <div className='navi-main'>
    <div className="navi">
      <a><img src='../../assets/bish.png' alt="bish" className='logo' onClick={() => route('/')}></img></a>
      <p onClick={() => route('/catalog')}> Catalog </p> 
      <p onClick={() => route('/listing')}> List Items </p> 
      <p onClick={() => route('/login')}> Profile </p>
      <input value={search} onInput={e => setSearch(e.target.value)} placeholder='Search' onKeyDown={e => goSearch(e)}></input>
      <p className='cart' onClick={() => document.querySelector('.cart-preview').classList.toggle('hidden') }> &#128722;</p>
    </div>
    <Cart items={items} setItems={setItems}/>
  </div>
  )}

export default Navi