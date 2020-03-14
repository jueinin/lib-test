import React, { useEffect, useRef, useState } from 'react';
import NavBar from '../../components/navbar';
import classNames from 'classnames';
import Product from './product';
import {observer,useLocalStore} from "mobx-react";
import Detail from "./detail";
import Comment from "./comment";
import {BookDetailLogic} from "./bookDetailLogic";
const BookDetail: React.FC = () => {
    const bookDetailLogic = useLocalStore(() => new BookDetailLogic());
    const {
        productData,
        currentTab,
        bookId,
        onUseEffect,
        navBar
    } = bookDetailLogic;
    useEffect(onUseEffect, []);

    return (
        <div>
            <NavBar centerPart={<div className="w-full px-12 truncate-1-lines">{(productData?.name || '')}</div>}/>
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
                <Comment bookDetailLogic={bookDetailLogic} className={currentTab === "comment" ? '' : 'hidden'}/>
            </div>
        </div>
    );
};
export default observer(BookDetail);
