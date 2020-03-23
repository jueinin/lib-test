import React from "react";
import NavBar from "../components/navbar";
import {observer} from "mobx-react";
const ShoppingCart:React.FC=()=>{
    return <div>
        <NavBar centerPart={'购物车'}/>

    </div>
}
export default observer(ShoppingCart);
