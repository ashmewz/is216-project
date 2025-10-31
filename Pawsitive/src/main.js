import '@/assets/reset.css'
import '@/assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { createApp } from 'vue'
import router from './route/routes.js'
import App from './App.vue'
import './firebase'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { createPinia } from 'pinia'



const auth = getAuth();

let app;

//ensure firebase auth is initilized before mounting the app, else the route guard will not work
onAuthStateChanged(auth, () => {
    if (!app) {
        app = createApp(App);
        app.use(router);
        app.use(createPinia())
        app.mount('#app');
    }
});