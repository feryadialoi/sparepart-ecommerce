import { apiBaseUrl as api } from '../api';
import auth from './getAuth';

const headers = {
    Authorization: 'Bearer ' + auth.token,
    'Content-Type': 'application/json',
};
const method = '';
const url = api;
const data = {};

const config = {
    headers,
    method,
    url,
    data,
};

export default config;
