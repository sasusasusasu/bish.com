import React from 'react'
import Logo from '../assets/bish.png'
import '../css/checkout.css'
import Item from '../components/item'

export default function Checkout(){

    const [Items, setItems] = React.useState()

    const Elements = items.map(el => <Item/>)

    return(
        <div className="Main">
            <div className="Top">
                <img className="logo" src={Logo}/>
                <h1 className="Title">Checkout</h1>
            </div>
            <p className="IIYC">Items in Your Cart</p>
            <div className="Items">
                
            </div>
            <div className="Checkout-Info">
                <p id="Total">Total Price: <span className="Total">499,96€</span></p>
                <button id="Proceed">Continue to Payment</button>
                <button id="Cancel">Cancel Order</button>
            </div>
        </div>
    )
}