import * as React from "https://esm.sh/preact";

const Price = 300.25
const username = 'JaesusTheNotSoGreat'

export default function ProductPage(){

    const [quan, setQuan] = React.useState(0)

    function Add(){
        setQuan(quan+1)
    }

    function Substract(){
        if (quan >= 1){
            setQuan(quan-1)
        }
    }

    function FormatNum(Num){
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Num)
    }

    return(
        <div id='Container'>

            <div id='Product-Images'>
                <img id='Big-Pic' src=''/>
                <div id='Small-Pics'>
                    <img className='SImg'/>
                    <img className='SImg'/>
                    <img className='SImg'/>
                    <img className='SImg'/>
                    <img className='SImg'/>
                </div>
            </div>

            <div id='Product-Info'>
                <h1>Absolutely Epic Modern Art</h1>
                <p id='Seller'>Product Seller: <span id='UN'>@{username}</span></p>
                <h2>Highly detailed empty canvas, very expensive, very modern.</h2>
                <h3>{FormatNum(Price)}</h3>
                <div id='Purchase'>
                    <div id='AddToCart'>
                        <button id='Minus' onClick={Substract}>-</button>
                        <h2 id='Quantity'>{quan}</h2>
                        <button id='Plus' onClick={Add}>+</button>
                    </div>
                    <div id='Adder'>
                        <button id='Add'>Add to Cart</button>
                        <h2 id='TotalPrice'>Total Price: <span>{FormatNum(quan * Price)}</span></h2>
                    </div>
                </div>
            </div>

        </div>
    )
}