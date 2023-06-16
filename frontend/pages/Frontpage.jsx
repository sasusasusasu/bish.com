import * as React from "https://esm.sh/preact"
import Sidescroll from '../components/Sidescroll.js'
import ProductContainer from "../components/ProductContainer.js"

const Frontpage = () => {
    const items = new Array(30).fill({id: 200, name: "product", price: 500, img: '../../assets/oj.jpg'})

    return (
        <div className='frontpage'>
            <h2>Products not recommended for anyone! (also this breaks sometimes, it should stop on hover)</h2>
            <Sidescroll />
            <div className='viiva'></div>
            <h2 style={{"margin": "40px 0"}}>Other products nobody should buy!</h2>
            <ProductContainer items={items}/>
            <p style={{textAlign: 'center', textDecoration: 'underline'}}>pages? or infinite scrolling? ¯\_(ツ)_/¯</p>
        </div>
    )
}

export default Frontpage