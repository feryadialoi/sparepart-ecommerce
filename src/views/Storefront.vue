<template>
  <v-app>
    <Navbar main="tes main">
      <template v-slot:back>
        <v-btn small fab text color="primary_red_1" @click="$router.go(-1)">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </template>
      <template v-slot:body>
        <v-toolbar-title>Profile Toko</v-toolbar-title>
      </template>
      <!-- <template v-slot:storefront>
        <v-btn small fab text color="primary_red_1">
          <v-icon>mdi-card-text</v-icon>
        </v-btn>
      </template>-->
    </Navbar>
    <v-content v-if="isLoading">
      <v-container>
        <v-row>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="list-item-avatar-two-line"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6" md="4">
            <v-skeleton-loader height="100" type="image"></v-skeleton-loader>
            <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
          </v-col>
          <v-col cols="6" md="4">
            <v-skeleton-loader height="100" type="image"></v-skeleton-loader>
            <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
          </v-col>
          <v-col cols="6" md="4">
            <v-skeleton-loader height="100" type="image"></v-skeleton-loader>
            <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
          </v-col>
          <v-col cols="6" md="4">
            <v-skeleton-loader height="100" type="image"></v-skeleton-loader>
            <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
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

        <!-- Belum ada Toko ================================================== -->
        <v-row class="px-1" v-if="!hasStore" justify="center">
          <v-layout justify-center class="py-3">
            <div class="text-center font-weight-bold primary_grey_1--text">Anda belum memiliki toko</div>
          </v-layout>
        </v-row>
        <v-row class="px-1" v-if="!hasStore" justify="center">
          <v-layout justify-center>
            <v-btn
              color="primary_red_1"
              dark
              @click="openDialogStorefront({ edit: false })"
            >buat toko</v-btn>
          </v-layout>
        </v-row>
        <!-- Belum ada Toko ================================================== -->

        <!-- Store =========================================== -->
        <v-row class="px-1" v-if="hasStore">
          <v-col cols="12" sm="6" md="4" class="pa-2">
            <v-card flat>
              <v-layout align-center>
                <div class="pa-2">
                  <v-avatar size="100">
                    <v-img v-if="hasStore" :src="apiImage(store.image)"></v-img>
                    <v-img v-if="!hasStore" :src="lazyImg"></v-img>
                  </v-avatar>
                </div>
                <div class="pa-2">
                  <div
                    v-if="hasStore"
                    class="caption font-weight-bold primary_black_1--text"
                  >{{ store.name }}</div>
                  <!-- <div class="caption primary_grey_1--text">{{store.userId.addressId.name}}</div> -->
                </div>
                <v-spacer></v-spacer>
                <div class="pr-2">
                  <v-btn
                    @click="openDialogStorefront({ edit: true })"
                    color="primary_red_1"
                    text
                    fab
                    small
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </div>
              </v-layout>
            </v-card>
          </v-col>
        </v-row>
        <v-row align="center">
          <v-col cols="6" class="py-0">
            <div class="caption">Status Toko ( {{ store.isOpen ? 'Buka' : 'Tutup' }} )</div>
          </v-col>
          <v-col cols="6" class="py-0">
            <v-layout justify-end>
              <v-switch @change="setIsOpenStore" color="primary_red_1" v-model="store.isOpen"></v-switch>
            </v-layout>
          </v-col>
        </v-row>
        <!-- Store =========================================== -->

        <!-- Address ============================================================= -->
        <v-row v-if="hasStore" class="mb-3">
          <v-col class="py-0">
            <div
              class="caption primary_grey_1--text"
              v-if="addresses.length > 0"
            >{{ addresses[0].name }}</div>
            <div
              class="caption primary_grey_1--text"
              v-if="addresses.length == 0"
            >Alamat belum tersedia</div>
          </v-col>
          <v-col cols="12" lg="12" md="12" sm="12">
            <v-btn
              @click="$router.push({ name: 'userAddress' })"
              outlined
              small
              dark
              color="primary_green_1"
            >{{ addressButtonTitle }}</v-btn>
          </v-col>
        </v-row>
        <v-divider class="my-3" v-if="hasStore"></v-divider>
        <!-- Address ============================================================= -->

        <!-- Belum ada product ============================================== -->
        <v-row>
          <v-col class="py-0">
            <div class="caption font-weight-bold primary_grey_1--text">Porduk yang tersedia</div>
          </v-col>
        </v-row>
        <v-row v-if="hasStore && products.length == 0">
          <v-col>
            <v-card outlined class="pa-3">
              <div class="caption primary_grey_1--text text-center">Belum ada produk</div>
            </v-card>
          </v-col>
        </v-row>
        <!-- Belum ada product ============================================== -->

        <!-- Product ============================================================= -->
        <v-row class="px-1" v-if="hasStore">
          <v-col
            cols="6"
            sm="6"
            md="4"
            lg="3"
            v-for="product in products"
            :key="product._id"
            class="pa-2"
          >
            <v-card flat hover>
              <v-img
                v-if="product.masterProductId && product.masterProductId.image && product.masterProductId.image.length > 0"
                :src="apiImage(product.masterProductId.image[0].image)"
                aspect-ratio="1.78"
                contain
              ></v-img>
              <v-img
                v-if="!product.masterProductId || !product.masterProductId.image || product.masterProductId.image.length === 0"
                :src="lazyImg"
                aspect-ratio="1.78"
                :contain="false"
              ></v-img>
              <div class="pa-2">
                <div class="caption font-weight-bold">
                  <v-clamp
                    autoresize
                    :max-lines="2"
                  >{{ product.masterProductId && product.masterProductId.name ? product.masterProductId.name :'Nama produk tidak tersedia' }}</v-clamp>
                </div>
                <div class="caption primary_red_1--text">
                  {{
                  numberWithPeriod({
                  currency: 'Rp',
                  separator: '.',
                  number: product.price,
                  })
                  }}
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
        <!-- Product ============================================================= -->
        <!--  -->
      </v-container>
    </v-content>

    <v-footer>
      <v-layout justify-center>
        <div v-if="products.length > 0" class="text-center">
          <v-pagination
            color="primary_red_1"
            v-model="pageProduct"
            :length="Math.ceil(productCountAll / productCount)"
            :total-visible="6"
          ></v-pagination>
        </div>
      </v-layout>
    </v-footer>

    <!-- Storefront ============================================================================================================================== -->
    <v-dialog v-model="dialogStorefront" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="formStorefront" v-model="validStorefront" lazy-validation>
              <v-row>
                <v-img v-if="image == null && store.image != ''" :src="apiImage(store.image)"></v-img>
                <v-img v-if="image != null" :src="imageUrl"></v-img>
              </v-row>
              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-if="store != null"
                    :rules="nameRules"
                    v-model="store.name"
                    label="Nama Toko"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-select
                    color="primary_red_1"
                    :items="[false, true]"
                    v-model="store.isOpen"
                    label="Buka"
                    return-object
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-select
                    color="primary_red_1"
                    :items="['H1', 'H2', 'H3', 'H12', 'H23', 'H13', 'H123']"
                    v-model="store.status"
                    label="Status"
                    :rules="statusRules"
                    item-text="name"
                    return-object
                  ></v-select>
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
          <v-btn color="blue darken-1" @click="closeDialogStorefront" text>Batal</v-btn>
          <v-btn color="green darken-1" @click="save" text>Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Storefront ============================================================================================================================== -->
    <!--  -->
  </v-app>
