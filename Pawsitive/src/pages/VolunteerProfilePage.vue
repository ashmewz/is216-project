<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import defaultAvatar from '../assets/profilepic2.jpg'


const router = useRouter()

const user = ref({
    username: '',
    email: '',
    avatar: null,
})

const avatarUrl = computed(() => user.value.avatar || defaultAvatar)


const onLogout = async () => {
    const auth = getAuth()
    try {
        await signOut(auth)
        router.push('/volunteer/login')
    } catch (error) {
        console.error('Logout error:', error)
    }
}


onMounted(() => {
    const auth = getAuth()

    onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            // user is logged in
            user.value.username = currentUser.displayName || 'User'
            user.value.email = currentUser.email || ''
            user.value.avatar = currentUser.photoURL || null
        } else {
            // user is NOT logged in
            // redirect to login page
            router.push('/volunteer/login')
        }
    })


})
</script>

<template>
    <div class="d-flex flex-column min-vh-100">
        <!-- Navbar -->
        <Navbar>
            <template #navbar-title>Profile</template>
        </Navbar>

        <!-- Main content -->
        <main class="flex-grow-1 d-flex justify-content-center align-items-center py-4">
            <div class="card text-center" style="width: 22rem;">
                <!-- Avatar -->
                <img :src="avatarUrl" alt="Avatar" class="rounded-circle border mx-auto mt-3" width="100"
                    height="100" />

                <div class="d-flex justify-content-center gap-2 mt-2">
                    <button class="btn btn-outline-primary btn-sm " @click="onEditProfile">Edit Profile</button>
                </div>

                <!-- User Details -->
                <div class="card-body">
                    <div class="mb-2 text-start">
                        <small class="text-muted">Username</small>
                        <h5 class="card-title">{{ user.username }}</h5>
                    </div>

                    <div class="mb-3 text-start">
                        <small class="text-muted">Email</small>
                        <p class="card-text">{{ user.email }}</p>
                    </div>

                    <!-- Buttons -->
                    <div class="d-flex justify-content-start gap-2">
                        <button class="btn btn-danger btn-sm" @click="onLogout">Logout</button>
                    </div>
                </div>
            </div>
        </main>
        <!-- Footer -->
        <BottomFooter />
    </div>
</template>

<style scoped>
/* optional: center vertically on taller screens */
main {
    min-height: calc(100vh - 120px);
    /* adjust based on Navbar + Footer height */
}
</style>
