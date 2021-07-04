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
          <v-toolbar-title>Setting</v-toolbar-title>
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
        <v-card class="pa-3">
          <v-row align="center">
            <v-col cols="6" class="py-0">
              <div>Lock Depot to Dealer</div>
            </v-col>
            <v-col cols="6" class="py-0">
              <v-layout justify-end="">
                <v-switch
                  @change="toggleLoctDepotToDealer"
                  color="primary_red_1"
                  v-model="setting.lockDepotToDealer"
                ></v-switch>
              </v-layout>
            </v-col>
            <!--  -->
            <v-col cols="6" class="py-0">
              <div>Point multiplier</div>
            </v-col>
            <v-col cols="6" class="py-0">
              <v-layout justify-end="" align-center="">
                <div class="mr-2">
                  {{
                    numberWithPeriod({
                      currency: 'Rp',
                      separator: '.',
                      number: setting.pointMultiplier,
                    })
                  }}
                </div>
                <v-btn @click="dialogPoint = true" small="" fab="" text="" color="primary_red_1">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </v-layout>
            </v-col>
            <!--  -->
          </v-row>
        </v-card>
      </v-container>
    </v-content>
    <v-dialog v-model="dialogPoint" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Point Multiplier</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col>
                <v-text-field color="primary_red_1" type="number" v-model="setting.pointMultiplier"> </v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialogPoint = false">Cancel</v-btn>
          <v-btn color="success darken-1" @click="savePoint" text>Save</v-btn>
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
    Promise.all([this.getSetting()]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    dialogPoint: false,
    isLoading: true,
    skeletonLoaderItem: [0, 1, 2, 3, 4],
    lazyImg: lazyImg,
    success: false,
    error: false,
    errorMessage: '',
    successMessage: '',

    setting: {
      _id: '',
      lockDepotToDealer: true,
      pointMultiplier: 1000,
    },
  }),
  computed: {},

  watch: {},

  created() {
    // this.initialize();
  },

  methods: {
    async toggleLoctDepotToDealer() {
      const request = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/settings/${this.setting._id}`
        const config = {
          headers: headers,
          method: 'PUT',
          url: url,
          data: { lockDepotToDealer: this.setting.lockDepotToDealer },
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        try {
          await request()
          this.successAlert('Updated')
        } catch (error) {
          this.successAlert(error)
        }
      }
    },
    async setSetting() {
      const request = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/settings`
        const config = {
          headers: headers,
          method: 'POST',
          url: url,
          data: {
            pointMultiplier: 1000,
            lockDepotToDealer: true,
          },
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await request()
        console.log('setting', result.data)
      }
    },
    async getSetting() {
      const request = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/settings`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await request()
        if (result.data) {
          this.setting = result.data
          console.log('setting', this.setting)
        } else {
          await this.setSetting()
          await this.getSetting()
        }
      }
    },
    async savePoint() {
      const request = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/settings/${this.setting._id}`
        const config = {
          headers: headers,
          method: 'PUT',
          url: url,
          data: {
            pointMultiplier: this.setting.pointMultiplier,
          },
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        try {
          await request()
          this.successAlert('point updated')
          this.dialogPoint = false
        } catch (error) {
          this.successAlert(error)
        }
      }
    },
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
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
  },
  components: {
    Navbar,
  },

  mixins: [numberWithPeriod],
}
</script>
