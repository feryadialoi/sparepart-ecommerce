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
        <v-row class="px-1">
          <v-avatar color="grey"></v-avatar>
        </v-row>

        <v-list>
          <!-- <v-subheader>REPORTS</v-subheader> -->
          <v-list-item-group color="primary_red_1">
            <v-list-item v-for="(value, name, index) in currentUser" :key="index">
              <v-list-item-icon>
                <v-icon v-text="item.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="value"></v-list-item-title>
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
    this.loadCurrentUser();
  },
  data: () => ({
    lazyImg: lazyImg,
    item: 2,
    items: [
      { text: 'Data diri', icon: 'mdi-account' },
      { text: 'Toko', icon: 'mdi-storefront' },
      { text: 'Password', icon: 'mdi-lock' },
    ],
    currentUser: {
      name: '',
      email: '',
      phone: '',
    },
  }),
  methods: {
    async loadCurrentUser() {
      const requestCurrentUser = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'));
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        };
        const url = `${apiBaseUrl}/api/users/account`;
        const config = {
          headers: headers,
          method: 'POST',
          url: url,
        };
        const result = await Axios(config);
        console.log(result.data);
      };
      const checkToken = await checkTokenExp();
      if (checkToken == true) {
        requestCurrentUser();
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