import React, { useEffect, useRef, useState } from 'react';
import NavBar from '../../components/navbar';
import classNames from 'classnames';
import Product from './product';
import { observer, useLocalStore } from 'mobx-react';
import Detail from './detail';
import Comment from './comment';
import { useHistory } from 'react-router-dom';
import { BookDetailLogic } from './bookDetailLogic';
import { HomeOutlined, StarOutlined, ShoppingCartOutlined, StarBorderOutlined } from '@material-ui/icons';
import { ask } from '../../util';
const BookDetail: React.FC = () => {
    const bookDetailLogic = useLocalStore(() => new BookDetailLogic());
    const { productData, currentTab, bookId, onUseEffect, navBar, addFavorite, removeFavorite ,addToCart} = bookDetailLogic;
    useEffect(onUseEffect, []);
    const history = useHistory();
    return (
        <div>
            <div>
                <NavBar centerPart={<div className="w-full px-12 truncate-1-lines">{productData?.name || ''}</div>}/>
                <nav className="bg-gray-200 flex justify-around">
                    {navBar.map((item: any) => {
                        const active = item.value === currentTab;
                        return (
                            <div
                                key={item.value}
                                onClick={() => bookDetailLogic.setCurrentTab(item.value)}
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
                <div>
                    <Product bookDetailLogic={bookDetailLogic} className={currentTab === 'product' ? '' : 'hidden'}/>
                    <Detail bookDetailLogic={bookDetailLogic} className={currentTab === 'detail' ? '' : 'hidden'}/>
                    <Comment bookDetailLogic={bookDetailLogic} className={currentTab === 'comment' ? '' : 'hidden'}/>
                    <div className="w-full" style={{height: '55px'}}></div>
                </div>
            </div>
            <div className="fixed bottom-0 w-full bg-white">
                <div className="flex px-2 py-1 w-full">
                    <div className="flex items-center justify-around w-1/2">
                        <div
                            className="flex flex-col items-center"
                            onClick={() => {
                                history.push('/');
                            }}
                        >
                            <HomeOutlined className="text-3xl text-red-500"/>
                            <span>首页</span>
                        </div>
                        <div className="flex flex-col items-center">
                            {productData?.isFavorited ? <StarOutlined className="text-3xl text-red-500"
                                                                      onClick={() => removeFavorite(productData.id)}/> :
                                <StarBorderOutlined className="text-3xl text-red-500"
                                                    onClick={() => addFavorite(productData.id)}/>}
                            <span>{productData?.isFavorited ? '取消收藏' : '收藏'}</span>
                        </div>
                        <div className="flex flex-col items-center" onClick={() => history.push('/shoppingCart')}>
                            <ShoppingCartOutlined className="text-3xl text-red-500"/>
                            <span>购物车</span>
                        </div>
                    </div>
                    <div className="flex flex-grow justify-end">
                        <button
                            className="px-2 rounded-bl-lg rounded-tl-lg"
                            style={{
                                backgroundImage: 'linear-gradient(62deg, #FBAB7E 0%, #F7CE68 100%)',
                            }}
                        >
                            立即购买
                        </button>
                        <button
                            className="px-2 rounded-br-lg rounded-tr-lg"
                            onClick={() => addToCart(bookId)}
                            style={{
                                backgroundImage: 'linear-gradient(62deg, #FBAB7E 0%, #F7CE68 100%)',
                            }}
                        >
                            加入购物车
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default observer(BookDetail);
