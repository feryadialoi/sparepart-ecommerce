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
          <v-toolbar-title>Daftar pesanan</v-toolbar-title>
        </template>
      </Navbar>
    </nav>
    <v-content v-if="isLoading">
      <v-container>
        <v-skeleton-loader type="list-item"></v-skeleton-loader>
        <v-row>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="list-item-avatar-three-line"></v-skeleton-loader>
          </v-col>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="list-item-avatar-three-line"></v-skeleton-loader>
          </v-col>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="list-item-avatar-three-line"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-skeleton-loader type="list-item"></v-skeleton-loader>
        <v-row>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="list-item-avatar-three-line"></v-skeleton-loader>
          </v-col>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="list-item-avatar-three-line"></v-skeleton-loader>
          </v-col>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="list-item-avatar-three-line"></v-skeleton-loader>
          </v-col>
        </v-row>
      </v-container>
    </v-content>

    <v-content v-if="!isLoading">
      <v-container>
        <!-- Menunggu -->
        <v-row>
          <v-col>
            <div class="caption font-weight-bold primary_grey_1--text">
              Daftar Pesanan Menunggu
            </div>
          </v-col>
          <v-col cols="6" lg="6" md="6" sm="6" class="py-0">
            <v-layout justify-end>
              <v-btn @click="toggleWaitingIncomingOrder" small fab text color="primary_red_1">
                <v-icon>{{ showWaitingIncomingOrder == true ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-btn>
            </v-layout>
          </v-col>
        </v-row>
        <v-row v-if="waitingOrders.length == 0">
          <v-col>
            <v-card outlined class="pa-3">
              <div class="caption primary_grey_1--text text-center">
                Belum ada pesanan keluar menunggu
              </div>
            </v-card>
          </v-col>
        </v-row>
        <v-row v-if="showWaitingIncomingOrder" class="px-1">
          <v-col cols="12" sm="6" md="3" v-for="order in waitingOrders" :key="order._id" class="pa-2">
            <v-card
              flat
              hover
              outlined
              @click="
                $router.push({
                  name: 'outcomingOrder',
                  params: { purchaseOrderId: order._id },
                })
              "
            >
              <v-layout align-center>
                <div class="pa-2">
                  <v-avatar>
                    <v-img
                      v-if="order.sellerId.storeId.image !== '-'"
                      :src="apiImage(order.sellerId.storeId.image)"
                    ></v-img>
                    <v-img v-if="order.sellerId.storeId.image === '-'" :src="lazyImg"></v-img>
                  </v-avatar>
                </div>
                <div class="pa-2">
                  <div class="caption font-weight-bold primary_black_1--text">
                    <v-clamp autoresize :max-lines="1">{{ order.sellerId.storeId.name }}</v-clamp>
                  </div>
                  <div class="caption font-weight-bold primary_red_1--text">
                    {{ subTotal(order.purchaseOrderItem) }}
                  </div>
                  <div class="caption primary_grey_1--text">
                    {{ order.purchaseOrderItem.length }} jenis barang
                    <i class="fas fa-jenkins"></i>
                  </div>
                </div>
              </v-layout>
              <v-divider></v-divider>
              <v-layout justify-end>
                <div class="pa-2">
                  <v-chip
                    outlined
                    small
                    :color="orderStatusColor(order.isConfirmItem, order.isConfirmSendItem, order.isDone)"
                  >
                    <div
                      :class="
                        `caption ${orderStatusColor(order.isConfirmItem, order.isConfirmSendItem, order.isDone)}--text`
                      "
                    >
                      {{ orderStatusText(order.isConfirmItem, order.isConfirmSendItem, order.isDone) }}
                    </div>
                  </v-chip>
                </div>
              </v-layout>
            </v-card>
          </v-col>
        </v-row>
        <div v-if="waitingOrders.length > 0" class="text-center">
          <v-pagination
            color="primary_red_1"
            v-model="pageWaiting"
            :length="Math.ceil(waitingCountAll / waitingCount)"
            :total-visible="7"
          ></v-pagination>
        </div>

        <!-- Selesai -->

        <v-row>
          <v-col>
            <div class="caption font-weight-bold primary_grey_1--text">
              Daftar Pesanan Selesai
            </div>
          </v-col>
          <v-col cols="6" lg="6" md="6" sm="6" class="py-0">
            <v-layout justify-end>
              <v-btn @click="toggleDoneIncomingOrder" small fab text color="primary_red_1">
                <v-icon>{{ showDoneIncomingOrder == true ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-btn>
            </v-layout>
          </v-col>
        </v-row>
        <v-row v-if="doneOrders.length == 0">
          <v-col>
            <v-card outlined class="pa-3">
              <div class="caption primary_grey_1--text text-center">
                Belum ada pesanan keluar selesai
              </div>
            </v-card>
          </v-col>
        </v-row>
        <v-row v-if="showDoneIncomingOrder" class="px-1">
          <v-col cols="12" sm="6" md="3" v-for="order in doneOrders" :key="order._id" class="pa-2">
            <v-card
              flat
              hover
              outlined
              @click="
                $router.push({
                  name: 'outcomingOrder',
                  params: { purchaseOrderId: order._id },
                })
              "
            >
              <v-layout align-center>
                <div class="pa-2">
                  <v-avatar>
                    <v-img
                      v-if="order.sellerId.storeId.image !== '-'"
                      :src="apiImage(order.sellerId.storeId.image)"
                    ></v-img>
                    <v-img v-if="order.sellerId.storeId.image === '-'" :src="lazyImg"></v-img>
                  </v-avatar>
                </div>
                <div class="pa-2">
                  <div class="caption font-weight-bold primary_black_1--text">
                    <v-clamp autoresize :max-lines="1">{{ order.sellerId.storeId.name }}</v-clamp>
                  </div>
                  <div class="caption font-weight-bold primary_red_1--text">
                    {{ subTotal(order.purchaseOrderItem) }}
                  </div>
                  <div class="caption primary_grey_1--text">
                    {{ order.purchaseOrderItem.length }} jenis barang
                    <i class="fas fa-jenkins"></i>
                  </div>
                </div>
              </v-layout>
              <v-divider></v-divider>
              <v-layout justify-end>
                <div class="pa-2">
                  <v-chip
                    outlined
                    small
                    :color="orderStatusColor(order.isConfirmItem, order.isConfirmSendItem, order.isDone)"
                  >
                    <div
                      :class="
                        `caption ${orderStatusColor(order.isConfirmItem, order.isConfirmSendItem, order.isDone)}--text`
                      "
                    >
                      {{ orderStatusText(order.isConfirmItem, order.isConfirmSendItem, order.isDone) }}
                    </div>
                  </v-chip>
                </div>
              </v-layout>
            </v-card>
          </v-col>
        </v-row>
        <div v-if="doneOrders.length > 0" class="text-center">
          <v-pagination
            color="primary_red_1"
            v-model="pageDone"
            :length="Math.ceil(doneCountAll / doneCount)"
            :total-visible="7"
          ></v-pagination>
        </div>
      </v-container>
    </v-content>
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
    Promise.all([this.loadWaitingPurchaseOrder(), this.loadDonePurchaseOrder()]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    tab: null,
    items: ['Appetizers', 'Entrees', 'Deserts', 'Cocktails'],
    isLoading: true,
    pageWaiting: 1,
    waitingCount: 5,
    waitingCountAll: 0,
    pageDone: 1,
    doneCount: 5,
    doneCountAll: 0,
    lazyImg: lazyImg,
    orders: [],
    waitingOrders: [],
    doneOrders: [],
    showWaitingIncomingOrder: true,
    showDoneIncomingOrder: true,
  }),
  methods: {
    toggleWaitingIncomingOrder() {
      if (this.showWaitingIncomingOrder == true) {
        this.showWaitingIncomingOrder = false
      } else {
        this.showWaitingIncomingOrder = true
      }
    },
    toggleDoneIncomingOrder() {
      if (this.showDoneIncomingOrder == true) {
        this.showDoneIncomingOrder = false
      } else {
        this.showDoneIncomingOrder = true
      }
    },
    orderStatusColor(isConfirmItem, isConfirmSendItem, isDone) {
      if (isDone) {
        return 'success'
      } else {
        if (!isConfirmItem && !isConfirmSendItem) {
          return 'warning'
        }
        if (isConfirmItem && !isConfirmSendItem) {
          return 'success'
        } else if (isConfirmItem && isConfirmSendItem) {
          return 'success'
        }
      }
    },
    orderStatusText(isConfirmItem, isConfirmSendItem, isDone) {
      if (isDone) {
        return 'Pesanan selesai'
      } else {
        if (!isConfirmItem && !isConfirmSendItem) {
          return 'Menunggu konfirmasi'
        }
        if (isConfirmItem && !isConfirmSendItem) {
          return 'Sudah dikonfirmasi'
        } else if (isConfirmItem && isConfirmSendItem) {
          return 'Pesanan dikirim'
        }
      }
    },
    consoling() {
      console.log(this.pageWaiting)
    },
    async loadWaitingPurchaseOrder() {
      const requestPurchaseOrder = async () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        const userId = currentUser._id
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/purchase-orders?userId=${userId}&isDone=false&page=${this.pageWaiting -
          1}&count=${this.waitingCount}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        const result = await Axios(config)
        console.log(result)
        this.waitingOrders = result.data.purchases
        this.waitingCountAll = result.data.count
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        return requestPurchaseOrder()
      }
    },
    async loadDonePurchaseOrder() {
      const requestPurchaseOrder = async () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        const userId = currentUser._id
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/purchase-orders?userId=${userId}&isDone=true&page=${this.pageDone - 1}&count=${
          this.doneCount
        }`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        const result = await Axios(config)
        console.log(result)
        this.doneOrders = result.data.purchases
        this.doneCountAll = result.data.count
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        return requestPurchaseOrder()
      }
    },
    subTotal(value) {
      const sub = value.reduce((acc, currentValue) => acc + currentValue.quantity * currentValue.price, 0)
      return this.numberWithPeriod({
        currency: 'Rp',
        separator: '.',
        number: sub,
      })
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
    // waitingOrders() {
    //   const orders = this.orders.filter(element => element.status === false);
    //   return orders;
    // },
    // doneOrders() {
    //   const orders = this.orders.filter(element => element.status === true);
    //   console.log("done", orders.length);
    //   return orders;
    // }
  },
  mixins: [numberWithPeriod],
  watch: {
    pageWaiting: function() {
      this.loadWaitingPurchaseOrder()
    },
    pageDone: function() {
      this.loadDonePurchaseOrder()
    },
  },
}
</script>
