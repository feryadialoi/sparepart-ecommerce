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
          <v-toolbar-title>Purchase</v-toolbar-title>
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
          <v-data-table :headers="headers" :items="purchases" sort-by="index" class="elevation-1">
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
            <template v-slot:item.isDone="{ item }">
              <!-- {{ item.isDone.toString()}} -->
              <v-chip class="mx-1" small :color="isBoolStatus(item.isDone)" dark="">{{ item.isDone }}</v-chip>
            </template>
            <template v-slot:item.isConfirmItem="{ item }">
              <!-- {{ item.isConfirmItem.toString()}} -->
              <v-chip class="mx-1" small :color="isBoolStatus(item.isConfirmItem)" dark="">{{
                item.isConfirmItem
              }}</v-chip>
            </template>
            <template v-slot:item.isConfirmSendItem="{ item }">
              <!-- {{ item.isConfirmSendItem.toString()}} -->
              <v-chip class="mx-1" small :color="isBoolStatus(item.isConfirmSendItem)" dark="">{{
                item.isConfirmSendItem
              }}</v-chip>
            </template>
            <template v-slot:item.total="{ item }">
              <v-layout justify-end>
                {{
                  numberWithPeriod({
                    currency: 'Rp',
                    separator: '.',
                    number: item.total,
                  })
                }}
              </v-layout>
            </template>
            <template v-slot:item.action="{ item }">
              <div class="no-services">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on" small class="mr-2" @click="goToPurchaseDetail(item._id)">mdi-magnify</v-icon>
                  </template>
                  <span>Detail</span>
                </v-tooltip>
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
                <v-col cols="12" sm="12" md="12" lg="12">
                  <v-select
                    color="primary_red_1"
                    :items="['false', 'true']"
                    v-model="editedItem.isDone"
                    :rules="isDoneRules"
                    label="Is Done"
                    return-object
                  ></v-select>
                </v-col>

                <v-col cols="12" sm="12" md="12" lg="12">
                  <v-select
                    color="primary_red_1"
                    :items="['false', 'true']"
                    v-model="editedItem.isConfirmSendItem"
                    :rules="isConfirmSendItemRules"
                    label="Is Confirm Send Item"
                    return-object
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="12" md="12" lg="12">
                  <v-select
                    color="primary_red_1"
                    :items="['false', 'true']"
                    v-model="editedItem.isConfirmItem"
                    :rules="isConfirmItemRules"
                    label="Is Confirm Item"
                    return-object
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-select
                    dense
                    :items="users"
                    v-model="editedItem.userId"
                    item-text="name"
                    label="Buyer/Depot"
                    return-object
                    color="primary_red_1"
                    :rules="userRules"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-select
                    dense
                    :items="users"
                    v-model="editedItem.sellerId"
                    item-text="name"
                    label="Seller/Dealer"
                    return-object
                    color="primary_red_1"
                    :rules="userRules"
                  ></v-select>
                </v-col>

                <v-col cols="12" sm="12" md="12" lg="12">
                  <v-text-field v-model="editedItem.total" label="Total" type="number"></v-text-field>
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
    Promise.all([this.loadPurchase(), this.loadUser()]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    valid: true,
    isDoneRules: [(v) => !!v || 'Is Done is required'],
    isConfirmItemRules: [(v) => !!v || 'Is Confirm Item is required'],
    isConfirmSendItemRules: [(v) => !!v || 'Is Confirm Send Item is required'],
    userIdRules: [(v) => !!v || 'User is required'],
    sellerIdRules: [(v) => !!v || 'Seller is required'],
    totalRules: [(v) => !!v || 'Total is required'],
    userRules: [(v) => !!v || 'User is required'],

    search: '',
    success: false,
    error: false,
    errorMessage: '',
    successMessage: '',
    item: {},
    purchases: [],
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
      // { text: 'Purchase Id', value: '_id' },
      // { text: 'Is Done', value: 'isDone' },
      // { text: 'Is Confirm Item', value: 'isConfirmItem' },
      // { text: 'Is Confirm Send Item', value: 'isConfirmSendItem' },
      { text: 'Buyer/Depot', value: 'userId.name' },
      // { text: 'Seller/Dealer', value: 'sellerId.name' },
      { text: 'Store', value: 'sellerId.storeId.name' },
      { text: 'Total', value: 'total' },
      { text: 'Actions', value: 'action', sortable: false },
    ],
    editedIndex: -1,
    editedItem: {
      _id: '',
      isDone: '',
      isConfirmItem: '',
      isConfirmSendItem: '',
      userId: null,
      sellerId: null,
      total: 0,
    },
    defaultItem: {
      _id: '',
      isDone: '',
      isConfirmItem: '',
      isConfirmSendItem: '',
      userId: null,
      sellerId: null,
      total: 0,
    },
    tempDelete: 0,
    users: [],
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
    goToPurchaseDetail(param) {
      this.$router.push({
        name: 'purchaseDetail',
        params: { purchaseOrderId: param },
      })
    },
    isBoolStatus(bool) {
      return bool ? 'success' : 'primary_red_1'
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
    stringToBoolean(bool) {
      if (bool == 'true') {
        return true
      } else {
        return false
      }
    },
    async loadUser() {
      const requestUser = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/users`
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
        // return requestUser();
      }
    },
    async searchDataTable() {},
    async updatePurchase() {
      const requestUpdate = (purchase) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const data = purchase
        const url = `${apiBaseUrl}/api/purchases/${purchase._id}`
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
            const purchase = {
              _id: this.editedItem._id,
              isDone: this.stringToBoolean(this.editedItem.isDone),
              isConfirmItem: this.stringToBoolean(this.editedItem.isConfirmItem),
              isConfirmSendItem: this.stringToBoolean(this.editedItem.isConfirmSendItem),
              sellerId: this.editedItem.sellerId._id,
              total: this.editedItem.total,
            }
            return requestUpdate(purchase)
          } catch (error) {
            throw new Error(error)
          }
        }
      } else {
        throw new Error('invalid input!')
      }
    },
    async saveNewPurchase() {
      const requestSaveNew = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const data = purchase
        const url = `${apiBaseUrl}/api/purchases`
        const config = {
          headers: headers,
          method: 'POST',
          url: url,
          data: data,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      const validate = this.validate()
      if (validate) {
        if (checkToken === true) {
          try {
            const purchase = {
              isDone: this.stringToBoolean(this.editedItem.isDone),
              isConfirmItem: this.stringToBoolean(this.editedItem.isConfirmItem),
              isConfirmSendItem: this.stringToBoolean(this.editedItem.isConfirmSendItem),
              sellerId: this.editedItem.sellerId._id,
              total: this.editedItem.total,
            }
            return requestSaveNew()
          } catch (error) {
            throw new Error(error)
          }
        }
      } else {
        throw new Error('invalid input!')
      }
    },
    async loadPurchase() {
      const requestPurchase = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/purchases`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        const result = await Axios(config)
        this.purchases = result.data.purchases.map((purchase, index) => ({
          ...purchase,
          isDone: purchase.isDone.toString(),
          isConfirmItem: purchase.isConfirmItem.toString(),
          isConfirmSendItem: purchase.isConfirmSendItem.toString(),
          index,
        }))
        console.log(result.data)
      }

      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestPurchase()
      }
    },
    editItem(item) {
      this.editedIndex = this.purchases.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem(item) {
      this.item = item
      const index = this.purchases.indexOf(item)
      this.deleteDialog = true
    },
    confirmDelete() {
      const index = this.purchases.indexOf(this.item)
      this.purchases.splice(index, 1)
      this.purchases = this.purchases.map((purchase, index) => ({
        ...purchase,
        index,
      }))
      this.deletePurchase()
      this.closeDelete()
    },
    async deletePurchase() {
      const purchase = { ...this.item }
      const requestDelete = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/purchase-orders/${purchase._id}`
        const config = {
          headers: headers,
          method: 'DELETE',
          url: url,
        }
        try {
          const result = await Axios(config)
          this.successMessage = 'Deleted'
          this.success = true
          setTimeout(() => {
            this.success = false
          }, 5000)
        } catch (error) {
          alert('something went wrong!')
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
        Object.assign(this.purchases[this.editedIndex], this.editedItem)

        this.updatePurchase()
          .then(() => {
            this.successAlert('Updated')
            this.loadPurchase()
            this.closeEditOrNew()
          })
          .catch((error) => {
            this.errorAlert(error)
          })
      } else {
        //add new
        this.purchases.push({
          ...this.editedItem,
          index: this.purchases.length,
        })
        this.saveNewPurchase()
          .then(() => {
            this.successAlert('Added')
            this.loadPurchase()
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

  mixins: [numberWithPeriod],
}
</script>
