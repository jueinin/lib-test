import React, { useRef, useState } from 'react';
import { useSpring, animated, useSprings, SetUpdateCallbackFn, useTransition } from 'react-spring';
import { useDrag, useGesture } from 'react-use-gesture';
import { clamp, equals, ifElse } from 'ramda';
import { Transition } from 'react-spring/renderprops';
import {Subject} from "rxjs";
const pages = [
    'https://images.pexels.com/photos/62689/pexels-photo-62689.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    'https://images.pexels.com/photos/296878/pexels-photo-296878.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    'https://images.pexels.com/photos/1509428/pexels-photo-1509428.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    'https://images.pexels.com/photos/351265/pexels-photo-351265.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    'https://images.pexels.com/photos/924675/pexels-photo-924675.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
];
const Animate = () => {
    const [opened, setOpen] = useState(false);
    const height = useRef(new Subject());
    const transition = useTransition(opened, null, {
        from: {
            height: 0,
        },
        enter: {
            height: 300,
        },
        leave: {
            height: 0,
        },
    });
    const [props, set] = useSpring(() => ({
        height: 300,
    }));
    const bind = useDrag((state) => {
        console.log('dd');
        if (state.down) {
            if (state.direction[1] > 0) {
                if (state.velocities[1] > 2) {
                    setOpen(false);
                    state.cancel();
                } else {
                    set({
                        height: 300 - state.distance,
                    });
                }
            }
        } else {
            set({
                height: 300,
            });
        }
    }, {});

    return (
        <div className="overflow-hidden w-full h-screen bg-gray-400">
            <button onClick={() => setOpen((opened) => !opened)}>open/close</button>
            {transition.map((value) => {

                return value.item ? (
                    <animated.div
                        className="bottom-0 fixed w-full overflow-hidden flex flex-col-reverse"
                        style={{
                            backgroundColor: "transparent",
                            height: value.props.height,
                        }}
                    >
                        <animated.div {...bind()} className="bg-red-400 " style={{
                            height: props.height
                        }}></animated.div>
                    </animated.div>
                ) : null;
            })}
        </div>
    );
};
const TestHeightInChrome=()=>{
    const height = document.getElementById('t')?.clientHeight;
    return <div id="t" className="h-screen w-full bg-red-400">
        <div className="bottom-0 fixed w-full h-40 bg-green-300"></div>
    </div>;
}
export default Animate;
