import React, { useEffect, useRef, useState } from 'react';
import { ask, defaultAvatar, useStateWithSameRef, whenReachBottom } from '../../util';
import NavBar from '../../components/navbar';
import { Search, Add } from '@material-ui/icons';
import { Fab } from '@material-ui/core';
import {Link, useHistory} from 'react-router-dom';
import { observable, toJS } from 'mobx';
import { fromEvent } from 'rxjs';
import { concatMap, filter, retry, startWith, tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { observer, useLocalStore } from 'mobx-react';
import Loading from '../../components/Loading';
class Logic {
    @observable data = [];
    @observable page = 0;
    @observable maxPage = Number.MAX_VALUE;
    @observable dataLoading = false;
    onUseEffect = () => {
        const subscribe = fromEvent(document.getElementById('forum'), 'scroll')
            .pipe(
                startWith(null),
                whenReachBottom('forum'),
                filter(() => this.page + 1 <= this.maxPage),
                concatMap((value) => {
                    this.dataLoading = true;
                    return fromPromise(
                        ask({
                            url: `/api/posts?page=${this.page + 1}`,
                        })
                    );
                }),
                retry(1)
            )
            .subscribe(
                (value) => {
                    this.page += 1;
                    this.data.push(...value.data.data);
                    this.maxPage = value.data.maxPage;
                    this.dataLoading = false;
                },
                () => (this.dataLoading = false)
            );
        return () => {
            subscribe.unsubscribe();
        };
    };
}
const Forum: React.FC = () => {
    const history = useHistory();
    const logic = useLocalStore(() => new Logic());
    useEffect(logic.onUseEffect, []);
    return (
        <div className="h-screen bg-gray-200" id="forum">
            <NavBar centerPart={'社区论坛'} rightPart={<Search />} />
            <Fab onClick={() => history.push('/posterAdd')} className="fixed bg-green-500 text-white" style={{ bottom: 50, right: 20 }}>
                <Add />
            </Fab>
            <div className="">
                {logic.data.map((value) => {
                    return (
                        <Link to={`/postDetail?postId=${value.id}`} className="flex p-2 flex-col border rounded-lg bg-white mt-1" key={value.id} >
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
        </div>
    );
};
export default observer(Forum);
