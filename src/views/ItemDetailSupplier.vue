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
            <v-skeleton-loader class="mx-auto" type="list-item-three-line"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" md="4" lg="3">
            <v-skeleton-loader class="mx-auto" type="list-item-avatar-two-line"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" md="4" lg="3">
            <v-skeleton-loader class="mx-auto" type="actions"></v-skeleton-loader>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-content v-if="!isLoading">
      <v-container>
        <v-row align="center">
          <v-col class="px-10 pa-lg-5" cols="12" sm="6" md="6" lg="3" xl="3">
            <v-avatar size="100%" class="lighten-4" color="primary_grey_1">
              <v-img aspect-ratio="1" v-if="item.masterProductId.image.length === 0" :src="lazyImg"></v-img>
              <v-img
                aspect-ratio="1"
                v-if="item.masterProductId.image.length > 0"
                :src="apiImage(item.masterProductId.image[0].image)"
              ></v-img>
            </v-avatar>
          </v-col>
          <v-col cols="12" sm="6" md="6" lg="9" xl="9">
            <div
              class="text-center text-lg-start text-xl-start caption font-weight-bold primary_black_1--text"
            >{{ item.masterProductId.name }}</div>
            <div
              class="text-center text-lg-start text-xl-start caption primary_grey_1--text"
            >{{ item.masterProductId.localShopName }}</div>
            <div
              class="text-center text-lg-start text-xl-start caption primary_grey_1--text"
            >{{ item.masterProductId.partCode }}</div>
            <div
              class="text-center text-lg-start text-xl-start caption font-weight-bold primary_red_1--text"
            >
              {{
              numberWithPeriod({
              currency: "Rp",
              separator: ".",
              number: item.masterProductId.price
              })
              }}
            </div>
          </v-col>
          <v-col cols="12" sm="6" md="6" lg="9" xl="9">
            <div
              class="text-center text-lg-start text-xl-start caption primary_black_1--text"
            >{{ printStock(item.stock) }}</div>
          </v-col>
        </v-row>

        <v-row class="px-1">
          <v-col cols="12" sm="6" md="4" class="pa-2">
            <v-card
              flat
              hover
              outlined
              @click="
                $router.push({
                  name: 'supplierStorefront',
                  params: { storeId: supplier.storeId._id }
                })
              "
            >
              <v-layout align-center>
                <div class="pa-2">
                  <v-avatar>
                    <v-img v-if="supplier.storeId.image === '-'" :src="lazyImg"></v-img>
                    <v-img
                      aspect-ratio="1"
                      v-if="supplier.storeId.image !== '-'"
                      :src="apiImage(supplier.storeId.image)"
                    ></v-img>
                  </v-avatar>
                </div>
                <div class="pa-2">
                  <div
                    class="caption font-weight-bold primary_black_1--text"
                  >{{ supplier.storeId.name }}</div>
                  <div class="caption primary_grey_1--text">{{ supplier.addressId.name }}</div>
                  <div
                    v-if="!supplier.storeId.isOpen"
                    class="caption font-weight-bold primary_red_1--text"
                  >Toko sedang tutup</div>
                </div>
              </v-layout>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="3" class="py-0">
            <div class="caption primary_grey_1--text text-center">QTY</div>
          </v-col>
          <v-col cols="6" class="py-0">
            <div class="caption text-center primary_grey_1--text">Total harga</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3" class="pb-0">
            <v-text-field
              :disabled="!item.isSale || item.stock == 0"
              v-model="quantity"
              type="number"
              min="1"
              dense
              outlined
              color="primary_red_1"
            ></v-text-field>
          </v-col>
          <v-col cols="6" class="px-0 pb-0">
            <v-text-field
              v-model="totalPrice"
              :value="totalPrice"
              disabled
              dense
              outlined
              color="primary_red_1"
            ></v-text-field>
          </v-col>
          <v-col cols="3" class="pb-0">
            <v-btn
              :disabled="!item.isSale || item.stock == 0 || !supplier.storeId.isOpen"
              :dark="darkButton(item.isSale, item.stock, supplier.storeId.isOpen)"
              block
              height="40"
              color="primary_red_1"
              @click="orderItem"
            >pesan</v-btn>
          </v-col>
          <v-col
            v-if="!item.isSale || item.stock == 0 || !supplier.storeId.isOpen"
            cols="12"
            lg="12"
            md="12"
            sm="12"
            class="py-0"
          >
            <div
              class="text-center font-weight-bold text-lg-start text-xl-start caption primary_red_1--text"
            >Barang sedang tidak dijual</div>
          </v-col>
          <v-col
            v-if="quantity > item.stock && !item.isSale"
            cols="12"
            lg="12"
            md="12"
            sm="12"
            class="py-0"
          >
            <div
              class="text-center font-weight-bold text-lg-start text-xl-start caption primary_red_1--text"
            >Stock barang tidak mencukupi</div>
          </v-col>
        </v-row>
        <!-- dialog start -->
        <v-dialog v-model="addToCartSuccess" max-width="290">
          <v-card>
            <v-card-title class="headline">Pesan barang</v-card-title>
            <v-card-text>{{ orderMessage }}</v-card-text>

            <v-card-actions>
              <v-spacer>
                <v-btn block color="primary_green_1" text @click="addToCartSuccess = false">ok</v-btn>
              </v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!-- dialog end -->
      </v-container>
    </v-content>
  </v-app>
