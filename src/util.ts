import { createBrowserHistory } from 'history';
import Axios from 'axios';
import { useEffect, useRef, useState } from 'react';
export const browserHistory = createBrowserHistory();
const sessionId = localStorage.getItem('sessionId');
import * as R from 'ramda';
import { Observable } from 'rxjs';
import {distinctUntilChanged, filter, map, tap, throttleTime} from 'rxjs/operators';
export const ask = Axios.create({
    headers: {
        auth: sessionId
    },
});

export const useStateWithSameRef = <T = undefined>(value: T) => {
    const [state, setState] = useState<T>(value);
    const ref = useRef(state);
    useEffect(() => {
        ref.current = state;
    }, [state]);
    return [state, setState, ref] as const;
    // must return ref, other than ref.current.
    // because ref is a object,and ref.current is a primitive data.
    // primitive data will be treated as constant value,can be directly replaced in rerender
};
export const withObservable = () => {};
export const pipeFrom = (data: any, ...fns) => {
    // @ts-ignore
    return R.pipe(...fns)(data);
};
export const whenReachBottom = (id?: string) => <T>(source$: Observable<T>) => {
    return source$.pipe(
        throttleTime(150),
        map(() => {
            const element = id ? document.getElementById(id) : document.body;
            return element.scrollHeight - element.clientHeight - element.scrollTop < 150;
        }),
        distinctUntilChanged(),
        filter(R.identity)
    );
};
export const log = (...message: string[]) => <T>(source$: Observable<T>) => {
    return source$.pipe(tap(value => console.log(value, ...message)));
};
