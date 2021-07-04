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
          <v-toolbar-title>Point</v-toolbar-title>
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
          <v-data-table :headers="headers" :items="points" sort-by="index" class="elevation-1">
            <template v-slot:top>
              <v-card flat class="px-3 py-3">
                <v-row>
                  <v-col class="py-0 " cols="12" lg="6" md="4" sm="12">
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
                  <v-col class="py-0" cols="12" lg="4" md="4" sm="12">
                    <v-select
                      dense
                      @change="selectPointOwner"
                      :items="pointOwners"
                      v-model="pointOwner"
                      outlined
                      item-text="name"
                      label="Point Owner"
                      return-object
                      color="primary_red_1"
                      :rules="selectedUserRules"
                    ></v-select>
                  </v-col>
                  <v-col class="py-0 " cols="12" lg="2" md="4" sm="12">
                    <v-layout justify-end>
                      <v-btn color="primary_red_1" dark class="ml-2 mb-1" @click="dialog = true">New Point</v-btn>
                      <v-btn class="ml-2 mb-1" color="primary_red_1" dark @click="expandHeader">
                        <v-icon>
                          mdi-arrow-expand
                        </v-icon>
                      </v-btn>
                    </v-layout>
                  </v-col>
                </v-row>
              </v-card>
            </template>
            <template v-slot:item.index="{ item }">
              <div>{{ item.index + 1 }}</div>
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
                  <v-select
                    dense
                    outlined
                    :items="users"
                    v-model="editedItem.userId"
                    item-text="name"
                    label="Dealer"
                    return-object
                    color="primary_red_1"
                    :rules="selectedUserRules"
                  ></v-select>
                </v-col>
                <!-- <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    color="primary_red_1"
                    v-model="editedItem.userId.name"
                    label="Name"
                    :rules="userIdRules"
                  ></v-text-field>
                </v-col> -->
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    color="primary_red_1"
                    v-model="editedItem.point"
                    label="Point"
                    :rules="pointRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    color="primary_red_1"
                    v-model="editedItem.purchaseOrderId"
                    label="Purchase Order Id"
                    :rules="purchaseOrderIdRules"
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
    Promise.all([this.loadPoint(), this.loadUser()]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    search: '',
    valid: true,
    userIdRules: [(v) => v > 0 || 'User Id is required'],
    purchaseOrderIdRules: [(v) => !!v || 'Purchase Order Id is required'],
    pointRules: [(v) => v > 0 || 'Point is required'],
    selectedUserRules: [(v) => !!v || 'User is required'],

    success: false,
    error: false,
    errorMessage: '',
    successMessage: '',
    item: {},
    select: ['Vuetify', 'Programming'],
    items: ['Programming', 'Design', 'Vue', 'Vuetify'],
    isLoading: true,
    skeletonLoaderItem: [0, 1, 2, 3, 4],
    lazyImg: lazyImg,
    dialog: false,
    deleteDialog: false,
    headers: [
      // { text: 'No', value: 'index' },
      { text: 'User', value: 'userId.name' },
      // { text: 'Role', value: 'userId.role.roleId.name' },
      { text: 'Point', value: 'point' },
      // { text: 'Purchase Order Id', value: 'purchaseOrderId' },
      { text: 'Actions', value: 'action', sortable: false },
    ],
    toggleHeader: true,
    editedIndex: -1,
    editedItem: {
      _id: '',
      userId: '',
      purchaseOrderId: '',
      point: 0,
    },
    defaultItem: {
      _id: '',
      userId: '',
      purchaseOrderId: '',
      point: 0,
    },
    points: [],
    backupPoints: [],
    users: [],
    pointOwners: [
      { name: 'Dealer', param: 'dealer' },
      { name: 'Depot', param: 'depot' },
      { name: 'All', param: '' },
    ],
    pointOwner: { name: 'All', param: '' },
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Point' : 'Edit Point'
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
    expandHeader() {
      this.toggleHeader = !this.toggleHeader
      const smallHeader = [
        // { text: 'No', value: 'index' },
        { text: 'User', value: 'userId.name' },
        // { text: 'Role', value: 'userId.role.roleId.name' },
        { text: 'Point', value: 'point' },
        // { text: 'Purchase Order Id', value: 'purchaseOrderId' },
        { text: 'Actions', value: 'action', sortable: false },
      ]
      const expandedHeader = [
        { text: 'No', value: 'index' },
        { text: 'User', value: 'userId.name' },
        { text: 'Role', value: 'userId.role.roleId.name' },
        { text: 'Point', value: 'point' },
        { text: 'Purchase Order Id', value: 'purchaseOrderId' },
        { text: 'Actions', value: 'action', sortable: false },
      ]
      this.toggleHeader ? (this.headers = smallHeader) : (this.headers = expandedHeader)
    },
    selectPointOwner() {
      if (this.pointOwner.param == '') {
        this.points = this.backupPoints
      } else {
        const points = this.backupPoints.filter((element) => element.userId.role.roleId.name == this.pointOwner.param)
        this.points = points
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
        const url = `${apiBaseUrl}/api/points?keyword=${this.search}`
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
        this.backupPoints = result.data.points.map((point, index) => ({
          ...point,
          index,
        }))
        console.log(result.data)
        this.points = this.backupPoints
      }
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
    validate() {
      return this.$refs.form.validate()
    },
    resetForm() {
      this.$refs.form.reset()
    },
    resetValidation() {
      this.$refs.form.resetValidation()
    },
    async updatePoint() {
      const requestUpdate = async (point) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const data = point
        const url = `${apiBaseUrl}/api/points/${point._id}`
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
        const point = {
          _id: this.editedItem._id,
          point: this.editedItem.point,
          userId: this.editedItem.userId,
          purchaseOrderId: this.editedItem.purchaseOrderId,
        }
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          return requestUpdate(point)
        }
      } else {
        throw new Error('invalid input!')
      }
    },
    async saveNewPoint() {
      const requestSaveNew = async (point) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const data = point
        const url = `${apiBaseUrl}/api/points`
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
        const point = {
          point: this.editedItem.point,
          userId: this.editedItem.userId,
          purchaseOrderId: this.editedItem.purchaseOrderId,
        }
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          return requestSaveNew(point)
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
    async loadPoint() {
      const requestPoint = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/points`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        const result = await Axios(config)
        this.backupPoints = result.data.points.map((point, index) => ({
          ...point,
          index,
        }))
        this.points = this.backupPoints
      }

      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestPoint()
      }
    },
    editItem(item) {
      this.editedIndex = this.points.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem(item) {
      this.item = item
      const index = this.points.indexOf(item)
      this.deleteDialog = true
    },
    confirmDelete() {
      this.deletePoint().then(() => {
        const index = this.points.indexOf(this.item)
        this.points.splice(index, 1)
        this.points = this.points.map((point, index) => ({
          ...point,
          index,
        }))
        this.successAlert('Deleted')
      })
      this.closeDelete()
    },
    async deletePoint() {
      const point = { ...this.item }
      const requestDelete = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/points/${point._id}`
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
      if (this.editedIndex > -1) {
        // edit
        this.updatePoint()
          .then(() => {
            Object.assign(this.points[this.editedIndex], this.editedItem)
            this.closeEditOrNew()
            this.loadPoint()
            this.successAlert('Updated')
          })
          .catch((error) => {
            this.errorAlert(error)
          })
      } else {
        //add new
        this.saveNewPoint()
          .then(() => {
            this.loadPoint()
            this.closeEditOrNew()
            this.successAlert('Added')
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
