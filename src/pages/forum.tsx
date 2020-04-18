import React, {useState} from 'react';
import {ask, defaultAvatar, useReachBottom, } from '../util';
import NavBar from '../components/navbar';
import { Search, Add } from '@material-ui/icons';
import { Fab } from '@material-ui/core';
import { Link, useHistory } from 'react-router-dom';
import Loading from '../components/Loading';
import BottomBar from '../components/bottomBar';
import {useInfiniteQuery, useMutation, useQuery} from "react-query";
import {flatten, prop} from "ramda";

type Data = {
    data: any[],
    maxPage: number
};
export default ()=>{
    const history = useHistory();
    const [searchStr, setSearchStr] = useState('');
    const [inSearchMode, setInSearchMode] = useState(false);
    // @ts-ignore
    const {data,isFetching,fetchMore,canFetchMore} = useInfiniteQuery<Data,string,number>(`/api/posts`, (url, page = 1) => ask({
        url,
        params: {page}
    }).then(prop("data")),{
        getFetchMore: (lastPage, allPages) => allPages.length < lastPage.maxPage ? allPages.length + 1 : false
    });
    const [postSearch, {data: searchData = [],reset:resetSearch}] = useMutation(() => ask({
        url: `/api/postSearch?keyword=${searchStr}`
    }).then(prop('data')),);
    useReachBottom(document.getElementById('forum'), fetchMore);
    const renderedItems = inSearchMode ? searchData : flatten(data.map(value => value.data));
    return <div className="h-screen overflow-auto bg-gray-200" id="forum">
        <NavBar
            centerPart={inSearchMode ? <input value={searchStr} onKeyPress={event => {
                if (event.key === 'Enter' && searchStr) {
                    postSearch()
                }
            }
            } onChange={(event) => setSearchStr(event.target.value)} autoFocus placeholder="搜索..."
                                              className="w-full py-1 border px-2 rounded-lg border-gray-500"/> : '社区论坛'}
            rightPart={inSearchMode ? <span onClick={() => setInSearchMode(!inSearchMode)} className="ml-2">取消</span> :
                <Search className="ml-1" onClick={() => {
                    setInSearchMode(true);
                    resetSearch();
                }}/>}
        />
        <Fab onClick={() => history.push('/posterAdd')} className="fixed bg-green-500 text-white transform "
             style={{bottom: 70, right: 20}}>
            <Add/>
        </Fab>
        <div className="mb-16">
            {renderedItems.map(item => <Link to={`/postDetail?postId=${item.id}`}
                                             className="flex p-2 flex-col border rounded-lg bg-white mt-1"
                                             key={item.id}>
                <div className="flex items-center">
                    <img src={defaultAvatar} className="h-8 w-8 rounded-full"/>
                    <span className="mr-auto ml-2 text-blue-300">{item.user.userName}</span>
                    <span className="ml-auto text-gray-500 text-sm">{item.time}</span>
                </div>
                <div className="truncate-2-lines text-lg my-2">{item.title}</div>
                <div className="text-sm truncate-3-lines">{item.description}</div>
            </Link>)}
            {<Loading loading={isFetching}/>}
            {data && data.length === 1 && data[0].data.length === 0 &&
            <div className="flex-center h-40 w-full">暂无帖子换个关键字试试吧</div>}
            {!canFetchMore && data && data.length > 1 &&
            <div className="text-sm text-gray-500 w-full text-center">我也是有底线的 ！</div>}
        </div>
        <BottomBar currentValue="/forum"/>
    </div>;
}
