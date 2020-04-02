import React, { useEffect, useRef, useState } from 'react';
import Slider from '../../components/slider';
import { observer } from 'mobx-react';
import style from '../../cover.module.css';
import { BookDetailLogic } from './bookDetailLogic';
import {animated, useSpring} from 'react-spring';
import {useDrag} from "react-use-gesture";
interface ProductProps {
    className?: string;
    bookDetailLogic: BookDetailLogic;
}

const Product: React.FC<ProductProps> = (props) => {
    const { bookDetailLogic } = props;
    const data = bookDetailLogic.productData;
    const {
        coverIndex,
        coverPreview: { isOpen },
        setCoverIndex,
    } = bookDetailLogic;
    const [propsAnimate, setAnimate] = useSpring(() => ({
        transform: `scale(1)`
    }));
    const bind = useDrag(({event,movement: [mx,my],down}) => {
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
                bookDetailLogic.coverPreview.isOpen = false;
            }
            setAnimate({
                transform: `scale(1)`
            })
        }
    });
    if (!data) {
        return null;
    }
    return (
        <div className={'bg-gray-300 ' + props.className || ''}>
            <section data-name={'顶栏'} className={'p-2 bg-white ' + style['product-slick']}>
                <div style={{ margin: '-0.5rem' }}>
                    <Slider afterChange={setCoverIndex} autoPlay>
                        {(data.images || []).map((value) => {
                            return <img alt="slider pic" src={value} className="w-screen" key={value} onClick={() => {
                                bookDetailLogic.coverPreview.isOpen = true;
                            }} />;
                        })}
                    </Slider>
                </div>
                <div className="mt-2 float-right px-2 bg-gray-600 opacity-50 text-white flex-center rounded-full" style={{ marginRight: '-0.5rem' }}>
                    <span>{coverIndex + 1}</span>
                    <span className="text-sm">/{data.images.length}</span>
                </div>
                <div className="mt-4 font-bold text-red-500 text-3xl">￥{data.price}</div>
                <div className="font-bold text-xl">{data.name}</div>
                <div className="text-sm mt-2 text-gray-700 truncate-3-lines" title={data.description}>
                    {data.description}
                </div>
                <div className="grid grid-cols-12 text-gray-600 text-sm mt-2">
                    <div className="col-span-6">{data.author}</div>
                    <div className="col-span-6 border-l border-gray-400 pl-4 border-solid">
                        {data.publisher}
                        <span className="float-right">></span>
                    </div>
                </div>
            </section>
            <section data-name={'comment'} className="mt-2 p-2 bg-white">
                <h3 className="flex items-end">
                    <span className="font-bold text-xl">评论</span>
                    <span className="ml-2">
                        <span className="text-sm">{(data.comment.goodComments / data.comment.comments).toFixed(2)}%好评</span>
                        <span className="text-sm text-gray-600 ml-2">(共{data.comment.comments}条评价)</span>
                    </span>
                    <span className="ml-auto">查看更多&nbsp;></span>
                </h3>
                <div data-name={'tag'} className="p-3 pl-0">
                    <div data-name={'scroll tags'} className="horizontal-scroll">
                        {data.comment.tags.map((value) => {
                            return (
                                <div key={value.title + value.amount} className="bg-pink-300 rounded-full text-sm inline-block p-2">
                                    {value.title}({value.amount})
                                </div>
                            );
                        })}
                    </div>
                    <div data-name={'scroll comments'} className="horizontal-scroll">
                        {data.comment.commentList.length > 0 ? (
                            data.comment.commentList.map((value) => {
                                return (
                                    <div key={JSON.stringify(value)} className="shadow-lg p-2 mt-4  pb-4">
                                        <div className="flex items-center">
                                            <div className="flex w-48 flex-col">
                                                <div className="flex items-center">
                                                    <img alt="avatar" src={value.avatar} className="w-5 h-5" />
                                                    <span className="text-gray-600 ml-2 text-sm">{value.name}</span>
                                                </div>
                                                <div className="truncate-4-lines text-sm mt-2 whitespace-normal">{value.commentText}</div>
                                            </div>
                                            {value.commentImg.length && <img alt="comment img" className="max-h-full w-12 ml-8" src={value.commentImg[0]} />}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="h-40 w-full flex-center">
                                <span>冷冷清清的，还没有人评价呢</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <section data-name={'promotion'} className="mt-2 bg-white">
                <div data-name={'title'} className="p-2">
                    <h2 className="items-center flex">
                        <span className="text-xl font-bold">推广商品</span>
                        <span className="ml-auto bg-gray-400 text-white text-xs">广告</span>
                    </h2>
                </div>
                <div data-name={'ad goods'} className="horizontal-scroll gap-4 p-2" style={{ gridAutoColumns: '33.33%' }}>
                    {data.AdGoods.map((value) => {
                        return (
                            <div key={value.bookId} className="flex flex-col">
                                <img alt="cover" src={value.imgUrl} className="w-full h-auto" />
                                <div className="text-sm truncate-2-lines whitespace-normal mt-1" style={{ minHeight: '2rem' }}>
                                    {value.title}
                                </div>
                                <div className="font-bold mt-1">￥{value.price}</div>
                            </div>
                        );
                    })}
                </div>
            </section>
            {isOpen && (
                <animated.div {...bind()} className="w-screen z-10 bg-white fixed top-0 left-0 " style={propsAnimate}>
                    <div className="flex flex-col h-screen">
                        <div className="text-center mt-10">
                            <span className="font-bold">{bookDetailLogic.coverPreview.index + 1}</span>
                            <span className="text-sm">/{data.images.length}</span>
                        </div>
                        <Slider autoPlay={false} afterChange={(index) => (bookDetailLogic.coverPreview.index = index)}>
                            {data.images.map((value) => {
                                return <img key={value} className="w-screen" src={value} alt="" />;
                            })}
                        </Slider>
                    </div>
                </animated.div>
            )}
        </div>
    );
};
export default observer(Product);
