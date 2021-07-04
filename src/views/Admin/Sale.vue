<template>
  <v-app>
    <nav>
      <Navbar main="tes main">
        <template v-slot:back>
          <v-btn
            small
            fab
            text
            color="primary_red_1"
            @click="$router.push('/featured')"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </template>
        <template v-slot:body>
          <v-toolbar-title>Sale</v-toolbar-title>
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
            <v-skeleton-loader
              type="list-item-avatar-three-line"
            ></v-skeleton-loader>
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
          >{{ successMessage }}</v-alert
        >
        <v-alert
          v-model="error"
          :value="error"
          transition="scale-transition"
          dismissible
          type="error"
          >{{ errorMessage }}</v-alert
        >
        <template>
          <v-data-table
            :headers="headers"
            :items="sales"
            sort-by="calories"
            class="elevation-1"
          >
            <template v-slot:top>
              <v-toolbar flat color="white">
                <v-toolbar-title>Product Brand</v-toolbar-title>
                <v-divider class="mx-4" inset vertical></v-divider>
                <v-spacer></v-spacer>
                <v-btn
                  color="primary_red_1"
                  dark
                  class="mb-2"
                  @click="dialog = true"
                  >New Item</v-btn
                >
              </v-toolbar>
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
            <template v-slot:item.lowestPrice="{ item }">
              <v-layout justify-end>
                {{
                  numberWithPeriod({
                    currency: 'Rp',
                    separator: '.',
                    number: item.lowestPrice,
                  })
                }}
              </v-layout>
            </template>
            <template v-slot:item.highestPrice="{ item }">
              <v-layout justify-end>
                {{
                  numberWithPeriod({
                    currency: 'Rp',
                    separator: '.',
                    number: item.highestPrice,
                  })
                }}
              </v-layout>
            </template>
            <template v-slot:item.action="{ item }">
              <v-icon small class="mr-2" @click="editItem(item)"
                >mdi-pencil</v-icon
              >
              <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
            </template>
            <template v-slot:no-data>
              <v-btn color="primary" @click="() => {}">Reset</v-btn>
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
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="editedItem.name"
                  label="Name"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeEditOrNew"
            >Cancel</v-btn
          >
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
          <v-btn color="blue darken-1" text @click="deleteDialog = false"
            >Cancel</v-btn
          >
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
import VClamp from 'vue-clamp';
import lazyImg from '../../assets/lazy-img.jpg';
import Navbar from '../../components/Navbar';
import { checkTokenExp, refreshToken } from '../../services';
import Axios from 'axios';
import { apiBaseUrl } from '../../api';
import numberWithPeriod from '../../mixins/numberWithPeriod';
export default {
  mounted() {
    Promise.all([this.loadSale()]).then(() => {
      this.isLoading = false;
    });
  },
  data: () => ({
    success: false,
    error: false,
    errorMessage: '',
    successMessage: '',
    item: {},
    sales: [],
    sales: [],
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
      { text: 'Name', value: 'name' },
      { text: 'Actions', value: 'action', sortable: false },
    ],
    editedIndex: -1,
    editedItem: {
      _id: '',
      name: '',
    },
    defaultItem: {
      _id: '',
      name: '',
    },
    sales: [],
    tempDelete: 0,
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item';
    },
  },

  watch: {
    dialog(val) {
      val || this.closeEditOrNew();
    },
  },

  created() {
    // this.initialize();
  },

  methods: {
    async updateSale() {
      const sale = {
        _id: this.editedItem._id,
        name: this.editedItem.name,
      };
      const requestUpdate = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'));
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        };
        const data = sale;
        const url = `${apiBaseUrl}/api/sale-orders/${sale._id}`;
        const config = {
          headers: headers,
          method: 'PUT',
          url: url,
          data: data,
        };
        try {
          const result = await Axios(config);
          this.successAlert('Updated');
          return result;
        } catch (error) {
          this.errorAlert(error);
          throw new Error(error);
        }
      };
      const checkToken = await checkTokenExp();
      if (checkToken === true) {
        return requestUpdate();
      }
    },
    async saveNewSale() {
      const sale = {
        name: this.editedItem.name,
      };
      console.log(sale);
      const requestSaveNew = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'));
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        };
        const data = sale;
        const url = `${apiBaseUrl}/api/sale-orders`;
        const config = {
          headers: headers,
          method: 'POST',
          url: url,
          data: data,
        };
        try {
          const result = await Axios(config);
          this.successAlert('Added');
          return result;
        } catch (error) {
          this.errorAlert(error);
          throw new Error(error);
        }
      };
      const checkToken = await checkTokenExp();
      if (checkToken === true) {
        return requestSaveNew();
      }
    },
    successAlert(message) {
      this.successMessage = message;
      this.success = true;
      setTimeout(() => {
        this.success = false;
      }, 5000);
    },
    errorAlert(message) {
      this.errorMessage = message;
      this.error = true;
      setTimeout(() => {
        this.error = false;
      }, 5000);
    },
    async loadSale() {
      const requestUnit = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'));
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        };
        const url = `${apiBaseUrl}/api/sale-orders`;
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        };
        const result = await Axios(config);
        this.sales = result.data.sales.map((sale, index) => ({
          ...sale,
          index,
        }));
      };

      const checkToken = await checkTokenExp();
      if (checkToken === true) {
        return requestUnit();
      }
    },
    editItem(item) {
      this.editedIndex = this.sales.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.item = item;
      const index = this.sales.indexOf(item);
      this.deleteDialog = true;
    },
    confirmDelete() {
      this.deleteSale().then(() => {
        const index = this.sales.indexOf(this.item);
        this.sales.splice(index, 1);
        this.sales = this.sales.map((sale, index) => ({
          ...sale,
          index,
        }));
      });
      this.closeDelete();
    },
    async deleteSale() {
      const sale = { ...this.item };
      const requestDelete = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'));
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        };
        const url = `${apiBaseUrl}/api/sale-orders/${sale._id}`;
        const config = {
          headers: headers,
          method: 'DELETE',
          url: url,
        };
        try {
          const result = await Axios(config);
          this.successAlert('Deleted');
          return result;
        } catch (error) {
          this.errorAlert(error);
          throw new Error();
        }
      };
      const checkToken = await checkTokenExp();
      if (checkToken === true) {
        return requestDelete();
      }
    },
    closeEditOrNew() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    closeDelete() {
      this.deleteDialog = false;
    },
    save() {
      if (this.editedIndex > -1) {
        // edit

        this.updateSale().then(() => {
          Object.assign(this.sales[this.editedIndex], this.editedItem);
        });
      } else {
        //add new
        this.saveNewSale().then(() => {
          this.sales.push({
            ...this.editedItem,
            index: this.sales.length,
          });
        });
      }
      this.closeEditOrNew();
    },
  },
  components: {
    Navbar,
  },

  mixins: [numberWithPeriod],
};
</script>
