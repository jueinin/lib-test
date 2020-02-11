import React, {useCallback, useEffect, useState} from "react";
import NavBar from "../components/navbar";
import {InputBase} from "@material-ui/core";
import {SearchOutlined} from '@material-ui/icons'
import {ask} from "../util";

const SearchInput: React.FC = () => {
    const [hotSearchData, setHotSearchData] = useState<string[]>([]);
    const [localSearchHistory, setLocalSearchHistory] = useState<string[]>([]);
    const [searchStr, setSearchStr] = useState('');
    const onSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        let input = event.target.value;
    }, []);
    const getHotSearch = useCallback(() => {
        ask({
            url: '/api/hotSearchKeyword'
        }).then(value => {
            setHotSearchData(value.data.keywords);
        });  // get data
    }, []);
    useEffect(() => {
        getHotSearch(); // hot
        let data = JSON.parse(localStorage.getItem('localSearch') || JSON.stringify([]));
        setLocalSearchHistory(data); // local data
    },[]);
    return <div>
        <NavBar centerPart={'搜索'}/>
        <section data-name={'搜索栏'} className="flex items-center mt-2 border-b border-solid border-gray-400 shadow-sm pb-2">
            <div className="flex rounded-full bg-gray-300 text-gray-600 items-center flex-grow">
                <SearchOutlined className="mr-auto ml-2 "/>
                <InputBase className="flex-grow" value={searchStr} onChange={onSearchChange}/>
            </div>
            <div className="px-3">取消</div>
        </section>
        <section data-name={'热门'}>
            <div className="text-lg">热门搜索</div>
            <div className="flex flex-wrap content-between">
                {hotSearchData.map((value,index) => {
                    return <div key={index} className="p-2 bg-gray-400 rounded-lg mx-1 mt-2 whitespace-no-wrap overflow-hidden" style={{maxWidth: "8rem",textOverflow: "ellipsis"}}>{value}</div>
                })}
            </div>
        </section>
        <section className="mt-3">
            <div className="text-lg">最近搜索</div>
            {localSearchHistory.length===0?<div className="text-gray-700 text-lg flex justify-center items-center h-20 w-full">
                还没有搜索记录,快去找找喜欢的书吧!
            </div>:<div className="flex flex-wrap">
                {localSearchHistory.map((value, index) => {
                    return <div className="p-2 bg-gray-400 rounded-lg mx-1 mt-2 whitespace-no-wrap overflow-hidden" style={{maxWidth: "8rem",textOverflow: "ellipsis"}}>{value}</div>
                })}
            </div>}
        </section>
    </div>;
};
export default SearchInput;
