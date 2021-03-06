import IndexPage from './pages';
import Me from './pages/me';
import Forum from './pages/forum';
import BrowserHistory from './pages/BrowserHistory';
import BookDetail from './pages/BookDetail';
import MyFavorite from './pages/myFavorite';
import ShoppingCart from './pages/shoppingCart';
import Animate from './pages/animate';
import SearchInput from './pages/searchInput';
import SearchResultList from './pages/searchResultList';
import Login from './pages/login';
import SignUp from './pages/signUp';
import ConfirmOrder from './pages/confirmOrder';
import AddAddress from './pages/addAddress';
import { Route } from 'react-router-dom';
import Order from './pages/order';
import Comment from './pages/comment';
import PosterAdd from './pages/posterAdd';
import PostDetail from './pages/postDetail';
import AddressList from './pages/addresssList';
import EditProfile from './pages/editProfile';
import React from 'react';
import CacheRoute, { CacheSwitch } from 'react-router-cache-route/index';

const App: React.FC = () => {
    return (
        <div className="w-full">
            <CacheSwitch>
                <CacheRoute exact path={['/', '/index']}>
                    <IndexPage/>
                </CacheRoute>
                <CacheRoute exact path={'/me'}>
                    <Me/>
                </CacheRoute>
                <CacheRoute exact path={'/forum'}>
                    <Forum/>
                </CacheRoute>
                <CacheRoute path={'/browserHistory'}>
                    <BrowserHistory/>
                </CacheRoute>
                <CacheRoute path={'/bookDetail'}>
                    <BookDetail/>
                </CacheRoute>
                <CacheRoute path={'/favorites'}>
                    <MyFavorite/>
                </CacheRoute>
                <CacheRoute path={'/shoppingCart'}>
                    <ShoppingCart/>
                </CacheRoute>
                <CacheRoute path={'/animate'}>
                    <Animate/>
                </CacheRoute>
                <CacheRoute exact path={'/searchInput'}>
                    <SearchInput/>
                </CacheRoute>
                <CacheRoute exact path={'/searchResultList'}>
                    {/*params=keyword*/}
                    <SearchResultList/>
                </CacheRoute>
                <CacheRoute path={'/login'}>
                    <Login/>
                </CacheRoute>
                <CacheRoute path={'/signUp'}>
                    <SignUp/>
                </CacheRoute>
                <CacheRoute path={'/confirmOrder'}>
                    {/*from: buy =  点击购买，*/}
                    {/*from: shoppingCart = 购物车购买*/}
                    {/*bookId: 点击购买的书籍id*/}
                    <ConfirmOrder/>
                </CacheRoute>
                <CacheRoute path={['/addAddress', '/editAddress']}>
                    <AddAddress/>
                </CacheRoute>
                <Route path={'/order'}>
                    <Order/>
                </Route>
                <CacheRoute path={'/comment'}>
                    <Comment/>
                </CacheRoute>
                <CacheRoute path={'/posterAdd'}>
                    <PosterAdd/>
                </CacheRoute>
                <CacheRoute path={'/postDetail'}>
                    <PostDetail/>
                </CacheRoute>
                <Route path={'/addressList'}>
                    <AddressList/>
                </Route>
                <Route path={'/editProfile'}>
                    <EditProfile/>
                </Route>
            </CacheSwitch>
        </div>
    );
};
export default App