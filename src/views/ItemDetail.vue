<template>
  <v-app>
    <Navbar main="tes main">
      <template v-slot:back>
        <v-btn small fab text color="primary_red_1" @click="$router.go(-1)">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </template>
      <template v-slot:body>
        <v-toolbar-title>Pesan barang</v-toolbar-title>
      </template>
    </Navbar>
    <v-content v-if="isLoading">
      <v-container>
        <v-row align="center">
          <v-col cols="12" sm="6" md="6" lg="3" xl="3">
            <v-skeleton-loader class="mx-auto" type="image"></v-skeleton-loader>
          </v-col>

          <v-col cols="12" sm="6" md="6" lg="9" xl="9">
            <v-skeleton-loader class="mx-auto" type="list-item"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col v-for="item in skeletonLoaderItem" :key="item" cols="12" sm="6" md="4" lg="3">
            <v-skeleton-loader class="mx-auto" type="list-item-avatar-two-line"></v-skeleton-loader>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-content v-if="!isLoading">
      <v-container>
        <v-row align="center">
          <v-col class="px-10 pa-lg-5" cols="12" sm="6" md="6" lg="3" xl="3">
            <v-avatar size="100%" class="lighten-4" color="primary_grey_1">
              <v-img aspect-ratio="1" v-if="item.image.length == 0" :src="lazyImg"></v-img>
              <v-img
                aspect-ratio="1"
                v-if="item.image.length > 0"
                :src="apiImage(item.image[0].image)"
              ></v-img>
            </v-avatar>
          </v-col>
          <v-col cols="12" sm="6" md="6" lg="9" xl="9">
            <div
              class="text-center text-lg-start text-xl-start caption font-weight-bold primary_black_1--text"
            >{{ item.name }}</div>
            <div
              class="text-center text-lg-start text-xl-start caption primary_grey_1--text"
            >{{ item.localShopName }}</div>
            <div
              class="text-center text-lg-start text-xl-start caption primary_grey_1--text"
            >{{ item.partCode }}</div>
            <div
              class="text-center text-lg-start text-xl-start caption font-weight-bold primary_red_1--text"
            >
              {{
              numberWithPeriod({
              currency: 'Rp',
              separator: '.',
              number: item.price,
              })
              }}
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Tersedia di pemasok</div>
          </v-col>
        </v-row>

        <v-row v-if="availableSuppliers.length == 0">
          <v-col>
            <v-card outlined class="pa-3">
              <div
                class="caption primary_grey_1--text text-center"
              >Belum ada pemasok yang menjual produk ini</div>
            </v-card>
          </v-col>
        </v-row>
        <v-row class="px-1">
          <v-col
            cols="12"
            sm="6"
            md="4"
            class="pa-2"
            v-for="supplier in availableSuppliers"
            :key="supplier._id"
          >
            <v-card flat hover outlined @click="goToItemDetailSupplier(supplier)">
              <v-layout align-center>
                <div class="pa-2">
                  <v-avatar>
                    <!-- TRUE CONDITION -->
                    <v-img
                      aspect-ratio="1"
                      v-if="supplier.userCustomerId && supplier.userCustomerId.storeId && supplier.userCustomerId.storeId.image && supplier.userCustomerId.storeId.image !== '-'"
                      :src="apiImage(supplier.userCustomerId.storeId.image)"
                    ></v-img>
                    <!-- FALSE CONDITION -->
                    <v-img
                      v-if="!supplier.userCustomerId || !supplier.userCustomerId.storeId || !supplier.userCustomerId.storeId.image || supplier.userCustomerId.storeId.image === '-'"
                      :src="lazyImg"
                    ></v-img>
                  </v-avatar>
                </div>

                <!-- TRUE CONDITION -->
                <div v-if="supplier.userCustomerId && supplier.userCustomerId.storeId" class="pa-2">
                  <div
                    class="caption font-weight-bold primary_black_1--text"
                  >{{ supplier.userCustomerId.storeId.name }}</div>
                  <div
                    class="caption primary_grey_1--text"
                  >{{ supplier.userCustomerId.addressId.name }}</div>
                </div>

                <!-- FALSE CONDITION -->
                <div
                  v-if="!supplier.userCustomerId || !supplier.userCustomerId.storeId"
                  class="pa-2"
                >
                  <div
                    class="caption font-weight-bold primary_black_1--text"
                  >informasi toko tidak tersedia</div>
                </div>
              </v-layout>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>
<script>
import lazyImg from '../assets/lazy-img.jpg'
import Navbar from '../components/Navbar'
import { checkTokenExp } from '../services'
import Axios from 'axios'
import { apiBaseUrl } from '../api'
import numberWithPeriod from '../mixins/numberWithPeriod'
export default {
  mounted() {
    Promise.all([this.loadProductDetail()]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    skeletonLoaderItem: [0, 1, 2],
    isLoading: true,
    lazyImg: lazyImg,
    item: {
      _id: 0,
      name: 'Lorem ipsum item',
      description: 'Dolphin something dancing coffee in green field talking changes',
      price: 999999,
      image: ['uploads/products/1575887196747_57759.png'],
    },
    availableSuppliers: [],
    setting: {
      _id: '',
      pointMultiplier: 0,
      lockDepotToDealer: true,
    },
  }),
  methods: {
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
    async goToItemDetailSupplier(supplier) {
      if (supplier.userCustomerId) {
        this.$router.push({ name: 'itemDetailSupplier', params: { productId: supplier._id } })
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        const dataProduct = {
          userId: currentUser._id,
          customerId: currentUser.customerId,
          sellerId: supplier.userId._id,
          productId: supplier._id,
          masterProductId: this.item._id,
        }
        console.log(dataProduct)
        await this.userClickProduct(dataProduct)
      }
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
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
    async loadProductDetail() {
      const requestProduct = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const { catalogId } = this.$route.params
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/catalogs/${catalogId}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        // return requestProduct()
        const result = await requestProduct()

        console.log('result', result)

        this.item = result.data.product
        await this.getSetting()
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        const dealerCustomerId = currentUser.dealerCustomerId
        if (this.setting.lockDepotToDealer) {
          this.availableSuppliers = result.data.suppliers.filter((element) => element.customerId == dealerCustomerId)
        } else {
          const relatedSuppliers = result.data.suppliers.filter((element) => element.customerId == dealerCustomerId)
          const restSuppliers = result.data.suppliers.filter((element) => element.customerId !== dealerCustomerId)
          this.availableSuppliers = [...relatedSuppliers, ...restSuppliers]

          // this.availableSuppliers = result.data.suppliers
        }
        console.log(this.availableSuppliers)
      }
    },
  },
  components: {
    Navbar,
  },
  mixins: [numberWithPeriod],
}
</script>
