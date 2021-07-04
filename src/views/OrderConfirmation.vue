<template>
  <v-app>
    <Navbar main="tes main">
      <template v-slot:back>
        <v-btn small fab text color="primary_red_1" @click="$router.go(-1)">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </template>
      <template v-slot:body>
        <v-toolbar-title>Konfirmasi</v-toolbar-title>
      </template>
    </Navbar>
    <v-content v-if="isLoading">
      <v-container>
        <v-row>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="list-item, list-item-avatar-three-line, list-item, list-item"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="list-item"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" md="4" lg="3" xl="3">
            <v-skeleton-loader type="list-item-avatar-three-line"></v-skeleton-loader>
          </v-col>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="list-item-avatar-three-line"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="list-item, actions"></v-skeleton-loader>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-content v-if="!isLoading">
      <v-container>
        <v-row>
          <v-col class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Pesanan dikirim ke pemasok</div>
          </v-col>
        </v-row>
        <v-row class="px-1">
          <v-col cols="12" sm="6" md="4" class="pa-2">
            <v-card
              flat
              hover
              @click="
                $router.push({
                  name: 'supplierStorefront',
                  params: { storeId: supplier.sellerId.storeId._id },
                })
              "
            >
              <v-layout align-center>
                <div class="pa-2">
                  <v-avatar size="80">
                    <v-img v-if="supplier.sellerId.storeId.image === '-'" :src="lazyImg"></v-img>
                    <v-img v-if="supplier.sellerId.storeId.image !== '-'" :src="apiImage(supplier.sellerId.storeId.image)"></v-img>
                  </v-avatar>
                </div>
                <div class="pa-2">
                  <div class="font-weight-bold primary_grey_1--text">{{ supplier.sellerId.storeId.name }}</div>
                  <div class="caption font-weight-bold primary_grey_1--text">{{ supplier.sellerId.addressId.name }}</div>
                </div>
              </v-layout>
            </v-card>
          </v-col>
        </v-row>
        <v-row class="mb-3">
          <v-col class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Barang dikirim ke alamat</div>
            <div class="caption primary_grey_1--text" v-if="addresses.length > 0">{{ addresses[0].name }}</div>
            <div class="caption primary_grey_1--text" v-if="addresses.length == 0">Alamat belum tersedia</div>
            <div class="caption font-weight-bold primary_red_1--text">{{ addressError }}</div>
          </v-col>
          <v-col cols="12" lg="12" md="12" sm="12">
            <v-btn @click="$router.push({ name: 'userAddress' })" outlined small dark color="primary_green_1">{{ addressButtonTitle }}</v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Barang pesanan</div>
          </v-col>
        </v-row>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-row class="px-1">
            <v-col cols="12" sm="6" md="4" v-for="order in orders" :key="order._id" class="pa-2">
              <v-card flat hover outlined>
                <v-layout align-center>
                  <div class="pa-2">
                    <v-avatar>
                      <v-img v-if="order.productId.masterProductId.image.length === 0" :src="lazyImg"></v-img>
                      <v-img
                        v-if="order.productId.masterProductId.image.length > 0"
                        :src="apiImage(order.productId.masterProductId.image[0].image)"
                      ></v-img>
                    </v-avatar>
                  </div>
                  <v-spacer>
                    <!--  -->
                    <div class="pa-2" v-if="order.productId.isSale">
                      <div class="caption font-weight-bold primary_red_1--text">
                        <v-clamp autoresize :max-lines="1">
                          {{ order.productId.isSale }}
                        </v-clamp>
                      </div>
                      <div class="caption font-weight-bold primary_black_1--text">
                        <v-clamp autoresize :max-lines="1">
                          {{ order.productId.masterProductId.name }}
                        </v-clamp>
                      </div>
                      <div class="caption primary_black_1--text">
                        <v-clamp autoresize :max-lines="1">
                          {{ order.productId.masterProductId.partCode }}
                        </v-clamp>
                      </div>
                      <div class="caption primary_black_1--text">
                        <v-clamp autoresize :max-lines="1">
                          {{ order.productId.masterProductId.localShopName }}
                        </v-clamp>
                      </div>
                      <div class="caption font-weight-bold primary_red_1--text">
                        {{
                          numberWithPeriod({
                            currency: 'Rp',
                            separator: '.',
                            number: order.productId.masterProductId.price,
                          })
                        }}
                      </div>
                      <div class="text-lg-start text-xl-start caption primary_black_1--text">{{ printStock(order.productId.stock) }}</div>
                    </div>

                    <!--  -->
                    <div class="pa-2" v-if="!order.productId.isSale">
                      <div class="caption font-weight-bold primary_red_1--text">
                        Barang sedang tidak dapat dibeli, silahkan dihapus
                      </div>
                    </div>
                    <!--  -->
                  </v-spacer>
                  <div class="pr-2">
                    <v-text-field
                      :rules="[rules.quantityRules(order.quantity, order.productId.stock)]"
                      color="primary_red_1"
                      class="tf mt-4"
                      style="min-width:80px;"
                      outlined
                      dense
                      type="number"
                      min="1"
                      v-model="order.quantity"
                    ></v-text-field>
                  </div>
                </v-layout>
                <v-divider></v-divider>
                <v-layout justify-center>
                  <v-btn @click="prepateDelete(order)" dark fab small text color="primary_red_1">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-layout>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
        <v-row>
          <v-col>
            <div class="caption font-weight-bold primary_grey_1--text">Total pesanan</div>
            <div class="font-weight-bold primary_grey_1--text">
              {{
                numberWithPeriod({
                  currency: 'Rp',
                  separator: '.',
                  number: totalOrder,
                })
              }}
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="caption font-weight-bold primary_grey_1--text text-center mb-3">Tekan tombol untuk melanjutkan</div>
            <v-btn :disabled="disableOrderButton()" :dark="!disableOrderButton()" block color="primary_red_1" @click="clickOrder">pesan</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-dialog v-model="orderDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">Pesanan</v-card-title>
        <v-card-text>Lanjutkan proses pemesanan ke dealer?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary_red_1" text @click="orderDialog = false">tidak</v-btn>
          <v-btn color="primary_red_1" text @click="makeOrder">ya</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogOrderNotSufficientItem" max-width="290">
      <v-card>
        <v-card-title class="headline">Pesanan</v-card-title>
        <v-card-text>Stock produk tidak cukup</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary_red_1" text @click="dialogOrderNotSufficientItem = false">tutup</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogDeleteOrder" max-width="290">
      <v-card>
        <v-card-title class="headline">Pesanan</v-card-title>
        <v-card-text>Hapus produk ?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary_red_1" text @click="dialogDeleteOrder = false">Batal</v-btn>
          <v-btn color="primary_red_1" text @click="deleteCartItem">Ya</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- dialog error -->
    <v-dialog v-model="dialogError" max-width="290">
      <v-card>
        <v-card-title class="headline">Pesanan Error</v-card-title>
        <v-card-text>{{ dialogErrorMessage }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary_red_1" text @click="dialogError = false">Tutup</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>
<style>
.tf {
  max-width: 48px;
}
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
import VClamp from 'vue-clamp'
import lazyImg from '../assets/lazy-img.jpg'
import Navbar from '../components/Navbar'
import { checkTokenExp, refreshToken } from '../services'
import Axios from 'axios'
import { apiBaseUrl } from '../api'
import numberWithPeriod from '../mixins/numberWithPeriod'
export default {
  mounted() {
    Promise.all([
      this.loadShoppingCartDetail(),
      this.loadUserMainAddress(),
      // this.currentUserAddress(),
    ]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    dialogError: false,
    dialogErrorMessage: '',
    tempOrder: {},
    tempDelete: {},
    dialogOrderNotSufficientItem: false,
    dialogDeleteOrder: false,
    valid: true,
    addressError: '',
    orderDialog: false,
    isLoading: true,
    lazyImg: lazyImg,
    supplier: { sellerId: { storeId: { name: '' }, addressId: { name: '' } } },
    orders: [],
    orderId: '',
    addresses: [],
    quantityRules: [(v, x) => v <= x || 'Stock tidak mencukupi'],
    rules: {
      required: (value) => !!value || 'Required.',
      min: (v) => v.length >= 6 || 'Min 6 characters',
      emailMatch: (v) => {
        const checkEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        return checkEmail.test(v) || 'The email you entered is not valid'
      },
      confirmOldPasswordRules: (v, nv) =>
        // v === this.oldPassword || 'confirm password not match',
        v === nv || 'confirm password not match',
      quantityRules: (v, x) => v <= x || 'Stock tidak cukup',
    },
  }),
  methods: {
    prepateDelete(item) {
      this.dialogDeleteOrder = true
      this.tempDelete = item
    },
    disableOrderButton() {
      const disable = this.orders.filter((item) => item.productId.isSale == false || item.productId.stock == 0)
      if (disable.length > 0 || this.orders.length == 0) {
        return true
      } else {
        return false
      }
    },
    async deleteCartItem() {
      const orders = this.orders.filter((element) => element._id !== this.tempDelete._id)
      this.orders = orders
      this.dialogDeleteOrder = false

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
        await requestDelete(this.tempDelete._id)
      }
    },
    validate() {
      return this.$refs.form.validate()
    },
    resetForm() {
      this.$refs.form.reset()
    },
    resetValidation() {
      this.$refs.form.resetValidation()
    },
    printStock(stock) {
      // stock = 4;
      if (stock < 20 && stock >= 10) {
        return `Stock tersisa > ${stock}`
      } else if (stock < 10 && stock >= 5) {
        return `Stock tersisa > 5`
      } else if (stock <= 4) {
        return `Stock tersisa ${stock}`
      }
    },
    async loadShoppingCartDetail() {
      const requestShoppingCartDetail = async () => {
        const { shoppingCartId } = this.$route.params
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/shopping-carts/${shoppingCartId}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        const result = await Axios(config)
        console.log('shopping cart detail', result)
        this.supplier = result.data
        this.orders = result.data.cartItem
        this.orderId = result.data._id
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        return requestShoppingCartDetail()
      }
    },
    async loadUserMainAddress() {
      const requestAddress = () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        const userId = currentUser._id
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/addresses?userId=${userId}&isMain=true`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        const result = await requestAddress()
        this.addresses = result.data.addresses
        console.log('main address', result.data)
      }
    },
    clickOrder() {
      const newOrders = this.orders.map((element) => ({
        quantity: element.quantity,
        isSale: element.productId.isSale,
        stock: element.productId.stock,
      }))
      console.log(newOrders)
      const validateOrder = newOrders.every((element) => element.isSale == true && element.quantity <= element.stock)
      console.log('validateOrder', validateOrder)
      const validate = this.validate()
      if (this.addresses.length > 0 && validate) {
        this.orderDialog = true
      } else {
        if (this.addresses.length == 0) {
          // alert('alamat belum ada, tidak bisa melanjutkan pemesanan!');
          this.addressError = '(alamat belum ada, tidak bisa melanjutkan pemesanan!)'
        }

        if (!validate) {
          this.dialogOrderNotSufficientItem = true
        }
      }
    },
    async makeOrder() {
      const requestOrder = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        const userId = currentUser._id
        const sellerId = this.supplier.sellerId._id
        const customerId = this.supplier.sellerId.customerId
        console.log('orders', this.orders)
        const cartItem = this.orders.map((element) => ({
          confirmedQuantity: element.quantity,
          quantity: element.quantity,
          productId: element.productId._id,
          productPartCode: element.productId.productPartCode,
          masterProductId: element.productId.masterProductId._id,
          price: element.productId.masterProductId.price,
        }))
        const buyerAddressId = this.addresses[0]
        const total = cartItem.reduce((accumulator, currentValue) => accumulator + currentValue.quantity * currentValue.price, 0)
        const data = {
          userId,
          buyerAddressId,
          sellerId,
          customerId,
          cartItem,
          total,
          cartId: this.orderId,
        }
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/purchase-orders`
        const config = {
          headers: headers,
          method: 'POST',
          url: url,
          data: data,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        try {
          const response = await requestOrder()
          console.log(response.data)
          this.orderDialog = false
          this.$router.push({
            name: 'orderSuccess',
            query: {
              sellerId: this.supplier.sellerId._id,
              storeId: this.supplier.sellerId.storeId._id,
            },
          })
        } catch (error) {
          this.orderDialog = false
          this.dialogError = true
          this.dialogErrorMessage = error.response.data.message
          this.loadShoppingCartDetail()
          console.log(error)
        }
      }
    },
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
  },
  computed: {
    totalOrder() {
      const grandTotal = this.orders.reduce((total, element) => total + element.quantity * element.productId.masterProductId.price, 0)
      return grandTotal
    },
    addressButtonTitle() {
      return this.addresses.length == 0 ? 'Tambah Alamat' : 'Ganti Alamat'
    },
  },
  components: {
    Navbar,
    VClamp,
  },
  mixins: [numberWithPeriod],
}
</script>
