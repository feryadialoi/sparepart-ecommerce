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
          <v-toolbar-title>Promo</v-toolbar-title>
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
      <v-container></v-container>
    </v-content>
  </v-app>
</template>
<style>
.tf {
  max-width: 40px;
}
</style>
<script>
import lazyImg from '../../assets/lazy-img.jpg';
import Navbar from '../../components/Navbar';
export default {
  mounted() {
    this.isLoading = false;
  },
  data: () => ({
    isLoading: true,
    skeletonLoaderItem: [0, 1, 2, 3, 4],
    lazyImg: lazyImg,
  }),
  components: {
    Navbar,
  },
};
</script>
