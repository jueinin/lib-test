import React, { useEffect, useMemo, useRef, useState } from 'react';
import NavBar from '../components/navbar';
import { SearchOutlined } from '@material-ui/icons';
import HighlightOffOutlinedIcon from '@material-ui/icons/HighlightOffOutlined';
import { ask, debounceAsync } from '../util';
import * as R from 'ramda';
import { useHistory } from 'react-router-dom';
import { useQuery } from 'react-query';
import { adjust, always, append, assoc, equals, findIndex, ifElse, lift, pipe, prop, tap } from 'ramda';
import { read } from 'fs';
interface SearchTipItem {
    name: string;
}
interface LocalItem {
    name: string;
    count: number;
}
export default () => {
    const saveItemToLocalStorage = (str: string) => {
        const items = localStorage.getItem('localSearch') || JSON.stringify([]);
        pipe(
            JSON.parse,
            (localItems: LocalItem[]) => { // add item or update
                const index = findIndex((a: LocalItem) => a.name === str, localItems);
                return ifElse(
                    equals(-1), () => append({ name: str, count: 1 },localItems), (index) => {
                        return adjust<LocalItem>(
                            index, (localItem) => {
                                return assoc('count', localItem.count + 1, localItem);
                            }, localItems
                        );
                    }
                )(index);
            }, JSON.stringify, (v) => localStorage.setItem('localSearch', v)
        )(items);
    };
    const history = useHistory();
    const SearchComponent = () => {
        const [searchStr, setSearchStr] = useState('');
        const fn = useRef(null);
        useEffect(() => {
            const requestFn = (url) => ask({ url }).then(prop('data'));
            fn.current = debounceAsync(requestFn, [], 200);
        }, []);
        const { data: searchTips } = useQuery<SearchTipItem[], any>(searchStr && `/api/searchTips?title=${searchStr}`, fn.current, {});
        return (
            <section className="relative">
                <section
                    data-name={'搜索栏'}
                    className="grid gap-2 items-center border-b border-gray-400 shadow-sm py-2"
                    style={{
                        gridTemplateColumns: '1fr auto',
                    }}
                >
                    <div
                        className="grid items-center bg-gray-300 rounded-lg"
                        style={{
                            gridTemplateColumns: 'auto 1fr auto',
                        }}
                    >
                        <SearchOutlined className="ml-2" />
                        <input
                            className="bg-gray-300 py-1 rounded-lg"
                            value={searchStr}
                            autoFocus
                            onChange={(event) => setSearchStr(event.target.value)}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    saveItemToLocalStorage(searchStr);
                                    history.push(`/searchResultList?keyword=${searchStr}`);
                                }
                            }}
                        />
                        {searchStr && <HighlightOffOutlinedIcon onClick={() => setSearchStr('')} className="mr-2 text-2xl text-gray-500 cursor-pointer" />}
                    </div>
                    <div
                        className="px-2"
                        onClick={() => {
                            if (searchStr) {
                                saveItemToLocalStorage(searchStr);
                                history.push(`/searchResultList?keyword=${searchStr}`);
                            } else history.goBack();
                        }}
                    >
                        {searchStr.length === 0 ? '取消' : '搜索'}
                    </div>
                </section>
                {searchTips && searchTips.length !== 0 && (
                    <div className="absolute w-full bg-white h-screen">
                        {searchTips.map((value, index) => {
                            return (
                                <div
                                    onClick={() => {
                                        saveItemToLocalStorage(value.name);
                                        history.push(`/searchResultList?keyword=${searchStr}`)
                                    }}
                                    className="flex cursor-pointer items-center px-4 py-2 border-gray-300 border-solid border-b hover:bg-gray-200"
                                    key={value.name}
                                >
                                    <div className="truncate-1-lines w-full">{value.name}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        );
    };
    const HotSearch = () => {
        const { data: hotSearchData } = useQuery(`/api/hotSearchKeyword`, (url) => ask({ url }).then(prop('data')));
        return (
            <section data-name={'热门'}>
                <div className="text-lg">热门搜索</div>
                <div className="flex flex-wrap content-between">
                    {hotSearchData &&
                        hotSearchData.keywords.map((value, index) => {
                            return (
                                <div
                                    key={value}
                                    onClick={() => {
                                        history.push(`/searchResultList?keyword=${value}`);
                                        saveItemToLocalStorage(value);
                                    }}
                                    className="p-2 bg-gray-400 rounded-lg mx-1 mt-2 whitespace-no-wrap overflow-hidden"
                                    style={{ maxWidth: '8rem', textOverflow: 'ellipsis' }}
                                >
                                    {value}
                                </div>
                            );
                        })}
                </div>
            </section>
        );
    };
    const RecentSearch = () => {
        const { data: localSearchHistory } = useQuery('getLocalSearch', (url) => {
            const items: string = localStorage.getItem('localSearch') || JSON.stringify([]);
            return R.pipe(always(items), JSON.parse, R.sort(R.descend(R.prop('count'))), R.slice(0, 10), (v) => Promise.resolve(v))() as Promise<LocalItem[]>;
        });
        return (
            <section data-name={'最近'} className="mt-3">
                <div className="text-lg">最近搜索</div>
                {localSearchHistory && localSearchHistory.length === 0 ? (
                    <div className="text-gray-700 text-lg flex justify-center items-center h-20 w-full">还没有搜索记录,快去找找喜欢的书吧!</div>
                ) : (
                    <div className="flex flex-wrap">
                        {localSearchHistory &&
                            localSearchHistory.map((value) => {
                                return (
                                    <div
                                        key={value.name}
                                        onClick={() => {
                                            history.push(`/searchResultList?keyword=${value}`);
                                            saveItemToLocalStorage(value.name);
                                        }}
                                        className="p-2 bg-gray-400 rounded-lg mx-1 mt-2 whitespace-no-wrap overflow-hidden"
                                        style={{ maxWidth: '8rem', textOverflow: 'ellipsis' }}
                                    >
                                        {value.name}
                                    </div>
                                );
                            })}
                    </div>
                )}
            </section>
        );
    };
    return (
        <div>
            <NavBar centerPart={'搜索'} />
            <SearchComponent />
            <div className="px-2">
                <HotSearch />
                <RecentSearch />
            </div>
        </div>
    );
};
