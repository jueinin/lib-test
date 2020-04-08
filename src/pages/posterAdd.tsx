import React, {ChangeEventHandler, useEffect} from 'react';
import NavBar from '../components/navbar';
import { observer, useLocalStore } from 'mobx-react';
import { observable } from 'mobx';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import {ask, eventEmitter} from "../util";
import {CircularProgress} from "@material-ui/core";
import Loading from "../components/Loading";
import {Toast} from "../components/Toast";
import Editor from "../components/editor";
class Logic {
    editor: Quill;
    @observable uploadImageLoading = false;
    @observable saveLoading = false;
    @observable title: string = '';
    onUseEffect = () => {

    };
    // onImageInput = (file: File) => {
    //     this.uploadImageLoading = true;
    //     const formData = new FormData();
    //     formData.append('image', file);
    //     ask({
    //         url: `/api/uploadImage`,
    //         method: 'post',
    //         headers: {
    //             'Content-Type': 'multipart/form-data'
    //         },
    //         data: formData
    //     }).then(value => {
    //         const url = value.data.url;
    //         this.editor.insertEmbed(this.editor.getSelection().index, 'image', url, "api")
    //         this.editor.setSelection(this.editor.getSelection().index + 1, 0); // right move one
    //     }).finally(() => this.uploadImageLoading = false);
    // };
    onSave=()=>{
        this.saveLoading = true;
        const imageUrls = Array.from(document.querySelectorAll('#editor img')).map(value => value.getAttribute('src'));
        ask({
            url: `/api/postAdd`,
            method: 'post',
            data: {
                title: this.title,
                deltaContent: JSON.stringify(this.editor.getContents()),
                htmlContent: document.getElementById('editor').innerHTML,
                imageUrls
            }
        }).then(value => {
            Toast.info('发帖成功!');
            eventEmitter.emit('forum:refreshData');
            (window as any).browserHistory.replace('/forum');
        }).finally(() => this.saveLoading = false);
    }
}

const PosterAdd: React.FC = () => {
    const logic = useLocalStore(() => new Logic());
    useEffect(logic.onUseEffect, []);
    return (
        <div>
            <NavBar centerPart={'发帖'}
                    rightPart={<span className="text-red-500 mr-2" onClick={logic.onSave}>{logic.saveLoading &&
                    <CircularProgress size={14}/>}保存</span>}/>
            <div>
                <div className="w-full p-2 shadow-sm border-b">
                    <input className="w-full" placeholder="为帖子起个响亮的名字吧！" value={logic.title}
                           onChange={event => logic.title = event.target.value}/>
                </div>
            </div>
            <Editor getEditorInstance={(editor) => logic.editor = editor}/>
            {/*{logic.uploadImageLoading && <div className="fixed flex flex-col items-center bg-gray-200 w-1/2 rounded-lg"*/}
            {/*                                  style={{top: "50%", left: '50%', transform: 'translate(-50%,-50%)'}}>*/}
            {/*    <Loading loading={logic.uploadImageLoading}/>*/}
            {/*    上传中...*/}
            {/*</div>}*/}
        </div>
    );
};
export default observer(PosterAdd);
