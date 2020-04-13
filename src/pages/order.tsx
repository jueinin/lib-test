import React, { useEffect, useState, useRef } from 'react';
import NavBar from '../components/navbar';
import { CircularProgress, Popover, Tab, Tabs } from '@material-ui/core';
import { parse } from 'query-string';
import { ask, eventEmitter } from '../util';
import { always, cond, equals, identity, ifElse, length, pipe, prop, sum } from 'ramda';
import logo from '../resource/images/logo.jpeg';
import PayDialog from '../components/PayDialog';
import { Toast } from '../components/Toast';
import { Link } from 'react-router-dom';
import { useMutation, queryCache } from 'react-query';
import { useModal } from '../useModal';
const statusToName = (value: string) => {
    return cond([
        [equals('pendingPayment'), always('待付款')],
        [equals('pendingReceived'), always('待收货')],
        [equals('pendingComment'), always('待评价')],
        [equals('finish'), always('交易成功')],
        [equals('cancel'), always('交易取消')],
    ])(value);
};
const OrderTest = () => {
    const [currentTab, setCurrentTab] = useState(parse(location.search.slice(1)).type as string || 'all');
    const tabs = useRef([
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
    ]);
    const [requestData, {status, data, error}] = useMutation<any, typeof currentTab>(currentTab => ask({
        url: `/api/orderItems?type=${currentTab}`,
    }).then(prop('data')));
    const [confirmReceived, {}] = useMutation(({orderItemId}: any) => ask({
        url: `/api/confirmReceivedItem`,
        method: 'post',
        data: {orderItemId: orderItemId},
    }));
    useEffect(() => {
        requestData(currentTab);
    }, [currentTab]);
    const [pay] = useMutation(({orderItemId}: any) => ask({
        url: `/api/pay`,
        method: 'post',
        data: {orderItemId: orderItemId},
    }), {
        onSuccess: data1 => {
            Toast.info('付款成功');
            requestData(currentTab);
            closePayDialog();
        }
    });
    const [deleteOrder] = useMutation((orderItemId) => ask({
        url: `/api/deleteOrder`,
        method: 'post',
        data: {orderItemId: orderItemId},
    }), {
        onSuccess: data1 => {
            Toast.info('删除成功');
            requestData(currentTab);
            closePopover()
        }
    });
    const {openModal: openPayDialog, closeModal: closePayDialog, isOpen: isPayIDalogOpen} = useModal((item) => {
        return <PayDialog
            open
            onClose={() => closePayDialog()}
            onPay={() => pay({
                orderItemId: item.id
            })}
        />;
    });
    const {openModal: openPopover, closeModal: closePopover} = useModal(({orderId}) => {
        return <Popover
            open
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            onClose={closePopover}
            anchorEl={document.getElementById(`deleteOrder${orderId}`)}
        >
            <div className="flex justify-between text-blue-500 p-4">
                <button className="p-1 px-2 bg-blue-500 border rounded-lg text-white"
                        onClick={() => deleteOrder(orderId)}>
                    确&nbsp;认
                </button>
                <button className="ml-4 p-1 px-2 text-black" onClick={closePayDialog}>
                    取&nbsp;消
                </button>
            </div>
        </Popover>
    });
    return <div className="bg-gray-200">
        <NavBar centerPart={'订单'}/>
        <Tabs
            onChange={(e, value) => {
                setCurrentTab(value);
            }}
            value={currentTab}
            indicatorColor={'secondary'}
            textColor={'secondary'}
            variant={'fullWidth'}
        >
            {tabs.current.map((value) => {
                return <Tab key={value.value} label={value.name} value={value.value}/>;
            })}
        </Tabs>
        <div>
            {status === 'loading' && (
                <div className="w-full h-40 flex-center">
                    <CircularProgress/>
                </div>
            )}
            {data && data.length === 0 && status !== 'loading' && (
                <div data-name={'empty'} className="w-full h-40 flex-center">
                    <div className="text-center">
                        <div> 你还没有相关的订单</div>
                        <div className="mt-2">可以看看有哪些想买的书呢！</div>
                    </div>
                </div>
            )}
            {data &&
            data.map((value) => {
                return (
                    <div className="px-2 mt-4 simple-card rounded-lg">
                        <div>
                            <div data-name={'nav bar'} className="py-2 border-b flex w-full items-center">
                                <img src={logo} className="h-4 w-4 "/>
                                <span className="mr-auto ml-2">啄木鸟书城</span>
                                <span className="text-red-500 ml-auto">{statusToName(value.status)}</span>
                            </div>
                            <div className="flex mt-2">
                                <img src={value.book.smallImage.url} className="w-1/4 mr-2"/>
                                <h3 className="flex-grow truncate-2-lines">{value.book.name}</h3>
                                <div className="flex flex-col ml-2">
                                    <span className="">￥{value.book.price}</span>
                                    <span className="text-sm ml-auto">x{value.count}</span>
                                </div>
                            </div>
                        </div>
                        <div className=" w-full flex mt-1">
                                <span className="ml-auto text-sm">
                                    共{value.count}件商品，共计￥<span
                                    className="text-base">{(value.count * value.book.price).toFixed(2)}元</span>
                                </span>
                        </div>
                        <div className="flex w-full py-2 justify-end">
                            {value.status === 'pendingPayment' && (
                                <button
                                    className="border p-2 rounded-full px-4 bg-red-500 text-white"
                                    onClick={() => {
                                        openPayDialog(value);
                                    }}
                                >
                                    付款
                                </button>
                            )}
                            {value.status === 'pendingReceived' && (
                                <button className="border p-2 rounded-full px-4 bg-red-500 text-white"
                                        onClick={() => confirmReceived({orderItemId: value.id}, {
                                            onSuccess: data => {
                                                Toast.info('确认收货成功!');
                                                requestData(currentTab);
                                            }
                                        })}>
                                    确认收货
                                </button>
                            )}
                            {value.status === 'pendingComment' && (
                                <Link to={`/comment?bookId=${value.book.id}&orderItemId=${value.id}`}
                                      className="border p-2 ml-auto rounded-full px-4 bg-red-500 text-white">
                                    立即评价
                                </Link>
                            )}
                            <button id={'deleteOrder' + value.id} className="border p-2 rounded-full px-4"
                                    onClick={() => openPopover({
                                        orderId: value.id,
                                    })}>
                                删除订单
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
};
export default OrderTest;
