<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
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
          <li class="nav-item dropdown">
            <a href="#" class="nav-link dropdown-toggle" id="navbar-ai-dropdown" role="button"
              data-bs-toggle="dropdown">
              AI
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <RouterLink class="dropdown-item" :class="{ active: route.path.startsWith('/ai/recog') }"
                  to="/ai/recog/">
                  <span class="underline">AI Recognition</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item" :class="{ active: route.path.startsWith('/ai/guidebook') }"
                  to="/ai/guidebook/">
                  <span class="underline">AI Guidebook</span>
                </RouterLink>
              </li>
            </ul>
          </li>
        </ul>
        <a href="/volunteer/profile" class="btn btn-outline-secondary rounded-circle" title="Profile">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="30" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
          </svg>
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
