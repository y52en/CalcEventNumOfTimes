module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  pwa:{
    workboxOptions:{
      skipWaiting:true,
    }
  },
  publicPath: process.env.NODE_ENV === 'production'
      ? './'
      : '/'
}