import {observer, useLocalStore} from "mobx-react";
import React from 'react';
import NavBar from "../components/navbar";
import {PersonOutlined,LockOutlined} from "@material-ui/icons";
import style from '../cover.module.css';
import {useHistory} from 'react-router-dom';
import {observable} from "mobx";
import {ask} from "../util";
import {useStore} from "../model";
import {Toast} from "../components/Toast";
class Logic {
    @observable email: string = '';
    @observable password: string = '';
    onLogin=()=>{
        return ask({
            url: `/api/login`,
            data: {
                email: this.email,
                password: this.password
            },
            method: 'post'
        })
    }
}
const Login = () => {
    const history = useHistory();
    const logic = useLocalStore(() => new Logic());
    const {userStore} = useStore();
    return <div>
        <NavBar centerPart={'登录'}/>
        <div className="pt-20 px-16">
            <div className={"flex py-1 border-b border-solid border-gray-900 items-center " + style.simpleInput}>
                <PersonOutlined className="mr-1 text-gray-700"/><input className="flex-grow" value={logic.email}
                                                                       onChange={event => logic.email = event.target.value}
                                                                       placeholder="请输入邮箱"/>
            </div>
            <div className={"flex mt-4 py-1 border-b border-solid border-gray-900 items-center " + style.simpleInput}>
                <LockOutlined className="mr-1 text-gray-700"/><input className="flex-grow" type='password'
                                                                     value={logic.password}
                                                                     onChange={event => logic.password = event.target.value}
                                                                     placeholder="请输入密码"/>
            </div>
            <div className="w-full mt-4">
                <button className="text-center py-2 text-lg text-white bg-red-400 w-full"
                        onClick={() => logic.onLogin().then(userStore.getUserData).then(() => {
                            history.push('/');
                            Toast.info('登录成功，跳转中...')
                        }).catch(err=>{
                            const errMsg = err.response.data.message;
                            Toast.info(errMsg);
                        })}>登录
                </button>
            </div>
            <div className="text-red-400 text-sm mt-3 flex">
                <span className="mr-auto">忘记密码？</span>
                <span className="ml-auto" onClick={() => history.push('/signUp')}>立即注册</span>
            </div>
        </div>
    </div>;
};
export default observer(Login);
