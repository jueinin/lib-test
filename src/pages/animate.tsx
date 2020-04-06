import React, { useRef, useState } from 'react';
import PopConfirm from "../components/popConfirm";
const pages = [
    'https://images.pexels.com/photos/62689/pexels-photo-62689.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    'https://images.pexels.com/photos/296878/pexels-photo-296878.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    'https://images.pexels.com/photos/1509428/pexels-photo-1509428.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    'https://images.pexels.com/photos/351265/pexels-photo-351265.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    'https://images.pexels.com/photos/924675/pexels-photo-924675.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
];
// const Animate = () => {
//     const [opened, setOpen] = useState(false);
//     const height = useRef(new Subject());
//     const transition = useTransition(opened, null, {
//         from: {
//             height: 0,
//         },
//         enter: {
//             height: 300,
//         },
//         leave: {
//             height: 0,
//         },
//     });
//     const [props, set] = useSpring(() => ({
//         height: 300,
//     }));
//     const bind = useDrag((state) => {
//         console.log('dd');
//         if (state.down) {
//             if (state.direction[1] > 0) {
//                 if (state.velocities[1] > 2) {
//                     setOpen(false);
//                     state.cancel();
//                 } else {
//                     set({
//                         height: 300 - state.distance,
//                     });
//                 }
//             }
//         } else {
//             set({
//                 height: 300,
//             });
//         }
//     }, {});
//
//     return (
//         <div className="overflow-hidden w-full h-screen bg-gray-400">
//             <button onClick={() => setOpen((opened) => !opened)}>open/close</button>
//             {transition.map((value) => {
//                 return value.item ? (
//                     <animated.div
//                         className="bottom-0 fixed w-full overflow-hidden flex flex-col-reverse"
//                         style={{
//                             backgroundColor: 'transparent',
//                             height: value.props.height,
//                         }}
//                     />
//                 ) : null;
//             })}
//         </div>
//     );
// };
// const TestHeightInChrome = () => {
//     const height = document.getElementById('t')?.clientHeight;
//     return (
//         <div id="t" className="h-screen w-full bg-red-400">
//             <div className="bottom-0 fixed w-full h-40 bg-green-300"></div>
//         </div>
//     );
// };
// const height = 200;
//
// const DraggableList = () => {
//     const list = useRef(['a', 'b', 'c', 'd']);
//     const order = useRef(list.current.map((_, index) => index));
//     const [springs, setSprings] = useSprings(list.current.length, (i) => {
//         return {
//             scale: 1,
//             y: 0,
//             zIndex:0
//         };
//     });
//     const bind = useDrag(({down, args: [movingIndex], delta: [, deltaY],movement: [,y]}) => {
//         const curIndex = order.current.indexOf(movingIndex);
//         const curRow = clamp(Math.round((curIndex * 40 + y) / 40), 0, list.current.length - 1);
//         const newOrder = swap(order.current, curIndex, curRow);
//         // @ts-ignore
//         setSprings((index: number) => {
//             return down && index === movingIndex ? {
//                 y: y,
//                 scale: 1.1,
//                 zIndex: 1,
//             } : {
//                 y: 0,
//                 scale: 1,
//                 zIndex: 0
//             }
//         });
//
//     });
//     return (
//         <div style={{position: "relative"}}>
//             {springs.map((value, index) => {
//                 return (
//                     <animated.div
//                         {...bind(index)}
//                         key={index}
//                         className="w-40 h-8 text-center bg-red-500"
//                         style={{
//                             transform: interpolate([value.y, value.scale], (y, scale) => `translate3d(0,${y}px,0) scale(${scale})`),
//                             zIndex: value.zIndex
//                         }}
//                     >
//                         {list.current[index]}
//                     </animated.div>
//                 );
//             })}
//         </div>
//     );
// };
export default ()=>{
    return <div>
        <div className="mt-40 ml-40">
            {/*<PopConfirm overlay={<div>66666</div>}>*/}
            {/*<div className="bg-red-500 inline-block" id="tt" onClick={console.log}>contnet</div>*/}
            {/*</PopConfirm>*/}
        </div>
    </div>
}
