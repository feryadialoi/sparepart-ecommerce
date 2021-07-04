<template>
  <v-app>
    <nav>
      <Navbar>
        <template v-slot:body>
          <v-toolbar-title
            v-if="$store.state.currentUser.currentUser.role.name == 'dealer'"
          >Pesan Di Sini</v-toolbar-title>
          <v-text-field
            v-if="$store.state.currentUser.currentUser.role.name == 'depot'"
            @click="$router.push('/orders')"
            @input="$router.push('/orders')"
            class="mt-7"
            append-icon="mdi-magnify"
            dense
            outlined
            rounded
            color="primary_red_1"
          ></v-text-field>
        </template>
      </Navbar>
    </nav>

    <!-- skeletonLoaderItem -->
    <v-content v-if="isLoading">
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-skeleton-loader class="mx-auto" type="image"></v-skeleton-loader>
            <v-skeleton-loader class="mx-auto" type="list-item-two-line"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col v-for="item in skeletonLoaderItem" :key="item" cols="6" sm="6" md="4" lg="3">
            <v-skeleton-loader height="100" class="mx-auto" type="image"></v-skeleton-loader>
            <v-skeleton-loader class="mx-auto" type="list-item-two-line"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col v-for="item in skeletonLoaderItem" :key="item" cols="12" sm="6" md="4" lg="3">
            <v-boilerplate type="list-item-avatar-two-line"></v-boilerplate>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <!-- skeletonLoaderItem -->

    <!-- Dealer Home ====================================================== -->
    <v-content v-if="!isLoading && currentUser.role.name == 'dealer'">
      <v-container>
        <!-- carousels -->
        <v-row align="center">
          <v-col cols="6" sm="6" md="6" class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Promo terbaru</div>
          </v-col>
          <v-col cols="6" sm="6" md="6" class="py-0">
            <v-layout justify-end>
              <!-- <v-btn right text small class="caption">Lihat semua</v-btn> -->
            </v-layout>
          </v-col>
        </v-row>
        <v-row>
          <v-carousel continuous :interval="3000" cycle height="100%" hide-delimiters class="ma-3">
            <v-carousel-item v-for="carousel in carousels" :key="carousel._id">
              <v-sheet tile>
                <v-row align="center" justify="center">
                  <v-img :alt="lazyImg" :src="apiImage(carousel.image)" aspect-ratio="3"></v-img>
                </v-row>
                <div class="pa-2">
                  <div>{{ carousel.name }}</div>
                </div>
              </v-sheet>
            </v-carousel-item>
          </v-carousel>
        </v-row>
        <!-- carousels END-->

        <v-row align="center">
          <v-col cols="6" sm="6" md="6" class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Produk terlaris Anda</div>
          </v-col>
          <v-col cols="6" sm="6" md="6" class="py-0">
            <v-layout justify-end>
              <!-- <v-btn right text small class="caption">Lihat semua</v-btn> -->
            </v-layout>
          </v-col>
        </v-row>

        <v-row class="px-1">
          <v-col
            cols="6"
            sm="6"
            md="4"
            lg="3"
            v-for="mostSoldDealer in mostSoldDealers"
            :key="mostSoldDealer._id"
            class="pa-2"
          >
            <v-card
              outlined
              flat
              hover
              @click="$router.push({ name: 'itemDetail', params: { catalogId: mostSoldDealer.masterProductId._id } })"
            >
              <v-img
                v-if="!mostSoldDealer.masterProductId || !mostSoldDealer.masterProductId.image && mostSoldDealer.masterProductId.image.length === 0"
                :alt="lazyImg"
                :src="lazyImg"
                aspect-ratio="1.78"
                contain
              ></v-img>
              <v-img
                v-if="mostSoldDealer.masterProductId && mostSoldDealer.masterProductId.image && mostSoldDealer.masterProductId.image.length > 0"
                :alt="lazyImg"
                :src="apiImage(mostSoldDealer.masterProductId.image[0].image)"
                aspect-ratio="1.78"
                contain
              ></v-img>
              <div class="pa-2">
                <div class="caption font-weight-bold">
                  <v-clamp
                    autoresize
                    :max-lines="1"
                  >{{ mostSoldDealer.masterProductId && mostSoldDealer.masterProductId.name ? mostSoldDealer.masterProductId.name : 'Nama produk tidak tersedia' }}</v-clamp>
                </div>
                <div class="caption">
                  <v-clamp
                    autoresize
                    :max-lines="1"
                  >{{ mostSoldDealer.masterProductId && mostSoldDealer.masterProductId ? mostSoldDealer.masterProductId.localShopName :"Nama bengkel tidak tersedia" }}</v-clamp>
                </div>
                <div class="caption">
                  <v-clamp
                    autoresize
                    :max-lines="1"
                  >{{ mostSoldDealer.masterProductId && mostSoldDealer.masterProductId.partCode ? mostSoldDealer.masterProductId.partCode : "Kode produk tidak tersedia" }}</v-clamp>
                </div>
                <div class="caption primary_red_1--text">
                  {{
                  numberWithPeriod({
                  currency: 'Rp',
                  separator: '.',
                  number: mostSoldDealer.masterProductId && mostSoldDealer.masterProductId.price ? mostSoldDealer.masterProductId.price : 0,
                  })
                  }}
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <!-- Dealer Home END ====================================================== -->

    <!-- ========================================================================================================
