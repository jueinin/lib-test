import React from "react";
import {observer,useLocalStore,useAsObservableSource} from "mobx-react";
import NavBar from "../components/navbar";
import {useStore} from "../model";
import {UserStore} from "../model/userStore";
import {observable} from "mobx";
import {Checkbox} from "@material-ui/core";
import {ask, isPhoneNumber} from "../util";
import {Toast} from "../components/Toast";

class Logic {
    constructor(private userStore: UserStore) {
    }

    @observable name = '';
    @observable phoneNumber: string = '';
    @observable address: string = '';
    @observable isDefault: boolean = false;
    onUseEffect = () => {

    };
    onSave = () => {
        if (this.name && isPhoneNumber(this.phoneNumber) && this.address) {
            ask({
                url: `/api/addAddress`,
                method: 'post',
                data: {
                    name: this.name,
                    phoneNumber: this.phoneNumber,
                    address: this.address,
                    isDefault: this.isDefault
                }
            }).then(value => {
                Toast.info('添加地址成功');
                (window as any).browserHistory.goBack();
            });
        } else {
            Toast.info('请输入正确格式的数据!');
        }
    }
}
const AddAddress: React.FC = () => {
    const {userStore} = useStore();
    const logic = useLocalStore(() => new Logic(userStore));
    return <div>
        <NavBar centerPart={'添加收货地址'} rightPart={<span onClick={logic.onSave} className="text-red-500 mr-2">保存</span>}/>
        <div className="h-screen bg-gray-100">
            <div className="bg-white">
                <div className="border-b w-full">
                    <input className="w-full my-2 pl-2" placeholder="收货人姓名" value={logic.name}
                           onChange={event => logic.name = event.target.value}/>
                </div>
                <div className="border-b w-full">
                    <input className="w-full pl-2 my-2" placeholder="手机号码" value={logic.phoneNumber}
                           onChange={event => logic.phoneNumber = event.target.value}/>
                </div>
                <div className=" border-b w-full">
                    <textarea className="w-full pl-2 my-2" rows={4} placeholder="详细地址" value={logic.address}
                              onChange={event => logic.address = event.target.value}/>
                </div>
                <div className="flex px-2 items-center">
                    <span className="mr-auto">设为默认地址</span>
                    <Checkbox className="ml-auto mr-2" checked={logic.isDefault}
                              onChange={event => logic.isDefault = event.target.checked}/>
                </div>
            </div>
        </div>
    </div>;
};
export default observer(AddAddress);
