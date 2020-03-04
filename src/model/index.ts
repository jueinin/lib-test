
import React, {useContext} from "react";

export const rootStore = {};
export const StoreProvider = React.createContext(rootStore);
export const useStore = () => {
    return useContext(StoreProvider);
};
