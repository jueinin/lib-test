import React, {useEffect, useRef, useState} from 'react';
import { pipe, prop, slice } from 'ramda';
import { parse } from 'query-string';
import { Button, DatePicker, Form, Input, Select } from 'antd';
import { useQuery } from 'react-query';
import { ask } from '../../util';
import Editor from '../../components/editor';
import 'quill/dist/quill.snow.css';
import Quill from 'quill';
import Moment from 'moment';
const EditBook: React.FC = () => {
    const [isAddMode] = useState(() => {
        return location.pathname === '/addBook';
    });
    const bookId = useRef((() => {
        if (isAddMode) {
            return;
        } else {
            return Number(parse(location.search.slice(1)).bookId);
        }
    })());
    const [formInstance] = Form.useForm();
    const { data: categoryList } = useQuery<string[], string>('/api/admin/getCategory', (url) => ask({ url }).then(prop('data')));
    const [loading, setLoading] = useState(false);
    const editorInstance = useRef<Quill>(null);
    const {} = useQuery(isAddMode ? null : `/api/admin/getBook?bookId=${bookId.current}`, url => ask({url}).then(value => {
        const publishDate = Moment(value.data.publishDate, 'YYYY-MM');
        formInstance.setFieldsValue({
            ...value.data,
            publishDate,
        });
        if (value.data.bookContent) {
            //
            editorInstance.current.setContents(value.data.bookCotent.deltaContent);
        }
    }));

    const onFinish = (values) => {
        const publishDate = Moment(values.publishDate).format("YYYY-MM");
        setLoading(true);
        ask({
            url: `/api/admin/addBook`,// 根据有无bookId判断是更新数据还是新增数据
            method: 'post',
            data: {
                plainData: {
                    ...values,
                    publishDate,
                    id: bookId.current
                },
                content: {
                    htmlContent: document.getElementById('editor').innerHTML,
                    deltaContent: JSON.stringify(editorInstance.current.getContents()),
                },
            },
        }).finally(() => setLoading(false));
    };
    return (
        <div className="w-full flex justify-center h-full">
            <div className="" style={{ width: 700 }}>
                <div className="text-2xl text-center mt-10 transform">{isAddMode?"添加图书":'编辑图书'}</div>
                <Form labelCol={{ span: 3 }} labelAlign="left" onFinish={onFinish} form={formInstance} style={{ marginTop: '20%' }}>
                    <Form.Item
                        rules={[
                            {
                                required: true,
                                message: '必填',
                            },
                        ]}
                        name="name"
                        label={'标题'}
                        required
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name={'description'}
                        label={'描述'}
                        rules={[
                            {
                                type: 'string',
                                max: 200,
                                message: '最大200字',
                            },
                        ]}
                    >
                        <Input.TextArea placeholder="输入书的简短描述，1-200字即可" />
                    </Form.Item>
                    <Form.Item name={'author'} label={'作者'} required rules={[
                        {
                            required: true,
                            message: '必填',
                        },
                    ]}>
                        <Input className={'w-1/4'} />
                    </Form.Item>
                    <Form.Item required label={'单价'} name={'price'} rules={[
                        {
                            required: true,
                            message: '必填',
                        },
                    ]}>
                        <Input prefix={<span className="text-red-500">￥</span>} suffix={'元'} placeholder="图书单价" className={'w-1/4'} />
                    </Form.Item>
                    <Form.Item label={'出版社'} name={'publisher'} required rules={[
                        {
                            required: true,
                            message: '必填',
                        },
                    ]}>
                        <Input placeholder="出版社" className={'w-1/4'} />
                    </Form.Item>
                    <Form.Item name={'publishDate'} label={'出版日期'} required rules={[
                        {
                            required: true,
                            message: '必填',
                        },
                    ]}>
                        <DatePicker className={'w-1/4'} />
                    </Form.Item>
                    <Form.Item label={'分类'} name={'category'} required rules={[
                        {
                            required: true,
                            message: '必填',
                        },
                    ]}>
                        <Select className={'w-1/4'}>{categoryList && categoryList.map((value) => <Select.Option value={value}>{value}</Select.Option>)}</Select>
                    </Form.Item>
                    <div id="quill-editor">
                        <Editor getEditorInstance={(instance) => (editorInstance.current = instance)} />
                    </div>
                    <Button htmlType="submit" size={'large'} loading={loading} type="primary" className="mt-4" block>
                        {isAddMode?"添加图书":'编辑图书'}
                    </Button>
                </Form>
            </div>
        </div>
    );
};
export default EditBook;
