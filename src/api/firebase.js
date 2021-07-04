import firebase from 'firebase'

const firebaseConfig = {
  apiKey: 'AIzaSyA84xxJ1OQVV_fisYJRGs8Bh8OCEIAdv7k',
  authDomain: 'pesan-di-sini.firebaseapp.com',
  databaseURL: 'https://pesan-di-sini.firebaseio.com',
  projectId: 'pesan-di-sini',
  storageBucket: 'pesan-di-sini.appspot.com',
  messagingSenderId: '282825789090',
  appId: '1:282825789090:web:a9e1a8f159370a08a191fb',
  measurementId: 'G-BVWV378VSS',
}

const firebaseApp = firebase.initializeApp(firebaseConfig)

export default firebaseApp
