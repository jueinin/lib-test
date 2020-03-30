import React, {useEffect} from 'react';
import NavBar from '../components/navbar';
import { observable } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import Loading from '../components/Loading';
import { parse } from 'query-string';
import { ask } from '../util';
import {path, pipe, prop, range} from 'ramda';
import { Star, StarBorderOutlined } from '@material-ui/icons';
import { TextareaAutosize } from '@material-ui/core';
import {Toast} from "../components/Toast";
class Logic {
    @observable data = null;
    bookId = Number(parse(location.search.slice(1)).bookId);
    orderItemId= Number(parse(location.search.slice(1)).orderItemId);
    @observable descriptionStar: number = 0;
    @observable transportStar: number = 0;
    @observable itemStar: number = 0;
    @observable commentStr: string = '';
    getBookInfo = () => {
        ask({
            url: `/api/bookInfo?bookId=${this.bookId}`,
        }).then((value) => (this.data = value.data));
    };
    onUseEffect = () => {
        this.getBookInfo();
    };
    onSubmit = () => {
        if (this.descriptionStar === 0 || this.transportStar === 0 || this.itemStar === 0) {
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
                (window as any).browserHistory.push('/order');
            })
        }
    };
}

const Comment: React.FC = (props) => {
    const logic = useLocalStore(() => new Logic());
    useEffect(logic.onUseEffect, []);
    return (
        <div>
            <NavBar centerPart={'发表评价'} />
            {logic.data && <div data-name={'item info'} className="flex items-center border-b">
                <img className="h-10 w-10 m-2" src={pipe(path([0]),prop('url'))(logic.data.images) as string}/>
                <div className="text-sm truncate-2-lines flex-grow">{logic.data.name}</div>
            </div>}
            <div className="bg-gray-200 w-full p-2">
                <div data-name={'star'} className="bg-white mb-3 p-2">
                    <div className="flex items-center">
                        <span>描述相符：</span>
                        {range(1, 6).map((value) => {
                            if (value <= logic.descriptionStar) {
                                return <Star onClick={() => (logic.descriptionStar = value)} className="text-red-500" />;
                            }
                            return <StarBorderOutlined onClick={() => (logic.descriptionStar = value)} className="text-red-500" />;
                        })}
                    </div>
                    <div className="mt-4 flex items-center">
                        <span>物流服务：</span>
                        {range(1, 6).map((value) => {
                            if (value <= logic.transportStar) {
                                return <Star onClick={() => (logic.transportStar = value)} className="text-red-500" />;
                            }
                            return <StarBorderOutlined onClick={() => (logic.transportStar = value)} className="text-red-500" />;
                        })}
                    </div>
                    <div className="mt-4 flex items-center">
                        <span>商品评价：</span>
                        {range(1, 6).map((value) => {
                            if (value <= logic.itemStar) {
                                return <Star onClick={() => (logic.itemStar = value)} className="text-red-500" />;
                            }
                            return <StarBorderOutlined onClick={() => (logic.itemStar = value)} className="text-red-500" />;
                        })}
                    </div>
                </div>
                <TextareaAutosize
                    value={logic.commentStr}
                    className="w-full p-1"
                    rowsMin={2}
                    placeholder="亲，您对这个商品还满意吗？ 您的评价可以帮助我们为您提供更好的商品哦！"
                    onChange={(event) => {
                        logic.commentStr = event.target.value;
                    }}
                />
                <button className="w-full rounded-lg p-3 bg-red-500 text-white text-center mt-6 mb-8" onClick={logic.onSubmit}>提交评价</button>
            </div>
        </div>
    );
};
export default observer(Comment);
