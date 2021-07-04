const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
  _id: '',
  customerId: '',
  name: '',
  email: '',
  phone: '',
  image: '',
  storeId: null,
  role: {
    _id: '',
    name: '',
    id: '',
  },
};

export default currentUser;
