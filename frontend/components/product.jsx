export default function Product(Props){

    return(
        <div class="Product">
            <img class="Product-Image" src={Props.img}/>
            <p class="Product-Name">{Props.name}</p>
            <p class="Product-Price">{Props.price} €</p>
        </div>
    )
}