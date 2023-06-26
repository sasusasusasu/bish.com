import * as React from "https://esm.sh/preact";
import ProductContainer from '../components/ProductContainer.js'

const Profile = ({ id, loggedId }) => {
    const pfp = '../../assets/pfp.png'
    const username = 'very creative username'
                                                                                    //lidl orange juice
    const useritems = new Array(55).fill({name: 'product name', price: 500, img: '../../assets/oj.jpg', id: 500})
    id == loggedId && console.log('me :)')

    return (
        <div className='profile-main'>
            <div className='profile'>
                <div className='pfp-container'>
                    <img src={pfp} alt='profile picture'></img>
                </div>
                <div className='text'>
                    <h2>{username}</h2>
                    <p>location / other things idk?</p>
                    <p>{id}</p>
                </div>
                {loggedId && 
                <div className="settings">
                    <p className="settingslink" onClick={() => console.log('there are no settings :(')}>Settings &#9881;&#65039;</p>
                </div>}
            </div>
            <div className='viiva'></div>
            <h2 style={{margin: '0 0 30px 0'}}> {useritems.length ? `${username}'s items` : 'This user has no items'} </h2>
            <ProductContainer items={useritems}/>
        </div>
    )
}

export default Profile