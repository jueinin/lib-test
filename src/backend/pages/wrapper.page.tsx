import React, { useState } from 'react';
import {Button, Menu} from 'antd';
import {MenuUnfoldOutlined, MenuFoldOutlined,HomeOutlined,BookOutlined} from '@ant-design/icons';
// @ts-ignore
import logo from '../../resource/logo.png'
import {NavLink} from "react-router-dom";

const Wrapper: React.FC = (props) => {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <div className="flex">
            <div className="menubar transition-all transition duration-200 border-r h-screen" style={{width: collapsed?82:250}}>
                <div className="logo bg-gray-700 p-4 flex items-center">
                    <img className="h-8 w-8 mr-2" style={{marginLeft: '15%'}} src={logo}/>
                    <span className="font-bold text-white text-lg" style={{
                        display: collapsed?'none':'inline'
                    }}>啄木鸟书城</span>
                </div>
                <div className="mt-8">
                    <Menu mode="inline" className="border-t" inlineCollapsed={collapsed} defaultSelectedKeys={[location.pathname]}>
                        <Menu.Item key={'/'}>
                            <NavLink className="flex items-center " to={'/'}>
                                <HomeOutlined/>
                                <span>首页</span>
                            </NavLink>
                        </Menu.Item>
                        <Menu.Item key={'/manage'}>
                            <NavLink to={'/manage'} className="flex items-center">
                                <BookOutlined />
                                <span>书籍管理</span>
                            </NavLink>
                        </Menu.Item>
                    </Menu>
                </div>
            </div>
            <div id="right" className="flex flex-col flex-grow">
                <header id="header" className="flex px-2 items-center w-full border" style={{height: 60}}>
                    <Button onClick={() => setCollapsed(!collapsed)}>
                        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}
                    </Button>
                </header>
                <div id="content" className="flex-grow">{props.children}</div>
            </div>
        </div>
    );
};
export default Wrapper;
