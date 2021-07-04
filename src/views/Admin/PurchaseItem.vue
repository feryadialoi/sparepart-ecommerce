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
          <v-toolbar-title>Purchase Item</v-toolbar-title>
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
                    :rules="quantityRules"
                    type="number"
                    v-model="editedItem.quantity"
                    label="Quantity"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    :rules="confirmedQuantityRules"
                    type="number"
                    v-model="editedItem.confirmedQuantity"
                    label="Confirmed Quantity"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    :rules="priceRules"
                    type="number"
                    v-model="editedItem.price"
                    label="Price"
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
              <div class="font-weight-bold">
                {{ item.productId.masterProductId.name }}
              </div>
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
    Promise.all([this.loadPurchaseItems()]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    search: '',
    valid: true,
    quantityRules: [(v) => !!v || 'Quantity is required'],
    confirmedQuantityRules: [(v) => !!v || 'Confirmed Quantity is required'],
    priceRules: [(v) => !!v || 'Price is required'],
    search: '',
    success: false,
    error: false,
    errorMessage: '',
    successMessage: '',
    item: {
      productId: {
        masterProductId: {
          name: '',
        },
      },
    },
    purchaseItems: [
      {
        productId: {
          masterProductId: {
            name: '',
          },
        },
      },
    ],
    isLoading: true,
    skeletonLoaderItem: [0, 1, 2, 3, 4],
    lazyImg: lazyImg,
    dialog: false,
    deleteDialog: false,
    headers: [
      { text: 'No', value: 'index' },
      { text: 'Purchase Id', value: 'purchaseOrderId._id' },
      { text: 'Buyer', value: 'purchaseOrderId.userId.name' },
      { text: 'Seller', value: 'purchaseOrderId.sellerId.name' },
      // { text: 'Purchase Item Id', value: '_id' },
      { text: 'Product Name', value: 'productId.masterProductId.name' },
      {
        text: 'Product Local Shop Name',
        value: 'productId.masterProductId.localShopName',
      },
      {
        text: 'Product Part Code',
        value: 'productId.masterProductId.partCode',
      },
      { text: 'Quantity', value: 'quantity' },
      { text: 'Confirmed Quantity', value: 'confirmedQuantity' },
      { text: 'Price', value: 'price' },
      { text: 'Actions', value: 'action', sortable: false },
    ],
    editedIndex: -1,
    editedItem: {
      _id: '',
      name: '',
    },
    defaultItem: {
      _id: '',
      name: '',
    },

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
    searchDataTable() {
      const search = this.search.toLowerCase()
      const purchaseItems = this.backupPurchaseItems
      if (search.length > 0) {
        const newPurchaseItems = purchaseItems.filter(
          (el) =>
            el.productId.masterProductId.name.toLowerCase().match(search) ||
            el.productId.masterProductId.partCode.toLowerCase().match(search) ||
            el.productId.masterProductId.localShopName.toLowerCase().match(search) ||
            el.purchaseOrderId._id.toLowerCase().match(search) ||
            el.purchaseOrderId.userId.name.toLowerCase().match(search) ||
            el.purchaseOrderId.sellerId.name.toLowerCase().match(search),
        )
        this.purchaseItems = newPurchaseItems
      } else {
        this.purchaseItems = this.backupPurchaseItems
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
            const result = await requestUpdate(purchaseItem)
            return result
          } catch (error) {
            throw new Error(error)
          }
        }
      } else {
        throw new Error('invalid input!')
      }
    },
    async saveNewPurchaseItem() {
      const purchaseItem = {
        name: this.editedItem.name,
      }
      const requestSaveNew = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const data = purchaseItem
        const url = `${apiBaseUrl}/api/purchase-order-items`
        const config = {
          headers: headers,
          method: 'POST',
          url: url,
          data: data,
        }
        try {
          const result = await Axios(config)
          this.successMessage = 'Added'
          this.success = true
          setTimeout(() => {
            this.success = false
          }, 5000)
        } catch (error) {
          this.error = true
          this.errorMessage = error
        }
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestSaveNew()
      }
    },
    async loadPurchaseItems() {
      const requestPurchaseItems = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/purchase-order-items`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        const result = await Axios(config)
        this.purchaseItems = result.data.purchaseOrderItems.map((purchaseItem, index) => ({
          ...purchaseItem,
          index,
        }))
        this.backupPurchaseItems = this.purchaseItems
      }

      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestPurchaseItems()
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
      this.purchaseItems = this.purchaseItems.map((purchaseItem, index) => ({
        ...purchaseItem,
        index,
      }))
      this.deletePurchaseItem()
        .then(() => {
          this.successAlert('Deleted')
          this.closeDelete()
        })
        .catch((error) => {
          this.errorAlert(error)
        })
    },
    async deletePurchaseItem() {
      const requestDelete = (purchaseItem) => {
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
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const purchaseItem = { ...this.item }
        return await requestDelete(purchaseItem)
      }
    },
    closeEditOrNew() {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
      this.resetValidation()
    },
    closeDelete() {
      this.deleteDialog = false
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
    save() {
      if (this.editedIndex > -1) {
        // edit
        this.updatePurchaseItem()
          .then(() => {
            this.successAlert('Updated')
            this.loadPurchaseItems()
            this.resetValidation()
            this.closeEditOrNew()
          })
          .catch((error) => {
            this.errorAlert(error)
          })
      } else {
        //add new
        this.saveNewPurchaseItem()
          .then(() => {
            //
          })
          .catch((error) => {
            //
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
