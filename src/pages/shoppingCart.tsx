import React, { useEffect, useState } from 'react';
import NavBar from '../components/navbar';
import { useLocalStore, observer } from 'mobx-react';
import { computed, observable } from 'mobx';
import { useStore } from '../model';
import { Checkbox } from '@material-ui/core';
import { UserStore } from '../model/userStore';
import {all, always, filter, is, map, none, pipe, sum} from 'ramda';
import {ask} from "../util";
import {Toast} from "../components/Toast";
class Logic {
    constructor(private userStore: UserStore) {}

    @observable inManageMode: boolean = false; // whether or not in delete or other operation mode
    @observable allChecked: boolean = false;

    @computed get allPrice() {
        return pipe(
            always(this.userStore.userData.shoppingCart.items),
            filter((value) => value.checked),
            map((value) => value.price * value.count),
            sum,
            (v) => v.toFixed(2)
        )();
    }
    onAllCheckClick=() => {
        if (!all((value) => value.checked, this.userStore.userData.shoppingCart.items)) {
            this.userStore.userData.shoppingCart.items = map((v) => {
                v.checked = true;
                return v;
            }, this.userStore.userData.shoppingCart.items);
            this.allChecked = true;
        } else {
            this.userStore.userData.shoppingCart.items = map((v) => {
                v.checked = false;
                return v;
            }, this.userStore.userData.shoppingCart.items);
            this.allChecked = false;
        }
    }
    onBatchDelete=()=>{
        const checkedIds = this.userStore.userData.shoppingCart.items.filter(value => value.checked).map(value => value.id);
        ask({
            url: `/api/batchRemoveShoppingCart`,
            method: 'post',
            data: {
                ids: checkedIds
            }
        }).then(value => {
            if (value.data.status === 'ok') {
                Toast.info('删除成功');
                this.userStore.getUserData();
            }
        })
    }
}
const ShoppingCart: React.FC = () => {
    const { userStore } = useStore();
    const logic = useLocalStore(() => new Logic(userStore));
    if (!userStore.userData) {
        return null;
    }
    const checkedItemsLength = userStore.userData.shoppingCart.items.filter((value) => value.checked).length;
    return (
        <div className="bg-gray-200">
            <NavBar centerPart={'购物车'} rightPart={logic.inManageMode ? <span onClick={()=>logic.inManageMode=false}>完成</span> : <span onClick={()=>logic.inManageMode=true}>管理</span>} />
            {userStore.userData.shoppingCart.items.map((value) => {
                return (
                    <div key={value.bookId} className="flex rounded-lg bg-white mx-1 p-2 w-full">
                        <div className="flex w-8 flex-center">
                            <Checkbox checked={value.checked} onChange={() =>{
                                value.checked = !value.checked;
                                logic.allChecked = all(v => v.checked, userStore.userData.shoppingCart.items);
                            }} />
                        </div>
                        <img src={value.smallImage} alt="goods cover" className="w-1/4" />
                        <div className="flex flex-col flex-grow ml-1">
                            <div className="truncate-2-lines">{value.title}</div>
                            <div className="mt-auto text-lg text-red-500 mb-1 flex">
                                <span className="mr-auto">￥{value.price}</span>
                                <div className="ml-auto flex flex-center  border text-gray-600">
                                    <div
                                        className="shadow-md flex-center  border-r px-2 hover:bg-gray-200"
                                        onClick={() => {
                                            if (value.count !== 1) {
                                                value.count--;
                                            }
                                        }}
                                    >
                                        -
                                    </div>
                                    <span className="px-4 text-black text-sm">{value.count}</span>
                                    <div className="flex-center shadow-md  border-l px-2 hover:bg-gray-200" onClick={() => value.count++}>
                                        +
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
            {logic.inManageMode ? (
                <div className="p-1 fixed bottom-0 flex items-center bg-white w-full border">
                    <div className="mr-auto text-gray-600">
                        <Checkbox
                            checked={logic.allChecked}
                            onChange={logic.onAllCheckClick}
                        />
                        全选
                    </div>
                    <div className="ml-auto rounded-full border border-red-500 text-red-500 py-1 px-3 mr-1" onClick={logic.onBatchDelete}>删除</div>
                </div>
            ) : (
                <div className="p-1 fixed bottom-0 flex items-center bg-white w-full border">
                    <div className="mr-auto text-gray-600">
                        <Checkbox
                            checked={logic.allChecked}
                            onChange={logic.onAllCheckClick}
                        />
                        全选
                    </div>
                    <div className="ml-auto flex items-center mr-1">
                        合计<span className="text-red-500 text-sm">￥{logic.allPrice}</span>
                        <button className="bg-red-400 text-white rounded-full ml-2 px-4 py-2">结算{checkedItemsLength === 0 ? '' : `(${checkedItemsLength})`}</button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default observer(ShoppingCart);
