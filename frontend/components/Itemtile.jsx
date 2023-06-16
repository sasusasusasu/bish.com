import * as React from 'https://esm.sh/preact'
import { route } from 'https://esm.sh/preact-router'

const Itemtile = ({ img, name, price, id }) => {

    return (
        <div className='itemtile-main' onClick={() => route(`/products/${id}`)}>
            <div className='img-div'>
                <img src={img} alt='product image'></img>
            </div>
            <h5>{name}</h5>
            <h6>{price}€</h6>
        </div>
    )
}

export default Itemtile