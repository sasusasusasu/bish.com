import { route } from 'https://esm.sh/preact-router' 
import * as React from 'https://esm.sh/preact'


const ItemInCart = ({ id, name, price, pic, setItems, items }) => {
    const url = `/product/${id}`

    return (
        <div className="item-in-cart-preview" key={id}>
            <a><img src={pic} alt='product image' onClick={() => route(url)}></img></a>
            <div className='info'>
                <p className='item-name' onClick={() => route(url)}>{name}</p>
                <p>{`Cost: ${(price / 100).toFixed(2)}€`}</p>
            </div>
            <img className='trash' 
            onClick={() => setItems(items.filter(y => y.id !== id))} 
            src='../../assets/trashcan.svg'
            alt='trash'>
            </img>
        </div>)
}

export default ItemInCart
