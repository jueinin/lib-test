import {types} from "mobx-state-tree";

export const shoppingCartItem = types.model({
    bookId: types.number,
    title: types.string,
    price: types.number,
    count: types.number,
    smallImage: types.string,
    checked: types.maybeNull(types.boolean)
});
const userStore = types.model({});
