import { ShoppingCartOutlined } from '@material-ui/icons';
import React from 'react';
import { useHistory } from 'react-router-dom';
interface Props {
    bookId: number;
    imgUrl: string;
    title: string;
    onClick: any;
    price: number;
}
const BookItemGrid: React.FC<Props> = (props) => {
    const { push } = useHistory();
    return (
        <div
            key={props.bookId}
            className="bg-white rounded-lg grid grid-cols-1 gap-2"
            onClick={props.onClick}
        >
            <img src={props.imgUrl} className="w-full" />
            <h2
                className="mt-2 text-lg mx-2 truncate-2-lines "
                style={{
                    height: '3.2rem',
                    fontWeight: 520,
                }}
            >
                {props.title}
            </h2>
            <h3 className="flex mt-1 mx-2 mb-1">
                <span className="mr-auto text-lg font-bold">
                    <span className="" style={{ marginRight: 2 }}>
                        ￥
                    </span>
                    {props.price
                        .toString()
                        .split('.')
                        .map((value1, index) => {
                            if (index === 0) {
                                return (
                                    <span key={index} className="text-lg">
                                        {value1}
                                    </span>
                                );
                            }
                            if (index === 1 && value1 !== '0') {
                                return (
                                    <span key={index} className="text-sm">
                                        .{value1}
                                    </span>
                                );
                            }
                        })}
                </span>
                {/*<ShoppingCartOutlined className="ml-auto text-red-500" />*/}
            </h3>
        </div>
    );
};
export default BookItemGrid;
