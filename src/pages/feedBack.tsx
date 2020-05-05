import React, {useState} from 'react';
import NavBar from '../components/navbar';
import {useMutation, useQuery} from 'react-query';
import { useStore } from '../model';
import { observer } from 'mobx-react';
import {ask} from "../util";
import {Toast} from "../components/Toast";

const FeedBack: React.FC<any> = () => {
    const { userStore } = useStore();
    const [str, setStr] = useState("");
    const [onSubmit] = useMutation(()=>ask({
        url: `/api/feedback`,
        method: "post",
        data: {
            content: str
        }
    }).then(value => {``
        if (value.data.status === 'ok') {
            Toast.info('反馈成功！');
        } else {
            Toast.info('网络异常请重试');
        }
    }))
    if (!userStore.userData) {
        return <span>loading...</span>;
    }
    return (
        <div>
            <NavBar centerPart={'帮助与反馈'} />
            <div className="px-2 pt-3">
                <span className="font-bold ">您的反馈非常重要，可以帮助我们改进产品，虽然我们无法回复所有反馈，但我们会考虑所有意见</span>
            </div>
            <div className="mx-4">
                <div className="p-4 mt-2 border rounded-lg">
                    <div className="font-bold">名称</div>
                    <div>{userStore.userData.user.userName}</div>
                </div>
                <div className="p-4 mt-2 border rounded-lg">
                    <div className="font-bold">邮箱</div>
                    <div>{userStore.userData.user.email}</div>
                </div>
                <div className="font-bold my-4">提交反馈：</div>
                <textarea className="w-full border" value={str} onChange={event => setStr(event.target.value)} placeholder="必填项"/>
                <button disabled={!str} onClick={()=>{
                    onSubmit()
                }} className="w-full bg-yellow-600 text-white py-4 text-lg mt-4 rounded-lg active:bg-yellow-700">提交反馈</button>
            </div>
        </div>
    );
};
export default observer(FeedBack);
