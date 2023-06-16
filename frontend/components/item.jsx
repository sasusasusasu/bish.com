import * as React from 'https://esm.sh/preact'

export default function Item(props){

    return(
        <div class="Item">
            <div class="Img">
                <img class="Item-Image" src={props.pic}/>
            </div>
            <div class="Item-Info">
                <p class="Name">{props.name}<span>{props.value}</span></p>
                <p class="Desc">{props.desc}</p>
            </div>
            <img class="Delete" onClick={props.delete} src="../assets/trashcan.svg" title="Delete Item"/>
        </div>
    )
}