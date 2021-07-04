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
          <v-toolbar-title>Alamat</v-toolbar-title>
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
        <v-row class="px-1 mb-2">
          <!--  -->
          <v-col
            v-for="address in addresses"
            :key="address._id"
            cols="12"
            lg="4"
            md="6"
            sm="12"
            class="py-1"
          >
            <v-card flat hover outlined>
              <v-layout align-center class="px-2">
                <div>
                  <div class="caption font-weight-bold primary_black_1--text">{{ address.name }}</div>
                  <div class="caption primary_grey_1--text">{{ address.description }}</div>
                </div>
                <v-spacer></v-spacer>

                <v-checkbox
                  @change="updateUserAddressIsMain(address)"
                  class="py-0"
                  color="primary_red_1"
                  v-model="address.isMain"
                ></v-checkbox>
              </v-layout>
              <v-layout align-center>
                <v-col class="py-0">
                  <v-btn block text color="primary_red_1" @click="editItem(address)">
                    <!-- <v-icon>mdi-pencil</v-icon> -->
                    edit
                  </v-btn>
                </v-col>
                <v-col class="py-0">
                  <v-btn block text color="primary_red_1" @click="deleteItem(address)">
                    <!-- <v-icon>mdi-pencil</v-icon> -->
                    hapus
                  </v-btn>
                </v-col>
              </v-layout>
            </v-card>
          </v-col>
        </v-row>
        <v-row v-if="addresses.length == 0" class="px-1">
          <v-col cols="12" lg="12" md="12" sm="12" class="py-0">
            <v-btn
              color="primary_red_1"
              class="mb-2"
              @click="dialog = true"
              block
              dark
            >tambah alamat</v-btn>
          </v-col>
        </v-row>
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
                  <v-text-field v-model="editedItem.name" label="Alamat" :rules="nameRules"></v-text-field>
                </v-col>

                <v-col cols="12" sm="12" md="12">
                  <v-text-field v-model="editedItem.area" label="Area" :rules="areaRules"></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.description"
                    label="Description"
                    :rules="descriptionRules"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="12" md="12">
                  <v-select
                    color="primary_red_1"
                    :items="['false', 'true']"
                    v-model="editedItem.isMainAlt"
                    label="Is Main"
                    :rules="isMainRules"
                    return-object
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
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Hapus Alamat</span>
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
import Navbar from '../components/Navbar'
import lazyImg from '../assets/lazy-img.jpg'
import Axios from 'axios'
import { apiBaseUrl } from '../api'
import { checkTokenExp, refreshToken } from '../services'
import numberWithPeriod from '../mixins/numberWithPeriod'
export default {
  mounted() {
    Promise.all([
      //
      this.loadUserAddress(),
      //
    ]).then(() => {
      this.isLoading = false
    })
    this.loadCurrentUser().then((user) => {
      console.log(user)
    })
  },
  data: () => ({
    valid: true,
    nameRules: [(v) => !!v || 'Jalan is required'],

    isMainRules: [(v) => !!v || 'Is Main is required'],
    areaRules: [(v) => !!v || 'Area is required'],
    customerIdRules: [(v) => !!v || 'Customer Id is required'],
    descriptionRules: [(v) => !!v || 'Description is required'],

    success: false,
    error: false,
    errorMessage: '',
    successMessage: '',
    isLoading: true,
    skeletonLoaderItem: [0, 1, 2, 3, 4],
    lazyImg: lazyImg,
    points: [],
    addresses: [],
    user: {},
    dialog: false,
    deleteDialog: false,
    headers: [
      { text: 'No', value: 'index' },
      { text: 'Name', value: 'name' },
      { text: 'User Id', value: 'userId.name' },
      { text: 'Description', value: 'description' },
      { text: 'Is Main', value: 'isMain' },
      { text: 'Actions', value: 'action', sortable: false },
    ],
    editedIndex: -1,
    editedItem: {
      _id: '',
      name: '',
      area: '',
      customerId: '',
      userId: null,
      description: '',
      isMain: '',
    },
    defaultItem: {
      _id: '',
      name: '',
      area: '',
      customerId: '',
      userId: null,
      description: '',
      isMain: '',
    },
    item: {},
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Tambah Alamat' : 'Edit Alamat'
    },
  },

  methods: {
    async updateUserAddressIsMain(item) {
      const address = {
        _id: item._id,
        name: item.name,
        customerId: item.customerId,
        userId: item.userId._id,
        description: item.description,
        isMain: item.isMain,
      }
      const updateAddress = (address) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const data = address
        const url = `${apiBaseUrl}/api/addresses/user-main-address`
        const config = {
          headers: headers,
          method: 'POST',
          url: url,
          data: data,
        }
        try {
          return Axios(config)
        } catch (error) {
          throw new Error(error)
        }
      }
      await updateAddress(address)
      this.loadUserAddress()

      // console.log(item);
      // if (item.isMainAlt == 'true') {
      //   console.log(item.isMain);
      //   console.log('set to true, the rest set to false');
      //   updateAddress(address).then(() => {
      //     this.loadUserAddress();
      //   });
      // } else if (item.isMainAlt == 'false') {
      //   console.log(item.isMain);
      //   console.log('set to false');
      //   updateAddress(address).then(() => {
      //     this.loadUserAddress();
      //   });
      // }
    },
    stringToBoolean(bool) {
      if (bool == 'true') {
        return true
      } else {
        return false
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
    resetErrorMessage() {
      this.imageErrorMessage = ''
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
    async updateAddress() {
      const requestUpdate = async (address) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const data = address
        const url = `${apiBaseUrl}/api/addresses/${address._id}`
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
        const address = {
          _id: this.editedItem._id,
          name: this.editedItem.name,
          customerId: this.editedItem.customerId,
          area: this.editedItem.area,
          userId: this.editedItem.userId._id,
          description: this.editedItem.description,
          isMain: this.stringToBoolean(this.editedItem.isMainAlt),
        }
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          return requestUpdate(address)
        }
      } else {
        throw new Error('invalid input!')
      }
    },
    async saveNewAddress() {
      const requestSaveNew = async (address) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const data = address
        const url = `${apiBaseUrl}/api/addresses`
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
        const user = await this.loadCurrentUser()
        console.log(user)
        const address = {
          name: this.editedItem.name,
          customerId: user.customerId,
          area: this.editedItem.area,
          userId: user._id,
          description: this.editedItem.description,
          isMain: this.stringToBoolean(this.editedItem.isMainAlt),
        }
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          return requestSaveNew(address)
        }
      } else {
        throw new Error('invalid input!')
      }
    },
    async loadCurrentUser() {
      return JSON.parse(localStorage.getItem('currentUser'))
    },
    async loadUserAddress() {
      const requestSlide = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const user = await this.loadCurrentUser()
        const url = `${apiBaseUrl}/api/addresses?userId=${user._id}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        const result = await requestSlide()
        const addresses = result.data.addresses
        if (addresses.length > 0) {
          this.addresses = result.data.addresses.map((el) => ({
            ...el,
            isMainAlt: el.isMain.toString(),
          }))

          console.log(this.addresses)
        }
        console.log(addresses)
      }
    },
    editItem(item) {
      this.editedIndex = this.addresses.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem(item) {
      this.item = item
      const index = this.addresses.indexOf(item)
      this.deleteDialog = true
    },
    confirmDelete() {
      const index = this.addresses.indexOf(this.item)
      this.addresses.splice(index, 1)
      this.addresses = this.addresses.map((address, index) => ({
        ...address,
        // isMainAlt: address.isMain.toString(),
        index,
      }))
      this.deleteAddress()
      this.closeDelete()
    },
    async deleteAddress() {
      const address = { ...this.item }
      const requestDelete = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/addresses/${address._id}`
        const config = {
          headers: headers,
          method: 'DELETE',
          url: url,
        }
        try {
          const result = await Axios(config)
          this.successAlert('Deleted')
        } catch (error) {
          this.errorAlert(error)
        }
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestDelete()
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
    save() {
      console.log(this.editedIndex)
      if (this.editedIndex > -1) {
        this.updateAddress()
          .then(() => {
            this.loadUserAddress()
            this.successAlert('Updated')
            this.closeEditOrNew()
          })
          .catch((error) => {
            this.errorAlert(error)
          })
      } else {
        this.saveNewAddress()
          .then(() => {
            this.loadUserAddress()
            this.successAlert('Added')
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
}
</script>
