import swr from 'swr'
import {Spin, Tooltip} from "antd";
import React ,{Suspense}from "react";
import {render} from "react-dom";
import {BrowserRouter,Route,Switch} from "react-router-dom";
import CacheRoute, {CacheSwitch} from "react-router-cache-route";
import IndexPage from "./pages/index.page";
import './pure.css'
import '../tailwind.css'
import '../index.css'
import Login from "./pages/login.page";
import Spining from "./components/Spining";
import Wrapper from "./pages/wrapper.page";
import BookManage from "./pages/bookManage.page";
import 'antd/dist/antd.css'
import styled from "styled-components";
import './custom.style.css'
import EditBook from "./pages/editBook";
const GlobalCss = styled.div`
  
`;
const AdminEntry:React.FC = () => {
    return <BrowserRouter>
        <GlobalCss>
            <Switch>
                <Wrapper>
                    <Route exact path={'/'}>
                        <Suspense fallback={<Spining/>}>
                            <IndexPage/>
                        </Suspense>
                    </Route>
                    <Route path={'/manage'}>
                        <BookManage/>
                    </Route>
                    <Route path={['/addBook', '/editBook']}>
                        <EditBook/>
                    </Route>
                </Wrapper>

                <Route path={'/login'}>
                    <Login/>
                </Route>
            </Switch>
        </GlobalCss>
    </BrowserRouter>;
};
render(<AdminEntry/>,document.getElementById('root'))
