<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import { ref, computed, onMounted } from "vue";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase";
import VolunteerCard from '@/components/resuables/VolunteerCard.vue';




const volunteers = ref([]);
const selectedService = ref("All");
const selectedRegion = ref("All");

//get volunteers from db and filter by whether they have services or not, if have, display else dont display
onMounted(async () => {
  const snapshot = await getDocs(collection(db, "volunteers"));

  volunteers.value = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(v => v.services && v.services.length > 0);

});

// Compute available services for filter dropdown
const availableServices = computed(() => {
  const allServices = volunteers.value.flatMap(v => v.services.map(s => s.type));
  return ["All", ...new Set(allServices)];
});

// Comput available regions for filter dropdown
const availableRegions = computed(() => {
  // Get all regions from volunteers
  const allRegions = volunteers.value.map(v => v.region).filter(r => r && r.trim() !== '');
  // Remove duplicates and sort
  return ["All", ...Array.from(new Set(allRegions))];
});


// Filter volunteers by selected service and/or region
const filteredVolunteers = computed(() => {
  return volunteers.value.filter(v => {
    if (!v.services || v.services.length === 0) return false;

    const matchesService =
      selectedService.value === "All" ||
      v.services.some(s => s.type === selectedService.value);

    const matchesRegion =
      selectedRegion.value === "All" || v.region === selectedRegion.value;

    return matchesService && matchesRegion;
  });
});
;



</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <Navbar />


    <main class="flex-grow-1 container my-5">
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
          <label class="form-label fw-semibold">Region</label>
          <select v-model="selectedRegion" class="form-select">
            <option v-for="r in availableRegions" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>

      </div>

      <div class="row g-4">
        <div v-for="v in filteredVolunteers" :key="v.id" class="col-12 col-sm-6 col-lg-4">
          <VolunteerCard :volunteer="v" :onClick="goToVolunteer" />
        </div>

        <div v-if="filteredVolunteers.length === 0" class="text-center mt-4">
          <p class="text-muted">No volunteers match your filter.</p>
        </div>
      </div>
    </main>

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
