<template>
  <v-layout>
    <v-row>
      <v-col cols="12">
        <div class="display-1 font-weight-thin">Selected Product</div>
      </v-col>
      <v-col cols="6" lg="3" md="3" sm="3" v-for="(recommended, index) in recommendeds" :key="index">
        <v-card outlined="">
          <v-img v-if="recommended.masterProduct.image.length == 0" aspect-ratio="1.78" :src="lazyImg"></v-img>
          <v-img
            v-if="recommended.masterProduct.image.length > 0"
            aspect-ratio="1.78"
            contain
            :src="apiImage(recommended.masterProduct.image[0].image)"
          ></v-img>
          <div class="pa-2">
            <div class="caption font-weight-bold">{{ recommended.masterProduct.name }}</div>
            <div class="caption primary_red_1--text">
              {{
                numberWithPeriod({
                  currency: 'Rp',
                  separator: '.',
                  number: recommended.masterProduct.price,
                })
              }}
            </div>
          </div>
          <v-divider></v-divider>
          <v-layout justify-space-around="" style="postition:absolute" class="py-2">
            <v-btn @click="editSelectedProduct(recommended, index + 1)" small text color="primary_red_1">
              <!-- <v-icon>mdi-pencil</v-icon> -->
              select
            </v-btn>
            <v-btn @click="removeSelectedProduct(index + 1)" small text color="primary_red_1">
              <!-- <v-icon>mdi-delete</v-icon> -->
              remove
            </v-btn>
          </v-layout>
        </v-card>
      </v-col>
    </v-row>

    <template>
      <v-dialog v-model="dialogMasterProduct" max-width="1600px">
        <v-card>
          <v-card-title>
            <span class="headline">Master Product</span>
            <v-spacer></v-spacer>
            <v-btn @click="closeDialogMasterProduct" fab="" text="" dark="" small="" color="primary_red_1">
              <v-icon>
                mdi-close
              </v-icon>
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>

          <v-card-text>
            <v-container>
              <template>
                <v-data-table
                  :headers="masterProductHeaders"
                  :items="masterProducts"
                  sort-by="index"
                  class="elevation-1"
                >
                  <template v-slot:top>
                    <v-card flat class="px-3 py-3">
                      <v-row>
                        <v-col class="py-0">
                          <v-text-field
                            v-on:keyup.13="searchDataTableMasterProduct"
                            outlined
                            v-model="searchMasterProduct"
                            dense
                            color="primary_red_1"
                            label="Search"
                          >
                            <template v-slot:append>
                              <v-btn @click="searchDataTableMasterProduct" small text color="primary_grey_1">
                                <v-icon>mdi-magnify</v-icon>
                              </v-btn>
                            </template>
                          </v-text-field>
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
                          <v-chip @click="setSelectedProduct(item)" dark="" color="primary_red_1">Select</v-chip>
                        </template>
                        <span>Select</span>
                      </v-tooltip>
                    </div>
                  </template>

                  <template v-slot:item.image[0].image="{ item }">
                    <v-layout justify-end>
                      <v-avatar tile>
                        <v-img :alt="lazyImg" :src="apiImage(item.image[0].image)" aspect-ratio="3"></v-img>
                      </v-avatar>
                    </v-layout>
                  </template>
                </v-data-table>
              </template>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
        </v-card>
      </v-dialog>
    </template>
    <v-snackbar v-model="snackbar">
      {{ snackbarText }}
      <v-btn color="primary_red_1" text @click="snackbar = false">
        Close
      </v-btn>
    </v-snackbar>
  </v-layout>
</template>
<script>
import lazyImg from '../../assets/lazy-img.jpg'
import { checkTokenExp, refreshToken } from '../../services'
import Axios from 'axios'
import { apiBaseUrl } from '../../api'
import numberWithPeriod from '../../mixins/numberWithPeriod'
export default {
  mounted() {
    Promise.allSettled([
      //
      this.getMasterProducts(),
      this.getSelectedProducts(),
      //
    ])
      .then(() => {
        //
      })
      .catch((error) => {
        //
      })
  },
  data: () => ({
    snackbar: false,
    snackbarText: '',
    lazyImg: lazyImg,
    update: false,
    recommendeds: [],
    position: 0,
    selectedProduct: {},
    searchMasterProduct: '',
    masterProducts: [],
    dialogMasterProduct: false,
    masterProductHeaders: [
      { text: 'No', value: 'index' },
      { text: 'Name', value: 'name' },
      { text: 'Nama Bengkel', value: 'localShopName' },
      { text: 'Part Code', value: 'partCode' },
      { text: 'Image', value: 'image[0].image' },
      { text: 'Actions', value: 'action', sortable: false },
    ],
  }),
  methods: {
    async getSelectedProducts() {
      const request = () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/selected-products`
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
        const [item1, item2, item3, item4] = result.data.selectedProducts
        const item = {
          _id: '',
          productPartCode: '',
          postition: 0,
          masterProduct: {
            name: 'No Item',
            price: 0,
            image: [],
            partCode: '',
          },
        }
        this.recommendeds = [item1 || item, item2 || item, item3 || item, item4 || item]
        console.log(result.data)
      }
    },
    async getMasterProducts() {
      const request = () => {
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
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const result = await request()
        this.masterProducts = result.data.masterProducts.map((element, index) => ({
          ...element,
          index,
        }))
      }
    },
    async removeSelectedProduct(position) {
      const selectedProduct = {
        productPartCode: '',
        postition: position,
        masterProduct: {
          name: 'No Item',
          price: 0,
          image: [],
          partCode: '',
        },
      }
      this.$set(this.recommendeds, position - 1, selectedProduct)
      try {
        await this.deleteSelectedProduct({
          position: position,
        })
        this.showSnacbar('removed')
      } catch (error) {
        this.showSnacbar(error)
      }
    },
    editSelectedProduct(item, position) {
      this.dialogMasterProduct = true
      this.selectedProduct = item
      this.position = position
    },
    closeDialogMasterProduct() {
      this.dialogMasterProduct = false
    },
    async searchDataTableMasterProduct() {
      const requestSearch = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/master-products?keyword=${this.searchMasterProduct}`
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
        this.masterProducts = result.data.masterProducts.map((element, index) => ({
          ...element,
          index,
        }))
      }
    },
    async setSelectedProduct(item) {
      const selectedProduct = {
        productPartCode: item.partCode,
        masterProduct: item,
        position: this.position,
      }
      this.recommendeds[this.position - 1] = selectedProduct
      try {
        await this.createSelectedProduct({
          productPartCode: item.partCode,
          masterProductId: item._id,
          position: this.position,
        })
        this.showSnacbar('success')
      } catch (error) {
        this.showSnacbar(error)
      }
      this.closeDialogMasterProduct()
    },
    showSnacbar(message) {
      this.snackbar = true
      this.snackbarText = message
    },
    async deleteSelectedProduct(selectedProduct) {
      const request = (selectedProduct) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/selected-products/${selectedProduct.position}`
        const config = {
          headers: headers,
          method: 'DELETE',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        await request(selectedProduct)
      }
    },
    async createSelectedProduct(selectedProduct) {
      const request = (selectedProduct) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/selected-products`
        const config = {
          headers: headers,
          method: 'POST',
          url: url,
          data: selectedProduct,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        await request(selectedProduct)
      }
    },
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
  },
  mixins: [numberWithPeriod],
}
</script>
