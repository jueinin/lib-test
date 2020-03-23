
import React, {useContext} from "react";
import {UserStore} from "./userStore";

export const rootStore = {
    userStore: new UserStore()
};
export const StoreProvider = React.createContext(rootStore);
export const useStore = () => {
    return useContext(StoreProvider);
};
