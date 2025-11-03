<script setup>
import { defineProps } from 'vue'

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
            {{ Array.isArray(cat.last_location) 
              ? cat.last_location.join(",\n") 
              : cat.last_location._lat.toFixed(8) + ",\n" + cat.last_location._long.toFixed(8) 
            }}
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
