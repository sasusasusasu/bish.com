import * as React from 'https://esm.sh/preact'
import ProductContainer from '../components/ProductContainer.js'

const Search = ({ input }) => {
    const fakeSearchResults = new Array(45).fill({name: 'product name', price: 500, img: '../../assets/oj.jpg', id: 500})
    return (
        <div className='searchcontainer'>
            {fakeSearchResults.length ?
                <div>
                    <h2>search results for: "{input}"</h2>
                    <ProductContainer items={fakeSearchResults} />
                </div>
                :
                <h3>No items found for {input}</h3>}
        </div>
    )
}

export default Search