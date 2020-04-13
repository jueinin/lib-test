import React, { useEffect, Suspense } from 'react';
import { render } from 'react-dom';
import './tailwind.css';
import './index.css';
import IndexPage from './pages';
import { BrowserRouter, Route, Switch, useLocation, useHistory } from 'react-router-dom';
import SearchInput from './pages/searchInput';
import SearchResultList from './pages/searchResultList';
import Forum from './pages/forum';
import Me from './pages/me';
import BookDetail from './pages/BookDetail';
import { rootStore, StoreProvider, useStore } from './model';
import { ask } from './util';
import { animated, useTransition } from 'react-spring';
import Animate from './pages/animate';
import Login from './pages/login';
import SignUp from './pages/signUp';
import BrowserHistory from './pages/BrowserHistory';
import MyFavorite from './pages/myFavorite';
import ShoppingCart from './pages/shoppingCart';
import ConfirmOrder from './pages/confirmOrder';
import AddAddress from './pages/addAddress';
import Order from './pages/order';
import Comment from './pages/comment';
import PosterAdd from './pages/posterAdd';
import PostDetail from './pages/postDetail';
import CacheRoute, { CacheSwitch } from 'react-router-cache-route';
import AddressList from './pages/addresssList';
import EditProfile from './pages/editProfile';
import {ReactQueryConfigProvider} from "react-query";
// if (navigator.serviceWorker) {
//     navigator.serviceWorker.register('/service-worker.js');
// }
const App = () => {
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
    const location = useLocation();
    const transition = useTransition(location, (location) => location.pathname, {
        from: { opacity: 0, transform: 'translate3d(100%,0,0)' },
        enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
        leave: { display: 'none' },
    });
    return (
        <div className="w-full">
            <CacheSwitch>
                <CacheRoute exact path={['/', '/index']}>
                    <IndexPage />
                </CacheRoute>
                <CacheRoute exact path={'/me'}>
                    <Me />
                </CacheRoute>
                <CacheRoute exact path={'/forum'}>
                    <Forum />
                </CacheRoute>
                <CacheRoute path={'/browserHistory'}>
                    <BrowserHistory />
                </CacheRoute>
                <CacheRoute path={'/bookDetail'}>
                    <BookDetail />
                </CacheRoute>
                <CacheRoute path={'/favorites'}>
                    <MyFavorite />
                </CacheRoute>
                <CacheRoute path={'/shoppingCart'}>
                    <ShoppingCart />
                </CacheRoute>
                <CacheRoute path={'/animate'}>
                    <Animate />
                </CacheRoute>
                <CacheRoute exact path={'/searchInput'}>
                    <SearchInput />
                </CacheRoute>
                <CacheRoute exact path={'/searchResultList'}>
                    {/*params=keyword*/}
                    <SearchResultList />
                </CacheRoute>
                <CacheRoute path={'/login'}>
                    <Login />
                </CacheRoute>
                <CacheRoute path={'/signUp'}>
                    <SignUp />
                </CacheRoute>
                <CacheRoute path={'/confirmOrder'}>
                    {/*from: buy =  点击购买，*/}
                    {/*from: shoppingCart = 购物车购买*/}
                    {/*bookId: 点击购买的书籍id*/}
                    <ConfirmOrder />
                </CacheRoute>
                <CacheRoute path={['/addAddress', '/editAddress']}>
                    <AddAddress />
                </CacheRoute>
                <CacheRoute path={'/order'}>
                    <Order />
                </CacheRoute>
                <CacheRoute path={'/comment'}>
                    <Comment />
                </CacheRoute>
                <CacheRoute path={'/posterAdd'}>
                    <PosterAdd />
                </CacheRoute>
                <CacheRoute path={'/postDetail'}>
                    <PostDetail />
                </CacheRoute>
                <Route path={'/addressList'}>
                    <AddressList />
                </Route>
                <Route path={'/editProfile'}>
                    <EditProfile />
                </Route>
            </CacheSwitch>
        </div>
    );
};
render(
    <BrowserRouter>
        <StoreProvider.Provider value={rootStore}>
            <ReactQueryConfigProvider config={{refetchOnWindowFocus: false}}>
                <App/>
            </ReactQueryConfigProvider>
        </StoreProvider.Provider>
    </BrowserRouter>,
    document.getElementById('root')
);
