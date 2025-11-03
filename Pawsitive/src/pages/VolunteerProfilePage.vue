<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import ProfileCard from '@/components/resuables/ProfileCard.vue';
import defaultAvatar from '@/assets/avatar_placeholder.jpg'
import { validateProfileUpdate } from '@/utils/validators';

import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'

// FIREBASE SETUP
const router = useRouter()
const auth = getAuth()
const db = getFirestore()

const errorMessage = ref('')
const fieldErrors = ref({})
const showModal = ref(false)
const avatarInput = ref(null)

const region = [
    "Central",
    "North",
    "North-East",
    "East",
    "West"
];


// STATE MANAGEMENT
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
    region: '',
})

const form = ref({
    username: '',
    firstName: '',
    lastName: '',
    contactNumber: '',
    bio: '',
    avatar: null,
    skills: [],
    services: [],
    region: '',
})

const serviceTypes = [
    "Pet Grooming",
    "Pet Sitting",
    "Vet Consultation",
    "Pet Walking"
];

// CENTRALISED AVATARURL
const avatarUrl = computed(() => {
    // If editing (modal open), prefer form.avatar even if it's null
    if (showModal.value) {
        return form.value.avatar !== null
            ? form.value.avatar
            : defaultAvatar
    }

    return user.value.avatar || defaultAvatar
})

//basically clear error messages when the field is being typed on
watch(() => form.value.firstName, () => fieldErrors.value.firstName = '');
watch(() => form.value.lastName, () => fieldErrors.value.lastName = '');
watch(() => form.value.contactNumber, () => fieldErrors.value.contactNumber = '');


// Trigger the hidden file input when image is clicked
const triggerFileInput = () => {
    avatarInput.value.click();
};

// AVATAR HANDLING
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

const onAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
        const base64 = await fileToBase64(file);
        form.value.avatar = base64;
    } catch (err) {
        console.error("Failed to read file:", err);
    }
};

const onRemoveAvatar = () => {
    form.value.avatar = null;
    // user.value.avatar = null;
};


// PROFILE EDITING
const onEditProfile = async () => {
    showModal.value = true

    // Deep copy the services and skills to break reference btween user.services and form.services
    // this is to prevent the main card data from updating before the edit modal form is saved
    form.value.services = user.value.services.map(s => ({ ...s }));
    form.value.skills = [...user.value.skills];
}

const addSkill = () => {
    fieldErrors.value.skills = '';

    // Check if all existing skills are filled before allowing to add another
    const hasEmptySkill = form.value.skills.some(s => !s.trim());
    if (hasEmptySkill) {
        fieldErrors.value.skills = 'Please fill in all existing skills before adding a new one.';
        return;
    }

    // Add new empty skill field
    form.value.skills.push('');
};


const addService = () => {
    fieldErrors.value.services = '';

    // Check if all existing services are filled before allowing to add another
    const hasIncompleteService = form.value.services.some(
        s => !s.type.trim()
    );

    if (hasIncompleteService) {
        fieldErrors.value.services = 'Please fill in all existing services before adding a new one.';
        return;
    }
    form.value.services.push({ type: '', yearsOfExp: 0, feeRate: 0 });
};

// PROFILE SAVE
const onSaveProfile = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const errors = validateProfileUpdate(form.value);
    if (Object.keys(errors).length > 0) {
        fieldErrors.value = errors;
        return
    };

    try {
        const userDoc = doc(db, 'volunteers', currentUser.uid);
        await updateDoc(userDoc, {
            firstName: form.value.firstName.trim(),
            lastName: form.value.lastName.trim(),
            contactNumber: form.value.contactNumber.trim(),
            skills: form.value.skills.map(s => s.trim()).filter(Boolean),
            services: form.value.services,
            avatar: form.value.avatar || null,
            bio: form.value.bio.trim() || '',
            region: form.value.region
        });
        await fetchUserDetails()
        showModal.value = false;
        window.location.reload();

    } catch (error) {
        errorMessage.value = 'Failed to save profile. Please try again'
        return
    }
};

// LOGOUT 
const onLogout = async () => {
    try {
        await signOut(auth)
        router.push('/')
    } catch (error) {
        alert("Failed to logout. Please try again")
    }
}

