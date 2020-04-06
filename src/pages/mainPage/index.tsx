import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SearchOutlined, DehazeOutlined } from '@material-ui/icons';
import { InputBase, CircularProgress } from '@material-ui/core';
import logo from '../../resource/images/logo.jpeg';
import Slider from '../../components/slider';
import swiper1 from '../../resource/images/swiper-image1.jpg';
import swiper2 from '../../resource/images/swiper-image2.jpg';
import swiper3 from '../../resource/images/swiper-image3.jpg';
import icon from '../../resource/images/icon.png';
import { useHistory } from 'react-router-dom';
import { ask, whenReachBottom } from '../../util';
import { fromEvent, Subscription } from 'rxjs';
import { concatMap, retry, startWith, tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import BottomBar from '../../components/bottomBar';
import BookItem from '../../components/bookItem';
import { action, observable } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import NavBar from '../../components/navbar';
import art from '../../resource/images/art.png';
import economy from '../../resource/images/economy.png';
import book from '../../resource/images/书.png';
import personal from '../../resource/images/人物.png';
import historyIcon from '../../resource/images/历史.png';
import heart from '../../resource/images/heart.png';
import thinking from '../../resource/images/思维.png';
import computer from '../../resource/images/电脑.png';
export interface BookBaseProperty {
    author: string;
    bookId: number;
    comments: number;
    goodComments: number;
    imgUrl: string;
    price: number;
    title: string;
}
class Logic {
    subscription: Subscription;
    recommendUrl = (page: number) => '/api/recommends?page=' + page;
    @observable page: number = 1;
    @observable data: BookBaseProperty[] = [];
    @observable loading: boolean = false;
    @action.bound onMount() {
        this.subscription = fromEvent(document.getElementById('indexpage'), 'scroll')
            .pipe(
                startWith(null),
                whenReachBottom('indexpage'),
                tap(() => (this.loading = true)),
                concatMap(() =>
                    fromPromise(
                        ask({
                            url: this.recommendUrl(this.page),
                        })
                    )
                ),
                retry(1)
            )
            .subscribe((value) => {
                this.data.push(...value.data);
                this.page += 1;
                this.loading = false;
            });
    }
    @action.bound unmount() {
        this.subscription.unsubscribe();
    }
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
    const logic = useLocalStore((source) => new Logic());
    const { data, loading, page } = logic;
    const { push } = useHistory();
    useEffect(() => {
        logic.onMount();
        return logic.unmount;
    }, []);
    return (
        <div className="h-screen overflow-y-auto" id="indexpage">
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
                    {/*<div className="flex content-between flex-wrap">
                        {navItems.current.map((value, index) => {
                            return (
                                <div className="flex flex-col justify-around h-20 w-1/4 items-center ripple" key={index} onClick={() => push(`/searchResultList?keyword=${value.title}`)}>
                                    <img src={value.pic} alt="icon" className="h-12 w-12 shadow-md mb-1" />
                                    <span className="text-sm mb-2">{value.title}</span>
                                </div>
                            );
                        })}
                    </div>*/}
                    <div className="grid" style={{
                        gridTemplateColumns: 'repeat(4,25%)',
                        gridTemplateRows: 'auto auto',
                        justifyItems: "center"
                    }}>
                        {navItems.current.map((value, index) => {
                            return (
                                <div className="grid gap-1 items-center justify-items-center ripple"
                                     style={{gridTemplateRows: 'auto 20px'}}
                                     key={index} onClick={() => push(`/searchResultList?keyword=${value.title}`)}>
                                    <img src={value.pic} alt="icon" className="h-12 w-12 shadow-md mb-1" />
                                    <span className="text-sm mb-2">{value.title}</span>
                                </div>
                            );
                        })}
                    </div>
                </nav>
                <main data-name={'列表'} className="mt-4 p-2">
                    <div className="font-bold text-base">为您推荐</div>
                    <div className="mt-4">
                        {data.map((value: BookBaseProperty, index) => {
                            return <BookItem onClick={() => push('/bookDetail?bookId=' + value.bookId)} key={index} {...value} />;
                        })}
                    </div>
                </main>
                {loading && (
                    <div className="text-center">
                        <CircularProgress placeholder="loading..." />
                    </div>
                )}
            </div>
            <BottomBar currentValue="/" />
        </div>
    );
};
export default observer(IndexPage);
