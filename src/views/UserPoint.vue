<template>
  <v-app>
    <nav>
      <Navbar main="tes main">
        <template v-slot:back>
          <v-btn small fab text color="primary_red_1" @click="$router.push('/')">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </template>
        <template v-slot:body>
          <v-toolbar-title>Histori poin</v-toolbar-title>
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
        <v-row v-if="points.length == 0">
          <v-col>
            <v-card outlined class="pa-3">
              <div class="caption primary_grey_1--text text-center">
                Belum ada poin
              </div>
            </v-card>
          </v-col>
        </v-row>
        <v-row class="px-1">
          <v-col v-for="point in points" :key="point._id" cols="12" sm="6" md="4" class="pa-2">
            <v-card flat hover outlined>
              <v-layout align-center>
                <div class="pa-2">
                  <v-avatar color="primary_red_1">
                    <!-- <div class="white--text display-1">{{ point.point }}</div> -->
                  </v-avatar>
                </div>
                <div class="pa-2">
                  <div class="caption font-weight-bold primary_red_1--text">{{ point.point }} poin</div>
                  <div class="caption font-weight primary_black_1--text">
                    {{ point.createdAt }}
                  </div>
                </div>
              </v-layout>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-footer>
      <v-layout justify-center>
        <div class="text-center">
          <v-pagination
            color="primary_red_1"
            v-model="pagePoint"
            :length="Math.ceil(pointCountAll / pointCount)"
            :total-visible="7"
          ></v-pagination>
        </div>
      </v-layout>
    </v-footer>
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
    Promise.all([this.loadPoint()]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    isLoading: true,
    skeletonLoaderItem: [0, 1, 2, 3, 4],
    lazyImg: lazyImg,
    points: [],
    pagePoint: 1,
    pointCount: 5,
    pointCountAll: 0,
  }),
  components: {
    Navbar,
  },
  methods: {
    async loadPoint() {
      const requestPoint = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        const userId = currentUser._id
        const url = `${apiBaseUrl}/api/points?userId=${userId}&page=${this.pagePoint}&count=${this.pointCount}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        const result = await Axios(config)
        console.log(result.data)
        this.points = result.data.points
        this.pointCountAll = result.data.count
      }

      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestPoint()
      }
    },
  },
  watch: {
    pagePoint: function() {
      this.loadPoint()
    },
  },
}
</script>
