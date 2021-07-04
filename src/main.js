import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import vuetify from './plugins/vuetify'
import VueFire from 'vuefire'
import Notifications from 'vue-notification'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  VueFire,
  Notifications,
  render: (h) => h(App),
}).$mount('#app')
