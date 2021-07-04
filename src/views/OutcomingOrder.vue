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
          <v-toolbar-title>Daftar barang dibeli</v-toolbar-title>
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
            <div class="caption font-weight-bold primary_grey_1--text">Pesanan dikirim ke pemasok</div>
          </v-col>
        </v-row>
        <v-row align="center">
          <v-col cols="4">
            <v-avatar size="80" class="mx-2">
              <v-img v-if="supplier.storeId.image !== '-'" :src="apiImage(supplier.storeId.image)"></v-img>
              <v-img v-if="supplier.storeId.image === '-'" :src="lazyImg"></v-img>
            </v-avatar>
          </v-col>
          <v-col cols="8">
            <div class="font-weight-bold primary_grey_1--text">{{ supplier.storeId.name }}</div>
            <div
              v-if="supplier.addressId != null"
              class="caption font-weight-bold primary_grey_1--text"
            >{{ supplier.addressId.name }}</div>
            <div
              v-if="supplier.addressId == null"
              class="caption font-weight-bold primary_grey_1--text"
            >alamat belum ada</div>
          </v-col>
        </v-row>
        <v-row class="mb-3">
          <v-col class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Barang dikirim ke alamat</div>
            <div
              class="caption primary_grey_1--text"
            >{{ `${user.name}, ${buyerAddress.name}, ${buyerAddress.description}` }}</div>
            <!-- <div
              v-if="user.addressId == null"
              class="caption primary_grey_1--text"
            >{{user.name}}, alamat belum ada</div>-->
          </v-col>
        </v-row>
        <v-row class="mb-3">
          <v-col class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Tanggal pembelian</div>
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
            v-for="item in purchaseOrderItem"
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
                    <v-clamp autoresize :max-lines="1">{{ item.productId.masterProductId.partCode }}</v-clamp>
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
                <!-- <div class="pr-2">
                  <v-text-field
                    v-model="item.confirmedQuantity"
                    color="primary_red_1"
                    class="tf mt-4"
                    outlined
                    dense
                    type="number"
                  ></v-text-field>
                </div>-->
              </v-layout>
            </v-card>
          </v-col>
        </v-row>
        <v-row class="mb-3">
          <v-col class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Total pesanan</div>
            <div
              v-if="totalOrder !== totalConfirmedOrder"
              style="text-decoration: line-through"
              class
            >{{ totalOrder }}</div>
            <div>{{ totalConfirmedOrder }}</div>
          </v-col>
        </v-row>
        <v-row class="mb-3">
          <v-col class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Status pesanan</div>
            <div class="font-weight-bold primary_green_1--text">{{ orderStatus }}</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="py-0" cols="12" v-if="!purchaseOrder.isDone">
            <v-btn
              @click="confirmIsDoneDialog = true"
              dark
              block
              color="primary_red_1"
            >pesanan selesai</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-dialog v-model="confirmIsDoneDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">Pesanan Selesai</v-card-title>
        <v-card-text>Konfirmasi pesanan Anda telah selesai?</v-card-text>
        <v-card-text>(pesanan akan otomatis konfirmasi setelah 2 hari)</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary_red_1" text @click="confirmIsDoneDialog = false">tidak</v-btn>
          <v-btn color="primary_red_1" text @click="confirmOrderIsDone">ya</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>
<style>
.tf {
  max-width: 48px;
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
    confirmIsDoneDialog: false,
    isLoading: true,
    lazyImg: lazyImg,
    supplier: { storeId: { image: '', name: '' }, addressId: { name: '' } },
    purchaseOrder: {
      isDone: true,
      isConfirmItem: true,
      isConfirmSendItem: true,
      createdAt: '',
    },
    buyerAddress: { isMain: true, name: '', description: '' },
    purchaseOrderItem: [],
    user: { name: '' },
  }),
  methods: {
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
        this.user = result.data.userId
        this.purchaseOrder = {
          _id: result.data._id,
          isDone: result.data.isDone,
          isConfirmItem: result.data.isConfirmItem,
          isConfirmSendItem: result.data.isConfirmSendItem,
          createdAt: result.data.createdAt,
        }
        this.supplier = result.data.sellerId
        this.buyerAddress = result.data.buyerAddressId
        this.purchaseOrderItem = result.data.purchaseOrderItem
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        return requestPurchaseOrder()
      }
    },
    async confirmOrderIsDone() {
      console.log(this.purchaseOrderItem)

      const requestConfirm = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const { purchaseOrderId } = this.$route.params
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/purchase-orders/${purchaseOrderId}`
        const data = {
          isDone: true,
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
      if (checkToken == true) {
        try {
          await requestConfirm()
          this.purchaseOrder.isDone = true
          this.purchaseOrder.isConfirmItem = true
          this.purchaseOrder.isConfirmSendItem = true
          this.confirmIsDoneDialog = false
        } catch (error) {
          //
        }
      }
    },
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
  },
  computed: {
    totalOrder() {
      const total = this.purchaseOrderItem.reduce(
        (acc, currentValue) => acc + currentValue.price * currentValue.quantity,
        0,
      )
      return this.numberWithPeriod({
        currency: 'Rp',
        separator: '.',
        number: total,
      })
    },
    totalConfirmedOrder() {
      const total = this.purchaseOrderItem.reduce(
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
      if (isDone) {
        return 'Pesanan selesai'
      } else {
        if (!isConfirmItem && !isConfirmSendItem) {
          return 'Menunggu konfirmasi'
        } else if (isConfirmItem && !isConfirmSendItem) {
          return 'Sudah dikonfirmasi'
        } else if (isConfirmItem && isConfirmSendItem) {
          return 'Pesanan dikirim, otomatis selesai dalam 2 hari'
        }
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
