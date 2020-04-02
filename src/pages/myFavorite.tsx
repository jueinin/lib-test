import React, { useEffect } from 'react';
import { observer, useLocalStore } from 'mobx-react';
import { observable } from 'mobx';
import { ask } from '../util';
import { useHistory } from 'react-router-dom';
import { DeleteOutlined } from '@material-ui/icons';
import NavBar from '../components/navbar';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { Toast } from '../components/Toast';
import Loading from "../components/Loading";
type Data = {
    image: string;
    bookId: number;
    title: string;
    price: number;
    favorites: number;
}[];
class Logic {
    @observable data: Data = null;
    @observable loading = false;
    @observable noneOfData = false;
    @observable dialogOpen: boolean = false;
    idToDelete: number;
    onUseEffect = () => {
        this.onRequestData();
        return () => {};
    };
    onCloseDialog = () => {
        this.dialogOpen = false;
    };
    onRequestData = () => {
        this.loading = true;
        ask(`/api/favorites`).then((value) => {
            if (value.data.length === 0) {
                this.noneOfData = true;
            } else {
                this.data = value.data;
            }
        }).finally(() => this.loading = false);

    };
    deleteFavorite = () => {
        this.dialogOpen = false;
        ask({
            url: `/api/removeFromFavorite`,
            method: 'post',
            data: {
                id: this.idToDelete,
            },
        }).then((value) => {
            this.onRequestData();
            Toast.info('删除成功！');
        });
    };
}
const MyFavorite: React.FC = () => {
    const logic = useLocalStore(() => new Logic());
    useEffect(logic.onUseEffect, []);
    const history = useHistory();
    return (
        <div className="">
            <NavBar centerPart={'我的收藏'} />
            <div>
                {logic.data && logic.data.map((value) => {
                    return (
                        <div key={value.bookId} className="w-full flex" onClick={() => history.push(`/bookDetail?bookId=${value.bookId}`)}>
                            <img alt="book cover" src={value.image} className="w-1/3" />
                            <div className="flex flex-col ml-2 px-2 flex-grow">
                                <div className="truncate-2-lines h-12">{value.title}</div>
                                <div className="text-gray-500 text-sm">{value.favorites}人收藏</div>
                                <div className="mb-2 mt-auto text-red-500 flex w-full">
                                    <span>￥{value.price}</span>
                                    <span
                                        className="ml-auto text-3xl"
                                        onClickCapture={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation();
                                            logic.idToDelete = value.bookId;
                                            logic.dialogOpen = true;
                                        }}
                                    >
                                        <DeleteOutlined />
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <Loading loading={logic.loading}/>
            {logic.noneOfData && <div className="w-full h-40 flex-center">
                居然还没有收藏的商品,快去转转吧!
            </div>}
            <Dialog open={logic.dialogOpen} onClose={logic.onCloseDialog}>
                <DialogTitle>确认</DialogTitle>
                <DialogContent>是否确认删除?</DialogContent>
                <DialogActions>
                    <Button color={'primary'} onClick={logic.onCloseDialog}>
                        取消
                    </Button>
                    <Button color={'primary'} onClick={logic.deleteFavorite}>
                        确认
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};
export default observer(MyFavorite);
