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
import {CircularProgress, Tab, Tabs} from '@material-ui/core';
import {useInfiniteQuery} from "react-query";

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
    const [currentNav, setCurrentNav] = useState('小说');
    useInfiniteQuery(currentNav)
    return (
        <div>
            <NavBar centerPart={'分类'} />
            <Tabs value={currentNav}
                  scrollButtons={"auto"}
                  onChange={(event, value) => setCurrentNav(value)} variant={'scrollable'} indicatorColor={'primary'} textColor={'primary'}>
                {navItems.current.map(value => {
                    return <Tab value={value.title} key={value.title} label={value.title}/>
                })}
            </Tabs>


        </div>
    );
};
export default Category;
