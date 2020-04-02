import React, { ReactNode, useEffect } from 'react';
import NavBar from '../components/navbar';
import { computed, observable } from 'mobx';
import { observer, useLocalStore } from 'mobx-react';
import { ask, defaultAvatar } from '../util';
import { parse } from 'query-string';
import Quill from 'quill';
import { CircularProgress, Dialog, TextareaAutosize } from '@material-ui/core';
import { MessageOutlined, ThumbUpAltOutlined, Fullscreen, Close, Check } from '@material-ui/icons';
import { Toast } from '../components/Toast';
import Loading from '../components/Loading';
import style from '../cover.module.css';
class Logic {
    @computed get postId() {
        return Number(parse(window.location.search.slice(1)).postId);
    }
    @observable commentStr = '';
    @observable replyCommentStr = '';
    @observable submitLoading = false;
    @observable editCommentDialogOpen = false; // edit comment in full screen dialog
    @observable article = null;
    @observable inEditMode = false;
    @observable commentData = null;
    @observable viewDetailCommentOpen = false;
    @observable commentChildDetailData = null;
    @observable selectedReplyComment = null;  // select someone to reply
    onUseEffect = () => {
        this.getCommentData();
        const editor = new Quill(document.getElementById('quill'), {
            readOnly: true,
        });
        ask({
            url: `/api/postDetail?postId=${this.postId}`,
        }).then((value) => {
            this.article = value.data;
            editor.setContents(JSON.parse(value.data.deltaContent), 'api');
        });
    };
    onSubmit = () => {
        this.submitLoading = true;
        ask({
            url: `/api/submitPostComment`,
            method: 'post',
            data: {
                postId: this.postId,
                content: this.commentStr,
            },
        })
            .then((value) => {
                if (value.data.status === 'ok') {
                    Toast.info('评论成功');
                    this.commentStr = '';
                    this.getCommentData().then((value1) => {
                        document.body.scrollTo({
                            top: document.body.scrollHeight,
                        });
                    });
                    this.editCommentDialogOpen = false;
                }
            })
            .finally(() => (this.submitLoading = false));
    };
    getCommentData = () => {
        return ask({
            url: `/api/postComments?postId=${this.postId}`,
        }).then((value) => {
            this.commentData = value.data;
        });
    };
    getAllChildComment = (commentId: number) => {
        ask({
            url: `/api/commentChild?commentId=${commentId}`,
        }).then((value) => {
            this.commentChildDetailData = value.data;
            this.selectedReplyComment = value.data.currentComment;

        });
    };
    onReplyComment = (parentCommentId: number) => {
        ask({
            url: `/api/submitPostComment`,
            method: 'post',
            data: {
                postId: this.postId,
                content: this.replyCommentStr,
                parentComment: parentCommentId,
            },
        }).then((value) => {
            Toast.info('评论成功');
            this.replyCommentStr = '';
            this.getAllChildComment(this.commentChildDetailData.currentComment.id);
        });
    };
}
type SimpleUserInfoTabProps = {
    avatar: string;
    userName: string;
    time: string;
    rightPart: ReactNode;
    className?: string;
};
const SimpleUserInfoTab: React.FC<SimpleUserInfoTabProps> = (props) => {
    // user profile line
    return (
        <div className={'flex items-center ' + props.className || ''}>
            <img src={props.avatar} className="w-8 h-8 rounded-full" />
            <div className="flex flex-col ml-2">
                <h4 className="text-blue-500">{props.userName}</h4>
                <h6 className="text-sm text-gray-500">{props.time}</h6>
            </div>
            <span className="ml-auto mr-2">{props.rightPart}</span>
        </div>
    );
};
const PostDetail: React.FC = () => {
    const logic = useLocalStore(() => new Logic());
    useEffect(logic.onUseEffect, []);
    console.log(logic.selectedReplyComment?.id === logic.commentChildDetailData?.currentComment?.id,logic.selectedReplyComment?.id ,logic.commentChildDetailData?.currentComment?.id)
    return (
        <div>
            <NavBar centerPart={'详情'}/>
            <div className={'p-1 ' + style['readonly-quill']}>
                {logic.article && (
                    <section data-name={'顶部帖子信息栏'} className="mt-2 mb-2 border-b">
                        <div className="my-2">{logic.article.title}</div>
                        <SimpleUserInfoTab avatar={defaultAvatar} userName={logic.article.user.userName}
                                           time={new Date(logic.article.createDate).toLocaleString('cn')}
                                           rightPart={<span>{logic.article.views}浏览</span>}/>
                    </section>
                )}
                <div id="quill" className="select-auto" style={{}}/>
                <div className="" style={{marginBottom: 72}} id="comment" data-name={'评论区'}>
                    {logic.commentData &&
                    logic.commentData.map((value) => {
                        return (
                            <div
                                className="w-full p-2 border-b"
                                key={value.id}
                                onClick={() => {
                                    logic.viewDetailCommentOpen = true;
                                    logic.getAllChildComment(value.id);
                                }}
                            >
                                <SimpleUserInfoTab
                                    avatar={defaultAvatar}
                                    userName={value.user.userName}
                                    time={new Date(value.createDate).toLocaleString('cn')}
                                    rightPart={
                                        <span>
                                                <ThumbUpAltOutlined className="text-gray-900 mr-2 text-xl"/>
                                                <span className="text-green-500">{value.likeCount}</span>
                                            </span>
                                    }
                                />
                                <div className="mt-2 ml-10">{value.content}</div>
                                {value.childCount > 0 && (
                                    <div className="bg-gray-300 p-2 mt-2 ml-10 text-sm text-gray-700">
                                        {value.childComment.map((value) => {
                                            return (
                                                <div key={value.id} className="mb-4">
                                                    <span
                                                        className="text-green-500">{value.user.userName}</span>回复： {value.content}
                                                </div>
                                            );
                                        })}
                                        {value.childCount > 2 && (
                                            <div className="flex">
                                                <div className="ml-auto">
                                                    共<span className="text-green-500">{value.childCount}</span>条回复
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div data-name={'底部评论按钮'}
                     className="fixed flex flex-col bottom-0 w-full left-0 p-1 shadow-sm border-t-4 text-gray-700 bg-white">
                    {logic.inEditMode && (
                        <div className="items-center flex">
                            <input
                                className="flex-grow border border-gray-600 rounded-lg pl-2"
                                placeholder="说点什么吧！"
                                value={logic.commentStr}
                                onChange={(event) => (logic.commentStr = event.target.value)}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter') {
                                        logic.onSubmit();
                                    }
                                }}
                            />
                            {logic.submitLoading ? <CircularProgress style={{width: 20, height: 20}}/> :
                                <Fullscreen className="text-3xl" onClick={() => (logic.editCommentDialogOpen = true)}/>}
                        </div>
                    )}
                    <div className="flex">
                        <div
                            className="flex flex-col items-center w-1/4"
                            onClick={() => {
                                // document.getElementById('comment').scrollIntoView();
                                logic.inEditMode = !logic.inEditMode;
                            }}
                        >
                            <MessageOutlined/>
                            <span className="text-sm">评论</span>
                        </div>
                        <div className="flex flex-col w-1/4 items-center">
                            <ThumbUpAltOutlined/>
                            <span className="text-sm">点赞</span>
                        </div>
                    </div>
                </div>
                <Dialog open={logic.editCommentDialogOpen} fullScreen disableBackdropClick>
                    <NavBar centerPart={'添加评论'}
                            leftPart={<Close onClick={() => (logic.editCommentDialogOpen = false)}/>}
                            rightPart={logic.submitLoading ? <CircularProgress style={{width: 20, height: 20}}/> :
                                <Check className="text-green-400" onClick={logic.onSubmit}/>}/>
                    <div className="">
                        <TextareaAutosize autoFocus className="h-screen w-full" placeholder="说点什么吧！"
                                          value={logic.commentStr}
                                          onChange={(event) => (logic.commentStr = event.target.value)}/>
                    </div>
                </Dialog>
                <Dialog open={logic.viewDetailCommentOpen} fullScreen disableBackdropClick>
                    <div className="bg-gray-200 min-h-screen flex flex-col">
                        <NavBar
                            centerPart={logic.commentChildDetailData?.child?.length ? `${logic.commentChildDetailData?.child?.length}条回复` : '加载中...'}
                            leftPart={<Close onClick={() => (logic.viewDetailCommentOpen = false)}/>}/>
                        {logic.commentChildDetailData === null ? (
                            <Loading loading={true}/>
                        ) : (
                            <div className="">
                                <div className="bg-white p-2"
                                     onClick={() => logic.selectedReplyComment = logic.commentChildDetailData?.currentComment}>
                                    <SimpleUserInfoTab
                                        avatar={defaultAvatar}
                                        userName={logic.commentChildDetailData.currentComment.user.userName}
                                        time={new Date(logic.commentChildDetailData.currentComment.createDate).toLocaleString('cn')}
                                        rightPart={
                                            <span>
                                                <ThumbUpAltOutlined className="text-gray-900 mr-2 text-xl"/>
                                                <span
                                                    className="text-green-500">{logic.commentChildDetailData.currentComment.likeCount}</span>
                                            </span>
                                        }
                                    />
                                    <div className="ml-10">{logic.commentChildDetailData.currentComment.content}</div>
                                </div>
                                <div className="my-2 p-1 bg-white pl-2">{logic.commentChildDetailData.child.length}条回复
                                </div>
                                {logic.commentChildDetailData.child.map((value) => {
                                    return (
                                        <div
                                            key={value.id}
                                            className="bg-white p-2"
                                            onClick={() => {
                                                logic.selectedReplyComment = value;
                                            }}
                                        >
                                            <SimpleUserInfoTab
                                                avatar={defaultAvatar}
                                                userName={value.user.userName}
                                                time={new Date(value.createDate).toLocaleString('cn')}
                                                rightPart={
                                                    <span>
                                                        <ThumbUpAltOutlined className="text-gray-900 mr-2 text-xl"/>
                                                        <span className="text-green-500">{value.likeCount}</span>
                                                    </span>
                                                }
                                            />
                                            <div className="ml-10">
                                                回复<span
                                                className="text-green-500">{value.parentComment.user.userName}</span>的评论: {value.content}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className="items-center flex mt-auto border bg-white p-2">
                            <input
                                className="flex-grow"
                                value={logic.replyCommentStr}
                                placeholder={logic.selectedReplyComment?.id === logic.commentChildDetailData?.currentComment?.id ? '回复层主' : `@${logic.selectedReplyComment?.user?.userName}:`}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter') {
                                        logic.onReplyComment(logic.commentChildDetailData.currentComment.id);
                                    }
                                }}
                                onChange={(event) => (logic.replyCommentStr = event.target.value)}
                            />
                            <span className="text-green-500"
                                  onClick={() => logic.onReplyComment(logic.selectedReplyComment?.id)}>
                                发送
                            </span>
                        </div>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};
export default observer(PostDetail);
