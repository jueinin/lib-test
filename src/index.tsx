import React, { useEffect, Suspense } from 'react';
import { render } from 'react-dom';
import './tailwind.css';
import './index.css';
import { BrowserRouter, Route, Switch, useLocation, useHistory } from 'react-router-dom';
import { rootStore, StoreProvider, useStore } from './model';
import { ask } from './util';
import {ReactQueryConfigProvider} from "react-query";
import App from './App';


export const TestWrapper:React.FC = (props)=>{
    const history = useHistory();
    const { userStore } = useStore();
    useEffect(() => {
        (window as any).browserHistory = history;
        ask({
            url: `/api/isLogin`,
        }).then((value) => {
            if (value.data.status) {
                userStore.getUserData();
            }
        });
    }, []);
    return <React.Fragment>
        {props.children}
    </React.Fragment>
}
export const Wrapper:React.FC = (props)=> {
    return <BrowserRouter>
        <StoreProvider.Provider value={rootStore}>
            <ReactQueryConfigProvider config={{refetchOnWindowFocus: true}}>
                <TestWrapper>
                    {props.children}
                </TestWrapper>
            </ReactQueryConfigProvider>
        </StoreProvider.Provider>
    </BrowserRouter>
}
render(
    <Wrapper>
        <App/>
    </Wrapper>,
    document.getElementById('root')
);
