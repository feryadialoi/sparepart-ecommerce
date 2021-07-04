<template>
  <v-app>
    <Navbar main="tes main">
      <template v-slot:back>
        <v-btn small fab text color="primary_red_1" @click="$router.go(-1)">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </template>
      <template v-slot:body>
        <v-toolbar-title>Profil Toko</v-toolbar-title>
      </template>
    </Navbar>
    <v-content v-if="isLoading">
      <v-container>
        <v-row>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="list-item-avatar-two-line"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6" md="4">
            <v-skeleton-loader height="100" type="image"></v-skeleton-loader>
            <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
          </v-col>
          <v-col cols="6" md="4">
            <v-skeleton-loader height="100" type="image"></v-skeleton-loader>
            <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
          </v-col>
          <v-col cols="6" md="4">
            <v-skeleton-loader height="100" type="image"></v-skeleton-loader>
            <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
          </v-col>
          <v-col cols="6" md="4">
            <v-skeleton-loader height="100" type="image"></v-skeleton-loader>
            <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
          </v-col>
        </v-row>
      </v-container>
    </v-content>

    <v-content v-if="!isLoading">
      <v-container>
        <v-row class="px-1">
          <v-col cols="12" sm="6" md="4" class="pa-2">
            <v-card flat>
              <v-layout align-center>
                <div class="pa-2">
                  <v-avatar size="100">
                    <v-img v-if="supplier.image === '-'" :src="lazyImg"></v-img>
                    <v-img v-if="supplier.image !== '-'" :src="apiImage(supplier.image)"></v-img>
                  </v-avatar>
                </div>
                <div class="pa-2">
                  <div class="caption font-weight-bold primary_black_1--text">{{ supplier.name }}</div>
                  <div class="caption primary_grey_1--text">{{ supplier.userId.addressId.name }}</div>
                  <div
                    v-if="!supplier.isOpen"
                    class="caption font-weight-bold primary_red_1--text"
                  >Toko sedang tutup</div>
                </div>
              </v-layout>
            </v-card>
          </v-col>
        </v-row>
        <v-divider class="my-3"></v-divider>
        <v-row>
          <v-col class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Produk yang tersedia</div>
          </v-col>
        </v-row>
        <v-row class="px-1">
          <v-col
            cols="6"
            sm="6"
            md="4"
            lg="3"
            v-for="product in products"
            :key="product._id"
            class="pa-2"
          >
            <v-card
              flat
              hover
              @click="$router.push({ name: 'itemDetailSupplier', params: { productId: product._id } })"
            >
              <v-img
                v-if="product.masterProductId && product.masterProductId.image &&  product.masterProductId.image.length > 0"
                :src="apiImage(product.masterProductId.image[0].image)"
                aspect-ratio="1.78"
                contain
              ></v-img>
              <v-img
                v-if="!product.masterProductId || !product.masterProductId.image ||  product.masterProductId.image.length === 0"
                :src="lazyImg"
                aspect-ratio="1"
              ></v-img>
              <div class="pa-2">
                <div class="caption font-weight-bold">
                  <v-clamp autoresize :max-lines="2">
                    {{
                    product.masterProductId && product.masterProductId.name ? product.masterProductId.name : "Nama produk tidak tersedia" }}
                  </v-clamp>
                </div>
                <div class="caption primary_red_1--text">
                  {{
                  numberWithPeriod({
                  currency: 'Rp',
                  separator: '.',
                  number: product.price,
                  })
                  }}
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-footer>
      <v-layout justify-center>
        <div v-if="products.length > 0" class="text-center">
          <v-pagination
            color="primary_red_1"
            v-model="pageProduct"
            :length="Math.ceil(productCountAll / productCount)"
            :total-visible="6"
          ></v-pagination>
        </div>
      </v-layout>
    </v-footer>
  </v-app>
</template>
<script>
import VClamp from 'vue-clamp'
import lazyImg from '../assets/lazy-img.jpg'
import Navbar from '../components/Navbar'
import { checkTokenExp, refreshToken } from '../services'
import Axios from 'axios'
import { apiBaseUrl } from '../api'
import numberWithPeriod from '../mixins/numberWithPeriod'
export default {
  mounted() {
    Promise.all([this.loadStore()]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    isLoading: true,
    lazyImg: lazyImg,
    supplier: {
      // _id: 0,
      // name: "Lorem ipsum co",
      // address: "Jalan Gajah Mada",
      // image: "-"
    },
    products: [],
    supplierId: '',
    customerId: '',

    // pagination
    pageProduct: 1,
    productCount: 6,
    productCountAll: 0,
  }),
  methods: {
    async loadStore() {
      const requestStore = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const { storeId } = this.$route.params
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/stores/${storeId}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        const result = await Axios(config)

        console.log('store', result.data)
        this.supplier = result.data

        this.supplierId = this.supplier.userId._id
        this.customerId = this.supplier.userId.customerId
        this.loadProduct(this.customerId)
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        return requestStore()
      }
    },
    async loadProduct(customerId) {
      const requestProduct = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        // const url = `${apiBaseUrl}/api/products?userId=${userId}`
        const url = `${apiBaseUrl}/api/products?customerId=${customerId}&page=${this.pageProduct}&count=${this.productCount}`
        return Axios({
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          method: 'GET',
          url,
        })
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        const result = await requestProduct()
        this.products = result.data.products
        this.productCountAll = result.data.count
        console.log(this.pageProduct)
        console.log(this.productCount)
        console.log('load product', result.data)
        return result
      }
    },

    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
  },
  components: {
    Navbar,
    VClamp,
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser.currentUser
    },
  },
  mixins: [numberWithPeriod],
  watch: {
    pageProduct: function() {
      this.loadProduct(this.customerId)
    },
  },
}
</script>
