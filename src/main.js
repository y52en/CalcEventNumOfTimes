import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import './registerServiceWorker'

Vue.config.productionTip = false
Vue.prototype.$window = window

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')


