import {createBrowserHistory} from 'history';
import Axios from 'axios'
export const browserHistory = createBrowserHistory();

export const ask = Axios.create({});

