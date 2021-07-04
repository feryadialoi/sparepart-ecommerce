<template>
  <v-app>
    <nav>
      <Navbar main="tes main">
        <template v-slot:back>
          <v-btn small fab text color="primary_red_1" @click="$router.push('/')">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </template>
        <template v-slot:body>
          <v-toolbar-title>Pesan barang</v-toolbar-title>

          <!-- <v-text-field class="mt-7" dense outlined clearable rounded color="primary_red_1"></v-text-field> -->
        </template>
      </Navbar>
    </nav>
    <v-content v-if="isLoading">
      <v-container>
        <v-row>
          <v-col cols="12" sm="6" md="4" lg="3">
            <v-skeleton-loader class="mx-auto" type="list-item"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col v-for="item in skeletonLoaderItem" :key="item" cols="6" sm="6" md="4" lg="3">
            <v-skeleton-loader height="100" class="mx-auto" type="image"></v-skeleton-loader>
            <v-skeleton-loader class="mx-auto" type="list-item-two-line"></v-skeleton-loader>
          </v-col>
        </v-row>
      </v-container>
    </v-content>

    <v-content v-if="!isLoading">
      <v-container>
        <v-row>
          <v-col cols="12" class="py-0">
            <v-text-field
              rounded
              color="primary_red_1"
              v-model="keyword"
              @keyup="filterSugestions"
              v-on:keyup.enter="searchCatalog"
              outlined
              dense
            >
              <template v-slot:append>
                <v-icon>mdi-magnify</v-icon>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
        <v-row v-if="showSuggestions" style="position:absolute; z-index:1000; margin-top:-12px">
          <v-col cols="12" lg="12" class="py-0">
            <v-card>
              <scroll-bar class="warp">
                <v-list :disabled="false">
                  <!-- <v-subheader>hasil pencarian</v-subheader> -->
                  <v-list-item-group color="primary_red_1">
                    <v-list-item v-for="sugest in sugestions" :key="sugest.id" :inactive="false">
                      <v-list-item-content @click="sugestClick(sugest)">
                        <v-list-item-title>{{ sugest.name.toLowerCase() }}</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </scroll-bar>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-if="false" class="mx-0" justify="space-between">
          <v-col cols="12" sm="12" md="12" class="pa-0 mx-0">
            <v-text-field
              v-if="headerBody === 'search'"
              v-on:keyup.13="searchCatalog"
              placeholder="cari.."
              dense
              outlined
              rounded
              color="primary_red_1"
              v-model="keyword"
            >
              <template v-slot:append>
                <v-btn @click="searchCatalog" small text color="primary_grey_1">
                  <v-icon>mdi-magnify</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
        <v-row class="mx-0" style="margin-top:-100">
          <div>
            <div v-if="searching === true > 0">pencarian "{{ keyword }}"</div>
            <div v-if="searching === true">{{ searchResult }} hasil</div>
          </div>
          <v-spacer></v-spacer>
          <v-btn text small fab v-if="searching === true" @click="closeSearch">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>
        <v-row class="px-1">
          <v-col
            cols="6"
            sm="6"
            md="4"
            lg="3"
            v-for="catalog in catalogs"
            :key="catalog._id"
            class="pa-2"
          >
            <v-card outlined flat hover @click="goToItemDetail(catalog)">
              <v-img
                v-if="catalog.image.length === 0"
                :alt="dummyProduct"
                :src="dummyProduct"
                aspect-ratio="1.78"
                contain
              ></v-img>
              <v-img
                v-if="catalog.image.length > 0"
                :alt="dummyProduct"
                :src="apiImage(catalog.image[0].image)"
                aspect-ratio="1.78"
                contain
              ></v-img>
              <div class="pa-2">
                <div class="caption font-weight-bold">
                  <v-clamp autoresize :max-lines="2">{{ catalog.name }}</v-clamp>
                </div>
                <div class="caption">
                  <v-clamp autoresize :max-lines="2">{{ catalog.localShopName }}</v-clamp>
                </div>
                <div class="caption">
                  <v-clamp autoresize :max-lines="2">{{ catalog.partCode }}</v-clamp>
                </div>
                <div class="caption primary_red_1--text">
                  {{
                  numberWithPeriod({
                  currency: 'Rp',
                  separator: '.',
                  number: catalog.price,
                  })
                  }}
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" lg="12" md="12" sm="12" class="text-center">
            <v-btn text @click="reloadCatalog" dark dense color="primary_red_1">load more</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>
