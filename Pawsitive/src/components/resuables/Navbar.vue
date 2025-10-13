<script setup>
import { useRoute } from "vue-router";
const route = useRoute(); 
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary shadow-sm">
    <div class="container-fluid">
      <RouterLink to="/" class="navbar-brand d-flex align-items-center gap-2">
        <img
          src="@/assets/pawsitive_updated.png"
          alt="Pawsitive Logo"
          class="navbar-logo"
        />
        <span class="fw-bold">Pawsitive</span>
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#pawsitive-navbar"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="pawsitive-navbar">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: route.path.startsWith('/map') }"
              to="/map/"
            >Map</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: route.path.startsWith('/forum') }"
              to="/forum/"
            >Forum</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: route.path.startsWith('/report') }"
              to="/report/"
            >Report</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: route.path.startsWith('/donations') }"
              to="/donations/"
            >Donations</RouterLink>
          </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="navbar-volunteer-dropdown"
              role="button"
              data-bs-toggle="dropdown"
            >
              Volunteer
            </a>
            <ul class="dropdown-menu">
              <li>
                <RouterLink
                  class="dropdown-item"
                  :class="{ active: route.path.startsWith('/volunteer/signup') }"
                  to="/volunteer/signup/"
                >Sign Up</RouterLink>
              </li>
              <li>
                <RouterLink
                  class="dropdown-item"
                  :class="{ active: route.path.startsWith('/volunteer/login') }"
                  to="/volunteer/login/"
                >Log in</RouterLink>
              </li>
              <li>
                <RouterLink
                  class="dropdown-item"
                  :class="{ active: route.path.startsWith('/volunteer/profile') }"
                  to="/volunteer/profile/"
                >Volunteer Profile</RouterLink>
              </li>
            </ul>
          </li>
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: route.path.startsWith('/adoption') }"
              to="/adoption/"
            >Adoption</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: route.path.startsWith('/services') }"
              to="/services/"
            >Services</RouterLink>
          </li>
            <li class="nav-item dropdown">
                <a
                    class="nav-link dropdown-toggle"
                    href="#"
                    id="navbar-ai-dropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                >
                    AI
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                        <RouterLink
                            class="dropdown-item"
                            :class="{ active: route.path.startsWith('/ai/recog') }"
                            to="/ai/recog/"
                        >AI Recognition</RouterLink>
                    </li>
                    <li>
                        <RouterLink
                            class="dropdown-item"
                            :class="{ active: route.path.startsWith('/ai/guidebook') }"
                            to="/ai/guidebook/"
                        >AI Guidebook</RouterLink>
                    </li>
                </ul>
            </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  z-index: 10100;
}

/* Logo size */
.navbar-logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

/* Active link styling */
.nav-link.active,
.dropdown-item.active {
  color: #0d6efd !important;
  font-weight: 600;
  border-bottom: 2px solid #0d6efd;
}

/* Dropdown appearance */
.dropdown-menu {
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Hover effect */
.nav-link:hover,
.dropdown-item:hover {
  color: #0a58ca !important;
}
</style>
