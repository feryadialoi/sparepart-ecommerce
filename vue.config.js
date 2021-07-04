module.exports = {
  transpileDependencies: ['vuetify'],
  pwa: {
    name: 'Pesan Di Sini',
    themeColor: '#FF5858',
    msTileColor: '#ffffff',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',

    iconPaths: {
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      appleTouchIcon: 'img/icons/apple-touch-icon-152x152.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
      msTileImage: 'img/icons/msapplication-icon-144x144.png',
    },
  },
  devServer: {
    disableHostCheck: true,
  },
  lintOnSave: false,
}
