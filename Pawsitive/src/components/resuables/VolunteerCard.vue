<script setup>

import { useRouter } from "vue-router";


const router = useRouter();
defineProps({
    volunteer: {
        type: Object,
        required: true
    },

});

const goToVolunteer = (username) => {
    router.push(`/volunteer/profile/${username}`);
};

</script>

<template>
    <div class="card h-100 shadow-sm profile-card" @click="goToVolunteer(volunteer.username)" style="cursor: pointer;">
        <img :src="volunteer.avatar || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'" class="card-img-top"
            alt="Profile" />
        <div class="card-body">
            <h5 class="card-title fw-bold mb-2">{{ volunteer.firstName }} {{ volunteer.lastName }}</h5>
            <p v-if="volunteer.region" class="text-muted mb-2">{{ volunteer.region}}</p>
            <p v-else="volunteer.region" class="text-muted mb-2">No Region Set</p>
            <p class="mb-2 small">
                <strong>Services:</strong>
                <br></br> 
                <span  v-for="s in volunteer.services" :key="s.type"
                    class="badge bg-secondary-subtle text-dark border m-1">
                    {{ s.type }}
                </span>
            </p>
        </div>
    </div>
</template>

<style scoped>
.profile-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border-radius: 1rem;
    overflow: hidden;
}

.profile-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.card-img-top {
    object-fit: cover;
    height: 220px;
}

.badge {
    background-color: #f1f3f5;
    font-size: 0.8rem;
    border-radius: 0.5rem;
    padding: 0.35rem 0.6rem;
}
</style>
