import React, {useCallback, useEffect, useRef, useState} from "react";
import { SearchOutlined, DehazeOutlined } from "@material-ui/icons";
import { InputBase, CircularProgress } from "@material-ui/core";
import logo from "../../resource/images/logo.jpeg";
import Slider from "react-slick";
import swiper1 from "../../resource/images/swiper-image1.jpg";
import swiper2 from "../../resource/images/swiper-image2.jpg";
import swiper3 from "../../resource/images/swiper-image3.jpg";
import icon from "../../resource/images/icon.png";
import {useHistory} from 'react-router-dom'
import {ask} from "../../util";
import {fromEvent, Observable, of} from "rxjs";
import {delay, filter, map, throttleTime} from "rxjs/operators";
import {fromPromise} from "rxjs/internal-compatibility";
import {useObservable, useSubscription} from "observable-hooks";
import BottomBar from "../../components/bottomBar";
import BookItem from "../../components/bookItem";
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
      title: "小说"
    },
    {
      title: "传记"
    },
    {
      title: "艺术"
    },
    {
      title: "励志"
    },
    {
      title: "哲学"
    },
    {
      title: "计算机"
    },
    {
      title: "经济"
    },
    {
      title: "历史"
    }
  ]);
  const recommendUrl = (page:number) => '/api/recommends?page=' + page;
  const [page, setPage] = useState(1);
  const [data, setData] = useState<BookBaseProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const close = useRef(false);
  const page$ = useObservable((list) => list.pipe(map(([page]) => page,throttleTime(300))), [page] as const); // just for learn,in this scenario, it is not necessary to use rxjs
  useSubscription(page$, value => {
    setLoading(true);
    fromPromise(ask({
      url: recommendUrl(page)
    })).pipe(map(value => value.data)).subscribe({
      next: value => setData(data.concat(value)),
      complete: () => {
        setLoading(false);
        close.current = false;
      }
    });
  });
  useEffect(() => {
    const subscribe = fromEvent(window, 'scroll').pipe(
        throttleTime(250),
        filter(() => {
          let inBottomArea = document.body.scrollTop + document.body.clientHeight + 150 > document.body.scrollHeight;
          return !loading && inBottomArea && !close.current; // this loading should be write in deps,but it will reExec the effect, so hard...
        })
    ).subscribe(() => {
      setPage(page => page + 1);
      close.current = true;
    });
    return subscribe.unsubscribe;
  }, []);
  const {push} = useHistory();
  return (
      <div>
        <div className="mb-16">
          <header data-name={'search-bar'} className="flex-row flex items-center content-around">
            <img alt="logo" className="w-6 h-6 p-3 box-content" src={logo}/>
            <div className="gray-input">
              <SearchOutlined className=""/>
              <InputBase placeholder="搜索钟意的书籍吧!" onFocus={() => push('/searchInput')} className="border-none"/>
            </div>
            <DehazeOutlined className="p-3 box-content"/>
          </header>
          <section data-name={'轮播图'} className="w-full" style={{height: 170}}>
            <Slider lazyLoad="ondemand" autoplay>
              {[swiper1, swiper2, swiper3].map((value, index) => {
                return (
                    <div key={index}>
                      <img src={value} alt="carousel" className="w-full"/>
                    </div>
                );
              })}
            </Slider>
          </section>
          <nav data-name={'分类'} className="mt-4">
            <div className="flex content-between flex-wrap">
              {navItems.current.map((value, index) => {
                return (
                    <div
                        className="flex flex-col justify-around h-20 w-1/4 items-center"
                        key={index}
                    >
                      <img src={icon} alt="icon" className="h-12 w-12 shadow-md"/>
                      <span className="text-sm mb-2">{value.title}</span>
                    </div>
                );
              })}
            </div>
          </nav>
          <main data-name={'列表'} className="mt-4 p-2">
            <div className="font-bold text-base">为您推荐</div>
            <div className="mt-4">
              {data.map((value: BookBaseProperty) => {
                return (
                    <BookItem key={value.bookId} {...value} />
                );
              })}
            </div>
          </main>
          {loading && <div className="text-center">
            <CircularProgress placeholder="loading..."/>
          </div>}
        </div>
        <BottomBar currentValue="/"/>
      </div>
  );
};
export default IndexPage;
