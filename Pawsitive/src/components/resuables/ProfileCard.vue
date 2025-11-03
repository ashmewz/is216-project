<script setup>
import { computed } from 'vue'
import defaultAvatar from '@/assets/avatar_placeholder.jpg'

const props = defineProps({
  user: { type: Object, required: true },
  showActions: { type: Boolean, default: false },
  onEditProfile: { type: Function, default: () => {} },
  onLogout: { type: Function, default: () => {} },
})

const avatarUrl = computed(() => props.user.avatar || defaultAvatar)
</script>

<template>
  <div class="container my-4">
    <div class="card profile-card shadow-sm mx-auto" style="max-width: 800px;">
      <!-- Header / Avatar -->
      <div class="card-header bg-white d-flex flex-column align-items-center border-0 pt-4">
        <div class="avatar-wrapper mb-3">
          <img :src="avatarUrl" alt="Avatar" class="avatar-img" />
        </div>
        <h4 class="mt-2 mb-1 text-center text-accent">{{ user.firstName }} {{ user.lastName || '' }}</h4>
        <small class="text-muted">@{{ user.username }}</small>

        <div v-if="showActions" class="mt-3 d-flex gap-2 flex-wrap">
          <button class="btn btn-outline-primary rounded-pill px-4 py-2" @click="onEditProfile">
            Edit Profile
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="card-body d-flex flex-column">
        <!-- Email -->
        <div class="mb-3 d-flex align-items-center gap-2">
          <i class="bi bi-envelope-fill text-primary"></i>
          <span>{{ user.email }}</span>
        </div>

        <!-- Contact -->
        <div class="mb-3 d-flex align-items-center gap-2">
          <i class="bi bi-telephone-fill text-success"></i>
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
          <h6 class="text-muted small">Region</h6>
          <p v-if="user.region">{{ user.region }}</p>
          <p v-else class="text-muted fst-italic">No region yet</p>
        </div>

        <!-- Skills -->
        <div class="mb-3">
          <h6 class="text-muted small">Skills</h6>
          <div v-if="user.skills && user.skills.length" class="d-flex flex-wrap gap-2">
            <span v-for="(skill, idx) in user.skills" :key="idx" class="badge skill-badge">{{ skill }}</span>
          </div>
          <p v-else class="text-muted fst-italic">No skills yet</p>
        </div>

        <!-- Services -->
        <div class="mb-3">
          <h6 class="text-muted small">Services</h6>
          <div v-if="user.services && user.services.length" class="d-flex flex-column gap-3">
            <div v-for="(service, idx) in user.services" :key="idx" class="card p-3 service-card shadow-sm">
              <div class="mb-2"><strong>{{ service.type }}</strong></div>
              <div class="d-flex flex-wrap gap-4">
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
          <p v-else class="text-muted fst-italic">No services yet</p>
        </div>

        <!-- Logout Button -->
        <div v-if="showActions" class="mt-auto d-flex justify-content-end">
          <button class="btn btn-danger rounded-pill px-4 py-2" @click="onLogout">Logout</button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.card{
  all:revert;
}

.card-header {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}


.profile-card {
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(128, 110, 131, 0.1);
  background-color: white;
}

.avatar-wrapper {
  width: 140px;
  height: 140px;
  overflow: hidden;
  border-radius: 50%;
  border: 4px solid #f0e8f0;
  box-shadow: 0 4px 12px rgba(128, 110, 131, 0.2);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text-accent {
  color: #806e83;
}

.skill-badge {
  background-color: #806e83;
  color: white;
  border-radius: 25px;
  padding: 0.5rem 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.skill-badge:hover {
  transform: scale(1.05);
}

.service-card {
  border-radius: 1rem;
  background: #fafafa;
  transition: all 0.2s ease;
}

.service-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 14px rgba(128, 110, 131, 0.15);
}

.btn-outline-primary {
  border: 2px solid #806e83;
  color: #806e83;
  transition: all 0.3s ease;
}

.btn-outline-primary:hover {
  background: #806e83;
  color: white;
  transform: scale(1.05);
}

.btn-danger:hover {
  background: #b34747;
  transform: scale(1.05);
}

/* Responsive adjustments for mobile */
@media (max-width: 767px) {
  .profile-card {
    margin: 1rem;
  }
}
</style>
