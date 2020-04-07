import React, {useState} from 'react';
import { BookOutlined, SearchOutlined } from '@ant-design/icons';
import {Button, DatePicker, Form, Input, message, Select, Space} from "antd";
import {useQuery} from "react-query";
import {ask} from "../../util";
import {prop} from "ramda";
import {Moment} from "moment";
const FormItem = Form.Item;
const BookManage: React.FC = () => {
    const {data: categoryList} = useQuery<string[], string>('/api/admin/getCategory', url => ask({url}).then(prop('data')));
    const [formInstance] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const onFinished = (values) => {
        if (Number(values.price.from) < Number(values.price.to)) {
            message.info('价格区间错误');
            return;
        }
        ask({
            url: `/api/admin/queryBook`,
            method: 'post',
            data: {
                id: Number(values.id),
                name: values.name,
                author: values.author,
                publisher: values.publisher,
                category: values.category,
                price: {
                    from: Number(values.price.from),
                    to: Number(values.price.to)
                },
                createDate: values.createDate.map((value: Moment) => value.unix())
            }
        });
    };
    return (
        <div className="bg-gray-200 w-full h-full p-4">
            <div className="mb-8">
                <BookOutlined/>
                书籍管理
            </div>
            <div className="bg-white w-full p-4  py-6">
                <Form onFinish={onFinished} form={formInstance} layout="inline" className=''>
                    <FormItem name={'id'} label={'id'} className="mb-4" rules={[
                        {
                            transform: Number,
                            type: 'integer'
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
                        <FormItem name={['price','from']} label={'价格区间'}>
                            <Input className="" style={{width: 60}} placeholder="从"/>
                        </FormItem>
                        <FormItem noStyle name={['price','to']}>
                            <Input style={{width: 60}} placeholder="到"/>
                        </FormItem>
                    </Input.Group>
                    <FormItem label={'上架时间'} className="mb-4 ml-4" name={'createDate'}>
                        <DatePicker.RangePicker placeholder={['开始时间','结束时间']}/>
                    </FormItem>
                    <Button type="primary" htmlType="submit" loading={submitting} icon={<SearchOutlined/>}>搜索</Button>
                    <Button htmlType="reset"
                            onClick={() => formInstance.resetFields(['id', 'name', 'author', 'publisher', 'category', 'price.from','price.to', 'createDate'])}>重置</Button>
                    <Button>添加新书</Button>
                </Form>
            </div>
        </div>
    );
};
export default BookManage;
