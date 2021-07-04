<template>
  <v-app>
    <!-- <Navbar main="tes main">
      <template v-slot:back>
        <v-btn small fab text color="primary_red_1" @click="$router.go(-1)">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </template>
      <template v-slot:body>
        <v-toolbar-title>Pesanan Berhasil</v-toolbar-title>
      </template>
    </!-->

    <v-content>
      <v-container>
        <v-row>
          <v-col>
            <div class="font-weight-bold primary_grey_1--text text-center">
              PESANAN BERHASIL
            </div>
          </v-col>
        </v-row>
        <v-row justify="center" class="px-10">
          <v-col sm="12" md="4" lg="3" xl="3">
            <v-avatar size="100%" class="px-5">
              <v-img :src="avatar"></v-img>
            </v-avatar>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div
              class="caption font-weight-bold primary_red_1--text text-center"
            >
              PESANAN DIKIRIM
            </div>
            <div
              class="caption font-weight-bold primary_grey_1--text text-center"
            >
              Rileks aja, kami akan melanjutkan pesanan ini ke pemasok
            </div>
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col cols="12" xl="3">
            <v-btn @click="goToHome" dark block color="primary_red_1"
              >kembali ke beranda</v-btn
            >
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>
<script>
import Navbar from '../components/Navbar';
import lazyImg from '../assets/lazy-img.jpg';
import dummy from '../assets/dummy-product.jpg';
export default {
  mounted() {},
  data: () => ({
    avatar: dummy,
  }),
  methods: {
    goToHome() {
      this.$router.push('/');
    },
  },
  components: {
    Navbar,
  },
};
</script>
