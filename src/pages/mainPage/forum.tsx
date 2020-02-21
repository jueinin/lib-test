import React, {useEffect, useRef, useState} from 'react';
import BottomBar from "../../components/bottomBar";
import {useStateWithSameRef} from "../../util";
const Forum:React.FC=()=>{
    const [count, setCount, refCount] = useStateWithSameRef(0);
    const onClick = () => {
        setCount(count + 1);
        console.log('onClick');
    };
    console.log('render');
    return <div>
        <div className="mb-16">forum</div>
        <button onClick={onClick}>add</button>
        <BottomBar currentValue="/forum"/>
    </div>
}
export default Forum;
