<template>
  <!-- <v-card class="pa-3 mb-3"> -->
  <v-row>
    <v-col cols="12">
      <div class="display-1 font-weight-thin">3 Top Sell Dealer</div>
    </v-col>
    <v-col
      v-for="topSellDealer in topSellDealers"
      :key="topSellDealer._id.customerId"
      cols="12"
      lg="4"
      md="4"
      sm="12"
    >
      <v-card outlined class="pa-3">
        <v-layout justify-center>
          <div v-if="topSellDealer.user.length > 0">{{ topSellDealer.user[0].name }}</div>
          <div v-else>{{ "Nama tidak tersedia" }}</div>
        </v-layout>
        <v-divider></v-divider>
        <v-layout align-center>
          <div class="mr-3">
            <v-avatar size="60">
              <v-img :src="apiImage(topSellDealer.store[0].image)"></v-img>
            </v-avatar>
          </div>
          <v-row>
            <v-col>
              <div class="caption font-weight-bold">{{ topSellDealer.store[0].name }}</div>
              <div class="caption">{{ topSellDealer.address[0].name }}</div>
            </v-col>
          </v-row>
        </v-layout>
        <v-row>
          <v-col class="py-0">
            <div class="caption text-end">{{"total produk terjual " + topSellDealer.total}}</div>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
  <!-- </v-card> -->
</template>

<script>
import VClamp from 'vue-clamp'
import lazyImg from '../../assets/lazy-img.jpg'
import { checkTokenExp, refreshToken } from '../../services'
import Axios from 'axios'
import { apiBaseUrl } from '../../api'
import numberWithPeriod from '../../mixins/numberWithPeriod'
export default {
  mounted() {
    this.setTopSellDealer()
  },
  data: () => ({
    topSellDealers: [],
  }),
  methods: {
    async getTopSellDealer() {
      const { token } = JSON.parse(localStorage.getItem('auth'))
      const response = await Axios({
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        method: 'GET',
        url: `${apiBaseUrl}/api/sellers/top-sellers`,
      })
      return response.data
    },
    async setTopSellDealer() {
      this.topSellDealers = await this.getTopSellDealer()
      console.log('top sell dealer', this.topSellDealers)
    },
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
  },
}
</script>
