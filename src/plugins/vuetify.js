import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: "mdi"
  },
  theme: {
    themes: {
      light: {
        primary_red_1: "#FF5858",
        primary_red_2: "#FFACAC",
        primary_green_1: "#009200",
        primary_green_2: "#58FF58",
        primary_green_3: "#ACFFAC",
        primary_black_1: "#2C2C2C",
        primary_grey_1: "#707070",
        primary_grey_2: "#A3A3A3",
        primary_grey_3: "#B6B6B6",
        primary_grey_4: "#C0C0C0",
        primary_grey_5: "#D8D8D8",
        primary_grey_6: "#E4E4E4",
        primary_white_1: "#FFFFFF"
      }
    }
  }
});
