import {castFlowReturn, flow, types} from 'mobx-state-tree';
import { ask } from '../util';

const tabName = types.union(types.literal('product'), types.literal('detail'), types.literal('comment'), types.literal('relation'));

export const BookDetailProductStore = types.model({
    data: types.maybeNull( // can be null
        types.model({
            author: types.string,
            AdGoods: types.array(
                types.model({
                    author: types.string,
                    bookId: types.number,
                    comments: types.number,
                    goodComments: types.number,
                    imgUrl: types.string,
                    price: types.number,
                    title: types.string,
                })
            ),
            category: types.string,
            comment: types.model({
                comments: types.number,
                goodComments: types.number,
                commentList: types.array(
                    types.model({
                        avatar: types.string,
                        commentText: types.string,
                        commentImg: types.array(types.string),
                        name: types.string,
                    })
                ),
                tags: types.array(
                    types.model({
                        title: types.string,
                        amount: types.string,
                    })
                ),
            }),
            description: types.string,
            id: types.number,
            images: types.array(types.string),
            isFavorited: types.boolean,
            name: types.string,
            price: types.number,
            productId: types.string,
            publishDate: types.string,
            publisher: types.string,
        })
    ),
});
export const BookDetailStore = types
    .model({
        product: BookDetailProductStore,
        bookId: types.maybeNull(types.number),
        currentTab: tabName,
        navBar: types.array(types.model({
            title: types.string,
            value: tabName
        }))
    })
    .actions((self) => ({
        getProductData: flow(function* () {
            return ask({
                url: `/api/bookDetail/product`,
                params: {
                    bookId: self.bookId
                }
            }).then(value => {
                self.product.data = value.data;
            })
        }),
        setBookId(bookId:number){
            self.bookId = bookId;
            console.log(bookId,'bookId')
        },
        setCurrentTab(currentTab:any){ // todo how to resolve MST type
            self.currentTab = currentTab;
        }
    }));
export const defaultBookDetailStore = BookDetailStore.create({
    product: {
        data: null,
    },
    bookId: null,
    currentTab: "product",
    navBar: [
        {
            title: '商品',
            value: 'product',
        },
        {
            title: '详情',
            value: 'detail',
        },
        {
            title: '评论',
            value: 'comment',
        },
        {
            title: '相关',
            value: 'relation',
        },
    ]
});
