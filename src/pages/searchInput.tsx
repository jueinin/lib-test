import React, {useEffect} from 'react';
import NavBar from '../components/navbar';
import {InputBase} from '@material-ui/core';
import {SearchOutlined} from '@material-ui/icons';
import HighlightOffOutlinedIcon from '@material-ui/icons/HighlightOffOutlined';
import {ask, browserHistory} from '../util';
import {fromPromise} from 'rxjs/internal-compatibility';
import {debounceTime, map, switchMap} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {action, observable, reaction} from 'mobx';
import * as R from 'ramda';
import {observer, useLocalStore} from 'mobx-react';
import {useHistory} from 'react-router-dom';
interface SearchTipItem {
    name: string;
}
interface LocalItem {
    name: string;
    count: number;
}
class SearchInputLogic {
    @observable hotSearchData: string[] = [];
    @observable localSearchHistory: LocalItem[] = [];
    @observable searchStr: string = '';
    @observable searchTips: SearchTipItem[] = [];
    @action.bound onUseEffect() {
        this.getHotSearch();
        this.localSearchHistory = this.getLocalSearchHistory();
        const search$ = new Subject();
        const searchSubscribe = search$
            .pipe(
                debounceTime(300),
                switchMap(
                    R.ifElse(R.equals(''), R.always(of([])), (value) => {
                        return R.pipe(fromPromise)(
                            ask({
                                url: `/api/searchTips?title=${value}`,
                            }).then((value1) => value1.data)
                        );
                    })
                )
            )
            .subscribe((value: SearchTipItem[]) => (this.searchTips = value));
        const dispose = reaction(() => this.searchStr, v => search$.next(v));
        return () => {
            searchSubscribe.unsubscribe();
            dispose();
        };
    }
    @action.bound private getHotSearch() {
        ask({
            url: `/api/hotSearchKeyword`,
        }).then((value) => (this.hotSearchData = value.data.keywords));
    }
    @action.bound private getLocalSearchHistory() {
        const items = localStorage.getItem('localSearch') || JSON.stringify([]);
        return R.pipe(JSON.parse, R.sort(R.descend(R.prop('count'))), R.slice(0, 10))(items) as LocalItem[];
    }
    @action.bound navToSearchResultList(searchStr: string, localSearchHistory: LocalItem[],history) {
        R.pipe(
            R.findIndex((value: LocalItem) => value.name === searchStr),
            R.ifElse(
                R.equals(-1),
                (index) => {  // add new item if not exists, or item.count+=1
                    return R.append(
                        {
                            name: searchStr,
                            count: 1,
                        },
                        localSearchHistory
                    );
                },
                (index) => {
                    return R.adjust(index, (value: LocalItem) => {
                        return R.assoc('count', value.count + 1, value);
                    }, localSearchHistory);
                }
            ),
            JSON.stringify,
            R.tap((value) => {
                localStorage.setItem('localSearch', value);
                this.localSearchHistory = this.getLocalSearchHistory();
            }),
            R.tap(() => history.push(`/searchResultList?keyword=${searchStr}`))
        )(localSearchHistory);
    }
}
const SearchInput: React.FC = () => {
    const logic = useLocalStore(() => new SearchInputLogic());
    let { hotSearchData, localSearchHistory, searchStr, searchTips, onUseEffect,navToSearchResultList:navTo } = logic;
    const history  = useHistory()
    const navToSearchResultList = R.partialRight(navTo, [history]);
    useEffect(onUseEffect, []);
    return (
        <div>
            <NavBar centerPart={'搜索'} />
            <div className="px-2">
                {/*<section className="relative">
                    <section data-name={'搜索栏'} className="flex items-center mt-2 border-b border-solid border-gray-400 shadow-sm pb-2">
                        <div className="gray-input pl-0 ">
                            <SearchOutlined className="mr-auto ml-2 " />
                            <InputBase
                                className="flex-grow"
                                value={searchStr}
                                autoFocus
                                onChange={(event) => {
                                    logic.searchStr = event.target.value
                                }}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter') {
                                        navToSearchResultList(searchStr,localSearchHistory);
                                    }
                                }}
                            />
                            {searchStr && <HighlightOffOutlinedIcon onClick={() => (logic.searchStr = '')} className="ml-auto mr-2 text-2xl text-gray-500 cursor-pointer" />}
                        </div>
                        <div className="px-3" onClick={() => searchStr.length !== 0 && navToSearchResultList(searchStr,localSearchHistory)}>
                            {searchStr.length === 0 ? '取消' : '搜索'}
                        </div>
                    </section>*/}
                <section className="relative">
                    <section data-name={'搜索栏'} className="grid gap-2 items-center border-b border-gray-400 shadow-sm py-2" style={{
                        gridTemplateColumns: '1fr auto'
                    }}>
                        <div className="grid items-center bg-gray-300 rounded-lg"
                        style={{
                            gridTemplateColumns: 'auto 1fr auto'
                        }}
                        >
                            <SearchOutlined className="ml-2" />
                            <input
                                className="bg-gray-300 py-1 rounded-lg"
                                value={searchStr}
                                autoFocus
                                onChange={(event) => {
                                    logic.searchStr = event.target.value
                                }}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter') {
                                        navToSearchResultList(searchStr,localSearchHistory);
                                    }
                                }}
                            />
                            {searchStr && <HighlightOffOutlinedIcon onClick={() => (logic.searchStr = '')} className="mr-2 text-2xl text-gray-500 cursor-pointer" />}
                        </div>
                        <div className="px-2" onClick={() => searchStr.length !== 0 && navToSearchResultList(searchStr,localSearchHistory)}>
                            {searchStr.length === 0 ? '取消' : '搜索'}
                        </div>
                    </section>
                    {searchTips.length !== 0 && (
                        <div className="absolute w-full bg-white h-screen">
                            {searchTips.map((value, index) => {
                                return (
                                    <div onClick={() => navToSearchResultList(value.name,localSearchHistory)} className="flex cursor-pointer items-center px-4 py-2 border-gray-300 border-solid border-b hover:bg-gray-200" key={value.name}>
                                        <div className="truncate-1-lines w-full">{value.name}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
                <section data-name={'热门'}>
                    <div className="text-lg">热门搜索</div>
                    <div className="flex flex-wrap content-between">
                        {hotSearchData.map((value, index) => {
                            return (
                                <div key={value} onClick={() => navToSearchResultList(value,localSearchHistory)} className="p-2 bg-gray-400 rounded-lg mx-1 mt-2 whitespace-no-wrap overflow-hidden" style={{ maxWidth: '8rem', textOverflow: 'ellipsis' }}>
                                    {value}
                                </div>
                            );
                        })}
                    </div>
                </section>
                <section data-name={'最近'} className="mt-3">
                    <div className="text-lg">最近搜索</div>
                    {localSearchHistory.length === 0 ? (
                        <div className="text-gray-700 text-lg flex justify-center items-center h-20 w-full">还没有搜索记录,快去找找喜欢的书吧!</div>
                    ) : (
                        <div className="flex flex-wrap">
                            {localSearchHistory.map((value) => {
                                return (
                                    <div key={value.name} onClick={() => navToSearchResultList(value.name,localSearchHistory)} className="p-2 bg-gray-400 rounded-lg mx-1 mt-2 whitespace-no-wrap overflow-hidden" style={{ maxWidth: '8rem', textOverflow: 'ellipsis' }}>
                                        {value.name}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};
export default observer(SearchInput);
