<template>
  <v-app>
    <nav>
      <Navbar main="tes main">
        <template v-slot:back>
          <v-btn small fab text color="primary_red_1" @click="$router.push('/featured')">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </template>
        <template v-slot:body>
          <v-toolbar-title>Report</v-toolbar-title>
        </template>
      </Navbar>
    </nav>
    <v-content v-if="isLoading">
      <v-container>
        <v-row>
          <v-col
            v-for="item in skeletonLoaderItem"
            :key="item"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            xl="3"
          >
            <v-skeleton-loader type="list-item-avatar-three-line"></v-skeleton-loader>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-content v-if="!isLoading">
      <v-container>
        <template>
          <v-data-table
            :headers="headers"
            :items="purchaseOrderItems"
            sort-by="index"
            class="elevation-1"
            :loading="loading"
            :page.sync="page"
            :options.sync="options"
            :server-items-length="serverItemLength"
            :items-per-page.sync="perPage"
          >
            <template v-slot:top>
              <v-card flat class="px-3 py-3">
                <v-row>
                  <v-col class="py-0" cols="12" lg="6" md="6" sm="12">
                    <v-text-field
                      v-on:keyup.13="searchDataTable"
                      outlined
                      v-model="search"
                      dense
                      color="primary_red_1"
                      label="Search"
                    >
                      <template v-slot:append>
                        <v-btn @click="searchDataTable" small text color="primary_grey_1">
                          <v-icon>mdi-magnify</v-icon>
                        </v-btn>
                      </template>
                    </v-text-field>
                  </v-col>
                  <v-col class="py-0" cols="12" lg="6" md="6" sm="12">
                    <v-layout justify-end>
                      <v-btn
                        @click="exportReportPurchaseOrder"
                        color="primary_red_1"
                        dark
                        class="ml-2 mb-1"
                      >Export Report</v-btn>
                      <v-btn class="ml-2 mb-1" color="primary_red_1" dark @click="expandHeader">
                        <v-icon>mdi-arrow-expand</v-icon>
                      </v-btn>
                    </v-layout>
                  </v-col>
                </v-row>
              </v-card>
            </template>
            <template v-slot:item.index="{ item }">
              <div>{{ item.index + 1 }}</div>
            </template>
            <template v-slot:item.productId.price="{ item }">
              <div>
                {{
                numberWithPeriod({
                currency: 'Rp',
                separator: '.',
                number: item.productId.price,
                })
                }}
              </div>
            </template>

            <template v-slot:item.quantity="{ item }">
              <v-layout justify-end>
                <div>{{ item.quantity }}</div>
              </v-layout>
            </template>
            <template v-slot:item.confirmedQuantity="{ item }">
              <v-layout justify-end>
                <div>{{ item.confirmedQuantity }}</div>
              </v-layout>
            </template>
            <template v-slot:item.createdAt="{ item }">
              <div>{{ printDate(item.createdAt) }}</div>
            </template>
          </v-data-table>
        </template>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import VClamp from 'vue-clamp'
