<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import defaultAvatar from '@/assets/avatar_placeholder.jpg'
import ProfileCard from '@/components/resuables/ProfileCard.vue';
import { validateProfileUpdate } from '@/utils/validators';


const router = useRouter()

//get the firebase variables needed
const auth = getAuth()
const db = getFirestore();

//user fields
const user = ref({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    avatar: null,
    bio: '',
    skills: [],
    services: [],
})
//define the services types
const serviceTypes = [
    "Pet Grooming",
    "Pet Sitting",
    "Vet Consultation",
    "Pet Walking"
];

//edit profile modal open/close state
const showModal = ref(false)

//initiate update profile modal form input states
const form = ref({
    username: '',
    firstName: '',
    lastName: '',
    contactNumber: '',
    bio: '',
    avatar: null,
    skills: [],
    services: [],
})

const errorMessage = ref('');


//centralized avatarURL
const avatarUrl = computed(() => {
    // If editing (modal open), prefer form.avatar even if it's null
    if (showModal.value) {
        return form.value.avatar !== null
            ? form.value.avatar
            : defaultAvatar
    }

    // Otherwise, show user's saved avatar
    return user.value.avatar || defaultAvatar
})

//initialized avatarInput (for changing profile pic)
const avatarInput = ref(null);

// Trigger the hidden file input when image is clicked
const triggerFileInput = () => {
    avatarInput.value.click();
};

// Convert file to Base64
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

// When user selects a new photo
const onAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
        const base64 = await fileToBase64(file);
        form.value.avatar = base64;
    } catch (err) {
        console.error("Failed to read file:", err);
        alert("Failed to load image");
    }
};

// Remove avatar
const onRemoveAvatar = () => {
    form.value.avatar = null;
    // user.value.avatar = null;
};


// Fetch user details from Firestore (not firebase auth, auth stores password and email, other user details stored in firestore)
const fetchUserDetails = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) {
        router.push('/login')
        return
    }
    const userDocRef = doc(db, 'volunteers', currentUser.uid)
    const userSnap = await getDoc(userDocRef)
    if (userSnap.exists()) {
        const data = userSnap.data()

        user.value.username = data.username || ''
        user.value.firstName = data.firstName || ''
        user.value.lastName = data.lastName || ''
        user.value.contactNumber = data.contactNumber || ''
        user.value.bio = data.bio || ''
        user.value.skills = data.skills || []
        user.value.services = data.services || []
        user.value.avatar = data.avatar || null;


        // populate form
        form.value.firstName = data.firstName || ''
        form.value.lastName = data.lastName || ''
        form.value.contactNumber = data.contactNumber || ''
        form.value.bio = data.bio || ''
        form.value.skills = [...(data.skills || [])]
        form.value.services = [...(data.services || [])]
        form.value.avatar = user.value.avatar
    }
}


// Open modal and fetch Firestore data
const onEditProfile = async () => {
    showModal.value = true
    errorMessage.value = ''
    // Deep copy the services and skills to break reference btween user.services and form.services
    // this is to prevent the main card data from updating before the edit modal form is saved
    form.value.services = user.value.services.map(s => ({ ...s }));
    form.value.skills = [...user.value.skills];
}

const addSkill = () => {
    const errors = validateProfileUpdate(form.value)
    const skillError = errors.find(e => e.includes('skill'))
    if (!skillError) {
        form.value.skills.push('')
        errorMessage.value = ''
    } else {
        errorMessage.value = skillError
    }
}

const addService = () => {
    const errors = validateProfileUpdate(form.value)
    const serviceError = errors.find(e => e.includes('service'))
    if (!serviceError) {
        form.value.services.push({ type: '', yearsOfExp: 0, feeRate: 0 })
        errorMessage.value = ''
    } else {
        errorMessage.value = serviceError
    }
}





