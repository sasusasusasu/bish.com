import * as React from "https://esm.sh/preact";
import Item from '../components/item.js'

export default function Checkout(){

    const [items, setItems] = React.useState([]) //We'll change the [] to data of items that are in your cart

    let Total = 0

    function GetTotal(){ //I assume this should work
        let Count = 0 //Start from 0
        items.map(item => Count = Count + item.value) 
        Total = Count //Change Total
    }

    function DeleteItem(id){ //Delete item from the items array (Should work?)
        setItems(old => {
            return old.filter(item => item.id !== id)
        })
    }

    const ItemElements = items.map(item => <Item value={item.value} name={item.name} pic={item.pic} key={item.id} desc={item.desc} delete={()=>DeleteItem(item.id)}/>)

    return(
        <div className="Main">
            <div className="Top">
                <img className="logo" src="../../assets/bish.png"/>
                <h1 className="Title">Checkout</h1>
            </div>
            <p className="IIYC">Items in Your Cart</p>
            <div className="Items">
                {items.length > 0 ? ItemElements : <p className='IIYC'>Your cart is empty!</p>}
            </div>
            <div className="Checkout-Info">
                <p id="Total">Total Price: <span className="Total">{Total}€</span></p>
                <button id="Proceed">Continue to Payment</button>
                <button id="Cancel">Cancel Order</button>
            </div>
        </div>
    )
}