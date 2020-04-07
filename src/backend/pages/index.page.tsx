import React, { useState } from 'react';
import Wrapper from './wrapper.page';
import { BookOutlined, HomeOutlined } from '@material-ui/icons';
import useSWR from 'swr/esm/use-swr';
import { ask } from '../../util';
import { ShoppingOutlined, MoneyCollectOutlined, UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { shadow } from '../style';
import HighChartsReact from 'highcharts-react-official';
import {assoc, prop} from 'ramda';
import { useQuery } from 'react-query';
import {Button, Table, Tabs} from "antd";
import {ColumnsType} from "antd/lib/table/interface";
import {ColumnType} from "antd/es/table";
type TopData = {
    allPrice: number;
    bookCount: number;
    userCount: number;
    orderCount: number;
};
type OrderAnalData = {
    day: string;
    allPrice: number;
}[];
type SalesDistributionData = {
    sumPrice: number;
    category: string;
}[];
const Item = styled.div`
    grid-template-columns: min-content auto;
    &:hover {
        box-shadow: ${shadow['2xl']};
        transform: translateY(-5px);
        transition: transform 0.5s;
    }
`;
const {TabPane} = Tabs;
type SaleRankTab = "itemRank" | 'userRank';
type SaleRankInfo= {
    tab: SaleRankTab;
    page: number,
    itemData: any,
    userData: any
}
const IndexPage = () => {
    const [saleRankInfo, setSalesRankInfo] = useState<SaleRankInfo>({
        tab: 'itemRank',
        page: 0,
        itemData: null,
        userData: null
    });
    const { data: topData } = useQuery<TopData, string>(`/api/admin/indexTopInfo`, (url) => ask({ url: url }).then(prop('data')));
    const { data: orderAnalData } = useQuery<OrderAnalData, string>(`/api/admin/indexPerformanceAnal`, (url) => ask({ url }).then(prop('data')));
    const { data: salesDistributionData } = useQuery<SalesDistributionData, string>(`/api/admin/salesDistribution`, (url) => ask({ url }).then(prop('data')));
    const { } = useQuery('/api/admin/salesRank', (url) =>
        ask({
            url: url,
            params: {
                type: 'itemRank',
                page: 1,
            },
        }).then(prop('data')),
        {
            onSuccess: data => setSalesRankInfo(assoc('itemData',data,saleRankInfo))
        }
    );

    const renderTopData = () => {
        return (
            <React.Fragment>
                <Item className="bg-blue-600 p-4 grid gap-4 top-item">
                    <div data-name={'icon-wrapper'} className=" p-2 rounded-full border-2 inline-flex">
                        <div
                            className="p-3 inline-flex items-center rounded-full border border-white"
                            style={{
                                backgroundColor: 'rgba(1,0,0,0.2)',
                            }}
                        >
                            <ShoppingOutlined className={'text-4xl text-white'} />
                        </div>
                    </div>
                    <div
                        className="grid text-white"
                        style={{
                            gridTemplateRows: 'mincontent  auto',
                        }}
                    >
                        <span className="text-4xl">{topData.allPrice}</span>
                        <span className="text-xl">总销售额</span>
                    </div>
                </Item>
                <Item className="bg-indigo-500 p-4 grid gap-4 top-item">
                    <div data-name={'icon-wrapper'} className=" p-2 rounded-full border-2 inline-flex">
                        <div
                            className="p-3 inline-flex items-center rounded-full border border-white"
                            style={{
                                backgroundColor: 'rgba(1,0,0,0.2)',
                            }}
                        >
                            <MoneyCollectOutlined className={'text-4xl text-white'} />
                        </div>
                    </div>
                    <div
                        className="grid text-white"
                        style={{
                            gridTemplateRows: 'mincontent  auto',
                        }}
                    >
                        <span className="text-4xl">{topData.orderCount}</span>
                        <span className="text-xl">总订单</span>
                    </div>
                </Item>
                <Item className="bg-red-500 p-4 grid gap-4 top-item">
                    <div data-name={'icon-wrapper'} className=" p-2 rounded-full border-2 inline-flex">
                        <div
                            className="p-3 inline-flex items-center rounded-full border border-white"
                            style={{
                                backgroundColor: 'rgba(1,0,0,0.2)',
                            }}
                        >
                            <BookOutlined className={'text-4xl text-white'} />
                        </div>
                    </div>
                    <div
                        className="grid text-white"
                        style={{
                            gridTemplateRows: 'mincontent  auto',
                        }}
                    >
                        <span className="text-4xl">{topData.bookCount}</span>
                        <span className="text-xl">总藏书</span>
                    </div>
                </Item>
                <Item className="bg-green-500 p-4 grid gap-4 top-item">
                    <div data-name={'icon-wrapper'} className=" p-2 rounded-full border-2 inline-flex">
                        <div
                            className="p-3 inline-flex items-center rounded-full border border-white"
                            style={{
                                backgroundColor: 'rgba(1,0,0,0.2)',
                            }}
                        >
                            <UserOutlined className={'text-4xl text-white'} />
                        </div>
                    </div>
                    <div
                        className="grid text-white"
                        style={{
                            gridTemplateRows: 'mincontent  auto',
                        }}
                    >
                        <span className="text-4xl">{topData.userCount}</span>
                        <span className="text-xl">用户总数</span>
                    </div>
                </Item>
            </React.Fragment>
        );
    };
    const renderOrderAnalData = () => {
        return (
            <HighChartsReact
                options={{
                    chart: {
                        type: 'line',
                    },
                    series: [
                        {
                            name: '销售额走势',
                            data: orderAnalData.map((value) => Number(value.allPrice)),
                            type: 'line',
                        },
                    ],
                    xAxis: {
                        categories: orderAnalData.map((value) => value.day),
                    },
                    yAxis: {
                        title: {
                            text: '销售额',
                        },
                    },
                    title: {
                        text: '<div class="text-blue-500 mb-4">销售业绩(销售额)</div>',
                        align: 'left',
                        useHTML: true,
                    },
                    credits: {
                        enabled: false,
                    },
                }}
            />
        );
    };
    const renderSalesDistributionData = () => {
        return (
            <HighChartsReact
                options={{
                    chart: {
                        type: 'pie',
                    },
                    title: {
                        text: '<div class="text-red-500">图书各类别销售份额</div>',
                        align: 'left',
                        useHTML: true,
                    },
                    series: [
                        {
                            data: salesDistributionData.map((value) => {
                                return {
                                    y: value.sumPrice,
                                    name: value.category,
                                    // type: 'pie'
                                };
                            }),
                            type: 'pie',
                            name: '销售额',
                            colorByPoint: true,
                        },
                    ],
                    credits: {
                        enabled: false,
                    },
                }}
            />
        );
    };
    const renderSalesRank = () => {
        const itemRankColumn: ColumnType<any>[] = [
            {
                title: '排名',
                dataIndex: ['book','id'],
                render: (text, record, index) => saleRankInfo.page * 10 + index + 1
            },
            {
                title: '商品名称',
                dataIndex: ['book','name'],
                render: text => <div className="truncate-2-lines" style={{maxWidth: 350}} title={text}>{text}</div>
            },
            {
                title: '书籍id',
                dataIndex: ['book','id']
            },
            {
                title: '单价',
                dataIndex: ['book','price'],
            },
            {
                title: '销售额',
                dataIndex: 'allPrice',
            }
        ];
        const userRankColumn: ColumnType<any>[] = [
            {
                title: '排名',
                dataIndex: ['user', 'id'],
                render: text => <div>{text}</div>
            },
            {
                title: '客户名称',
                dataIndex: ['user','userName'],
            },
            {
                title: '该用户订单总量',
                dataIndex: ['user','id']
            },
            {
                title: '用户总购买金额',
                dataIndex: ['sumPrice']
            },
            {
                title: '操作',
                dataIndex: ['user','id'],
                render: text => {
                    return <Button>操作</Button>
                }
            }
        ]
        return <div>
            <div>销售榜单</div>
            <Tabs activeKey={saleRankInfo.tab} onChange={(str: SaleRankTab) => {
                if (str === "userRank" && !saleRankInfo.userData) {
                    ask({
                        url: '/api/admin/salesRank',
                        params: {
                            type: 'userRank',
                            page: 0
                        }
                    }).then(value => {
                        setSalesRankInfo({...saleRankInfo,userData: value.data});
                    })
                }
                setSalesRankInfo({...saleRankInfo, tab: str});
            }}>
                <TabPane key="itemRank" tab={"产品销售额榜"}/>
                <TabPane key="userRank" tab={'客户购买榜'}/>
            </Tabs>
            {saleRankInfo.tab === 'itemRank' ? <Table pagination={false} columns={itemRankColumn} dataSource={saleRankInfo.itemData}/> : <Table pagination={false} columns={userRankColumn} dataSource={saleRankInfo.userData || []}/>}
        </div>;
    };
    return (
        <div>
            <div className="w-full h-full bg-gray-200 p-4">
                <div className="my-4 flex items-center">
                    <HomeOutlined/>
                    首页
                </div>
                <div className="grid grid-cols-4 gap-4 bg-white">{topData && renderTopData()}</div>
                <div className="grid grid-cols-4 gap-4 mt-8">
                    <div
                        className="pt-4 bg-white"
                        style={{
                            gridColumn: '1/4',
                        }}
                    >
                        {orderAnalData && renderOrderAnalData()}
                    </div>
                    <div className="p-4 bg-white">{salesDistributionData && renderSalesDistributionData()}</div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-8">
                    <div
                        className="p-4 bg-white"
                        style={{
                            gridColumn: '1/3',
                        }}
                    >
                        {(saleRankInfo.itemData || saleRankInfo.userData) && renderSalesRank()}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default IndexPage;
