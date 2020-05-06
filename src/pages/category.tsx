import React, { useRef, useState } from 'react';
import NavBar from '../components/navbar';
import book from '../resource/images/书.png';
import personal from '../resource/images/人物.png';
import art from '../resource/images/art.png';
import heart from '../resource/images/heart.png';
import thinking from '../resource/images/思维.png';
import computer from '../resource/images/电脑.png';
import economy from '../resource/images/economy.png';
import historyIcon from '../resource/images/历史.png';
import { CircularProgress, Tab, Tabs } from '@material-ui/core';
import { useInfiniteQuery } from 'react-query';
import { ask } from '../util';
import { prop } from 'ramda';
import { ShoppingCartOutlined } from '@material-ui/icons';
import { useReachBottom } from '../util';
import { useHistory } from 'react-router-dom';
import BookItemGrid from "../components/BookItemGrid";

const Category = () => {
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
    const history = useHistory();
    const [currentNav, setCurrentNav] = useState('小说');
    // @ts-ignore
    const { fetchMore, data, isFetching: loading, refetch, canFetchMore } = useInfiniteQuery(
        ['/api/bookSearch', currentNav],
        (url, currentNav, page = 1) => {
            return ask({
                url: url,
                params: {
                    keyword: currentNav,
                    sortType: 0,
                    page,
                },
            }).then(prop('data'));
        },
        {
            getFetchMore: (lastPage, allPage) => (allPage.length > lastPage.maxPage ? false : allPage.length + 1),
        }
    );
    useReachBottom(document.getElementById('category'), fetchMore);
    return (
        <div className="h-screen flex flex-col">
            <NavBar centerPart={'分类'} />
            <Tabs value={currentNav} scrollButtons={'on'} onChange={(event, value) => setCurrentNav(value)} variant={'scrollable'} indicatorColor={'primary'} textColor={'primary'}>
                {navItems.current.map((value) => {
                    return <Tab value={value.title} key={value.title} label={value.title} />;
                })}
            </Tabs>
            <section id="category" className="flex-grow overflow-auto" data-name={'结果页'}>
                <div className="grid grid-cols-2 gap-2 bg-gray-300 mt-2">
                    {data.map((item) =>
                        item.bookData.map((value) => {
                            return (
                                <BookItemGrid {...value} onClick={()=>history.push('/bookDetail?bookId=' + value.bookId)}/>
                            );
                        })
                    )}
                </div>
                {data.length === 1 && data[0].bookData.length == 0 ? (
                    <div className="h-48 w-full flex-center">
                        <span className="text-red-300"> 暂时无法为您找到搜索结果，换个关键字试试吧！</span>
                    </div>
                ) : (
                    !canFetchMore &&
                    !loading && (
                        <div className="relative w-full text-center h-6">
                            <span className="text-xs px-2 bg-white text-gray-500 absolute z-10" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
                                到底啦
                            </span>
                            <div className="bg-gray-500 w-full absolute" style={{ top: '50%', height: 2 }} />
                        </div>
                    )
                )}
                {loading && (
                    <div className="flex items-center justify-center h-40">
                        <CircularProgress placeholder="loading" />
                    </div>
                )}
            </section>
        </div>
    );
};
export default Category;
