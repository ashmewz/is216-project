<template> 
  <div class="row gx-3">
    <!-- 🧭 Sidebar FIRST so it's on the LEFT -->
    <div class="col-12 col-md-3 mb-3 mb-md-0">
      <slot name="sidebar"></slot>
    </div>

    <!-- 📄 Main content SECOND so it's on the RIGHT -->
    <div class="col-12 col-md-9">
      <slot name="main"></slot>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.row {
  margin-left: 0;
  margin-right: 0;
}

.mb-3 {
  margin-bottom: 1rem !important;
}

@media (max-width: 991.98px) { /* Medium breakpoint and smaller */
  /* Make sidebar appear above main content */
  .row {
    display: flex;
    flex-direction: column; /* stack vertically */
  }

  .row > [class*="col-"] {
    width: 100%; /* ensure full width */
  }

  .row > .col-md-3 {
    order: -1; /* move sidebar to top */
    margin-bottom: 1.5rem; /* spacing below sidebar */
  }

  .row > .col-md-9 {
    order: 0; /* main content stays after sidebar */
  }
}

</style>