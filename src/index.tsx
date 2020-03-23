import React, { useEffect } from 'react';
import { render } from 'react-dom';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './tailwind.css';
import './index.css';
import IndexPage from './pages/mainPage';
import {BrowserRouter, Route, Switch, useLocation, useHistory} from 'react-router-dom';
import CacheRoute, { CacheSwitch } from 'react-router-cache-route';
import SearchInput from './pages/searchInput';
import SearchResultList from './pages/searchResultList';
import Forum from './pages/mainPage/forum';
import Me from './pages/mainPage/me';
import BookDetail from './pages/bookDetail';
import {rootStore, StoreProvider, useStore} from './model';
import { ask } from './util';
import { animated, useTransition } from 'react-spring';
import Animate from './pages/animate';
import Login from './pages/login';
import SignUp from "./pages/signUp";

const App = () => {
    const history = useHistory();
    const {userStore} = useStore();
    useEffect(() => {
        (window as any).browserHistory = history;
        ask({
            url: `/api/isLogin`
        }).then(value => {
            if (value.data.status) {
                userStore.getUserData();
            }
        })
    }, []);
    const location = useLocation();
    const transition = useTransition(location, (location) => location.pathname, {
        from: { opacity: 0, transform: 'translate3d(100%,0,0)' },
        enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
        leave: { opacity: 1 },
    });
    return (

            <CacheSwitch location={location}>
                <CacheRoute exact path={'/'}>
                    <IndexPage />
                </CacheRoute>
                <Route exact path={'/me'}>
                    <Me />
                </Route>
                <Route exact path={'/forum'}>
                    <Forum />
                </Route>
                {transition.map(({ props, key }) => {
                    return (
                        <animated.div
                            key={key}
                            style={{
                                minHeight: '100vh',
                                ...props,
                            }}
                        >
                            <Route path={'/animate'}>
                                <Animate />
                            </Route>
                            <Route exact path={'/searchInput'}>
                                <SearchInput />
                            </Route>
                            <Route exact path={'/searchResultList'}>
                                {/*params=keyword*/}
                                <SearchResultList />
                            </Route>
                            <Route path={'/bookDetail'}>
                                <BookDetail />
                            </Route>
                            <Route path={'/login'}>
                                <Login />
                            </Route>
                            <Route path={'/signUp'}>
                                <SignUp/>
                            </Route>
                        </animated.div>
                    );
                })}
            </CacheSwitch>
    );
};
render(
    <BrowserRouter>
        <StoreProvider.Provider value={rootStore}>
            <App/>
        </StoreProvider.Provider>
    </BrowserRouter>,
    document.getElementById('root')
);
