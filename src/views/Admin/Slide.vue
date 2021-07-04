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
          <v-toolbar-title>Slide</v-toolbar-title>
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
          <v-data-table :headers="headers" sort-by="index" :items="slides" class="elevation-1">
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
                      >import csv</v-btn> -->
                      <v-btn color="primary_red_1" dark class="ml-2 mb-1" @click="dialog = true">New Slide</v-btn>
                    </v-layout>
                  </v-col>
                </v-row>
              </v-card>
            </template>

            <template v-slot:item.index="{ item }">
              <div>{{ item.index + 1 }}</div>
            </template>
            <template v-slot:item.image="{ item }">
              <v-layout justify-end>
                <v-avatar tile>
                  <v-img :alt="lazyImg" :src="apiImage(item.image)" aspect-ratio="3"></v-img>
                </v-avatar>
              </v-layout>
            </template>
            <template v-slot:item.isActive="{ item }">
              <!-- {{
              item.isActive
              }}-->
              <v-chip class="mx-1" small :color="item.isActive == 'true' ? 'success' : 'primary_red_1'" dark>{{
                item.isActive
              }}</v-chip>
            </template>
            <template v-slot:item.action="{ item }">
              <div class="no-services">
                <!-- <v-chip @click="editItem(item)" class="mx-1" small color="info" dark>edit</v-chip>
              <v-chip @click="deleteItem(item)" class="mx-1" small color="primary_red_1" dark>delete</v-chip>
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
          <v-spacer></v-spacer>
          <v-btn @click="closeEditOrNew" fab="" text="" dark="" small="" color="primary_red_1">
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
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
                  <v-text-field
                    color="primary_red_1"
                    v-model="editedItem.name"
                    label="Name"
                    :rules="nameRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    color="primary_red_1"
                    v-model="editedItem.description"
                    label="Description"
                    :rules="descriptionRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-select
                    color="primary_red_1"
                    :items="['false', 'true']"
                    v-model="editedItem.isActive"
                    :rules="isActiveRules"
                    label="isActive"
                    return-object
                  ></v-select>
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
                <div>
                  Download template untuk import data dalam bentuk Microsoft Excel (xls)
                </div>
              </v-col>
              <v-col cols="12" lg="12" md="12" sm="12">
                <v-btn @click="downloadTemplate" outlined color="primary_red_1" dark class="mb-2"
                  >download template</v-btn
                >
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
                <input type="file" ref="fileInputCsv" style="display:none" @change="onCsvFilePicked" accept=".csv" />
              </v-col>
              <v-col cols="12" sm="12" md="12" class="py-0">
                <div class="primary_red_1--text caption">
                  {{ csvErrorMessage }}
                </div>
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
    Promise.all([this.loadSlide()]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    valid: true,
    nameRules: [(v) => !!v || 'Name is required'],
    descriptionRules: [(v) => !!v || 'Description is required'],
    isActiveRules: [(v) => !!v || 'Is Active is required'],
    imageErrorMessage: '',
    imageUrl: '',
    image: null,
    fileImage: {},
    search: '',
    success: false,
    error: false,
    errorMessage: '',
    successMessage: '',
    item: {},
    slides: [],
    select: ['Vuetify', 'Programming'],
    items: ['Programming', 'Design', 'Vue', 'Vuetify'],
    isLoading: true,
    skeletonLoaderItem: [0, 1, 2, 3, 4],
    lazyImg: lazyImg,
    dialog: false,
    deleteDialog: false,
    headers: [
      { text: 'No', value: 'index' },
      { text: 'Name', value: 'name' },
      { text: 'Description', value: 'description' },
      { text: 'Is Active', value: 'isActive' },
      { text: 'Image', value: 'image' },
      { text: 'Actions', value: 'action', sortable: false },
    ],
    editedIndex: -1,
    editedItem: {
      _id: '',
      name: '',
      isActive: '',
      image: '',
      description: '',
    },
    defaultItem: {
      _id: '',
      name: '',
      isActive: '',
      image: '',
      description: '',
    },
    tempDelete: 0,

    // import csv
    dialogImport: false,
    csvUrl: '',
    csv: null,
    csvName: '',
    csvErrorMessage: '',
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Slide' : 'Edit Slide'
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
        data.append('csv', this.csv)
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
    // bulk data import END
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
    async searchDataTable() {
      const requestSlide = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/slides?keyword=${this.search}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await requestSlide()
        this.slides = result.data.slides.map((slide, index) => ({
          index,
          ...slide,
        }))

        // return requestSlide();
      }
    },
    resetErrorMessage() {
      this.imageErrorMessage = ''
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
    async updateSlide() {
      const requestUpdate = async (slide, image) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data',
        }
        let data = new FormData()
        data.append('image', image)
        data.append('name', slide.name)
        data.append('description', slide.description)
        data.append('isActive', this.stringToBoolean(slide.isActive))
        const url = `${apiBaseUrl}/api/slides/${slide._id}`
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
        const slide = {
          _id: this.editedItem._id,
          name: this.editedItem.name,
          isActive: this.editedItem.isActive,
          description: this.editedItem.description,
        }
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          return requestUpdate(slide, this.image)
        }
      } else {
        throw new Error('invalid input!')
      }
    },
    async saveNewSlide() {
      const requestSaveNew = async (slide, image) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          // 'Content-Type': 'multipart/form-data',
          'Content-Type': 'application/json',
        }
        let data = new FormData()
        data.append('image', image)
        data.append('name', slide.name)
        data.append('description', slide.description)
        data.append('isActive', this.stringToBoolean(slide.isActive))
        const url = `${apiBaseUrl}/api/slides`
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
        const slide = {
          name: this.editedItem.name,
          description: this.editedItem.description,
          isActive: this.editedItem.isActive,
        }
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          return requestSaveNew(slide, this.image)
        }
      } else {
        this.imageErrorMessage = 'image is required'
        throw new Error('invalid input!')
      }
    },
    emptyFormData() {
      this.image = null
      this.imageUrl = ''
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
    async loadSlide() {
      const requestSlide = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/slides`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return await Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await requestSlide()
        this.slides = result.data.slides.map((slide, index) => ({
          ...slide,
          isActive: slide.isActive.toString(),
          index,
        }))
      }
    },
    editItem(item) {
      this.editedIndex = this.slides.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem(item) {
      this.item = item
      const index = this.slides.indexOf(item)
      this.deleteDialog = true
    },
    confirmDelete() {
      this.deleteSlide().then(() => {
        const index = this.slides.indexOf(this.item)
        this.slides.splice(index, 1)
        this.slides = this.slides.map((slide, index) => ({
          ...slide,
          index,
        }))
        this.successAlert('Deleted')
      })
      this.closeDelete()
    },
    async deleteSlide() {
      const requestDelete = async (slide) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/slides/${slide._id}`
        const config = {
          headers: headers,
          method: 'DELETE',
          url: url,
        }
        try {
          return await Axios(config)
        } catch (error) {
          throw new Error(error)
        }
      }
      const slide = { ...this.item }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestDelete(slide)
      }
    },
    closeEditOrNew() {
      this.dialog = false
      this.resetErrorMessage()
      this.emptyFormData()
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
        this.updateSlide()
          .then(() => {
            // Object.assign(this.slides[this.editedIndex], this.editedItem);
            this.closeEditOrNew()
            this.loadSlide()
            this.successAlert('Updated')
          })
          .catch((error) => {
            this.errorAlert(error)
          })
      } else {
        //add new
        this.saveNewSlide()
          .then(() => {
            this.closeEditOrNew()
            this.loadSlide()
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
  components: {
    Navbar,
  },

  mixins: [numberWithPeriod],
}
</script>
