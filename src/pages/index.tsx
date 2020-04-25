import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SearchOutlined, DehazeOutlined,ShoppingCartOutlined } from '@material-ui/icons';
import { InputBase, CircularProgress } from '@material-ui/core';
import logo from '../resource/images/logo.jpeg';
import Slider from '../components/slider';
import swiper1 from '../resource/images/swiper-image1.jpg';
import swiper2 from '../resource/images/swiper-image2.jpg';
import swiper3 from '../resource/images/swiper-image3.jpg';
import { useHistory } from 'react-router-dom';
import {ask, useReachBottom} from '../util';
import BottomBar from '../components/bottomBar';
import BookItem from '../components/bookItem';
import NavBar from '../components/navbar';
import art from "../resource/images/art.png";
import economy from '../resource/images/economy.png';
import book from '../resource/images/书.png';
import personal from '../resource/images/人物.png';
import historyIcon from '../resource/images/历史.png';
import heart from '../resource/images/heart.png';
import thinking from '../resource/images/思维.png';
import computer from '../resource/images/电脑.png';
import {useInfiniteQuery} from "react-query";
import {prop} from "ramda";
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
    const navItems = useRef([
        {
            title: '小说',
            pic: book,
        },
        {
            title: '传记',
            pic: personal,
        },
        {
            title: '艺术',
            pic: art,
        },
        {
            title: '励志',
            pic: heart,
        },
        {
            title: '哲学',
            pic: thinking,
        },
        {
            title: '计算机',
            pic: computer,
        },
        {
            title: '经济',
            pic: economy,
        },
        {
            title: '历史',
            pic: historyIcon,
        },
    ]);
    const { push } = useHistory();
    const {isFetching, data,fetchMore} = useInfiniteQuery(`/api/recommends`, (url, page = 1) => {
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
    useReachBottom(container.current, fetchMore);
    return (
        <div className="h-screen overflow-y-auto" ref={container}>
            <div className="mb-16">
                <NavBar
                    centerPart={
                        <div className="gray-input mr-1 ml-1">
                            <SearchOutlined className="" />
                            <input className="border-none bg-transparent py-1 flex-grow" placeholder="搜索钟意的书籍吧!" onFocus={() => push('/searchInput')}  />
                        </div>
                    }
                    leftPart={<img src={logo} className="h-6 w-6 mr-1" />}
                />
                <section data-name={'轮播图'} className="w-full overflow-hidden">
                    <Slider>
                        {[swiper1, swiper2, swiper3].map((value, index) => {
                            return <img style={{height: 170}} src={value} key={index} alt="carousel" className="ripple w-screen" />;
                        })}
                    </Slider>
                </section>
                <nav data-name={'分类'} className="mt-4">
                    <div className="grid" style={{
                        gridTemplateColumns: 'repeat(4,25%)',
                        gridTemplateRows: 'auto auto',
                        justifyItems: "center"
                    }}>
                        {navItems.current.map((value, index) => {
                            return (
                                <div className="grid gap-1 items-center justify-items-center ripple"
                                     style={{gridTemplateRows: 'auto 20px'}}
                                     key={value.title} onClick={() => push(`/searchResultList?keyword=${value.title}`)}>
                                    <img src={value.pic} alt="icon" className="h-12 w-12 shadow-md mb-1" />
                                    <span className="text-sm mb-2">{value.title}</span>
                                </div>
                            );
                        })}
                    </div>
                </nav>
                <main data-name={'列表'} className="mt-4 p-2">
                    <div className="font-bold text-base">为您推荐</div>
                    <div className="mt-4 grid grid-cols-2 gap-3 bg-gray-300">
                        {data.map((list: BookBaseProperty[]) => {
                            return list.map((value,index) => {
                                return <div key={value.bookId} className="bg-white rounded-lg grid grid-cols-1 gap-2"
                                onClick={()=>{
                                    push('/bookDetail?bookId=' + value.bookId);
                                }}>
                                    <img src={value.imgUrl} className="w-full"/>
                                    <h2 className="mt-2 text-lg mx-2 truncate-2-lines " style={{
                                        height: '3rem',
                                        fontWeight: 520
                                    }}>{value.title}</h2>
                                    <h3 className="flex mt-1 mx-2 mb-1">
                                        <span className="mr-auto text-lg font-bold">
                                            <span className="" style={{marginRight: 2}}>￥</span>
                                            {value.price.toString().split('.').map((value1,index) => {
                                            if (index === 0) {
                                                return <span key={index} className="text-lg">{value1}</span>
                                            }
                                            if (index === 1 && value1!=="0") {
                                                return  <span key={index} className="text-sm">.{value1}</span>
                                            }
                                        })}</span>
                                        <ShoppingCartOutlined className="ml-auto text-red-500"/>
                                    </h3>
                                </div>;
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
