import React from 'react'
import SearchOutlined from '@material-ui/icons/SearchOutlined';
import DehazeOutlined from '@material-ui/icons/DehazeOutlined';
// import {SearchOutlined,DehazeOutlined} from '@material-ui/icons';
import InputBase from '@material-ui/core/InputBase'

import logo from '../resource/images/logo.jpeg';
// import Slider from 'react-slick';
// import swiper1 from '../resource/images/swiper-image1.jpg';
// import swiper2 from '../resource/images/swiper-image2.jpg'
// import swiper3 from '../resource/images/swiper-image3.jpg'
const IndexPage= () => {
  return <div>
    <header className="flex-row flex items-center content-around">
      <img alt="logo" className="w-6 h-6 p-2 box-content" src={logo}/>
      <div className="flex-1 flex text-gray-600 flex-row rounded-lg bg-gray-300 items-center pl-1">
        <SearchOutlined className=""/>
        <InputBase placeholder="搜索钟意的书籍吧!" className="border-none"/>
      </div>
      <DehazeOutlined className="p-2 box-content"/>
    </header>
    <div className="w-full">
      {/*<Slider dots>*/}
      {/*  <div>*/}
      {/*    <img alt="img" src={swiper1}/>*/}
      {/*  </div>*/}
      {/*  <div>*/}
      {/*    <img alt="img" src={swiper2}/>*/}
      {/*  </div>*/}
      {/*  <div>*/}
      {/*    <img alt="img" src={swiper3}/>*/}
      {/*  </div>*/}
      {/*</Slider>*/}
    </div>
  </div>
};
export default IndexPage;
