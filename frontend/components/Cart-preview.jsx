import { route } from 'https://esm.sh/preact-router'
import ItemInCart from './ItemInCart.js'
import * as React from "https://esm.sh/preact";

const Cart = ({ items, setItems }) => {
    return (
        <div className="cart-preview hidden">
            <h2 className="your-items">Your items</h2>           
            {
                items.length ? 
                items.map(x => <ItemInCart id={x.id} price={x.price} name={x.name} pic={x.picture} setItems={setItems} items={items} key={x.id}/>)
                : 
                <h3 className="no-items">No items.</h3> 
            }    
            <div className="cart-preview-bottom">
                <p className="total">{`Total: ${(items.reduce((x, y) => x + Number(y.price), 0) / 100).toFixed(2)}€`}</p>
                { items.length > 0 && <a onClick={() => route('/checkout')}>Checkout now</a> }
            </div>
        </div>
    )
}

export default Cart