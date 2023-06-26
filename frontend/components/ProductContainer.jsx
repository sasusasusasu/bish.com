import * as React from 'https://esm.sh/preact';
import { useState } from 'https://esm.sh/preact/hooks'
import Itemtile from './Itemtile.js';
import PageNumbers from './PageNumbers.js';

const ProductContainer = ({ items }) => {

    const [page, setPage] = useState(1)
    
    const perPage = 40 //maybe the user can change this in future
    const startIndex = page * perPage - perPage

    return (
        <div>
            <div className='productcontainer'>
                {items.slice(startIndex, startIndex + perPage).map(x => <Itemtile img={x.img} id={x.id} price={x.price} name={x.name} />)}
            </div>
            <PageNumbers quantity={items.length} perPage={perPage} setPage={setPage}/>
        </div>
    )
}

export default ProductContainer