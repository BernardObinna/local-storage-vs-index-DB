import Vue from 'vue';
import App from './App.vue';
import router from './router';
import faker from 'vue-faker';
import axios from 'axios';
import toastr from 'vue-toastr';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Datetime } from 'vue-datetime';
import 'vue-datetime/dist/vue-datetime.css';

Vue.component('Datetime', Datetime)
Vue.config.productionTip = false;
Vue.use(faker);
Vue.use(toastr);
Vue.use(axios);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
