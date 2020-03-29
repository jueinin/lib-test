import React, {MouseEventHandler} from 'react';
interface Props {
    value: number;
    onIncrement: MouseEventHandler;
    onDecrement: MouseEventHandler;
}
const NumberInput: React.FC<Props> = (props) => {
    return (
        <div className="ml-auto flex flex-center  border text-gray-600">
            <div className="shadow-md flex-center  border-r px-2 hover:bg-gray-200" onClick={props.onDecrement}>
                -
            </div>
            <span className="px-4 text-black text-sm">{props.value}</span>
            <div className="flex-center shadow-md  border-l px-2 hover:bg-gray-200" onClick={props.onIncrement}>
                +
            </div>
        </div>
    );
};
export default NumberInput;
