<template>
  <v-app>
    <nav>
      <Navbar main="tes main">
        <template v-slot:back>
          <v-btn small fab text color="primary_red_1" @click="$router.go(-1)">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </template>
        <template v-slot:body>
          <v-toolbar-title>Daftar barang dijual</v-toolbar-title>
        </template>
      </Navbar>
    </nav>
    <v-content v-if="isLoading">
      <v-container>
        <v-row align="center">
          <v-col cols="4" md="4">
            <v-skeleton-loader height="100" type="image"></v-skeleton-loader>
          </v-col>
          <v-col cols="8" md="4">
            <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="list-item-avatar-two-line"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6" md="4">
            <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6" md="4">
            <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="actions"></v-skeleton-loader>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-content v-if="!isLoading">
      <v-container>
        <v-row>
          <v-col class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Pesanan masuk dari</div>
          </v-col>
        </v-row>
        <v-row align="center">
          <v-col cols="4">
            <v-avatar size="80" class="mx-2">
              <v-img v-if="buyer.image !== '-'" :src="apiImage(buyer.image)"></v-img>
              <v-img v-if="buyer.image === '-'" :src="lazyImg"></v-img>
            </v-avatar>
          </v-col>
          <v-col cols="8">
            <div class="font-weight-bold primary_grey_1--text">{{ buyer.name }}</div>
            <div class="caption font-weight-bold primary_grey_1--text">{{ buyerAddress.name }}</div>
            <!-- <div class="caption font-weight-bold primary_grey_1--text">{{buyerAddress.description}}</div> -->
          </v-col>
        </v-row>
        <v-row class="mb-3">
          <v-col class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Barang dikirim ke alamat</div>
            <div
              class="caption primary_grey_1--text"
            >{{ `${buyer.name}, ${buyerAddress.name}, ${buyerAddress.description}` }}</div>
          </v-col>
        </v-row>
        <v-row class="mb-3">
          <v-col class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Tanggal pemesanan</div>
            <div class="caption primary_grey_1--text">{{ dateOrder }}</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Barang pesanan</div>
          </v-col>
        </v-row>
        <v-row class="px-1">
          <v-col
            cols="12"
            sm="6"
            md="4"
            class="pa-2"
            v-for="item in purchaseOrderItems"
            :key="item._id"
          >
            <v-card flat hover outlined>
              <!-- @click="$router.push({name:'itemDetailSupplier', params:{productId:item.productId._id}})" -->
              <v-layout align-center>
                <div class="pa-2">
                  <v-avatar>
                    <v-img
                      v-if="item.productId.masterProductId.image.length > 0"
                      :src="apiImage(item.productId.masterProductId.image[0].image)"
                    ></v-img>
                    <v-img v-if="item.productId.masterProductId.image.length === 0" :src="lazyImg"></v-img>
                  </v-avatar>
                </div>
                <v-spacer>
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
                      number: item.price * item.quantity,
                      })
                      }}
                    </div>
                    <div class="caption font-weight-bold primary_grey_1--text">
                      Dipesan {{ item.quantity }}
                      {{ purchaseOrder.isConfirmItem === true ? '/ Dikirim ' + item.confirmedQuantity : '' }}
                    </div>
                  </div>
                </v-spacer>
                <div class="pr-2">
                  <v-text-field
                    style="min-width:60px;max-width:80px"
                    :disabled="purchaseOrder.isConfirmItem"
                    v-model="item.confirmedQuantity"
                    color="primary_red_1"
                    class="tf mt-4"
                    outlined
                    dense
                    type="number"
                  ></v-text-field>
                </div>
              </v-layout>
            </v-card>
          </v-col>
        </v-row>
        <v-row class="mb-3 mt-3">
          <v-col class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Total pesanan</div>
            <div>{{ totalOrder }}</div>
          </v-col>
        </v-row>
        <v-row class="mb-3">
          <v-col class="py-0">
            <div
              class="caption font-weight-bold primary_grey_1--text"
            >Total pesanan yang dikonfirmasi</div>
            <div>{{ totalOrderConfirmed }}</div>
          </v-col>
        </v-row>
        <v-row class="mb-3">
          <v-col class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Status pesanan</div>
            <div class="font-weight-bold primary_green_1--text">{{ orderStatus }}</div>
          </v-col>
        </v-row>
        <v-row v-if="!purchaseOrder.isDone">
          <v-col cols="12" v-if="!purchaseOrder.isConfirmItem" class="py-0">
            <v-btn
              dark
              block
              color="primary_red_1"
              @click="confirmItemDialog = true"
            >konfirmasi barang</v-btn>
          </v-col>
          <!-- <v-col cols="12" v-if="!purchaseOrder.isConfirmSendItem">
            <v-btn dark block color="primary_red_1" @click="confirmSendItemDialog = true">kirim</v-btn>
          </!-->
          <v-col
            class="py-0"
            cols="12"
            v-if="showSendItem(purchaseOrder.isConfirmItem, purchaseOrder.isConfirmSendItem)"
          >
            <v-btn dark block color="primary_red_1" @click="confirmSendItemDialog = true">kirim</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-dialog v-model="confirmItemDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">Konfirmasi Barang</v-card-title>
        <!-- <v-card-text>Konfirmasi pesanan Anda telah selesai?</v-card-text> -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary_red_1" text @click="confirmItemDialog = false">tidak</v-btn>
          <v-btn color="primary_red_1" text @click="confirmOrderIsConfirmItem">ya</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmSendItemDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">Konfirmasi Kirim</v-card-title>
        <!-- <v-card-text>Konfirmasi pesanan Anda telah selesai?</v-card-text> -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary_red_1" text @click="confirmSendItemDialog = false">tidak</v-btn>
          <v-btn color="primary_red_1" text @click="confirmOrderIsConfirmSendItem">ya</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>
