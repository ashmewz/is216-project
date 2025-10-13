import {
    createWebHistory,
    createRouter
} from "vue-router";

// TODO: Remove thse two when we're done.
import RouterTest from '@/components/RouterTest.vue';

// End of TODO

import MapPage from "@/pages/MapPage.vue";
import ForumPage from "@/pages/ForumPage.vue";
import ReportPage from "@/pages/ReportPage.vue";
import VolunteerSignupLoginPage from "@/pages/VolunteerSignupLoginPage.vue";
import VolunteerProfilePage from "@/pages/VolunteerProfilePage.vue";
import AdoptionListPage from "@/pages/AdoptionListPage.vue";
import DonationPage from "@/pages/DonationPage.vue";
import ServicesPage from "@/pages/ServicesPage.vue";
import AiRecogPage from "@/pages/AiRecogPage.vue";
import AiGuidebookPage from "@/pages/AiGuidebookPage.vue";
import LandingPage from "@/pages/LandingPage.vue";

const history = createWebHistory();
const routes = [
    {
        path: '/',
        // TODO: New Landing Pagde
        component: LandingPage
    },
    {
        path: '/map/',
        component: MapPage
    },
    {
        path: '/forum/',
        component: ForumPage
    },
    {
        path: '/report/',
        component: ReportPage
    },
    {
        path: '/volunteer/signup/',
        // TODO: Inject data for the mode to be in
        // See: https://router.vuejs.org/guide/essentials/dynamic-matching
        component: VolunteerSignupLoginPage
    },
    {
        path: '/volunteer/login/',
        // TODO: Inject data for the mode to be in
        // See: https://router.vuejs.org/guide/essentials/dynamic-matching
        component: VolunteerSignupLoginPage
        
        //might need to setup something like a route guard? to prevent user to access /signup and /login routes if they are loggedin
    },
    {
        path: '/volunteer/profile/',
        // TODO: Inject profile data
        // See: https://router.vuejs.org/guide/essentials/dynamic-matching
        component: VolunteerProfilePage
    },
    {
        path: '/adoption/',
        component: AdoptionListPage
    },
    {
        path: '/donations/',
        component: DonationPage
    },
    {
        path: '/services/',
        component: ServicesPage
    },
    {
        path: '/ai/recog/',
        component: AiRecogPage
    },
    {
        path: '/ai/guidebook/',
        component: AiGuidebookPage
    }
];

const router = createRouter({
    history,
    routes
});

export default router;