<template>
  <v-app>
    <Navbar main="tes main">
      <template v-slot:back>
        <v-btn small fab text color="primary_red_1" @click="$router.go(-1)">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </template>
      <template v-slot:body>
        <v-toolbar-title>Pengaturan</v-toolbar-title>
      </template>
    </Navbar>
    <v-content>
      <v-container>
        <v-list>
          <!-- <v-subheader>REPORTS</v-subheader> -->
          <v-list-item-group color="primary_red_1">
            <v-list-item v-for="(item, i) in items" :key="i" @click="$router.push(item.path)">
              <v-list-item-icon>
                <v-icon v-text="item.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.text"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
        <v-row class="px-1"></v-row>
        <v-divider class="my-3"></v-divider>
      </v-container>
    </v-content>
  </v-app>
</template>
<script>
import lazyImg from '../assets/lazy-img.jpg';
import Navbar from '../components/Navbar';
import { checkTokenExp, refreshToken } from '../services';
import Axios from 'axios';
import { apiBaseUrl } from '../api';
import numberWithPeriod from '../mixins/numberWithPeriod';
export default {
  mounted() {
    this.loadStore();
  },
  data: () => ({
    lazyImg: lazyImg,
    item: 2,
    items: [
      { text: 'Data diri', icon: 'mdi-account', path: '/setting-user-account' },
      { text: 'Toko', icon: 'mdi-storefront', path: '/setting-user-store' },
      { text: 'Password', icon: 'mdi-lock', path: '/setting-user-password' },
    ],
  }),
  methods: {
    async loadStore() {
      const requestStore = async () => {
        const { storeId } = this.$route.params;
        const { token } = JSON.parse(localStorage.getItem('auth'));
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        };
        const url = `${apiBaseUrl}/api/stores/${storeId}`;
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        };
        const result = await Axios();
        console.log(result.data);
        this.supplier = result.data;
      };
      const checkToken = await checkTokenExp();
      if (checkToken == true) {
      }
    },

    apiImage(image) {
      return `${apiBaseUrl}/${image}`;
    },
  },
  components: {
    Navbar,
  },
};
</script>