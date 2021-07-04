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
          <v-toolbar-title>Product</v-toolbar-title>
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
        <v-row>
          <v-col cols="12" sm="12" md="12">
            <v-card class="px-3 pt-3">
              <v-form ref="formUser" v-model="validUser" lazy-validation>
                <v-select
                  dense
                  outlined
                  :items="users"
                  @change="loadProduct"
                  v-model="selectedUser"
                  item-text="name"
                  label="Dealer"
                  return-object
                  color="primary_red_1"
                  :rules="selectedUserRules"
                ></v-select>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
        <template>
          <v-data-table
            loading-text="loading products..."
            :loading="isLoadingProduct"
            :headers="headers"
            :items="products"
            sort-by="index"
            class="elevation-1"
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
                      v-on:keyup.enter="loadProduct"
                      outlined
                      v-model="keyword"
                      dense
                      color="primary_red_1"
                      label="Search"
                    >
                      <template v-slot:append>
                        <v-btn @click="loadProduct" small text color="primary_grey_1">
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
                            :disabled="productImport.isImporting"
                            :dark="!productImport.isImporting"
                            class="ml-2 mb-1"
                            @click="openDialogImportProduct"
                            color="primary_red_1"
                          >
                            <v-progress-circular
                              v-if="productImport.isImporting"
                              class="mr-2"
                              :size="20"
                              :width="3"
                              color="primary_red_1"
                              indeterminate
                            ></v-progress-circular>
                            <!-- {{ productImport.isImporting ? 'Importing' : 'import csv' }} -->
                            <v-icon>mdi-file-import</v-icon>
                            <!-- <v-icon>mdi-database-import</v-icon> -->
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

                      <!-- <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn
                            v-on="on"
                            class="ml-2 mb-1"
                            color="primary_red_1"
                            dark
                            @click="openDialogMasterProduct"
                          >
                            <v-icon>mdi-plus-box</v-icon>
                          </v-btn>
                        </template>
                        <span>New Product</span>
                      </v-tooltip>-->

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
            <template v-slot:item.isSale="{ item }">
              <v-chip
                @click="deleteItem(item)"
                class="mx-1"
                small
                :color="item.isSale == 'true' ? 'success' : 'primary_red_1'"
                dark
              >{{ item.isSale }}</v-chip>
            </template>
            <template
              v-slot:item.masterProductId.image[0].image="{
                item,
              }"
            >
              <v-img aspect-ratio="1" :src="apiImage(item.masterProductId.image[0].image)"></v-img>
            </template>
            <template v-slot:item.stock="{ item }">
              <div :class="item.stock == 0 ? 'primary_red_1--text' : ''">{{ item.stock }}</div>
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

            <template v-slot:item.action="{ item }">
              <div class="no-services">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on" small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
                  </template>
                  <span>Edit</span>
                </v-tooltip>
                <!-- <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on" small @click="deleteItem(item)">mdi-delete</v-icon>
                  </template>
                  <span>Delete</span>
                </v-tooltip>-->
              </div>
            </template>
          </v-data-table>
        </template>
      </v-container>
    </v-content>

    <!-- add / udpate  -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    disabled
                    v-model="editedItem.name"
                    label="Master Product Name"
                    color="primary_red_1"
                    :rules="nameRules"
                  ></v-text-field>
                </v-col>
                <!-- <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.price"
                    label="Price"
                    type="number"
                    color="primary_red_1"
                    :rules="priceRules"
                  ></v-text-field>
                </v-col>-->
                <!-- <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.lowestPrice"
                    label="Lowest Price"
                    type="number"
                    color="primary_red_1"
                    :rules="lowestPriceRules"
                  ></v-text-field>
                </v-col>-->
                <!-- <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.highestPrice"
                    label="Highest Price"
                    type="number"
                    color="primary_red_1"
                    :rules="highestPriceRules"
                  ></v-text-field>
                </v-col>-->
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.stock"
                    label="Stock"
                    type="number"
                    color="primary_red_1"
                    :rules="stockRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-select
                    :items="['false', 'true']"
                    v-model="editedItem.isSale"
                    item-text="_id"
                    label="Is Sale"
                    return-object
                    color="primary_red_1"
                    :rules="isSaleRules"
                  ></v-select>
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
    <!-- add / update END -->

    <!-- delete -->
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
    <!-- delete END -->

    <!-- master -->
    <v-dialog v-model="dialogMasterProduct" max-width="1600px">
      <v-card>
        <v-card-title>
          <span class="headline">Master Product</span>
          <v-spacer></v-spacer>
          <v-btn @click="closeDialogMasterProduct" fab text dark small color="primary_red_1">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text>
          <v-container class="px-0 pb-0">
            <template>
              <v-data-table
                v-model="selected"
                show-select
                :headers="masterProductHeaders"
                :items="masterProducts"
                sort-by="index"
                class="elevation-1"
                :loading="loadingMasterProduct"
                :page.sync="pageMaster"
                :options.sync="optionsMaster"
                :server-items-length="serverItemLengthMaster"
                :items-per-page.sync="perPageMaster"
              >
                <template v-slot:top>
                  <v-card flat class="px-3 py-3">
                    <v-row>
                      <v-col class="py-0">
                        <v-text-field
                          v-on:keyup.13="searchDataTableMasterProduct"
                          outlined
                          v-model="searchMasterProduct"
                          dense
                          color="primary_red_1"
                          label="Search"
                        >
                          <template v-slot:append>
                            <v-btn
                              @click="searchDataTableMasterProduct"
                              small
                              text
                              color="primary_grey_1"
                            >
                              <v-icon>mdi-magnify</v-icon>
                            </v-btn>
                          </template>
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </v-card>
                </template>
                <template v-slot:item.index="{ item }">
                  <div>{{ item.index + 1 }}</div>
                </template>
                <template v-slot:item.stock="{ item }">
                  <v-text-field
                    class="mt-2"
                    dense
                    style="min-width:60px; max-width:100px"
                    outlined
                    type="number"
                    v-model="item.stock"
                  ></v-text-field>
                </template>
                <template v-slot:item.isSale="{ item }">
                  <v-select
                    style="min-width:80px"
                    :items="['false', 'true']"
                    v-model="item.isSale"
                    item-text="isSale"
                    label="Is Sale"
                    return-object
                    color="primary_red_1"
                  ></v-select>
                </template>
                <template v-slot:item.price="{ item }">
                  <v-text-field
                    class="mt-2"
                    dense
                    style="min-width:150px; max-width:200px"
                    outlined
                    type="number"
                    v-model="item.price"
                  ></v-text-field>
                </template>
                <template v-slot:item.lowestPrice="{ item }">
                  <v-text-field
                    class="mt-2"
                    dense
                    style="min-width:150px; max-width:200px"
                    outlined
                    type="number"
                    v-model="item.lowestPrice"
                  ></v-text-field>
                </template>
                <template v-slot:item.highestPrice="{ item }">
                  <v-text-field
                    class="mt-2"
                    dense
                    style="min-width:150px; max-width:200px"
                    outlined
                    type="number"
                    v-model="item.highestPrice"
                  ></v-text-field>
                </template>
                <template v-slot:item.image[0].image="{ item }">
                  <v-layout justify-end>
                    <v-avatar tile>
                      <v-img :alt="lazyImg" :src="apiImage(item.image[0].image)" aspect-ratio="3"></v-img>
                    </v-avatar>
                  </v-layout>
                </template>
              </v-data-table>
            </template>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-5">
          <v-spacer></v-spacer>
          <v-btn text color="blue darken-1" dark @click="closeDialogMasterProduct">Cancel</v-btn>
          <v-btn text @click="saveMasterProducts" color="success darken-1">save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- master END -->

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
                >
                  <v-progress-circular
                    v-if="isProgressDownloadTemplate"
                    :size="24"
                    :width="3"
                    color="primary_red_1"
                    indeterminate
                    class="mr-3"
                  ></v-progress-circular>download template
                </v-btn>
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
          >download import report</v-btn>
          <v-btn dark color="blue darken-1" @click="dialogMonitoringImport = false">close</v-btn>-->
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
</style>
<script>
import lazyImg from '../../assets/lazy-img.jpg'
import Navbar from '../../components/Navbar'
import { checkTokenExp } from '../../services'
import Axios from 'axios'
import { apiBaseUrl } from '../../api'
import roundUp from '../../mixins/roundUp'
import numberWithPeriod from '../../mixins/numberWithPeriod'
import firebase from '../../api/firebase'
import { separator } from '../../services/csvConfig'
export default {
  mounted() {
    Promise.all([
      this.loadMasterProduct(),
      this.importStatus(),
      this.loadUser(),
      //
    ]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
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
    productsAll: [],
    search: '',
    searchMasterProduct: '',
    selected: [],
    valid: true,
    validUser: true,
    masterProductIdRules: [
      (v) => !(Object.entries(v).length === 0 && v.constructor === Object) || 'Master Product is required',
    ],
    nameRules: [(v) => !!v || 'Name is required'],
    priceRules: [(v) => !!v || 'Price is required'],
    lowestPriceRules: [(v) => !!v || 'Lowest price is required'],
    highestPriceRules: [(v) => !!v || 'Highest price is required'],
    stockRules: [(v) => !!v || 'Stock is required'],
    selectedUserRules: [(v) => !!v || 'Dealer is required'],
    isSaleRules: [(v) => !!v || 'Is Sale is required'],

    success: false,
    error: false,
    errorMessage: '',
    successMessage: '',
    item: {},

    isLoading: true,
    skeletonLoaderItem: [0, 1, 2, 3, 4],
    lazyImg: lazyImg,
    dialog: false,
    deleteDialog: false,
    headers: [
      { text: 'Name', value: 'name' },
      { text: 'Nama Bengkel', value: 'localShopName' },
      { text: 'Price', value: 'price' },
      { text: 'Stock', value: 'stock' },
      { text: 'Part Code', value: 'productPartCode' },
      { text: 'Actions', value: 'action', sortable: false },
    ],
    toggleHeader: true,
    masterProductHeaders: [
      { text: 'No', value: 'index' },
      { text: 'Name', value: 'name' },
      { text: 'Stock', value: 'stock' },
      { text: 'Is Sale', value: 'isSale' },
      { text: 'Nama Bengkel', value: 'localShopName' },
      { text: 'Price', value: 'price' },
      { text: 'Lowest Price', value: 'lowestPrice' },
      { text: 'Highest Price', value: 'highestPrice' },
      { text: 'Product Brand Id', value: 'productBrandId.name' },
      { text: 'Product Category Id', value: 'productCategoryId.name' },
      { text: 'Part Code', value: 'partCode' },
      { text: 'Unit Id', value: 'unitId.name' },
      { text: 'Description', value: 'description' },
      { text: 'Image', value: 'image[0].image' },
    ],
    editedIndex: -1,
    editedItem: {
      _id: '',
      masterProductId: {},
      price: 0,
      lowestPrice: 0,
      highestPrice: 0,
      isSale: '',
      stock: 0,
    },
    defaultItem: {
      _id: '',
      masterProductId: {},
      price: 0,
      lowestPrice: 0,
      highestPrice: 0,
      isSale: '',
      stock: 0,
    },
    products: [],
    masterProducts: [],
    dealers: [],
    users: [],
    selectedUser: null,

    // import csv
    dialogMasterProduct: false,
    dialogImportProduct: false,
    csvUrl: '',
    csv: null,
    csvName: '',
    csvErrorMessage: '',
    backupProducts: [],
    productImport: {
      _id: '',
      name: 'product',
      isImporting: false,
    },

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

    serverItemLengthMaster: 0,
    loadingMasterProduct: false,
    optionsMaster: {},
    searchMaster: '',
    pageMaster: 1,
    perPageMaster: 10,
    keyword: '',
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
    csv: function(val) {
      this.csv = val
    },
    options: {
      handler() {
        if (this.selectedUser) {
          this.loadProduct()
        }
      },
      deep: true,
    },
    optionsMaster: {
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
      // const request = () => {
      //   const { token } = JSON.parse(localStorage.getItem('auth'))
      //   const headers = {
      //     Authorization: 'Bearer ' + token,
      //     'Content-Type': 'application/json',
      //   }
      //   const url = `${apiBaseUrl}/api/import-job-queues?name=product`
      //   const config = {
      //     headers: headers,
      //     method: 'GET',
      //     url: url,
      //   }
      //   return Axios(config)
      // }
      // const checkToken = await checkTokenExp()
      // if (checkToken === true) {
      //   const response = await request()
      //   const [productImport] = response.data.jobs
      //   if (productImport) {
      //     this.productImport = productImport
      //   }
      // }
      firebase
        .database()
        .ref('import-job')
        .orderByChild('name')
        .equalTo('product')
        .on('value', (snapshot) => {
          console.log('product', snapshot.val())
          let productImport
          for (const key in snapshot.val()) {
            productImport = snapshot.val()[key]
          }
          this.productImport = productImport
        })
    },
    expandHeader() {
      this.toggleHeader = !this.toggleHeader
      const smallHeader = [
        { text: 'Name', value: 'name' },
        { text: 'Nama Bengkel', value: 'localShopName' },
        { text: 'Price', value: 'price' },
        { text: 'Stock', value: 'stock' },
        { text: 'Part Code', value: 'productPartCode' },
        { text: 'Actions', value: 'action', sortable: false },
      ]
      const expandedHeader = [
        { text: 'No', value: 'index' },
        { text: 'Name', value: 'name' },
        { text: 'Customer Id', value: 'userCustomerId.customerId' },
        { text: 'Nama Bengkel', value: 'localShopName' },
        { text: 'Is Sale', value: 'isSale' },
        { text: 'Dealer', value: 'userCustomerId.name' },
        { text: 'Price', value: 'price' },
        { text: 'Lowest Price', value: 'lowestPrice' },
        { text: 'Highest Price', value: 'highestPrice' },
        { text: 'Stock', value: 'stock' },
        {
          text: 'Product Brand Id',
          value: 'productBrandId.name',
        },
        {
          text: 'Product Category Id',
          value: 'productCategoryId.name',
        },
        { text: 'Part Code', value: 'productPartCode' },
        { text: 'Unit Id', value: 'unitId.name' },
        { text: 'Description', value: 'description' },
        { text: 'Actions', value: 'action', sortable: false },
      ]
      this.toggleHeader ? (this.headers = smallHeader) : (this.headers = expandedHeader)
    },
    async downloadTemplateProduct() {
      this.isProgressDownloadTemplate = true
      // await this.loadProductAll() // set off retrieve all are overload the server
      // let templates = this.productsAll

      let templates = [] // set to empty array instead

      let template2DArrayHeader = []
      let template2DArrayBody = []
      console.log('templates', templates)
      if (templates.length > 0) {
        templates = templates.map((element) => ({
          // customerId: users.filter((item) => item._id == element.userId._id)[0].customerId,
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
      x.setAttribute('download', 'all-users-products-template.csv')
      document.body.appendChild(x)
      x.click()

      this.isProgressDownloadTemplate = false
    },
    async searchDataTableMasterProduct() {
      const requestSearch = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/master-products?keyword=${this.searchMasterProduct}`
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
        this.masterProducts = result.data.masterProducts.map((element, index) => ({
          ...element,
          index,
          isSale: true,
          stock: 0,
        }))
      }
    },

    searchDataTable() {
      // const search = this.search.toLowerCase()
      // const products = this.backupProducts
      // if (search.length > 0) {
      //   const newProducts = products.filter(
      //     (el) =>
      //       el.masterProductId.name.toLowerCase().match(search) ||
      //       el.masterProductId.partCode.toLowerCase().match(search) ||
      //       el.masterProductId.description.toLowerCase().match(search) ||
      //       el.masterProductId.localShopName.toLowerCase().match(search) ||
      //       el.masterProductId.price == +search,
      //   )
      //   this.products = newProducts
      // } else {
      //   this.products = this.backupProducts
      // }
    },
    onPickFileCsv() {
      this.$refs.fileInputCsv.click()
    },
    onCsvFilePicked(event) {
      this.$emit('change', event)
      const files = event.target.files
      console.log(event)
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

      this.csvErrorMessage = ''
    },
    openDialogImportProduct() {
      this.dialogImportProduct = true
    },
    closeDialogImportProduct() {
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
        const url = `${apiBaseUrl}/api/products/bulk`
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

    resetCsv() {
      this.csv = null
      this.csvName = ''
      this.csvUrl = ''
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
    stringToBoolean(bool) {
      if (bool == 'true') {
        return true
      } else {
        return false
      }
    },
    async saveMasterProduct(item) {
      const data = {
        userId: this.selectedUser._id,
        productPartCode: item.partCode,
        price: +item.price,
        lowestPrice: +item.lowestPrice,
        highestPrice: +item.highestPrice,
        isSale: item.isSale,
        stock: +item.stock,
      }
      await this.assignMasterProduct(data)
    },
    async saveMasterProducts() {
      try {
        const selected = this.selected
          .map((el) => this.masterProducts.find((elChild) => elChild.partCode == el.partCode))
          .map((el) => ({
            userId: this.selectedUser._id,
            customerId: this.selectedUser.customerId,
            productPartCode: el.partCode,
            price: +el.price,
            lowestPrice: +el.lowestPrice,
            highestPrice: +el.highestPrice,
            isSale: this.stringToBoolean(el.isSale),
            stock: +el.stock,
          }))

        const data = {
          userId: this.selectedUser._id,
          docs: selected,
        }
        await this.assignMasterProducts(data)
        this.closeDialogMasterProduct()
        this.loadProduct()
        this.successAlert('Products added')
        // console.log(data);
      } catch (error) {
        this.errorAlert(error)
      }
    },
    assignMasterProduct(masterProduct) {
      return masterProduct
      // const { token } = JSON.parse(localStorage.getItem('auth'));
      // const headers = {
      //   Authorization: 'Bearer ' + token,
      //   'Content-Type': 'application/json',
      // };
      // const data = masterProducts;
      // const url = `${apiBaseUrl}/api/products`;
      // const config = {
      //   headers: headers,
      //   method: 'POST',
      //   url: url,
      // };
      // return Axios(config);
    },
    async assignMasterProducts(masterProducts) {
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }

        const url = `${apiBaseUrl}/api/products/bulk`
        const config = {
          headers: headers,
          method: 'POST',
          url: url,
          data: masterProducts,
        }
        return Axios(config)
      }
    },
    validate() {
      return this.$refs.form.validate()
    },
    resetValidation() {
      this.$refs.form.resetValidation()
    },

    validateUser() {
      return this.$refs.formUser.validate()
    },
    resetValidationUser() {
      this.$refs.formUser.resetValidation()
    },
    async openDialogMasterProduct() {
      const validateUser = this.validateUser()
      if (validateUser) {
        await this.loadProduct()
        this.dialogMasterProduct = true
        this.masterProducts = this.masterProducts
          .map(
            (el) =>
              this.selected.find((elChild) => elChild.partCode == el.partCode) || {
                ...el,
                isSale: el.isSale.toString(),
              },
          )
          .map((el, index) => ({ ...el, index }))
      }
    },
    closeDialogMasterProduct() {
      this.dialogMasterProduct = false
    },
    async loadUser() {
      const requestUser = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/users?role=dealer`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return await Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await requestUser()
        this.users = result.data.users
      }
    },
    async loadMasterProduct() {
      const requestMasterProduct = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        // const url = `${apiBaseUrl}/api/master-products`
        const url = `${apiBaseUrl}/api/master-products?keyword=${this.searchMaster}&page=${this.pageMaster}&perPage=${this.perPageMaster}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return await Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await requestMasterProduct()

        this.masterProducts = result.data.masterProducts.map((element, index) => ({
          ...element,
          index,
          isSale: true,
          stock: 1,
        }))
        this.serverItemLengthMaster = result.data.count
      }
    },
    async updateProduct() {
      const requestUpdate = async (product) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const data = product
        const url = `${apiBaseUrl}/api/products/${product._id}`
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
        const product = {
          _id: this.editedItem._id,
          // price: +this.editedItem.masterProductId.price,
          // lowestPrice: +this.editedItem.masterProductId.lowestPrice,
          // highestPrice: +this.editedItem.masterProductId.highestPrice,
          isSale: this.stringToBoolean(this.editedItem.isSale),
          stock: +this.editedItem.stock,
        }
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          return requestUpdate(product)
        }
      } else {
        throw new Error('invalid input!')
      }
    },
    async saveNewProduct() {
      const requestSaveNew = async (product) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const data = product
        const url = `${apiBaseUrl}/api/products`
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
      if (validate) {
        const product = {
          // price: this.editedItem.masterProductId.price,
          // lowestPrice: this.editedItem.masterProductId.lowestPrice,
          // highestPrice: this.editedItem.masterProductId.highestPrice,
          partCode: this.editedItem.masterProductId.partCode,
          userId: this.editedItem.userId._id,
          stock: this.editedItem.stock,
        }
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          return requestSaveNew(product)
        }
      } else {
        throw new Error('invalid input!')
      }
    },
    async loadProduct() {
      console.log('load product')
      this.isLoadingProduct = true
      const requestProduct = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/products`
        const config = {
          params: {
            customerId: this.selectedUser.customerId,
            page: this.page,
            count: this.perPage,
            keyword: this.keyword,
          },
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }

      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await requestProduct()
        console.log(result)
        this.products = result.data.products.map((product, index) => ({
          ...product,
          index,
          userCustomerId: product.dealerProduct[0].userCustomerId,
          isSale: product.dealerProduct[0].isSale.toString(),
          stock: product.dealerProduct[0].stock,
          productPartCode: product.dealerProduct[0].productPartCode,
          _id: product.dealerProduct[0]._id,
        }))
        console.log(this.products)
        // this.backupProducts = this.products

        // this.selected = result.data.products.map((product) => ({
        //   ...product.masterProductId,
        //   isSale: product.dealerProduct[0].isSale.toString(),
        //   stock: product.dealerProduct[0].stock,
        // }))

        this.serverItemLength = result.data.count
        this.isLoadingProduct = false
      }
    },
    async loadProductAll() {
      // previously used to provided data to template csv
      const requestProductAll = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/products`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        const result = await Axios(config)
        this.productsAll = result.data.products.map((product, index) => ({
          ...product,
          index,
          isSale: product.isSale.toString(),
        }))
      }

      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestProductAll()
      }
    },
    editItem(item) {
      this.editedIndex = this.products.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem(item) {
      this.item = item
      this.deleteDialog = true
    },
    async confirmDelete() {
      try {
        const index = this.products.indexOf(this.item)
        this.products.splice(index, 1)
        this.products = this.products.map((masterProduct, index) => ({
          ...masterProduct,
          index,
        }))
        await this.deleteProduct()
        this.closeDelete()
        this.successAlert('Deleted')
      } catch (error) {
        this.errorAlert(error)
      }
    },
    async deleteProduct() {
      const requestDelete = (product) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const data = product
        const url = `${apiBaseUrl}/api/products/${product._id}`
        const config = {
          headers: headers,
          method: 'DELETE',
          url: url,
          data: data,
        }

        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const product = { ...this.item }
        return requestDelete(product)
      }
    },
    closeEditOrNew() {
      this.dialog = false
      this.resetValidation()
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
    closeDelete() {
      this.deleteDialog = false
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
    save() {
      if (this.editedIndex > -1) {
        // edit
        this.updateProduct()
          .then(() => {
            this.loadProduct()
            this.successAlert('Updated')
            this.closeEditOrNew()
          })
          .catch((error) => this.errorAlert(error))
      } else {
        //add new
        this.saveNewProduct()
          .then(() => {
            this.loadProduct()
            this.successAlert('Added')
            this.closeEditOrNew()
          })
          .catch((error) => this.errorAlert(error))
      }
    },
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
  },
  components: {
    Navbar,
  },

  mixins: [numberWithPeriod, roundUp],
}
</script>
