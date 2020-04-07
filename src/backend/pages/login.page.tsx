import React, { useState } from 'react';
// @ts-ignore
import logo from '../../resource/logo.png';
import {Button, Form, Input, message} from 'antd';
import { ask } from '../../util';
import {useHistory} from 'react-router-dom';
const Login: React.FC = () => {
    const [formInstance] = Form.useForm();
    const {push} = useHistory();
    const [shouldRequest, setShouldRequest] = useState(false);
    const onFinish = (values) => {
        ask({
            url: `/api/admin/login`,
            method: 'post',
            data: {
                email: values.email,
                password: values.password
            },
        }).then(value => {
            if (value.data.status === 'ok') {
                push('/');
            }
        }).catch(err=>{
            message.info(err.response.data.message);
        })
    };
    const onFinishFailed = () => {
        message.info('请输入正确数据！')
    };
    return (
        <div className="h-screen w-screen flex-center">
            <div id="login" style={{ width: 400, transform: 'translateY(-11.8vh)' }} className="p-4 shadow-2xl">
                <div className="flex-center w-full">
                    <img className="w-8 h-8 inline" src={logo} />
                    <span className="ml-4">啄木鸟书城管理系统</span>
                </div>
                <Form form={formInstance} onFinishFailed={onFinishFailed} onFinish={onFinish} className={'mt-8'} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} labelAlign="left">
                    <div className="mx-8">
                        <Form.Item name={'email'} required label={'邮箱'}>
                            <Input type="email"/>
                        </Form.Item>
                        <Form.Item required label={'密码'} name={'password'}>
                            <Input.Password className="flex items-center" />
                        </Form.Item>
                    </div>
                    <Button type="primary" htmlType="submit" block className="mb-4">
                        登录
                    </Button>
                </Form>
            </div>
        </div>
    );
};
export default Login;
