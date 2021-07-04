export default {
  methods: {
    roundUp(num, precision) {
      precision = Math.pow(10, precision);
      return Math.ceil(num * precision) / precision;
    },
  },
};
