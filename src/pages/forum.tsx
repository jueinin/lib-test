import React, { useState } from 'react';
import { ask, defaultAvatar, useReachBottom } from '../util';
import NavBar from '../components/navbar';
import { Search, Add } from '@material-ui/icons';
import { Dialog, Fab, InputBase } from '@material-ui/core';
import { Link, useHistory } from 'react-router-dom';
import Loading from '../components/Loading';
import BottomBar from '../components/bottomBar';
import { useInfiniteQuery, useMutation, useQuery } from 'react-query';
import { flatten, prop } from 'ramda';
import { useModal } from '../useModal';
import { UserData } from '../model/userStore';
import Slider from 'react-slick';
type DataItem = {
    deltaContent: string;
    description: string;
    id: number;
    postImage: {
        id: number;
        url: string;
    }[];
    time: string;
    title: string;
    user: UserData['user'];
    views: number;
};
type Data = {
    data: DataItem[];
    maxPage: number;
};
export default () => {
    const history = useHistory();
    const { openModal, closeModal, isOpen } = useModal((props) => {
        const [searchStr, setSearchStr] = useState('');
        const [postSearch, { data: searchData, reset: resetSearch }] = useMutation<DataItem[], string>((searchStr: string) =>
            ask({
                url: `/api/postSearch?keyword=${searchStr}`,
            }).then(prop('data'))
        );
        const { data } = useQuery<DataItem[], string>('/api/postRecommend', (url) => ask({ url }).then((v) => v.data));
        return (
            <Dialog open fullScreen>
                <div className="h-full bg-gray-200 w-full">
                    <div className="flex items-center p-2">
                        <InputBase
                            value={searchStr}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter' && searchStr) {
                                    postSearch(searchStr);
                                }
                            }}
                            onChange={(event) => setSearchStr(event.target.value)}
                            autoFocus
                            placeholder="搜索..."
                            className="w-full flex-grow h-8 border px-2 rounded-lg border-gray-500"
                        />
                        <span className="whitespace-no-wrap px-2 py-1 rounded-lg bg-blue-500 text-white ml-2" onClick={closeModal}>
                            取消
                        </span>
                    </div>
                    <div className="mt-4 bg-white p-2">
                        {searchData ? (
                            <div>
                                {searchData.map((item) => {
                                    return (
                                        <div
                                            onClick={() => {
                                                closeModal();
                                                history.push(`/postDetail?postId=${item.id}`);
                                            }}
                                            className="flex p-2 flex-col border rounded-lg bg-white mt-1"
                                            key={item.id}
                                        >
                                            <div className="flex items-center">
                                                <img src={defaultAvatar} className="h-8 w-8 rounded-full" />
                                                <span className="mr-auto ml-2 text-blue-300">{item.user.userName}</span>
                                                <span className="ml-auto text-gray-500 text-sm">{item.time}</span>
                                            </div>
                                            <div className="truncate-2-lines text-lg my-2">{item.title}</div>
                                            <div className="text-sm truncate-3-lines">{item.description}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <React.Fragment>
                                <div className="my-2 text-lg ">搜索发现</div>
                                <div className="flex flex-wrap">
                                    {data &&
                                        data.map((item) => {
                                            return (
                                                <div
                                                    onClick={() => {
                                                        closeModal();
                                                        history.push(`/postDetail?postId=${item.id}`);
                                                    }}
                                                    className="text-sm mr-4 px-4 py-2 bg-gray-300 rounded-lg"
                                                >
                                                    {item.title}
                                                </div>
                                            );
                                        })}
                                </div>
                            </React.Fragment>
                        )}
                    </div>
                </div>
            </Dialog>
        );
    });
    const [currentIndex, setCurrentIndex] = useState(0);
    // @ts-ignore
    const { data, isFetching, fetchMore, canFetchMore } = useInfiniteQuery<Data, string, number>(
        `/api/posts`,
        (url, page = 1) =>
            ask({
                url,
                params: { page },
            }).then(prop('data')),
        {
            getFetchMore: (lastPage, allPages) => (allPages.length < lastPage.maxPage ? allPages.length + 1 : false),
        }
    );
    const { data: recommendData } = useQuery<DataItem[], string>('/api/postRecommend', (url) => ask({ url }).then((v) => v.data));
    return (
        <div className="h-screen overflow-auto bg-gray-200" id="forum">
            <NavBar
                centerPart="社区论坛"
                rightPart={
                    <Search
                        className="ml-1"
                        onClick={() => {
                            openModal({});
                        }}
                    />
                }
            />
            {/*<Fab onClick={() => history.push('/posterAdd')} className="fixed bg-green-500 text-white transform " style={{ bottom: 70, right: 20 }}>*/}
            {/*    <Add />*/}
            {/*</Fab>*/}

            <div className="my-2 px-2">
                <div className="my-2 text-lg ">搜索发现</div>
                <div className="flex flex-wrap">
                    {recommendData &&
                        recommendData.map((item) => {
                            return (
                                <div
                                    onClick={() => {
                                        closeModal();
                                        history.push(`/postDetail?postId=${item.id}`);
                                    }}
                                    className=" mr-4 px-6 py-3 bg-gray-400 rounded-lg"
                                >
                                    {item.title}
                                </div>
                            );
                        })}
                </div>
            </div>
            <div className="bg-white mt-8 py-2 mb-16">
                <div className="flex items-center">
                    <div className="ml-auto mr-2 px-2 py-1 mb-2 rounded-lg bg-gray-600 inline-block text-white">
                        {currentIndex + 1} / {flatten(data.map((value) => value.data)).length}
                    </div>
                </div>
                <Slider
                    className="slider"
                    centerMode
                    centerPadding="60px"
                    slidesToShow={1}
                    arrows={false}
                    infinite
                    afterChange={(index) => {
                        setCurrentIndex(index);
                        if (index + 1 === flatten(data.map((value) => value.data)).length) {
                            fetchMore();
                        }
                    }}
                >
                    {data.map((value) =>
                        value.data.map((value) => {
                            return (
                                <div>
                                    <div className="w-ful border-l px-2 border-r border-t" onClick={()=>{
                                        history.push(`/postDetail?postId=${value.id}`)
                                    }}>
                                        <div
                                            className="items-center grid gap-4 w-full"
                                            style={{
                                                gridTemplateColumns: 'min-content 1fr',
                                            }}
                                        >
                                            <img className="w-10 h-10 rounded-full max-w-none" src={defaultAvatar} />
                                            <div className="text-pink-500">{value.user.userName}</div>
                                        </div>
                                        <div className="truncate-2-lines mt-3 text-lg font-bold border-b pb-1">{value.title}</div>
                                        <div className="text-sm text-gray-600 mt-2">{value.description}</div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </Slider>
            </div>
            <div
                style={{
                    bottom: '68px',
                }}
                className="fixed rounded-lg text-lg py-4 w-full bg-gray-300 text-center"
                onClick={() => history.push('/posterAdd')}
            >
                发帖
            </div>
            <BottomBar currentValue="/forum" />
        </div>
    );
};
