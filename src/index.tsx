import React from 'react'
import { render } from 'react-dom'
import './index.css'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './tailwind.css';
import IndexPage from "./pages/mainPage";
import {BrowserRouter,Route} from 'react-router-dom'
import MainPage from "./pages/mainPage/main";
import CacheRoute, {CacheSwitch} from "react-router-cache-route";
import SearchInput from "./pages/searchInput";
import SearchResultList from "./pages/searchResultList";
render(
    <BrowserRouter>
        <CacheSwitch>
            <CacheRoute exact path={['/','/forum','/me']}>
                <MainPage/>
            </CacheRoute>
            <CacheRoute exact path={'/searchInput'}>
                <SearchInput/>
            </CacheRoute>
            <CacheRoute exact path={'/searchResultList'}> {/*params=keyword*/}
                <SearchResultList/>
            </CacheRoute>
        </CacheSwitch>
    </BrowserRouter>,
  document.getElementById('root')
);
