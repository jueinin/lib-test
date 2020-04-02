import React, {CSSProperties, useEffect, useRef, useState} from 'react';
import { animated, useSpring } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import { always, clamp, cond, identity, pipe, T } from 'ramda';
import {observable, reaction} from "mobx";
import {observer,useLocalStore,useAsObservableSource} from "mobx-react";
import {interval} from "rxjs";
import {SetUpdateFn} from "react-spring/web";
interface Props {
    afterChange?: (index: number) => void;
    autoPlay?: boolean;
    autoPlaySpeed?: number;
}
class Logic {
    constructor(private props:Props,private setSlider:any) {
    }
    @observable index: number = 0;
    onEffect = () => {
        let subscribe;
        if (this.props.autoPlay) {
            subscribe=interval(this.props.autoPlaySpeed).subscribe(() => {
                this.index += 1;
                // @ts-ignore
                if (this.index === React.Children.count(this.props.children)) {
                    this.index = 0
                }
                this.setSlider.setSlider({
                    transform: `translateX(${-innerWidth * this.index}px)`
                })
            })
        }
        const dispose = reaction(() => this.index, this.props.afterChange);
        return ()=>{
            this.props.autoPlay && subscribe.unsubscribe();
            dispose();
        };
    };
    setIndex = (index: number) => {
        this.index = index;
    };
}
const Slider: React.FC<Props> = (props) => {
    const [slider, setSlider] = useSpring(() => ({
        transform: `translateX(0px)`,
    }));
    const observableSetSlider = useAsObservableSource({setSlider});
    const observableProps = useAsObservableSource(props);
    const logic = useLocalStore(() => new Logic(observableProps,observableSetSlider));
    const {index, setIndex} = logic;
    useEffect(logic.onEffect, []);
    const container = useRef(null);
    const bind = useDrag(({ movement: [x], down }) => {
        if (x > innerWidth || x < -innerWidth) {
            return;
        }
        if (down) {
            setSlider({
                transform: `translateX(${-innerWidth * index + x}px)`,
            });
        } else {
            let changeIndex = cond([
                [(x) => x > innerWidth / 3, always(-1)],
                [(x) => x < -innerWidth / 3, always(1)],
                [T, always(0)],
            ])(x);
            const currentIndex = clamp(0, React.Children.count(props.children) - 1, index + changeIndex);
            if (currentIndex !== index) {
                setIndex(currentIndex);
            }
            setSlider({
                transform: `translateX(${-innerWidth * currentIndex}px)`,
            });
        }
    });
    return (
        <div ref={container} className="w-full overflow-hidden" {...bind()}>
            <animated.div className="w-screen flex flex-no-wrap" style={slider}>
                {props.children}
            </animated.div>
        </div>
    );
};
Slider.defaultProps = {
    autoPlay: true,
    afterChange: () => {},
    autoPlaySpeed: 3000
};

export default observer(Slider);
