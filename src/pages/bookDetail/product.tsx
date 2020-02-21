import React from "react";
import {ProductData} from "./index";
import Slider from "react-slick";
import {useStore} from "../../model";
interface ProductProps {
    className?: string;
}

const Product: React.FC<ProductProps> = (props) => {
    const {
        bookDetailStore: {
            product: {
                data
            }
        }
    } = useStore();
    if (!data) {
        return null;
    }
    return <div className={"bg-gray-700" + props.className || ''}>
        <section data-name={'顶栏'} className="p-2 bg-white">
            <Slider lazyLoad="ondemand" autoplay>
                {(
                 data.images || []).map(value => {
                    return <div>
                        <img alt="slider pic" src={value}/>
                    </div>
                })
                }
            </Slider>
            <div className="my-3 font-bold text-red-500 text-3xl">{data.price}</div>
            <div className="text-sm text-gray-700">{data.description}</div>
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8">{data.author}</div>
                <div className="col-span-4">{data.publisher}</div>
            </div>
        </section>
        <section className="p-2 mt-4 bg-white" data-name={'comment'}>
            <h3 className="flex items-end">
                <span className="font-bold text-3xl">评论</span>
                <span
                    className="">{(data.comment.goodComments / data.comment.comments).toFixed(2)}%好评 (共{data.comment.comments}条评价)</span>
                <span>查看更多></span>
            </h3>
        </section>
    </div>;
};
export default Product;
