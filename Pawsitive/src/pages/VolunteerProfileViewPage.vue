<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import ProfileCard from '@/components/resuables/ProfileCard.vue';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const route = useRoute();

//get the username from route e.g /volunteer/profile/{username}
const usernameParam = route.params.username;

const db = getFirestore();
const user = ref(null);

onMounted(async () => {
    try {

        //check if user exists
        const volunteersRef = collection(db, 'volunteers');
        const q = query(volunteersRef, where('username', '==', usernameParam));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            //set user object if found
            //note: username is unique, so only 1 result will be returned
            user.value = querySnapshot.docs[0].data();
        } else {
            console.error('User not found');
        }
    } catch (err) {
        console.error('Error fetching user:', err);
    }
});
</script>

<template>
    <div class="d-flex flex-column min-vh-100">
        <!-- Navbar -->
        <Navbar>
            <template #navbar-title>Volunteer Profile</template>
        </Navbar>

        <!-- Main content -->
        <main class="flex-grow-1 d-flex justify-content-center align-items-start py-4">
            <ProfileCard v-if="user" :user="user" :showActions="false" />
            <p v-else>User not found.</p>
        </main>

        <!-- Footer -->
        <BottomFooter />
    </div>
</template>

<style scoped>
main {
    min-height: calc(100vh - 120px);
}
</style>
