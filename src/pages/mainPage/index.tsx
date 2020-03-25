import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SearchOutlined, DehazeOutlined } from '@material-ui/icons';
import { InputBase, CircularProgress } from '@material-ui/core';
import logo from '../../resource/images/logo.jpeg';
import Slider from "../../components/slider";
import swiper1 from '../../resource/images/swiper-image1.jpg';
import swiper2 from '../../resource/images/swiper-image2.jpg';
import swiper3 from '../../resource/images/swiper-image3.jpg';
import icon from '../../resource/images/icon.png';
import { useHistory } from 'react-router-dom';
import {ask, whenReachBottom} from '../../util';
import { fromEvent, Subscription} from 'rxjs';
import {
    concatMap,
    retry,
    startWith,
    tap,
} from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { useObservable, useSubscription } from 'observable-hooks';
import BottomBar from '../../components/bottomBar';
import BookItem from '../../components/bookItem';
import {action, observable} from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import * as R from 'ramda';
import NavBar from "../../components/navbar";
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
                tap(()=>this.loading=true),
                concatMap(()=>fromPromise(ask({
                    url: this.recommendUrl(this.page)
                }))),
                retry(1),
            )
            .subscribe((value) => {
                this.data.push(...value.data);
                this.page += 1;
                this.loading = false;
            },);
    }
    @action.bound unmount() {
        this.subscription.unsubscribe();
    }
}

const IndexPage = () => {
    const navItems = useRef([
        {
            title: '小说',
        },
        {
            title: '传记',
        },
        {
            title: '艺术',
        },
        {
            title: '励志',
        },
        {
            title: '哲学',
        },
        {
            title: '计算机',
        },
        {
            title: '经济',
        },
        {
            title: '历史',
        },
    ]);
    const logic = useLocalStore(source => new Logic());
    const { data, loading, page } = logic;
    const { push } = useHistory();
    useEffect(() => {
        logic.onMount();
        return logic.unmount
    },[]);
    return (
        <div className="h-screen overflow-y-auto" id="indexpage">
            <div className="mb-16">
                <NavBar centerPart={<div className="gray-input mr-1">
                    <SearchOutlined className="" />
                    <InputBase placeholder="搜索钟意的书籍吧!" onFocus={() => push('/searchInput')} className="border-none" />
                </div>}/>
                <section data-name={'轮播图'} className="w-full overflow-hidden" style={{ height: 170 }}>
                    <Slider>
                        {[swiper1, swiper2, swiper3].map((value, index) => {
                            return (
                                <img src={value} key={index} alt="carousel" className="w-screen" />
                            );
                        })}
                    </Slider>
                </section>
                <nav data-name={'分类'} className="mt-4">
                    <div className="flex content-between flex-wrap">
                        {navItems.current.map((value, index) => {
                            return (
                                <div className="flex flex-col justify-around h-20 w-1/4 items-center" key={index} onClick={()=>push(`/searchResultList?keyword=${value.title}`)}>
                                    <img src={icon} alt="icon" className="h-12 w-12 shadow-md" />
                                    <span className="text-sm mb-2">{value.title}</span>
                                </div>
                            );
                        })}
                    </div>
                </nav>
                <main data-name={'列表'} className="mt-4 p-2">
                    <div className="font-bold text-base">
                        为您推荐
                    </div>
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
