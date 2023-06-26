import * as React from "https://esm.sh/preact"
import Sidescroll from '../components/Sidescroll.js'
import ProductContainer from "../components/ProductContainer.js"

const Frontpage = () => {
    //temp items
    const aitems = new Array(100).fill({id: 200, name: "product", price: 500, img: '../../assets/oj.jpg'})
    aitems.push({name: 'last product', id: 5000, price: 3242, img: ''})
    const items = [{name: 'first?', id: 21312, price: 234, img: ''}].concat(aitems)

    return (
        <div className='frontpage'>
            <h2>Products not recommended for anyone!</h2>
            <Sidescroll />
            <div className='viiva'></div>
            <h2 style={{"margin": "40px 0"}}>Other products nobody should buy!</h2>
            <ProductContainer items={items}/>
        </div>
    )
}

export default Frontpage