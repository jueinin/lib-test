import { createBrowserHistory } from 'history';
import Axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import ReactDom from 'react-dom';
import * as R from 'ramda';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, tap, throttleTime } from 'rxjs/operators';
import { Toast } from './components/Toast';
import { EventEmitter } from 'events';
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
        throttleTime(100),
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

export const eventEmitter = new EventEmitter();

/**
 * @description 监听一个事件并且自动销毁
 * @param eventName
 * @param callback
 */
export const useEventEmitter = (eventName: string, callback: any) => {
    useEffect(() => {
        eventEmitter.on(eventName, callback);
        return () => {
            eventEmitter.removeListener(eventName, callback);
        };
    }, []);
};

export const debounceAsync = (fn: (...args: any[]) => Promise<any>, defaultValue, wait) => {
    let timer;
    return (...args) => {
        return new Promise((resolve, reject) => {
            //
            if (timer) {
                resolve(defaultValue);
                clearTimeout(timer);
                timer = null;
                return;
            }
            clearTimeout(timer);
            timer = null;
            timer = setTimeout(() => {
                fn(...args).then((value) => {
                    timer = null;
                    resolve(value);
                });
            }, wait);
        });
    };
};
export const useReachBottom = (element: HTMLElement, callback) => {
    // 监听元素滚动到底部
    useEffect(() => {
        if (!element) {
            return;
        }
        const listener = (ev) => {
            const isBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 130;
            if (isBottom) {
                callback();
            }
        };
        element.addEventListener('scroll', listener);
        return () => element.removeEventListener('scroll', listener);
    }, [element]);
};

export function useInterval(callback: () => void, delay: number | null | false, immediate?: boolean) {
    const savedCallback = useRef(() => {});
    useEffect(() => {
        savedCallback.current = callback;
    });
    useEffect(() => {
        if (!immediate) return;
        if (delay === null || delay === false) return;
        savedCallback.current();
    }, [immediate]);
    useEffect(() => {
        if (delay === null || delay === false) return undefined;
        const tick = () => savedCallback.current();
        const id = setInterval(tick, delay);
        return () => clearInterval(id);
    }, [delay]);
}
