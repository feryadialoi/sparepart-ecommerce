import { getCarts } from '../services/apis'
import currentUser from '../services/getCurrentUser'

export const cart = {
  state: {
    carts: [],
  },
  mutations: {
    SET_CARTS(state, payload) {
      state.carts = payload
    },
  },
  actions: {
    async setCarts({ commit }) {
      try {
        const userId = currentUser._id
        const urlParams = `isEmpty=${false}&userId=${userId}&page=${0}&count=${1}`
        const response = await getCarts(urlParams)
        commit('SET_CARTS', response.data)
      } catch (error) {
        console.log(error.response)
      }
    },
  },
  getters: {
    getCarts(state) {
      return state.carts
    },
  },
}
