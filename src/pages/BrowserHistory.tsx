import React, { useEffect } from 'react';
import { observer, useLocalStore } from 'mobx-react';
import { observable } from 'mobx';
import { ask } from '../util';
import NavBar from '../components/navbar';
import {useHistory} from 'react-router-dom';
import {DeleteOutlined} from "@material-ui/icons";
import {Button, Dialog, DialogActions, DialogContent} from "@material-ui/core";
import {Toast} from "../components/Toast";
type Data = {
    time: string;
    items: {
        id: number;
        bookId: number;
        title: string;
        price: number;
        image: string;
    }[];
}[];
class Logic {
    @observable data: Data = [];
    @observable open: boolean = false;  // todo add emotion feature
    browserIdToDelete: number;
    onUseEffect = () => {
        this.onRequestData();
    };
    onDeleteHistory = () => {
        this.open = false;
        ask({
            url: `/api/removeBrowsingHistory`,
            method: 'post',
            data: {
                id: this.browserIdToDelete
            }
        }).then(value => {
            Toast.info('删除成功');
            this.onRequestData();
        })
    };
    onRequestData = () => {
        ask({
            url: `/api/browsingHistory`,
        }).then(value => {
            this.data = value.data;
        });
    };
    onDialogClose=()=>{
        this.open = false;
    }
}
const BrowserHistory: React.FC = () => {
    const logic = useLocalStore(() => new Logic());
    useEffect(logic.onUseEffect, []);
    const history = useHistory();
    return (
        <div>
            <NavBar centerPart={'浏览历史'} />
            {logic.data.map((value) => {
                return (
                    <div className="mt-2" key={value.time}>
                        <div className="px-2 bg-gray-200">{value.time}</div>
                        <div>
                            {value.items.map((value1, index) => {
                                return (
                                    <div key={index} className="flex px-2 border-b mt-1" onClick={()=>{
                                        history.push(`/bookDetail?bookId=${value1.bookId}`);
                                    }}>
                                        <img alt="cover" src={value1.image} className="w-1/4" />
                                        <div className="flex flex-col flex-grow">
                                            <div className="truncate-2-lines h-12 mt-1">{value1.title}</div>
                                            <div className="text-red-500 mt-auto mb-2 flex">
                                                <span>￥{value1.price}</span>
                                                <span className="ml-auto" onClickCapture={event => {
                                                    event.stopPropagation();
                                                    event.preventDefault();
                                                    logic.browserIdToDelete = value1.id;
                                                    logic.open = true;
                                                }}><DeleteOutlined className="text-red-500"/></span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
            <Dialog open={logic.open} className="bg-transparent" onClose={logic.onDialogClose}>
                <DialogContent>
                    确认删除吗?
                </DialogContent>
                <DialogActions>
                    <Button color={"primary"} onClick={logic.onDialogClose}>取消</Button>
                    <Button color={"primary"} onClick={logic.onDeleteHistory}>确认</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};
export default observer(BrowserHistory);