// FETCH USER DETAILS FROM FIRESTORE
const fetchUserDetails = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) {
        router.push('/')
        return
    }

    try {
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
            user.value.region = data.region

            form.value.firstName = data.firstName || ''
            form.value.lastName = data.lastName || ''
            form.value.contactNumber = data.contactNumber || ''
            form.value.bio = data.bio || ''
            form.value.skills = [...(data.skills || [])]
            form.value.services = [...(data.services || [])]
            form.value.avatar = user.value.avatar
            form.value.region = user.value.region
        }
    }
    catch (error) {
        alert("Failed fetch profile. Please try again")
    }
}

// LIFECYCLE
onMounted(() => {
    onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            // user is logged in
            // set email value in card (get from firebase auth as email is stored there)
            user.value.email = currentUser.email || ''

            //get and set other user details from firestore
            fetchUserDetails()
        } else {
            // user is NOT logged in
            // redirect to login page
            router.push('/')
        }
    })
})
</script>

<template>
    <div class="d-flex flex-column min-vh-100 page-background">
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
                                            :class="{ 'is-invalid': fieldErrors.firstName }" placeholder="First Name" />
                                        <div class="invalid-feedback">
                                            {{ fieldErrors.firstName }}
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Last Name</label>
                                        <input v-model="form.lastName" type="text" class="form-control"
                                            :class="{ 'is-invalid': fieldErrors.lastName }" placeholder="Last Name" />
                                        <div class="invalid-feedback">
                                            {{ fieldErrors.lastName }}
                                        </div>
                                    </div>
                                </div>

                                <!-- Contact Number -->
                                <div class="mb-3">
                                    <label class="form-label">Contact Number</label>
                                    <input v-model="form.contactNumber" type="tel" class="form-control"
                                        :class="{ 'is-invalid': fieldErrors.contactNumber }"
                                        placeholder="Contact Number" />
                                    <div class="invalid-feedback">
                                        {{ fieldErrors.contactNumber }}
                                    </div>
                                </div>

                                <!-- Bio -->
                                <div class="mb-3">
                                    <label class="form-label">Bio</label>
                                    <textarea v-model="form.bio" class="form-control" rows="3"
                                        placeholder="Tell us about yourself"></textarea>
                                </div>

                                <!-- Region -->
                                <div class="mb-3">
                                    <label class="form-label">Region</label>
                                    <select v-model="form.region" class="form-select"
                                        :class="{ 'is-invalid': fieldErrors.region }">
                                        <option value="select" disabled>Select a region</option>
                                        <option value="">None</option>
                                        <option v-for="r in region" :key="r" :value="r">{{ r }}</option>
                                    </select>
                                    <div class="invalid-feedback">{{ fieldErrors.region }}</div>
                                </div>


                                <!-- Skills -->
                                <div class="mb-3">
                                    <label class="form-label d-block">Skills</label>
                                    <div v-for="(skill, index) in form.skills" :key="index" class="input-group mb-2">
                                        <input v-model="form.skills[index]" type="text" class="form-control"
                                            placeholder="Skill">
                                        <button type="button" class="btn btn-outline-danger btn-sm"
                                            @click="form.skills.splice(index, 1)">Remove</button>
                                    </div>

                                    <div class="mt-2">
                                        <button type="button" class="btn btn-outline-primary btn-sm" @click="addSkill">
                                            Add Skill
                                        </button>
                                        <div v-if="fieldErrors.skills" class="invalid-feedback d-block">
                                            {{ fieldErrors.skills }}
                                        </div>

                                    </div>
                                </div>

                                <!-- Services -->
                                <div class="mb-3">
                                    <label class="form-label d-block">Services</label>
                                    <div v-for="(service, index) in form.services" :key="index"
                                        class="border p-2 mb-2 rounded">
                                        <div class="mb-2">
                                            <label class="form-label">Service Type</label>
                                            <select v-model="service.type" class="form-select">
                                                <option value="" disabled>Select a service</option>
                                                <option v-for="type in serviceTypes" :key="type" :value="type">{{ type
                                                    }}
                                                </option>
                                            </select>
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
                                            @click="addService">
                                            Add Service
                                        </button>

                                        <div v-if="fieldErrors.services" class="invalid-feedback d-block">
                                            {{ fieldErrors.services }}
                                        </div>


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

.page-background{
    background-color: #f8e1e1;
}
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

.modal.show {
  display: block !important;
  z-index: 2000; /* higher than navbar */
}

.modal-backdrop.show {
  z-index: 1500;
}

.navbar {
  z-index: 1000;
}

</style>
