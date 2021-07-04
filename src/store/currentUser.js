import user from '../services/getCurrentUser'

export const currentUser = {
  state: {
    currentUser: {
      _id: '',
      customerId: '',
      dealerCustomerId: '',
      name: '',
      email: '',
      phone: '',
      image: '',
      storeId: null,
      role: {
        _id: '',
        name: '',
        id: '',
      },
    },
  },
  mutations: {
    SET_CURRENT_USER(state, payload) {
      state.currentUser = payload
    },
  },
  actions: {
    async setCurrentUser({ commit }, payload, local) {
      if (local) {
        commit('SET_CURRENT_USER', user)
      }
      commit('SET_CURRENT_USER', payload)
    },
  },
  getters: {
    getCurrentUser(state) {
      return state.currentUser
    },
  },
}
