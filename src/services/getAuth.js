const auth = JSON.parse(localStorage.getItem('auth')) || {
    token: '',
    exp: 0,
};
export default auth;
