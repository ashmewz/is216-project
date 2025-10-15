<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import defaultAvatar from '../assets/profilepic2.jpg'


const router = useRouter()
const auth = getAuth()
const db = getFirestore();

const user = ref({
    displayName: '',
    email: '',
    avatar: null,
    bio: '',

})

//default avatar for now
const avatarUrl = computed(() => user.value.avatar || defaultAvatar)

//edit profile modal open/close state
const showModal = ref(false)

//update profile modal form input states
const form = ref({
    displayName: '',
    bio: '',
})

// Fetch user details from Firestore (not firebase auth, auth stores password and email, other user details stored in firestore)
const fetchUserDetails = async () => {

    const currentUser = auth.currentUser
    if (!currentUser) {
        router.push('/login')
        return
    }
    const userDocRef = doc(db, 'users', currentUser.uid)
    const userSnap = await getDoc(userDocRef)
    if (userSnap.exists()) {
        const data = userSnap.data()

        //set the values in the card
        user.value.displayName = data.name || ''
        user.value.bio = data.bio

        //set the values in the edit modal form
        form.value.bio = data.bio
        form.value.displayName = data.name
    } else {
        user.value.displayName = ''
        user.value.bio = ''
        form.value.bio = ''
        form.value.displayName = ''
    }
}

// Open modal and fetch Firestore data
const onEditProfile = async () => {
    showModal.value = true
}


// Save profile and update Firestore
const onSaveProfile = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) return

    //understand that doing this way will update to db even when theres no changes made, so there are some inefficiencies. But for sake of simpliicty wil keep it this way first
    try {
        const userDocRef = doc(db, 'users', currentUser.uid)
        await updateDoc(userDocRef, {
            name: form.value.displayName,
            bio: form.value.bio
        })

        // Update local user state immediately (updates the card details basically)
        user.value.displayName = form.value.displayName
        user.value.bio = form.value.bio

        //close modal
        showModal.value = false

    } catch (error) {
        console.error('Failed to update profile:', error)
        alert('Failed to update profile. Please try again.')
    }
}

//Logout 
const onLogout = async () => {
    try {
        await signOut(auth)
        //go to login page upon logged out
        router.push('/volunteer/login')
    } catch (error) {
        console.error('Logout error:', error)
    }
}


onMounted(() => {

    onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            // user is logged in
            //set email value in card (get from firebase auth as email is stored there)
            user.value.email = currentUser.email || ''

            //get and set other user details from firestore
            fetchUserDetails()
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
                        <small class="text-muted">Display Name</small>
                        <h5 class="card-title">{{ user.displayName }}</h5>
                    </div>

                    <div class="mb-3 text-start">
                        <small class="text-muted">Email</small>
                        <p class="card-text">{{ user.email }}</p>
                    </div>

                    <div class="mb-3 text-start">
                        <small class="text-muted">Bio</small>
                        <p class="card-text">{{ user.bio }}</p>
                    </div>

                    <!-- Buttons -->
                    <div class="d-flex justify-content-start gap-2">
                        <button class="btn btn-danger btn-sm" @click="onLogout">Logout</button>
                    </div>
                </div>
            </div>
            <!-- Backdrop -->
            <div v-if="showModal" class="modal-backdrop fade show"></div>
            <!-- Bootstrap Modal -->
            <div class="modal fade" :class="{ show: showModal }" tabindex="-1" style="display: block;" v-if="showModal"
                aria-modal="true" role="dialog">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Profile</h5>
                            <button type="button" class="btn-close" @click="showModal = false"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Display Name</label>
                                <input type="text" class="form-control" v-model="form.displayName" />
                            </div>


                            <div class="mb-3">
                                <label class="form-label">Bio</label>
                                <textarea class="form-control" v-model="form.bio"> </textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary btn-sm"
                                @click="showModal = false">Cancel</button>
                            <button type="button" class="btn btn-primary btn-sm" @click="onSaveProfile">Save</button>
                        </div>
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
