import React from 'react';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import { BookDetailLogic } from './bookDetailLogic';
import { __, concat, ifElse, map, repeat, equals, always, pipe, addIndex } from 'ramda';
import { StarOutlined } from '@material-ui/icons';
interface Props {
    className?: string;
    bookDetailLogic: BookDetailLogic;
}
const Comment: React.FC<Props> = (props) => {
    const { commentData } = props.bookDetailLogic;
    if (!commentData) {
        return null;
    }
    return (
        <div>
            <div className={props.className}>
                {commentData.data.map((value, index) => {
                    return (
                        <div key={index} className="p-2 border-b border-solid border-gray-500 shadow-sm hover:bg-gray-200">
                            <div data-name={'title'} className="flex">
                                <div className="mr-auto">{value.name}</div>
                                <div className="ml-auto">
                                    {pipe((v: number) => {
                                        const date = new Date(v * 1000);
                                        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                                    })(value.time)}
                                </div>
                            </div>
                            <div data-name={'star'} className=" flex">
                                {pipe(
                                    repeat('Y'),
                                    concat(__, repeat('N', 5 - value.star)),
                                    addIndex(map)((value, index) => {
                                        const val = pipe(ifElse(equals('Y'), always(<StarOutlined className="text-red-500 text-lg" />), always(<StarOutlined className="text-pink-200 text-lg" />)))(value);
                                        return <div key={index}>{val}</div>;
                                    })
                                )(value.star)}
                            </div>
                            <div data-name={'text'} className="mt-2 text-sm">
                                {value.commentText}
                            </div>
                            {value.commentImg.length&& <div className="flex">
                                {pipe(addIndex(map)((value: string,index)=>{
                                    return <img key={index} src={value} alt="comment img" className="w-1/5 mr-2"/>
                                }))(value.commentImg)}
                            </div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
Comment.propTypes = {
    className: propTypes.string,
    bookDetailLogic: propTypes.instanceOf(BookDetailLogic).isRequired,
};
export default observer(Comment);