</template>
<style>
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>
<script>
import lazyImg from '../assets/lazy-img.jpg'
import Navbar from '../components/Navbar'
import { checkTokenExp, refreshToken } from '../services'
import Axios from 'axios'
import { apiBaseUrl } from '../api'
import numberWithPeriod from '../mixins/numberWithPeriod'
import apiImage from '../mixins/apiImage'
export default {
  mounted() {
    Promise.all([this.loadProductDetail()]).then(() => {
      this.isLoading = false
    })

    this.$store.dispatch('setCarts')
  },
  data: () => ({
    isLoading: true,
    lazyImg: lazyImg,
    quantity: 1,
    item: {},
    supplier: {},
    addToCartSuccess: false,
    orderMessaege: '',
    total: 0,
  }),
  methods: {
    darkButton(isSale, stock, isOpen) {
      console.log(isSale, stock, isOpen)
      if (isSale && stock > 0 && isOpen) {
        return true
      } else {
        return false
      }
    },
    printStock(stock) {
      // stock = 4;
      if (stock < 20 && stock >= 10) {
        return `Stock tersisa > ${stock}`
      } else if (stock < 10 && stock >= 5) {
        return `Stock tersisa > 5`
      } else if (stock < 5 && stock > 0) {
        return `Stock tersisa < 5`
      } else if (stock == 0) {
        return `Stock tersisa 0`
      }
    },

    async orderItem() {
      if (
        +this.quantity > 0
        //  && +this.quantity <= +this.item.stock
      ) {
        const requestOrder = async () => {
          const { token } = JSON.parse(localStorage.getItem('auth'))
          const data = {
            sellerId: this.supplier._id,
            productId: this.item._id,
            isEmpty: false,
            quantity: +this.quantity,
          }
          const headers = {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
          }
          const url = `${apiBaseUrl}/api/shopping-carts`
          const config = {
            headers: headers,
            method: 'POST',
            url: url,
            data: data,
          }
          return await Axios(config)
        }
        const checkToken = await checkTokenExp()
        if (checkToken == true) {
          try {
            await requestOrder()
            this.quantity = 1
            this.addToCartSuccess = true
            this.orderMessage = 'Barang berhasil ditambah ke keranjang'
            this.totalPrice = 'Rp0'
            this.$store.dispatch('setCarts')
            this.loadProductDetail()
          } catch (error) {
            this.addToCartSuccess = true
            this.orderMessage = error.response.data.message
            this.loadProductDetail()
          }
        }
      }
    },
    async loadProductDetail() {
      const requestProductDetail = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const { productId } = this.$route.params
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/products/${productId}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        const result = await requestProductDetail()
        console.log(result.data)
        this.item = result.data
        this.supplier = result.data.userCustomerId
        return result
      }
    },
  },
  components: {
    Navbar,
  },
  computed: {
    totalPrice: {
      get: function() {
        return this.numberWithPeriod({
          currency: 'Rp',
          separator: '.',
          number: this.quantity * this.item.masterProductId.price,
        })
      },
      set: function(newValue) {
        this.numberWithPeriod({
          currency: 'Rp',
          separator: '.',
          number: this.quantity * this.item.masterProductId.price,
        })
      },
    },
  },
  mixins: [numberWithPeriod, apiImage],
}
</script>
