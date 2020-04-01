import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
interface Props {
    getEditorInstance: (editor: Quill) => void;
    onInputImage: (file: File) => void;
}

const Editor: React.FC<Props> = (props) => {
    const editorRef = useRef(null);
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
        props.getEditorInstance(editor);
    },[]);
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
                        props.onInputImage(event.target.files[0]);
                    }
                }}
                className="hidden"
                accept="image/*"
                type="file"
            />
        </div>
    );
};
export default Editor;
