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
          <v-toolbar-title>Master Product</v-toolbar-title>
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
        <v-alert
          style="z-index:1000"
          v-model="success"
          :value="success"
          transition="scale-transition"
          dismissible
          type="success"
        >{{ successMessage }}</v-alert>
        <v-alert
          style="z-index:1000"
          v-model="error"
          :value="error"
          transition="scale-transition"
          dismissible
          type="error"
        >{{ errorMessage }}</v-alert>

        <template>
          <v-data-table
            :headers="headers"
            :items="masterProducts"
            sort-by="index"
            class="elevation-1"
            :loading="loadingMasterProduct"
            :page.sync="page"
            :options.sync="options"
            :server-items-length="serverItemLength"
            :items-per-page.sync="perPage"
          >
            <!-- @page-count="perPage = $event" -->
            <template v-slot:top>
              <v-card flat class="px-3 py-3">
                <v-row>
                  <v-col class="py-0" cols="12" lg="6" md="6" sm="12">
                    <v-text-field
                      v-on:keyup.13="loadMasterProduct"
                      outlined
                      v-model="search"
                      dense
                      color="primary_red_1"
                      label="Search"
                    >
                      <template v-slot:append>
                        <v-btn @click="loadMasterProduct" small text color="primary_grey_1">
                          <v-icon>mdi-magnify</v-icon>
                        </v-btn>
                      </template>
                    </v-text-field>
                  </v-col>
                  <v-col class="py-0" cols="12" lg="6" md="6" sm="12">
                    <v-layout justify-end>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn
                            v-on="on"
                            :disabled="masterProductImport.isImporting"
                            :dark="!masterProductImport.isImporting"
                            color="primary_red_1"
                            class="ml-2 mb-1"
                            @click="importDialog = true"
                          >
                            <v-progress-circular
                              v-if="masterProductImport.isImporting"
                              class="mr-2"
                              :size="20"
                              :width="3"
                              color="primary_red_1"
                              indeterminate
                            ></v-progress-circular>
                            <!-- {{ masterProductImport.isImporting ? 'Importing' : `Import csv` }} -->
                            <v-icon>mdi-file-import</v-icon>
                          </v-btn>
                        </template>
                        <span>Import CSV</span>
                      </v-tooltip>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn
                            v-on="on"
                            class="ml-2 mb-1"
                            color="primary_red_1"
                            dark
                            @click="dialogMonitoringImport = true"
                          >
                            <v-icon>mdi-progress-upload</v-icon>
                          </v-btn>
                        </template>
                        <span>Import Progress</span>
                      </v-tooltip>

                      <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn
                            v-on="on"
                            class="ml-2 mb-1"
                            color="primary_red_1"
                            dark
                            @click="dialog = true"
                          >
                            <!-- New Product -->
                            <v-icon>mdi-plus-box</v-icon>
                          </v-btn>
                        </template>
                        <span>New Product</span>
                      </v-tooltip>

                      <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn
                            v-on="on"
                            class="ml-2 mb-1"
                            color="primary_red_1"
                            dark
                            @click="expandHeader"
                          >
                            <v-icon>mdi-arrow-expand</v-icon>
                          </v-btn>
                        </template>
                        <span>Expand Table</span>
                      </v-tooltip>
                    </v-layout>
                  </v-col>
                </v-row>
              </v-card>
            </template>
            <template v-slot:item.index="{ item }">
              <div>{{ item.index + 1 }}</div>
            </template>
            <template v-slot:item.price="{ item }">
              <v-layout justify-end>
                {{
                numberWithPeriod({
                currency: 'Rp',
                separator: '.',
                number: item.price,
                })
                }}
              </v-layout>
            </template>
            <template v-slot:item.lowestPrice="{ item }">
              <v-layout justify-end>
                {{
                numberWithPeriod({
                currency: 'Rp',
                separator: '.',
                number: item.lowestPrice,
                })
                }}
              </v-layout>
            </template>
            <template v-slot:item.highestPrice="{ item }">
              <v-layout justify-end>
                {{
                numberWithPeriod({
                currency: 'Rp',
                separator: '.',
                number: item.highestPrice,
                })
                }}
              </v-layout>
            </template>
            <template v-slot:item.image[0].image="{ item }">
              <v-layout justify-end>
                <v-avatar tile>
                  <v-img :alt="lazyImg" :src="apiImage(item.image[0].image)" aspect-ratio="3"></v-img>
                </v-avatar>
              </v-layout>
            </template>
            <template v-slot:item.action="{ item }">
              <div class="no-services">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on" small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
                  </template>
                  <span>Edit</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on" small @click="deleteItem(item)">mdi-delete</v-icon>
                  </template>
                  <span>Delete</span>
                </v-tooltip>
              </div>
            </template>
          </v-data-table>
          <!-- <div class="text-center pt-2">
            <v-pagination v-model="page" total-visible="7" :length="serverItemLength"></v-pagination>
            <v-text-field
              :value="perPage"
              label="Items per page"
              type="number"
              min="-1"
              max="15"
              @input="perPage = parseInt($event, 10)"
            ></v-text-field>
          </div>-->
        </template>
      </v-container>
    </v-content>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-row>
                <v-img
                  v-if="image == null && editedIndex !== -1"
                  :src="apiImage(editedItem.image[0].image)"
                ></v-img>
                <v-img v-if="image != null" :src="imageUrl"></v-img>
              </v-row>
              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field v-model="editedItem.name" :rules="nameRules" label="Name"></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.localShopName"
                    :rules="localShopNameRules"
                    label="Nama Bengkel"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.price"
                    :rules="priceRules"
                    label="Price"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.lowestPrice"
                    :rules="lowestPriceRules"
                    label="Lowest Price"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.highestPrice"
                    :rules="highestPriceRules"
                    label="Highest Price"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-select
                    :items="productBrands"
                    v-model="editedItem.productBrandId"
                    :rules="productBrandIdRules"
                    item-text="name"
                    label="Product Brand Id"
                    return-object
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-select
                    :items="productCategories"
                    v-model="editedItem.productCategoryId"
                    :rules="productCategoryIdRules"
                    item-text="name"
                    label="Product Category Id"
                    return-object
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.partCode"
                    :rules="partCodeRules"
                    label="Part Code"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.sellersCount"
                    :rules="sellerCountRules"
                    label="Seller Count"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-select
                    :items="units"
                    v-model="editedItem.unitId"
                    :rules="unitIdRules"
                    item-text="name"
                    label="Unit Id"
                    return-object
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.description"
                    :rules="descriptionRules"
                    label="Description"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.vehicleType"
                    :rules="vehicleTypeRules"
                    label="Vehicle Type"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12" class="pb-1">
                  <v-btn dark color="primary_red_1" @click="onPickFile">image</v-btn>
                  <input
                    type="file"
                    ref="fileInput"
                    style="display:none"
                    @change="onFilePicked"
                    accept="image/*"
                  />
                </v-col>
                <v-col cols="12" sm="12" md="12" class="py-0">
                  <div class="primary_red_1--text caption">{{ imageErrorMessage }}</div>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeEditOrNew">Cancel</v-btn>
          <v-btn color="green darken-1" text @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Delete Item</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <div>Are you sure want do delete this item?</div>
              <div class="font-weight-bold">{{ item.name }}</div>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="red darken-1" @click="confirmDelete" text>Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- import csv master product ======================================================== -->
    <v-dialog v-model="importDialog" max-width="500px">
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
                  @click="downloadTemplateMasterProduct"
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
          <v-btn outlined color="blue darken-1" @click="closeImport">Cancel</v-btn>
          <v-btn outlined color="success darken-1" @click="submitImport">Import</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- import csv master product END ======================================================== -->
    <!-- dialog monitoring import -->
    <v-dialog v-model="dialogMonitoringImport" max-width="900px">
      <v-card>
        <v-card-title>
          <span class="headline">Import Master Product</span>
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
.tf {
  max-width: 40px;
}
.no-services {
  white-space: nowrap;
}
</style>
<script>
import lazyImg from '../../assets/lazy-img.jpg'
import Navbar from '../../components/Navbar'
import { checkTokenExp } from '../../services'
import Axios from 'axios'
import { apiBaseUrl } from '../../api'
import numberWithPeriod from '../../mixins/numberWithPeriod'
import roundUp from '../../mixins/roundUp'
import FormData from 'form-data'
import firebase from '../../api/firebase'
import { separator } from '../../services/csvConfig'
export default {
  mounted() {
    Promise.all([
      this.importStatus(),
      this.loadMasterProduct(),
      this.loadUnit(),
      this.loadProductBrand(),
      this.loadProductCategory(),
    ]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    search: '',
    csvUrl: '',
    csv: null,
    csvName: '',
    csvErrorMessage: '',
    importDialog: false,
    isProgressImport: false,

    image: null,
    imageUrl: '',
    imageErrorMessage: '',

    valid: true,
    nameRules: [(v) => !!v || 'Name is required'],
    localShopNameRules: [(v) => !!v || 'Local shop name is required'],
    priceRules: [(v) => !!v || 'Price is required'],
    lowestPriceRules: [(v) => !!v || 'Lowest price is required'],
    highestPriceRules: [(v) => !!v || 'Highest price is required'],
    productBrandIdRules: [(v) => !!v || 'Product Brand is required'],
    productCategoryIdRules: [(v) => !!v || 'Product Brand is required'],
    partCodeRules: [(v) => !!v || 'Part code is required'],
    sellerCountRules: [(v) => v > -1 || 'Seller Count is required'],
    unitIdRules: [(v) => !!v || 'Unit is required'],
    descriptionRules: [(v) => !!v || 'description is required'],
    vehicleTypeRules: [(v) => !!v || 'vehicle type is required'],

    success: false,
    error: false,
    errorMessage: '',
    successMessage: '',
    item: {},
    productBrands: [],
    productCategories: [],
    units: [],
    select: ['Vuetify', 'Programming'],
    items: ['Programming', 'Design', 'Vue', 'Vuetify'],
    isLoading: true,
    skeletonLoaderItem: [0, 1, 2, 3, 4],
    lazyImg: lazyImg,
    dialog: false,
    deleteDialog: false,
    headers: [
      // { text: 'No', value: 'index' },
      { text: 'Name', value: 'name' },
      { text: 'Nama Bengkel', value: 'localShopName' },
      { text: 'Price', value: 'price' },
      // { text: 'Lowest Price', value: 'lowestPrice' },
      // { text: 'Highest Price', value: 'highestPrice' },
      // { text: 'Product Brand Id', value: 'productBrandId.name' },
      // { text: 'Product Category Id', value: 'productCategoryId.name' },
      // { text: 'Part Code', value: 'partCode' },
      // { text: 'Seller Count', value: 'sellersCount' },
      // { text: 'Unit Id', value: 'unitId.name' },
      // { text: 'Description', value: 'description' },
      // { text: 'Image', value: 'image[0].image' },
      { text: 'Actions', value: 'action', sortable: false },
    ],
    toggleHeader: true,
    editedIndex: -1,
    editedItem: {
      _id: '',
      name: '',
      localShopName: '',
      price: 0,
      lowestPrice: 0,
      highestPrice: 0,
      productCategoryId: null,
      productBrandId: null,
      partCode: '',
      unitId: null,
      description: '',
    },
    defaultItem: {
      _id: '',
      name: '',
      localShopName: '',
      price: 0,
      lowestPrice: 0,
      highestPrice: 0,
      productCategoryId: null,
      productBrandId: null,
      partCode: '',
      unitId: null,
      description: '',
    },
    masterProducts: [],
    tempDelete: 0,
    masterProductImport: {
      name: 'master-product',
      isImporting: false,
    },

    // new import method
    json: [],
    backupI: 0,
    currentPosition: 0,
    continueAll: false,
    continue: true,
    importError: false,
    importErrorMessage: '',
    jsonHeaders: [
      { text: 'no', value: 'no' },
      { text: 'partCode', value: 'partCode' },
      { text: 'name', value: 'name' },
      { text: 'localShopName', value: 'localShopName' },
      { text: 'description', value: 'description' },
      { text: 'price', value: 'price' },
      { text: 'lowestPrice', value: 'lowestPrice' },
      { text: 'highestPrice', value: 'highestPrice' },
      { text: 'productCategory', value: 'productCategory' },
      { text: 'unit', value: 'unit' },
      { text: 'productBrand', value: 'productBrand' },
      { text: 'vehicleType', value: 'vehicleType' },
      { text: 'statusImport', value: 'statusImport' },
      { text: 'message', value: 'message' },
    ],
    dialogMonitoringImport: false,

    page: 1,
    perPage: 10,
    loadingMasterProduct: false,
    options: {},
    serverItemLength: 0,
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Product' : 'Edit Product'
    },
  },

  watch: {
    dialog(val) {
      val || this.closeEditOrNew()
    },
    options: {
      handler() {
        this.loadMasterProduct()
      },
      deep: true,
    },
  },

  created() {
    // this.initialize();
  },

  methods: {
    // new import method
    downloadImportReport() {
      let templates = this.json
      let template2DArrayHeader = []
      let template2DArrayBody = []
      console.log('templates', templates)
      if (templates.length > 0) {
        templates = templates.map((element) => ({
          partCode: element.partCode,
          name: element.name,
          localShopName: element.localShopName,
          description: element.description,
          price: element.price,
          lowestPrice: element.lowestPrice,
          highestPrice: element.highestPrice,
          productCategory: element.productCategory,
          unit: element.unit,
          productBrand: element.productBrand,
          vehicleType: element.vehicleType,
          statusImport: element.statusImport,
          message: element.message,
        }))
      } else {
        templates = [
          {
            partCode: '',
            name: '',
            localShopName: '',
            description: '',
            price: 0,
            lowestPrice: 0,
            highestPrice: 0,
            productCategory: '',
            unit: '',
            productBrand: '',
            vehicleType: '',
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
      x.setAttribute('download', 'import-report-master-products.csv')
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
      const url = `${apiBaseUrl}/api/master-products/import-master-product`
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
      const url = `${apiBaseUrl}/api/csv-parser/master-products`
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
        this.backupI = 0
        this.currentPosition = 0

        this.isProgressImport = true
        const response = await this.parsingCsv()
        this.isProgressImport = false
        this.importDialog = false
        console.log(response.data)
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
    async importStatus() {
      firebase
        .database()
        .ref('import-job')
        .orderByChild('name')
        .equalTo('master-product')
        .on('value', (snapshot) => {
          console.log('master-product', snapshot.val())
          let masterProductImport
          for (const key in snapshot.val()) {
            masterProductImport = snapshot.val()[key]
          }
          this.masterProductImport = masterProductImport
          this.loadMasterProduct()
        })
    },
    expandHeader() {
      this.toggleHeader = !this.toggleHeader
      const smallHeader = [
        // { text: 'No', value: 'index' },
        { text: 'Name', value: 'name' },
        { text: 'Nama Bengkel', value: 'localShopName' },
        { text: 'Price', value: 'price' },
        // { text: 'Lowest Price', value: 'lowestPrice' },
        // { text: 'Highest Price', value: 'highestPrice' },
        // { text: 'Product Brand Id', value: 'productBrandId.name' },
        // { text: 'Product Category Id', value: 'productCategoryId.name' },
        // { text: 'Part Code', value: 'partCode' },
        // { text: 'Seller Count', value: 'sellersCount' },
        // { text: 'Unit Id', value: 'unitId.name' },
        // { text: 'Description', value: 'description' },
        // { text: 'Image', value: 'image[0].image' },
        { text: 'Actions', value: 'action', sortable: false },
      ]
      const expandedHeader = [
        { text: 'No', value: 'index' },
        { text: 'Name', value: 'name' },
        { text: 'Nama Bengkel', value: 'localShopName' },
        { text: 'Price', value: 'price' },
        { text: 'Lowest Price', value: 'lowestPrice' },
        { text: 'Highest Price', value: 'highestPrice' },
        { text: 'Product Brand Id', value: 'productBrandId.name' },
        { text: 'Product Category Id', value: 'productCategoryId.name' },
        { text: 'Part Code', value: 'partCode' },
        { text: 'Seller Count', value: 'sellersCount' },
        { text: 'Unit Id', value: 'unitId.name' },
        { text: 'Description', value: 'description' },
        { text: 'Image', value: 'image[0].image' },
        { text: 'Actions', value: 'action', sortable: false },
      ]
      this.toggleHeader ? (this.headers = smallHeader) : (this.headers = expandedHeader)
    },
    downloadTemplateMasterProduct() {
      // let templates = this.masterProducts // previously includes all data, but overload the server
      let templates = [] // use empty array instead, cons, no data provided that can be use or editing on excel
      let template2DArrayHeader = []
      let template2DArrayBody = []

      if (templates.length > 0) {
        templates = templates.map((element) => ({
          partCode: element.partCode,
          name: element.name,
          localShopName: element.localShopName,
          description: element.description,
          price: element.price,
          lowestPrice: element.lowestPrice,
          highestPrice: element.highestPrice,
          productCategory: element.productCategoryId.name,
          unit: element.unitId.name,
          productBrand: element.productBrandId.name,
          vehicleType: element.vehicleType,
        }))
      } else {
        templates = [
          {
            partCode: '',
            name: '',
            localShopName: '',
            description: '',
            price: 0,
            lowestPrice: 0,
            highestPrice: 0,
            productCategory: '',
            unit: '',
            productBrand: '',
            vehicleType: '',
          },
        ]
      }

      for (const header in templates[0]) {
        template2DArrayHeader.push(header)
      }

      template2DArrayBody = templates.map((element) => template2DArrayHeader.map((item) => element[item]))

      const template2DArray = [template2DArrayHeader, ...template2DArrayBody]
      // console.log(template2DArrayHeader);
      // console.log(template2DArrayBody);
      // console.log(template2DArray);

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
      x.setAttribute('download', 'master-product-template.csv')
      document.body.appendChild(x)
      x.click()
    },
    onPickFile() {
      this.$refs.fileInput.click()
    },
    onFilePicked(event) {
      const files = event.target.files
      let filename = files[0].name
      if (filename.lastIndexOf('.') <= 0) {
        return alert('Please add a valid file!')
      }
      const fileReader = new FileReader()
      fileReader.addEventListener('load', () => {
        this.imageUrl = fileReader.result
      })
      fileReader.readAsDataURL(files[0])
      this.image = files[0]

      this.imageErrorMessage = ''
    },
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
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
    closeImport() {
      this.importDialog = false
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
        const url = `${apiBaseUrl}/api/master-products/bulk`
        const config = {
          headers: headers,
          method: 'POST',
          url: url,
          data: data,
        }
        try {
          Axios.defaults.timeout = 1000 * 60 * 10
          return await Axios({ ...config, timeout: 1000 * 60 * 10 })
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

    validate() {
      return this.$refs.form.validate()
    },
    resetForm() {
      this.$refs.form.reset()
    },
    resetValidation() {
      this.$refs.form.resetValidation()
    },

    async updateMasterProduct() {
      const requestUpdate = async (masterProduct) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const data = masterProduct
        const url = `${apiBaseUrl}/api/master-products/${masterProduct._id}`
        const config = {
          headers: headers,
          method: 'PUT',
          url: url,
          data: data,
        }
        try {
          return await Axios(config)
        } catch (error) {
          throw new Error(error)
        }
      }
      const validate = this.validate()
      if (validate) {
        const masterProduct = {
          _id: this.editedItem._id,
          name: this.editedItem.name,
          localShopName: this.editedItem.localShopName,
          price: this.editedItem.price,
          lowestPrice: this.editedItem.lowestPrice,
          highestPrice: this.editedItem.highestPrice,
          productBrandId: this.editedItem.productBrandId._id,
          productCategoryId: this.editedItem.productCategoryId._id,
          partCode: this.editedItem.partCode,
          sellersCount: this.editedItem.sellersCount,
          unitId: this.editedItem.unitId._id,
          description: this.editedItem.description,
          vehicleType: this.editedItem.vehicleType,
        }
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          return requestUpdate(masterProduct)
        }
      } else {
        throw new Error('invalid input!')
      }
    },
    async saveNewMasterProduct() {
      const requestSaveNew = async (masterProduct, image) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data',
        }
        let data = new FormData()
        data.append('name', masterProduct.name)
        data.append('localShopName', masterProduct.localShopName)
        data.append('partCode', masterProduct.partCode)
        data.append('price', masterProduct.price)
        data.append('lowestPrice', masterProduct.lowestPrice)
        data.append('highestPrice', masterProduct.highestPrice)
        data.append('productBrandId', masterProduct.productBrandId)
        data.append('productCategoryId', masterProduct.productCategoryId)
        data.append('sellersCount', masterProduct.sellersCount)
        data.append('unitId', masterProduct.unitId)
        data.append('description', masterProduct.description)
        data.append('vehicleType', masterProduct.vehicleType)
        data.append('image', image)
        const url = `${apiBaseUrl}/api/master-products`
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
      const validate = this.validate()
      if (this.image && validate) {
        const masterProduct = {
          name: this.editedItem.name,
          localShopName: this.editedItem.localShopName,
          price: this.editedItem.price,
          lowestPrice: this.editedItem.lowestPrice,
          highestPrice: this.editedItem.highestPrice,
          productBrandId: this.editedItem.productBrandId._id,
          productCategoryId: this.editedItem.productCategoryId._id,
          sellersCount: this.editedItem.sellersCount,
          partCode: this.editedItem.partCode,
          unitId: this.editedItem.unitId._id,
          description: this.editedItem.description,
        }
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          return requestSaveNew(masterProduct, this.image)
        }
      } else {
        this.imageErrorMessage = 'image is required'
        throw new Error('invalid input!')
      }
    },
    successAlert(message) {
      this.successMessage = message
      this.success = true
      // setTimeout(() => {
      //   this.success = false
      // }, 5000)
    },
    errorAlert(message) {
      this.errorMessage = message
      this.error = true
      // setTimeout(() => {
      //   this.error = false
      // }, 5000)
    },
    async loadUnit() {
      const requestUnit = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/units`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        const result = await Axios(config)
        this.units = result.data.units
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestUnit()
      }
    },
    async loadProductCategory() {
      const requestProductCategory = async () => {
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
        const result = await Axios(config)
        this.productCategories = result.data.productCategories
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestProductCategory()
      }
    },
    async loadProductBrand() {
      const requestProductBrand = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/product-brands`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        const result = await Axios(config)
        this.productBrands = result.data.productBrands
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestProductBrand()
      }
    },

    async loadMasterProduct() {
      this.loadingMasterProduct = true
      const requestMasterProduct = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/master-products?keyword=${this.search}&page=${this.page}&perPage=${this.perPage}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await requestMasterProduct()
        this.masterProducts = result.data.masterProducts.map((masterProduct, index) => ({ ...masterProduct, index }))

        this.serverItemLength = result.data.count

        this.loadingMasterProduct = false
        console.log('master product', this.page)
        console.log('master product data', result.data)
      }
    },
    editItem(item) {
      this.editedIndex = this.masterProducts.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem(item) {
      this.item = item
      this.deleteDialog = true
    },
    confirmDelete() {
      const index = this.masterProducts.indexOf(this.item)
      this.masterProducts.splice(index, 1)
      this.masterProducts = this.masterProducts.map((masterProduct, index) => ({
        ...masterProduct,
        index,
      }))
      this.deleteMasterProduct()
      this.closeDelete()
    },
    async deleteMasterProduct() {
      const masterProduct = { ...this.item }
      const requestDelete = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/master-products/${masterProduct._id}`
        const config = {
          headers: headers,
          method: 'DELETE',
          url: url,
        }
        try {
          const result = await Axios(config)
          this.successAlert('Deleted')
          return result
        } catch (error) {
          this.errorAlert(error)
          throw new Error(error)
        }
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestDelete()
      }
    },
    async searchDataTable() {
      console.log('searching')
      const requestSearch = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/master-products?keyword=${this.search}&page=${this.page}&perPage=${this.perPage}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await requestSearch()
        this.masterProducts = result.data.masterProducts.map((masterProduct, index) => ({
          index,
          ...masterProduct,
        }))
      }
    },
    resetErrorMessage() {
      this.imageErrorMessage = ''
    },
    closeEditOrNew() {
      this.dialog = false
      this.resetErrorMessage()
      this.image = null
      this.resetValidation()
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
    closeDelete() {
      this.deleteDialog = false
    },
    save() {
      if (this.editedIndex > -1) {
        // edit
        this.updateMasterProduct()
          .then(() => {
            // Object.assign(
            //   this.masterProducts[this.editedIndex],
            //   this.editedItem,
            // );
            this.successAlert('Updated')
            this.loadMasterProduct()
            this.closeEditOrNew()
          })
          .catch((error) => {
            this.errorAlert(error)
          })
      } else {
        //add new
        this.saveNewMasterProduct()
          .then(() => {
            this.successAlert('Added')
            this.loadMasterProduct()
            this.closeEditOrNew()
          })
          .catch((error) => {
            this.errorAlert(error)
          })
      }
    },
  },
  components: {
    Navbar,
  },

  mixins: [numberWithPeriod, roundUp],
}
</script>
