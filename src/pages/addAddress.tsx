import React, { useEffect, useState } from 'react';
import NavBar from '../components/navbar';
import { useStore } from '../model';
import { Checkbox, CircularProgress } from '@material-ui/core';
import { ask, isPhoneNumber } from '../util';
import { Toast } from '../components/Toast';
import { Check } from '@material-ui/icons';
import { parse } from 'query-string';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';
const AddAddress: React.FC = () => {
    const { userStore } = useStore();
    const history = useHistory();
    const temp = Number(parse(location.search.slice(1)).editId as string);
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const editId = isNaN(temp) ? null : temp;
    useEffect(() => {
        if (editId && userStore.userData) {
            const { name, phoneNumber, address, isDefaultAddress } = userStore.userData.user.addresses.find((value) => value.id === editId);
            setName(name);
            setPhoneNumber(phoneNumber);
            setAddress(address);
            setIsDefault(isDefaultAddress);
        }
    }, [userStore.userData]);
    const [onDeleteAddress, {}] = useMutation(() => {
        return ask({
            url: `/api/deleteAddress`,
            method: 'post',
            data: {
                addressId: editId,
            },
        }).then((value) => {
            Toast.info('删除成功！');
            userStore.getAddress();
            history.goBack();
        });
    });
    const [onSave, { status }] = useMutation(() => {
        return ask({
            url: `/api/addAddress`,
            method: 'post',
            data: {
                id: editId,
                name: name,
                phoneNumber: phoneNumber,
                address: address,
                isDefault: isDefault,
            },
        }).then((value) => {
            Toast.info('添加地址成功');
            userStore.getAddress();
            history.goBack();
        });
    });
    return (
        <div>
            <NavBar
                centerPart={editId ? '编辑收货地址' : '添加收货地址'}
                rightPart={
                    status === 'success' ? (
                        <Check className="text-green-500" />
                    ) : status === 'loading' ? (
                        <CircularProgress style={{ width: 20, height: 20 }} />
                    ) : (
                        <span
                            onClick={() => {
                                if (name && isPhoneNumber(phoneNumber) && address) {
                                    onSave();
                                } else {
                                    Toast.info('请输入正确格式的数据!');
                                }
                            }}
                            className="text-red-500 mr-2"
                        >
                            保存
                        </span>
                    )
                }
            />
            <div className="h-screen bg-gray-100">
                <div className="bg-white">
                    <div className="border-b w-full">
                        <input className="w-full my-2 pl-2" placeholder="收货人姓名" value={name} onChange={(event) => setName(event.target.value)} />
                    </div>
                    <div className="border-b w-full">
                        <input className="w-full pl-2 my-2" placeholder="手机号码" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
                    </div>
                    <div className=" border-b w-full">
                        <textarea className="w-full pl-2 my-2" rows={4} placeholder="详细地址" value={address} onChange={(event) => setAddress(event.target.value)} />
                    </div>
                    <div className="flex px-2 items-center">
                        <span className="mr-auto">设为默认地址</span>
                        <Checkbox className="ml-auto mr-2" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} />
                    </div>
                </div>
                {editId && (
                    <div className="mt-4 w-full bg-white pl-2 py-3 text-red-500" onClick={onDeleteAddress}>
                        删除收货地址
                    </div>
                )}
            </div>
        </div>
    );
};
export default observer(AddAddress);
