import {computed, observable} from "mobx";
import {ask} from "../util";
type UserData= {
    shoppingCart: {
        items: {
            bookId: number,
            title: string,
            price: number,
            smallImage: string,
            checked: boolean,
            id: number;
            count: number;
        }[];
    },
    user: {
        id: number,
        email: string,
        userName: string;
    }
}

export class UserStore {
    @observable userData: UserData = null;

    @computed get isLogin() {
        return !!this.userData;
    }

    getUserData = () => {
        ask({
            url: `/api/userData`
        }).then((value) => {
            const data: UserData = value.data;
            data.shoppingCart.items = data.shoppingCart.items.map(value1 => {
                value1.checked = false;
                value1.count = 1;
                return value1
            });
            this.userData = data;
        })
    }
}

