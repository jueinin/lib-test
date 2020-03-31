import React, { useEffect } from 'react';
import { render } from 'react-dom';
import './tailwind.css';
import './index.css';
import IndexPage from './pages/mainPage';
import { BrowserRouter, Route, Switch, useLocation, useHistory } from 'react-router-dom';
import SearchInput from './pages/searchInput';
import SearchResultList from './pages/searchResultList';
import Forum from './pages/mainPage/forum';
import Me from './pages/mainPage/me';
import BookDetail from './pages/bookDetail';
import { rootStore, StoreProvider, useStore } from './model';
import { ask } from './util';
import { animated, useTransition } from 'react-spring';
import Animate from './pages/animate';
import Login from './pages/login';
import SignUp from './pages/signUp';
import BrowserHistory from './pages/BrowserHistory';
import MyFavorite from './pages/myFavorite';
import ShoppingCart from './pages/shoppingCart';
import ConfirmOrder from "./pages/confirmOrder";
import AddAddress from "./pages/addAddress";
import Order from "./pages/order";
import Comment from "./pages/comment";
import PosterAdd from "./pages/posterAdd";
import PostDetail from "./pages/postDetail";
const Test: React.FC = (props) => {
    console.log(React.Children.count(props.children), 'children count', React.Children.toArray(props.children));
    return <div>{props.children}</div>;
};
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
        leave: { display: 'none'},
    });
    return (
        <div className="w-full">
                {transition.map((value) => {
                    return (
                        <animated.div
                            key={value.key}
                            style={{
                                minHeight: '100vh',
                                ...value.props,
                            }}
                        >
                            <Switch location={value.item}>
                                <Route exact path={'/'} component={IndexPage}/>
                                <Route exact path={'/me'}>
                                    <Me />
                                </Route>
                                <Route exact path={'/forum'}>
                                    <Forum />
                                </Route>
                                <Route path={'/browserHistory'}>
                                    <BrowserHistory />
                                </Route>
                                <Route path={'/bookDetail'}>
                                    <BookDetail />
                                </Route>
                                <Route path={'/favorites'}>
                                    <MyFavorite />
                                </Route>
                                <Route path={'/shoppingCart'}>
                                    <ShoppingCart />
                                </Route>
                                <Route path={'/animate'}>
                                    <Animate />
                                </Route>
                                <Route exact path={'/searchInput'} component={SearchInput}/>
                                <Route exact path={'/searchResultList'}>
                                    {/*params=keyword*/}
                                    <SearchResultList />
                                </Route>
                                <Route path={'/login'}>
                                    <Login />
                                </Route>
                                <Route path={'/signUp'}>
                                    <SignUp />
                                </Route>
                                <Route path={'/confirmOrder'}>
                                    {/*from: buy =  点击购买，*/}
                                    {/*from: shoppingCart = 购物车购买*/}
                                    {/*bookId: 点击购买的书籍id*/}
                                    <ConfirmOrder/>
                                </Route>
                                <Route path={'/addAddress'}>
                                    <AddAddress/>
                                </Route>
                                <Route path={'/order'}>
                                    <Order/>
                                </Route>
                                <Route path={'/comment'}>
                                    <Comment/>
                                </Route>
                                <Route path={'/posterAdd'}>
                                    <PosterAdd/>
                                </Route>
                                <Route path={'/postDetail'}>
                                    <PostDetail/>
                                </Route>
                            </Switch>
                        </animated.div>
                    );
                })}
        </div>
    );
};
render(
    <BrowserRouter>
        <StoreProvider.Provider value={rootStore}>
            <App />
        </StoreProvider.Provider>
    </BrowserRouter>,
    document.getElementById('root')
);
