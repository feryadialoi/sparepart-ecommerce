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
          <v-toolbar-title>Dealer</v-toolbar-title>
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
        <v-data-table :headers="headers" :items="dealers" sort-by="index" class="elevation-1">
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
                      class="ml-2 mb-1"
                      @click="openDialogImport"
                      color="primary_red_1"
                      dark
                      >import csv</v-btn
                    >-->
                    <v-btn
                      color="primary_red_1"
                      dark
                      class="ml-2 mb-1"
                      @click="dialog = true"
                    >New Item</v-btn>
                  </v-layout>
                </v-col>
              </v-row>
            </v-card>
          </template>
          <template v-slot:item.storeId.name="{ item }">
            <v-chip v-if="!item.storeId" small dark color="primary_red_1">{{ 'Belum ada toko' }}</v-chip>
            <div v-if="item.storeId">{{ item.storeId.name }}</div>
          </template>
          <template v-slot:item.index="{ item }">
            <div>{{ item.index + 1 }}</div>
          </template>
          <template v-slot:item.image="{ item }">
            <v-avatar size="60">
              <v-img :src="apiImage(item.image)"></v-img>
            </v-avatar>
          </template>
          <template v-slot:item.action="{ item }">
            <div class="no-services">
              <!-- <v-chip
                @click="
                  $router.push({
                    name: 'dealerDetail',
                    params: { dealerId: item._id },
                  })
                "
                class="mx-1"
                small
                color="success"
                dark
              >detail</v-chip>-->
              <!-- <v-chip
                @click="openDialogChangePassword(item)"
                class="mx-1"
                small
                color="warning"
                dark
              >change password</v-chip>
              <v-chip @click="editItem(item)" class="mx-1" small color="info" dark>edit</v-chip>
              <v-chip @click="deleteItem(item)" class="mx-1" small color="primary_red_1" dark>delete</v-chip>-->
              <!-- <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-icon
                    v-on="on"
                    small
                    class="mr-2"
                    @click="
                      $router.push({
                        name: 'dealerDetail',
                        params: { dealerId: item._id },
                      })
                    "
                    >mdi-magnify</v-icon
                  >
                </template>
                <span>Detail</span>
              </v-tooltip>-->
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-icon
                    v-on="on"
                    small
                    class="mr-2"
                    @click="openDialogChangePassword(item)"
                  >mdi-lock</v-icon>
                </template>
                <span>Change Password</span>
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
      </v-container>
    </v-content>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row v-if="image == null && editedIndex !== -1 && editedItem.image !== ''">
              <v-col class="px-10 pa-lg-5" cols="12" sm="12" md="12">
                <v-avatar size="100%">
                  <v-img
                    v-if="image == null && editedIndex !== -1 && editedItem.image !== ''"
                    :src="apiImage(editedItem.image)"
                  ></v-img>
                </v-avatar>
              </v-col>
            </v-row>

            <v-row align="center" v-if="image != null">
              <v-col class="px-10 pa-lg-5" cols="12" sm="12" md="12">
                <v-avatar size="100%">
                  <v-img v-if="image != null" :src="imageUrl"></v-img>
                </v-avatar>
              </v-col>
            </v-row>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.name"
                    label="Name"
                    color="primary_red_1"
                    :rules="nameRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.customerId"
                    label="Customer Id"
                    color="primary_red_1"
                    :rules="customerIdRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-select
                    color="primary_red_1"
                    :items="roles"
                    v-model="editedItem.role"
                    label="Role"
                    :rules="roleRules"
                    item-text="name"
                    return-object
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.email"
                    label="Email"
                    color="primary_red_1"
                    :rules="emailRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.phone"
                    label="Phone"
                    color="primary_red_1"
                    :rules="phoneRules"
                  ></v-text-field>
                </v-col>
                <!-- <v-col v-if="editedIndex === -1" cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.password"
                    label="Password"
                    color="primary_red_1"
                    :rules="passwordRules"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showPassword ? 'text' : 'password'"
                    @click:append="showPassword = !showPassword"
                  ></v-text-field>
                </v-col>-->
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
    <!-- Dialog Change Password =============================================================== -->
    <v-dialog v-model="dialogChangePassword" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Change Password</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <div>
                Change password for user
                <span
                  class="font-weight-bold"
                >{{ `"${this.changePassword.name}"` }}</span>
              </div>
            </v-row>
            <v-form ref="formChangePassword" v-model="validChangePassword" lazy-validation>
              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="changePassword.password"
                    label="Password"
                    color="primary_red_1"
                    :rules="[rules.required, rules.min]"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialogChangePassword">Cancel</v-btn>
          <v-btn color="red darken-1" @click="saveChangePassword" text>Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- dialog import data csv =================================================== -->
    <v-dialog v-model="dialogImport" max-width="500px">
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
                  @click="downloadTemplate"
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
          <v-spacer></v-spacer>
          <v-btn outlined color="blue darken-1" dark @click="closeDialogImport">Cancel</v-btn>
          <v-btn outlined @click="submitImport" color="success darken-1">import</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- dialog import data csv END =================================================== -->
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
import FormData from 'form-data'
export default {
  mounted() {
    Promise.all([this.loadDealers(), this.loadRole()]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    search: '',
    showPassword: false,
    imageUrl: '',
    image: null,
    valid: true,
    nameRules: [(v) => !!v || 'Name is required'],
    customerIdRules: [(v) => !!v || 'Customer Id is required'],
    roleRules: [(v) => !!v || 'Role is required'],
    phoneRules: [(v) => !!v || 'Phone is required'],
    passwordRules: [(v) => !!v || 'Password is required'],
    emailRules: [
      (v) => {
        const checkEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        return checkEmail.test(v) || 'The email you entered is not valid'
      },
    ],
    rules: {
      required: (value) => !!value || 'Required.',
      min: (v) => v.length >= 6 || 'Min 6 characters',
      emailMatch: (v) => {
        const checkEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        return checkEmail.test(v) || 'The email you entered is not valid'
      },
      confirmOldPasswordRules: (v, nv) =>
        // v === this.oldPassword || 'confirm password not match',
        v === nv || 'confirm password not match',
    },
    imageErrorMessage: '',
    success: false,
    error: false,
    errorMessage: '',
    successMessage: '',
    dialog: false,
    deleteDialog: false,
    isLoading: true,
    skeletonLoaderItem: [0, 1, 2, 3, 4],
    lazyImg: lazyImg,
    headers: [
      { text: 'No', value: 'index' },
      { text: 'Name', value: 'name' },
      { text: 'User Id', value: '_id' },
      { text: 'Customer Id', value: 'customerId' },
      { text: 'Role', value: 'role.name' },
      { text: 'Email', value: 'email' },
      { text: 'Phone', value: 'phone' },
      { text: 'Toko', value: 'storeId.name' },
      { text: 'Image', value: 'image' },
      { text: 'Actions', value: 'action', sortable: false },
    ],
    item: {},
    dealers: [],
    roles: [],
    editedIndex: -1,
    editedItem: {
      _id: '',
      name: '',
      customerId: '',
      role: null,
      email: '',
      phone: '',
      password: '',
    },
    defaultItem: {
      _id: '',
      name: '',
      customerId: '',
      role: null,
      email: '',
      phone: '',
      password: '',
    },

    dialogChangePassword: false,
    changePassword: {
      _id: '',
      name: '',
      password: '',
    },
    validChangePassword: true,

    // import csv
    dialogImport: false,
    csvUrl: '',
    csv: null,
    csvName: '',
    csvErrorMessage: '',
  }),
  components: {
    Navbar,
  },
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
    // bulk data import
    downloadTemplate() {
      Axios
      const fileUrl = 'http://api.astra.develop:3000/uploads/templates/master-products.xlsx'
      location.href = fileUrl
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

      this.csvErrorMessage = ''
    },
    openDialogImport() {
      this.dialogImport = true
    },
    closeDialogImport() {
      this.dialogImport = false
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
    submitImport() {
      // this.importCsv()
      //   .then((result) => {
      //     console.log(result);
      //     this.successAlert('Import success');
      //     this.loadMasterProduct();
      //     this.closeImport();
      //   })
      //   .catch((error) => {
      //     this.errorAlert(error);
      //   });
    },
    // bulk data import END
    async searchDataTable() {
      const requestSearch = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/users?role=dealer&keyword=${this.search}`
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
        this.dealers = result.data.users.map((dealer, index) => ({
          ...dealer,
          index,
        }))
      }
    },
    // change password ====================================================================
    validatePassword() {
      return this.$refs.formChangePassword.validate()
    },
    resetFormPassword() {
      this.$refs.formChangePassword.reset()
    },
    resetValidationPassword() {
      this.$refs.formChangePassword.resetValidation()
    },
    openDialogChangePassword(item) {
      this.changePassword._id = item._id
      this.changePassword.name = item.name
      this.dialogChangePassword = true
    },
    closeDialogChangePassword() {
      this.dialogChangePassword = false
      this.changePassword = {
        _id: '',
        name: '',
        password: '',
      }
      this.resetValidationPassword()
    },
    async saveChangePassword() {
      const requestSavePassword = (user) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        let data = user
        const url = `${apiBaseUrl}/api/auth/admin/update-password`
        const config = {
          method: 'POST',
          headers,
          url,
          data,
        }
        return Axios(config)
      }
      try {
        const validate = this.validatePassword()
        if (validate) {
          await requestSavePassword(this.changePassword)
          this.successAlert('Password updated')
          this.closeDialogChangePassword()
        } else {
          this.errorAlert('invalid input!')
        }
      } catch (error) {
        this.errorAlert(error.response.data.message)
      }
    },
    // change password end ====================================================================

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
    onPickFile() {
      this.$refs.fileInput.click()
    },
    emptyFormData() {
      this.image = null
      this.imageUrl = ''
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
    async updateDealer() {
      const requestUpdate = async (dealer, image) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data',
        }
        let data = new FormData()
        data.append('image', image)
        data.append('name', dealer.name)
        data.append('customerId', dealer.customerId)
        data.append('role', dealer.role)
        data.append('email', dealer.email)
        data.append('phone', dealer.phone)
        const url = `${apiBaseUrl}/api/users/${dealer._id}`
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
        const dealer = {
          _id: this.editedItem._id,
          name: this.editedItem.name,
          customerId: this.editedItem.customerId,
          role: this.editedItem.role._id,
          email: this.editedItem.email,
          phone: this.editedItem.phone,
        }
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          return requestUpdate(dealer, this.image)
        }
      } else {
        throw new Error('invalid input!')
      }
    },
    async saveNewDealer() {
      const requestSaveNew = async (dealer, image) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data',
        }
        let data = new FormData()
        data.append('image', image)
        data.append('name', dealer.name)
        data.append('customerId', dealer.customerId)
        data.append('role', dealer.role)
        data.append('email', dealer.email)
        data.append('phone', dealer.phone)
        data.append('password', dealer.password)
        const url = `${apiBaseUrl}/api/auth/signup`
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
        const dealer = {
          name: this.editedItem.name,
          customerId: this.editedItem.customerId,
          role: this.editedItem.role._id,
          email: this.editedItem.email,
          phone: this.editedItem.phone,
          password: this.editedItem.password,
        }
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          return requestSaveNew(dealer, this.image)
        }
      } else {
        this.imageErrorMessage = 'image is required'
        throw new Error('invalid input!')
      }
    },
    async loadDealers() {
      const requestDealer = async () => {
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
        const result = await requestDealer()
        this.dealers = result.data.users.map((dealer, index) => ({
          ...dealer,
          index,
        }))
      }
    },
    async loadRole() {
      const requestRole = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/roles`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return await Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await requestRole()
        // this.roles = result.data.roles.map((role, index) => ({
        //   ...role,
        //   index,
        // }));
        this.roles = result.data.roles.filter((role) => role.name === 'dealer')
        // return requestDealer();
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
    editItem(item) {
      this.editedIndex = this.dealers.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem(item) {
      this.item = item
      this.deleteDialog = true
    },
    confirmDelete() {
      this.deleteDealer().then(() => {
        const index = this.dealers.indexOf(this.item)
        this.dealers.splice(index, 1)
        this.dealers = this.dealers.map((dealer, index) => ({
          ...dealer,
          index,
        }))
        this.successAlert('Deleted')
      })
      this.closeDelete()
    },
    async deleteDealer() {
      const requestDelete = async (dealer) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/users/${dealer._id}`
        const config = {
          headers: headers,
          method: 'DELETE',
          url: url,
        }
        try {
          return await Axios(config)
        } catch (error) {
          throw new Error()
        }
      }
      const dealer = { ...this.item }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestDelete(dealer)
      }
    },
    closeEditOrNew() {
      this.dialog = false
      this.resetValidation()
      this.emptyFormData()
      this.resetErrorMessage()
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
        this.updateDealer()
          .then(() => {
            this.closeEditOrNew()
            this.loadDealers()
            this.successAlert('Updated')
          })
          .catch((error) => {
            this.errorAlert(error)
          })
      } else {
        this.saveNewDealer()
          .then(() => {
            this.loadDealers()
            this.closeEditOrNew()
            this.successAlert('Added')
          })
          .catch((error) => {
            this.errorAlert(error)
          })
      }
    },
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
  },
}
</script>
