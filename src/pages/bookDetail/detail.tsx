import React from 'react';
import classNames from "classnames";
import {observer} from "mobx-react";
import * as R from 'ramda';
import {CircularProgress} from '@material-ui/core'
import {always} from "ramda";
import {BookDetailLogic} from "./bookDetailLogic";
interface Props {
    className?:string;
    bookDetailLogic: BookDetailLogic
}

const Detail:React.FC<Props> = (props) => {
    const {detailTab,setProductTab,detailData} = props.bookDetailLogic;
    if (!detailData) {
        return <div className={"flex items-center justify-center h-48 "+ props.className}>
            <CircularProgress/>
        </div>
    }
    return <div className={props.className}>
        <nav data-name={'select bar'}
             className="relative grid grid-cols-2 grid-rows-1 justify-items-center shadow-sm border-b border-solid  border-gray-300">
            <div className={classNames({
                'text-red-600 border-solid border-red-600 border-b-2': detailTab === "detail"
            }, 'p-3 px-6')} onClick={() => setProductTab("detail")}>图书详情
            </div>
            <div className={classNames({
                'text-red-600 border-solid border-red-600 border-b-2': detailTab === "publishInfo"
            }, 'p-3 px-6')} onClick={() => setProductTab("publishInfo")}>出版信息
            </div>
            <div className="bg-gray-400 top-0 h-6 mt-3 absolute" style={{left: "50%", width: 1}}/>
        </nav>
        <section data-name={'detail'} className={detailTab==="detail"?'':'hidden '}>
            <div className="p-2" dangerouslySetInnerHTML={{__html: detailData.details}}/>
        </section>
        <section data-name={'publish-info'} className={detailTab==="publishInfo"?"":"hidden"}>
            <div className="grid grid-cols-12 gap-4 mt-3 px-2">
                {Object.keys(detailData.publishInfo).map((key)=>{
                    let tempKey = R.cond([
                        [R.equals('title'), always('书名')],
                        [R.equals('author'), R.always('作者')],
                        [R.equals('publisher'), R.always('出版社')],
                        [R.equals('publishTime'), R.always('出版时间')],
                        [R.T, R.identity]
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
export default observer(Detail);

