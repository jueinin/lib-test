import React from 'react'
import { render } from 'react-dom'

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './tailwind.css';
import './index.css'
import IndexPage from "./pages/mainPage";
import {BrowserRouter,Route} from 'react-router-dom'
import CacheRoute, {CacheSwitch} from "react-router-cache-route";
import SearchInput from "./pages/searchInput";
import SearchResultList from "./pages/searchResultList";
import Forum from "./pages/mainPage/forum";
import Me from "./pages/mainPage/me";
import BookDetail from "./pages/bookDetail";
import {rootStore, StoreProvider} from "./model";

render(
    <StoreProvider.Provider value={rootStore}>
        <BrowserRouter>
            <CacheSwitch>
                <CacheRoute exact path={"/"}>
                    <IndexPage/>
                </CacheRoute>
                <Route exact path={"/forum"}>
                    <Forum/>
                </Route>
                <Route exact path={"/me"}>
                    <Me/>
                </Route>
                <CacheRoute exact path={'/searchInput'}>
                    <SearchInput/>
                </CacheRoute>
                <CacheRoute exact path={'/searchResultList'}> {/*params=keyword*/}
                    <SearchResultList/>
                </CacheRoute>
                <CacheRoute path={'/bookDetail'}>
                    <BookDetail/>
                </CacheRoute>
            </CacheSwitch>
        </BrowserRouter>
    </StoreProvider.Provider>,
    document.getElementById('root')
);
