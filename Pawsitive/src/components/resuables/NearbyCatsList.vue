<script setup>
import { defineProps, ref, watch, onMounted } from 'vue'

const props = defineProps({
  cats: {
    type: Array,
    required: true,
    default: () => []
  },
  showDistance: {
    type: Boolean,
    default: false
  }
})

// Store geocoded addresses
const geocodedAddresses = ref({})
const loadingAddresses = ref({})

// Reverse geocode function
async function reverseGeocode(lat, lon) {
  if (lat == null || lon == null) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=16&addressdetails=1`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await resp.json();
    return data?.display_name ?? null;
  } catch (err) {
    console.warn('Reverse geocoding failed:', err);
    return null;
  }
}

// Get coordinates from cat location
function getCoordinates(location) {
  if (!location) return null;
  
  if (Array.isArray(location)) {
    return { lat: location[0], lon: location[1] };
  } else if (location._lat !== undefined && location._long !== undefined) {
    return { lat: location._lat, lon: location._long };
  } else if (location.latitude !== undefined && location.longitude !== undefined) {
    return { lat: location.latitude, lon: location.longitude };
  }
  return null;
}

// Geocode all cat locations
async function geocodeAllCats() {
  for (const cat of props.cats) {
    if (!cat.id) continue;
    
    // Skip if already loaded or loading
    if (geocodedAddresses.value[cat.id] || loadingAddresses.value[cat.id]) continue;
    
    const coords = getCoordinates(cat.last_location);
    if (coords) {
      loadingAddresses.value[cat.id] = true; // Set loading state
      const address = await reverseGeocode(coords.lat, coords.lon);
      loadingAddresses.value[cat.id] = false; // Clear loading state
      
      if (address) {
        geocodedAddresses.value[cat.id] = address;
      } else {
        geocodedAddresses.value[cat.id] = 'Unable to find location';
      }
    } else {
      geocodedAddresses.value[cat.id] = 'Unable to find location';
    }
  }
}

// Get display address for a cat
function getLocationDisplay(cat) {
  // Show loading spinner if currently loading
  if (loadingAddresses.value[cat.id]) {
    return null; // Will trigger spinner in template
  }
  
  // Return cached address if available
  if (geocodedAddresses.value[cat.id]) {
    return geocodedAddresses.value[cat.id];
  }
  
  // Default loading state (before geocoding starts)
  return null; // Will trigger spinner in template
}

// Watch for changes in cats array
watch(() => props.cats, () => {
  geocodeAllCats();
}, { deep: true, immediate: true })

onMounted(() => {
  geocodeAllCats();
})
</script>

<template>
  <div class="nearby-cats-container">
    <div v-for="cat in cats" :key="cat.id" class="nearby-cat-card card mb-3 p-2">
      <div class="d-flex gap-2">
        <img 
          v-if="cat.photos && cat.photos.length" 
          :src="cat.photos[0]" 
          alt="cat photo" 
          class="card-img"
          style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" 
        />
        <div class="cat-info-text">
          <h6 class="mb-1"><strong>Name:</strong> {{ cat.name || 'Unnamed Cat' }}</h6>
          <p class="mb-1 text-break">
            <strong>Description:</strong><br> 
            {{ cat.description || 'No description' }}
          </p>
          <p class="mb-1 text-break">
            <strong>Last Location:</strong><br>
            <span v-if="getLocationDisplay(cat) === null" class="text-muted">
              <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Loading location...
            </span>
            <span v-else>{{ getLocationDisplay(cat) }}</span>
          </p>
          <p class="mb-1">
            <strong>Created At:</strong> 
            {{ cat.created_at?.toDate 
              ? cat.created_at.toDate().toLocaleString() 
              : cat.created_at 
            }}
          </p>
          <p v-if="showDistance && cat.distanceMeters" class="mb-0">
            <strong>Estimated Distance:</strong> {{ cat.distanceMeters.toFixed(2) }} m
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cat-info-text {
  min-width: 0;
  flex-grow: 1;
  flex-shrink: 1;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.nearby-cat-card .card-img {
  flex-shrink: 0;
}

.nearby-cats-container {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.nearby-cat-card {
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}
</style>
