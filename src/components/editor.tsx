import React, {useEffect, useRef, useState} from 'react';
import Quill from 'quill';
import {ask} from "../util";
import Loading from "./Loading";
interface Props {
    getEditorInstance: (editor: Quill) => void;
    // onInputImage: (file: File) => void;
}

const Editor: React.FC<Props> = (props) => {
    const editorRef = useRef(null);
    const [uploadImageLoading, setUploadImageLoading] = useState(false);
    useEffect(() => {
        const editor = new Quill('#editor', {
            placeholder: '请输入...',
            theme: 'snow',
            modules: {
                toolbar: {
                    container: '#toolbar',
                    handlers: {
                        image: function() {
                            const inputEle = document.getElementById('upload-input') as HTMLInputElement;
                            inputEle.click();
                        },
                    },
                },
            },
        });
        editorRef.current = editor;
        props.getEditorInstance(editor);
    },[]);
    const onImageInput = (file: File) => {
        setUploadImageLoading(true)
        const formData = new FormData();
        formData.append('image', file);
        ask({
            url: `/api/uploadImage`,
            method: 'post',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            data: formData
        }).then(value => {
            const url = value.data.url;
            editorRef.current.insertEmbed(this.editor.getSelection().index, 'image', url, "api")
            editorRef.current.setSelection(this.editor.getSelection().index + 1, 0); // right move one
        }).finally(() => setUploadImageLoading(false));
    };
    return (
        <div>
            <div id="toolbar">
                <select className="ql-size">
                    <option value={'normal'} />
                    <option value="small" />
                    <option value="large" />
                    <option value="huge" />
                </select>
                <span className="ql-format">
                    <button className="ql-bold" />
                    <button className="ql-italic" />
                    <button className="ql-strike" />
                </span>
                <button className="ql-image" />
                <button className="ql-link" />
            </div>
            <div id="editor" className="border-t" style={{ userSelect: 'auto' }} />
            <input
                id="upload-input"
                onChange={(event) => {
                    if (event.target.files.length == 1) {
                        onImageInput(event.target.files[0]);
                    }
                }}
                className="hidden"
                accept="image/*"
                type="file"
            />
            {uploadImageLoading && <div className="fixed flex flex-col items-center bg-gray-200 w-1/2 rounded-lg"
                                              style={{top: "50%", left: '50%', transform: 'translate(-50%,-50%)'}}>
                <Loading loading={uploadImageLoading}/>
                上传中...
            </div>}
        </div>
    );
};
export default Editor;
