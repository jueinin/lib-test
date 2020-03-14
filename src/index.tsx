import React, { useEffect } from 'react';
import { render } from 'react-dom';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './tailwind.css';
import './index.css';
import IndexPage from './pages/mainPage';
import { BrowserRouter, Route, Switch,useLocation } from 'react-router-dom';
import CacheRoute, { CacheSwitch } from 'react-router-cache-route';
import SearchInput from './pages/searchInput';
import SearchResultList from './pages/searchResultList';
import Forum from './pages/mainPage/forum';
import Me from './pages/mainPage/me';
import BookDetail from './pages/bookDetail';
import { rootStore, StoreProvider } from './model';
import { ask } from './util';
import { animated, useTransition } from 'react-spring';
import Animate from './pages/animate';

const App = () => {
    useEffect(() => {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
            ask('/api/getSessionId').then((value) => {
                localStorage.setItem('sessionId', value.data.sessionId);
            });
        }
    }, []);
    const location = useLocation();
    const transition = useTransition(location, (location) => location.pathname, {
        from: { opacity: 0, transform: 'translate3d(100%,0,0)' },
        enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
        leave: { display: 'none'},
    });
    return (
        <StoreProvider.Provider value={rootStore}>
            { /*
                // @ts-ignore */}
            {transition.map(({location,props,key}) => {
                    return <animated.div key={key} style={{
                        minHeight: '100vh',
                        ...props
                    }}>
                        <CacheSwitch location={location}>
                            <CacheRoute exact path={'/'}>
                                <IndexPage />
                            </CacheRoute>
                            <Route exact path={'/forum'}>
                                <Forum />
                            </Route>
                            <Route path={'/animate'}>
                                <Animate />
                            </Route>
                            <Route exact path={'/me'}>
                                <Me />
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
                        </CacheSwitch>
                    </animated.div>
                })}
        </StoreProvider.Provider>
    );
};
render(<BrowserRouter>
    <App/>
</BrowserRouter>, document.getElementById('root'));