<style>
.tf {
  max-width: 60px;
  min-width: 44px;
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
import moment from 'moment'
export default {
  mounted() {
    Promise.all([this.loadPurchaseOrderItem()]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    confirmItemDialog: false,
    confirmSendItemDialog: false,
    isLoading: true,
    lazyImg: lazyImg,
    supplier: { storeId: {} },
    purchaseOrder: {
      isDone: true,
      isConfirmItem: true,
      isConfirmSendItem: true,
      createdAt: '',
    },
    purchaseOrderItems: [],
    buyer: { name: '' },
    buyerAddress: {
      isMain: false,
      name: '',
      description: '',
    },
  }),
  methods: {
    showSendItem(isConfirmItem, isConfirmSendItem) {
      // if (!isConfirmItem && !isConfirmSendItem) {
      //   return false
      // } else if (isConfirmItem && !isConfirmSendItem) {
      //   return true
      // } else if (isConfirmItem && isConfirmSendItem) {
      //   return false
      // }
      console.log('kirim', isConfirmItem != isConfirmSendItem)
      return isConfirmItem != isConfirmSendItem
    },
    async loadPurchaseOrderItem() {
      const requestPurchaseOrder = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const { purchaseOrderId } = this.$route.params
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/purchase-orders/${purchaseOrderId}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        const result = await Axios(config)
        console.log(result.data)
        this.buyer = result.data.userId
        this.purchaseOrder = {
          _id: result.data._id,
          isDone: result.data.isDone,
          isConfirmItem: result.data.isConfirmItem,
          isConfirmSendItem: result.data.isConfirmSendItem,
          createdAt: result.data.createdAt,
        }
        this.buyerAddress = result.data.buyerAddressId
        this.supplier = result.data.sellerId
        this.purchaseOrderItems = result.data.purchaseOrderItem
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        return requestPurchaseOrder()
      }
    },
    async confirmOrderIsConfirmItem() {
      const requestConfirm = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const { purchaseOrderId } = this.$route.params
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/purchase-orders/${purchaseOrderId}`
        const data = {
          isConfirmItem: true,
          purchaseOrderItems: this.purchaseOrderItems.map((element) => ({
            _id: element._id,
            productId: element.productId._id,
            confirmedQuantity: element.confirmedQuantity,
          })),
        }
        const config = {
          headers: headers,
          method: 'PUT',
          url: url,
          data: data,
        }

        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      try {
        if (checkToken == true) {
          await requestConfirm()
          this.purchaseOrder.isConfirmItem = true
          this.confirmItemDialog = false
        }
      } catch (error) {
        console.log(error)
      }
    },
    async confirmOrderIsConfirmSendItem() {
      const requestConfirm = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const { purchaseOrderId } = this.$route.params
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/purchase-orders/${purchaseOrderId}`
        const data = {
          isConfirmSendItem: true,
        }
        const config = {
          headers: headers,
          method: 'PUT',
          url: url,
          data: data,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      try {
        if (checkToken == true) {
          await requestConfirm()
          this.purchaseOrder.isConfirmSendItem = true
          this.confirmSendItemDialog = false
        }
      } catch (error) {
        //
      }
    },
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
  },
  computed: {
    totalOrder() {
      const total = this.purchaseOrderItems.reduce(
        (acc, currentValue) => acc + currentValue.price * currentValue.quantity,
        0,
      )
      return this.numberWithPeriod({
        currency: 'Rp',
        separator: '.',
        number: total,
      })
    },
    totalOrderConfirmed() {
      const total = this.purchaseOrderItems.reduce(
        (acc, currentValue) => acc + currentValue.price * currentValue.confirmedQuantity,
        0,
      )
      return this.numberWithPeriod({
        currency: 'Rp',
        separator: '.',
        number: total,
      })
    },
    orderStatus() {
      const { isDone, isConfirmItem, isConfirmSendItem } = this.purchaseOrder
      if (isConfirmSendItem === true && isDone === false) {
        return 'Dikirim'
      } else if (isConfirmSendItem === true && isDone === true) {
        return 'Pesanan Sudah Diterima'
      } else if (isConfirmItem && !isConfirmSendItem) {
        return 'Pesanan masuk, sudah dikonfirmasi'
      } else if (isConfirmSendItem === false && isDone === false) {
        return 'Pesanan masuk, menunggu konfirmasi'
      }
      return ''
    },
    dateOrder() {
      const newDateOrder = moment(this.purchaseOrder.createdAt).format('DD MMMM YYYY - HH:mm')
      return newDateOrder
    },
  },
  components: {
    Navbar,
    VClamp,
  },
  mixins: [numberWithPeriod],
}
</script>
