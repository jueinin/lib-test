import React, {useState} from 'react';
import { BookOutlined, SearchOutlined } from '@ant-design/icons';
import {Button, DatePicker, Form, Input, message, Modal, Select, Space, Table, Tooltip} from "antd";
import {useQuery} from "react-query";
import {ask} from "../../util";
import {__, assoc, path, pipe, prop} from "ramda";
import {Moment} from "moment";
import {useHistory} from 'react-router-dom';
import {ExclamationCircleOutlined} from "@ant-design/icons/lib";
const FormItem = Form.Item;
const BookManage: React.FC = () => {
    const {data: categoryList} = useQuery<string[], string>('/api/admin/getCategory', url => ask({url}).then(prop('data')));
    const [formInstance] = Form.useForm();
    const history = useHistory();
    const [submitting, setSubmitting] = useState(false);
    const [tableInfo,setTableInfo] = useState({
        list: [],
        currentPage: 0,
        maxPage: null,
        deleteLoading: false
    });
    const requestData = (values, page: number) => {
        setSubmitting(true);
        setTableInfo({...tableInfo, currentPage: 0})
        return ask({
            url: `/api/admin/queryBook`,
            method: 'post',
            data: {
                id: Number(values.id),
                name: values.name,
                author: values.author,
                publisher: values.publisher,
                category: values.category,
                price: {
                    from: values?.price?.from ? Number(values.price.from) : null,
                    to: values?.price?.to ? Number(values.price.to) : null
                },
                createDate: values.createDate ? values?.createDate.map((value: Moment) => value.unix()) : [null, null],
                page: page + 1
            }
        }).then(value => {
            setTableInfo({
                ...tableInfo,
                list: value.data.list,
                maxPage: value.data.maxPage,
                currentPage: page + 1
            });
        }).finally(() => setSubmitting(false));
    };
    const onFinished = (values) => {
        if (Number(values.price.from) > Number(values.price.to)) {
            message.info('价格区间错误');
            return;
        }
        const mustHaveOneValue = Object.keys(values).filter(value => value!=='price').map(value => values[value]).some(value => !!value);
        if (!mustHaveOneValue &&  !(values.price.from && values.price.to)) {  // 这个判断有点点绕
            message.info('至少输入一个条件');
            return;
        }
        requestData(values,0);
    };
    const renderTable = () => {
        const onDeleteRow = (id) => {
            ask({
                url: '/api/admin/deleteBook',
                method: 'post',
                data: {bookId: id}
            }).then(value => {
                if (value.data.status === 'ok') {
                    message.success('删除成功');
                }
            })
        };
        const columns = [
            {
                title: 'id',
                dataIndex: 'id'
            },
            {
                title: '书名',
                dataIndex: "name",
                render: text => {
                    return <div title={text} className="truncate-2-lines" style={{width: 250}}>{text}</div>
                }
            },
            {
                title: '书籍描述',
                dataIndex: "description",
                render: text => {
                    return text?<Tooltip overlay={<div className="select-auto">{text}</div>} className="">
                        <div title={text} className="truncate-2-lines" style={{width: 150}}>{text}</div>
                    </Tooltip>:<span className="text-red-500">暂无描述</span>
                }
            },
            {
                title: "作者",
                dataIndex: 'author',
                render: text => <div title={text} className="truncate-2-lines" style={{width: 150}}>{text}</div>
            },
            {
                title: '出版社',
                dataIndex: "publisher"
            },
            {
                title: '出版时间',
                dataIndex: 'publishDate'
            },
            {
                title: '分类',
                dataIndex: 'category'
            },
            {
                title: "价格",
                dataIndex: "price",
                render: text=><div className="text-red-500">￥{text}</div>
            },
            {
                title: '上架时间',
                dataIndex: 'createDate',
                render: text => <div>{(() => {
                    const date = new Date(text);
                    return `${date.getFullYear()}-${date.getMonth() + 1}`;
                })()}</div>
            },
            {
                title: '操作',
                dataIndex: 'id',
                render:(text,record,index)=>{
                    return <div>
                        <Button type="primary" onClick={()=>{
                            history.push('/editBook?bookId=' + record.id);
                        }}>编辑</Button>
                        <Button type="danger" onClick={()=>{
                            Modal.confirm({
                                title: '确认删除吗',
                                icon: <ExclamationCircleOutlined/>,
                                content: '确认删除后将无法恢复，请谨慎操作!',
                                onOk: ()=>{
                                    onDeleteRow(record.id);
                                }
                            })
                        }}>删除</Button>
                    </div>
                }
            }
        ];
        return <div className="mt-4 w-full">
            <Table columns={columns} dataSource={tableInfo.list} pagination={{
                current: tableInfo.currentPage,
                hideOnSinglePage: true,
                total: tableInfo.maxPage * 10,
                onChange: page => requestData(formInstance.getFieldsValue(true), page-1)
            }}/>
        </div>;
    };
    return (
        <div className="bg-gray-200 w-full h-full p-4">
            <div className="mb-8 flex">
                <BookOutlined/>
                书籍管理
                <Button className="ml-auto" onClick={()=>history.push('/addBook')}>添加图书</Button>
            </div>
            <div className="bg-white w-full p-4  py-6">
                <Form onFinish={onFinished} form={formInstance} layout="inline" className=''>
                    <FormItem name={'id'} label={'id'} className="mb-4" rules={[
                        {
                            validator: async (rules, value) => {
                                if (!isNaN(Number(value))) {
                                    return Promise.resolve();
                                }
                                if (!value) {
                                    return Promise.reject();
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}>
                        <Input placeholder="请输入书id查询" allowClear/>
                    </FormItem>
                    <FormItem label={'书名'} name={'name'}>
                        <Input placeholder="请输入书名查询" allowClear/>
                    </FormItem>
                    <FormItem label={'作者'} className="mb-4" name={'author'}>
                        <Input placeholder="请输入作者名查询" allowClear/>
                    </FormItem>
                    <FormItem label={'出版社'} name={'publisher'}>
                        <Input placeholder="请输入出版社查询" allowClear/>
                    </FormItem>
                    <FormItem label={'分类'} className="mb-4" name={'category'}>
                        <Select style={{width: 80}}>
                            {categoryList && categoryList.map(value => {
                                return <Select.Option value={value} title={value}>{value}</Select.Option>
                            })}
                        </Select>
                    </FormItem>
                    <Input.Group compact size="default" className="inline w-auto">
                        <FormItem name={['price', 'from']} label={'价格区间'} rules={[
                            {
                                validator: async (rules, value) => {
                                    if (!isNaN(Number(value))) {
                                        return Promise.resolve();
                                    }
                                    if (!value) {
                                        return Promise.reject();
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}>
                            <Input className="" style={{width: 60}} placeholder="从"/>
                        </FormItem>
                        <FormItem noStyle name={['price', 'to']} rules={[
                            {
                                validator: async (rules, value) => {
                                    if (!isNaN(Number(value))) {
                                        return Promise.resolve();
                                    }
                                    if (!value) {
                                        return Promise.reject();
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}>
                            <Input style={{width: 60}} placeholder="到"/>
                        </FormItem>
                    </Input.Group>
                    <FormItem label={'上架时间'} className="mb-4 ml-4" name={'createDate'}>
                        <DatePicker.RangePicker placeholder={['开始时间', '结束时间']}/>
                    </FormItem>
                    <Button type="primary" htmlType="submit" loading={submitting} icon={<SearchOutlined/>}>搜索</Button>
                    <Button className="ml-4" htmlType="reset"
                            onClick={() => formInstance.resetFields(['id', 'name', 'author', 'publisher', 'category', 'price.from', 'price.to', 'createDate'])}>重置</Button>
                </Form>
                <div>
                    {tableInfo.list && renderTable()}
                </div>
            </div>
        </div>
    );
};
export default BookManage;
