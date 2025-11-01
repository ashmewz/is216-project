<template>
  <div class="row gx-3">
    <div class="col-12 col-md-9">
      <slot name="main"></slot>
    </div>

    <div class="col-12 col-md-3 mt-3 mt-md-0">
      <slot name="sidebar"></slot>
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

.mt-3 {
  margin-top: 1rem !important;
}
</style>
