import Vue from 'vue';
import Vuex from 'vuex';

// stores
import { cart } from './cart';
import { currentUser } from './currentUser';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    cart,
    currentUser,
  },
});

export default store;