// Save profile and update Firestore
const onSaveProfile = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const errors = validateProfileUpdate(form.value)  // <-- use validateProfileUpdate

    if (errors.length > 0) {
        errorMessage.value = errors.join(' ')
        return
    }

    try {
        const userDocRef = doc(db, 'volunteers', currentUser.uid);

        // ensure no undefined values
        const dataToUpdate = {
            firstName: form.value.firstName || '',
            lastName: form.value.lastName || '',
            contactNumber: form.value.contactNumber || '',
            bio: form.value.bio.trim() || '',
            skills: form.value.skills || [],
            services: form.value.services || [],
            avatar: form.value.avatar || null

        }

        await updateDoc(userDocRef, dataToUpdate);

        // Update local user state
        user.value.firstName = dataToUpdate.firstName;
        user.value.lastName = dataToUpdate.lastName;
        user.value.contactNumber = dataToUpdate.contactNumber;
        user.value.bio = dataToUpdate.bio;
        user.value.skills = dataToUpdate.skills;
        user.value.services = dataToUpdate.services;
        user.value.avatar = form.value.avatar || null;


        // Close modal
        showModal.value = false;
    } catch (error) {
        console.error('Failed to update profile:', error);
        alert('Failed to update profile. Please try again.');
    }
};



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

            <!-- Card -->
            <ProfileCard :user="user" :showActions="true" :onEditProfile="onEditProfile" :onLogout="onLogout" />

            <!-- Backdrop -->
            <div v-if="showModal" class="modal-backdrop fade show"></div>

            <!-- Bootstrap Modal -->
            <div class="modal fade" :class="{ show: showModal }" tabindex="-1" style="display: block;" v-if="showModal"
                aria-modal="true" role="dialog">
                <div class="modal-dialog modal-dialog-centered modal-xl">
                    <div class="modal-content">
                        <form @submit.prevent="onSaveProfile">
                            <div class="modal-header">
                                <h5 class="modal-title">Edit Profile</h5>
                                <button type="button" class="btn-close" @click="showModal = false"></button>
                            </div>

                            <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">


                                <!-- Profile Photo -->
                                <div class="mb-3 d-flex flex-column align-items-center">
                                    <div class="position-relative" style="width: 100px; height: 100px; cursor: pointer;"
                                        @click="triggerFileInput">
                                        <img :src="avatarUrl" alt="Avatar" class="rounded-circle border w-100 h-100"
                                            style="object-fit: cover;" />
                                        <!-- Hover Overlay -->
                                        <div
                                            class="overlay d-flex justify-content-center align-items-center rounded-circle">
                                            Click to change
                                        </div>
                                    </div>

                                    <input type="file" ref="avatarInput" @change="onAvatarChange" accept="image/*"
                                        style="display: none;" />

                                    <div class="mt-2" v-if="form.avatar">
                                        <button type="button" class="btn btn-outline-danger btn-sm"
                                            @click="onRemoveAvatar">
                                            Remove Photo
                                        </button>
                                    </div>
                                </div>




                                <div v-if="errorMessage" class="alert alert-danger">
                                    {{ errorMessage }}
                                </div>

                                <!-- First Name + Last Name inline -->
                                <div class="row mb-3">
                                    <div class="col-12 col-md-6 mb-2 mb-md-0">
                                        <label class="form-label">First Name</label>
                                        <input v-model="form.firstName" type="text" class="form-control"
                                            placeholder="First Name" required>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Last Name</label>
                                        <input v-model="form.lastName" type="text" class="form-control"
                                            placeholder="Last Name" required>
                                    </div>
                                </div>

                                <!-- Contact Number -->
                                <div class="mb-3">
                                    <label class="form-label">Contact Number</label>
                                    <input v-model="form.contactNumber" type="tel" class="form-control"
                                        placeholder="Contact Number" required>
                                </div>

                                <!-- Bio -->
                                <div class="mb-3">
                                    <label class="form-label">Bio</label>
                                    <textarea v-model="form.bio" class="form-control" rows="3"
                                        placeholder="Tell us about yourself"></textarea>
                                </div>

                                <!-- Skills -->
                                <div class="mb-3">
                                    <label class="form-label d-block">Skills</label>
                                    <div v-for="(skill, index) in form.skills" :key="index" class="input-group mb-2">
                                        <input v-model="form.skills[index]" type="text" class="form-control"
                                            placeholder="Skill" required>
                                        <button type="button" class="btn btn-outline-danger btn-sm"
                                            @click="form.skills.splice(index, 1)">Remove</button>
                                    </div>

                                    <div class="mt-2">
                                        <button type="button" class="btn btn-outline-primary btn-sm" @click="addSkill">
                                            Add Skill
                                        </button>


                                    </div>
                                </div>

                                <!-- Services -->
                                <div class="mb-3">
                                    <label class="form-label d-block">Services</label>
                                    <div v-for="(service, index) in form.services" :key="index"
                                        class="border p-2 mb-2 rounded">
                                        <div class="mb-2">
                                            <label class="form-label">Service Type</label>
                                            <select v-model="service.type" class="form-select" required>
                                                <option value="" disabled>Select a service</option>
                                                <option v-for="type in serviceTypes" :key="type" :value="type">{{ type
                                                    }}
                                                </option>
                                            </select>
                                        </div>
                                        <div class="mb-2">
                                            <label class="form-label">Years of Experience</label>
                                            <input v-model.number="service.yearsOfExp" type="number"
                                                class="form-control" placeholder="Years of Experience" required>
                                        </div>
                                        <div class="mb-2">
                                            <label class="form-label">Fee Rate ($/hr)</label>
                                            <input v-model.number="service.feeRate" type="number" class="form-control"
                                                placeholder="Fee Rate" required>
                                        </div>
                                        <button type="button" class="btn btn-outline-danger btn-sm"
                                            @click="form.services.splice(index, 1)">Remove Service</button>
                                    </div>
                                    <div class="mt-2">
                                        <button type="button" class="btn btn-outline-primary btn-sm"
                                            @click="addService">
                                            Add Service
                                        </button>

                                    </div>
                                </div>

                            </div>

                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary btn-sm"
                                    @click="showModal = false">Cancel</button>
                                <button type="submit" class="btn btn-primary btn-sm">Save</button>
                            </div>
                        </form>
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

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 0.8rem;
    font-weight: 600;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    text-align: center;
}

.position-relative:hover .overlay {
    opacity: 1;
}
</style>