import lazyImg from '../../assets/lazy-img.jpg'
import Navbar from '../../components/Navbar'
import { checkTokenExp, refreshToken } from '../../services'
import Axios from 'axios'
import moment from 'moment'
import { apiBaseUrl } from '../../api'
import numberWithPeriod from '../../mixins/numberWithPeriod'
export default {
  mounted() {
    const queue = [this.setPurchaseState()]
    Promise.all(queue).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    loading: false,
    search: '',
    headers: [
      // { text: 'No', value: 'index' },
      {
        text: 'Dealer Store',
        value: 'purchaseOrderId.sellerId.storeId.name',
      },
      { text: 'Depot', value: 'purchaseOrderId.userId.name' },
      { text: 'Purchase Date', value: 'createdAt' },
    ],
    toggleHeader: true,
    purchaseOrderItems: [],
    backupPurchaseOrderItems: [],

    isLoading: true,
    skeletonLoaderItem: [0, 1, 2, 3, 4],
    page: 1,
    perPage: 10,

    options: {},
    serverItemLength: 0,
  }),
  methods: {
    expandHeader() {
      this.toggleHeader = !this.toggleHeader
      const smallHeader = [
        // { text: 'No', value: 'index' },
        {
          text: 'Dealer Store',
          value: 'purchaseOrderId.sellerId.storeId.name',
        },
        { text: 'Depot', value: 'purchaseOrderId.userId.name' },
        { text: 'Purchase Date', value: 'createdAt' },
        // { text: 'Actions', value: 'action', sortable: false },
      ]
      const expandedHeader = [
        { text: 'No', value: 'index' },
        {
          text: 'Dealer Store',
          value: 'purchaseOrderId.sellerId.storeId.name',
        },
        { text: 'Depot', value: 'purchaseOrderId.userId.name' },
        { text: 'Product Name', value: 'productId.masterProductId.name' },
        {
          text: 'Product Local Shop Name',
          value: 'productId.masterProductId.localShopName',
        },
        {
          text: 'Product Part Code',
          value: 'productId.masterProductId.partCode',
        },
        { text: 'Price', value: 'productId.price' },
        { text: 'Quantity', value: 'quantity' },
        { text: 'Confirmed Quantity', value: 'confirmedQuantity' },
        { text: 'Purchase Date', value: 'createdAt' },
        // { text: 'Actions', value: 'action', sortable: false },
      ]
      this.toggleHeader ? (this.headers = smallHeader) : (this.headers = expandedHeader)
    },
    searchDataTable() {
      console.log('searching')
      const search = this.search.toLowerCase()
      const backupPurchaseOrderItems = this.backupPurchaseOrderItems
      if (search.length > 0) {
        const newPurchaseItems = backupPurchaseOrderItems.filter(
          (el) =>
            el.productId.masterProductId.name.toLowerCase().match(search) ||
            el.productId.masterProductId.partCode.toLowerCase().match(search) ||
            el.productId.masterProductId.localShopName.toLowerCase().match(search) ||
            el.purchaseOrderId._id.toLowerCase().match(search) ||
            el.purchaseOrderId.userId.name.toLowerCase().match(search) ||
            el.purchaseOrderId.sellerId.name.toLowerCase().match(search),
        )
        this.purchaseOrderItems = newPurchaseItems
      } else {
        this.purchaseOrderItems = this.backupPurchaseOrderItems
      }
    },
    async getPurchaseOrder() {
      const { token } = JSON.parse(localStorage.getItem('auth'))
      const headers = {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      }
      const url = `${apiBaseUrl}/api/purchase-order-items`
      const config = {
        params: {
          page: this.page,
          perPage: this.perPage,
        },
        headers: headers,
        method: 'GET',
        url: url,
      }
      return Axios(config)
    },
    async setPurchaseState() {
      const result = await this.getPurchaseOrder()

      console.log(result)
      this.purchaseOrderItems = result.data.purchaseOrderItems.map((element, index) => ({
        ...element,
        index,
      }))
      this.serverItemLength = result.data.count
      console.log(this.purchaseOrderItems)

      this.backupPurchaseOrderItems = this.purchaseOrderItems
    },
    printDate(date) {
      return moment(date).format('dddd, DD MMMM YYYY')
    },
    exportReportPurchaseOrder() {
      let reports = this.backupPurchaseOrderItems
      reports = reports.map((element) => {
        return {
          No: element.index + 1,
          // 'Dealer ID': element.purchaseOrderId.sellerId._id,
          'Dealer Name':
            element.purchaseOrderId && element.purchaseOrderId.sellerId
              ? element.purchaseOrderId.sellerId.name
              : 'Nama tidak tersedia',
          'Dealer Store':
            element.purchaseOrderId && element.purchaseOrderId.sellerId && element.purchaseOrderId.sellerId.storeId
              ? element.purchaseOrderId.sellerId.storeId.name
              : 'Nama toko tidak tersedia',
          // 'Depot ID': element.purchaseOrderId.userId._id ,
          'Depot Name':
            element.purchaseOrderId && element.purchaseOrderId.userId
              ? element.purchaseOrderId.userId.name
              : 'Nama depot tidak tersedia',
          'Purhchase ID': element._id,
          'Product Name':
            element.productId && element.productId.masterProductId
              ? element.productId.masterProductId.name
              : 'Nama produk tidak tersedia',
          'Product Local Shop Name':
            element.productId && element.productId.masterProductId
              ? element.productId.masterProductId.localShopName
              : 'Nama bahasa bengkel produk tidak tersedia',
          'Product Part Code':
            element.productId && element.productId.masterProductId
              ? element.productId.masterProductId.partCode
              : 'Kode part produk tidak tersedia',
          Price: element.productId ? element.productId.price : 'Harga tidak tersedia',
          Quantity: element.quantity,
          'Confirmed Quantity': element.confirmedQuantity,
          Date: this.printDate(element.created),
        }
      })

      const report2DArrayHeader = []
      for (const header in reports[0]) {
        report2DArrayHeader.push(header)
      }

      const report2DArrayBody = reports.map((element) => report2DArrayHeader.map((item) => element[item]))

      const report2DArray = [report2DArrayHeader, ...report2DArrayBody]
      let CsvString = ''
      report2DArray.forEach(function(RowItem, RowIndex) {
        RowItem.forEach(function(ColItem, ColIndex) {
          CsvString += ColItem + ','
        })
        CsvString += '\r\n'
      })
      CsvString = 'data:application/csv,' + encodeURIComponent(CsvString)
      let x = document.createElement('A')
      x.setAttribute('href', CsvString)
      x.setAttribute('download', 'purchase order report.csv')
      document.body.appendChild(x)
      x.click()
    },
  },
  created() {},
  computed: {
    //
  },
  components: {
    Navbar,
  },
  mixins: [numberWithPeriod],
  watch: {
    options: {
      handler() {
        this.setPurchaseState()
      },
      deep: true,
    },
  },
}
</script>
