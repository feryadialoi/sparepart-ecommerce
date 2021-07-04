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
          <v-toolbar-title>Daftar barang dijual</v-toolbar-title>
        </template>
        <template v-slot:right>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                @click="openDialogImportProduct"
                small
                fab
                text
                color="primary_red_1"
              >
                <v-icon>mdi-card-text</v-icon>
              </v-btn>
            </template>
            <span>Import Progress</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                small
                fab
                text
                v-on="on"
                color="primary_red_1"
                dark
                @click="dialogMonitoringImport = true"
              >
                <v-icon>mdi-progress-upload</v-icon>
              </v-btn>
            </template>
            <span>Import Progress</span>
          </v-tooltip>
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
          fixed
          absolute
          v-model="success"
          :value="success"
          transition="scale-transition"
          dismissible
          type="success"
        >{{ successMessage }}</v-alert>
        <v-alert
          v-model="error"
          :value="error"
          transition="scale-transition"
          dismissible
          type="error"
        >{{ errorMessage }}</v-alert>
        <v-row>
          <v-col class="pb-0">
            <v-select
              dense
              :items="categories"
              v-model="category"
              @change="selectCategory"
              outlined
              item-text="name"
              label="Kategori"
              return-object
              color="primary_red_1"
            ></v-select>
          </v-col>
        </v-row>
        <div v-for="(saleItem, index) in saleItems" :key="saleItem._id">
          <v-row align="center">
            <v-col cols="6" sm="6" md="6" lg="6" xl="6" class="py-0">
              <v-checkbox
                v-model="saleItem.isSale"
                @change="isSaleCategoryProduct(index)"
                color="primary_red_1"
                :label="saleItem.name"
              ></v-checkbox>
            </v-col>
            <v-col cols="6" sm="6" md="6" lg="6" xl="6" class="py-0">
              <v-layout justify-end>
                <v-btn @click="showProduct(saleItem)" small fab text color="primary_red_1">
                  <v-icon>{{ saleItem.show == true ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </v-btn>
              </v-layout>
            </v-col>
          </v-row>

          <div v-if="saleItem.show">
            <!-- <v-row>
              <v-col cols="12" lg="12" md="12" sm="12" class="py-0">
                <v-layout>
                  <v-spacer></v-spacer>
                  <v-switch label="show all" color="primary_red_1" v-model="saleItem.isShowAll"></v-switch>
                </v-layout>
              </v-col>
            </v-row>-->

            <!-- <v-row v-if="!saleItem.isShowAll">
              <v-col
                cols="12"
                sm="6"
                md="4"
                v-for="item in saleItem.showProducts"
                :key="item._id"
                class="px-2 py-0"
              >
                <v-card flat hover outlined class="mb-3">
                  <v-layout align-center>
                    <div class="pa-2">
                      <v-avatar>
                        <v-img v-if="item.image.length === 0" :src="lazyImg"></v-img>
                        <v-img v-if="item.image.length > 0" :src="apiImage(item.image[0].image)"></v-img>
                      </v-avatar>
                    </div>
                    <v-spacer>
                      <div class="pa-2">
                        <div class="caption font-weight-bold primary_black_1--text">
                          <v-clamp autoresize :max-lines="2">{{ item.name }}</v-clamp>
                        </div>
                        <div class="caption primary_black_1--text">
                          <v-clamp autoresize :max-lines="2">{{ item.localShopName }}</v-clamp>
                        </div>
                        <div class="caption primary_black_1--text">
                          <v-clamp autoresize :max-lines="2">{{ item.partCode }}</v-clamp>
                        </div>
                        <div class="caption primary_red_1--text">
                          {{
                          numberWithPeriod({
                          currency: 'Rp',
                          separator: '.',
                          number: item.price,
                          })
                          }}
                        </div>
                      </div>
                    </v-spacer>
                    <div class="px-2">
                      <div class="caption text-center mt-1">Jual</div>
                      <v-checkbox
                        v-model="item.dealerProduct[0].isSale"
                        class="mt-1"
                        color="primary_red_1"
                      ></v-checkbox>
                    </div>
                    <div class="pr-2">
                      <div class="caption text-center mt-3">Stok</div>
                      <v-text-field
                        error-count="2"
                        color="primary_red_1"
                        style="min-width:60px;max-width:80px"
                        outlined
                        dense
                        type="number"
                        min="1"
                        v-model="item.dealerProduct[0].stock"
                        :rules="stockRules"
                      ></v-text-field>
                    </div>
                  </v-layout>
                </v-card>
              </v-col>
            </v-row>-->
            <!-- <v-row v-if="saleItem.isShowAll"> -->
            <v-row>
              <v-col
                cols="12"
                sm="6"
                md="4"
                v-for="item in saleItem.masterProductId"
                :key="item._id"
                class="px-2 py-0"
              >
                <v-card flat hover outlined class="mb-3">
                  <v-layout align-center>
                    <div class="pa-2">
                      <v-avatar>
                        <v-img v-if="item.image &&  item.image.length === 0" :src="lazyImg"></v-img>
                        <v-img v-if="item.image.length > 0" :src="apiImage(item.image[0].image)"></v-img>
                      </v-avatar>
                    </div>
                    <v-spacer>
                      <div class="pa-2">
                        <div class="caption font-weight-bold primary_black_1--text">
                          <v-clamp autoresize :max-lines="2">{{ item.name }}</v-clamp>
                        </div>
                        <div class="caption primary_black_1--text">
                          <v-clamp autoresize :max-lines="2">{{ item.partCode }}</v-clamp>
                        </div>
                        <div class="caption primary_red_1--text">
                          {{
                          numberWithPeriod({
                          currency: 'Rp',
                          separator: '.',
                          number: item.price,
                          })
                          }}
                        </div>
                      </div>
                    </v-spacer>
                    <div class="px-2">
                      <div class="caption text-center mt-1">Jual</div>
                      <v-checkbox
                        v-model="item.dealerProduct[0].isSale"
                        class="mt-1"
                        color="primary_red_1"
                      ></v-checkbox>
                    </div>
                    <div class="pr-2">
                      <div class="caption text-center mt-3">Stok</div>
                      <v-text-field
                        error-count="2"
                        color="primary_red_1"
                        style="min-width:60px;max-width:80px"
                        outlined
                        dense
                        type="number"
                        min="1"
                        v-model="item.dealerProduct[0].stock"
                        :rules="stockRules"
                      ></v-text-field>
                    </div>
                  </v-layout>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </div>
        <v-row justify="end">
          <v-col cols="12" sm="3">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn block v-on="on" @click="saveUpdate" dark color="primary_red_1">
                  <v-icon>mdi-content-save</v-icon>
                  <div class="ml-2">simpan</div>
                </v-btn>
              </template>
              <span>Save</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-container>
    </v-content>

    <!-- <v-footer app fixed color="transparent" class="font-weight-medium">
      <v-col class="text-center" cols="12">
        <v-row style="height: 40px; position: relative">
          <v-btn @click="saveUpdate" absolute dark fab top right color="primary_red_1">
            <v-icon>mdi-content-save</v-icon>
          </v-btn>
        </v-row>
      </v-col>
    </v-footer>-->

    <v-footer>
      <v-layout justify-center>
        <div
          v-if="saleItems.length > 0 && saleItems[0].masterProductId && saleItems[0].masterProductId.length > 0"
          class="text-center"
        >
          <v-pagination
            color="primary_red_1"
            v-model="pageProduct"
            :length="Math.ceil(productCountAll / productCount)"
            :total-visible="6"
          ></v-pagination>
        </div>
      </v-layout>
    </v-footer>
    <!-- dialog import data csv =================================================== -->
    <v-dialog v-model="dialogImportProduct" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Import csv</span>
        </v-card-title>

        <v-divider></v-divider>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" lg="12" md="12" sm="12">
                <div>Download template untuk import data dalam bentuk Microsoft Excel (xls)</div>
              </v-col>
              <v-col cols="12" lg="12" md="12" sm="12">
                <v-btn
                  @click="downloadTemplateProduct"
                  outlined
                  color="primary_red_1"
                  dark
                  class="mb-2"
                >download template</v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" lg="12" md="12" sm="12">
                <div>
                  Upload data menggunakan file berformat csv (jika menggunakan file Microsoft Excel/xlsx di-save as ke
                  file berformat csv)
                </div>
              </v-col>
              <v-col v-if="csv" cols="12" sm="12" md="12" class="text-center">
                <v-icon size="100" color="primary_red_1">mdi-file-document</v-icon>
                <div>{{ csvName }}</div>
              </v-col>
              <v-col cols="12" sm="12" md="12" class="pb-1">
                <v-btn color="primary_red_1" dark class="mb-2" @click="onPickFileCsv">csv file</v-btn>
                <input
                  type="file"
                  ref="fileInputCsv"
                  style="display:none"
                  @change="onCsvFilePicked"
                  accept=".csv"
                />
              </v-col>
              <v-col cols="12" sm="12" md="12" class="py-0">
                <div class="primary_red_1--text caption">{{ csvErrorMessage }}</div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>

        <v-card-actions class="pa-5">
          <v-progress-circular
            v-if="isProgressImport"
            :size="30"
            :width="3"
            color="primary_red_1"
            indeterminate
          ></v-progress-circular>
          <div v-if="isProgressImport" class="ml-3 primary_grey_1--text">importing</div>

          <v-spacer></v-spacer>
          <v-btn outlined color="blue darken-1" dark @click="closeDialogImportProduct">Cancel</v-btn>
          <v-btn outlined @click="submitImport" color="success darken-1">import</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- dialog import data csv END =================================================== -->
    <!-- dialog monitoring import -->
    <v-dialog v-model="dialogMonitoringImport" max-width="900px">
      <v-card>
        <v-card-title>
          <span class="headline">Import Product</span>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogMonitoringImport = false">close</v-btn>
        </v-card-title>
        <v-card-text>
          <v-container>
            <span class>Progress</span>
            <span>
              {{
              `(${currentPosition} of ${json.length}) ${
              json.length > 0 ? roundUp((currentPosition * 100) / json.length, 2) + '%' : ''
              }`
              }}
              <v-chip
                small
                color="success"
                v-if="currentPosition == json.length && json.length > 0"
              >done</v-chip>
            </span>

            <v-alert
              v-model="importError"
              :value="importError"
              transition="scale-transition"
              dismissible
              type="error"
            >{{ `error ${importErrorMessage}, data number ${currentPosition}` }}</v-alert>
            <v-layout class="mb-2">
              <v-btn
                outlined
                class="mr-2"
                v-if="importError"
                dark
                color="primary_red_1"
                @click="executeImport"
              >continue import</v-btn>
              <v-btn
                outlined
                v-if="importError"
                dark
                color="primary_red_1"
                @click="importContinueAll"
              >continue import all</v-btn>
            </v-layout>

            <v-data-table
              loading-text="loading import products..."
              :headers="jsonHeaders"
              :items="json"
              sort-by="index"
              class="elevation-1"
            >
              <template v-slot:item.isSale="{ item }">
                <div>{{ item.isSale == 1 ? 'yes' : 'no' }}</div>
              </template>
              <template v-slot:item.statusImport="{ item }">
                <v-chip
                  class="mx-1"
                  small
                  :color="
                    item.statusImport == 'success' ? 'success' : item.statusImport == 'error' ? 'primary_red_1' : 'grey'"
                  dark
                >{{ item.statusImport }}</v-chip>
              </template>
            </v-data-table>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <!-- <v-btn
            :disabled="!(currentPosition == json.length && json.length > 0)"
            :dark="(currentPosition == json.length && json.length > 0)"
            color="blue darken-1"
            @click="downloadImportReport"
          >download import report</v-btn>-->
          <div>
            <v-row>
              <v-col sm="6">
                <v-layout justify-center>
                  <v-btn
                    text
                    class="mx-1"
                    dark
                    color="blue darken-1"
                    @click="downloadImportReport"
                  >download import report</v-btn>
                </v-layout>
              </v-col>
              <v-col sm="6">
                <v-layout justify-center>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        small
                        text
                        class="mx-1"
                        dark
                        color="blue darken-1"
                        @click="pauseImportState"
                      >
                        <v-icon>mdi-pause</v-icon>
                      </v-btn>
                    </template>
                    <span>pause</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        small
                        text
                        class="mx-1"
                        dark
                        color="blue darken-1"
                        @click="continueImportState"
                      >
                        <v-icon>mdi-play</v-icon>
                      </v-btn>
                    </template>
                    <span>continue</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        small
                        text
                        class="mx-1"
                        dark
                        color="blue darken-1"
                        @click="resetImportState"
                      >
                        <v-icon>mdi-stop</v-icon>
                      </v-btn>
                    </template>
                    <span>stop</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        small
                        text
                        class="mx-1"
                        dark
                        color="blue darken-1"
                        @click="dialogMonitoringImport = false"
                      >
                        <v-icon>mdi-window-minimize</v-icon>
                      </v-btn>
                    </template>
                    <span>minimize</span>
                  </v-tooltip>
                </v-layout>
              </v-col>
            </v-row>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- dialog monitoring import END -->
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
import VClamp from 'vue-clamp'
import { checkTokenExp } from '../services'
import roundUp from '../mixins/roundUp'
import Axios from 'axios'
import { apiBaseUrl } from '../api'
import numberWithPeriod from '../mixins/numberWithPeriod'
import { separator } from '../services/csvConfig'
export default {
  mounted() {
    Promise.all([
      //
      // this.loadSaleProduct(),
      // this.loadProduct(),
      //
      this.setCategories(),
    ]).then(() => {
      this.isLoading = false
    })
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
  },
  data: () => ({
    currentUser: {},
    lazyImg: lazyImg,
    isLoading: true,
    saleItems: [],
    stockRules: [(v) => v > -1 || 'Qty not valid'],
    success: false,
    error: false,
    errorMessage: '',
    successMessage: '',

    // import csv
    dialogMasterProduct: false,
    dialogImportProduct: false,
    csvUrl: '',
    csv: null,
    csvName: '',
    csvErrorMessage: '',
    products: [],

    // monitor import
    json: [],
    backupI: 0,
    currentPosition: 0,
    continue: true,
    continueAll: false,
    importError: false,
    importErrorMessage: '',

    page: 1,
    perPage: 10,
    options: {},
    serverItemLength: 0,

    jsonHeaders: [
      { text: 'no', value: 'no' },
      { text: 'customerId', value: 'customerId' },
      { text: 'productPartCode', value: 'productPartCode' },
      { text: 'stock', value: 'stock' },
      { text: 'isSale', value: 'isSale' },
      { text: 'statusImport', value: 'statusImport' },
      { text: 'message', value: 'message' },
    ],
    dialogMonitoringImport: false,
    isProgressImport: false,
    isProgressDownloadTemplate: false,
    isLoadingProduct: false,

    categories: [],
    category: {
      createdAt: '2020-04-14T17:07:18.318Z',
      deleted: false,
      id: '5e95edc6663e8b18b612547e',
      name: 'Rantai Api',
      updatedAt: '2020-05-12T04:39:20.580Z',
      __v: 0,
      _id: '5e95edc6663e8b18b612547e',
    },

    // pagination
    pageProduct: 1,
    productCount: 20,
    productCountAll: 0,
  }),
  methods: {
    // new import method
    downloadImportReport() {
      let templates = this.json
      let template2DArrayHeader = []
      let template2DArrayBody = []
      console.log('templates', templates)
      if (templates.length > 0) {
        templates = templates.map((element) => ({
          customerId: element.customerId,
          productPartCode: element.productPartCode,
          price: element.price,
          lowestPrice: element.lowestPrice,
          highestPrice: element.highestPrice,
          stock: element.stock,
          isSale: element.isSale,
          statusImport: element.statusImport,
          message: element.message,
        }))
      } else {
        templates = [
          {
            customerId: '',
            productPartCode: '',
            price: 0,
            lowestPrice: 0,
            highestPrice: 0,
            stock: 0,
            isSale: 0,
            statusImport: '',
            message: '',
          },
        ]
      }
      for (const header in templates[0]) {
        template2DArrayHeader.push(header)
      }
      template2DArrayBody = templates.map((element) => template2DArrayHeader.map((item) => element[item]))

      const template2DArray = [template2DArrayHeader, ...template2DArrayBody]

      let CsvString = ''
      template2DArray.forEach(function(RowItem) {
        RowItem.forEach(function(ColItem) {
          CsvString += ColItem + separator
        })
        CsvString += '\r\n'
      })
      CsvString = 'data:application/csv,' + encodeURIComponent(CsvString)
      let x = document.createElement('A')
      x.setAttribute('href', CsvString)
      x.setAttribute('download', 'import-report-all-users-products.csv')
      document.body.appendChild(x)
      x.click()
    },
    importContinueAll() {
      this.continueAll = true
      this.executeImport()
    },
    async requestImport(data) {
      const { token } = JSON.parse(localStorage.getItem('auth'))
      const headers = {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      }
      const url = `${apiBaseUrl}/api/products/import-product`
      const config = {
        headers: headers,
        method: 'POST',
        url: url,
        data: data,
      }
      return Axios(config)
    },
    parsingCsv() {
      const { token } = JSON.parse(localStorage.getItem('auth'))
      const headers = {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      }
      const url = `${apiBaseUrl}/api/csv-parser/products`
      const data = new FormData()
      data.append('csv', this.csv)
      const config = {
        headers: headers,
        method: 'POST',
        url: url,
        data: data,
      }
      return Axios(config)
    },
    async submitImport() {
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        try {
          this.backupI = 0
          this.currentPosition = 0
          this.isProgressImport = true
          const response = await this.parsingCsv()
          this.isProgressImport = false
          this.dialogImportProduct = false
          const data = response.data
          this.json = data.json

          this.json = this.json.map((item, index) => ({
            ...item,
            no: index + 1,
            statusImport: 'processing',
            message: 'waiting',
          }))
          this.dialogMonitoringImport = true
          this.executeImport()
        } catch (error) {
          this.errorAlert(error.response.data)
        }
      }
    },
    async executeImport() {
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const start = new Date().valueOf()
        this.backupI = this.currentPosition
        this.resetImportError()
        for (let i = this.backupI; i < this.json.length; i++) {
          try {
            const response = await this.requestImport(this.json[i])
            this.json[i].statusImport = response.data.statusImport
            this.json[i].message = response.data.message
            this.currentPosition = i + 1
            if (this.currentPosition % 1000 == 0) {
              console.log(`imported in ${this.currentPosition} ${new Date().valueOf() - start}ms`)
            }
            if (this.continue) {
              continue
            } else {
              break
            }
          } catch (error) {
            if (this.currentPosition % 1000 == 0) {
              console.log(`imported in ${this.currentPosition} ${new Date().valueOf() - start}ms`)
            }
            console.log(error.response)
            this.currentPosition = i + 1
            this.json[i].statusImport = error.response.data.statusImport
            this.json[i].message = error.response.data.message
            this.importErrorMessage = error.response.data.message
            this.importError = true

            if (this.continueAll) {
              continue
            } else {
              break
            }
          }
        }
        // this.loadSaleProduct()
        this.selectCategory()
        console.log(`imported in ${new Date().valueOf() - start}ms`)
      }
    },
    resetImportError() {
      this.importError = false
      this.importErrorMessage = ''
    },

    resetImportState() {
      this.resetImportError()
      this.backupI = 0
      this.currentPosition = 0
      this.continueAll = false
      this.continue = true
      this.json = []
    },
    continueImportState() {
      this.continue = true
      this.executeImport()
    },
    pauseImportState() {
      this.continue = false
    },

    // new import method end

    // =======================================================================================
    // =                                                                                     =
    // =                                                                                     =
    // =                                                                                     =
    // =======================================================================================

    // categories
    requestCategories() {
      const { token } = JSON.parse(localStorage.getItem('auth'))
      const headers = {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      }
      const url = `${apiBaseUrl}/api/product-categories`
      const config = {
        headers: headers,
        method: 'GET',
        url: url,
      }
      return Axios(config)
    },

    async setCategories() {
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await this.requestCategories()
        this.categories = result.data.productCategories
        this.category = result.data.productCategories[0]
        this.loadSaleProduct()
      }
    },
    selectCategory() {
      this.pageProduct = 1
      this.productCountAll = 0
      this.loadSaleProduct()
    },

    // categories END

    downloadTemplateProduct() {
      // let templates = this.products // currently cannot provide data becouse overloading the server
      let templates = [] // use empty array instead

      let template2DArrayHeader = []
      let template2DArrayBody = []
      console.log('templates', templates)

      if (templates.length > 0) {
        templates = templates.map((element) => ({
          customerId: element.customerId,
          productPartCode: element.productPartCode,
          price: element.price,
          lowestPrice: element.lowestPrice,
          highestPrice: element.highestPrice,
          stock: element.stock,
          isSale: element.isSale ? 1 : 0,
        }))
      } else {
        templates = [
          {
            customerId: '',
            productPartCode: '',
            price: 0,
            lowestPrice: 0,
            highestPrice: 0,
            stock: 0,
            isSale: 0,
          },
        ]
      }
      for (const header in templates[0]) {
        template2DArrayHeader.push(header)
      }
      template2DArrayBody = templates.map((element) => template2DArrayHeader.map((item) => element[item]))

      const template2DArray = [template2DArrayHeader, ...template2DArrayBody]
      console.log(template2DArrayHeader)
      console.log(template2DArrayBody)
      console.log(template2DArray)

      let CsvString = ''
      template2DArray.forEach(function(RowItem) {
        RowItem.forEach(function(ColItem) {
          CsvString += ColItem + separator
        })
        CsvString += '\r\n'
      })
      CsvString = 'data:application/csv,' + encodeURIComponent(CsvString)
      let x = document.createElement('A')
      x.setAttribute('href', CsvString)
      x.setAttribute('download', 'dealer-products-template.csv')
      document.body.appendChild(x)
      x.click()
    },
    async loadProduct() {
      // for template data
      const requestUnit = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        const customerId = currentUser.customerId
        const url = `${apiBaseUrl}/api/products?customerId=${customerId}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        const result = await Axios(config)
        this.products = result.data.products.map((product, index) => ({
          ...product,
          index,
          isSale: product.isSale.toString(),
        }))
      }
      console.log(this.products)
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestUnit()
      }
    },
    // downloadTemplateProduct() {
    //   Axios;
    //   const fileUrl =
    //     'http://api.astra.develop:3000/uploads/templates/master-products.xlsx';
    //   location.href = fileUrl;
    // },
    onPickFileCsv() {
      this.$refs.fileInputCsv.click()
    },
    onCsvFilePicked(event) {
      const files = event.target.files
      let filename = files[0].name
      if (filename.lastIndexOf('.') <= 0) {
        return alert('Please add a valid file!')
      }
      const fileReader = new FileReader()
      fileReader.addEventListener('load', () => {
        this.csvUrl = fileReader.result
      })
      fileReader.readAsDataURL(files[0])
      this.csv = files[0]
      this.csvName = files[0].name + ' ' + this.fileSize(files[0].size)
      console.log(files[0])

      this.csvErrorMessage = ''
    },
    openDialogImportProduct() {
      this.dialogImportProduct = true
    },
    closeDialogImportProduct() {
      this.isProgressImport = false
      this.dialogImportProduct = false
      this.csvUrl = ''
      this.csv = null
      this.csvName = ''
    },
    async importCsv() {
      const requestImport = async (csv) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data',
        }
        let data = new FormData()
        data.append('csv', csv)
        const url = `${apiBaseUrl}/api/products/bulk-dealer`
        const config = {
          headers: headers,
          method: 'POST',
          url: url,
          data: data,
        }
        try {
          return await Axios(config)
        } catch (error) {
          throw new Error(error)
        }
      }
      if (this.csv) {
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          return requestImport(this.csv)
        }
      } else {
        this.csvErrorMessage = 'No csv file picked / selected!'
        throw new Error('invalid file!')
      }
    },
    // submitImport() {
    //   this.isProgressImport = true
    //   this.importCsv()
    //     .then((result) => {
    //       this.isProgressImport = false
    //       console.log(result)
    //       this.successAlert('Import success')
    //       this.loadSaleProduct()
    //       this.loadProduct()
    //       this.closeDialogImportProduct()
    //     })
    //     .catch((error) => {
    //       this.errorAlert(error)
    //     })
    // },
    fileSize(size) {
      if (size >= 1024 && size < 1024 * 1024) {
        let newSize = size / 1024
        newSize = this.roundUp(newSize, 2)
        return `(${newSize} KB)`
      } else if (size >= 1024 * 1024) {
        let newSize = size / (1024 * 1024)
        newSize = this.roundUp(newSize, 2)
        return `(${newSize} MB)`
      }
    },
    // =======================================================================================
    // =                                                                                     =
    // =                                                                                     =
    // =                                                                                     =
    // =======================================================================================
    async saveUpdate() {
      try {
        const products = []
        // this.saleItems.forEach((el) => {
        //   el.products.forEach((childEl) => {
        //     products.push({
        //       _id: childEl._id,
        //       isSale: childEl.isSale,
        //       stock: +childEl.stock,
        //     })
        //   })
        // })

        const saleItem = this.saleItems[0]
        saleItem.masterProductId.forEach((master) => {
          products.push({
            _id: master.dealerProduct[0]._id,
            isSale: master.dealerProduct[0].isSale,
            stock: +master.dealerProduct[0].stock,
          })
        })

        const userId = this.currentUser._id

        const result = await this.requestUpdateProducts(userId, products)
        console.log(result.data)
        this.successAlert('Product updated')
        this.loadSaleProduct()
      } catch (error) {
        this.errorAlert(error)
      }
    },
    requestUpdateProducts(userId, products) {
      const { token } = JSON.parse(localStorage.getItem('auth'))
      const headers = {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      }
      const data = products
      const url = `${apiBaseUrl}/api/sale-items/${userId}`
      const config = {
        headers: headers,
        method: 'PUT',
        url: url,
        data: data,
      }
      return Axios(config)
    },
    isSaleCategoryProduct(index) {
      this.saleItems[index].masterProductId.forEach((master) => {
        master.dealerProduct[0].isSale = this.saleItems[index].isSale
      })
    },
    showProduct(item) {
      if (item.show == true) {
        item.show = false
      } else {
        item.show = true
      }
    },
    async loadSaleProduct() {
      const requestProduct = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const user = JSON.parse(localStorage.getItem('currentUser'))
        const customerId = user.customerId
        const result = await Axios({
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          method: 'GET',
          url: `${apiBaseUrl}/api/sale-items?categoryId=${this.category._id}&customerId=${customerId}&page=${this.pageProduct}&count=${this.productCount}`,
        })

        this.saleItems = result.data.categories.map((category) => ({
          ...category,
          show: true,
          isShowAll: false,
          showProducts: category.masterProductId.slice(0, 4),
          isSale:
            category.masterProductId.filter((masterProduct) => masterProduct.dealerProduct[0].isSale == false).length >
            0
              ? false
              : true,
        }))
        this.productCountAll = result.data.productCount
        console.log('pageProduct', this.pageProduct)
        console.log('productCountAll', this.productCountAll)
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        return requestProduct()
      }
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
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
  },
  components: {
    Navbar,
    VClamp,
  },
  mixins: [numberWithPeriod, roundUp],
  watch: {
    myAlphaNumField(newVal) {
      let re = /[^A-Z0-9]/gi
      this.$set(this, 'myAlphaNumField', newVal.replace(re, ''))
    },
    pageProduct: function() {
      this.loadSaleProduct()
    },
  },
}
</script>
