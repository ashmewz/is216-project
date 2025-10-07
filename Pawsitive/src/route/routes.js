import {
    createWebHistory,
    createRouter
} from "vue-router";

import RouterTest from '@/components/RouterTest.vue';
import KevanTest from "@/components/KevanTest.vue";
import TheWelcome from "@/components/TheWelcome.vue";
import HelloWorld from "@/components/HelloWorld.vue";

const history = createWebHistory();
const routes = [
    {
        path: '/',
        component: RouterTest
    },
    {
        path: '/KevanTest/',
        component: KevanTest
    },
    {
        path: '/TheWelcome/',
        component: TheWelcome
    },
    {
        path: '/HelloWorld/',
        component: HelloWorld
    }
];

const router = createRouter({
    history,
    routes
});

export default router;