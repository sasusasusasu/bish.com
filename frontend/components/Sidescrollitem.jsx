import * as React from 'https://esm.sh/preact'
import { route } from 'https://esm.sh/preact-router'

const SidescrollItem = ({ id, name, price, img }) => {

    const hinta = (price / 100).toFixed(2)

    return (
        <div className='sidescrollitem' onClick={() => route(`/product/${id}`)}>
            <div className='nametag tag'><p>{name}</p></div>
            <div className='pricetag tag'><p>{`${hinta}€`}</p></div>
            <img src={img} alt='p'></img>
        </div>
    )
}

export default SidescrollItem