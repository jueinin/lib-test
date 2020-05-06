import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SearchOutlined, DehazeOutlined,ShoppingCartOutlined } from '@material-ui/icons';
import { InputBase, CircularProgress } from '@material-ui/core';
import logo from '../resource/images/logo.jpeg';
import Slider from '../components/slider';
import swiper1 from '../resource/images/swiper-image1.jpg';
import swiper2 from '../resource/images/swiper-image2.jpg';
import swiper3 from '../resource/images/swiper-image3.jpg';
import { useHistory } from 'react-router-dom';
import {ask, useEventEmitter, useReachBottom} from '../util';
import BottomBar from '../components/bottomBar';
import NavBar from '../components/navbar';
import {useInfiniteQuery} from "react-query";
import {prop} from "ramda";
import BookItemGrid from "../components/BookItemGrid";
export interface BookBaseProperty {
    author: string;
    bookId: number;
    comments: number;
    goodComments: number;
    imgUrl: string;
    price: number;
    title: string;
}
const IndexPage = () => {
    const [resetInfinite, setResetInfinite] = useState(false);
    const { push } = useHistory(); // todo remove search input page
    const {isFetching, data,fetchMore} = useInfiniteQuery([`/api/recommends`,resetInfinite], (url,reset, page = 1) => {
        return ask({
            url: url,
            params: {
                page: page
            }
        }).then(prop('data'));
    },{
        getFetchMore: (lastPage, allPages) => allPages.length + 1,
        staleTime: 1000*60*3
    });
    const container = useRef(null);
    useEventEmitter("refreshData",()=>{
        setResetInfinite(!resetInfinite);
    })
    useReachBottom(container.current, fetchMore);
    const [searchStr, setSearchStr] = useState('');
    return (
        <div className="h-screen overflow-y-auto" ref={container}>
            <div className="mb-16">
                <NavBar
                    centerPart={
                        <div className="gray-input mr-1 ml-1">
                            <SearchOutlined className="" />
                            <input className="border-none bg-transparent py-1 flex-grow" value={searchStr} onChange={event => setSearchStr(event.target.value)} placeholder="搜索钟意的书籍吧!" onKeyPress={event => {
                                if (event.key === "Enter") {
                                    push('/searchResultList?keyword='+searchStr)
                                }
                            }}  />
                        </div>
                    }
                    leftPart={<img src={logo} className="h-6 w-6 mr-1" />}
                />
                {/*<nav data-name={'分类'} className="mt-4">*/}
                {/*    <div className="grid" style={{*/}
                {/*        gridTemplateColumns: 'repeat(4,25%)',*/}
                {/*        gridTemplateRows: 'auto auto',*/}
                {/*        justifyItems: "center"*/}
                {/*    }}>*/}
                {/*        {navItems.current.map((value, index) => {*/}
                {/*            return (*/}
                {/*                <div className="grid gap-1 items-center justify-items-center ripple"*/}
                {/*                     style={{gridTemplateRows: 'auto 20px'}}*/}
                {/*                     key={value.title} onClick={() => push(`/searchResultList?keyword=${value.title}`)}>*/}
                {/*                    <img src={value.pic} alt="icon" className="h-12 w-12 shadow-md mb-1" />*/}
                {/*                    <span className="text-sm mb-2">{value.title}</span>*/}
                {/*                </div>*/}
                {/*            );*/}
                {/*        })}*/}
                {/*    </div>*/}
                {/*</nav>*/}
                <section data-name={'轮播图'} className="w-full overflow-hidden">
                    <Slider>
                        {[swiper1, swiper2, swiper3].map((value, index) => {
                            return <img style={{height: 170}} src={value} key={index} alt="carousel" className="ripple w-screen" />;
                        })}
                    </Slider>
                </section>
                <main data-name={'列表'} className="mt-4 p-2">
                    <div className="font-bold text-base">为您推荐</div>
                    <div className="mt-4 grid grid-cols-2 gap-3 bg-gray-300">
                        {data.map((list: BookBaseProperty[]) => {
                            return list.map((value,index) => {
                                return <BookItemGrid {...value} onClick={()=>push('/bookDetail?bookId=' + value.bookId)} />;
                            });
                        })}
                    </div>
                </main>
                {isFetching && data.length!==1 && (
                    <div className="text-center">
                        <CircularProgress placeholder="loading..." />
                    </div>
                )}
                {isFetching && data.length===1 && (
                    <div className="text-center">
                        <CircularProgress placeholder="loading..." />
                        <div className="text-teal-500">正在拉取推荐中，请耐心等待(约20秒)</div>
                    </div>
                )}
            </div>
            <BottomBar currentValue="/" />
        </div>
    );
};
export default IndexPage
