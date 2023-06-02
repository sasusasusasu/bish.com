import React from 'react'
import Logo from '../assets/bish.png'
import '../css/listing.css'

export default function Listing(){
    return(
        <div id='Listing'>
            <img id='Logo' src={Logo}/>
            <h1>Listing</h1>
            <div id='Listing-Info'>
                <p>Choose a Name for Your Product</p>
                <input type="txt" id='Product-Name' className="lbl txtinp" placeholder="Product Name"/>
                <p>Choose a Picture for Your Product</p>
                <input type='file' id='Product-Pic' className='lbl txtinp' placeholder='Choose a Picture for Your Product'></input>
                <p>Write a Description</p>
                <input type='txt' id='Product-Desc' className='lbl txtinp' placeholder="Product Description"></input>
            </div>
        </div>
    )
}