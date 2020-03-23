import {computed, observable} from "mobx";
import {ask} from "../util";
type UserData= {
    shoppingCart: {
        items: {
            bookId: number,
            title: string,
            price: number,
            count: number,
            smallImage: string,
            checked: boolean
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
        }).then(value => {
            this.userData = value.data;
        })
    }
}

