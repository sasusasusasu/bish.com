import { route } from 'https://esm.sh/preact-router@4.1.1' 
import * as React from 'https://esm.sh/preact'


const ItemInCart = ({ id, name, price, pic, setItems, items }) => {
    const url = `/products/${ id }`
    return (
        <div className="item-in-cart-preview" key={id}>
            <a><img src={pic} alt='product image' onClick={() => route(`/products/${id}`)}></img></a>
            <div className='info'>
                <p>{name}</p>
                <p>{`Cost: ${(price / 100).toFixed(2)}€`}</p>
            </div>
            <p className="trash" onClick={() => setItems(items.filter(y => y.id !== id))}> &#128465; </p>
        </div>)
}
// 
export default ItemInCart