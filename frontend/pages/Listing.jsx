import * as React from "https://esm.sh/preact";

export default function Listing(){
    return(
        <div id='Listing'>
            <img id='Logo' src="../../assets/bish.png"/>
            <h1>Product Listing</h1>
            <div id='Listing-Info'>
                <div className='Info-Container'>
                    <p>Product Name</p>
                    <input type="txt" id='Product-Name' className="lbl txtinp" placeholder="Product Name"/>
                </div>
                <div className='Info-Container'>
                    <p>Product Picture(s)</p>
                    <input type='file' id='Product-Pic' className='lbl txtinp' multiple></input>
                </div>
                <div className='Info-Container'>
                    <p>Product Description</p>
                    <textarea id='Product-Desc'></textarea>
                </div>
                <div className='Info-Container'>
                    <p>Set Price ( € )</p>
                    <input type='number' id='Product-Price'></input>
                </div>
                <button id='Send' className='lbl'>Create Listing</button>
            </div>
        </div>
    )
}
