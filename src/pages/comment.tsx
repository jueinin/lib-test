import React, {useEffect, useState} from 'react';
import NavBar from '../components/navbar';
import { parse } from 'query-string';
import {ask,} from '../util';
import {path, pipe, prop, range} from 'ramda';
import { Star, StarBorderOutlined } from '@material-ui/icons';
import { TextareaAutosize } from '@material-ui/core';
import {Toast} from "../components/Toast";
import {useQuery} from "react-query";
import {useHistory} from 'react-router-dom';
export default () => {
    const [bookId] = useState(Number(parse(location.search.slice(1)).bookId));
    const [descriptionStar, setDescriptionStar] = useState(0);
    const [transportStar, setTransportStar] = useState(0);
    const [itemStar, setItemStar] = useState(0);
    const [commentStr, setCommentStr] = useState('');
    const history = useHistory();
    const {data} = useQuery(`/api/bookInfo?bookId=${bookId}`, url => ask({url}).then(prop('data')));
    const onSubmit = () => {
        if (descriptionStar === 0 || transportStar === 0 || itemStar === 0 || commentStr.length===0) {
            Toast.info('请至少打一颗星哦！');
        } else {
            ask({
                url: `/api/submitComment`,
                method: 'post',
                data: {
                    descriptionStar: this.descriptionStar,
                    transportStar: this.transportStar,
                    itemStar: this.itemStar,
                    orderItemId: this.orderItemId,
                    commentStr: this.commentStr
                }
            }).then(value => {
                Toast.info('感谢您的评价！');
                history.push('/order');
            })
        }
    }
    return <div>
        <NavBar centerPart={'发表评价'}/>
        {data && <div data-name={'item info'} className="flex items-center border-b">
            <img className="h-10 w-10 m-2" src={pipe(path([0]), prop('url'))(data.images) as string}/>
            <div className="text-sm truncate-2-lines flex-grow">{data.name}</div>
        </div>}
        <div className="bg-gray-200 w-full p-2">
            <div data-name={'star'} className="bg-white mb-3 p-2">
                <div className="flex items-center">
                    <span>描述相符：</span>
                    {range(1, 6).map((value) => {
                        if (value <= descriptionStar) {
                            return <Star onClick={() => setDescriptionStar(value)} className="text-red-500"/>;
                        }
                        return <StarBorderOutlined onClick={() => setDescriptionStar(value)} className="text-red-500"/>;
                    })}
                </div>
                <div className="mt-4 flex items-center">
                    <span>物流服务：</span>
                    {range(1, 6).map((value) => {
                        if (value <= transportStar) {
                            return <Star onClick={() => setTransportStar(value)} className="text-red-500"/>;
                        }
                        return <StarBorderOutlined onClick={() => setTransportStar(value)} className="text-red-500"/>;
                    })}
                </div>
                <div className="mt-4 flex items-center">
                    <span>商品评价：</span>
                    {range(1, 6).map((value) => {
                        if (value <= itemStar) {
                            return <Star onClick={() => setItemStar(value)} className="text-red-500"/>;
                        }
                        return <StarBorderOutlined onClick={() => setItemStar(value)} className="text-red-500"/>;
                    })}
                </div>
            </div>
            <TextareaAutosize
                value={commentStr}
                className="w-full p-1"
                rowsMin={2}
                placeholder="亲，您对这个商品还满意吗？ 您的评价可以帮助我们为您提供更好的商品哦！"
                onChange={(event) => {
                    setCommentStr(event.target.value)
                }}
            />
            <button className="w-full rounded-lg p-3 bg-red-500 text-white text-center mt-6 mb-8"
                    onClick={onSubmit}>提交评价
            </button>
        </div>
    </div>;
}
