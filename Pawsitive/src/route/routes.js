import {
    createWebHistory,
    createRouter
} from "vue-router";

import { getAuth, onAuthStateChanged } from "firebase/auth";

// TODO: Remove thse two when we're done.
import RouterTest from '@/components/RouterTest.vue';

// End of TODO

import MapPage from "@/pages/MapPage.vue";
import CatProfile from "@/pages/CatProfile.vue";
import ForumPage from "@/pages/ForumPage.vue";
import ReportPage from "@/pages/ReportPage.vue";
import VolunteerSignupLoginPage from "@/pages/VolunteerSignupLoginPage.vue";
import VolunteerProfilePage from "@/pages/VolunteerProfilePage.vue";
import AdoptionListPage from "@/pages/AdoptionListPage.vue";
import DonationPage from "@/pages/DonationPage.vue";
import ServicesPage from "@/pages/ServicesPage.vue";
import AiRecogPage from "@/pages/AiRecogPage.vue";
import AiGuidebookPage from "@/pages/AiGuidebookPage.vue";
import VolunteerProfileViewPage from "@/pages/VolunteerProfileViewPage.vue";
import LandingPage from "@/pages/LandingPage.vue";
// TEST ONLY
import AdminAddCat from "@/pages/TEST_ADMIN_ONLY/AdminAddCat.vue";


const history = createWebHistory();
const routes = [
    {
        path: '/login',
        // TODO: Inject data for the mode to be in
        // See: https://router.vuejs.org/guide/essentials/dynamic-matching
        component: VolunteerSignupLoginPage
    },
    {
        path: '/',
        component: LandingPage
    },
    {
        path: '/map/',
        component: MapPage,
        meta: { requiresAuth: true }
    },
    {
        path: '/cat/:id',
        component: CatProfile,
        meta: { requiresAuth: true }
    },
    {
        path: '/forum/',
        component: ForumPage,
        meta: { requiresAuth: true }
    },
    {
        path: '/report/',
        component: ReportPage,
        meta: { requiresAuth: true }
    },
    {
        path: '/volunteer/login/',
        // TODO: Inject data for the mode to be in
        // See: https://router.vuejs.org/guide/essentials/dynamic-matching
        component: VolunteerSignupLoginPage

    },
    {
        path: '/volunteer/profile',
        // TODO: Inject profile data
        // See: https://router.vuejs.org/guide/essentials/dynamic-matching
        component: VolunteerProfilePage,
        meta: { requiresAuth: true }
    },

    {
        path: '/volunteer/profile/:username',
        name: 'VolunteerProfileView',
        component: VolunteerProfileViewPage, //access this page by passing the volunteer username as route param
        props: true, // this lets you access the param as a prop
        meta: { requiresAuth: true }
    },

    {
        path: '/adoption/',
        component: AdoptionListPage,
        meta: { requiresAuth: true }
    },
    {
        path: '/donations/',
        component: DonationPage,
        meta: { requiresAuth: true }
    },
    {
        path: '/services/',
        component: ServicesPage,
        meta: { requiresAuth: true }
    },
    {
        path: '/ai/recog/',
        component: AiRecogPage,
        meta: { requiresAuth: true }
    },
    {
        path: '/ai/guidebook',
        name: 'AiGuideBook',
        component: AiGuidebookPage,
        meta: { requiresAuth: true },
    },

    { // TEST ONLY
        path: '/admin',
        component: AdminAddCat,
    }
];

const router = createRouter({
    history,
    routes
});

router.beforeEach((to, from, next) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (to.meta.requiresAuth && !user) {
        // user is not logged in but route requires auth
        next('/'); // redirect to login
    } else if (!to.meta.requiresAuth && user && (to.path === '/' || to.path === '/volunteer/login' || to.path === '/volunteer/login/')) {
        // logged-in user trying to access login page (on root '/' and 'volunteer/login')
        next('/map'); // redirect to /map
    } else {
        next(); // allow access
    }
});


export default router;