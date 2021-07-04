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
          <v-toolbar-title>Keranjang</v-toolbar-title>
        </template>
      </Navbar>
    </nav>
    <v-content v-if="isLoading">
      <v-container>
        <v-skeleton-loader type="list-item"></v-skeleton-loader>
        <v-row>
          <v-col cols="12" sm="6" md="4" lg="3" xl="3">
            <v-skeleton-loader type="list-item-avatar-three-line"></v-skeleton-loader>
          </v-col>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="list-item-avatar-three-line, actions"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-skeleton-loader type="list-item"></v-skeleton-loader>
        <v-row>
          <v-col cols="12" sm="6" md="4" lg="3" xl="3">
            <v-skeleton-loader type="list-item-avatar-three-line"></v-skeleton-loader>
          </v-col>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="list-item-avatar-three-line, actions"></v-skeleton-loader>
          </v-col>
        </v-row>
      </v-container>
    </v-content>

    <v-content v-if="!isLoading">
      <v-container>
        <v-alert
          v-model="success"
          :value="success"
          transition="scale-transition"
          dismissible
          type="success"
        >
          {{
          successMessage
          }}
        </v-alert>
        <v-alert
          v-model="error"
          :value="error"
          transition="scale-transition"
          dismissible
          type="error"
        >
          {{
          errorMessage
          }}
        </v-alert>
        <v-row v-if="carts.length == 0">
          <v-col>
            <v-card outlined class="pa-3">
              <div class="text-center caption">Keranjang kosong</div>
            </v-card>
          </v-col>
        </v-row>
        <div v-for="(cart, index) in carts" :key="cart._id">
          <v-row>
            <v-col cols="6" lg="6" md="6" sm="6" class="py-0">
              <div
                class="caption font-weight-bold primary_grey_1--text"
              >{{ cart.sellerId.storeId.name }}</div>
              <div
                class="caption primary_grey_1--text"
              >{{ `(${cart.cartItem.length} jenis barang)` }}</div>
            </v-col>
            <v-col cols="6" lg="6" md="6" sm="6" class="py-0">
              <v-layout justify-end>
                <v-btn @click="showProduct(cart)" small fab text color="primary_red_1">
                  <v-icon>{{ cart.show == true ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </v-btn>
              </v-layout>
            </v-col>
          </v-row>
          <v-row v-if="cart.show" class="px-1">
            <v-col
              cols="12"
              sm="6"
              md="4"
              lg="3"
              xl="3"
              class="pa-2"
              v-for="(item, itemIndex) in cart.cartItem"
              :key="item._id"
            >
              <v-card flat hover outlined>
                <v-layout align-center>
                  <div class="pa-2">
                    <v-avatar>
                      <v-img
                        v-if="item.productId.masterProductId.image.length === 0"
                        :src="lazyImg"
                      ></v-img>
                      <v-img
                        v-if="item.productId.masterProductId.image.length > 0"
                        :src="apiImage(item.productId.masterProductId.image[0].image)"
                      ></v-img>
                    </v-avatar>
                  </div>
                  <div class="pa-2">
                    <div class="caption font-weight-bold primary_black_1--text">
                      <v-clamp autoresize :max-lines="1">{{ item.productId.masterProductId.name }}</v-clamp>
                    </div>

                    <div class="caption primary_black_1--text">
                      <v-clamp
                        autoresize
                        :max-lines="1"
                      >{{ item.productId.masterProductId.localShopName }}</v-clamp>
                    </div>
                    <div class="caption primary_black_1--text">
                      <v-clamp
                        autoresize
                        :max-lines="1"
                      >{{ item.productId.masterProductId.partCode }}</v-clamp>
                    </div>
                    <div class="caption font-weight-bold primary_red_1--text">
                      {{
                      numberWithPeriod({
                      currency: 'Rp',
                      separator: '.',
                      number: item.productId.masterProductId.price * item.quantity,
                      })
                      }}
                    </div>
                    <div class="caption primary_grey_1--text">{{ item.quantity }} pc</div>
                  </div>
                  <v-spacer></v-spacer>
                  <div class="mr-2">
                    <v-btn
                      @click="deleteCartItem(item, index, itemIndex)"
                      small
                      fab
                      text
                      dark
                      color="primary_red_1"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-layout>
              </v-card>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col cols="6" sm="6" md="6">
              <v-layout>
                <div class="text-center font-weight-bold primary_grey_1--text">
                  {{
                  numberWithPeriod({
                  currency: 'Rp',
                  separator: '.',
                  number: subTotal(cart.cartItem),
                  })
                  }}
                </div>
              </v-layout>
            </v-col>
            <v-col cols="6" sm="6" md="6">
              <v-layout justify-end>
                <v-btn dark color="primary_red_1" @click="gotoOrderConfirmation(cart)">pesan</v-btn>
              </v-layout>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-content>
    <v-footer>
      <v-layout justify-center>
        <div class="text-center">
          <v-pagination
            color="primary_red_1"
            v-model="pageCart"
            :length="Math.ceil(cartCountAll / cartCount)"
            :total-visible="7"
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
    Promise.all([this.loadShoppingCart()]).then(() => {
      this.isLoading = false
    })
    this.$store.dispatch('setCarts')
    console.log('length paginate', Math.ceil(this.cartCountAll / this.cartCount))
    console.log('cartCountAll', this.cartCountAll)
    console.log('cartCount', this.cartCount)
  },
  data: () => ({
    success: false,
    error: false,
    errorMessage: '',
    successMessage: '',
    isLoading: true,
    lazyImg: lazyImg,
    carts: [],
    pageCart: 1,
    cartCount: 5,
    cartCountAll: 0,
  }),
  methods: {
    gotoOrderConfirmation(cart) {
      this.$router.push({
        name: 'orderConfirmation',
        params: {
          shoppingCartId: cart._id,
        },
      })
    },
    showProduct(item) {
      if (item.show == true) {
        item.show = false
      } else {
        item.show = true
      }
    },
    async deleteCartItem(item, index, itemIndex) {
      console.log(item)
      const requestDelete = (cartItemId) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/shopping-cart-items/${cartItemId}`
        const config = {
          headers: headers,
          method: 'DELETE',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        try {
          await requestDelete(item._id)
          console.log(item)

          this.successAlert(`${item.productId.masterProductId.name} terhapus`)

          await this.$store.dispatch('setCarts')
          await this.loadShoppingCart()

          // remove localy
          // this.carts[index].cartItem.splice(itemIndex, 1)
          // if (this.carts[index].cartItem.length == 0) {
          //   this.carts.splice(index, 1)
          // }
        } catch (error) {
          console.log(error)
          this.errorAlert(error)
        }
      }
    },
    async loadShoppingCart() {
      const requestCart = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        // const url2 = `${apiBaseUrl}/api/shopping-carts`;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        const userId = currentUser._id
        const url =
          `${apiBaseUrl}/api/shopping-carts?` +
          `isEmpty=${false}&userId=${userId}` +
          `&page=${this.pageCart - 1}&count=${this.cartCount}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      try {
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          const result = await requestCart()
          this.carts = result.data.carts.map((el) => ({
            ...el,
            show: true,
          }))
          this.cartCountAll = result.data.count
          console.log('load data count', result.data.count)
          console.log('load data', result.data)
          return result
        }
      } catch (error) {
        console.log(error)
      }
    },
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
    successAlert(message) {
      this.successMessage = message
      this.success = true
      setTimeout(() => {
        this.success = false
      }, 5000)
    },
    errorAlert(message) {
      this.errorMessage = message
      this.error = true
      setTimeout(() => {
        this.error = false
      }, 5000)
    },
    subTotal(cartItem) {
      const cartItemSubTotal = cartItem.reduce(
        (total, element) => total + element.quantity * element.productId.masterProductId.price,
        0,
      )
      return cartItemSubTotal
    },
  },
  components: {
    Navbar,
    VClamp,
  },
  computed: {
    // cartss() {
    //   return this.$store.state.cartss;
    // },
  },
  mixins: [numberWithPeriod],
  watch: {
    pageCart: function() {
      this.loadShoppingCart()
    },
  },
}
</script>
