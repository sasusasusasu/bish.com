import * as React from "https://esm.sh/preact";
import Product from '../components/product.js'

const TemporaryNew = [
    {
        id: 1,
        name: 'Epic New Shoes',
        price: 32.50,
        img: ''
    },
]

const TemporaryUsed = [
    {
        id: 1,
        name: 'Unepic Used Shoes',
        price: 1.25,
        img: ''
    }
]

export default function Products(){

    const [prods, setProds] = useState(false) //false = new products, true = old products

    const NewProducts = TemporaryNew.map(obj => 
            <Product
                key={obj.id}
                name={obj.name}
                price={obj.price}
                img={obj.img}
            />)

    const UsedProducts = TemporaryUsed.map(obj =>
            <Product
                key={obj.id}
                name={obj.name}
                price={obj.price}
                img={obj.img}
            />)

    function Toggle(status){
        setProds(status)
    }

    return(
    <div>
        <div class="Section">
            <button class="Btn Chosen" onClick={Toggle(false)} id="New">New Products</button>
            <button class="Btn" onClick={Toggle(true)} id="Used">Used Products</button>
        </div>

        {prods ?
            <div id="Used-Products">
                <UsedProducts/>
            </div>
            :
            <div id="New-Products">
                <NewProducts/>
            </div>}
    </div>
    )
}
