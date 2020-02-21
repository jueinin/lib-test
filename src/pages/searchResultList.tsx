import React, { KeyboardEventHandler, useEffect, useRef, useState } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import NavBar from '../components/navbar';
import { SearchOutlined, ArrowDropUpOutlined, ArrowDropDownOutlined } from '@material-ui/icons';
import { InputBase, CircularProgress } from '@material-ui/core';
import { parse } from 'query-string';
import classNames from 'classnames';
import { useObservable, useSubscription } from 'observable-hooks';
import { concatAll, concatMap, concatMapTo, distinctUntilChanged, exhaustMap, filter, map, mapTo, mergeAll, mergeMapTo, switchMap, tap, throttleTime } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { ask, useStateWithSameRef } from '../util';
import { flatten } from 'ramda';
import BookItem, { BookItemProps } from '../components/bookItem';
import { fromEvent, interval } from 'rxjs';
import { useHistory } from 'react-router-dom';
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
const SearchResultList: React.FC = () => {
    const [keyword, setKeyword, refKeyword] = useStateWithSameRef(parse(window.location.search).keyword);
    const keyword$ = useObservable(() =>
        interval(300).pipe(
            map(() => window.location.search),
            distinctUntilChanged(),
            map((value) => parse(value).keyword)
        )
    ); // listen to change of keyword to refresh data,
    // doesn't seems to have the onURLSearchChange event,so interval listen
    useSubscription(keyword$, (value) => {
        setKeyword(value);
        setCurrentFilterItem('default');
        setPage(1);
    });
    const [currentFilterItem, setCurrentFilterItem] = useState<FilterItemName>('default');
    const [page, setPage, refPage] = useStateWithSameRef(1);
    const [bookData, setBookData, refBookData] = useStateWithSameRef<BookData | null>(null);
    const currentFilterItem$ = useObservable(
        (value) =>
            value.pipe(
                tap(() => setPage(1)),
                switchMap(([currentFilterItem]) =>
                    fromPromise(
                        ask({
                            url: `/api/bookSearch?keyword=${refKeyword.current}&sortType=${flatten(filterBarItems).findIndex((value) => value.value === currentFilterItem)}&page=${1}`,
                        })
                    )
                ),
                map((value) => value.data)
            ),
        [currentFilterItem, keyword] as const
    );
    useSubscription(currentFilterItem$, (value) => {
        setBookData(value);
    });
    const scroll$ = useObservable(() =>
        fromEvent(window, 'scroll').pipe(
            throttleTime(250),
            map(() => document.body),
            filter((body) => body.scrollHeight - body.clientHeight - body.scrollTop < 150 && refPage.current <= (bookData?.maxPage || 1)),
            exhaustMap(() => {
                return fromPromise(
                    ask({
                        url: `/api/bookSearch?keyword=${refKeyword.current}&sortType=${flatten(filterBarItems).findIndex((value) => value.value === currentFilterItem)}&page=${refPage.current + 1}`,
                    })
                );
            }),
            map((value) => value.data)
        )
    );

    useSubscription(scroll$, (value: BookData) => {
        setPage((page: number) => page + 1);
        let data = bookData;
        data!.maxPage = value.maxPage;
        data!.bookData = data!.bookData.concat(value.bookData);
        setBookData({ bookData: [], maxPage: 0, ...data });
    });
    const history = useHistory();
    const onSearchBarEnter: KeyboardEventHandler = (event) => {
        if (event.key === 'Enter') {
            history.push(`${window.location.pathname}?keyword=${searchStr}`);
        }
    };
    const [searchStr, setSearchStr] = useState('');
    return (
        <div>
            <nav>
                <NavBar
                    centerPart={
                        <div className="gray-input mx-2">
                            <SearchOutlined className="text-3xl" />
                            <InputBase className="" value={searchStr} onChange={(e) => setSearchStr(e.target.value)} onKeyPress={onSearchBarEnter} placeholder={refKeyword.current as string} />
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
                                    onClick={() => setCurrentFilterItem(value.value)}
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
            <section data-name={'结果页'}>
                {bookData ? (
                    <div>
                        {bookData.bookData.map((value) => {
                            return (
                                <div key={value.bookId} className="cursor-pointer">
                                    <BookItem onClick={() => history.push('/bookDetail?bookId=' + value.bookId)} key={value.bookId} {...value} />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-40">
                        <CircularProgress placeholder="loading" />
                    </div>
                )}
            </section>
        </div>
    );
};
export default SearchResultList;
