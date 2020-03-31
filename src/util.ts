import { createBrowserHistory } from 'history';
import Axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import * as R from 'ramda';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, tap, throttleTime } from 'rxjs/operators';
import { Toast } from './components/Toast';
export const browserHistory = createBrowserHistory();
export const ask = Axios.create({});
export const defaultAvatar = 'https://jueinin.oss-cn-hongkong.aliyuncs.com/%E5%B0%8F%E7%A8%8B%E5%BA%8F/%E9%BB%98%E8%AE%A4%E5%A4%B4%E5%83%8F.jpg';
ask.interceptors.response.use(
    (res) => {
        return res;
    },
    (error) => {
        if (error.response.status === 403) {
            (window as any).browserHistory.push('/login');
            Toast.info('请先登录再查看该页面');
        }
        return Promise.reject(error);
    }
);

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
    return source$.pipe(tap((value) => console.log(value, ...message)));
};
export const isEmail = (value: string) => {
    return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
};
export const isPhoneNumber = (value: string) => /^(?:(?:\+|00)86)?1[3-9]\d{9}$/.test(value);
