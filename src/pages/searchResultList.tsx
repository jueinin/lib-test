import React, { KeyboardEventHandler, useEffect, useRef, useState } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import NavBar from '../components/navbar';
import { SearchOutlined, ArrowDropUpOutlined, ArrowDropDownOutlined } from '@material-ui/icons';
import { InputBase, CircularProgress } from '@material-ui/core';
import { parse } from 'query-string';
import classNames from 'classnames';
import { concatMap, distinctUntilChanged, filter, map, mapTo, skip, switchMap, tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { ask, browserHistory, useStateWithSameRef, whenReachBottom } from '../util';
import { flatten, ifElse } from 'ramda';
import BookItem, { BookItemProps } from '../components/bookItem';
import { BehaviorSubject, bindCallback, fromEvent, interval, of, Subject } from 'rxjs';
import { useHistory } from 'react-router-dom';
import { observable, reaction } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';

type FilterItemName = 'default' | 'sales' | 'ascPrice' | 'descPrice' | 'praise' | 'publishTime';
type Item = {
    title: string;
    value: FilterItemName;
};
type BookData = {
    bookData: { bookId: number; title: string; author: string; price: number; comments: number; goodComments: number; imgUrl: string }[];
    maxPage: number;
};
const filterBarItems: (Item | Item[])[] = [
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
];
class SearchResultListLogic {
    @observable keyword: string = parse(window.location.search).keyword as string;
    @observable currentFilterItem: FilterItemName = 'default';
    @observable page: number = 0;
    @observable bookData: BookData = null;
    @observable searchStr: string = '';
    @observable loading: boolean = false;
    onUseEffect = () => {
        const subject = new BehaviorSubject([this.currentFilterItem, this.keyword]);
        const subscription = subject
            .pipe(
                tap(() => {
                    this.loading = true;
                    this.bookData = null;
                }),
                switchMap(([currentFilterItem, keyword]) =>
                    fromPromise(
                        ask({
                            url: `/api/bookSearch?keyword=${keyword}&sortType=${flatten(filterBarItems).findIndex((value) => value.value === currentFilterItem)}&page=${1}`,
                        })
                    )
                )
            )
            .subscribe((value) => {
                this.bookData = value.data;
                this.page = 1;
                this.loading = false;
            });
        const react = reaction(() => [this.currentFilterItem, this.keyword], subject.next.bind(subject));
        const scrollSubscription = fromEvent(window, 'scroll')
            .pipe(
                whenReachBottom(),
                filter((value) => {
                    return this.page < (this.bookData?.maxPage || 9999);
                }),
                tap(() => (this.loading = true)),
                concatMap((value) =>
                    fromPromise(
                        ask({
                            url: `/api/bookSearch?keyword=${this.keyword}&sortType=${flatten(filterBarItems).findIndex((value) => value.value === this.currentFilterItem)}&page=${this.page + 1}`,
                        }).then((value1) => value1.data)
                    )
                )
            )
            .subscribe((value: BookData) => {
                ifElse(
                    () => this.bookData === null,
                    () => (this.bookData = value),
                    () => {
                        this.bookData.maxPage = value.maxPage;
                        this.bookData.bookData.push(...value.bookData);
                    }
                )(value);
                this.page += 1;
                this.loading = false;
            });
        const keywordSubscription = interval(300)
            .pipe(
                map(() => window.location.search),
                distinctUntilChanged(),
                map((value) => parse(value).keyword),
                skip(1)
            )
            .subscribe((value) => {
                this.keyword = value as string;
                this.currentFilterItem = 'default';
                this.page = 1;
            });
        return () => {
            subscription.unsubscribe();
            scrollSubscription.unsubscribe();
            keywordSubscription.unsubscribe();
            react();
        };
    };
}
const SearchResultList: React.FC = () => {
    const logic = useLocalStore(() => new SearchResultListLogic());
    const { keyword, onUseEffect, page, bookData, currentFilterItem, searchStr, loading } = logic;
    useEffect(onUseEffect, []);
    const history = useHistory();
    return (
        <div>
            <nav>
                <NavBar
                    centerPart={
                        <div className="gray-input mx-2">
                            <SearchOutlined className="text-3xl"/>
                            <InputBase
                                className=""
                                value={searchStr}
                                onChange={(e) => (logic.searchStr = e.target.value)}
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
            <section data-name={'filter-bar'}>
                <div className="flex w-full justify-around shadow-sm text-lg">
                    {filterBarItems.map((value, index) => {
                        if (!Array.isArray(value)) {
                            return (
                                <div
                                    key={value.value}
                                    onClick={() => (logic.currentFilterItem = value.value)}
                                    className={classNames(
                                        {
                                            'text-red-500': currentFilterItem === value.value,
                                        },
                                        'py-2'
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
                                    className="flex py-2"
                                    onClick={() => {
                                        if (isNormal || isDesc) {
                                            logic.currentFilterItem = 'ascPrice';
                                        } else {
                                            logic.currentFilterItem = 'descPrice';
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
                                            style={{width: '0.9rem', height: '0.9rem'}}
                                        />
                                        <ArrowDropDownOutlined
                                            className={classNames({
                                                'text-red-500': currentFilterItem === 'descPrice',
                                            })}
                                            style={{width: '0.9rem', height: '0.9rem'}}
                                        />
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
            </section>
            <section data-name={'结果页'}>
                <div>
                    {(bookData?.bookData || []).length > 0 ? (
                        bookData.bookData.map((value) => {
                            return (
                                <div key={value.bookId} className="cursor-pointer">
                                    <BookItem onClick={() => history.push('/bookDetail?bookId=' + value.bookId)}
                                              key={value.bookId} {...value} />
                                </div>
                            );
                        })
                    ) : !loading && (
                        <div className="h-48 w-full flex-center">
                            <span className="text-red-300"> 暂时无法为您找到搜索结果，换个关键字试试吧！</span>
                        </div>
                    ) }
                </div>
                {loading && (
                    <div className="flex items-center justify-center h-40">
                        <CircularProgress placeholder="loading"/>
                    </div>
                )}
                {(bookData?.maxPage || Number.MAX_VALUE) <= page && page > 1 && (
                    <div className="relative w-full text-center h-6">
                        <span className="text-xs px-2 bg-white text-gray-500 absolute z-10"
                              style={{left: '50%', top: '50%', transform: 'translate(-50%,-50%)'}}>
                            到底啦
                        </span>
                        <div className="bg-gray-500 w-full absolute" style={{top: '50%', height: 2}}/>
                    </div>
                )}
            </section>
        </div>
    );
};
export default observer(SearchResultList);
