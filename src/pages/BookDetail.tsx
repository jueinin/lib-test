import React, { useEffect, useMemo, useRef, useState } from 'react';
import NavBar from '../components/navbar';
import { HomeOutlined, ShoppingCartOutlined, StarBorderOutlined, StarOutlined } from '@material-ui/icons';
import {
    head,
    pipe,
    prop,
    slice,
    always,
    cond,
    equals,
    identity,
    T,
    repeat,
    concat,
    __,
    addIndex, map, ifElse
} from 'ramda';
import { useHistory } from 'react-router-dom';
import { queryCache, useMutation, useQuery } from 'react-query';
import { ask } from '../util';
import { parse, ParsedQuery } from 'query-string';
import { Toast } from '../components/Toast';
import { useStore } from '../model';
import style from "../cover.module.css";
import Slider from "../components/slider";
import { animated, useSpring } from "react-spring";
import { useDrag } from "react-use-gesture";
import { useModal } from "../useModal";
import classNames from "classnames";
import comment from './comment';
import {Drawer} from "@material-ui/core";

export type BookDetailProductDataType = {
    author: string;
    AdGoods: {
        author: string;
        bookId: string;
        comments: number;
        goodComments: number;
        imgUrl: string;
        price: number;
        title: string;
    }[];
    category: string;
    comment: {
        comments: number;
        goodComments: number;
        commentList: {
            avatar: string;
            commentText: string;
            commentImg: string[];
            name: string;
        }[];
        tags: {
            title: string;
            amount: string;
        }[];
    };
    description: string;
    id: number;
    images: string[];
    isFavorited?: boolean;
    name: string;
    price: number;
    productId: string;
    publishDate: string;
    publisher: string;
};
export type BookDetailDetailDataType = {
    details: string;
    publishInfo: {
        ISBN?: string;
        开本?: string;
        纸张?: string;
        包装?: string;
        是否套装?: string;
        title: string;
        author: string;
        publisher: string;
        publishTime: string;
    };
};
export type CommentItemType = {
    name: string;
    time: number; // 一般是unix时间
    star: number; // 0-5星
    commentText: string;
    commentImg: string[];
    id: string;
};
type TabName = 'product' | 'detail' | 'comment' | 'relation';
const BookDetail = () => {
    const history = useHistory();
    const { userStore } = useStore();
    // @ts-ignore
    const bookId = useMemo(() => pipe(slice(1, 999), parse, (v) => v.bookId, Number)(location.search), [location.search]);
    const { data: productData } = useQuery<BookDetailProductDataType, string>(`/api/bookDetail/product?bookId=${bookId}`, (url) => ask({ url }).then(prop('data')));
    const [currentTab, setCurrentTab] = useState<TabName>("product");
    const Nav = () => {
        const navBar = useRef<{ title: string; value: TabName }[]>([
            {
                title: '商品',
                value: 'product',
            },
            // {
            //     title: '详情',
            //     value: 'detail',
            // },
            {
                title: '评论',
                value: 'comment',
            },
            // {
            //     title: '相关',
            //     value: 'relation',
            // },
        ]);
        return <nav className="bg-gray-200 flex justify-around">
            {navBar.current.map((item: any) => {
                const active = item.value === currentTab;
                return (
                    <div
                        key={item.value}
                        onClick={() => setCurrentTab(item.value)}
                        className={
                            'py-2 font-bold ' +
                            classNames({
                                'text-red-600': active,
                            })
                        }
                    >
                        {item.title}
                    </div>
                );
            })}
        </nav>
    }
    const BottomBuy = () => {
        const [removeFavorite, { status }] = useMutation(
            (id: number) =>
                ask({
                    url: `/api/removeFromFavorite`,
                    method: 'post',
                    data: { id },
                }).then(prop('data')),
            {
                onSuccess: (data) => {
                    queryCache.setQueryData(`/api/bookDetail/product?bookId=${bookId}`, (previous: BookDetailProductDataType) => {
                        previous.isFavorited = false;
                        return previous;
                    });
                    Toast.info('取消收藏');
                },
            }
        );
        const [addFavorite] = useMutation(
            (id: number) =>
                ask({
                    url: `/api/addToFavorite`,
                    method: 'post',
                    data: { bookId: id },
                }).then(prop('data')),
            {
                onSuccess: (data) => {
                    queryCache.setQueryData(`/api/bookDetail/product?bookId=${bookId}`, (previous: BookDetailProductDataType) => {
                        previous.isFavorited = false;
                        return previous;
                    });
                    Toast.info('收藏成功!');
                },
            }
        );
        const [addToCart] = useMutation((bookId) => ask({ url: `/api/addShoppingCart?bookId=${bookId}` }), {
            onSuccess: (data) => {
                Toast.info('添加到购物车成功');
                userStore.getUserData();
            },
        });
        if (!productData) {
            return null;
        }
        return (
            <div className="fixed bottom-0 w-full bg-white">
                <div className="flex px-2 py-2 w-full">
                    <div className="flex items-center  w-1/2">
                        {/*<div*/}
                        {/*    className="flex flex-col items-center ripple"*/}
                        {/*    onClick={() => {*/}
                        {/*        history.push('/');*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    <HomeOutlined className="text-3xl text-red-500" />*/}
                        {/*    <span>首页</span>*/}
                        {/*</div>*/}
                        <div className="flex flex-col items-center">
                            {productData.isFavorited ? <StarOutlined className="text-3xl text-red-500" onClick={() => removeFavorite(productData.id)} /> : <StarBorderOutlined className="text-3xl text-red-500" onClick={() => addFavorite(productData.id)} />}
                            <span>{productData.isFavorited ? '取消收藏' : '收藏'}</span>
                        </div>
                        {/*<div className="flex flex-col items-center ripple" onClick={() => history.push('/shoppingCart')}>*/}
                        {/*    <span className="relative">*/}
                        {/*        <ShoppingCartOutlined className="text-3xl text-red-500" />*/}
                        {/*        {userStore.isLogin && <div*/}
                        {/*            style={{*/}
                        {/*                top: '-.6rem',*/}
                        {/*                right: '-.6rem',*/}
                        {/*                minWidth: '1.25rem',*/}
                        {/*            }}*/}
                        {/*            className="absolute text-xs h-5 flex-center border rounded-full text-red-500 border-red-500"*/}
                        {/*        >*/}
                        {/*            {userStore.userData.shoppingCart.items.length}*/}
                        {/*        </div>}*/}
                        {/*    </span>*/}
                        {/*    <span>购物车</span>*/}
                        {/*</div>*/}
                    </div>
                    <div className="flex text-white flex-grow justify-end">
                        <button
                            className="px-2 rounded-bl-full rounded-tl-full"
                            onClick={() => {
                                userStore.currentBuyItemInfo = {
                                    bookId: productData.id,
                                    title: productData.name,
                                    price: productData.price,
                                    smallImages: head(productData.images) || '',
                                    count: 1,
                                };
                                history.push('/confirmOrder');
                            }}
                            style={{
                                backgroundImage: 'linear-gradient(62deg, #FBAB7E 0%, #F7CE68 100%)',
                            }}
                        >
                            立即购买
                        </button>
                        <button
                            className="px-2 rounded-br-full rounded-tr-full"
                            onClick={() => addToCart(bookId)}
                            style={{
                                backgroundImage: 'linear-gradient(to right, #f12711, #f5af19)',
                            }}
                        >
                            加入购物车
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const Product = ({ className }) => {
        const [coverIndex, setCoverIndex] = useState(0);
        const [propsAnimate, setAnimate] = useSpring(() => ({
            transform: `scale(1)`
        }));
        // simple preview image modal
        const { openModal, closeModal } = useModal((props) => { // props.data 即productData ,测试一下传props好使不
            const [index, setIndex] = useState(0);
            return <animated.div {...bind()} className="w-screen z-10 bg-white fixed top-0 left-0 "
                style={propsAnimate}>
                <div className="flex flex-col h-screen">
                    <div className="text-center mt-10">
                        <span className="font-bold">{index + 1}</span>
                        <span className="text-sm">/{props.data.images.length}</span>
                    </div>
                    <Slider autoPlay={false} afterChange={setIndex}>
                        {props.data.images.map((value) => {
                            return <img key={value} className="w-screen" src={value} alt="" />;
                        })}
                    </Slider>
                </div>
            </animated.div>
        });
        const {openModal: openDraw, closeModal: closeDrawer} = useModal(() => {
            return <Drawer open anchor="bottom" className="p-2" onClose={closeDrawer}>
                <div className="p-2 px-4">
                    <div className="text-lg text-center my-2 font-bold">图书信息</div>
                    <div className="grid grid-cols-12 border-b py-1 ">
                        <div className="col-span-3 text-gray-600">作者</div>
                        <div className="col-span-9">{productData.author}</div>
                    </div>
                    <div className="grid grid-cols-12 py-1 border-b">
                        <div className="col-span-3 text-gray-600">出版日期</div>
                        <div className="col-span-9">{productData.publishDate}</div>
                    </div>
                    <div className="grid grid-cols-12 py-1 border-b">
                        <div className="col-span-3 text-gray-600">出版商</div>
                        <div className="col-span-9">{productData.publisher}</div>
                    </div>
                    <div className="grid grid-cols-12 py-1 border-b">
                        <div className="col-span-3 text-gray-600">分类</div>
                        <div className="col-span-9">{productData.category}</div>
                    </div>
                    <div className="grid grid-cols-12 py-1">
                        <div className="col-span-3 text-gray-600">书籍描述</div>
                        <div className="col-span-9">{productData.description}</div>
                    </div>

                </div>
            </Drawer>;
        });
        const bind = useDrag(({ event, movement: [mx, my], down }) => {
            if (my < 0) {
                return;
            }
            const divide = my / innerHeight;
            if (down) {
                setAnimate({
                    transform: `scale(${1 - divide})`
                });
            } else {
                if (divide > 0.33) {
                    closeModal();
                }
                setAnimate({
                    transform: `scale(1)`
                })
            }
        });
        if (!productData) {
            return null
        }
        return <div className={'bg-gray-300 ' + className || ''}>
            <section data-name={'顶栏'} className={'p-2 bg-white ' + style['product-slick']}>
                <div style={{ margin: '-0.5rem' }}>
                    {productData.images.length>0 && <img alt="slider pic" src={productData.images[0]} className="w-screen" key={productData.images[0]} onClick={() => {
                        openModal({
                            data: productData
                        });
                    }}/>}
                </div>
                {/*<div className="mt-2 float-right px-2 bg-gray-600 opacity-50 text-white flex-center rounded-full" style={{ marginRight: '-0.5rem' }}>*/}
                {/*    <span>{coverIndex + 1}</span>*/}
                {/*    <span className="text-sm">/{productData.images.length}</span>*/}
                {/*</div>*/}
                <div className="mt-4 font-bold text-red-500 text-3xl">￥{productData.price}</div>
                <div className="font-bold text-xl">{productData.name}</div>
                <div className="text-sm mt-2 text-gray-700 truncate-3-lines" title={productData.description}>
                    {productData.description}
                </div>
                <div className="grid grid-cols-12 text-gray-600 text-sm mt-2" onClick={openDraw}>
                    <div className="col-span-6">{productData.author}</div>
                    <div className="col-span-6 border-l border-gray-400 pl-4 border-solid flex">
                        {productData.publisher}
                        <span className="float-right self-center self-center ml-auto">></span>
                    </div>
                </div>
            </section>
            <section data-name={'comment'} className="mt-2 p-2 bg-white" onClick={() => { setCurrentTab("comment") }}>
                <h3 className="flex items-end">
                    <span className="font-bold text-xl">评论</span>
                    <span className="ml-2">
                        <span className="text-sm">{(productData.comment.goodComments / productData.comment.comments).toFixed(2)}%好评</span>
                        <span className="text-sm text-gray-600 ml-2">(共{productData.comment.comments}条评价)</span>
                    </span>
                    <span className="ml-auto">查看更多&nbsp;></span>
                </h3>
                <div data-name={'tag'} className="p-3 pl-0">
                    {/*<div data-name={'scroll tags'} className="horizontal-scroll">*/}
                    {/*    {productData.comment.tags.map((value) => {*/}
                    {/*        return (*/}
                    {/*            <div key={value.title + value.amount} className="bg-pink-300 rounded-full text-sm inline-block p-2">*/}
                    {/*                {value.title}({value.amount})*/}
                    {/*            </div>*/}
                    {/*        );*/}
                    {/*    })}*/}
                    {/*</div>*/}
                    <div data-name={'scroll comments'} className="horizontal-scroll">
                        {productData.comment.commentList.length > 0 ? (
                            // productData.comment.commentList.map((value) => {
                            //     return (
                            //         <div key={JSON.stringify(value)} className="shadow-lg p-2 mt-4  pb-4">
                            //             <div className="flex items-center">
                            //                 <div className="flex w-48 flex-col">
                            //                     <div className="flex items-center">
                            //                         <img alt="avatar" src={value.avatar} className="w-5 h-5" />
                            //                         <span className="text-gray-600 ml-2 text-sm">{value.name}</span>
                            //                     </div>
                            //                     <div className="truncate-4-lines text-sm mt-2 whitespace-normal">{value.commentText}</div>
                            //                 </div>
                            //                 {/*{value.commentImg.length && <img alt="comment img" className="max-h-full w-12 ml-8" src={value.commentImg[0]} />}*/}
                            //             </div>
                            //         </div>
                            //     );
                            // })
                            productData.comment.commentList.slice(0,1).map(value => {
                                return <div className="my-3 mx-2">
                                    <div className="flex">
                                        <img className="w-5 h-5 rounded-full" src={value.avatar}/>
                                        <span className="text-sm text-gray-600 ml-2">{value.name}</span>
                                    </div>
                                    <div className="mt-1 truncate-3-lines whitespace-normal">
                                        {value.commentText}
                                    </div>
                                </div>
                            })
                        ) : (
                                <div className="h-40 w-full flex-center">
                                    <span>冷冷清清的，还没有人评价呢</span>
                                </div>
                            )}
                    </div>
                </div>
            </section>
            {/*<section data-name={'promotion'} className="mt-2 bg-white">*/}
            {/*    <div data-name={'title'} className="p-2">*/}
            {/*        <h2 className="items-center flex">*/}
            {/*            <span className="text-xl font-bold">推广商品</span>*/}
            {/*            <span className="ml-auto bg-gray-400 text-white text-xs">广告</span>*/}
            {/*        </h2>*/}
            {/*    </div>*/}
            {/*    <div data-name={'ad goods'} className="horizontal-scroll gap-4 p-2" style={{ gridAutoColumns: '33.33%' }}>*/}
            {/*        {productData.AdGoods.map((value) => {*/}
            {/*            return (*/}
            {/*                <div onClick={()=>history.push(`${location.pathname}?bookId=${value.bookId}`)} key={value.bookId} className="flex flex-col">*/}
            {/*                    <img alt="cover" src={value.imgUrl} className="w-full h-auto" />*/}
            {/*                    <div className="text-sm truncate-2-lines whitespace-normal mt-1" style={{ minHeight: '2rem' }}>*/}
            {/*                        {value.title}*/}
            {/*                    </div>*/}
            {/*                    <div className="font-bold mt-1">￥{value.price}</div>*/}
            {/*                </div>*/}
            {/*            );*/}
            {/*        })}*/}
            {/*    </div>*/}
            {/*</section>*/}
        </div>;
    };

    const Detail = ({ className }) => {
        const [detailTab, setDetailTab] = useState<'detail' | 'publishInfo'>('detail');
        const { data: detailData, refetch } = useQuery<BookDetailDetailDataType, string>(`/api/bookDetail/details?bookId=${bookId}`, url => ask({ url }).then(prop('data')), {
            manual: true
        });
        useEffect(() => {
            if (currentTab === "detail" && !detailData) {
                refetch();
            }
        }, []);
        if (!detailData) {
            return null
        }
        return <div className={className}>
            <nav data-name={'select bar'}
                className="relative grid grid-cols-2 grid-rows-1 justify-items-center shadow-sm border-b border-solid  border-gray-300">
                <div className={classNames({
                    'text-red-600 border-solid border-red-600 border-b-2': detailTab === "detail"
                }, 'p-3 px-6 ripple')} onClick={() => setDetailTab("detail")}>图书详情
                </div>
                <div className={classNames({
                    'text-red-600 border-solid border-red-600 border-b-2': detailTab === "publishInfo"
                }, 'p-3 px-6 ripple')} onClick={() => setDetailTab("publishInfo")}>出版信息
                </div>
                <div className="bg-gray-400 top-0 h-6 mt-3 absolute" style={{ left: "50%", width: 1 }} />
            </nav>
            <section data-name={'detail'} className={detailTab === "detail" ? '' : 'hidden '}>
                <div className="p-2" dangerouslySetInnerHTML={{ __html: detailData.details }} />
            </section>
            <section data-name={'publish-info'} className={detailTab === "publishInfo" ? "" : "hidden"}>
                <div className="grid grid-cols-12 gap-4 mt-3 px-2">
                    {Object.keys(detailData.publishInfo).map((key) => {
                        let tempKey = cond([
                            [equals('title'), always('书名')],
                            [equals('author'), always('作者')],
                            [equals('publisher'), always('出版社')],
                            [equals('publishTime'), always('出版时间')],
                            [T, identity]
                        ])(key);
                        if (!detailData.publishInfo[key]) {
                            return null
                        }
                        return <React.Fragment key={key}>
                            <div className="col-span-3">{tempKey}:</div>
                            <div className="col-span-9">{detailData.publishInfo[key]}</div>
                        </React.Fragment>;
                    })}
                </div>
            </section>
        </div>;
    };
    const Comment = ({ className }) => {
        const { data: commentData, refetch } = useQuery<{ data: CommentItemType[]; }, string>(`/api/bookDetail/comment?bookId=${bookId}`, url => ask({ url }).then(prop('data')), {
            manual: true
        });
        useEffect(() => {
            if (currentTab === "comment" && !commentData) {
                refetch();
            }
        }, []);
        return <div>
            <div className={className}>
                {commentData && commentData.data.map((value, index) => {
                    return (
                        <div key={index}
                            className="p-2 border-b border-solid border-gray-500 shadow-sm hover:bg-gray-200">
                            <div data-name={'title'} className="flex">
                                <div className="mr-auto">{value.name}</div>
                                <div className="ml-auto">
                                    {pipe((v: number) => {
                                        const date = new Date(v * 1000);
                                        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                                    })(value.time)}
                                </div>
                            </div>
                            <div data-name={'star'} className=" flex">
                                {pipe(
                                    repeat('Y'),
                                    concat(__, repeat('N', 5 - value.star)),
                                    addIndex(map)((value, index) => {
                                        const val = pipe(ifElse(equals('Y'), always(<StarOutlined
                                            className="text-red-500 text-lg" />), always(<StarOutlined
                                                className="text-pink-200 text-lg" />)))(value);
                                        return <div key={index}>{val}</div>;
                                    })
                                )(value.star)}
                            </div>
                            <div data-name={'text'} className="mt-2 text-sm">
                                {value.commentText}
                            </div>
                            {value.commentImg.length && <div className="flex">
                                {pipe(addIndex(map)((value: string, index) => {
                                    return <img key={index} src={value} alt="comment img" className="w-1/5 mr-2" />
                                }))(value.commentImg)}
                            </div>}
                        </div>
                    );
                })}
            </div>
        </div>
    };
    return (
        <div>
            <NavBar centerPart={<div className="truncate-1-lines">{productData ? productData.name : '加载中...'}</div>} />
            <Nav />
            <div>
                <Product className={currentTab === "product" || "hidden"} />
                <Detail className={currentTab === "detail" || 'hidden'} />
                <Comment className={currentTab === 'comment' || 'hidden'} />
                <div className="w-full" style={{ height: '55px' }} />
            </div>
            <BottomBuy />
        </div>
    );
};
export default BookDetail
