import { ask } from '../../util';
import { action, observable, reaction } from 'mobx';
import { BehaviorSubject, of } from 'rxjs';
import { filter, map, skipWhile, switchMap, tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { parse } from 'query-string';
import * as R from 'ramda';
import { always } from 'ramda';
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
export type CommentItemType={
    name: string;
    time: number; // 一般是unix时间
    star: number; // 0-5星
    commentText: string;
    commentImg: string[];
    id: string;
}
type TabName = 'product' | 'detail' | 'comment' | 'relation';
type DetailTabName = 'detail' | 'publishInfo';
export class BookDetailLogic {
    @observable productData: BookDetailProductDataType | null = null;
    @observable bookId: number = Number(parse(window.location.search).bookId);
    @observable currentTab: TabName = 'product';
    @observable detailTab: DetailTabName = 'detail';
    @observable detailData: BookDetailDetailDataType | null = null;
    @observable commentData: {data: CommentItemType[]}= null;
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
    private subject = new BehaviorSubject<TabName>('product');
    private tabSubscription = this.subject
        .pipe(
            tap((v) => console.log('tap')),
            filter(
                R.cond([
                    [R.both(R.equals('product'), () => !R.equals(null, this.productData)), always(false)],
                    [R.both(R.equals('detail'), () => !R.equals(null, this.detailData)), always(false)],
                    [R.both(R.equals('comment'), () => !R.equals(null, this.commentData)), always(false)],
                    [R.T, R.identity],
                ])
            ),
            switchMap((tab: TabName) =>
                R.cond([
                    [
                        R.equals('product'),
                        () =>
                            fromPromise(this.getProductData()).pipe(
                                map((value) => ({
                                    data: value,
                                    tab: tab,
                                }))
                            ),
                    ],
                    [
                        R.equals('detail'),
                        () =>
                            fromPromise(this.getDetailData()).pipe(
                                map((value) => ({
                                    data: value,
                                    tab: tab,
                                }))
                            ),
                    ],
                    [
                        R.equals('comment'),
                        () => fromPromise(this.getCommentData()).pipe(map(value => ({
                            data: value,
                            tab: tab
                        })))
                    ],
                    [R.T, always(of(null))],
                ])(tab)
            )
        )
        .subscribe((value: any) =>
            R.cond([
                [() => R.equals('product', value.tab), (v) => (this.productData = v.data.data)],
                [() => R.equals('detail', value.tab), (v) => (this.detailData = v.data.data)],
                [() => R.equals('comment', value.tab), v => this.commentData = v.data.data]
            ])(value)
        );
    private reaction = reaction(
        () => this.currentTab,
        (tab: TabName) => this.subject.next(tab)
    );
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
            url: `/api/bookDetail/comment?bookId=${this.bookId}`
        });
    }
    @action.bound setProductTab(tab: DetailTabName) {
        this.detailTab = tab;
    }
    @action.bound unmount() {
        this.tabSubscription.unsubscribe();
    }
}
