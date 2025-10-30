<script setup>
import { useRoute } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, onMounted } from "vue";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import defaultAvatar from '@/assets/avatar_placeholder.jpg'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css'
import * as bootstrap from 'bootstrap';

const avatar = ref(null);
const auth = getAuth();

onMounted(() => {
  // get user's avatar from db to display on navbar
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const docRef = doc(db, "volunteers", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          avatar.value = docSnap.data().avatar || null;
        }
      } catch (error) {
        console.error("Error fetching profile photo:", error);
        avatar.value = null;
      }
    } else {
      avatar.value = null;
    }
  });
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  dropdownToggles.forEach(el => {
    new bootstrap.Dropdown(el);
  });
});
const route = useRoute();

import { nextTick } from "vue";
const aiDropdownOpen = ref(false);
const dropdownMenu = ref(null);
function toggleAIDropdown() {
  aiDropdownOpen.value = !aiDropdownOpen.value;
  nextTick(() => {
    if (dropdownMenu.value) {
      const rect = dropdownMenu.value.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        dropdownMenu.value.style.left = `-${rect.right - window.innerWidth + 5}px`;
      } else {
        dropdownMenu.value.style.left = '';
      }
    }
  });
}

</script>

<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary shadow-sm">
    <div class="container-fluid">
      <RouterLink class="navbar-brand d-flex align-items-center gap-2">
        <img src="@/assets/pawsitive_updated.png" alt="Pawsitive Logo" class="navbar-logo" />
        <span class="fw-bold">Pawsitive</span>
      </RouterLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#pawsitive-navbar">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="pawsitive-navbar">
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <RouterLink class="nav-link" :class="{ active: route.path.startsWith('/map') }" to="/map/">
                Map
              </RouterLink>
            </li>

            <li class="nav-item">
              <RouterLink class="nav-link" :class="{ active: route.path.startsWith('/forum') }" to="/forum/">
                Forum
              </RouterLink>
            </li>

            <li class="nav-item">
              <RouterLink class="nav-link" :class="{ active: route.path.startsWith('/donations') }" to="/donations/">
                Donations
              </RouterLink>
            </li>

            <li class="nav-item">
              <RouterLink class="nav-link" :class="{ active: route.path.startsWith('/report') }" to="/report/">
                Report
              </RouterLink>
            </li>

            <li class="nav-item">
              <RouterLink class="nav-link" :class="{ active: route.path.startsWith('/adoption') }" to="/adoption/">
                Adoption
              </RouterLink>
            </li>

            <li class="nav-item">
              <RouterLink class="nav-link" :class="{ active: route.path.startsWith('/services') }" to="/services/">
                Services
              </RouterLink>
            </li>

            <!-- AI Dropdown -->
            <li class="nav-item dropdown" @mouseleave="aiDropdownOpen = false">
              <button
                class="nav-link dropdown-toggle"
                type="button"
                @click="toggleAIDropdown"
                :aria-expanded="aiDropdownOpen"
                style="margin-top: 5px;"
              >
                AI
              </button>
              <ul
                class="dropdown-menu dropdown-menu-end"
                ref="dropdownMenu"
                :class="{ show: aiDropdownOpen }"
              >
                <li>
                  <RouterLink class="dropdown-item" to="/ai/recog/">AI Recognition</RouterLink>
                </li>
                <li>
                  <RouterLink class="dropdown-item" to="/ai/guidebook/">AI Guidebook</RouterLink>
                </li>
              </ul>
            </li>
          </ul>

        <a href="/volunteer/profile" class="btn btn-outline-secondary rounded-circle p-0" title="Profile"
          style="width:40px; height:40px;">
          <!-- Show profile photo if available -->
          <img v-if="avatar" :src="avatar" alt="Profile Photo" class="rounded-circle"
            style="width:100%; height:100%; object-fit:cover;" />
          <!-- Otherwise show default SVG -->
          <img v-else :src="defaultAvatar" alt="Profile Photo" class="rounded-circle"
            style="width:100%; height:100%; object-fit:cover;" />

        </a>

      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Neutralize Bootstrap and Vue link colors */
.navbar a,
.navbar a:hover,
.navbar .nav-link,
.navbar .dropdown-item {
  color: inherit;
  text-decoration: none;
  background: none;
}

/* Ensure Bootstrap hover variables don't override */
.navbar .nav-link:hover,
.navbar .dropdown-item:hover {
  background-color: var(--light-blue);
  color: inherit;
  text-decoration: none;
}

/* Remove Bootstrap active link highlight */
.navbar .nav-link.active,
.navbar .dropdown-item.active {
  color: inherit;
  background-color: transparent;
  text-decoration: none;
}

/* Custom underline for active items */
.nav-link.active {
  border-bottom: 3px solid var(--dark-blue);
  border-radius: 0;
}

/* Dropdown item active underline */
.dropdown-item.active > span.underline {
  border-bottom: 3px solid var(--dark-blue);
  border-radius: 0;
  padding: 2px 4px;
}

/* Navbar base styling */
.navbar {
  z-index: 10100;
  background-color: var(--white, #fff);
}

/* Brand logo */
.navbar-logo {
  height: 50px;
  object-fit: contain;
}

/* Dropdown appearance */
.dropdown-menu {
  padding: 5px 15px 5px 5px;
  width: fit-content;
  border-radius: 10px;
}

/* Dropdown items layout */
.dropdown-item {
  padding: 5px;
  margin: 5px 0 5px 5px;
  border-radius: 10px;
  width: 100%;
  text-align: center;
}

/* Remove Bootstrap’s blue outline on toggle */
.nav-item.dropdown .nav-link.dropdown-toggle:focus,
.nav-item.dropdown .nav-link.dropdown-toggle:active {
  outline: none;
  box-shadow: none;
}

/* Fix link radius only on top corners */
.nav-link {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

/* Profile button image consistency */
.btn.rounded-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

</style>
