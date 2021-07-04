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
          <v-toolbar-title>Profil Akun</v-toolbar-title>
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
        <v-row>
          <v-col cols="12" lg="12" md="12" sm="12">
            <v-layout align-end justify-center>
              <div>
                <v-layout align-end justify-end>
                  <v-avatar size="200">
                    <v-img :src="apiImage(currentUser.image)"></v-img>
                  </v-avatar>
                  <div style="position:absolute">
                    <v-btn @click="dialogImage = true" color="primary_red_1" dark small fab>
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </div>
                </v-layout>
              </div>
            </v-layout>
          </v-col>
          <v-col cols="12" lg="12" md="12" sm="12" class="py-2">
            <v-card class="pa-2" flat>
              <v-layout align-center justify-center>
                <div>
                  <div class="caption primary_black_1--text">Nama</div>
                  <div class="caption font-weight-bold primary_black_1--text">{{ currentUser.name }}</div>
                </div>
                <v-spacer></v-spacer>
                <div>
                  <v-btn
                    v-if="currentUser.role.name === 'admin'"
                    @click="dialogName = true"
                    color="primary_grey_3"
                    small
                    fab
                    text
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </div>
              </v-layout>
            </v-card>
          </v-col>
          <v-col cols="12" lg="12" md="12" sm="12" class="py-2">
            <v-card class="pa-2" flat>
              <v-layout align-center justify-center>
                <div>
                  <div class="caption primary_black_1--text">Email</div>
                  <div
                    class="caption font-weight-bold primary_black_1--text"
                  >{{ currentUser.email }}</div>
                </div>
                <v-spacer></v-spacer>
                <div>
                  <v-btn @click="dialogEmail = true" color="primary_grey_3" small fab text>
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </div>
              </v-layout>
            </v-card>
          </v-col>
          <v-col cols="12" lg="12" md="12" sm="12" class="py-2">
            <v-card class="pa-2" flat>
              <v-layout align-center justify-center>
                <div>
                  <div class="caption primary_black_1--text">Phone</div>
                  <div
                    class="caption font-weight-bold primary_black_1--text"
                  >{{ currentUser.phone }}</div>
                </div>
                <v-spacer></v-spacer>
                <div>
                  <v-btn @click="dialogPhone = true" color="primary_grey_3" small fab text>
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </div>
              </v-layout>
            </v-card>
          </v-col>
          <v-col cols="12" lg="12" md="12" sm="12">
            <!-- <v-card class="pa-2" flat> -->
            <div>
              <v-btn @click="openDialogPassword" color="primary_red_1" block dark>ganti password</v-btn>
            </div>
            <!-- </v-card> -->
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <!-- Name ============================================================================================================================== -->
    <v-dialog v-model="dialogName" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Ganti Nama</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="formName" v-model="validName" lazy-validation>
              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field v-model="currentUser.name" label="Nama" :rules="nameRules"></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="closeDialogName" text>Batal</v-btn>
          <v-btn color="green darken-1" @click="saveName" text>Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Email ============================================================================================================================== -->
    <v-dialog v-model="dialogEmail" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Ganti Email</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="formEmail" v-model="validEmail" lazy-validation>
              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field v-model="currentUser.email" label="Email" :rules="emailRules"></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="closeDialogEmail" text>Batal</v-btn>
          <v-btn color="green darken-1" @click="saveEmail" text>Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Phone ============================================================================================================================== -->
    <v-dialog v-model="dialogPhone" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Ganti Nomor Telepon</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="formPhone" v-model="validPhone" lazy-validation>
              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field v-model="currentUser.phone" label="Phone" :rules="phoneRules"></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="closeDialogPhone" text>Batal</v-btn>
          <v-btn color="green darken-1" @click="savePhone" text>Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Password ============================================================================================================================== -->
    <v-dialog v-model="dialogPassword" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Ganti Password</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="formPassword" v-model="validPassword" lazy-validation>
              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="oldPassword"
                    label="Password lama"
                    :rules="[rules.required, rules.min]"
                    :type="showOldPassword ? 'text' : 'password'"
                    :append-icon="showOldPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="showOldPassword = !showOldPassword"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="newPassword"
                    label="Password baru"
                    :rules="[rules.required, rules.min]"
                    :type="showNewPassword ? 'text' : 'password'"
                    :append-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="showNewPassword = !showNewPassword"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="confirmNewPassword"
                    label="Konfirmasi password baru"
                    :rules="[
                      rules.required,
                      rules.min,
                      rules.confirmNewPasswordRules(
                        confirmNewPassword,
                        newPassword,
                      ),
                    ]"
                    :type="showConfirmNewPassword ? 'text' : 'password'"
                    :append-icon="
                      showConfirmNewPassword ? 'mdi-eye' : 'mdi-eye-off'
                    "
                    @click:append="
                      showConfirmNewPassword = !showConfirmNewPassword
                    "
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="closeDialogPassword" text>Batal</v-btn>
          <v-btn color="green darken-1" @click="savePassword" text>Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Password ============================================================================================================================== -->
    <v-dialog v-model="dialogImage" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Ganti Foto</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-img v-if="image == null" :src="apiImage(currentUser.image)"></v-img>
              <v-img v-if="image != null" :src="imageUrl"></v-img>
            </v-row>

            <v-row>
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
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="closeDialogImage" text>Batal</v-btn>
          <v-btn color="green darken-1" @click="saveImage" text>Simpan</v-btn>
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
'use strict'
import VClamp from 'vue-clamp'
import Navbar from '../components/Navbar'
import lazyImg from '../assets/lazy-img.jpg'
import Axios from 'axios'
import { apiBaseUrl } from '../api'
import { checkTokenExp, refreshToken } from '../services'
import numberWithPeriod from '../mixins/numberWithPeriod'
import dummyProduct from '../assets/dummy-product.jpg'
import FormData from 'form-data'
export default {
  mounted() {
    Promise.all([this.loadCurrentUser(), this.loadCurrentUserLocal()]).then((result) => {
      this.testUser = result[1]
      this.isLoading = false
    })
  },
  data: () => ({
    image: null,
    imageUrl: '',
    imageErrorMessage: '',

    testUser: {},
    showOldPassword: false,
    showNewPassword: false,
    showConfirmNewPassword: false,

    oldPassword: '',
    confirmNewPassword: '',
    newPassword: '',

    success: false,
    error: false,
    errorMessage: '',
    successMessage: '',

    validName: false,
    validEmail: false,
    validPhone: false,
    validPassword: false,
    validImage: false,

    dialogName: false,
    dialogEmail: false,
    dialogPhone: false,
    dialogPassword: false,
    dialogImage: false,

    nameRules: [(v) => !!v || 'Name is required'],
    phoneRules: [(v) => !!v || 'Phone is required'],
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
      confirmNewPasswordRules: (v, nv) =>
        // v === this.oldPassword || 'confirm password not match',
        v === nv || 'confirm password not match',
    },

    isLoading: true,
    skeletonLoaderItem: [0, 1, 2, 3, 4],
    lazyImg: lazyImg,
    dialog: false,
    currentUser: {},
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
    },
    currentUserStore() {
      return this.$store.state.currentUser
    },
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
  },

  created() {
    //
  },

  methods: {
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
    setCurrentUser(payload) {
      this.$store.commit('setCurrentUser', payload)
    },
    openDialogPassword() {
      this.resetFormPassword()
      this.dialogPassword = true
    },
    resetFormPassword() {
      this.oldPassword = ''
      this.confirmNewPassword = ''
      this.newPassword = ''
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
    // Name ==============================================================================================================================
    validateName() {
      return this.$refs.formName.validate()
    },
    resetValidationName() {
      this.$refs.formName.resetValidation()
    },

    // Email ==============================================================================================================================
    validateEmail() {
      return this.$refs.formEmail.validate()
    },
    resetValidationEmail() {
      this.$refs.formEmail.resetValidation()
    },

    // Phone ==============================================================================================================================
    validatePhone() {
      return this.$refs.formPhone.validate()
    },
    resetValidationPhone() {
      this.$refs.formPhone.resetValidation()
    },

    // Password ==============================================================================================================================
    validatePassword() {
      return this.$refs.formPassword.validate()
    },
    resetValidationPassword() {
      this.$refs.formPassword.resetValidation()
    },

    resetImageForm() {
      this.image = null
      this.imageUrl = ''
      this.imageErrorMessage = ''
    },

    async updateCurrentUserLocal(key, value) {
      const currentUser = await this.loadCurrentUserLocal()
      currentUser[key] = value
      const newCurrentUser = JSON.stringify(currentUser)
      this.setCurrentUser(currentUser)
      return await localStorage.setItem('currentUser', newCurrentUser)
    },
    requestUpdateUser(userId, user) {
      const { token } = JSON.parse(localStorage.getItem('auth'))
      const headers = {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      }
      const data = user
      const url = `${apiBaseUrl}/api/users/${userId}`
      const config = {
        method: 'PUT',
        headers,
        url,
        data,
      }
      return Axios(config)
    },
    requestUpdatePassword(oldPassword, confirmNewPassword) {
      const { token } = JSON.parse(localStorage.getItem('auth'))
      const headers = {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      }
      const data = {
        oldPassword,
        confirmNewPassword,
      }
      const url = `${apiBaseUrl}/api/auth/update-password`
      const config = {
        method: 'POST',
        headers,
        url,
        data,
      }
      return Axios(config)
    },

    requestUpdateImage(userId, image) {
      const { token } = JSON.parse(localStorage.getItem('auth'))
      const headers = {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      }
      let data = new FormData()
      data.append('image', image)
      const url = `${apiBaseUrl}/api/users/${userId}`
      const config = {
        method: 'PUT',
        headers,
        url,
        data,
      }
      return Axios(config)
    },

    async saveName() {
      const validate = this.validateName()
      if (validate) {
        try {
          const result = await this.requestUpdateUser(this.currentUser._id, {
            name: this.currentUser.name,
          })
          await this.updateCurrentUserLocal('name', this.currentUser.name)
          this.successAlert('Nama berhasil di ubah')
          this.loadCurrentUser()
          this.closeDialogName()
        } catch (error) {
          this.errorAlert(error)
        }
      } else {
        this.errorAlert('invalid input!')
      }
    },
    async saveEmail() {
      const validate = this.validateEmail()
      if (validate) {
        try {
          const result = await this.requestUpdateUser(this.currentUser._id, {
            email: this.currentUser.email,
          })
          await this.updateCurrentUserLocal('email', this.currentUser.email)
          this.successAlert('Email berhasil diubah')
          this.loadCurrentUser()
          this.closeDialogEmail()
        } catch (error) {
          this.errorAlert(error)
        }
      } else {
        this.errorAlert('invalid input!')
      }
    },
    async savePhone() {
      const validate = this.validatePhone()
      if (validate) {
        try {
          const result = await this.requestUpdateUser(this.currentUser._id, {
            phone: this.currentUser.phone,
          })
          await this.updateCurrentUserLocal('phone', this.currentUser.phone)
          this.successAlert('Phone berhasil diubah')
          this.loadCurrentUser()
          this.closeDialogPhone()
        } catch (error) {
          this.errorAlert(error)
        }
      } else {
        this.errorAlert('invalid input!')
      }
    },
    async saveImage() {
      if (this.image) {
        try {
          const result = await this.requestUpdateImage(this.currentUser._id, this.image)
          await this.updateCurrentUserLocal('image', result.data.image)
          this.successAlert('Foto berhasil diubah')
          this.loadCurrentUser()
          this.closeDialogImage()
        } catch (error) {
          this.errorAlert(error)
        }
      } else {
        this.closeDialogImage()
      }
    },
    async savePassword() {
      const validate = this.validatePassword()
      if (validate) {
        try {
          const result = await this.requestUpdatePassword(this.oldPassword, this.confirmNewPassword)
          this.successAlert('Password berhasil diubah')
          this.resetFormPassword()
          this.closeDialogPassword()
        } catch (error) {
          console.log(error)
          console.log(error.response)
          this.errorAlert(error.response.data.message)
        }
      } else {
        this.errorAlert('invalid input!')
      }
    },
    closeDialogName() {
      this.dialogName = false
      this.resetValidationName()
    },
    closeDialogEmail() {
      this.dialogEmail = false
      this.resetValidationEmail()
    },
    closeDialogPhone() {
      this.dialogPhone = false
      this.resetValidationPhone()
    },
    closeDialogPassword() {
      this.dialogPassword = false
      this.resetValidationPassword()
    },
    closeDialogImage() {
      this.dialogImage = false
      this.resetImageForm()
    },
    async loadCurrentUserLocal() {
      return JSON.parse(localStorage.getItem('currentUser'))
    },
    async loadCurrentUser() {
      const requestCurrentUser = (user) => {
        const { token } = JSON.parse(localStorage.getItem('auth'))
        const headers = {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
        const url = `${apiBaseUrl}/api/users/${user._id}`
        const config = {
          headers: headers,
          method: 'GET',
          url: url,
        }
        return Axios(config)
      }
      const checkToken = await checkTokenExp()
      if (checkToken == true) {
        const user = await this.loadCurrentUserLocal()
        const result = await requestCurrentUser(user)

        this.currentUser = { ...result.data.user, role: user.role }
        // console.log(this.currentUser);
        return result
      }
    },
    apiImage(image) {
      return `${apiBaseUrl}/${image}`
    },
  },
  components: {
    Navbar,
  },
}
</script>
