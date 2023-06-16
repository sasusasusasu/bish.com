import * as React from 'https://esm.sh/preact'
import { route } from 'https://esm.sh/preact-router'

const SidescrollItem = ({ id, name, price, img }) => {

    return (
        <div className='sidescrollitem' onClick={() => route(`/products/${id}`)}>
            <div className='nametag tag'><p>{name}</p></div>
            <div className='pricetag tag'><p>{`${price}€`}</p></div>
            <img src={img} alt='product'></img>
        </div>
    )
}

export default SidescrollItem