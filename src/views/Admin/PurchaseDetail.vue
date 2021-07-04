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
          <v-toolbar-title>Purchase Detail</v-toolbar-title>
        </template>
      </Navbar>
    </nav>
    <v-content v-if="isLoading">
      <v-container>
        <v-row>
          <v-col v-for="item in skeletonLoaderItem" :key="item" cols="12" sm="6" md="4" lg="3" xl="3">
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
          >{{ successMessage }}</v-alert
        >
        <v-alert
          style="z-index:1000"
          v-model="error"
          :value="error"
          transition="scale-transition"
          dismissible
          type="error"
          >{{ errorMessage }}</v-alert
        >

        <template>
          <v-data-table :headers="headers" :items="purchaseItems" sort-by="index" class="elevation-1">
            <template v-slot:top>
              <v-card flat class="pa-3">
                <v-list v-for="(purchaseDetail, name) in purchaseDetails" :key="name" subheader three-line>
                  <!-- <v-subheader>User Controls</v-subheader> -->

                  <v-list-item>
                    <v-avatar class="mr-2" :color="name == 'Total' ? 'primary_red_1' : ''">
                      <span v-if="name == 'Total'" class="white--text headline">Rp</span>
                      <v-img v-if="name != 'Total'" :src="apiImage(purchaseDetail.image)"></v-img>
                    </v-avatar>
                    <!-- <v-list-item-avatar :color="name == 'Total' ? 'primary_red_1':''">
                      <span v-if="name == 'Total'" class="white--text headline">Rp</span>
                      <v-img v-if="name != 'Total'" :src="apiImage(purchaseDetail.image)"></v-img>
                    </v-list-item-avatar>-->
                    <v-list-item-content>
                      <v-list-item-subtitle>{{ name }}</v-list-item-subtitle>
                      <v-list-item-title>
                        {{
                          name == 'Total'
                            ? numberWithPeriod({
                                currency: 'Rp',
                                separator: '.',
                                number: purchaseDetail,
                              })
                            : purchaseDetail.name
                        }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>

                <!-- <v-row>
            <v-col class="py-0" cols="12" md="6" lg="12">
              <div class="caption primary_grey_1--text font-weight-bold">Buyer</div>
              <div class="caption primary_grey_1--text">{{ purchaseDetail.userId.name }}</div>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="py-0" cols="12" md="6" lg="12">
              <div class="caption primary_grey_1--text font-weight-bold">Seller</div>
              <div class="caption primary_grey_1--text">{{ purchaseDetail.sellerId.name }}</div>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="py-0" cols="12" md="6" lg="12">
              <div class="caption primary_grey_1--text font-weight-bold">Store</div>
              <div class="caption primary_grey_1--text">{{ purchaseDetail.sellerId.storeId.name }}</div>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="py-0" cols="12" md="6" lg="2">
              <div class="caption primary_grey_1--text font-weight-bold">Total</div>
              <div class="caption primary_grey_1--text">
                {{ numberWithPeriod({
                currency: 'Rp',
                separator: '.',
                number: purchaseDetail.total
                })
                }}
              </div>
            </v-col>
                </v-row>-->
              </v-card>
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
                      <!-- <v-btn
                        color="primary_red_1"
                        dark
                        class="ml-2 mb-1"
                        @click="dialog = true"
                      >New Item</v-btn>-->
                    </v-layout>
                  </v-col>
                </v-row>
              </v-card>
            </template>
            <template v-slot:item.index="{ item }">
              <div>{{ item.index + 1 }}</div>
            </template>
            <template v-slot:item.price="{ item }">
              <div>
                {{
                  numberWithPeriod({
                    currency: 'Rp',
                    separator: '.',
                    number: item.price,
                  })
                }}
              </div>
            </template>
            <template v-slot:item.productId.masterProductId.image[0].image="{ item }">
              <v-avatar tile>
                <v-img aspect-ratio="1" :src="apiImage(item.productId.masterProductId.image[0].image)"></v-img>
              </v-avatar>
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
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.quantity"
                    label="Quantity"
                    type="number"
                    :rules="quantityRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.confirmedQuantity"
                    label="Confirmed Quantity"
                    type="number"
                    :rules="confirmedQuantityRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.price"
                    label="Price"
                    type="number"
                    :rules="priceRules"
                  ></v-text-field>
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
  </v-app>
</template>
<style>
.tf {
  max-width: 40px;
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
import lazyImg from '../../assets/lazy-img.jpg'
import Navbar from '../../components/Navbar'
import { checkTokenExp, refreshToken } from '../../services'
import Axios from 'axios'
import { apiBaseUrl } from '../../api'
import numberWithPeriod from '../../mixins/numberWithPeriod'
export default {
  mounted() {
    Promise.all([this.loadPurchaseDetail()]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    valid: true,
    quantityRules: [(v) => v > 0 || 'Quantity is required'],
    confirmedQuantityRules: [(v) => v > 0 || 'Quantity is required'],
    priceRules: [(v) => !!v || 'Price is required'],

    search: '',
    quantityErrorMessage: '',
    confirmedQuantityErrorMessage: '',
    success: false,
    error: false,
    errorMessage: '',
    successMessage: '',
    item: {},
    purchaseItems: [],
    purchaseItems: [],
    units: [],
    select: ['Vuetify', 'Programming'],
    items: ['Programming', 'Design', 'Vue', 'Vuetify'],
    isLoading: true,
    skeletonLoaderItem: [0, 1, 2, 3, 4],
    lazyImg: lazyImg,
    dialog: false,
    deleteDialog: false,
    headers: [
      { text: 'No', value: 'index' },
      { text: 'Purchase Order Id', value: 'purchaseOrderId' },
      { text: 'Product Name', value: 'productId.masterProductId.name' },
      {
        text: 'Product Local Shop Name',
        value: 'productId.masterProductId.localShopName',
      },
      { text: 'Quantity', value: 'quantity' },
      { text: 'Confirmed Quantity', value: 'confirmedQuantity' },
      { text: 'Price', value: 'price' },
      {
        text: 'Product Image',
        value: 'productId.masterProductId.image[0].image',
      },
      { text: 'Actions', value: 'action', sortable: false },
    ],
    editedIndex: -1,
    editedItem: {
      _id: '',
      purchaseOrderId: '',
      productId: {},
      quantity: 0,
      confirmedQuantity: 0,
      price: 0,
    },
    defaultItem: {
      _id: '',
      purchaseOrderId: '',
      productId: {},
      quantity: 0,
      confirmedQuantity: 0,
      price: 0,
    },
    purchaseItems: [],
    purchaseDetail: {},
    purchaseDetails: {},
    tempDelete: 0,
    backupPurchaseItems: [],
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
    },
  },

  watch: {
    dialog(val) {
      val || this.closeEditOrNew()
    },
  },

  created() {
    // this.initialize();
  },

  methods: {
    validate() {
      return this.$refs.form.validate()
    },
    resetForm() {
      this.$refs.form.reset()
    },
    resetValidation() {
      this.$refs.form.resetValidation()
    },
    async searchDataTable() {
      const search = this.search.toLowerCase()
      if (search.length == 0) {
        this.purchaseItems = this.backupPurchaseItems
      } else {
        const result = this.backupPurchaseItems.filter(
          (element) =>
            element.productId.masterProductId.name.toLowerCase().match(search) ||
            element.productId.masterProductId.localShopName.toLowerCase().match(search) ||
            element.productId.masterProductId.partCode.toLowerCase().match(search) ||
            element.productId.masterProductId.description.toLowerCase().match(search) ||
            element.productId.masterProductId.price == +search,
        )
        this.purchaseItems = result
      }
    },
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
    async updatePurchaseItem() {
      const requestUpdate = (purchaseItem) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const data = purchaseItem
        const url = `${apiBaseUrl}/api/purchase-order-items/${purchaseItem._id}`
        const config = {
          headers: headers,
          method: 'PUT',
          url: url,
          data: data,
        }
        return Axios(config)
      }

      const validate = this.validate()
      if (validate) {
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          try {
            const purchaseItem = {
              _id: this.editedItem._id,
              quantity: this.editedItem.quantity,
              confirmedQuantity: this.editedItem.confirmedQuantity,
              price: this.editedItem.price,
            }
            return await requestUpdate(purchaseItem)
          } catch (error) {
            throw new Error(error)
          }
        }
      } else {
        throw new Error('invalid input!')
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
    async saveNewPurchaseItem() {
      const purchaseDetail = {
        name: this.editedItem.name,
      }
      console.log(purchaseDetail)
      const requestSaveNew = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const data = purchaseDetail
        const url = `${apiBaseUrl}/api/purchase-order-items`
        const config = {
          headers: headers,
          method: 'POST',
          url: url,
          data: data,
        }
        try {
          if (purchaseItem.quantity.length == 0 || purchaseItem.confirmedQuantity.length == 0) {
            if (purchaseItem.quantity.length == 0) {
              this.quantityErrorMessage = 'quantity is empty!'
            }
            if (purchaseItem.confirmedQuantity.length == 0) {
              this.confirmedQuantityErrorMessage = 'confirmed quantity is empty!'
            }
            throw new Error('invalid input!')
          } else {
            const result = await Axios(config)
            this.successAlert('Added')
            return result
          }
        } catch (error) {
          this.errorAlert('invalid input!')
          throw new Error(error)
        }
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestSaveNew()
      }
    },
    async loadPurchaseDetail() {
      const requestUnit = async () => {
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
        console.log(result.data.purchaseOrderItem)
        this.purchaseDetail = {
          userId: result.data.userId,
          total: result.data.total,
          sellerId: result.data.sellerId,
        }

        this.purchaseDetails = {
          Buyer: {
            name: result.data.userId.name,
            image: result.data.userId.image,
          },
          Seller: {
            name: result.data.sellerId.name,
            image: result.data.sellerId.image,
          },
          Store: {
            name: result.data.sellerId.storeId.name,
            image: result.data.sellerId.storeId.image,
          },
          Total: result.data.total,
        }
        console.log(this.purchaseDetail)
        this.purchaseItems = result.data.purchaseOrderItem.map((purchaseOrderItem, index) => ({
          ...purchaseOrderItem,
          index,
        }))
        this.backupPurchaseItems = this.purchaseItems
      }

      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestUnit()
      }
    },
    editItem(item) {
      this.editedIndex = this.purchaseItems.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem(item) {
      this.item = item
      const index = this.purchaseItems.indexOf(item)
      this.deleteDialog = true
    },
    confirmDelete() {
      const index = this.purchaseItems.indexOf(this.item)
      this.purchaseItems.splice(index, 1)
      this.purchaseItems = this.purchaseItems.map((purchaseDetail, index) => ({
        ...purchaseDetail,
        index,
      }))
      this.deletePurchaseItem()
      this.closeDelete()
    },
    async deletePurchaseItem() {
      const purchaseItem = { ...this.item }
      const requestDelete = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/purchase-order-items/${purchaseItem._id}`
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
    closeEditOrNew() {
      this.dialog = false
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
        this.updatePurchaseItem().then(() => {
          this.loadPurchaseDetail()
          this.successAlert('Updated')
          this.closeEditOrNew()
        })
      } else {
        //add new
        this.saveNewPurchaseItem().then(() => {
          this.loadPurchaseDetail()
          this.closeEditOrNew()
        })
      }
    },
  },
  components: {
    Navbar,
  },

  mixins: [numberWithPeriod],
}
</script>
