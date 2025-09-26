import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'

export default function Protected({children, authentication = true}) {

    const navigate = useNavigate()
    const [loader, setLoader] = useState(true)
    const authStatus = useSelector(state => state.auth.status)
    console.log("authStatus",authStatus)

    useEffect(() => {
    if(authStatus === false){
        return; 
    }

    if(authentication && authStatus===false){
        navigate("/login");
    } else if(!authentication && authStatus===true){
        navigate("/");
    }

    setLoader(false);
}, [authStatus, navigate, authentication]);



  return loader ? <h1>Loading...</h1> : <> {children} </>
}