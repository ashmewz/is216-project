<script setup>
import { computed } from 'vue'
import defaultAvatar from '@/assets/avatar_placeholder.jpg'


//props that will be passed in on the higher level
const props = defineProps({
  user: { type: Object, required: true }, //must require a user obect to display
  showActions: { type: Boolean, default: false }, // toggle show logout and edit profile buttons
  onEditProfile: { type: Function, default: () => { } }, //map the functions to the buttons
  onLogout: { type: Function, default: () => { } }, //map the functions to the buttons
})

const avatarUrl = computed(() => props.user.avatar || defaultAvatar)

</script>

<template>
  <div class="container my-3">
    <div class="card shadow-sm mx-auto my-3 px-2 px-md-4" style="max-width: 800px; border-radius: 1rem;">
      <!-- Header / Avatar -->
      <div class="card-header bg-white d-flex flex-column align-items-center border-0 pt-4">
        <!-- Avatar Wrapper -->
        <div style="width: 140px; height: 140px; overflow: hidden; border-radius: 50%;">
          <img :src="avatarUrl" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <h4 class="mt-3 mb-1 text-center">{{ user.firstName }} {{ user.lastName || '' }}</h4>
        <small class="text-muted">@{{ user.username }}</small>

        <div v-if="showActions" class="mt-3">
          <button class="btn btn-outline-primary btn-sm" @click="onEditProfile">Edit Profile</button>
        </div>
      </div>

      <!-- Body -->
      <div class="card-body d-flex flex-column">

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

        <!-- Region -->
        <div class="mb-3">
          <h6 class="text-muted">Region</h6>
          <p v-if="user.region">{{ user.region }}</p>
          <p v-else class="text-muted fst-italic">No region yet</p>
        </div>

        <!-- Skills -->
        <div class="mb-3">
          <h6 class="text-muted small">Skills</h6>
          <div v-if="user.skills && user.skills.length" class="d-flex flex-wrap gap-2">
            <span v-for="(skill, idx) in user.skills" :key="idx" class="badge bg-primary">{{ skill }}</span>
          </div>
          <p v-else class="text-muted fst-italic">No skills yet</p>
        </div>

        <!-- Services -->
        <div class="mb-3">
          <h6 class="text-muted small">Services</h6>
          <div v-if="user.services && user.services.length" class="d-flex flex-column gap-3">
            <div v-for="(service, idx) in user.services" :key="idx" class="card p-3 shadow-sm w-100">
              <div class="mb-2"><strong>{{ service.type }}</strong></div>
              <div class="d-flex justify-content-start gap-4 flex-wrap">
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
          <p v-else class="text-muted fst-italic text-start">No services yet</p>
        </div>

        <!-- Logout Button at bottom -->
        <div v-if="showActions" class="mt-auto d-flex justify-content-end">
          <button class="btn btn-danger btn-sm" @click="onLogout">Logout</button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  all: revert;
}
</style>
