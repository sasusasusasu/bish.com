import * as React from "https://esm.sh/preact";
import ProductContainer from '../components/ProductContainer.js'

const Profile = ({ /*img?, username, id?*/ }) => {
    const pfp = '../../assets/pfp.png' //place anything you want in here temporarily (pfp) 
    const username = 'very creative username'
                                                                                    //lidl orange juice
    const useritems = new Array(15).fill({name: 'product name', price: 500, img: '../../assets/oj.jpg', id: 500})
    
    //this could have some sort of state to see if the profile is user's own, which would display settings etc.

    return (
        <div className='profile-main'>
            {/*wip, it might not be so empty at the end hopefully*/}
            <div className='profile'>
                <div className='pfp-container'>
                    <img src={pfp} alt='profile picture'></img>
                </div>
                <div className='text'>
                    <h2>{username}</h2>
                    <p>other things idk?</p>
                    <p>AÄÄAÄAÄAÄAÄAÄAÄ</p>
                    <a>settings?</a>
                </div>  
            </div>
            <div className='viiva'></div>
            <h2 style={{margin: '0 0 30px 0'}}> {username}'s items </h2>
            <ProductContainer items={useritems}/>
        </div>
    )
}

export default Profile