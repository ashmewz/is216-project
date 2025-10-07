import './assets/main.css'

import { createApp } from 'vue'
import router from './route/routes.js'
import App from './App.vue'

const app = createApp(App);
app.use(router).mount('#app');
