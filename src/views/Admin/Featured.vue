<template>
  <v-app>
    <nav>
      <Navbar main="tes main">
        <template v-slot:body>
          <v-toolbar-title>Featured</v-toolbar-title>
        </template>
      </Navbar>
    </nav>
    <v-content v-if="isLoading">
      <v-container>
        <v-row>
          <v-col
            v-for="item in skeletonLoaderItem"
            :key="item"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            xl="3"
          >
            <v-skeleton-loader type="list-item-avatar-three-line"></v-skeleton-loader>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-content v-if="!isLoading">
      <v-container>
        <v-row>
          <v-col
            v-for="(collection, name) in collections"
            :key="name"
            cols="6"
            lg="3"
            md="6"
            sm="6"
          >
            <v-card class="primary_green_1 lighten-2">
              <v-layout class="pa-5">
                <div class="white--text">{{ name }}</div>
              </v-layout>
              <v-layout justify-end class="px-5 pb-2 pt-0">
                <div class="display-1 white--text">{{ collection }}</div>
              </v-layout>
              <v-divider class="white"></v-divider>
              <v-card-actions class="justify-center">
                <v-btn @click="goToCountPage(name)" dark block text>Go to Page</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <TopSellers></TopSellers>
        <Recommended></Recommended>
      </v-container>
    </v-content>
  </v-app>
</template>
<style>
.tf {
  max-width: 40px;
}
</style>
<script>
import VClamp from 'vue-clamp'
import lazyImg from '../../assets/lazy-img.jpg'
import Navbar from '../../components/Navbar'
import TopSellers from './TopSellers'
import Recommended from './Recommended'
import { checkTokenExp, refreshToken } from '../../services'
import Axios from 'axios'
import { apiBaseUrl } from '../../api'
import numberWithPeriod from '../../mixins/numberWithPeriod'
import FormData from 'form-data'
export default {
  mounted() {
    Promise.all([this.loadCollection()]).then((result) => {
      this.isLoading = false
    })
  },
  data: () => ({
    isLoading: true,
    value1: [423, 446, 675, 510, 590, 610, 760],
    value2: [423, 590, 760, 510, 675, 446, 610],
    skeletonLoaderItem: [0, 1, 2, 3, 4],
    lazyImg: lazyImg,
    collections: {},
    charts: {
      'Purchase Last 12 Month': [
        { month: 1 },
        { month: 2 },
        { month: 3 },
        { month: 4 },
        { month: 5 },
        { month: 6 },
        { month: 7 },
        { month: 8 },
        { month: 9 },
        { month: 10 },
        { month: 11 },
        { month: 12 },
      ],
      'Purchase Last 6 Month': [{ month: 1 }, { month: 2 }, { month: 3 }, { month: 4 }, { month: 5 }, { month: 6 }],
      'Purchase Last 3 Month': [{ month: 1 }, { month: 2 }, { month: 3 }],
    },
  }),
  methods: {
    goToCountPage(page) {
      if (page == 'Master Product Count') {
        this.$router.push('/master-products')
      } else if (page == 'Purchase Order Count') {
        this.$router.push('/purchases')
      } else if (page == 'Dealer Count') {
        this.$router.push('/dealers')
      } else if (page == 'Depot Count') {
        this.$router.push('/depots')
      }
    },
    async loadCollection() {
      const requestCollection = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/collections`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await requestCollection()
        this.collections = result.data
      }
    },
  },
  components: {
    Navbar,
    TopSellers,
    Recommended,
  },
}
</script>
