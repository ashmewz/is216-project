import {
    createWebHistory,
    createRouter
} from "vue-router";

import RouterTest from '@/components/RouterTest.vue';
import KevanTest from "@/components/KevanTest.vue";
import MapPage from "@/components/pages/MapPage.vue";

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
        path: '/map/',
        component: MapPage
    }
];

const router = createRouter({
    history,
    routes
});

export default router;