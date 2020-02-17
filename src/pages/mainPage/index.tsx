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
import {fromEvent, of} from "rxjs";
import {filter, map, throttleTime} from "rxjs/operators";
import {fromPromise} from "rxjs/internal-compatibility";
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
  useEffect(() => {
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
  }, [page]);
  useEffect(() => {
    const subscribe = fromEvent(window, 'scroll').pipe(
        throttleTime(250),
        filter(() => {
          let inBottomArea = document.body.scrollTop + document.body.clientHeight + 150 > document.body.scrollHeight;
          return !loading && inBottomArea && !close.current;
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
        <header className="flex-row flex items-center content-around">
          <img alt="logo" className="w-6 h-6 p-3 box-content" src={logo}/>
          <div className="flex-1 flex text-gray-600 flex-row rounded-lg bg-gray-300 items-center pl-1">
            <SearchOutlined className=""/>
            <InputBase placeholder="搜索钟意的书籍吧!" onFocus={()=>push('/searchInput')} className="border-none"/>
          </div>
          <DehazeOutlined className="p-3 box-content"/>
        </header>
        <section className="w-full" style={{height: 170}}>
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
        <nav className="mt-4">
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
        <main className="mt-4 p-2">
          <div className="font-bold text-base">为您推荐</div>
          <div className="mt-4">
            {data.map((value: BookBaseProperty) => {
              return (
                  <div
                      key={value.bookId}
                      className="mb-2 w-full grid gap-6 grid-cols-10 hover:bg-gray-200 transition-colors duration-500 hover:shadow-md cursor-pointer"
                  >
                    <div className="col-span-3 h-40 bg-gray-200"/>
                    <div className="grid grid-cols-1 content-between col-span-7">
                      <h4 className="text-lg h-12 truncate-2-lines">{value.title}</h4>
                      <h5 className="text-sm text-gray-700">{value.author}</h5>
                      <span className="font-bold text-lg" style={{color: "red"}}>
                      {value.price}元
                    </span>
                      <span className="text-sm text-gray-700">
                      {value.comments === 0 ? 0 : (value.goodComments / value.comments).toFixed(2)}
                        %好评<span className="ml-6">{value.comments}人</span>
                    </span>
                    </div>
                  </div>
              );
            })}
          </div>
        </main>
        <div className="text-center">
          <CircularProgress placeholder="loading..."/>
        </div>
      </div>
  );
};
export default IndexPage;
