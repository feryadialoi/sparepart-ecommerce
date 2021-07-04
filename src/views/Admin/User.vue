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
          <v-toolbar-title>User</v-toolbar-title>
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
        <v-data-table :headers="headers" :items="users" sort-by="index" class="elevation-1">
          <template v-slot:top>
            <v-card flat class="px-3 py-3">
              <v-row>
                <v-col class="py-0" cols="12" lg="5" md="6" sm="12">
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
                <v-col class="py-0" cols="12" lg="3" md="6" sm="12">
                  <v-select
                    dense
                    :items="userRoles"
                    v-model="userRole"
                    @change="selectUserRole"
                    outlined
                    item-text="name"
                    label="User Role"
                    return-object
                    color="primary_red_1"
                  ></v-select>
                </v-col>
                <v-col class="py-0" cols="12" lg="4" md="12" sm="12">
                  <v-layout justify-end>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          v-on="on"
                          :disabled="userImport.isImporting"
                          :dark="!userImport.isImporting"
                          class="ml-2 mb-1"
                          @click="openDialogImport"
                          color="primary_red_1"
                        >
                          <v-progress-circular
                            v-if="userImport.isImporting"
                            class="mr-2"
                            :size="20"
                            :width="3"
                            color="primary_red_1"
                            indeterminate
                          ></v-progress-circular>
                          <!-- {{ userImport.isImporting ? 'Importing': 'import csv'}} -->
                          <v-icon>mdi-file-import</v-icon>
                        </v-btn>
                      </template>
                      <span>Import CSV</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          v-on="on"
                          class="ml-2 mb-1"
                          color="primary_red_1"
                          dark
                          @click="dialogMonitoringImport = true"
                        >
                          <v-icon>mdi-progress-upload</v-icon>
                        </v-btn>
                      </template>
                      <span>Import Progress</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          v-on="on"
                          color="primary_red_1"
                          dark
                          class="ml-2 mb-1"
                          @click="dialogUserStoreAddress = true"
                        >
                          <!-- New User -->
                          <v-icon>mdi-plus-box</v-icon>
                        </v-btn>
                      </template>
                      <span>New User</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          v-on="on"
                          class="ml-2 mb-1"
                          color="primary_red_1"
                          dark
                          @click="expandHeader"
                        >
                          <v-icon>mdi-arrow-expand</v-icon>
                        </v-btn>
                      </template>
                      <span>Expand Table</span>
                    </v-tooltip>
                  </v-layout>
                </v-col>
              </v-row>
            </v-card>
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
    <!-- Delete Item ========================================================================== -->
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
    <v-dialog v-model="dialogImportUser" max-width="500px">
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
                  @click="downloadTemplateUser"
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
          <v-progress-circular
            v-if="isProgressImport"
            :size="30"
            :width="3"
            color="primary_red_1"
            indeterminate
          ></v-progress-circular>
          <div v-if="isProgressImport" class="ml-3 primary_grey_1--text">importing</div>

          <v-spacer></v-spacer>
          <v-btn outlined color="blue darken-1" dark @click="closeDialogImport">Cancel</v-btn>
          <v-btn outlined @click="submitImport" color="success darken-1">import</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- dialog import data csv END =================================================== -->

    <!-- create or update user store address -->
    <v-dialog v-model="dialogUserStoreAddress" max-width="1200px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="formUserStoreAddress" v-model="validUserStoreAddress" lazy-validation>
              <v-row>
                <v-col cols="12" lg="12" md="12" sm="12">
                  <div class="font-weight-thin display-1">User</div>
                </v-col>
                <v-col class="px-10 pa-lg-5" cols="12" sm="12" md="12">
                  <v-avatar
                    v-if="userImage == null && editedIndex !== -1 && editedItem.image !== ''"
                    size="100"
                  >
                    <v-img :src="apiImage(editedItem.image)"></v-img>
                  </v-avatar>
                  <v-avatar v-if="userImage != null" size="100">
                    <v-img :src="userImageUrl"></v-img>
                  </v-avatar>
                </v-col>

                <v-col cols="12" sm="12" md="12" class="pb-1">
                  <v-btn dark color="primary_red_1" @click="onPickFileUserImage">image</v-btn>
                  <input
                    type="file"
                    ref="fileInputUserImage"
                    style="display:none"
                    @change="onUserImageFilePicked"
                    accept="image/*"
                  />
                </v-col>
                <v-col cols="12" sm="12" md="12" class="py-0">
                  <div class="primary_red_1--text caption">{{ userImageErrorMessage }}</div>
                </v-col>
                <v-col cols="12" lg="12" md="12" sm="12">
                  <v-text-field
                    v-model="editedItem.name"
                    :rules="nameRules"
                    label="Name"
                    color="primary_red_1"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" lg="12" md="12" sm="12">
                  <v-text-field
                    v-model="editedItem.email"
                    :rules="emailRules"
                    label="Email"
                    color="primary_red_1"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" lg="12" md="12" sm="12">
                  <v-text-field
                    v-model="editedItem.phone"
                    :rules="phoneRules"
                    label="Phone"
                    color="primary_red_1"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" lg="12" md="12" sm="12">
                  <v-text-field
                    v-model="editedItem.customerId"
                    :rules="customerIdRules"
                    label="Customer Id"
                    color="primary_red_1"
                  ></v-text-field>
                </v-col>
                <v-col
                  v-if="editedIndex == -1 ? true : editedItem.role.name == 'depot' ? true : false"
                  cols="12"
                  lg="12"
                  md="12"
                  sm="12"
                >
                  <v-text-field
                    v-model="editedItem.dealerCustomerId"
                    label="Dealer Customer ID"
                    color="primary_red_1"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" lg="12" md="12" sm="12">
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
                <v-col v-if="editedIndex == -1" cols="12" lg="12" md="12" sm="12">
                  <v-text-field
                    v-model="editedItem.password"
                    :rules="[...passwordRules, rules.min]"
                    label="Password"
                    color="primary_red_1"
                    :type="showPassword ? 'text' : 'password'"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="showPassword = !showPassword"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row v-if="showStoreForm()">
                <v-col cols="12" lg="12" md="12" sm="12">
                  <div class="font-weight-thin display-1">Store</div>
                </v-col>

                <v-col class="px-10 pa-lg-5" cols="12" sm="12" md="12">
                  <v-avatar
                    v-if="storeImage == null && editedIndex !== -1 && editedItem.storeId.image !== ''"
                    size="100"
                  >
                    <v-img :src="apiImage(editedItem.storeId.image)"></v-img>
                  </v-avatar>
                  <v-avatar v-if="storeImage != null" size="100">
                    <v-img :src="storeImageUrl"></v-img>
                  </v-avatar>
                </v-col>

                <v-col cols="12" sm="12" md="12" class="pb-1">
                  <v-btn dark color="primary_red_1" @click="onPickFileStoreImage">image</v-btn>
                  <input
                    type="file"
                    ref="fileInputStoreImage"
                    style="display:none"
                    @change="onStoreImageFilePicked"
                    accept="image/*"
                  />
                </v-col>
                <v-col cols="12" sm="12" md="12" class="py-0">
                  <div class="primary_red_1--text caption">{{ storeImageErrorMessage }}</div>
                </v-col>

                <v-col cols="12" lg="12" md="12" sm="12">
                  <v-text-field
                    v-model="editedItem.storeId.name"
                    :rules="storeRules"
                    label="Store Name"
                    color="primary_red_1"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" lg="12" md="12" sm="12">
                  <v-text-field
                    v-model="editedItem.storeId.pic"
                    :rules="picRules"
                    label="PIC"
                    color="primary_red_1"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" lg="12" md="12" sm="12">
                  <v-select
                    color="primary_red_1"
                    :items="['H1', 'H2', 'H3', 'H12', 'H13', 'H23']"
                    v-model="editedItem.storeId.status"
                    label="Status"
                    :rules="statusRules"
                    item-text="name"
                    return-object
                  ></v-select>
                </v-col>
              </v-row>
              <v-row v-if="showAddressForm()">
                <v-col cols="12" lg="12" md="12" sm="12">
                  <div class="font-weight-thin display-1">Address</div>
                </v-col>

                <v-col cols="12" lg="12" md="12" sm="12">
                  <v-text-field
                    v-model="editedItem.addressId.name"
                    :rules="addressRules"
                    label="Address Name"
                    color="primary_red_1"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" lg="12" md="12" sm="12">
                  <v-select
                    color="primary_red_1"
                    :items="['true', 'false']"
                    v-model="editedItem.addressId.isMain"
                    label="Is Main"
                    :rules="isMainRules"
                    item-text="name"
                    return-object
                  ></v-select>
                </v-col>
                <v-col cols="12" lg="12" md="12" sm="12">
                  <v-text-field
                    v-model="editedItem.addressId.area"
                    :rules="areaRules"
                    label="Area"
                    color="primary_red_1"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" lg="12" md="12" sm="12">
                  <v-text-field
                    v-model="editedItem.addressId.location.latitude"
                    label="Location Latitude"
                    color="primary_red_1"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" lg="12" md="12" sm="12">
                  <v-text-field
                    v-model="editedItem.addressId.location.longitude"
                    label="Location Longitude"
                    color="primary_red_1"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" lg="12" md="12" sm="12">
                  <v-text-field
                    v-model="editedItem.addressId.description"
                    label="Description"
                    color="primary_red_1"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialogUserStoreAddress = false">Cancel</v-btn>
          <v-btn color="green darken-1" @click="saveUser" text>Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- create or update user store address END -->

    <!-- dialog monitoring import -->
    <v-dialog v-model="dialogMonitoringImport" max-width="900px">
      <v-card>
        <v-card-title>
          <span class="headline">Import User</span>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogMonitoringImport = false">close</v-btn>
        </v-card-title>
        <v-card-text>
          <v-container>
            <span class>Progress</span>
            <span>
              {{
              `(${currentPosition} of ${json.length}) ${
              json.length > 0 ? roundUp((currentPosition * 100) / json.length, 2) + '%' : ''
              }`
              }}
              <v-chip
                small
                color="success"
                v-if="currentPosition == json.length && json.length > 0"
              >done</v-chip>
            </span>
            <v-alert
              v-model="importError"
              :value="importError"
              transition="scale-transition"
              dismissible
              type="error"
            >{{ `error ${importErrorMessage}, data number ${currentPosition}` }}</v-alert>

            <v-layout class="mb-2">
              <v-btn
                outlined
                class="mr-2"
                v-if="importError"
                dark
                color="primary_red_1"
                @click="executeImport"
              >continue import</v-btn>
              <v-btn
                outlined
                v-if="importError"
                dark
                color="primary_red_1"
                @click="importContinueAll"
              >continue import all</v-btn>
            </v-layout>
            <v-data-table
              loading-text="loading import products..."
              :headers="jsonHeaders"
              :items="json"
              sort-by="index"
              class="elevation-1"
            >
              <template v-slot:item.isSale="{ item }">
                <div>{{ item.isSale == 1 ? 'yes' : 'no' }}</div>
              </template>
              <template v-slot:item.statusImport="{ item }">
                <v-chip
                  class="mx-1"
                  small
                  :color="
                    item.statusImport == 'success' ? 'success' : item.statusImport == 'error' ? 'primary_red_1' : 'grey'"
                  dark
                >{{ item.statusImport }}</v-chip>
              </template>
            </v-data-table>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <!-- <v-btn
            :disabled="!(currentPosition == json.length && json.length > 0)"
            :dark="(currentPosition == json.length && json.length > 0)"
            color="blue darken-1"
            @click="downloadImportReport"
          >download import report</v-btn>
          <v-btn dark color="blue darken-1" @click="dialogMonitoringImport = false">close</v-btn>-->
          <div>
            <v-row>
              <v-col sm="6">
                <v-layout justify-center>
                  <v-btn
                    text
                    class="mx-1"
                    dark
                    color="blue darken-1"
                    @click="downloadImportReport"
                  >download import report</v-btn>
                </v-layout>
              </v-col>
              <v-col sm="6">
                <v-layout justify-center>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        small
                        text
                        class="mx-1"
                        dark
                        color="blue darken-1"
                        @click="pauseImportState"
                      >
                        <v-icon>mdi-pause</v-icon>
                      </v-btn>
                    </template>
                    <span>pause</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        small
                        text
                        class="mx-1"
                        dark
                        color="blue darken-1"
                        @click="continueImportState"
                      >
                        <v-icon>mdi-play</v-icon>
                      </v-btn>
                    </template>
                    <span>continue</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        small
                        text
                        class="mx-1"
                        dark
                        color="blue darken-1"
                        @click="resetImportState"
                      >
                        <v-icon>mdi-stop</v-icon>
                      </v-btn>
                    </template>
                    <span>stop</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        small
                        text
                        class="mx-1"
                        dark
                        color="blue darken-1"
                        @click="dialogMonitoringImport = false"
                      >
                        <v-icon>mdi-window-minimize</v-icon>
                      </v-btn>
                    </template>
                    <span>minimize</span>
                  </v-tooltip>
                </v-layout>
              </v-col>
            </v-row>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- dialog monitoring import END -->
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
import roundUp from '../../mixins/roundUp'
import FormData from 'form-data'
import firebase from '../../api/firebase'
import { separator } from '../../services/csvConfig'
export default {
  mounted() {
    Promise.all([this.importStatus(), this.loadUsers(), this.loadRole()]).then(() => {
      this.isLoading = false
    })
  },
  data: () => ({
    isProgressImport: false,
    dialogUserStoreAddress: false,
    validUserStoreAddress: true,

    userRoles: [
      { name: 'Admin', param: 'admin' },
      { name: 'Dealer', param: 'dealer' },
      { name: 'Depot', param: 'depot' },
      { name: 'All', param: '' },
    ],
    userRole: { name: 'All', param: '' },
    search: '',
    showPassword: false,

    imageUrl: '',
    image: null,

    userImageErrorMessage: '',
    userImageUrl: '',
    userImage: null,

    storeImageErrorMessage: '',
    storeImageUrl: '',
    storeImage: null,
    valid: true,
    validStore: true,
    validAddress: true,

    nameRules: [(v) => !!v || 'Name is required'],
    customerIdRules: [(v) => !!v || 'Customer Id is required'],
    dealerCustomerIdRules: [(v) => !!v || 'Dealer Customer Id is required'],
    roleRules: [(v) => !!v || 'Role is required'],
    phoneRules: [(v) => !!v || 'Phone is required'],
    passwordRules: [(v) => !!v || 'Password is required'],

    storeRules: [(v) => !!v || 'Store name is required'],
    picRules: [(v) => !!v || 'Pic is required'],
    statusRules: [(v) => !!v || 'Status is required'],

    areaRules: [(v) => !!v || 'Area is required'],
    addressRules: [(v) => !!v || 'Address name is required'],
    latitudeRules: [(v) => !!v || 'Latitude is required'],
    longitudeRules: [(v) => !!v || 'Longitude is required'],
    isMainRules: [(v) => !!v || 'Is Main is required'],
    descriptionRules: [(v) => !!v || 'Description is required'],

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

    successUser: false,
    errorUser: false,
    errorMessageUser: '',
    successMessageUser: '',

    successStore: false,
    errorStore: false,
    errorMessageStore: '',
    successMessageStore: '',

    successAddress: false,
    errorAddress: false,
    errorMessageAddress: '',
    successMessageAddress: '',

    dialog: false,
    deleteDialog: false,
    isLoading: true,
    skeletonLoaderItem: [0, 1, 2, 3, 4],
    lazyImg: lazyImg,
    headers: [
      { text: 'Name', value: 'name' },
      { text: 'Toko', value: 'storeId.name' },
      { text: 'Alamat', value: 'addressId.name' },
      { text: 'Actions', value: 'action', sortable: false },
    ],
    toggleHeader: true,
    item: {},
    users: [],
    roles: [],
    editedIndex: -1,
    editedItem: {
      _id: '',
      customerId: '',
      dealerCustomerId: '',
      name: '',
      role: {
        name: '',
      },
      email: '',
      phone: '',
      password: '',
      storeId: {
        _id: '',
        name: '',
        userId: '',
        status: '',
        pic: '',
      },
      addressId: {
        _id: '',
        name: '',
        userId: '',
        area: '',
        description: '',
        location: {
          latitude: '',
          longitude: '',
        },
        isMain: 'true',
      },
    },

    defaultItem: {
      _id: '',
      customerId: '',
      dealerCustomerId: '',
      name: '',
      role: {
        name: '',
      },
      email: '',
      phone: '',
      password: '',
      storeId: {
        _id: '',
        name: '',
        userId: '',
        status: '',
        pic: '',
      },
      addressId: {
        _id: '',
        name: '',
        userId: '',
        area: '',
        description: '',
        location: {
          latitude: '',
          longitude: '',
        },
        isMain: 'true',
      },
    },
    dialogChangePassword: false,
    changePassword: {
      _id: '',
      name: '',
      password: '',
    },
    validChangePassword: true,

    // import csv
    dialogImportUser: false,
    csvUrl: '',
    csv: null,
    csvName: '',
    csvErrorMessage: '',

    userImport: {
      _id: '',
      name: 'user',
      isImporting: false,
    },

    // new import method
    json: [],
    backupI: 0,
    currentPosition: 0,
    continueAll: false,
    importError: false,
    importErrorMessage: '',
    continue: true,

    jsonHeaders: [
      { text: 'no', value: 'no' },
      { text: 'customerId', value: 'customerId' },
      { text: 'dealerCustomerId', value: 'dealerCustomerId' },
      { text: 'name', value: 'name' },
      { text: 'email', value: 'email' },
      { text: 'phone', value: 'phone' },
      { text: 'role', value: 'role' },
      { text: 'store', value: 'store' },
      { text: 'pic', value: 'pic' },
      { text: 'status', value: 'status' },
      { text: 'address', value: 'address' },
      { text: 'area', value: 'area' },
      { text: 'latitude', value: 'latitude' },
      { text: 'longitude', value: 'longitude' },
      { text: 'statusImport', value: 'statusImport' },
      { text: 'message', value: 'message' },
    ],
    dialogMonitoringImport: false,
  }),
  components: {
    Navbar,
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New User' : 'Edit User'
    },
  },

  watch: {
    dialog(val) {
      val || this.closeEditOrNew()
    },
    dialogUserStoreAddress(val) {
      val || this.closeEditOrNew()
    },
  },

  created() {
    // this.initialize();
  },
  methods: {
    // new import method
    downloadImportReport() {
      let templates = this.json
      let template2DArrayHeader = []
      let template2DArrayBody = []
      console.log('templates', templates)
      if (templates.length > 0) {
        templates = templates.map((element) => ({
          customerId: element.customerId,
          dealerCustomerId: element.dealerCustomerId,
          name: element.name,
          email: element.email,
          phone: element.phone,
          role: element.role,
          store: element.store,
          pic: element.pic,
          status: element.status,
          address: element.address,
          area: element.area,
          latitude: element.latitude,
          longitude: element.longitude,
          password: '123456',
          statusImport: element.statusImport,
          message: element.message,
        }))
      } else {
        templates = [
          {
            customerId: '',
            dealerCustomerId: '',
            name: '',
            email: '',
            phone: '',
            role: '',
            store: '',
            pic: '',
            status: '',
            address: '',
            area: '',
            latitude: '',
            longitude: '',
            password: '123456',
            statusImport: '',
            message: '',
          },
        ]
      }
      for (const header in templates[0]) {
        template2DArrayHeader.push(header)
      }
      template2DArrayBody = templates.map((element) => template2DArrayHeader.map((item) => element[item]))

      const template2DArray = [template2DArrayHeader, ...template2DArrayBody]

      let CsvString = ''
      template2DArray.forEach(function(RowItem) {
        RowItem.forEach(function(ColItem) {
          CsvString += ColItem + separator
        })
        CsvString += '\r\n'
      })
      CsvString = 'data:application/csv,' + encodeURIComponent(CsvString)
      let x = document.createElement('A')
      x.setAttribute('href', CsvString)
      x.setAttribute('download', 'import-report-users.csv')
      document.body.appendChild(x)
      x.click()
    },
    importContinueAll() {
      this.continueAll = true
      this.executeImport()
    },
    async requestImport(data) {
      const { token } = JSON.parse(localStorage.getItem('auth'))
      const headers = {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      }
      const url = `${apiBaseUrl}/api/users/import-users`
      const config = {
        headers: headers,
        method: 'POST',
        url: url,
        data: data,
      }
      return Axios(config)
    },
    parsingCsv() {
      const { token } = JSON.parse(localStorage.getItem('auth'))
      const headers = {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      }
      const url = `${apiBaseUrl}/api/csv-parser/users`
      const data = new FormData()
      data.append('csv', this.csv)
      const config = {
        headers: headers,
        method: 'POST',
        url: url,
        data: data,
      }
      return Axios(config)
    },
    async submitImport() {
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        try {
          this.backupI = 0
          this.currentPosition = 0
          this.isProgressImport = true
          const response = await this.parsingCsv()
          this.isProgressImport = false
          this.dialogImportUser = false
          const data = response.data
          this.json = data.json

          this.json = this.json.map((item, index) => ({
            ...item,
            no: index + 1,
            statusImport: 'processing',
            message: 'waiting',
          }))
          this.dialogMonitoringImport = true
          this.executeImport()
        } catch (error) {
          this.errorAlert(error.response.data)
        }
      }
    },
    async executeImport() {
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        const start = new Date().valueOf()
        this.backupI = this.currentPosition
        this.resetImportError()
        for (let i = this.backupI; i < this.json.length; i++) {
          try {
            const response = await this.requestImport(this.json[i])
            this.json[i].statusImport = response.data.statusImport
            this.json[i].message = response.data.message
            this.currentPosition = i + 1
            if (this.currentPosition % 1000 == 0) {
              console.log(`imported in ${this.currentPosition} ${new Date().valueOf() - start}ms`)
            }
            if (this.continue) {
              continue
            } else {
              break
            }
          } catch (error) {
            if (this.currentPosition % 1000 == 0) {
              console.log(`imported in ${this.currentPosition} ${new Date().valueOf() - start}ms`)
            }
            console.log(error.response)
            this.currentPosition = i + 1
            this.json[i].statusImport = error.response.data.statusImport
            this.json[i].message = error.response.data.message
            this.importErrorMessage = error.response.data.message
            this.importError = true

            if (this.continueAll) {
              continue
            } else {
              break
            }
          }
        }
        console.log(`imported in ${new Date().valueOf() - start}ms`)
      }
    },
    resetImportError() {
      this.importError = false
      this.importErrorMessage = ''
    },

    resetImportState() {
      this.resetImportError()
      this.backupI = 0
      this.currentPosition = 0
      this.continueAll = false
      this.continue = true
      this.json = []
    },
    continueImportState() {
      this.continue = true
      this.executeImport()
    },
    pauseImportState() {
      this.continue = false
    },

    // new import method end

    async importStatus() {
      // const request = () => {
      //   const { token } = JSON.parse(localStorage.getItem('auth'))
      //   const headers = {
      //     Authorization: 'Bearer ' + token,
      //     'Content-Type': 'application/json',
      //   }
      //   const url = `${apiBaseUrl}/api/import-job-queues?name=user`
      //   const config = {
      //     headers: headers,
      //     method: 'GET',
      //     url: url,
      //   }
      //   return Axios(config)
      // }
      // const checkToken = await checkTokenExp()
      // if (checkToken === true) {
      //   const response = await request()
      //   const [userImport] = response.data.jobs
      //   if (userImport) {
      //     this.userImport = userImport
      //   }
      // }
      firebase
        .database()
        .ref('import-job')
        .orderByChild('name')
        .equalTo('user')
        .on('value', (snapshot) => {
          console.log('user', snapshot.val())
          let userImport
          for (const key in snapshot.val()) {
            userImport = snapshot.val()[key]
          }
          this.userImport = userImport
        })
    },
    showStoreForm() {
      if (this.editedIndex == -1 && this.editedItem.role.name == 'dealer') {
        // console.log(1)
        return true
      } else if (this.editedIndex > -1 && this.editedItem.role.name == 'dealer') {
        // console.log(2)
        return true
      } else {
        // console.log(3)
        return false
      }
    },
    showAddressForm() {
      if (this.editedIndex == -1 && (this.editedItem.role.name == 'dealer' || this.editedItem.role.name == 'depot')) {
        // console.log(1)
        return true
      } else if (
        this.editedIndex > -1 &&
        (this.editedItem.role.name == 'dealer' || this.editedItem.role.name == 'depot')
      ) {
        // console.log(2)
        return true
      } else {
        // console.log(3)
        return false
      }
    },
    validateUserStoreAddress() {
      return this.$refs.formUserStoreAddress.validate()
    },
    resetFormUserStoreAddress() {
      this.$refs.formUserStoreAddress.reset()
    },
    resetValidationUserStoreAddress() {
      this.$refs.formUserStoreAddress.resetValidation()
    },
    onPickFileUserImage() {
      this.$refs.fileInputUserImage.click()
    },
    onUserImageFilePicked(event) {
      const files = event.target.files
      let filename = files[0].name
      if (filename.lastIndexOf('.') <= 0) {
        return alert('Please add a valid file!')
      }
      const fileReader = new FileReader()
      fileReader.addEventListener('load', () => {
        this.userImageUrl = fileReader.result
      })
      fileReader.readAsDataURL(files[0])
      this.userImage = files[0]

      this.userImageErrorMessage = ''
    },

    onPickFileStoreImage() {
      this.$refs.fileInputStoreImage.click()
    },
    onStoreImageFilePicked(event) {
      const files = event.target.files
      let filename = files[0].name
      if (filename.lastIndexOf('.') <= 0) {
        return alert('Please add a valid file!')
      }
      const fileReader = new FileReader()
      fileReader.addEventListener('load', () => {
        this.storeImageUrl = fileReader.result
      })
      fileReader.readAsDataURL(files[0])
      this.storeImage = files[0]

      this.storeImageErrorMessage = ''
    },
    async createUserStoreAddress() {
      const validateUserStoreAddress = this.validateUserStoreAddress()

      const request = async () => {
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          const { token } = JSON.parse(localStorage.getItem('auth'))
          const headers = {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'multipart/form-data',
          }
          let data = new FormData()

          data.append('users', this.userImage)
          data.append(
            'user',
            JSON.stringify({
              name: this.editedItem.name,
              email: this.editedItem.email,
              phone: this.editedItem.phone,
              role: this.editedItem.role.name,
              customerId: this.editedItem.customerId,
              password: this.editedItem.password,
              dealerCustomerId: this.editedItem.dealerCustomerId,
            }),
          )
          if (this.editedItem.role.name == 'dealer') {
            data.append('stores', this.storeImage)
            data.append(
              'store',
              JSON.stringify({
                name: this.editedItem.storeId.name,
                customerId: this.editedItem.customerId,
                pic: this.editedItem.storeId.pic,
                status: this.editedItem.storeId.status,
              }),
            )
          }
          data.append(
            'address',
            JSON.stringify({
              name: this.editedItem.addressId.name,
              customerId: this.editedItem.customerId,
              isMain: this.editedItem.addressId.isMain,
              area: this.editedItem.addressId.area,
              location: {
                latitude:
                  this.editedItem.addressId.location.latitude.length === 0
                    ? '-'
                    : this.editedItem.addressId.location.latitude,
                longitude:
                  this.editedItem.addressId.location.longitude.length === 0
                    ? '-'
                    : this.editedItem.addressId.location.longitude,
              },
              description:
                this.editedItem.addressId.description.length === 0 ? '-' : this.editedItem.addressId.description,
            }),
          )
          const url = `${apiBaseUrl}/api/users/store-address`
          const config = {
            headers: headers,
            method: 'POST',
            url: url,
            data: data,
          }
          return Axios(config)
        }
      }

      if (validateUserStoreAddress && this.userImage) {
        if (this.editedItem.role.name == 'dealer' && this.storeImage) {
          return request()
        } else if (this.editedItem.role.name !== 'dealer') {
          return request()
        }
      } else {
        if (!this.userImage) {
          this.userImageErrorMessage = 'User image not selected'
        }
        if (this.editedItem.role.name == 'dealer' && !this.storeImage) {
          this.storeImageErrorMessage = 'Store image not selected'
        }
        throw new Error('invalid input!')
      }
    },
    async updateUserStoreAddress() {
      const validateUserStoreAddress = this.validateUserStoreAddress()
      if (validateUserStoreAddress) {
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          const { token } = JSON.parse(localStorage.getItem('auth'))
          const headers = {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'multipart/form-data',
          }
          let data = new FormData()

          // user
          data.append('users', this.userImage)
          data.append(
            'user',
            JSON.stringify({
              _id: this.editedItem._id,
              name: this.editedItem.name,
              email: this.editedItem.email,
              phone: this.editedItem.phone,
              role: this.editedItem.role.name,
              customerId: this.editedItem.customerId,
              dealerCustomerId: this.editedItem.dealerCustomerId,
            }),
          )
          // store
          if (this.editedItem.role.name == 'dealer') {
            data.append('stores', this.storeImage)
            data.append(
              'store',
              JSON.stringify({
                _id: this.editedItem.storeId._id,
                name: this.editedItem.storeId.name,
                customerId: this.editedItem.customerId,
                pic: this.editedItem.storeId.pic,
                status: this.editedItem.storeId.status,
              }),
            )
          }

          // address
          data.append(
            'address',
            JSON.stringify({
              _id: this.editedItem.addressId._id,
              name: this.editedItem.addressId.name,
              customerId: this.editedItem.customerId,
              isMain: this.editedItem.addressId.isMain,
              area: this.editedItem.addressId.area,
              location: this.editedItem.addressId.location,
              description: this.editedItem.addressId.description,
            }),
          )
          const url = `${apiBaseUrl}/api/users/store-address/${this.editedItem._id}`
          const config = {
            headers: headers,
            method: 'PUT',
            url: url,
            data: data,
          }
          return Axios(config)
        }
      } else {
        throw new Error('invalid input!')
      }
    },
    expandHeader() {
      this.toggleHeader = !this.toggleHeader
      const smallHeader = [
        // { text: 'No', value: 'index' },
        { text: 'Name', value: 'name' },
        // { text: 'Customer Id', value: 'customerId' },
        // { text: 'Role', value: 'role.name' },
        // { text: 'Email', value: 'email' },
        // { text: 'Phone', value: 'phone' },
        { text: 'Toko', value: 'storeId.name' },
        { text: 'Alamat', value: 'addressId.name' },
        // { text: 'Image', value: 'image' },
        { text: 'Actions', value: 'action', sortable: false },
      ]
      const expandedHeader = [
        { text: 'No', value: 'index' },
        { text: 'Name', value: 'name' },
        { text: 'Customer Id', value: 'customerId' },
        { text: 'Dealer Customer Id', value: 'dealerCustomerId' },
        { text: 'Role', value: 'role.name' },
        { text: 'Email', value: 'email' },
        { text: 'Phone', value: 'phone' },
        { text: 'Toko', value: 'storeId.name' },
        { text: 'Alamat', value: 'addressId.name' },
        { text: 'Image', value: 'image' },
        { text: 'Actions', value: 'action', sortable: false },
      ]
      this.toggleHeader ? (this.headers = smallHeader) : (this.headers = expandedHeader)
    },
    selectUserRole() {
      this.loadUsers()
    },
    // bulk data import
    downloadTemplateUser() {
      let templates = this.users
      let template2DArrayHeader = []
      let template2DArrayBody = []
      if (templates.length > 0) {
        templates = templates.map((element) => ({
          customerId: element.customerId,
          dealerCustomerId: element.dealerCustomerId,
          name: element.name,
          email: element.email,
          phone: element.phone,
          role: element.role.name,
          store: element.storeId ? element.storeId.name : '',

          pic: element.storeId ? element.storeId.pic : '',
          // buka: element.storeId ? element.storeId.isOpen : 1,
          status: element.storeId ? element.storeId.status : '',

          address: element.addressId ? element.addressId.name : '',
          area: element.addressId ? element.addressId.area : '',
          latitude: element.addressId ? (element.addressId.location ? element.addressId.location.latitude : '') : '',
          longitude: element.addressId ? (element.addressId.location ? element.addressId.location.longitude : '') : '',
          password: '123456',
        }))
      } else {
        templates = [
          {
            customerId: '',
            name: '',
            email: '',
            phone: '',
            role: '',
            store: '',
            // buka: 1,
            pic: '',
            status: '',
            address: '',
            area: '',
            latitude: '',
            longitude: '',
            password: '123456',
          },
        ]
      }

      for (const header in templates[0]) {
        template2DArrayHeader.push(header)
      }

      template2DArrayBody = templates.map((element) => template2DArrayHeader.map((item) => element[item]))
      const template2DArray = [template2DArrayHeader, ...template2DArrayBody]

      let CsvString = ''
      template2DArray.forEach(function(RowItem) {
        RowItem.forEach(function(ColItem) {
          CsvString += ColItem + separator
        })
        CsvString += '\r\n'
      })
      CsvString = 'data:application/csv,' + encodeURIComponent(CsvString)
      let x = document.createElement('A')
      x.setAttribute('href', CsvString)
      x.setAttribute('download', 'users-template.csv')
      document.body.appendChild(x)
      x.click()
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
      this.dialogImportUser = true
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
    closeDialogImport() {
      this.dialogImportUser = false
      this.csvUrl = ''
      this.csv = null
      this.csvName = ''
    },
    async importCsv() {
      const requestImport = (csv) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data',
        }
        let data = new FormData()
        data.append('csv', csv)
        const url = `${apiBaseUrl}/api/users/bulk`
        const config = {
          headers: headers,
          method: 'POST',
          url: url,
          data: data,
        }

        return Axios(config)
      }
      if (this.csv) {
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          try {
            const result = await requestImport(this.csv)
            return result
          } catch (error) {
            throw new Error(JSON.stringify(error.response.data.message))
          }
        }
      } else {
        this.csvErrorMessage = 'No csv file picked / selected!'
        throw new Error('invalid file!')
      }
    },

    // bulk data import END
    async searchDataTable() {
      const requestSearch = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/users?role=&keyword=${this.search}`
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
        this.users = result.data.users.map((user, index) => ({
          ...user,
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
    resetErrorMessageUserStoreAddress() {
      this.userImageErrorMessage = ''
      this.storeImageErrorMessage = ''
    },
    emptyFormDataUserStoreAddress() {
      this.userImage = null
      this.userImageUrl = ''
      this.storeImage = null
      this.storeImageUrl = ''
    },

    async updateUser() {
      const requestUpdate = async (user, image) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        let data = new FormData()
        data.append('image', image)
        data.append('name', user.name.trim())
        data.append('customerId', user.customerId.trim())
        data.append('role', user.role.trim())
        data.append('email', user.email.trim())
        data.append('phone', user.phone.trim())
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data',
        }
        const url = `${apiBaseUrl}/api/users/${user._id}`
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
        const user = {
          _id: this.editedItem._id,
          name: this.editedItem.name,
          customerId: this.editedItem.customerId,
          role: this.editedItem.role._id,
          email: this.editedItem.email,
          phone: this.editedItem.phone,
        }
        console.log('update user', user)
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          return requestUpdate(user, this.image)
        }
      } else {
        throw new Error('invalid input!')
      }
    },
    async saveNewUser() {
      const requestSaveNew = async (user, image) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }
        let data = new FormData()
        data.append('image', image)
        data.append('name', user.name.trim())
        data.append('customerId', user.customerId.trim())
        data.append('role', user.role.trim())
        data.append('email', user.email.trim())
        data.append('phone', user.phone.trim())
        data.append('password', user.password.trim())
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
        const user = {
          name: this.editedItem.name,
          customerId: this.editedItem.customerId,
          role: this.editedItem.role._id,
          email: this.editedItem.email,
          phone: this.editedItem.phone,
          password: this.editedItem.password,
        }
        const checkToken = await checkTokenExp()
        if (checkToken === true) {
          return requestSaveNew(user, this.image)
        }
      } else {
        this.imageErrorMessage = 'image is required'
        throw new Error('invalid input!')
      }
    },
    async loadUsers() {
      const requestUser = async () => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }

        const url = `${apiBaseUrl}/api/users?role=${this.userRole.param}`
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
        this.users = result.data.users.map((user, index) => ({
          ...user,
          index,
          storeId: user.role.name === 'admin' ? { name: '', status: '' } : user.storeId,
          addressId:
            user.role.name === 'admin'
              ? { name: '', area: '', description: '', isMain: 'true', location: { latitude: '', longitude: '' } }
              : { ...user.addressId, isMain: user.addressId ? user.addressId.isMain.toString() : 'isMain' },
        }))

        console.log(this.users)
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
        this.roles = result.data.roles
        // return requestUser();
      }
    },
    successAlert(message) {
      this.successMessage = message
      this.success = true
      // setTimeout(() => {
      //   this.success = false
      // }, 5000)
    },
    errorAlert(message) {
      this.errorMessage = message
      this.error = true
      // setTimeout(() => {
      //   this.error = false
      // }, 5000)
    },
    editItem(item) {
      this.editedIndex = this.users.indexOf(item)
      this.editedItem = Object.assign({}, item)
      // this.dialog = true
      this.dialogUserStoreAddress = true
    },

    deleteItem(item) {
      this.item = item
      this.deleteDialog = true
    },
    confirmDelete() {
      this.deleteUser().then(() => {
        const index = this.users.indexOf(this.item)
        this.users.splice(index, 1)
        this.users = this.users.map((user, index) => ({
          ...user,
          index,
        }))
        this.successAlert('Deleted')
      })
      this.closeDelete()
    },
    async deleteUser() {
      const requestDelete = async (user) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/users/${user._id}`
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
      const user = { ...this.item }
      const checkToken = await checkTokenExp()
      if (checkToken === true) {
        return requestDelete(user)
      }
    },
    closeEditOrNew() {
      this.dialogUserStoreAddress = false
      this.resetValidationUserStoreAddress()
      this.emptyFormDataUserStoreAddress()
      this.resetErrorMessageUserStoreAddress()
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
    closeDelete() {
      this.deleteDialog = false
    },
    saveUser() {
      if (this.editedIndex > -1) {
        this.updateUserStoreAddress()
          .then((response) => {
            console.log(response)
            this.loadUsers()
            this.successAlert('Updated')
            this.closeEditOrNew()
          })
          .catch((error) => {
            this.errorAlert(error)
          })
      } else {
        this.createUserStoreAddress()
          .then(() => {
            this.loadUsers()
            this.closeEditOrNew()
            this.successAlert('Added')
          })
          .catch((error) => {
            console.log(error)
            this.errorAlert(error)
          })
      }
    },
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
  },
  mixins: [roundUp],
}
</script>
