<script setup>
import { useRoute } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, onMounted } from "vue";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import defaultAvatar from '@/assets/avatar_placeholder.jpg'

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
});


const route = useRoute();

</script>

<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary shadow-sm">
    <div class="container-fluid">
      <RouterLink to="/" class="navbar-brand d-flex align-items-center gap-2">
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
          <li class="nav-item">
            <RouterLink class="nav-link" :class="{ active: route.path.startsWith('/ai/recog') }" to="/ai/recog/">
               AI Recognition
            </RouterLink>
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
.nav-link.active,
.dropdown-item.active,
.nav-link:hover,
.dropdown-item:hover {
  color: inherit !important;
  background-color: transparent !important;
  border-bottom: none !important;
}

.nav-item.dropdown .nav-link.dropdown-toggle {
  color: inherit !important;
}

.navbar {
  z-index: 10100;
}

.navbar-logo {
  height: 50px;
  object-fit: contain;
}

.nav-link {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.nav-link.active {
  border-bottom: 3px solid var(--dark-blue) !important;
}

.dropdown-menu {
  padding: 5px 15px 5px 5px;
  width: fit-content;
}

.dropdown-item {
  padding: 5px;
  margin: 5px 0;
  margin-left: 5px;
  border-radius: 10px;
  width: 100%;
  text-align: center;
}

.dropdown-item.active>span.underline {
  border-bottom: 3px solid var(--dark-blue) !important;
  border-radius: 0 !important;
  padding: 2px 4px;
}


.dropdown-item:hover,
.nav-link:hover {
  background-color: var(--light-blue) !important;
}
</style>
