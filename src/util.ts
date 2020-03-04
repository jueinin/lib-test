import {createBrowserHistory} from 'history';
import Axios from 'axios'
import {useEffect, useRef, useState} from "react";
export const browserHistory = createBrowserHistory();
const sessionId=localStorage.getItem('sessionId')
export const ask = Axios.create({
    headers: {
        // auth: sessionId
    }
});

export const useStateWithSameRef = <T=undefined>(value: T) => {
    const [state,setState] = useState<T>(value);
    const ref = useRef(state);
    useEffect(() => {
        ref.current = state;
    }, [state]);
    return [state, setState, ref] as const;
    // must return ref, other than ref.current.
    // because ref is a object,and ref.current is a primitive data.
    // primitive data will be treated as constant value,can be directly replaced in rerender
};
export const withObservable=()=>{

}

