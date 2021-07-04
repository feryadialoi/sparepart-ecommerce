<template>
  <nav>
    <v-app-bar app>
      <slot name="back"></slot>
      <v-btn small fab text color="primary_red_1" @click="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-spacer class="px-2">
        <slot name="body"></slot>
      </v-spacer>
      <slot name="search"></slot>
      <v-btn
        v-if="currentUser.role.name === 'depot'"
        small
        fab
        text
        color="primary_red_1"
        @click="$router.push({ name: 'cart' }).catch((e) => {})"
      >
        <v-icon>mdi-cart</v-icon>
        <v-badge class="ml-2 mb-2" color="primary_green_1 darken-1" overlap v-show="cartsCount > 0">
          <template v-slot:badge>
            <span>{{ cartsCount }}</span>
          </template>
        </v-badge>
      </v-btn>
      <slot name="storefront"></slot>
      <slot name="right"></slot>
    </v-app-bar>
    <v-navigation-drawer app v-model="drawer">
      <v-row class="primary_red_1">
        <v-col>
          <v-list class="pt-10">
            <v-list-item @click="goToProfile">
              <v-avatar size="48">
                <v-img v-if="currentUser.image === '-'" :src="avatar" aspect-ratio="1"></v-img>
                <v-img
                  v-if="currentUser.image !== '-'"
                  :src="imageApi(currentUser.image)"
                  aspect-ratio="1"
                ></v-img>
              </v-avatar>
            </v-list-item>
          </v-list>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="title white--text">{{ currentUser.name }}</v-list-item-title>
              <v-list-item-subtitle class="white--text">{{ currentUser.email }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-col>
      </v-row>
      <v-row v-if="currentUser.role.name === 'admin'">
        <v-col v-for="drawers in adminDrawerList" :key="drawers._id" class="py-0">
          <v-list dense nav>
            <v-list-item
              @click="navigate(drawer)"
              v-for="drawer in drawers.listMenu"
              :key="drawer._id"
              link
            >
              <v-list-item-icon>
                <v-icon>{{ drawer.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ drawer.name }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
        </v-col>
      </v-row>

      <v-list dense nav>
        <v-list-item @click="navigate(drawer)" v-for="drawer in drawerRole" :key="drawer._id" link>
          <v-list-item-icon>
            <v-icon>{{ drawer.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ drawer.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
    </v-navigation-drawer>
    <v-dialog v-model="logoutDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">Logout</v-card-title>
        <v-card-text>Are you sure to logout?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary_red_1" text @click="logoutDialog = false">no</v-btn>
          <v-btn color="primary_red_1" text @click="logout">yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </nav>
</template>
<script>
import lazyImg from '../assets/lazy-img.jpg'
import { checkTokenExp, refreshToken } from '../services'
import Axios from 'axios'
import { apiBaseUrl } from '../api'
import { mapActions } from 'vuex'
export default {
  mounted() {
    this.initLauncApp()
  },
  data: () => ({
    user: { role: {} },
    drawer: null,
    title: 0,
    drawerList: [
      {
        _id: 0,
        name: 'Beranda',
        path: '/',
        icon: 'mdi-home',
        role: ['depot', 'dealer'],
      },
      {
        _id: 1,
        name: 'Profil toko',
        path: '/storefront',
        icon: 'mdi-storefront',
        role: ['dealer'],
      },
      {
        _id: 2,
        name: 'Pesan barang',
        path: '/orders',
        icon: 'mdi-archive',
        role: ['depot'],
      },
      {
        _id: 3,
        name: 'Daftar pesanan',
        path: '/list-orders',
        icon: 'mdi-view-list',
        role: ['depot'],
      },
      {
        _id: 4,
        name: 'Histori poin',
        path: '/user-points',
        icon: 'mdi-star',
        role: ['depot', 'dealer'],
      },
      {
        _id: 5,
        name: 'Daftar pesanan masuk',
        path: '/list-incoming-orders',
        icon: 'mdi-playlist-edit',
        role: ['dealer'],
      },
      {
        _id: 6,
        name: 'Daftar barang dijual',
        path: '/list-sale-items',
        icon: 'mdi-playlist-check',
        role: ['dealer'],
      },
      // {
      //   _id: 7,
      //   name: "Pengaturan",
      //   path: "/setting",
      //   icon: "mdi-settings",
      //   role: "both"
      // },
      {
        _id: 8,
        name: 'Logout',
        path: '/logout',
        icon: 'mdi-logout',
        role: ['depot', 'dealer', 'admin'],
      },
    ],
    adminDrawerList: [
      {
        _id: 0,
        listMenu: [
          {
            _id: 0,
            name: 'Featured',
            path: '/featured',
            icon: 'mdi-star',
          },
          {
            _id: 1,
            name: 'Setting',
            path: '/settings',
            icon: 'mdi-star',
          },
          {
            _id: 2,
            name: 'Report',
            path: '/report',
            icon: 'mdi-star',
          },
          {
            _id: 3,
            name: 'Slide',
            path: '/slides',
            icon: 'mdi-star',
          },
        ],
      },
      {
        _id: 1,
        listMenu: [
          {
            _id: 0,
            name: 'Master Product',
            path: '/master-products',
            icon: 'mdi-star',
          },
          // {
          //   _id: 1,
          //   name: 'Product',
          //   path: '/products',
          //   icon: 'mdi-star',
          // },
          {
            _id: 2,
            name: 'Product',
            path: '/products',
            icon: 'mdi-star',
          },
          {
            _id: 3,
            name: 'Product Category',
            path: '/product-categories',
            icon: 'mdi-star',
          },
          {
            _id: 4,
            name: 'Product Brand',
            path: '/product-brands',
            icon: 'mdi-star',
          },
          // {
          //   _id: 5,
          //   name: 'Product Image',
          //   path: '/product-images',
          //   icon: 'mdi-star',
          // },
          {
            _id: 6,
            name: 'Unit',
            path: '/units',
            icon: 'mdi-star',
          },
        ],
      },
      {
        _id: 2,
        listMenu: [
          {
            _id: 0,
            name: 'Purchase',
            path: '/purchases',
            icon: 'mdi-star',
          },
          {
            _id: 1,
            name: 'Purchase Item',
            path: '/purchase-items',
            icon: 'mdi-star',
          },
          {
            _id: 2,
            name: 'Point',
            path: '/points',
            icon: 'mdi-star',
          },
        ],
      },
      {
        _id: 3,
        listMenu: [
          {
            _id: 0,
            name: 'User',
            path: '/users',
            icon: 'mdi-star',
          },
          // {
          //   _id: 1,
          //   name: 'Dealer',
          //   path: '/dealers',
          //   icon: 'mdi-star',
          // },
          // {
          //   _id: 2,
          //   name: 'Depot',
          //   path: '/depots',
          //   icon: 'mdi-star',
          // },
          // {
          //   _id: 3,
          //   name: "Role",
          //   path: "/roles",
          //   icon: "mdi-star"
          // }
        ],
      },
      // {
      //   _id: 4,
      //   listMenu: [
      //     {
      //       _id: 0,
      //       name: 'Sale',
      //       path: '/sales',
      //       icon: 'mdi-star',
      //     },
      //     {
      //       _id: 1,
      //       name: 'Sale Item',
      //       path: '/sale-items',
      //       icon: 'mdi-star',
      //     },
      //   ],
      // },
      {
        _id: 5,
        listMenu: [
          {
            _id: 0,
            name: 'Store',
            path: '/stores',
            icon: 'mdi-star',
          },
          {
            _id: 1,
            name: 'Address',
            path: '/addresses',
            icon: 'mdi-star',
          },
        ],
      },
    ],
    carts: [],
    avatar: lazyImg,
    logoutDialog: false,
  }),
  methods: {
    async initLauncApp() {
      const checkToken = await checkTokenExp()
      if (checkToken) {
        this.loadCurrentUser()
        this.setCurrentUser(JSON.parse(localStorage.getItem('currentUser')))
        this.user = JSON.parse(localStorage.getItem('currentUser'))
        if (this.user.role == 'dealer') {
          const checkToken = await checkTokenExp()
          if (checkToken == true) {
            this.$store.dispatch('setCarts')
          }
        }
      }
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
        const userLocal = await JSON.parse(localStorage.getItem('currentUser'))
        const result = await requestCurrentUser(userLocal)
        const user = result.data.user
        for (const key in user) {
          userLocal[key] = user[key]
        }
        await localStorage.setItem('currentUser', JSON.stringify(userLocal))
        return result
      }
    },
    setCurrentUser(payload) {
      this.$store.commit('SET_CURRENT_USER', payload)
    },
    goToProfile() {
      this.$router.push({ name: 'profile', params: {} }).catch((err) => {
        console.log('current location')
      })
    },

    crudMenuClick(item) {
      console.log(item)
      alert(item.name)
    },
    logout() {
      console.log('logout')
      localStorage.removeItem('auth')
      this.logoutDialog = false
      this.$router.push({ name: 'login' })
    },
    navigate(drawer) {
      if (drawer.path === '/logout') {
        this.logoutDialog = true
      } else {
        this.title = drawer._id
        this.$router.push(drawer.path).catch((err) => {
          console.log('current location')
        })
        if (this.$vuetify.breakpoint.name === 'lg' || this.$vuetify.breakpoint.name === 'xl') {
          this.drawer = true
        } else {
          this.drawer = false
        }
      }
    },
    imageApi(image) {
      return `${apiBaseUrl}/${image}`
    },
  },
  computed: {
    drawerRole() {
      const { role } = JSON.parse(localStorage.getItem('currentUser'))
      const drawerList = this.drawerList.filter((element) => element.role.includes(role.name))
      return drawerList
    },
    cartBadge() {
      const badge = this.carts.filter((f) => f.cartItem.length > 0)
      return badge
    },
    cartsCount() {
      const cartsCount = this.$store.state.cart.carts.count
      return cartsCount
    },
    currentUser() {
      const currentUser = this.$store.state.currentUser.currentUser
      return currentUser
    },
  },
}
</script>
