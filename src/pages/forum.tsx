import React, { useEffect, useRef, useState } from 'react';
import {ask, defaultAvatar, eventEmitter, useStateWithSameRef, whenReachBottom} from '../util';
import NavBar from '../components/navbar';
import { Search, Add } from '@material-ui/icons';
import { Fab } from '@material-ui/core';
import { Link, useHistory } from 'react-router-dom';
import {computed, observable, toJS} from 'mobx';
import { fromEvent } from 'rxjs';
import { concatMap, filter, retry, startWith, tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { observer, useLocalStore } from 'mobx-react';
import { MessageOutlined, ThumbUpAltOutlined } from '@material-ui/icons';
import Loading from '../components/Loading';
import BottomBar from '../components/bottomBar';
class Request<Data> {
    constructor(private func:(...args)=>Promise<Data>) {
    }

    data = null;

    loading = false;
    run = (...args) => {
        this.loading = true;
        return this.func(...args).then(value => {
            this.loading = false;
            this.data = value;
            return value;
        })
    };
}
class Logic {
    @observable data = [];
    @observable page = 0;
    @observable maxPage = Number.MAX_VALUE;
    @observable dataLoading = false;
    @observable inSearchMode = false;
    @observable searchStr = '';
    @observable searchData = [];
    requestData = () => {
        this.dataLoading = true;
        if (this.page === 0) { // refresh
            this.data = [];
        }
        return ask({
            url: `/api/posts?page=${this.page + 1}`,
        }).then(value => {
            this.page += 1;
            this.data.push(...value.data.data);
            this.maxPage = value.data.maxPage;
            this.dataLoading = false;
        }).finally(() => (this.dataLoading = false));
    };
    onUseEffect = () => {
        const subscribe = fromEvent(document.getElementById('forum'), 'scroll')
            .pipe(
                startWith(null),
                whenReachBottom('forum'),
                filter(() => this.page + 1 <= this.maxPage || !this.inSearchMode),
                concatMap((value) => {
                    this.dataLoading = true;
                    return fromPromise(
                        this.requestData()
                    );
                }),
                retry(1)
            )
            .subscribe(
                (value) => {
                },
            );
        eventEmitter.addListener('forum:refreshData', () => {
            this.page = 0;
            this.requestData();
        });
        return () => {
            eventEmitter.removeAllListeners('forum:refreshData');
            subscribe.unsubscribe();
        };
    };
    @computed get renderPostData() {
        return this.searchData.length>0 ? this.searchData : this.data;
    }
    postSearch=()=>{
        if (this.searchStr === '') {
            this.inSearchMode = false;
            this.searchData = [];
            return;
        }
        this.dataLoading = true;
        ask({
            url: `/api/postSearch?keyword=${this.searchStr}`
        }).then(value => value.data).then(value => {
            this.searchData = value;
        }).finally(() => this.dataLoading = false);
    }
}
const Forum: React.FC = () => {
    const history = useHistory();
    const logic = useLocalStore(() => new Logic());
    useEffect(logic.onUseEffect, []);
    return (
        <div className="h-screen bg-gray-200" id="forum">
            <NavBar
                centerPart={logic.inSearchMode ? <input value={logic.searchStr} onKeyPress={event => {
                    if (event.key === 'Enter') {
                        logic.postSearch()
                    }}
                } onChange={(event) => (logic.searchStr = event.target.value)} autoFocus placeholder="搜索..." className="w-full border px-2 rounded-lg border-gray-500" /> : '社区论坛'}
                rightPart={<Search className="ml-1" onClick={() => (logic.inSearchMode = !logic.inSearchMode)} />}
            />
            <Fab onClick={() => history.push('/posterAdd')} className="fixed bg-green-500 text-white transform " style={{ bottom: 70, right: 20 }}>
                <Add />
            </Fab>
            <div className="mb-16">
                {logic.renderPostData.map((value) => {
                    return (
                        <Link to={`/postDetail?postId=${value.id}`} className="flex p-2 flex-col border rounded-lg bg-white mt-1" key={value.id}>
                            <div className="flex items-center">
                                <img src={defaultAvatar} className="h-8 w-8 rounded-full" />
                                <span className="mr-auto ml-2 text-blue-300">{value.user.userName}</span>
                                <span className="ml-auto text-gray-500 text-sm">{value.time}</span>
                            </div>
                            <div className="truncate-2-lines text-lg my-2">{value.title}</div>
                            <div className="text-sm truncate-3-lines">{value.description}</div>
                        </Link>
                    );
                })}
                {<Loading loading={logic.dataLoading} />}
                {logic.page > 1 && logic.page >= logic.maxPage && <div className="text-sm text-gray-500">我也是有底线的 ！</div>}
            </div>
            <BottomBar currentValue="/forum" />
        </div>
    );
};
export default observer(Forum);
