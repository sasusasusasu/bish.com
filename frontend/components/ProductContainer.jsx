import * as React from 'https://esm.sh/preact';
import Itemtile from './Itemtile.js';

const ProductContainer = ({ items }) => {
    return (
        <div className='productcontainer'>
            {items.map(x => <Itemtile img={x.img} id={x.id} price={x.price} name={x.name}/>)}
        </div>
    )
}

export default ProductContainer