import * as React from 'https://esm.sh/preact'

export default function Checkout(){
    
    return(
        <div className='flexwindow'>
            <div className="checkout-Main">
                <div className="Top">
                    <img className="logo" src=''/>
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
        </div>
        
    )
}