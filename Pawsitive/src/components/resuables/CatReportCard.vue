<script setup>
defineProps({
    report: {
        type: Object,
        required: true
    }
})
</script>

<template>
    <div class="card shadow-sm mb-3">
        <div class="card-body p-3 ">

            <!-- Submitted by + Status -->
            <div class="d-flex align-items-center mb-2">
                <router-link :to="`/volunteer/profile/${report.username}`"
                    class="d-flex align-items-center text-decoration-none text-dark"
                    style="cursor: pointer; background-color: transparent;">
                    <img v-if="report.avatar" :src="report.avatar" alt="avatar" class="rounded-circle me-2"
                        style="width:35px; height:35px; object-fit:cover;" />
                    <strong>{{ report.username }}</strong>
                </router-link>

                <span class="badge ms-auto" :class="report.status === 'Found' ? 'bg-success' : 'bg-danger'">
                    {{ report.status }}
                </span>
            </div>

            <!-- Cat info using grid -->
            <div class="mb-2 d-grid gap-1" style="grid-template-columns: 90px 1fr;">
                <div style="font-weight: 600;">Name:</div>
                <div>{{ report.name }}</div>

                <div style="font-weight: 600;">Location:</div>
                <div>{{ report.location }}</div>

                <div style="font-weight: 600;">Details:</div>
                <div style="white-space: pre-wrap;">{{ report.description }}</div>
            </div>

            <!-- Report image -->
            <img v-if="report.image" :src="report.image" alt="cat image" class="img-fluid rounded mb-2"
                style="max-height:200px; width:100%; object-fit:cover;" />

            <!-- Timestamp -->
            <small class="text-muted d-block mt-2">
            {{ report.createdAt?.toDate ? report.createdAt.toDate().toLocaleString([], { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }) : '' }}
            </small>

        </div>
    </div>
</template>


<style scoped>
.card {
    all: revert;
}
</style>