</template>
<script>
import lazyImg from '../assets/lazy-img.jpg'
import Navbar from '../components/Navbar'
import VClamp from 'vue-clamp'
import { checkTokenExp, refreshToken } from '../services'
import Axios from 'axios'
import { apiBaseUrl } from '../api'
import numberWithPeriod from '../mixins/numberWithPeriod'
import FormData from 'form-data'
export default {
  mounted() {
    Promise.all([this.loadStore(), this.loadProduct(), this.loadUserMainAddress()]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    formTitle: '',
    editStore: false,
    imageUrl: '',
    image: null,

    imageErrorMessage: '',
    success: false,
    error: false,
    errorMessage: '',
    successMessage: '',

    nameRules: [(v) => !!v || 'Name is required'],
    areaRules: [(v) => !!v || 'Area is required'],
    statusRules: [(v) => !!v || 'Status is required'],
    isOpenRules: [(v) => !!v || 'Is Open is required'],

    isLoading: true,
    validStorefront: true,
    dialogStorefront: false,
    lazyImg: lazyImg,
    store: {
      _id: '',
      name: '',
      status: '',
      userId: '',
      image: '',
      isOpen: true,
    },
    products: [
      { _id: 0, name: 'Lorem ipsum item', price: 999999, image: lazyImg },
      { _id: 1, name: 'Lorem ipsum item', price: 999999, image: lazyImg },
      { _id: 2, name: 'Lorem ipsum item', price: 999999, image: lazyImg },
      { _id: 3, name: 'Lorem ipsum item', price: 999999, image: lazyImg },
      { _id: 4, name: 'Lorem ipsum item', price: 999999, image: lazyImg },
      { _id: 5, name: 'Lorem ipsum item', price: 999999, image: lazyImg },
    ],
    addresses: [],
    hasStore: true,

    // pagination
    pageProduct: 1,
    productCount: 6,
    productCountAll: 0,
  }),
  methods: {
    stringToBoolean(bool) {
      if (bool == 'true') {
        return true
      } else {
        return false
      }
    },
    async setIsOpenStore() {
      const requestUpdate = (store) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/stores/${store._id}`
        const config = {
          headers: headers,
          method: 'PUT',
          url: url,
          data: {
            isOpen: this.store.isOpen,
          },
        }
        return Axios(config)
      }

      try {
        const store = {
          _id: this.store._id,
        }
        await requestUpdate(store)
        this.successAlert('Toko berhasil diubah')
        this.loadStore()
      } catch (error) {
        this.errorAlert(error)
      }
      console.log(this.store.isOpen)
    },
    validateStorefront() {
      return this.$refs.formStorefront.validate()
    },
    resetValidationStorefront() {
      this.$refs.formStorefront.resetValidation()
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
    openDialogStorefront({ edit }) {
      if (edit) {
        this.formTitle = 'Edit Toko'
        this.editStore = true
      } else {
        this.formTitle = 'Buat Toko'
        this.editStore = false
      }
      this.dialogStorefront = true
    },
    closeDialogStorefront() {
      this.dialogStorefront = false
      this.resetImage()
    },
    resetImage() {
      this.imageUrl = ''
      this.image = null
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

    async updateStorefront() {
      const requestUpdate = (store, image) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        let data = new FormData()
        data.append('image', image)
        data.append('name', store.name)
        data.append('isOpen', store.isOpen)
        data.append('status', store.status)
        console.log('data store', store)

        const url = `${apiBaseUrl}/api/stores/${store._id}`
        const config = {
          headers: headers,
          method: 'PUT',
          url: url,
          data: data,
        }
        return Axios(config)
      }

      const validate = this.validateStorefront()
      if (validate) {
        try {
          const user = JSON.parse(localStorage.getItem('currentUser'))
          const store = {
            _id: this.store._id,
            name: this.store.name,
            status: this.store.status,
            isOpen: this.store.isOpen,
          }
          await requestUpdate(store, this.image)
          this.successAlert('Toko berhasil diubah')
          this.closeDialogStorefront()
          this.loadProduct()
          this.loadStore()
        } catch (error) {
          this.errorAlert(error)
        }
      } else {
        this.errorAlert('invalid input!')
      }
    },
    async saveStorefront() {
      const requestSave = (store, image) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        let data = new FormData()
        data.append('image', image)
        data.append('name', store.name)
        data.append('isOpen', store.isOpen)
        data.append('userId', store.userId)
        const url = `${apiBaseUrl}/api/stores`
        const config = {
          headers: headers,
          method: 'POST',
          url: url,
          data: data,
        }
        return Axios(config)
      }
      const validate = this.validateStorefront()
      if (this.image && validate) {
        try {
          const user = JSON.parse(localStorage.getItem('currentUser'))
          const store = {
            userId: user._id,
            customerId: user.customerId,
            pic: user.name,
            name: this.store.name,
            isOpen: this.store.isOpen,
            status: this.store.status,
          }

          return await requestSave(store, this.image)
        } catch (error) {
          throw new Error(error)
        }
      } else {
        this.imageErrorMessage = 'Image not selected!'
        throw new Error('invalid input!')
      }
    },

    async loadUserMainAddress() {
      const requestAddress = () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        const userId = currentUser._id
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/addresses?userId=${userId}&isMain=true`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        const result = await requestAddress()
        this.addresses = result.data.addresses
        console.log('main address', result.data)
      }
    },
    async loadStore() {
      const requestStore = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        console.log('currentUser', currentUser)
        const userId = currentUser._id
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/stores?userId=${userId}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        const result = await Axios(config)
        const store = result.data.stores
        if (store.length == 0) {
          this.hasStore = false
        } else {
          this.store = store[0]
          this.hasStore = true
        }
        console.log('store', this.store)
      }
      const checkToken = await checkTokenExp()

      if (checkToken == true) {
        return requestStore()
      }
    },
    async loadProduct() {
      const requestProduct = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const user = JSON.parse(localStorage.getItem('currentUser'))
        const userId = user._id
        const customerId = user.customerId
        const config = {
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          method: 'GET',
          url: `${apiBaseUrl}/api/products?customerId=${customerId}&page=${this.pageProduct}&count=${this.productCount}`,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        const result = await requestProduct()
        this.products = result.data.products
        this.productCountAll = result.data.count
        console.log('product', result.data)
        return result
      }
    },
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
    save() {
      if (this.editStore) {
        this.updateStorefront()
      } else {
        this.saveStorefront()
          .then(() => {
            this.successAlert('Toko berhasil dibuat')
            this.closeDialogStorefront()
            this.loadProduct()
            this.loadStore()
          })
          .catch((error) => {
            this.errorAlert(error)
          })
      }
    },
  },
  components: {
    Navbar,
    VClamp,
  },
  computed: {
    addressButtonTitle() {
      return 'Ubah Alamat'
    },
  },
  mixins: [numberWithPeriod],
  watch: {
    pageProduct: function() {
      this.loadProduct()
    },
  },
}
</script>
