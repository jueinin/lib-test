import React, {useEffect} from "react";
import NavBar from "../components/navbar";
import {computed, observable} from "mobx";
import {observer, useLocalStore} from "mobx-react";
import {ask, defaultAvatar} from "../util";
import {parse} from "query-string";
import Quill from "quill";

class Logic {
    @computed get postId() {
        return Number(parse(window.location.search.slice(1)).postId);
    }

    @observable article = null;
    onUseEffect=()=>{
        const editor = new Quill(document.getElementById('quill'), {
            readOnly: true
        });
        ask({
            url: `/api/postDetail?postId=${this.postId}`
        }).then(value =>{
            this.article = value.data;
            editor.setContents(JSON.parse(value.data.deltaContent), "api");
        });
    }
}

const PostDetail: React.FC = () => {
    const logic = useLocalStore(() => new Logic());
    useEffect(logic.onUseEffect, []);
    return <div>
        <NavBar centerPart={'详情'}/>
        <div className="p-1">
            {logic.article && <section className="mt-2 mb-2 border-b">
                <div className="my-2">{logic.article.title}</div>
                <div className="flex items-center">
                    <img src={defaultAvatar} className="w-8 h-8 rounded-full"/>
                    <div className="flex flex-col ml-2">
                        <h4 className="text-blue-500">{logic.article.user.userName}</h4>
                        <h6 className="text-sm text-gray-500">{new Date(logic.article.createDate).toLocaleString('zh-cn',{
                            timeZone: 'Asia/Shanghai'
                        })}</h6>
                    </div>
                    <span className="ml-auto mr-2">{logic.article.views}浏览</span>
                </div>
            </section>}
            <div id="quill"/>

        </div>
    </div>;
};
export default observer(PostDetail);
