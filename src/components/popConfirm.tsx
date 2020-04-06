import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
interface Props {
    overlay: ReactNode;
    onCancel: () => void;
    onConfirm: ()=>void;
}
interface State {

}
class PopConfirm extends React.Component<Props, any>{
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            x: 0,
            y: 0
        };
    }

    childRef=React.createRef<HTMLBaseElement>();
    childOnClick;
    calculateXY = () => {
        const height = document.getElementById('overlay').offsetHeight;
        const {left, top} = this.childRef.current.getBoundingClientRect();
        this.setState({
            x: left,
            y: top - height-6
        });
    };
    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        // @ts-ignore
        this.childOnClick = this.props.children?.props?.onClick;
        console.log(this.props.children)
        const child = React.cloneElement(this.props.children as any, {
            ref: this.childRef,
            onClick: e=>{
                this.setState({
                    open: !this.state.open
                }, this.calculateXY);
                this.childOnClick && this.childOnClick(e);
            }
        });
        return <React.Fragment>
            {child}
            {this.state.open && createPortal(<div className="absolute inset-0" onClick={(e)=>{
                e.target===e.currentTarget && this.setState({
                    open: false
                })
            }}>
                <div id="overlay" className="inline-block border rounded-lg p-2 shadow-2xl" style={{
                    transform: `translate(${this.state.x}px,${this.state.y}px)`
                }}>
                    <div className="" style={{minWidth: 120}}>
                        {this.props.overlay}
                        <div className="flex w-full text-sm">
                            <button className="border p-1 px-2 ml-auto rounded-sm">取&nbsp;消</button>
                            <button className="p-1 px-2 text-white bg-blue-500 ml-4 rounded-sm active:bg-blue-500 border border-blue-400 active:border-blue-500">确&nbsp;认</button>
                        </div>
                    </div>
                </div>
            </div>,document.body)}
        </React.Fragment>;
    }
}

export default PopConfirm
