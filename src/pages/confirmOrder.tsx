import React from "react";
// 确认订单
import {useHistory} from 'react-router-dom';
import {observer} from "mobx-react";
 // 这个页面如果购物车进来很简单就搞定了，直接从购物车拿数据即可，但是如果直接点击购买的呢，一刷新客户端就不知道点击了啥了，要不然存服务端要不然存sessionStorage里
const ConfirmOrder: React.FC = () => {
    const history = useHistory();
    return <div></div>
};
export default observer(ConfirmOrder);
