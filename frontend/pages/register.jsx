import * as React from "https://esm.sh/preact";

export default function Register(){

    return(
        <div>
            <img className="logo" src="../../assets/bish.png"/>
            <input className="lbl txtinp" id='Username' type="txt" placeholder="Username"/>
            <input className="lbl txtinp" id='Password' type="password" placeholder="Password"/>
            <button id="Register" className="reg">Create Account</button>
            <p className="stxt acc">Already have an account? Sign in <a href="./index.html" className="log">here</a>.</p>
        </div>
    )
}
