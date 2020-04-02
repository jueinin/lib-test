import React from "react";
import NavBar from "../components/navbar";
import {observable} from "mobx";
import {observer,useLocalStore} from "mobx-react";
import {useStore} from "../model";
import {useHistory} from 'react-router-dom';
import {ask} from "../util";
class Logic {
    @observable loading
}
const AddressList: React.FC = () => {
    const logic = useLocalStore(() => new Logic());
    const {userStore} = useStore();
    const history = useHistory();
    return <div>
        <NavBar centerPart={'我的收货地址'} rightPart={<span onClick={()=>history.push('/addAddress')}>添加新地址</span>}/>
        {
            (userStore.userData?.user?.addresses || []).map(value => {
                return <div className="flex items-center p-2 mb-2" onClick={()=>{
                    ask({
                        url:`/api/addAddress`,
                        method: 'post',
                        data: {
                            ...value,
                            isDefault: true
                        }
                    }).then(value1 => {
                        userStore.getAddress();
                        history.goBack();
                    })
                }}>
                    <div className="h-8 w-8 text-gray-100 text-sm rounded-full bg-gray-500 flex-center">
                        {value.name.slice(0, 2)}
                    </div>
                    <div className="flex flex-col px-4 flex-grow relative">
                        <div className="flex items-center">
                            <span className="font-bold">{value.name}</span>
                            <span className="ml-4 text-sm text-gray-500">{value.phoneNumber}</span>
                        </div>
                        <div className="text-sm mt-1">
                            {value.isDefaultAddress &&
                            <span className="bg-pink-200 text-red-500 px-1 mr-2">默认</span>}{value.address}
                        </div>
                        <div className="bg-gray-300 h-8 absolute right-0 transform -translate-y-1/2 "
                             style={{width: 1, top: '50%'}}/>
                    </div>
                    <div className="p-3 text-gray-500 text-sm whitespace-no-wrap"
                         onClick={() => history.push('/editAddress?editId=' + value.id)}>编辑
                    </div>
                </div>;
            })
        }
    </div>
};
export default observer(AddressList);
