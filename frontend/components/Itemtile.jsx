import * as React from 'https://esm.sh/preact'
import { route } from 'https://esm.sh/preact-router'

const Itemtile = ({ img, name, price, id }) => {
    const hinta = (price / 100).toFixed(2)
    return (
        <div className='itemtile-main' onClick={() => route(`/product/${id}`)}>
            <div className='img-div'>
                <img src={img} alt='product img'></img>
            </div>
            <h5 style={{margin: '3px 0 0 0'}}>{name}</h5>
            <h6>{hinta}€</h6>
        </div>
    )
}

export default Itemtile