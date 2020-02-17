import React, {useCallback, useEffect, useState} from "react";
import NavBar from "../components/navbar";
import {InputBase} from "@material-ui/core";
import {SearchOutlined} from '@material-ui/icons'
import {ask} from "../util";
import {fromPromise} from "rxjs/internal-compatibility";
import {debounceTime, map} from "rxjs/operators";
import {useHistory} from 'react-router-dom';
interface SearchTipItem {
    name: string;
    resultCount: number;
}
interface LocalItem {
    name: string,
    count: number;
}
const SearchInput: React.FC = () => {
    const [hotSearchData, setHotSearchData] = useState<string[]>([]);
    const [localSearchHistory, setLocalSearchHistory] = useState<LocalItem[]>([]);
    const [searchStr, setSearchStr] = useState('');
    const [searchTips,setSearchTips] = useState<SearchTipItem[]>([])
    const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let input = event.target.value;
        setSearchStr(input);
        getSearchTips(input);
    };
    const getSearchTips = (searchStr:string) => {
        if (!searchStr) {
            setSearchTips([]);
            return
        }
        fromPromise(ask({
            url: `/api/searchTips?title=${searchStr}`
        })).pipe(debounceTime(350),map(value => value.data))
            .subscribe(value => searchStr?setSearchTips(value):[]);
    };

    const getHotSearch = useCallback(() => {
        ask({
            url: '/api/hotSearchKeyword'
        }).then(value => {
            setHotSearchData(value.data.keywords);
        });  // get data
    }, []);
    useEffect(() => {
        getHotSearch(); // hot
        let data:LocalItem[] = JSON.parse(localStorage.getItem('localSearch') || JSON.stringify([]))
        setLocalSearchHistory(data.slice(10)); // local data
    },[]);
    const history = useHistory();
    useEffect(() => {
        localStorage.setItem('localSearch', JSON.stringify(localSearchHistory));
    }, localSearchHistory);
    const navToSearchResultList = (searchStr: string) => {
        // add to local
        const index = localSearchHistory.findIndex(value => value.name === searchStr);
        if (index === -1) {
            setLocalSearchHistory([...localSearchHistory,{
                name: searchStr,
                count: 1
            }])
        } else {
            setLocalSearchHistory(value => {
                value[index].count++;
                return value;
            });
        }
        history.push(`/searchResultList?keyword=${searchStr}`);
    };
    return <div>
        <NavBar centerPart={'搜索'}/>
        <section className="relative">
            <section data-name={'搜索栏'} className="flex items-center mt-2 border-b border-solid border-gray-400 shadow-sm pb-2">
                <div className="flex rounded-full bg-gray-300 text-gray-600 items-center flex-grow">
                    <SearchOutlined className="mr-auto ml-2 "/>
                    <InputBase className="flex-grow" value={searchStr} onChange={onSearchChange}/>
                </div>
                <div className="px-3">{searchStr.length===0?"取消":"搜索"}</div>
            </section>
            <div className="absolute w-full bg-white">
                {searchTips.map((value, index) => {
                    return <div onClick={()=>navToSearchResultList(value.name)} className="flex cursor-pointer items-center px-4 py-2 border-gray-300 border-solid border-b hover:bg-gray-200" key={value.name}>
                        <div className="whitespace-no-wrap mr-auto overflow-hidden max-w-xs" style={{textOverflow: "ellipsis"}}>{value.name}</div>
                        <div className="text-gray-500 text-sm ml-auto">约{value.resultCount}个结果</div>
                    </div>
                })}
            </div>
        </section>
        <section data-name={'热门'}>
            <div className="text-lg">热门搜索</div>
            <div className="flex flex-wrap content-between">
                {hotSearchData.map((value,index) => {
                    return <div key={value} onClick={()=>navToSearchResultList(value)} className="p-2 bg-gray-400 rounded-lg mx-1 mt-2 whitespace-no-wrap overflow-hidden" style={{maxWidth: "8rem",textOverflow: "ellipsis"}}>{value}</div>
                })}
            </div>
        </section>
        <section data-name={'最近'} className="mt-3">
            <div className="text-lg">最近搜索</div>
            {localSearchHistory.length===0?<div className="text-gray-700 text-lg flex justify-center items-center h-20 w-full">
                还没有搜索记录,快去找找喜欢的书吧!
            </div>:<div className="flex flex-wrap">
                {localSearchHistory.map((value) => {
                    return <div key={value.name} onClick={()=>navToSearchResultList(value.name)} className="p-2 bg-gray-400 rounded-lg mx-1 mt-2 whitespace-no-wrap overflow-hidden" style={{maxWidth: "8rem",textOverflow: "ellipsis"}}>{value.name}</div>
                })}
            </div>}
        </section>
    </div>;
};
export default SearchInput;
