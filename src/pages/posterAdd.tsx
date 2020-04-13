import React, { ChangeEventHandler, useEffect, useRef, useState } from 'react';
import NavBar from '../components/navbar';
import { observer, useLocalStore } from 'mobx-react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { ask, eventEmitter } from '../util';
import { CircularProgress } from '@material-ui/core';
import { Toast } from '../components/Toast';
import Editor from '../components/editor';
import {useMutation} from "react-query";
const PosterAdd: React.FC = () => {
    const [title, setTitle] = useState('');
    const editorRef = useRef<Quill>(null);
    const [onSave,{status}] = useMutation(() => {
            const imageUrls = Array.from(document.querySelectorAll('#editor img')).map((value) => value.getAttribute('src'));
            return ask({
                url: `/api/postAdd`,
                method: 'post',
                data: {
                    title: this.title,
                    deltaContent: JSON.stringify(this.editor.getContents()),
                    htmlContent: document.getElementById('editor').innerHTML,
                    imageUrls,
                },
            }).then((value) => {
                    Toast.info('发帖成功!');
                    (window as any).browserHistory.replace('/forum');
                })
        }
    );
    return (
        <div>
            <NavBar
                centerPart={'发帖'}
                rightPart={
                    <span className="text-red-500 mr-2" onClick={onSave}>
                        {status==="loading" && <CircularProgress size={14} />}保存
                    </span>
                }
            />
            <div>
                <div className="w-full p-2 shadow-sm border-b">
                    <input className="w-full" placeholder="为帖子起个响亮的名字吧！" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
            </div>
            <Editor getEditorInstance={(editor) => (editorRef.current = editor)} />
        </div>
    );
};
export default PosterAdd;
