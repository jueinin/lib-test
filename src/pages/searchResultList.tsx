import React, { KeyboardEventHandler, useEffect, useMemo, useRef, useState } from 'react';
import NavBar from '../components/navbar';
import {SearchOutlined, ArrowDropUpOutlined, ArrowDropDownOutlined, ShoppingCartOutlined} from '@material-ui/icons';
import { InputBase, CircularProgress } from '@material-ui/core';
import { parse } from 'query-string';
import classNames from 'classnames';
import {ask, browserHistory, useReachBottom} from '../util';
import { flatten, ifElse } from 'ramda';
import BookItem  from '../components/bookItem';
import { useHistory } from 'react-router-dom';
import { useInfiniteQuery } from 'react-query';
import BookItemGrid from "../components/BookItemGrid";

type FilterItemName = 'default' | 'sales' | 'ascPrice' | 'descPrice' | 'praise' | 'publishTime';
type Item = {
    title: string;
    value: FilterItemName;
};
export type BookData = {
    bookData: { bookId: number; title: string; author: string; price: number; comments: number; goodComments: number; imgUrl: string }[];
    maxPage: number;
};
export default () => {
    const history = useHistory();
    const keyword = useMemo(() => parse(window.location.search).keyword as string, [location.search]);
    const [currentFilterItem, setCurrentFilterItem] = useState<FilterItemName>('default');
    const filterBarItems = useRef<(Item | Item[])[]>([
        {
            title: '默认',
            value: 'default',
        },
        {
            title: '销量',
            value: 'sales',
        },
        [
            {
                title: '价格升序',
                value: 'ascPrice',
            },
            {
                title: '价格降序',
                value: 'descPrice',
            },
        ],
        {
            title: '好评',
            value: 'praise',
        },
        {
            title: '出版时间',
            value: 'publishTime',
        },
    ]);
    const Nav = () => {
        const [searchStr, setSearchStr] = useState('');
        return (
            <nav>
                <NavBar
                    centerPart={
                        <div className="gray-input mx-2">
                            <SearchOutlined className="text-3xl" />
                            <InputBase
                                className=""
                                value={searchStr}
                                onChange={(e) => setSearchStr(e.target.value)}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter') {
                                        history.push(`${window.location.pathname}?keyword=${searchStr}`);
                                    }
                                }}
                                placeholder={keyword}
                            />
                        </div>
                    }
                />
            </nav>
        );
    };
    const FilterBar = () => {
        return (
            <section data-name={'filter-bar'}>
                <div className="flex w-full justify-around shadow-sm text-lg">
                    {filterBarItems.current.map((value, index) => {
                        if (!Array.isArray(value)) {
                            return (
                                <div
                                    key={value.value}
                                    onClick={() => setCurrentFilterItem(value.value)}
                                    className={classNames(
                                        {
                                            'text-red-500': currentFilterItem === value.value,
                                        },
                                        'py-2 hidden'
                                    )}
                                >
                                    {value.title}
                                </div>
                            );
                        } else {
                            const isNormal = currentFilterItem !== 'descPrice' && currentFilterItem !== 'ascPrice';
                            const isAsc = currentFilterItem === 'ascPrice';
                            const isDesc = currentFilterItem === 'descPrice';
                            return (
                                <div
                                    key={'price'}
                                    className="flex py-2 hidden"
                                    onClick={() => {
                                        if (isNormal || isDesc) {
                                            setCurrentFilterItem('ascPrice');
                                        } else {
                                            setCurrentFilterItem('descPrice');
                                        }
                                    }}
                                >
                                    <div
                                        className={classNames({
                                            'text-red-500': isAsc || isDesc,
                                        })}
                                    >
                                        价格
                                    </div>
                                    <div className="flex-col flex ml-1">
                                        <ArrowDropUpOutlined
                                            className={classNames({
                                                'text-red-500': currentFilterItem === 'ascPrice',
                                            })}
                                            style={{ width: '0.9rem', height: '0.9rem' }}
                                        />
                                        <ArrowDropDownOutlined
                                            className={classNames({
                                                'text-red-500': currentFilterItem === 'descPrice',
                                            })}
                                            style={{ width: '0.9rem', height: '0.9rem' }}
                                        />
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
            </section>
        );
    };
    const List = () => {
        // @ts-ignore
        const { fetchMore, data, isFetching: loading, refetch, canFetchMore } = useInfiniteQuery<BookData>(
            [`/api/bookSearch`, keyword, currentFilterItem],
            (url, keyword, currentFilterItem, page = 1) => {
                return ask({
                    url: url,
                    params: {
                        keyword: keyword,
                        sortType: flatten(filterBarItems.current).findIndex((value) => value.value === currentFilterItem),
                        page,
                    },
                }).then((value) => {
                    return value.data;
                });
            },
            {
                getFetchMore: (lastPage, allPages) => (allPages.length < lastPage.maxPage ? allPages.length + 1 : false),
                refetchOnWindowFocus: false,
            }
        );
        useReachBottom(document.getElementById('contt'), fetchMore);
        return (
            <section id="contt" className="flex-grow overflow-auto" data-name={'结果页'}>
                <div className="grid grid-cols-2 gap-2 bg-gray-300 mt-2">
                    {data.map((item) =>
                        item.bookData.map((value) => {
                            return (
                                <BookItemGrid {...value} onClick={()=>history.push('/bookDetail?bookId=' + value.bookId)} />
                            );
                        })
                    )}
                </div>
                {data.length === 1 && data[0].bookData.length == 0 ? (
                    <div className="h-48 w-full flex-center">
                        <span className="text-red-300"> 暂时无法为您找到搜索结果，换个关键字试试吧！</span>
                    </div>
                ) : (
                    !canFetchMore && !loading && (
                        <div className="relative w-full text-center h-6">
                            <span className="text-xs px-2 bg-white text-gray-500 absolute z-10" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
                                到底啦
                            </span>
                            <div className="bg-gray-500 w-full absolute" style={{ top: '50%', height: 2 }} />
                        </div>
                    )
                )}
                {loading && (
                    <div className="flex items-center justify-center h-40">
                        <CircularProgress placeholder="loading" />
                    </div>
                )}
            </section>
        );
    };
    return (
        <div className="flex flex-col h-screen">
            <Nav />
            <FilterBar />
            <List />
        </div>
    );
};
