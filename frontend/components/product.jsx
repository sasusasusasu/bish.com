export default function Product(Props){

    return(
        <div className="Product">
            <img className="Product-Image" src={Props.img}/>
            <p className="Product-Name">{Props.name}</p>
            <p className="Product-Price">{Props.price} €</p>
        </div>
    )
}