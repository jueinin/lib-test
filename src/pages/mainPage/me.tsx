import React, { useEffect, useRef } from 'react';
import BottomBar from '../../components/bottomBar';
import { observer } from 'mobx-react';
import {useHistory} from 'react-router-dom'
import NavBar from '../../components/navbar';
import {
    NearMeOutlined,
    CardMembership,
    LocalShippingOutlined,
    ChatOutlined,
    SettingsBackupRestoreOutlined,
    ReorderOutlined,
    StarOutlined, ShoppingCartOutlined
} from '@material-ui/icons';
import { useStore } from '../../model';
import {equals, ifElse} from "ramda";

const defaultAvatar = 'https://jueinin.oss-cn-hongkong.aliyuncs.com/%E5%B0%8F%E7%A8%8B%E5%BA%8F/%E9%BB%98%E8%AE%A4%E5%A4%B4%E5%83%8F.jpg';
const Me: React.FC = () => {
    const { userStore } = useStore();
    const { isLogin, userData } = userStore;
    const history = useHistory();
    const topItems = useRef([
        {
            title: '浏览历史',
            icon: <NearMeOutlined/>,
            onClick: ()=>{
                history.push('/browserHistory')
            }
        },
        {
            title: '我的收藏',
            icon: <StarOutlined/>,
            onClick: ()=>{
                history.push('/favorites');
            }
        },
        {
            title: '论坛消息',
            icon: <StarOutlined/>,
        },
        {
            title: '购物车',
            icon: <ShoppingCartOutlined/>,
            onClick: ()=>{
                history.push('/shoppingCart');
            }
        },
    ]);
    const bottomItems = useRef([
        {
            title: "待付款",
            icon: <CardMembership/>
        },
        {
            title: "待收货",
            icon: <LocalShippingOutlined/>
        },
        {
            title: "待评价",
            icon: <ChatOutlined/>
        },
        {
            title: "退款/售后",
            icon: <SettingsBackupRestoreOutlined/>
        },
        {
            title: '全部订单',
            icon: <ReorderOutlined/>
        }
    ]);
    const onAvatarClick = () => {
        ifElse(equals(true), () => {
            console.log('logined')
        }, () => {
            (window as any).browserHistory.push('/login');
        })(isLogin)
    };
    return (
        <div className="bg-gray-200">
            <NavBar centerPart={'我的'}/>
            <div className="bg-red-500 p-3" data-name={'top-nav'}>
                <div className="flex">
                    <img alt="" src={defaultAvatar} onClick={onAvatarClick}
                         className="w-16 h-16 bg-green-300 rounded-full"/>
                    <div className="text-lg ml-6 text-white"
                         onClick={onAvatarClick}>{isLogin ? userData.user.userName : `登录 >`}</div>
                </div>
            </div>
            <div data-name={'工具栏'} className="w-full">
                <div data-name={'上半部分'} className="flex justify-around">
                    {topItems.current.map(value => {
                        return <div key={value.title} className="flex shadow-sm flex-col items-center" onClick={value.onClick}>
                            <span className="my-1 text-lg text-red-500">{value.icon}</span>
                            <span className="text-sm">{value.title}</span>
                        </div>
                    })}
                </div>
                <div data-name={'下半部分'} className="flex py-3 justify-around mx-8 rounded-lg shadow-lg mt-2 bg-white">
                    {bottomItems.current.map(value => {
                        return <div key={value.title} className="flex flex-col items-center">
                            <span className="my-1 text-red-500 text-lg">{value.icon}</span>
                            <span className="text-sm">{value.title}</span>
                        </div>
                    })}
                </div>
            </div>
            <BottomBar currentValue="/me"/>
        </div>
    );
};
export default observer(Me);
