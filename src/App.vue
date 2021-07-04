<template>
  <v-app>
    <router-view />
    <v-snackbar
      v-model="snackbarMasterProduct"
      :right="true"
      :timeout="6000"
      :top="true"
      color="success"
    >
      Import master product done
      <v-btn dark text @click="snackbarMasterProduct = false">Close</v-btn>
    </v-snackbar>
    <v-snackbar v-model="snackbarProduct" :right="true" :timeout="6000" :top="true" color="success">
      Import product done
      <v-btn dark text @click="snackbarProduct = false">Close</v-btn>
    </v-snackbar>
    <v-snackbar v-model="snackbarUser" :right="true" :timeout="6000" :top="true" color="success">
      Import user done
      <v-btn dark text @click="snackbarUser = false">Close</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import Navbar from './components/Navbar'
import { checkTokenExp, refreshToken } from './services'

import firebase from './api/firebase'

export default {
  name: 'App',
  components: { Navbar },
  mounted() {
    this.getInitStateMasterProduct()
    this.getListenChangeMasterProduct()
    this.getListenChangeProduct()
    this.getListenChangeUser()
  },
  data: () => ({
    snackbarMasterProduct: false,
    snackbarProduct: false,
    snackbarUser: false,
  }),
  methods: {
    async getInitStateMasterProduct() {
      firebase
        .database()
        .ref('import-job')
        .orderByChild('name')
        .equalTo('master-product')
        .once('child_added', (snapshot) => {
          console.log('init', snapshot.val())
        })
    },
    async getListenChangeMasterProduct() {
      firebase
        .database()
        .ref('import-job')
        .orderByChild('name')
        .equalTo('master-product')
        .on('child_changed', (snapshot) => {
          console.log('change', snapshot.val())
          if (snapshot.val().isImporting === false) {
            this.snackbarMasterProduct = true
          }
        })
    },
    async getListenChangeProduct() {
      firebase
        .database()
        .ref('import-job')
        .orderByChild('name')
        .equalTo('product')
        .on('child_changed', (snapshot) => {
          console.log('change', snapshot.val())
          if (snapshot.val().isImporting === false) {
            this.snackbarProduct = true
          }
        })
    },
    async getListenChangeUser() {
      firebase
        .database()
        .ref('import-job')
        .orderByChild('name')
        .equalTo('user')
        .on('child_changed', (snapshot) => {
          console.log('change', snapshot.val())
          if (snapshot.val().isImporting === false) {
            this.snackbarUser = true
          }
        })
    },
  },
  watch: {
    $route(to, from) {
      document.title = to.meta.title || 'Astra SCM'
    },
  },
}
</script>
