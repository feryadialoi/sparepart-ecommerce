<template>
  <v-app>
    <v-container fill-height>
      <v-layout justify-center align-center class="py-3">
        <v-card
          :flat="$vuetify.breakpoint.xsOnly"
          class="px-3 pt-12 pb-1 text-center"
          min-width="320"
          max-width="360"
        >
          <v-avatar tile size="200" class="mb-10">
            <v-img :src="logo"></v-img>
          </v-avatar>
          <v-layout justify-center class="pa-2">
            <v-card class="pa-2" flat>
              <div class="primary_red_1--text font-weight-bold">{{ loginError }}</div>
            </v-card>
          </v-layout>
          <v-text-field
            class="mb-2"
            dense
            @change="emailOnChange"
            type="email"
            outlined
            v-model="email"
            :rules="[rules.required, rules.emailMatch]"
            name="email"
            label="Email"
            hint="example@email.com"
            color="primary_red_1"
            :error-messages="emailErrorMessage"
            :error="emailError"
          ></v-text-field>
          <v-text-field
            class="mb-2"
            dense
            v-on:keyup.13="login"
            @change="passwordOnChange"
            outlined
            v-model="password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[rules.required, rules.min]"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            label="Password"
            hint="At least 6 characters"
            @click:append="showPassword = !showPassword"
            color="primary_red_1"
            :error-messages="passwordErrorMessage"
            :error="passwordError"
          ></v-text-field>
          <v-btn dark block color="primary_red_1 mb-5" @click="login">login</v-btn>
          <!-- <v-btn text dark block color="primary_red_1">register</v-btn> -->
        </v-card>
      </v-layout>

      <v-dialog v-model="loginFailed" max-width="300">
        <v-card>
          <v-card-title class="headline">Login failed</v-card-title>
          <v-card-text>Email or password are invalid</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="loginFailed = false">ok</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
    <!-- <v-footer app absolute color="transparent">
      <v-row>
        <v-col>
          <div class="text-center caption">Astra</div>
        </v-col>
      </v-row>
    </v-footer>-->
  </v-app>
</template>
<script>
import Axios from 'axios'
import { apiBaseUrl } from '../api'
import logo from '../assets/logo.png'
export default {
  mounted() {},
  data: () => ({
    logo: logo,
    loginFailed: false,
    loginError: '',
    email: '',
    password: '',
    emailErrorMessage: '',
    passwordErrorMessage: '',
    emailError: false,
    passwordError: false,
    showPassword: false,
    rules: {
      required: (value) => !!value || 'Required.',
      min: (v) => v.length >= 6 || 'Min 6 characters',
      emailMatch: (v) => {
        const checkEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        return checkEmail.test(v) || 'The email you entered is not valid'
      },
    },
  }),
  methods: {
    async login() {
      const checkEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
      if (!checkEmail.test(this.email)) {
        this.emailErrorMessage = 'The email you entered is not valid'
      }
      if (this.password.length < 6) {
        this.passwordErrorMessage = 'Min 6 characters'
      }
      if (checkEmail.test(this.email) && this.password.length > 5) {
        try {
          const response = await Axios({
            url: `${apiBaseUrl}/api/auth/login`,
            method: 'POST',
            data: {
              email: this.email,
              password: this.password,
            },
          })
          localStorage.setItem('auth', JSON.stringify(response.data.auth))
          localStorage.setItem('currentUser', JSON.stringify(response.data.user))
          const responseData = response.data
          const { user } = responseData
          if (user.role.name == 'admin') {
            this.$router.push({ name: 'featured' })
          } else {
            this.$router.push({ name: 'home' })
          }
        } catch (error) {
          console.log('status code', error)
          this.emailError = true
          this.passwordError = true
          this.loginFailed = true
          this.loginError = 'Email or password invalid!'
        }
      }
    },
    emailOnChange() {
      const checkEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
      if (checkEmail.test(this.email)) {
        this.emailErrorMessage = ''
      }
    },
    passwordOnChange() {
      if (this.password.length > 5) {
        this.passwordErrorMessage = ''
      }
    },
  },
}
</script>