<style>
.warp {
  max-height: 300px;
  overflow: hidden;
}
</style>
<script>
'use strict'
import VClamp from 'vue-clamp'
import scrollBar from 'vue-scroll-bar'
import Navbar from '../components/Navbar'
import lazyImg from '../assets/lazy-img.jpg'
import Axios from 'axios'
import { apiBaseUrl } from '../api'
import { checkTokenExp } from '../services'
import numberWithPeriod from '../mixins/numberWithPeriod'
import dummyProduct from '../assets/dummy-product.jpg'
export default {
  components: {
    Navbar,
    VClamp,
    scrollBar,
  },
  mounted() {
    Promise.all([
      //
      this.getSetting(),
      this.getCurrentUser(),
    ]).then(() => {
      if (this.setting.lockDepotToDealer) {
        this.loadCatalogDealer().then(() => {
          this.isLoading = false
        })
      } else {
        this.loadCatalog().then(() => {
          this.isLoading = false
        })
      }
    })

    // Promise.all([
    //   this.loadCatalog(),
    //   // this.loadMasterProduct(),
    //   //
    // ]).then(() => {
    //   this.isLoading = false
    //   console.log('executed in ' + (new Date() - start) + 'ms')
    // })
    this.scroll()
  },
  data: () => ({
    setting: {
      _id: '',
      pointMultiplier: 0,
      lockDepotToDealer: true,
    },
    search: '',
    sugestionList: [
      { id: 1, name: 'cam chain kit' },
      { id: 2, name: 'con rod kit' },
      { id: 3, name: 'drive chain kit' },
      { id: 4, name: 'pad set' },
      { id: 5, name: 'crank case' },
      { id: 6, name: 'cylinder' },
      { id: 7, name: 'gasket' },
      { id: 8, name: 'crank shaft' },
    ],
    sugestions: [],
    showSuggestions: false,

    page: 0,
    perPage: 10,
    skeletonLoaderItem: [0, 1, 2, 3, 4, 5],
    isLoading: true,
    keyword: '',
    searchResult: 0,
    searching: false,
    lazyImg: lazyImg,
    dummyProduct: dummyProduct,
    headerBody: 'search',
    catalogs: [],
    timer: null,
    currentUser: {
      dealerCustomerId: '',
      email: '',
      image: '',
      name: '',
      phone: '',
      role: {
        name: '',
      },
      storeId: null,
    },
  }),
  methods: {
    getCurrentUser() {
      const currentUser = localStorage.getItem('currentUser')
      const parsed = JSON.parse(currentUser)
      this.currentUser = parsed
      console.log(parsed)
    },
    async getSetting() {
      const request = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/settings`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await request()
        this.setting = result.data
        console.log('setting', this.setting)
      }
    },
    async goToItemDetail(catalog) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'))
      const dataProduct = {
        userId: currentUser._id,
        customerId: currentUser.customerId,
        // sellerId: catalog.productId.userId._id,
        // productId: catalog.productId._id,
        masterProductId: catalog._id,
      }
      // await this.userClickProduct(dataProduct)
      console.log(catalog)
      console.log(dataProduct)
      this.$router.push({ name: 'itemDetail', params: { catalogId: catalog._id } })
    },
    async userClickProduct(dataProduct) {
      const requestClickProduct = (data) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/clicked-products`
        const config = {
          headers: headers,
          method: 'POST',
          url: url,
          data: data,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await requestClickProduct(dataProduct)
        console.log('clicked product created', result.data)
      }
    },
    async loadCatalogDealer() {
      const requestProduct = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/catalogs/dealers`
        const config = {
          params: {
            keyword: this.keyword,
            isSale: true,
            customerId: this.currentUser.dealerCustomerId,
            perPage: this.perPage,
            page: this.page,
          },
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }

      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await requestProduct()
        console.log(result)

        this.catalogs = [...this.catalogs, ...result.data.catalogs]
        this.searchResult = this.searchResult + result.data.count
        // console.log(result.data)
        console.log('dealer catalogs', this.catalogs)
      }
    },

    filterSugestions() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        console.log('debouncing')
        //
        if (this.keyword.length == 0) {
          // this.showSuggestions = false
          // console.log('sugestion list', this.sugestionList)
          // this.sugestions = []

          // this.catalogs = []
          // this.keyword = ''
          // this.loadCatalog()

          this.searchCatalog()
        } else {
          // this.showSuggestions = true
          // this.sugestions = this.catalogs.filter((element) => element.name.toLowerCase().match(this.search.toLowerCase()))
          // this.sugestions = this.sugestionList.filter((element) =>
          //   element.name.toLowerCase().match(this.search.toLowerCase()),
          // )

          this.searchCatalog()
        }
        //
      }, 1000)
    },
    sugestClick(item) {
      console.log(item.name.toLowerCase())
      this.search = item.name.toLowerCase()
      this.showSuggestions = false

      this.keyword = item.name.toLowerCase()
      this.catalogs = []
      this.loadCatalog()
    },

    searchBar() {
      this.headerBody = 'search'
    },
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
    async closeSearch() {
      this.page = 0
      this.perPage = 10
      this.searching = false
      this.catalogs = []
      this.keyword = ''
      this.loadCatalog()
    },
    async searchCatalog() {
      this.showSuggestions = false
      if (this.keyword.length == 0) {
        this.closeSearch()
      } else {
        this.searchResult = 0
        this.searching = true
        this.page = 0
        this.perPage = 10
        this.catalogs = []
        if (this.setting.lockDepotToDealer) {
          await this.loadCatalogDealer()
        } else {
          await this.loadCatalog()
        }
      }
    },
    scroll() {
      window.onscroll = () => {
        let bottomOfWindow =
          document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight

        if (bottomOfWindow) {
          this.reloadCatalog()
        }
      }
    },
    async loadCatalog() {
      const requestProduct = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/catalogs`
        const config = {
          params: {
            page: this.page,
            perPage: this.perPage,
            keyword: this.keyword,
          },
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }

      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await requestProduct()

        this.catalogs = [...this.catalogs, ...result.data.catalogs]
        this.searchResult = this.searchResult + result.data.count
        // console.log(result.data)
        console.log('master', this.catalogs)
      }
    },
    async loadMasterProduct() {
      const requestProduct = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/master-products`
        const config = {
          params: {
            select: 'name localShopName partCode',
          },
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }

      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await requestProduct()
        const tempMasterProducts = result.data.masterProducts

        const names = []
        tempMasterProducts.forEach((element) => {
          if (!names.includes(element.name)) {
            names.push(element.name)
          }
        })
        tempMasterProducts.forEach((element) => {
          if (!names.includes(element.localShopName)) {
            names.push(element.localShopName)
          }
        })
        tempMasterProducts.forEach((element) => {
          if (!names.includes(element.partCode)) {
            names.push(element.partCode)
          }
        })

        this.sugestionList = names.map((element, id) => ({ id, name: element }))
        // console.log(this.sugestionList)
      }
    },
    async reloadCatalog() {
      this.page = this.page + 1
      if (this.setting.lockDepotToDealer) {
        return await this.loadCatalogDealer()
      } else {
        return await this.loadCatalog()
      }
    },
  },
  computed: {},
  mixins: [numberWithPeriod],
}
</script>
