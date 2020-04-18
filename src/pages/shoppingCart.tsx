import React, { useEffect, useState } from 'react';
import NavBar from '../components/navbar';
import { useLocalStore, observer } from 'mobx-react';
import {useHistory} from 'react-router-dom';
import { computed, observable } from 'mobx';
import { useStore } from '../model';
import { Checkbox } from '@material-ui/core';
import { UserStore } from '../model/userStore';
import { all, always, filter, is, map, none, pipe, sum } from 'ramda';
import { ask } from '../util';
import { Toast } from '../components/Toast';
import NumberInput from '../components/NumberInput';
import {useMutation} from "react-query";
export default observer(() => {
    const {userStore} = useStore();
    const history = useHistory();
    const [inManageMode, setInManageMode] = useState(false);
    const [allChecked, setAllChecked] = useState(false);
    const onAllCheckClick = () => {
        if (!all(value => value.checked, userStore.userData.shoppingCart.items)) {
            userStore.userData.shoppingCart.items = userStore.userData.shoppingCart.items.map(value => {
                value.checked = true;
                return value
            });
            setAllChecked(true);
        } else {
            userStore.userData.shoppingCart.items = userStore.userData.shoppingCart.items.map(value => {
                value.checked = false;
                return value
            });
            setAllChecked(false);
        }
    };
    const [onBatchDelete] = useMutation(() => {
        const checkedIds = this.userStore.userData.shoppingCart.items.filter((value) => value.checked).map((value) => value.id);
        return ask({
            url: `/api/batchRemoveShoppingCart`,
            method: 'post',
            data: {
                ids: checkedIds,
            },
        }).then((value) => {
            if (value.data.status === 'ok') {
                Toast.info('删除成功');
                userStore.getUserData();
            }
        });
    });
    if (!userStore.userData) {
        return null;
    }
    const allPrice = pipe(
        always(userStore.userData.shoppingCart.items),
        filter((value) => value.checked),
        map((value) => value.price * value.count),
        sum,
        (v) => v.toFixed(2)
    )();
    const checkedItemsLength = userStore.userData.shoppingCart.items.filter((value) => value.checked).length;
    if (userStore.userData.shoppingCart.items.length === 0) {
        return <div className="bg-gray-200">
            <NavBar centerPart={'购物车'}/>
            <div className="w-full h-40 flex-center">
                购物车里空空的，去转转吧！
            </div>
        </div>
    }
    return <div className="bg-gray-200">
        <NavBar centerPart={'购物车'}
                rightPart={inManageMode ? <span onClick={() => setInManageMode(false)}>完成</span> :
                    <span onClick={() => setInManageMode(true)}>管理</span>}/>
        {userStore.userData.shoppingCart.items.map((value) => {
            return (
                <div key={value.bookId} className="flex rounded-lg bg-white mx-1 p-2 w-full">
                    <div className="flex w-8 flex-center">
                        <Checkbox
                            checked={value.checked}
                            onChange={() => {
                                value.checked = !value.checked;
                                setAllChecked(all((v) => v.checked, userStore.userData.shoppingCart.items));
                            }}
                        />
                    </div>
                    <img src={value.smallImage} alt="goods cover" className="w-1/4"/>
                    <div className="flex flex-col flex-grow ml-1">
                        <div className="truncate-2-lines">{value.title}</div>
                        <div className="mt-auto text-lg text-red-500 mb-1 flex">
                            <span className="mr-auto">￥{value.price}</span>
                            <NumberInput
                                value={value.count}
                                onIncrement={() => value.count++}
                                onDecrement={() => {
                                    if (value.count !== 1) {
                                        value.count--;
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            );
        })}
        {inManageMode ? (
            <div className="p-1 fixed bottom-0 flex items-center bg-white w-full border">
                <div className="mr-auto text-gray-600">
                    <Checkbox checked={allChecked} onChange={onAllCheckClick}/>
                    全选
                </div>
                <div className="ml-auto rounded-full border border-red-500 text-red-500 py-1 px-3 mr-1"
                     onClick={onBatchDelete}>
                    删除
                </div>
            </div>
        ) : (
            <div className="p-1 fixed bottom-0 flex items-center bg-white w-full border">
                <div className="mr-auto text-gray-600">
                    <Checkbox checked={allChecked} onChange={onAllCheckClick}/>
                    全选
                </div>
                <div className="ml-auto flex items-center mr-1">
                    合计<span className="text-red-500 text-sm">￥{allPrice}</span>
                    <button className="bg-red-400 text-white rounded-full ml-2 px-4 py-2" onClick={() => {
                        if (userStore.userData.shoppingCart.items.filter(value => value.checked).length > 0) {
                            history.push('/confirmOrder?from=shoppingCart');
                        }
                    }}>结算{checkedItemsLength === 0 ? '' : `(${checkedItemsLength})`}</button>
                </div>
            </div>
        )}
    </div>;
});
