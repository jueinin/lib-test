import React, { useEffect } from 'react';
import { ask } from '../util';
import { useHistory } from 'react-router-dom';
import { DeleteOutlined } from '@material-ui/icons';
import NavBar from '../components/navbar';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import Loading from '../components/Loading';
import { queryCache, useMutation, useQuery } from 'react-query';
import { prop } from 'ramda';
import { useModal } from '../useModal';
type Data = {
    image: string;
    bookId: number;
    title: string;
    price: number;
    favorites: number;
}[];

export default () => {
    const history = useHistory();
    const [deleteFavorite] = useMutation(
        (id) =>
            ask({
                url: `/api/removeFromFavorite`,
                method: 'post',
                data: { id },
            }).then(prop('data')),
        {
            onSuccess: (data1) => {
                queryCache.refetchQueries(`/api/favorites`);
                closeModal();
            },
        }
    );
    const { data, isFetching } = useQuery<Data,string>(`/api/favorites`, (url) => ask({ url }).then(prop('data')));
    const { openModal, closeModal } = useModal((props) => {
        return (
            <Dialog open onClose={closeModal}>
                <DialogTitle>确认</DialogTitle>
                <DialogContent>是否确认删除?</DialogContent>
                <DialogActions>
                    <Button color={'primary'} onClick={closeModal}>
                        取消
                    </Button>
                    <Button color={'primary'} onClick={() => deleteFavorite(props.id)}>
                        确认
                    </Button>
                </DialogActions>
            </Dialog>
        );
    });
    return (
        <div className="">
            <NavBar centerPart={'我的收藏'} />
            <div>
                {data &&
                    data.map((value) => {
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
                                                e.preventDefault();
                                                e.stopPropagation();
                                                openModal({ id: value.bookId });
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
            <Loading loading={isFetching} />
            {data && data.length === 0 && !isFetching && <div className="w-full h-40 flex-center">居然还没有收藏的商品,快去转转吧!</div>}
        </div>
    );
};
