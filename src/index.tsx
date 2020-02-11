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
render(
    <BrowserRouter>
        <CacheSwitch>
            <CacheRoute exact path={['/','/forum','/me']}>
                <MainPage/>
            </CacheRoute>
            <Route exact path={'/searchInput'}>
                <SearchInput/>
            </Route>
        </CacheSwitch>
    </BrowserRouter>,
  document.getElementById('root')
);
