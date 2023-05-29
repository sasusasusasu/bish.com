import React from 'react'
import Logo from '../assets/bish.png'
import '../css/login.css'

export default function Login(){

    return(
        <div className="bl login">
            <img className="logo" src={Logo}/>
            <input type="txt" id='Username' className="lbl txtinp" placeholder="Username"/>
            <input type="password" id='Password' className="lbl txtinp" placeholder="Password"/>
            <button id="Login" className="loginbutton">Log In</button>
            <p className="stxt noacc">Don't have an account? Register <a href="./register.html" className="reg nobg">here</a>.</p>
        </div>
    )
}