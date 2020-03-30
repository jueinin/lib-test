import React, { useEffect } from 'react';
// 确认订单
import { useHistory } from 'react-router-dom';
import { observer, useAsObservableSource, useLocalStore } from 'mobx-react';
import { useStore } from '../model';
import { parse } from 'querystring';
import { computed, observable } from 'mobx';
import { ShoppingCartItem, UserAddressItem, UserStore } from '../model/userStore';
import { ask } from '../util';
import { LocationOnOutlined } from '@material-ui/icons';
import NavBar from '../components/navbar';
import { filter, head, map, pipe, sum } from 'ramda';
import ShoppingCart from './shoppingCart';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputBase } from '@material-ui/core';
import {Toast} from "../components/Toast";
import PayDialog from "../components/PayDialog";
import NumberInput from "../components/NumberInput";
// 这个页面如果购物车进来很简单就搞定了，直接从购物车拿数据即可，但是如果直接点击购买的呢，一刷新客户端就不知道点击了啥了，要不然存服务端要不然存sessionStorage里

class Logic {
    constructor(private userStore: UserStore) {}

    @observable submitLoading: boolean = false;
    @observable dialogOpen: boolean = false;
    orderId: number;
    @computed get isFromShoppingCart() {
        const from = parse(location.search.slice(1)).from;
        return from === 'shoppingCart';
    }
    @computed get buyCount() {
        if (this.isFromShoppingCart) {
            return sum(this.userStore.userData.shoppingCart.items.filter((value) => value.checked).map((value) => value.count));
        } else {
            return this.userStore.currentBuyItemInfo.count;
        }
    }
    @computed get sumPrice() {
        if (this.isFromShoppingCart) {
            return pipe(
                filter((value: any) => value.checked),
                map((value: ShoppingCartItem) => value.count * value.price),
                sum,
                (v) => v.toFixed(2)
            )(this.userStore.userData.shoppingCart.items);
        } else {
            const { price, count } = this.userStore.currentBuyItemInfo;
            return (price * count).toFixed(2);
        }
    }
    @computed get userAddress() {
        return (this.userStore?.userData?.user?.addresses || []).filter((value) => value.isDefaultAddress)[0];
    }
    @computed get shoppingCartData() {
        return (this.userStore.userData?.shoppingCart?.items || []).filter((value) => value.checked);
    }

    @computed get currentBuyInfo() {
        return this.userStore.currentBuyItemInfo;
    }

    onSubmit = () => {
        // @ts-ignore
        const orderItems = (this.isFromShoppingCart ? this.shoppingCartData : [this.currentBuyInfo]).map((value) => ({
            bookId: value.bookId,
            count: value.count,
            price: value.price,
        }));
        ask({
            url: `/api/submitOrder`,
            method: 'post',
            data: {
                orderItems,
            },
        }).then((value) => {
            if (value.data.status === 'ok') {
                this.dialogOpen = true;
                this.orderId = value.data.orderId;
            }
        });
    };
    onPayAll = () => {
        ask({
            url: `/api/payAll`,
            method: 'post',
            data: {
                orderId: this.orderId
            }
        }).then(value => {
            this.dialogOpen=false;
            Toast.info('付款成功！');
        });
    };
}
const ConfirmOrder: React.FC = () => {
    const history = useHistory();
    const { userStore } = useStore();
    const logic = useLocalStore(() => new Logic(userStore));
    if (!userStore.userData) {
        return null;
    }
    return (
        <div className="h-screen bg-gray-200">
            <NavBar centerPart={'确认订单'} />
            <div className="p-1 ">
                {logic.userAddress ? (
                    <div className="simple-card py-4 px-1 flex ">
                        <LocationOnOutlined className="bg-red-500 ml-2 rounded-full text-white" />
                        <div className="flex-grow flex flex-col ml-4">
                            <div>
                                {logic.userAddress.name}
                                <span className="text-gray-700 ml-3  text-sm">{logic.userAddress.phoneNumber}</span>
                            </div>
                            <div className="text-sm">{logic.userAddress.address}</div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white text-black w-full shadow-sm rounded-lg py-10 px-2 flex-center" onClick={() => history.push('/addAddress')}>
                        您还没有添加收货地址，点击添加吧
                    </div>
                )}
                {logic.isFromShoppingCart ? (
                    <div>
                        {logic.shoppingCartData.map((value) => {
                            return (
                                <div key={value.bookId} className="simple-card flex mb-2 mt-2" onClick={() => history.push(`/bookDetail?bookId=${value.bookId}`)}>
                                    <img alt="" src={value.smallImage} className="w-1/4" />
                                    <div className="flex-grow truncate-2-lines text-sm">{value.title}</div>
                                    <div className="flex flex-col mx-2">
                                        <span className="text-sm">￥{value.price}</span>
                                        <span className="text-sm ml-auto text-gray-500">x{value.count}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="simple-card flex mb-2 mt-2" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        history.push(`/bookDetail?bookId=${logic.currentBuyInfo.bookId}`);
                    }}>
                        <img alt="" src={logic.currentBuyInfo.smallImages} className="w-1/4" />
                        <div className="flex-grow truncate-2-lines text-sm">{logic.currentBuyInfo.title}</div>
                        <div className="flex flex-col mx-2 pt-2">
                            <span className="text-sm ml-auto">￥{logic.currentBuyInfo.price}</span>
                            <span className="text-sm ml-auto text-gray-500">x{logic.currentBuyInfo.count}</span>
                            <div className="mt-auto mb-2">
                                <NumberInput value={logic.currentBuyInfo.count} onIncrement={(e)=>{
                                    e.stopPropagation();
                                    e.preventDefault();
                                    logic.currentBuyInfo.count++
                                }} onDecrement={(e)=>{
                                    e.stopPropagation();
                                    e.preventDefault();
                                    logic.currentBuyInfo.count--
                                }}/>
                            </div>
                        </div>

                    </div>
                )}
                <div className="fixed bottom-0 flex justify-end items-center w-full bg-white shadow-md py-2 px-2 border left-0">
                    <span className="text-sm text-gray-500 mr-4">共{logic.buyCount}件</span>共计<span className="text-red-500 text-lg">{logic.sumPrice}</span>元
                    <button className="rounded-full bg-red-500 py-2 text-white px-4 ml-2" onClick={logic.onSubmit}>
                        提交订单
                    </button>
                </div>
                <PayDialog open={logic.dialogOpen} onClose={()=>logic.dialogOpen=false} onPay={logic.onPayAll}/>
            </div>
        </div>
    );
};
export default observer(ConfirmOrder);
