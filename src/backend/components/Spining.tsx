import React from "react";
import {Spin} from "antd";

const Spining = () => {
    return <div className="flex-center w-full h40">
        <Spin delay={300}/>
    </div>
};
export default Spining;
