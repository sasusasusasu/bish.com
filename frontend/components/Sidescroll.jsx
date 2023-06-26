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
        let element = document.querySelector('.sidescroll-main')
        interval = setInterval(() => {
            element.scrollLeft += distance

            if (element.scrollWidth === element.clientWidth + element.scrollLeft) {
                distance = -distance
            }
            else if (element.scrollLeft === 0) {
                distance = -distance
            }
        }, 16) //a little over 60 times per second, (rip older pc's? idk.)
    }

    const items = new Array(20).fill({name: "product", id: 100, img: '../../assets/oj.jpg', price: 5000})

    useEffect(() => !interval && scrollFunc(), [])

    return (
        <div className='sidescroll-main'
        onWheel={e => handleScroll(e)}
        onmouseover={() => clearInterval(interval)}
        onmousemove={() => clearInterval(interval) /*very bad fix, but it works*/}
        onmouseleave={() => scrollFunc()}>

            {items.map(x => <SidescrollItem img={x.img} id={x.id} price={x.price} name={x.name}/>)}

        </div>
    )
}

export default Sidescroll