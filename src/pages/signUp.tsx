import React, {useEffect, useState} from "react";
import {observer,useLocalStore} from "mobx-react";
import NavBar from "../components/navbar";
import style from "../cover.module.css";
import {PersonOutlined,MailOutline,LockOutlined} from "@material-ui/icons";
import {observable} from "mobx";
import {ask, isEmail} from "../util";
import {Toast} from "../components/Toast";
import {fromPromise} from "rxjs/internal-compatibility";
import {interval} from "rxjs";
import {map, take, tap} from "rxjs/operators";
import classNames from "classnames";
import {UserStore} from "../model/userStore";
import {useStore} from "../model";

class Logic {
    @observable loading: boolean = false;
    @observable mailLoading: boolean = false;
    @observable mailCountDown: number;
    @observable userName: string = '';
    @observable email: string = '';
    @observable password: string = '';
    @observable rePassword: string = '';
    @observable verificationCode: string = '';
    userStore: UserStore = null;
    onSignUp = () => {
        // validate field first
        const data = {
            userName: {
                errMsg: '用户名需小于8位',
                test: (value: string) => {
                    return value.length < 8 && value.length>0;
                }
            },
            email: {
                errMsg: '输入合法的邮箱',
                test: isEmail
            },
            password: {
                errMsg: '密码至少8位',
                test: (value: string) => {
                    return value.length >= 8;
                }
            },
            rePassword: {
                errMsg: '确认密码不正确哦',
                test: (value: string) => {
                    return value === this.password
                }
            },
        };
        const validField = (name: string) => {
            if (!data[name].test(this[name])) {
                return Toast.info(data[name].errMsg);
            }
            return true
        };
        if (validField('userName') && validField('email') && validField('password') && validField('rePassword') && this.verificationCode) {
            // request signUp
            ask({
                method: 'post',
                url: `/api/signUp`,
                data: {
                    userName: this.userName,
                    email: this.email,
                    password: this.password,
                    signUpCode: Number(this.verificationCode)
                }
            }).then(value => {
                Toast.info('注册成功！');
                this.userStore.getUserData();
                (window as any).browserHistory.push('/');
            })

        }
    };
    onMount=(userStore:UserStore)=>{
        return ()=>{
            this.userStore = userStore;
        }
    }
    onSendMailCode = () => {
        if (this.mailLoading) {
            return;
        }
        this.mailLoading = true;
        interval(1000).pipe(take(61), map(value1 => 60 - value1)).subscribe(second => {
            this.mailCountDown = second;
            if (second === 0) {
                this.mailLoading = false;
            }
        });
        fromPromise(ask({
            url: `/api/sendMailCode?email=${this.email}`
        })).subscribe(value => {
            Toast.info('发送成功！');
        }, error => {
            Toast.info(error.response.data.message);
        });
    };
}
const SignUp: React.FC = () => {
    const logic = useLocalStore(() => new Logic());
    const {userStore} = useStore();
    useEffect(logic.onMount(userStore),[]);
    const {loading,onSignUp, userName, email, password, rePassword,verificationCode,onSendMailCode,mailLoading,mailCountDown} = logic;
    return <div className="">
        <NavBar centerPart={'注册成为新用户'}/>
        <div className="mx-10 mt-20">
            <h2 className="text-center w-full text-lg">欢迎注册</h2>
            <div className={"flex py-1 mt-2 border-b border-solid border-gray-900 items-center " + style.simpleInput}>
                <PersonOutlined className="mr-1 text-gray-700"/><input value={userName}
                                                                       onChange={(e) => logic.userName = e.target.value}
                                                                       className="flex-grow" maxLength={8}
                                                                       placeholder="请输入用户名"/>
            </div>
            <div className={"flex py-1 mt-2 border-b border-solid border-gray-900 items-center " + style.simpleInput}>
                <MailOutline className="mr-1 text-gray-700"/><input value={email}
                                                                    onChange={(e) => logic.email = e.target.value}
                                                                    className="flex-grow" type="email"
                                                                    placeholder="请输入邮箱"/>
            </div>
            <div className={"flex py-1 mt-2 border-b border-solid border-gray-900 items-center " + style.simpleInput}>
                <LockOutlined className="mr-1 text-gray-700"/><input className="flex-grow" type="password"
                                                                     value={password}
                                                                     onChange={(e) => logic.password = e.target.value}
                                                                     placeholder="请输入密码"/>
            </div>
            <div className={"flex py-1 mt-2 border-b border-solid border-gray-900 items-center " + style.simpleInput}>
                <LockOutlined className="mr-1 text-gray-700"/><input className="flex-grow" type="password"
                                                                     value={rePassword}
                                                                     onChange={(e) => logic.rePassword = e.target.value}
                                                                     placeholder="请输入密码"/>
            </div>
            <div className="flex mt-2">
                <input className="border mr-auto" placeholder="请输入您的邮箱验证码" value={verificationCode}
                       onChange={(e) => logic.verificationCode = e.target.value}/>
                <button className={classNames({
                    'bg-gray-400': mailLoading
                },"p-2 ml-auto shadow-sm border ")} onClick={onSendMailCode}>{mailLoading?<span>{mailCountDown}秒</span>:"点击获取"}</button>
            </div>
            <div className="mt-4">
                <button className="flex flex-center py-2 text-lg text-white bg-red-500 w-full" onClick={onSignUp}>
                    注册
                </button>
            </div>
        </div>
    </div>;
};
export default observer(SignUp);
