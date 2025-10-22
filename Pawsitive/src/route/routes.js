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
import VolunteerProfileViewPage from "@/pages/VolunteerProfileViewPage.vue";
import DonationSuccessPage from "@/pages/DonationSuccessPage.vue";

const history = createWebHistory();
const routes = [
    {
        path: '/',
        // TODO: Inject data for the mode to be in
        // See: https://router.vuejs.org/guide/essentials/dynamic-matching
        component: VolunteerSignupLoginPage
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
        path: '/volunteer/profile',
        // TODO: Inject profile data
        // See: https://router.vuejs.org/guide/essentials/dynamic-matching
        component: VolunteerProfilePage
    },

    {
        path: '/volunteer/profile/:username',
        name: 'VolunteerProfileView',
        component: VolunteerProfileViewPage, //access this page by passing the volunteer username as route param
        props: true // this lets you access the param as a prop
        ,
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
        path: '/donation-success/',
        component: DonationSuccessPage
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