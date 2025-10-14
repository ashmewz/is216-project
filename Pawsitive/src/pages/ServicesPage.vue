<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import { ref, computed } from "vue";

const providers = ref([
  {
    id: 1,
    name: "Luna Lim",
    services: ["Pet Grooming", "Cat Sitting"],
    experience: 5,
    location: "Jurong East",
    image: "https://randomuser.me/api/portraits/women/21.jpg",
  },
  {
    id: 2,
    name: "Marcus Tan",
    services: ["Vet Consultation"],
    experience: 8,
    location: "Tampines",
    image: "https://randomuser.me/api/portraits/men/42.jpg",
  },
  {
    id: 3,
    name: "Aisha Noor",
    services: ["Pet Walking", "Pet Grooming"],
    experience: 3,
    location: "Woodlands",
    image: "https://randomuser.me/api/portraits/women/18.jpg",
  },
  {
    id: 4,
    name: "Daniel Ong",
    services: ["Pet Sitting"],
    experience: 1,
    location: "Clementi",
    image: "https://randomuser.me/api/portraits/men/31.jpg",
  },
]);

const selectedService = ref("All");
const minExperience = ref(0);
const selectedLocation = ref("All");

const availableServices = computed(() => {
  const all = providers.value.flatMap((p) => p.services);
  return ["All", ...new Set(all)];
});

const availableLocations = computed(() => {
  const all = providers.value.map((p) => p.location);
  return ["All", ...new Set(all)];
});

const filteredProviders = computed(() => {
  return providers.value.filter((p) => {
    const matchService =
      selectedService.value === "All" ||
      p.services.includes(selectedService.value);

    const matchExperience = p.experience >= minExperience.value;

    const matchLocation =
      selectedLocation.value === "All" ||
      p.location === selectedLocation.value;

    return matchService && matchExperience && matchLocation;
  });
});
</script>

<template>
  <Navbar />
  <div class="container my-5">
    <h2 class="fw-bold mb-4 text-center">Find a Pet Service Provider</h2>

    <div class="row g-3 mb-4 align-items-end">
      <div class="col-md-4">
        <label class="form-label fw-semibold">Service Type</label>
        <select v-model="selectedService" class="form-select">
          <option v-for="service in availableServices" :key="service" :value="service">
            {{ service }}
          </option>
        </select>
      </div>

      <div class="col-md-4">
        <label class="form-label fw-semibold">Minimum Experience (Years)</label>
        <input
          v-model.number="minExperience"
          type="number"
          min="0"
          class="form-control"
          placeholder="e.g., 3"
        />
      </div>

      <div class="col-md-4">
        <label class="form-label fw-semibold">Location</label>
        <select v-model="selectedLocation" class="form-select">
          <option v-for="loc in availableLocations" :key="loc" :value="loc">
            {{ loc }}
          </option>
        </select>
      </div>
    </div>

    <div class="row g-4">
      <div
        v-for="p in filteredProviders"
        :key="p.id"
        class="col-12 col-sm-6 col-lg-4"
      >
        <div class="card h-100 shadow-sm profile-card">
          <img :src="p.image" class="card-img-top" alt="Profile image" />
          <div class="card-body">
            <h5 class="card-title fw-bold mb-1">{{ p.name }}</h5>
            <p class="text-muted mb-2">{{ p.location }}</p>
            <p class="mb-2 small">
              <strong>Experience:</strong> {{ p.experience }} years
            </p>
            <div class="d-flex flex-wrap gap-1">
              <span
                v-for="s in p.services"
                :key="s"
                class="badge bg-secondary-subtle text-dark border"
              >
                {{ s }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredProviders.length === 0" class="text-center mt-4">
        <p class="text-muted">No providers match your filters.</p>
      </div>
    </div>
    <BottomFooter />
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

.form-label {
  font-size: 0.95rem;
}

.badge {
  background-color: #f1f3f5;
  font-size: 0.8rem;
  border-radius: 0.5rem;
  padding: 0.35rem 0.6rem;
}
</style>
