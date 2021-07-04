import { getCarts } from '../services/apis';
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const userId = currentUser._id;

export const cart = {
    state: {
        auth: {
            token: '',
            exp: 0,
        },
    },
    mutations: {
        SET_AUTH(state) {
            state.auth = payload;
        },
    },
    actions: {
        async setAuth({ commit }, payload) {
            commit('SET_AUTH', payload);
        },
    },
    getters: {
        getAuth(state) {
            return state.auth;
        },
    },
};
