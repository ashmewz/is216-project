<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import defaultAvatar from '../assets/avatar_placeholder.jpg'


const router = useRouter()

//get the firebase variables needed
const auth = getAuth()
const db = getFirestore();

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

//edit profile modal open/close state
const showModal = ref(false)

//update profile modal form input states
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


const avatarUrl = computed(() => {
    return form.value.avatar || user.value.avatar || defaultAvatar;
})

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
    user.value.avatar = null;
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
}


// Save profile and update Firestore
const onSaveProfile = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
        const userDocRef = doc(db, 'volunteers', currentUser.uid);

        // ensure no undefined values
        const dataToUpdate = {
            firstName: form.value.firstName || '',
            lastName: form.value.lastName || '',
            contactNumber: form.value.contactNumber || '',
            bio: form.value.bio || '',
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
            <div class="card mx-auto shadow-sm" style="width: 40%; max-width: 800px; border-radius: 1rem;">
                <!-- Header / Avatar -->
                <div class="card-header bg-white d-flex flex-column align-items-center border-0 pt-4">
                    <img :src="avatarUrl" alt="Avatar" class="rounded-circle border" width="140" height="140" />
                    <h4 class="mt-3 mb-1">{{ user.firstName }} {{ user.lastName || '' }}</h4>
                    <small class="text-muted">@{{ user.username }}</small>
                    <button class="btn btn-outline-primary btn-sm mt-3" @click="onEditProfile">
                        Edit Profile
                    </button>
                </div>

                <!-- Body -->
                <div class="card-body px-5">

                    <!-- Email -->
                    <div class="mb-3 d-flex align-items-center">
                        <i class="bi bi-envelope-fill text-primary me-2"></i>
                        <span>{{ user.email }}</span>
                    </div>

                    <!-- Contact Number -->
                    <div class="mb-3 d-flex align-items-center">
                        <i class="bi bi-telephone-fill text-success me-2"></i>
                        <span v-if="user.contactNumber">{{ user.contactNumber }}</span>
                        <span v-else class="text-muted fst-italic">No contact number yet</span>
                    </div>

                    <!-- Bio -->
                    <div class="mb-3">
                        <h6 class="text-muted small">About Me</h6>
                        <p v-if="user.bio">{{ user.bio }}</p>
                        <p v-else class="text-muted fst-italic">No bio yet</p>
                    </div>

                    <!-- Skills -->
                    <div class="mb-3">
                        <h6 class="text-muted small">Skills</h6>
                        <div v-if="user.skills.length" class="d-flex flex-wrap gap-2">
                            <span v-for="(skill, idx) in user.skills" :key="idx" class="badge bg-primary">
                                {{ skill }}
                            </span>
                        </div>
                        <p v-else class="text-muted fst-italic">No skills yet</p>
                    </div>

                    <!-- Services -->
                    <div class="mb-3">
                        <h6 class="text-muted small">Services</h6>
                        <div v-if="user.services.length" class="d-flex flex-column gap-3">
                            <div v-for="(service, idx) in user.services" :key="idx" class="card p-3 shadow-sm w-100"
                                style="border-radius: 0.75rem;">
                                <div class="mb-2 ">
                                    <strong>{{ service.type }}</strong>
                                </div>
                                <div class="d-flex justify-content-start gap-4 ">
                                    <div>
                                        <small class="text-muted">Experience</small>
                                        <p class="mb-0">{{ service.yearsOfExp }} yrs</p>
                                    </div>
                                    <div>
                                        <small class="text-muted">Fee</small>
                                        <p class="mb-0">${{ service.feeRate }}/hr</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p v-else class="text-muted fst-italic text-center">No services yet</p>
                    </div>





                    <!-- Logout -->
                    <div class="d-flex justify-content-end mt-4">
                        <button class="btn btn-danger btn-sm" @click="onLogout">Logout</button>
                    </div>

                </div>
            </div>




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
                                <div class="mb-3 text-center">
                                    <img :src="avatarUrl" alt="Avatar" class="rounded-circle border" width="100"
                                        height="100" style="cursor: pointer;" @click="triggerFileInput">
                                    <input type="file" ref="avatarInput" @change="onAvatarChange" accept="image/*"
                                        style="display: none;">
                                    <div class="mt-2" v-if="form.avatar">
                                        <button type="button" class="btn btn-outline-danger btn-sm"
                                            @click="onRemoveAvatar">Remove Photo</button>
                                    </div>
                                </div>

                                <!-- First Name + Last Name inline -->
                                <div class="row mb-3">
                                    <div class="col-12 col-md-6 mb-2 mb-md-0">
                                        <label class="form-label">First Name</label>
                                        <input v-model="form.firstName" type="text" class="form-control"
                                            placeholder="First Name">
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Last Name</label>
                                        <input v-model="form.lastName" type="text" class="form-control"
                                            placeholder="Last Name">
                                    </div>
                                </div>

                                <!-- Contact Number -->
                                <div class="mb-3">
                                    <label class="form-label">Contact Number</label>
                                    <input v-model="form.contactNumber" type="tel" class="form-control"
                                        placeholder="Contact Number">
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
                                        <button type="button" class="btn btn-outline-primary btn-sm"
                                            @click="if (form.skills.every(s => s.trim() !== '')) form.skills.push(''); else alert('Fill existing skill before adding new')">
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
                                            <input v-model="service.type" type="text" class="form-control"
                                                placeholder="Service Type" required>
                                        </div>
                                        <div class="mb-2">
                                            <label class="form-label">Years of Experience</label>
                                            <input v-model.number="service.yearsOfExp" type="number"
                                                class="form-control" placeholder="Years of Experience">
                                        </div>
                                        <div class="mb-2">
                                            <label class="form-label">Fee Rate ($/hr)</label>
                                            <input v-model.number="service.feeRate" type="number" class="form-control"
                                                placeholder="Fee Rate">
                                        </div>
                                        <button type="button" class="btn btn-outline-danger btn-sm"
                                            @click="form.services.splice(index, 1)">Remove Service</button>
                                    </div>
                                    <div class="mt-2">
                                        <button type="button" class="btn btn-outline-primary btn-sm"
                                            @click="if (form.services.every(s => s.type.trim() !== '' && s.yearsOfExp > 0 && s.feeRate > 0)) form.services.push({ type: '', yearsOfExp: 0, feeRate: 0 }); else alert('Fill all fields of existing services before adding new')">
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
</style>
