import { ask } from '../../util';
import { action, computed, observable, reaction } from 'mobx';
import { BehaviorSubject, of } from 'rxjs';
import { filter, map, skipWhile, switchMap, tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { parse } from 'query-string';
import * as R from 'ramda';
import {always, prop} from 'ramda';
export type BookDetailProductDataType = {
    author: string;
    AdGoods: {
        author: string;
        bookId: string;
        comments: number;
        goodComments: number;
        imgUrl: string;
        price: number;
        title: string;
    }[];
    category: string;
    comment: {
        comments: number;
        goodComments: number;
        commentList: {
            avatar: string;
            commentText: string;
            commentImg: string[];
            name: string;
        }[];
        tags: {
            title: string;
            amount: string;
        }[];
    };
    description: string;
    id: number;
    images: string[];
    isFavorited?: boolean;
    name: string;
    price: number;
    productId: string;
    publishDate: string;
    publisher: string;
};
export type BookDetailDetailDataType = {
    details: string;
    publishInfo: {
        ISBN?: string;
        开本?: string;
        纸张?: string;
        包装?: string;
        是否套装?: string;
        title: string;
        author: string;
        publisher: string;
        publishTime: string;
    };
};
export type CommentItemType = {
    name: string;
    time: number; // 一般是unix时间
    star: number; // 0-5星
    commentText: string;
    commentImg: string[];
    id: string;
};
type TabName = 'product' | 'detail' | 'comment' | 'relation';
type DetailTabName = 'detail' | 'publishInfo';
type JoinItemType= {
    shouldRequest: boolean,
    getPromise?:()=>Promise<any>,
}
export class BookDetailLogic {
    @observable productData: BookDetailProductDataType | null = null;
    @observable bookId: number = Number(parse(window.location.search).bookId);
    @observable currentTab: TabName = 'product';
    @observable detailTab: DetailTabName = 'detail';
    @observable detailData: BookDetailDetailDataType | null = null;
    @observable commentData: { data: CommentItemType[] } = null;
    @observable coverPreview={
        isOpen:false,
        index: 0
    }
    @observable coverIndex: number = 0;
    @observable navBar: { title: string; value: TabName }[] = [
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
    ];
    @computed get infoJoin() {
        return {
            product: {
                shouldRequest: this.productData === null,
                getPromise: this.getProductData,
            },
            detail: {
                shouldRequest: this.detailData === null,
                getPromise: this.getDetailData,
            },
            comment: {
                shouldRequest: this.commentData === null,
                getPromise: this.getCommentData,
            },
            relation: {
                shouldRequest: false, //
            } as JoinItemType
        };
    }
    onUseEffect = () => {
        const subject = new BehaviorSubject<TabName>('product');
        const subscription = subject
            .pipe(
                filter((value) => this.infoJoin[value].shouldRequest),
                switchMap((tab: TabName) =>
                    fromPromise(this.infoJoin[tab]!.getPromise()).pipe(
                        map((value) => ({
                            data: value,
                            tab: tab,
                        }))
                    )
                )
            )
            .subscribe((value: any) =>{
                R.cond([
                    [R.pipe(R.prop('tab'), R.equals('product')), () => this.productData = value.data.data],
                    [R.pipe(R.prop('tab'), R.equals('detail')), () => this.detailData = value.data.data],
                    [R.pipe(R.prop('tab'), R.equals('comment')), () => this.commentData = value.data.data],
                    [R.T,()=>{}]
                ])(value)
            });
        const react = reaction(() => this.currentTab, subject.next.bind(subject));
        return () => {
            react();
            subscription.unsubscribe();
        };
    };
    @action.bound setCurrentTab(tab: TabName) {
        this.currentTab = tab;
    }

    @action.bound getProductData() {
        return ask({
            url: `/api/bookDetail/product?bookId=${this.bookId}`,
        });
    }
    @action.bound getDetailData() {
        return ask({
            url: `/api/bookDetail/details?bookId=${this.bookId}`,
        });
    }
    @action.bound getCommentData() {
        return ask({
            url: `/api/bookDetail/comment?bookId=${this.bookId}`,
        });
    }
    @action.bound setProductTab(tab: DetailTabName) {
        this.detailTab = tab;
    }

    setCoverIndex = (index: number) => this.coverIndex = index;
}
