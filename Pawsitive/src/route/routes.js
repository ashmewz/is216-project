import {
    createWebHistory,
    createRouter
} from "vue-router";

// TODO: Remove thse two when we're done.
import RouterTest from '@/components/RouterTest.vue';

// End of TODO

import MapPage from "@/components/pages/MapPage.vue";
import ForumPage from "@/components/pages/ForumPage.vue";
import ReportPage from "@/components/pages/ReportPage.vue";
import VolunteerSignupLoginPage from "@/components/pages/VolunteerSignupLoginPage.vue";
import VolunteerProfilePage from "@/components/pages/VolunteerProfilePage.vue";
import AdoptionListPage from "@/components/pages/AdoptionListPage.vue";
import DonationPage from "@/components/pages/DonationPage.vue";
import ServicesPage from "@/components/pages/ServicesPage.vue";
import AiRecogPage from "@/components/pages/AiRecogPage.vue";
import AiGuidebookPage from "@/components/pages/AiGuidebookPage.vue";

const history = createWebHistory();
const routes = [
    {
        path: '/',
        // TODO: New Landing Pagde
        component: RouterTest
    },
    {
        path: '/KevanTest/',
        component: KevanTest
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
        path: '/donation/',
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