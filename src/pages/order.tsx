import React, { useEffect } from 'react';
import NavBar from '../components/navbar';
import { observable, reaction } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import { CircularProgress, Popover, Tab, Tabs } from '@material-ui/core';
import { parse } from 'query-string';
import { ask } from '../util';
import { BehaviorSubject, Subject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { always, cond, equals, identity, ifElse, length, pipe, prop, sum } from 'ramda';
import logo from '../resource/images/logo.jpeg';
import PayDialog from '../components/PayDialog';
import { Toast } from '../components/Toast';
import {Link} from "react-router-dom";

class Logic {
    @observable currentTab: string = (parse(location.search.slice(1)).type as string) || 'all';
    @observable loading: boolean = false;
    currentOrderItemId: number;
    @observable payDialogOpen: boolean = false;
    tabs = [
        {
            name: '全部',
            value: 'all',
        },
        {
            name: '待付款',
            value: 'pendingPayment',
        },
        {
            name: '待收货',
            value: 'pendingReceived',
        },
        {
            name: '待评价',
            value: 'pendingComment',
        },
    ];
    @observable data = [];
    @observable deleteOrderPopOverOpen = false;
    getData = (tab: string) => {
        this.loading = true;
        this.data = [];
        return ask({
            url: `/api/orderItems?type=${tab}`,
        })
            .then(prop('data'))
            .then((value) => {
                this.data = ifElse(pipe(length, equals(0)), always(null), identity)(value);
                this.loading = false;
            });
    };
    onUseEffect = () => {
        this.getData(this.currentTab);
        const dispose = reaction(
            () => this.currentTab,
            (v) => this.getData(v)
        );
        return () => {
            dispose();
        };
    };
    confirmReceived = (orderItemId) => {
        ask({
            url: `/api/confirmReceivedItem`,
            method: 'post',
            data: { orderItemId: orderItemId },
        }).then((value1) => {
            if (value1.data.status === 'ok') {
                Toast.info('成功确认收货！');
                this.getData(this.currentTab);
            }
        });
    };
    deleteOrderItem = (orderItemId) => {
        ask({
            url: `/api/deleteOrder`,
            method: 'post',
            data: { orderItemId: orderItemId },
        }).then((value1) => {
            if (value1.data.status === 'ok') {
                this.getData(this.currentTab);
                this.deleteOrderPopOverOpen = false;
            }
        });
    };
    pay=()=>{
        ask({
            url: `/api/pay`,
            method: 'post',
            data: { orderItemId: this.currentOrderItemId },
        }).then((value) => {
            if (value.data.status === 'ok') {
                Toast.info('付款成功！');
                this.payDialogOpen = false;
                this.getData(this.currentTab);
            }
        });
    }
}
const statusToName = (value: string) => {
    return cond([
        [equals('pendingPayment'), always('待付款')],
        [equals('pendingReceived'), always('待收货')],
        [equals('pendingComment'), always('待评价')],
    ])(value);
};
const Order: React.FC = () => {
    const logic = useLocalStore(() => new Logic());
    useEffect(logic.onUseEffect, []);
    return (
        <div className="bg-gray-200">
            <NavBar centerPart={'订单'} />
            <Tabs
                onChange={(e, value) => {
                    logic.currentTab = value;
                }}
                value={logic.currentTab}
                indicatorColor={'secondary'}
                textColor={'secondary'}
                variant={'fullWidth'}
            >
                {logic.tabs.map((value) => {
                    return <Tab key={value.value} label={value.name} value={value.value} />;
                })}
            </Tabs>
            <div>
                {logic.loading && (
                    <div className="w-full h-40 flex-center">
                        <CircularProgress />
                    </div>
                )}
                {logic.data === null && !logic.loading && (
                    <div data-name={'empty'} className="w-full h-40 flex-center">
                        <div className="text-center">
                            <div> 你还没有相关的订单</div>
                            <div className="mt-2">可以看看有哪些想买的书呢！</div>
                        </div>
                    </div>
                )}
                {logic.data &&
                    logic.data.map((value) => {
                        return (
                            <div className="px-2 mt-4 simple-card rounded-lg">
                                <div>
                                    <div data-name={'nav bar'} className="py-2 border-b flex w-full items-center">
                                        <img src={logo} className="h-4 w-4 " />
                                        <span className="mr-auto ml-2">啄木鸟书城</span>
                                        <span className="text-red-500 ml-auto">{statusToName(value.status)}</span>
                                    </div>
                                    <div className="flex mt-2">
                                        <img src={value.book.smallImage.url} className="w-1/4 mr-2" />
                                        <h3 className="flex-grow truncate-2-lines">{value.book.name}</h3>
                                        <div className="flex flex-col ml-2">
                                            <span className="">￥{value.book.price}</span>
                                            <span className="text-sm ml-auto">x{value.count}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className=" w-full flex mt-1">
                                    <span className="ml-auto text-sm">
                                        共{value.count}件商品，共计￥<span className="text-base">{(value.count * value.book.price).toFixed(2)}元</span>
                                    </span>
                                </div>
                                <div className="flex w-full py-2 justify-end">
                                    {value.status === 'pendingPayment' && (
                                        <button
                                            className="border p-2 rounded-full px-4 bg-red-500 text-white"
                                            onClick={() => {
                                                logic.currentOrderItemId = value.id;
                                                logic.payDialogOpen = true;
                                            }}
                                        >
                                            付款
                                        </button>
                                    )}
                                    {value.status === 'pendingReceived' && (
                                        <button className="border p-2 rounded-full px-4 bg-red-500 text-white" onClick={() => logic.confirmReceived(value.id)}>
                                            确认收货
                                        </button>
                                    )}
                                    {value.status === 'pendingComment' && <Link to={`/comment?bookId=${value.book.id}&orderItemId=${value.id}`} className="border p-2 ml-auto rounded-full px-4 bg-red-500 text-white">立即评价</Link>}
                                    <button id="deleteOrder" className="border p-2 rounded-full px-4" onClick={() => (logic.deleteOrderPopOverOpen = true)}>
                                        删除订单
                                    </button>
                                    <Popover
                                        open={logic.deleteOrderPopOverOpen}
                                        anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'center',
                                        }}
                                        transformOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'center',
                                        }}
                                        onClose={() => (logic.deleteOrderPopOverOpen = false)}
                                        anchorEl={document.getElementById('deleteOrder')}
                                    >
                                        <div className="flex justify-between text-blue-500 p-4">
                                            <button className="p-1 bg-blue-500 border rounded-lg text-white" onClick={() => logic.deleteOrderItem(value.id)}>
                                                确认
                                            </button>
                                            <button className="ml-4 text-black" onClick={() => (logic.deleteOrderPopOverOpen = false)}>
                                                取消
                                            </button>
                                        </div>
                                    </Popover>
                                </div>
                            </div>
                        );
                    })}
            </div>
            <PayDialog
                open={logic.payDialogOpen}
                onClose={() => {
                    logic.payDialogOpen = false;
                }}
                onPay={logic.pay}
            />
        </div>
    );
};
export default observer(Order);
