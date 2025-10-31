<script setup>
defineProps({
  report: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="card shadow-sm">
    <div class="card-body p-3">

      <!-- Submitted by + Status -->
      <div class="d-flex align-items-center mb-2">
        <img v-if="report.avatar" :src="report.avatar" alt="avatar" class="rounded-circle me-2"
          style="width:35px; height:35px; object-fit:cover;" />
        <strong>{{ report.username }}</strong>
        <span class="badge ms-auto" :class="report.status === 'Found' ? 'bg-success' : 'bg-danger'">
          {{ report.status }}
        </span>
      </div>

      <!-- Cat info using flex -->
      <div class="d-flex mb-1">
        <div style="width: 90px; font-weight: 600;">Name:</div>
        <div>{{ report.name }}</div>
      </div>

      <div class="d-flex mb-1">
        <div style="width: 90px; font-weight: 600;">Location:</div>
        <div>{{ report.location }}</div>
      </div>

      <div class="d-flex mb-2">
        <div style="width: 90px; font-weight: 600;">Details:</div>
        <div>{{ report.description }}</div>
      </div>

      <!-- Report image -->
      <img v-if="report.image" :src="report.image" alt="cat image" class="img-fluid rounded mb-2"
        style="max-height:200px; width:100%; object-fit:cover;" />

      <!-- Timestamp -->
      <small class="text-muted d-block mt-2">
        {{ report.createdAt?.toDate ? report.createdAt.toDate().toLocaleString() : '' }}
      </small>
    </div>
  </div>
</template>
