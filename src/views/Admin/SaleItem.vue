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
          <v-toolbar-title>Sale Item</v-toolbar-title>
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
        <template>
          <v-data-table
            :headers="headers"
            :items="indexedUnits"
            sort-by="calories"
            class="elevation-1"
          >
            <template v-slot:top>
              <v-toolbar flat color="white">
                <v-toolbar-title>Unit</v-toolbar-title>
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
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="editedItem.description"
                  label="Description"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
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
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="deleteDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="blue darken-1" text>Delete</v-btn>
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
    Promise.all([this.loadUnit()]).then(() => {
      this.isLoading = false;
    });
  },
  data: () => ({
    isLoading: true,
    skeletonLoaderItem: [0, 1, 2, 3, 4],
    lazyImg: lazyImg,
    dialog: false,
    deleteDialog: false,
    headers: [
      { text: 'No', value: 'index' },
      { text: 'Name', value: 'name' },
      { text: 'Description', value: 'description' },
      { text: 'Actions', value: 'action', sortable: false },
    ],
    editedIndex: -1,
    editedItem: {
      _id: '',
      name: '',
      description: '',
    },
    defaultItem: {
      _id: '',
      name: '',
      description: '',
    },
    units: [],
    tempDelete: 0,
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item';
    },
    indexedUnits() {
      return this.units.map((unit, index) => ({ ...unit, index }));
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  created() {
    // this.initialize();
  },

  methods: {
    async loadUnit() {
      const requestUnit = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'));
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        };
        const url = `${apiBaseUrl}/api/units`;
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        };
        const result = await Axios(config);
        this.units = result.data.units;
      };

      const checkToken = await checkTokenExp();
      if (checkToken === true) {
        return requestUnit();
      }
    },
    editItem(item) {
      this.editedIndex = this.units.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      // const index = this.units.indexOf(item);
      // confirm('Are you sure you want to delete this item?') &&
      //   this.units.splice(index, 1);

      const index = this.units.indexOf(item);
      this.deleteDialog = true;
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.units[this.editedIndex], this.editedItem);
      } else {
        this.units.push(this.editedItem);
      }
      this.close();
    },
  },
  components: {
    Navbar,
  },

  mixins: [numberWithPeriod],
};
</script>
