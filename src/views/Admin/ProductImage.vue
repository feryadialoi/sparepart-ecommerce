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
          <v-toolbar-title>Product Image</v-toolbar-title>
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
          <v-data-table :headers="headers" :items="productImages" sort-by="index" class="elevation-1">
            <template v-slot:top>
              <v-toolbar flat color="white">
                <v-toolbar-title>Product Image</v-toolbar-title>
                <v-divider class="mx-4" inset vertical></v-divider>
                <v-spacer></v-spacer>
                <v-btn color="primary_red_1" dark class="mb-2" @click="dialog = true">New Item</v-btn>
              </v-toolbar>
            </template>
            <template v-slot:item.index="{ item }">
              <div>{{ item.index + 1 }}</div>
            </template>
            <template v-slot:item.image="{ item }">
              <v-avatar tile size="50">
                <v-img :src="apiImage(item.image)" aspect-ratio="1"></v-img>
              </v-avatar>
            </template>
            <template v-slot:item.action="{ item }">
              <div style="white-space: nowrap" class="no-services">
                <!-- <v-chip @click="editItem(item)" class="mx-1" small color="info" dark>edit</v-chip>
                <v-chip
                  @click="deleteItem(item)"
                  class="mx-1"
                  small
                  color="primary_red_1"
                  dark
                >delete</v-chip>
                <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-icon
                    v-on="on"
                    small
                    class="mr-2"
                    @click="
                  $router.push({
                    name: 'purchaseDetail',
                    params: { purchaseOrderId: item._id },
                  })"
                  >mdi-file-document</v-icon>
                </template>
                <span>Detail</span>
                </v-tooltip>-->
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
            <v-row>
              <v-img v-if="image == null && editedIndex !== -1" :src="apiImage(editedItem.image)"></v-img>
              <v-img v-if="image != null" :src="imageUrl"></v-img>
            </v-row>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-select
                    :items="masterProducts"
                    v-model="editedItem.masterProductId"
                    item-text="_id"
                    label="Master Product"
                    return-object
                    color="primary_red_1"
                    :error-messages="masterProductIdErrorMessage"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.masterProductId.partCode"
                    disabled
                    label="Product Part Code"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field v-model="editedItem.masterProductId.name" disabled label="Product Name"></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.masterProductId.localShopName"
                    disabled
                    label="Product Local Shop Name"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="editedItem.description"
                    label="Description"
                    :error-messages="descriptionErrorMessage"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12" class="pb-1">
                  <v-btn dark color="primary_red_1" @click="onPickFile">image</v-btn>
                  <input type="file" ref="fileInput" style="display:none" @change="onFilePicked" accept="image/*" />
                </v-col>
                <v-col cols="12" sm="12" md="12" class="py-0">
                  <div class="primary_red_1--text caption">
                    {{ imageErrorMessage }}
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeEditOrNew">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="save">Save</v-btn>
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
            </v-row>
            <v-row>
              <div>{{ item._id }}</div>
              <v-img v-if="item" :src="apiImage(item.image)"></v-img>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="blue darken-1" @click="confirmDelete" text>Delete</v-btn>
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
import FormData from 'form-data'
export default {
  mounted() {
    Promise.all([this.loadProductImage(), this.loadMasterProduct()]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    valid: true,
    masterProductIdErrorMessage: '',
    imageErrorMessage: '',
    descriptionErrorMessage: '',
    success: false,
    error: false,
    errorMessage: '',
    successMessage: '',
    imageUrl: '',
    image: null,
    isLoading: true,
    skeletonLoaderItem: [0, 1, 2, 3, 4],
    lazyImg: lazyImg,
    dialog: false,
    deleteDialog: false,
    headers: [
      { text: 'No', value: 'index' },
      { text: 'Image', value: 'image' },
      { text: 'Product Part Code', value: 'masterProductId.partCode' },
      { text: 'Product Name', value: 'masterProductId.name' },

      { text: 'Actions', value: 'action', sortable: false },
    ],
    editedIndex: -1,
    editedItem: {
      _id: '',
      image: '',
      partCode: '',
      masterProductId: {},
      description: '',
    },
    item: {},
    defaultItem: {
      _id: '',
      image: '',
      partCode: '',
      masterProductId: {},
      description: '',
    },
    masterProducts: [],
    productImages: [],
    tempDelete: 0,
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
    async updateProductImage() {
      const productImage = {
        _id: this.editedItem._id,
        description: this.editedItem.description,
        productPartCode: this.editedItem.masterProductId.partCode,
      }
      const requestUpdate = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data',
        }
        let data = new FormData()
        data.append('image', this.image)
        data.append('description', productImage.description)
        data.append('productPartCode', productImage.productPartCode)
        const url = `${apiBaseUrl}/api/product-images/${productImage._id}`
        const config = {
          headers: headers,
          method: 'PUT',
          url: url,
          data: data,
        }
        try {
          if (productImage.productPartCode == undefined || productImage.description.length == 0) {
            if (productImage.productPartCode == undefined) {
              this.masterProductIdErrorMessage = 'master product not selected!'
            }
            if (productImage.description.length == 0) {
              this.descriptionErrorMessage = 'description is empty!'
            }
            throw new Error('invalid input!')
          } else {
            const result = await Axios(config)
            this.successAlert('Updated')
            return result
          }
        } catch (error) {
          throw new Error(error)
          this.errorAlert(error)
        }
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestUpdate()
      }
    },
    async saveNewProductImage() {
      const productImage = {
        description: this.editedItem.description,
        productPartCode: this.editedItem.masterProductId.partCode,
      }
      const requestSaveNew = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data',
        }
        let data = new FormData()
        data.append('image', this.image)
        data.append('description', productImage.description)
        data.append('productPartCode', productImage.productPartCode)
        const url = `${apiBaseUrl}/api/product-images`
        const config = {
          headers: headers,
          method: 'POST',
          url: url,
          data: data,
        }
        console.log(productImage.productPartCode)
        try {
          if (!this.image || productImage.productPartCode == undefined || productImage.description.length == 0) {
            if (!this.image) {
              this.imageErrorMessage = 'image not selected!'
            }
            if (productImage.productPartCode == undefined) {
              this.masterProductIdErrorMessage = 'master product not selected!'
            }
            if (productImage.description.length == 0) {
              this.descriptionErrorMessage = 'description is empty!'
            }

            throw new Error('invalid input!')
          } else {
            const result = await Axios(config)
            this.successAlert('Added')
            return result
          }
        } catch (error) {
          throw new Error(error)
          this.errorAlert(error)
        }
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestSaveNew()
      }
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
    resetErrorMessage() {
      this.imageErrorMessage = ''
      this.descriptionErrorMessage = ''
      this.masterProductIdErrorMessage = ''
    },
    async loadProductImage() {
      const requestProductImage = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/product-images`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        const result = await Axios(config)
        this.productImages = result.data.productImages.map((productImage, index) => ({ ...productImage, index }))
      }

      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestProductImage()
      }
    },
    async loadMasterProduct() {
      const requestMasterProduct = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/master-products`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        const result = await Axios(config)
        this.masterProducts = result.data.masterProducts
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestMasterProduct()
      }
    },
    editItem(item) {
      this.editedIndex = this.productImages.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem(item) {
      this.item = item
      const index = this.productImages.indexOf(item)
      this.deleteDialog = true
    },

    closeEditOrNew() {
      this.dialog = false
      this.imageUrl = ''
      this.image = null
      this.resetErrorMessage()
      // this.emptyFormData();
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
    closeDelete() {
      this.deleteDialog = false
    },
    confirmDelete() {
      const index = this.productImages.indexOf(this.item)
      this.productImages.splice(index, 1)
      this.productImages = this.productImages.map((productImage, index) => ({
        ...productImage,
        index,
      }))
      this.deleteProductImage()
      this.closeDelete()
    },
    async deleteProductImage() {
      const productImage = { ...this.item }
      const requestDelete = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/product-images/${productImage._id}`
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
          throw new Error(error)
          this.errorAlert(error)
        }
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestDelete()
      }
    },
    save() {
      if (this.editedIndex > -1) {
        this.updateProductImage().then(() => {
          Object.assign(this.productImages[this.editedIndex], this.editedItem)
          this.closeEditOrNew()
          this.loadProductImage()
        })
      } else {
        this.saveNewProductImage().then(() => {
          // this.productImages.push(this.editedItem);
          this.closeEditOrNew()
          this.loadProductImage()
        })
      }
    },
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
  },
  components: {
    Navbar,
  },

  mixins: [numberWithPeriod],
}
</script>
