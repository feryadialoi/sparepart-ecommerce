export default {
  methods: {
    numberWithPeriod({ currency, separator, number }) {
      return (
        currency + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)
      );
    }
  }
};
