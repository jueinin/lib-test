import React from "react";
import {useSpring} from "react-spring";
import {useDrag} from "react-use-gesture";
type Props = {
    onRefresh: () => void;
    loading: boolean;
    className?: string;
}
const PullToRefresh: React.FC<Props> = (props) => {
    const [springProps, set] = useSpring(() => ({
        display: 'none',
    }));
    const bind = useDrag(({down,movement: [mx,my]}) => {
        if (down) {
            set({
                display: 'block'
            })
        }
    });
    return <div className={"relative "+ props.className}>
        <div data-name={'loading indicator'} style={springProps}>

        </div>
    </div>
};
export default PullToRefresh;
