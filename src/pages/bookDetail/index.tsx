import React, { useEffect, useRef, useState } from 'react';
import NavBar from '../../components/navbar';
import classNames from 'classnames';
import Product from './product';
import { useStore } from '../../model';
import { parse } from 'query-string';
import {observer} from "mobx-react";
const BookDetail: React.FC = () => {
    const { bookDetailStore } = useStore();
    const {
        product: { data },
        currentTab,
        bookId,
        navBar
    } = bookDetailStore;
    useEffect(() => {
        // get bookId
        const bookId = Number(parse(window.location.search).bookId);
        bookDetailStore.setBookId(bookId);

    }, []);
    return (
        <div>
            {bookId}
            <NavBar centerPart={<div></div>} />
            <nav className="bg-gray-200 flex justify-around">
                {navBar.map((item) => {
                    const active = item.value === currentTab;
                    return (
                        <div
                            key={item.value}
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
                <Product/>
            </div>
        </div>
    );
};
export default observer(BookDetail);
