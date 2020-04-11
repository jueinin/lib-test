import React, {ReactNode, useEffect, useMemo, useRef, useState} from 'react';
import NavBar from '../components/navbar';
import {ask, defaultAvatar, eventEmitter, useEventEmitter} from '../util';
import { parse } from 'query-string';
import Quill from 'quill';
import { CircularProgress, Dialog, TextareaAutosize } from '@material-ui/core';
import { MessageOutlined, ThumbUpAltOutlined, Fullscreen, Close, Check } from '@material-ui/icons';
import { Toast } from '../components/Toast';
import Loading from '../components/Loading';
// @ts-ignore
import style from '../cover.module.css';
import {useQuery} from "react-query";
import {prop} from "ramda";
export default ()=>{
    const postId = useMemo(() => Number(parse(window.location.search.slice(1)).postId), []);
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
    const FirstPage = () => {
        const editor = useRef<Quill>(null);
        const [editCommentDialogOpen, setEditCommentDialogOpen] = useState(false);
        const [inEditMode, setInEditMode] = useState(false);
        const [commentStr, setCommentStr] = useState('');
        useEffect(() => {
            editor.current = new Quill(document.getElementById('quill'), {
                readOnly: true,
            });
        }, []);
        const {data: article} = useQuery(`/api/postDetail?postId=${postId}`, url => ask({url}).then(prop('data')), {
            onSuccess: data1 => editor.current.setContents(JSON.parse(data1.deltaContent), 'api')
        });
        const {data: commentData,refetch: requestGetComments} = useQuery(`/api/postComments?postId=${postId}`, url => ask({url}).then(prop('data')));
        const {isFetching: submitLoading,refetch: requestSubmitPostComment} = useQuery(`/api/submitPostComment`, url => ask({
            url,
            method: 'post',
            data: {
                postId,
                content: commentStr
            }
        }),{
            manual: true
        });
        return <React.Fragment>
            <div className={'p-1 ' + style['readonly-quill']}>
                {article && (
                    <section data-name={'顶部帖子信息栏'} className="mt-2 mb-2 border-b">
                        <div className="my-2">{article.title}</div>
                        <SimpleUserInfoTab avatar={defaultAvatar} userName={article.user.userName}
                                           time={new Date(article.createDate).toLocaleString('cn')}
                                           rightPart={<span>{article.views}浏览</span>}/>
                    </section>
                )}
                <div id="quill" className="select-auto"/>
                <div className="" style={{marginBottom: 72}} id="comment" data-name={'评论区'}>
                    {commentData &&
                    commentData.map((value) => {
                        return (
                            <div
                                className="w-full p-2 border-b"
                                key={value.id}
                                onClick={() => {
                                    eventEmitter.emit('open',value);
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
                    {inEditMode && (
                        <div className="items-center flex">
                            <input
                                className="flex-grow border border-gray-600 rounded-lg pl-2"
                                placeholder="说点什么吧！"
                                value={commentStr}
                                onChange={(event) => setCommentStr(event.target.value)}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter') {
                                        requestSubmitPostComment().then(data=>{
                                            if (data.data.status === 'ok') {
                                                Toast.info('评论成功');
                                                setCommentStr('');
                                                requestGetComments().then(() => {
                                                    document.body.scrollTo({
                                                        top: document.body.scrollHeight
                                                    })
                                                });
                                            }
                                        })
                                    }
                                }}
                            />
                            {submitLoading ? <CircularProgress style={{width: 20, height: 20}}/> :
                                <Fullscreen className="text-3xl" onClick={() => setEditCommentDialogOpen(true)}/>}
                        </div>
                    )}
                    <div className="flex">
                        <div
                            className="flex flex-col items-center w-1/4"
                            onClick={() => {
                                setInEditMode((v) => !v);
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
            </div>
            <Dialog open={editCommentDialogOpen} fullScreen disableBackdropClick>
                <NavBar centerPart={'添加评论'}
                        leftPart={<Close onClick={() => setEditCommentDialogOpen(false)}/>}
                        rightPart={submitLoading ? <CircularProgress style={{width: 20, height: 20}}/> :
                            <Check className="text-green-400" onClick={()=>{
                                requestSubmitPostComment().then(()=>{
                                    setEditCommentDialogOpen(false);
                                    setCommentStr('');
                                    requestGetComments().then(() => {
                                        document.body.scrollTo({
                                            top: document.body.scrollHeight
                                        })
                                    });
                                })
                            }}/>}/>
                <div className="">
                    <TextareaAutosize autoFocus className="h-screen w-full" placeholder="说点什么吧！"
                                      value={commentStr}
                                      onChange={(event) =>setCommentStr(event.target.value)}/>
                </div>
            </Dialog>
        </React.Fragment>;
    };
    const CommentDetail = () => {
        const [open, setOpen] = useState(false);
        const currentComment = useRef(null);// 当前的评论，由外部给出
        const [selectedReplyComment,setSelectedReplyComment] = useState(null);
        const [replyCommentStr, setReplyCommentStr] = useState('');
        useEventEmitter('open', (comment) => {
            currentComment.current = comment;
            setOpen(true);
        }); // 组件间通信，耦合的部分
        const {data: commentChildDetailData, isFetching: loading, refetch: getAllChildComment} = useQuery(currentComment.current?.id && `/api/commentChild?commentId=${currentComment.current.id}`, url => ask({url}).then(prop('data')), {
            onSuccess: data => {
                setSelectedReplyComment(commentChildDetailData.currentComment)
            }
        });
        const {refetch: onReplyComment} = useQuery(`/api/submitPostComment`, url => ask({
            url: url,
            method: 'post',
            data: {
                postId: postId,
                content: replyCommentStr,
                parentComment: selectedReplyComment.id,
            }
        }).then(prop('data')),{
            manual: true,
            onSuccess: data => {
                Toast.info('评论成功');
                setReplyCommentStr('');
                getAllChildComment();
            }
        });
        if (!currentComment.current ) {
            return null;
        }
        if (loading || !selectedReplyComment || !commentChildDetailData) {
            return <Dialog open={open} fullScreen disableBackdropClick>
                <Loading loading={true}/>;
            </Dialog>
        }
        return <Dialog open={open} fullScreen disableBackdropClick>
            <div className="bg-gray-200 min-h-screen flex flex-col">
                <NavBar
                    centerPart={ `${commentChildDetailData.child.length}条回复`}
                    leftPart={<Close onClick={() => setOpen(false)}/>}/>
                <div className="">
                    <div className="bg-white p-2"
                         onClick={() => setSelectedReplyComment(commentChildDetailData.currentComment)}>
                        <SimpleUserInfoTab
                            avatar={defaultAvatar}
                            userName={commentChildDetailData.currentComment.user.userName}
                            time={new Date(commentChildDetailData.currentComment.createDate).toLocaleString('cn')}
                            rightPart={
                                <span>
                                                <ThumbUpAltOutlined className="text-gray-900 mr-2 text-xl"/>
                                                <span
                                                    className="text-green-500">{commentChildDetailData.currentComment.likeCount}</span>
                                            </span>
                            }
                        />
                        <div className="ml-10">{commentChildDetailData.currentComment.content}</div>
                    </div>
                    <div className="my-2 p-1 bg-white pl-2">{commentChildDetailData.child.length}条回复
                    </div>
                    {commentChildDetailData.child.map((value) => {
                        return (
                            <div
                                key={value.id}
                                className="bg-white p-2"
                                onClick={() => {
                                    setSelectedReplyComment(value)
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
                <div className="items-center flex mt-auto border bg-white p-2">
                    <input
                        className="flex-grow"
                        value={replyCommentStr}
                        placeholder={selectedReplyComment.id === commentChildDetailData.currentComment.id ? '回复层主' : `@${selectedReplyComment.user.userName}:`}
                        onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                                onReplyComment();
                            }
                        }}
                        onChange={(event) => setReplyCommentStr(event.target.value)}
                    />
                    <span className="text-green-500"
                          onClick={() => onReplyComment()}>
                                发送
                            </span>
                </div>
            </div>
        </Dialog>;
    };
    return <div>
        <NavBar centerPart={'详情'}/>
        <FirstPage/>
        <CommentDetail/>
    </div>
}

