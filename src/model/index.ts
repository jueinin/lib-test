import {types} from "mobx-state-tree";
import {BookDetailStore, defaultBookDetailStore} from "./bookDetailStore";
import React, {useContext} from "react";

export const rootStore = types.model({
    bookDetailStore: BookDetailStore
}).create({
    bookDetailStore: defaultBookDetailStore
});
export const StoreProvider = React.createContext(rootStore);
export const useStore = () => {
    return useContext(StoreProvider);
};
