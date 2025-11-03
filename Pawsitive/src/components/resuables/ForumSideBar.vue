<template>
  <div class="controls-sidebar">
    <div class="search-wrapper position-relative mb-3">
      <i class="bi bi-search position-absolute search-icon"></i>
      <input
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        class="form-control search-input"
        placeholder="Search posts or users..."
      />
    </div>

    <button @click="$emit('create-post')" class="create-btn text-nowrap w-100 mb-3">
      <i class="bi bi-plus-circle"></i>
      <span class="ms-2">Create Post</span>
    </button>

    <div class="position-relative sort-dropdown w-100" ref="dropdownRef">
      <button
        class="btn btn-outline-secondary sort-btn w-100"
        @click="dropdownOpen = !dropdownOpen"
      >
        <i :class="['bi', sortLabel.icon]"></i>
        <span class="ms-2">{{ sortLabel.text }}</span>
        <i class="bi bi-caret-down-fill ms-2 float-end"></i>
      </button>
      <ul class="dropdown-menu dropdown-menu-end shadow w-100" :class="{ show: dropdownOpen }">
        <li><a class="dropdown-item" href="#" @click.prevent="setSort('newest')"><i class="bi bi-clock-history me-2"></i>Newest First</a></li>
        <li><a class="dropdown-item" href="#" @click.prevent="setSort('oldest')"><i class="bi bi-clock me-2"></i>Oldest First</a></li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  searchQuery: String,
  sortLabel: Object,
})

const emit = defineEmits(['update:searchQuery', 'update:sortMode', 'create-post'])

const dropdownOpen = ref(false);
const dropdownRef = ref(null);

function setSort(mode) {
  emit('update:sortMode', mode);
  dropdownOpen.value = false;
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false;
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.controls-sidebar {
  position: sticky;
  top: 100px;
  padding: 1rem;
  background: #f8e1e1;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(128, 110, 131, 0.1);
}

.search-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.search-input {
  padding-left: 2.5rem;
  border-radius: 25px;
  border: 2px solid #e0d4e0;
  transition: all 0.3s ease;
  width: 100%;
}

.search-input:focus {
  border-color: #806e83;
  box-shadow: 0 0 0 0.2rem rgba(128, 110, 131, 0.15);
  transform: translateY(-1px);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #806e83;
  pointer-events: none;
  z-index: 10;
}

.create-btn,
.sort-btn {
  border-radius: 25px;
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  transition: all 0.3s ease;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  cursor: pointer;
}

.create-btn {
  background: #806e83;
  border: 2px solid #806e83;
  color: white;
  margin-bottom: 1rem;
}

.create-btn:hover {
  background: #6d5c70;
  border-color: #6d5c70;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(128, 110, 131, 0.4);
}

.sort-btn {
  border: 2px solid #806e83;
  color: #806e83;
  position: relative;
}

.sort-btn:hover {
  background: #806e83;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(128, 110, 131, 0.3);
}



.sort-dropdown {
  width: 100%;
}

.dropdown-menu {
  border-radius: 15px;
  border: 2px solid #f0e8f0;
  padding: 0.5rem;
  width: 100%;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  border-radius: 10px;
  padding: 0.6rem 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
}

.dropdown-item:hover {
  background: #f8e1e1;
  color: #806e83;
  transform: translateX(5px);
}

.dropdown-item i {
  color: #806e83;
  margin-right: 0.5rem;
}

/* Caret icon on sort button */
.sort-btn .bi-caret-down-fill {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
}

/* Responsive: ensure full width on narrow screens */
@media (max-width: 767px) {
  .controls-sidebar {
    position: static;
    padding: 0.5rem 0;
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
