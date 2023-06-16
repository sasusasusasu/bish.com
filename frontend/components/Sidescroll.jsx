import * as React from 'https://esm.sh/preact'
import { useEffect } from 'https://esm.sh/preact/hooks'
import SidescrollItem from './Sidescrollitem.js'

const Sidescroll = () => {
    
    let distance = 1
    var interval; //bad

    //makes vertical scrolling into horizontal
    const handleScroll = e => {
        e.preventDefault()
        document.querySelector('.sidescroll-main').scrollLeft += e.wheelDelta / 3
    }

    //this feels stupid lol
    const scrollFunc = () => {
        const element = document.querySelector('.sidescroll-main')
        interval = setInterval(() => {
            element.scrollLeft += distance

            if (element.scrollWidth === element.clientWidth + element.scrollLeft) {
                distance = -distance
            }
            else if (element.scrollLeft === 0) {
                distance = -distance
            }
        }, 16) //a little over 60 times per second, (rip older pc's? idk.)
        //this also breaks sometimes for some reason, going to fix later (probably)
    }

    const items = new Array(20).fill({name: "product", id: 100, img: '../../assets/oj.jpg', price: 5000})

    useEffect(() => scrollFunc(), [])

    return (
        <div className='sidescroll-main' 
        onWheel={e => handleScroll(e)}
        onmouseenter={() => clearInterval(interval)} 
        onmouseleave={() => scrollFunc()}>

            {items.map(x => <SidescrollItem img={x.img} id={x.id} price={x.price} name={x.name}/>)}

        </div>
    )
}

export default Sidescroll