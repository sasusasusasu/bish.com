export default function Item(Props){

    return(
        <div class="Item">
            <div class="Img">
                <img class="Item-Image" src={Props.pic}/>
            </div>
            <div class="Item-Info">
                <p class="Name">{Props.name}<span>{Props.value}</span></p>
                <p class="Desc">{Props.desc}</p>
            </div>
            <img class="Delete" onClick={Props.delete} src="../assets/trashcan.svg" title="Delete Item"/>
        </div>
    )
}