========================================================================================================
========================================================================================================
    ========================================================================================================-->

    <!-- Depot Home ====================================================== -->
    <v-content v-if="!isLoading && currentUser.role.name == 'depot'">
      <v-container>
        <!-- carousels -->
        <v-row align="center">
          <v-col cols="6" sm="6" md="6" class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Promo terbaru</div>
          </v-col>
          <v-col cols="6" sm="6" md="6" class="py-0">
            <v-layout justify-end>
              <!-- <v-btn right text small class="caption">Lihat semua</v-btn> -->
            </v-layout>
          </v-col>
        </v-row>
        <v-row>
          <v-carousel continuous :interval="3000" cycle height="100%" hide-delimiters class="ma-3">
            <v-carousel-item v-for="carousel in carousels" :key="carousel._id">
              <v-sheet tile>
                <v-row align="center" justify="center">
                  <v-img :alt="lazyImg" :src="apiImage(carousel.image)" aspect-ratio="3"></v-img>
                </v-row>
                <div class="pa-2">
                  <div>{{ carousel.name }}</div>
                </div>
              </v-sheet>
            </v-carousel-item>
          </v-carousel>
        </v-row>
        <!-- carousels END-->

        <!-- recomendations -->
        <!-- recomendations most sold-->
        <v-row align="center">
          <v-col cols="6" sm="6" md="6" class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Produk pilihan untukmu</div>
          </v-col>
          <v-col cols="6" sm="6" md="6" class="py-0">
            <v-layout justify-end>
              <!-- <v-btn right text small class="caption">Lihat semua</v-btn> -->
            </v-layout>
          </v-col>
        </v-row>
        <v-row class="px-1">
          <v-col
            cols="6"
            sm="6"
            md="4"
            lg="3"
            v-for="recomendation in recomendations"
            :key="recomendation._id"
            class="pa-2"
          >
            <v-card outlined flat hover @click="goToItemDetail(recomendation)">
              <!-- @click="$router.push({ name: 'itemDetail', params: { catalogId: recomendation.masterProductId._id } })" -->
              <v-img
                v-if="recomendation.masterProduct.image.length === 0"
                :alt="lazyImg"
                :src="lazyImg"
                aspect-ratio="1.78"
                contain
              ></v-img>
              <v-img
                v-if="recomendation.masterProduct.image.length > 0"
                :alt="lazyImg"
                :src="apiImage(recomendation.masterProduct.image[0].image)"
                aspect-ratio="1.78"
                contain
              ></v-img>
              <div class="pa-2">
                <div class="caption font-weight-bold">
                  <v-clamp autoresize :max-lines="1">{{ recomendation.masterProduct.name }}</v-clamp>
                </div>
                <div class="caption">
                  <v-clamp autoresize :max-lines="1">{{ recomendation.masterProduct.localShopName }}</v-clamp>
                </div>
                <div class="caption">
                  <v-clamp autoresize :max-lines="1">{{ recomendation.masterProduct.partCode }}</v-clamp>
                </div>
                <div class="caption primary_red_1--text">
                  {{
                  numberWithPeriod({
                  currency: 'Rp',
                  separator: '.',
                  number: recomendation.masterProduct.price,
                  })
                  }}
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
        <!-- recomendations most sold-->
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import VClamp from 'vue-clamp'
import Navbar from '../components/Navbar'
import lazyImg from '../assets/lazy-img.jpg'
import Axios from 'axios'
import { apiBaseUrl } from '../api'
import { checkTokenExp, refreshToken } from '../services'
import numberWithPeriod from '../mixins/numberWithPeriod'
export default {
  mounted() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
    if (this.currentUser.role.name == 'dealer') {
      Promise.all([this.loadMostSoldDealer(), this.loadSlide()]).then(() => {
        this.isLoading = false
      })
    } else if (this.currentUser.role.name == 'depot') {
      Promise.all([
        this.loadSlide(),
        // this.loadMostSold(),
        this.loadSelectedProduct(),
        this.loadCatalog(),
        this.loadNearbySupplier(),
      ]).then(() => {
        this.isLoading = false
      })
    } else {
      this.$router.push('/featured')
    }

    console.log('current User', this.$store.state.currentUser)
  },
  data: () => ({
    mostSoldDealers: [],
    currentUser: {},
    loginSuccessDialog: false,
    isLoading: true,
    skeletonLoaderItem: [0, 1, 2, 3],
    loading: true,
    lazyImg: lazyImg,
    drawer: null,
    catalogs: [],
    catalog: {
      page: 0,
      perPage: 4,
    },
    carousels: [],
    recomendations: [],
    nearbySuppliers: [
      {
        _id: 0,
        userId: {
          storeId: {
            _id: '123',
            name: 'Store dummy 1',
            image: lazyImg,
          },
          addressId: {
            _id: '123',
            name: 'Address dummy 1',
          },
        },
      },
      {
        _id: 1,
        userId: {
          storeId: {
            _id: '123',
            name: 'Store dummy 2',
            image: lazyImg,
          },
          addressId: {
            _id: '123',
            name: 'Address dummy 2',
          },
        },
      },
    ],
    mostSoldDealer: {
      page: 0,
      perPage: 6,
    },
    mostSold: {
      page: 0,
      perPage: 4,
    },
    supplier: {
      roleName: 'dealer',
      page: 0,
      perPage: 2,
    },
  }),
  methods: {
    async goToItemDetail(recomendation) {
      // const currentUser = JSON.parse(localStorage.getItem('currentUser'))
      // const dataProduct = {
      //   userId: currentUser._id,
      //   customerId: currentUser.customerId,
      //   sellerId: recomendation.productId.userId._id,
      //   productId: recomendation.productId._id,
      //   masterProductId: recomendation._id,
      // }
      // await this.userClickProduct(dataProduct)
      this.$router.push({ name: 'itemDetail', params: { catalogId: recomendation.masterProduct._id } })
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
    goToAbout() {
      this.$router.push('/about')
    },
    goToLogin() {
      this.$router.push({ name: 'login' })
    },
    logout() {
      localStorage.removeItem('token')
      this.$router.push({ name: 'login' })
    },
    async loadCatalog() {
      const requestProduct = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const { page, perPage } = this.catalog
        const url = `${apiBaseUrl}/api/catalogs?page=${page}&perPage=${perPage}`
        const config = {
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
        console.log('load catalogs', result.data)
      }
    },
    async loadMostSoldDealer() {
      const requestProduct = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        const userId = currentUser._id
        const customerId = currentUser.customerId
        const { page, perPage } = this.mostSoldDealer
        const url = `${apiBaseUrl}/api/most-solds?customerId=${customerId}&page=${page}&perPage=${perPage}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        const result = await requestProduct()
        this.mostSoldDealers = result.data.mostSolds
        console.log('load most sold dealer', this.mostSoldDealers)
      }
    },
    async loadMostSold() {
      const requestProduct = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const { page, perPage } = this.mostSold
        const url = `${apiBaseUrl}/api/most-solds?page=${page}&perPage=${perPage}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        const result = await requestProduct()
        this.recomendations = result.data.mostSolds
        console.log('load most sold', result.data)
      }
    },

    async loadSelectedProduct() {
      const request = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/selected-products`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        const result = await request()
        this.recomendations = result.data.selectedProducts.filter((element) => element != null)
        console.log('load selected product', result.data)
      }
    },
    async loadNearbySupplier() {
      const requestSupplier = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const { roleName, page, perPage } = this.supplier
        const url = `${apiBaseUrl}/api/suppliers?roleName=${roleName}&page=${page}&perPage=${perPage}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        const result = await requestSupplier()
        console.log(result.data)
        this.nearbySuppliers = result.data.suppliers
      }
    },
    async loadSlide() {
      const requestSlide = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/slides?isActive=true`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        const result = await requestSlide()
        this.carousels = result.data.slides
        console.log('load slide', result.data)
      }
    },
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
  },
  computed: {
    name() {
      return this.data
    },
  },
  components: {
    Navbar,
    VClamp,
    VBoilerplate: {
      functional: true,

      render(h, { data, props, children }) {
        return h(
          'v-skeleton-loader',
          {
            ...data,
            props: {
              boilerplate: true,
              elevation: 2,
              ...props,
            },
          },
          children,
        )
      },
    },
  },
  mixins: [numberWithPeriod],
}
</script>
