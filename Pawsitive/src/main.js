import '@/assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { createApp } from 'vue'
import router from './route/routes.js'
import App from './App.vue'
import './firebase'

const app = createApp(App);
app.use(router).mount('#app');
