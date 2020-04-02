import React, {useEffect} from 'react';
import { observer, useLocalStore, useAsObservableSource } from 'mobx-react';
import NavBar from '../components/navbar';
import { useStore } from '../model';
import { UserStore } from '../model/userStore';
import {computed, observable} from 'mobx';
import { Checkbox, CircularProgress } from '@material-ui/core';
import { ask, isPhoneNumber } from '../util';
import { Toast } from '../components/Toast';
import { Check } from '@material-ui/icons';
import {parse} from "query-string";

class Logic {
    constructor(private userStore: UserStore) {}
    @computed get editId() {
        return Number(parse(location.search.slice(1)).editId as string);
    }
    @observable saved = false;
    @observable saveLoading = false;
    @observable name = '';
    @observable phoneNumber: string = '';
    @observable address: string = '';
    @observable isDefault: boolean = false;
    onUseEffect = () => {
        if (this.editId) {
            const {name,phoneNumber,address,isDefaultAddress} = this.userStore.userData.user.addresses.find(value => value.id === this.editId);
            this.name = name;
            this.phoneNumber = phoneNumber;
            this.address = address;
            this.isDefault = isDefaultAddress;
        }
    };
    onSave = () => {
        if (this.name && isPhoneNumber(this.phoneNumber) && this.address) {
            this.saveLoading = true;
            ask({
                url: `/api/addAddress`,
                method: 'post',
                data: {
                    id: this.editId,
                    name: this.name,
                    phoneNumber: this.phoneNumber,
                    address: this.address,
                    isDefault: this.isDefault,
                },
            })
                .then((value) => {
                    Toast.info('添加地址成功');
                    this.userStore.getAddress();
                    this.saved = true;
                    (window as any).browserHistory.goBack();
                })
                .finally(() => (this.saveLoading = false));
        } else {
            Toast.info('请输入正确格式的数据!');
        }
    };
    onDeleteAddress=()=>{
        ask({
            url: `/api/deleteAddress`,
            method: 'post',
            data: {
                addressId: this.editId
            }
        }).then(value => {
            Toast.info('删除成功！');
            this.userStore.getAddress();
            (window as any).browserHistory.goBack();
        })
    }
}
const AddAddress: React.FC = () => {
    const { userStore } = useStore();
    const logic = useLocalStore(() => new Logic(userStore));
    useEffect(logic.onUseEffect, []);
    return (
        <div>
            <NavBar
                centerPart={logic.editId ? '编辑收货地址' : '添加收货地址'}
                rightPart={
                    logic.saved ? (
                        <Check className="text-green-500"/>
                    ) : logic.saveLoading ? (
                        <CircularProgress style={{width:20, height: 20}}/>
                    ) : (
                        <span onClick={logic.onSave} className="text-red-500 mr-2">
                            保存
                        </span>
                    )
                }
            />
            <div className="h-screen bg-gray-100">
                <div className="bg-white">
                    <div className="border-b w-full">
                        <input className="w-full my-2 pl-2" placeholder="收货人姓名" value={logic.name}
                               onChange={(event) => (logic.name = event.target.value)}/>
                    </div>
                    <div className="border-b w-full">
                        <input className="w-full pl-2 my-2" placeholder="手机号码" value={logic.phoneNumber}
                               onChange={(event) => (logic.phoneNumber = event.target.value)}/>
                    </div>
                    <div className=" border-b w-full">
                        <textarea className="w-full pl-2 my-2" rows={4} placeholder="详细地址" value={logic.address}
                                  onChange={(event) => (logic.address = event.target.value)}/>
                    </div>
                    <div className="flex px-2 items-center">
                        <span className="mr-auto">设为默认地址</span>
                        <Checkbox className="ml-auto mr-2" checked={logic.isDefault}
                                  onChange={(event) => (logic.isDefault = event.target.checked)}/>
                    </div>
                </div>
                <div className="mt-4 w-full bg-white pl-2 py-3 text-red-500" onClick={logic.onDeleteAddress}>
                    删除收货地址
                </div>
            </div>
        </div>
    );
};
export default observer(AddAddress);
