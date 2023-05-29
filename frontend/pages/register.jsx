import React from 'react'
import Logo from '../assets/bish.png'
import '../css/register.css'

export default function Register(){

    return(
        <div className='Main'>
            <img className="logo" src={Logo}/>
            <input className="lbl txtinp" id='Username' type="txt" placeholder="Username"/>
            <input className="lbl txtinp" id='Password' type="password" placeholder="Password"/>
            <button id="Register" className="reg">Create Account</button>
            <p className="stxt acc">Already have an account? Sign in <a href="" className="log">here</a>.</p>
        </div>
    )
}