<script setup>
import { useRoute } from "vue-router";
<<<<<<< Updated upstream
const route = useRoute(); 
=======
const route = useRoute(); // used to detect active route path
>>>>>>> Stashed changes
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary shadow-sm">
    <div class="container-fluid">
<<<<<<< Updated upstream
      <RouterLink to="/" class="navbar-brand d-flex align-items-center gap-2">
=======
      <a class="navbar-brand d-flex align-items-center gap-2" href="#">
>>>>>>> Stashed changes
        <img
          src="@/assets/pawsitive_updated.png"
          alt="Pawsitive Logo"
          class="navbar-logo"
        />
<<<<<<< Updated upstream
        <span class="fw-bold">Pawsitive</span>
      </RouterLink>
=======
      </a>
>>>>>>> Stashed changes

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#pawsitive-navbar"
<<<<<<< Updated upstream
=======
        aria-controls="pawsitive-navbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
>>>>>>> Stashed changes
      >
        <span class="navbar-toggler-icon"></span>
      </button>

<<<<<<< Updated upstream
      <div class="collapse navbar-collapse" id="pawsitive-navbar">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
=======
      <!-- Nav Links -->
      <div class="collapse navbar-collapse" id="pawsitive-navbar">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">

          <!-- Standard links -->
>>>>>>> Stashed changes
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: route.path.startsWith('/map') }"
              to="/map/"
<<<<<<< Updated upstream
            >Map</RouterLink>
          </li>
=======
              >Map</RouterLink
            >
          </li>

>>>>>>> Stashed changes
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: route.path.startsWith('/forum') }"
              to="/forum/"
<<<<<<< Updated upstream
            >Forum</RouterLink>
          </li>
=======
              >Forum</RouterLink
            >
          </li>

>>>>>>> Stashed changes
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: route.path.startsWith('/report') }"
              to="/report/"
<<<<<<< Updated upstream
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
=======
              >Report</RouterLink
            >
          </li>

          <!-- Volunteer Dropdown -->
          <li class="nav-item dropdown">
            <a
              href="#"
              class="nav-link dropdown-toggle"
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                >Sign Up</RouterLink>
=======
                  >Sign Up</RouterLink
                >
>>>>>>> Stashed changes
              </li>
              <li>
                <RouterLink
                  class="dropdown-item"
                  :class="{ active: route.path.startsWith('/volunteer/login') }"
                  to="/volunteer/login/"
<<<<<<< Updated upstream
                >Log in</RouterLink>
=======
                  >Log in</RouterLink
                >
>>>>>>> Stashed changes
              </li>
              <li>
                <RouterLink
                  class="dropdown-item"
                  :class="{ active: route.path.startsWith('/volunteer/profile') }"
                  to="/volunteer/profile/"
<<<<<<< Updated upstream
                >Volunteer Profile</RouterLink>
              </li>
            </ul>
          </li>
=======
                  >Volunteer Profile</RouterLink
                >
              </li>
            </ul>
          </li>

>>>>>>> Stashed changes
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: route.path.startsWith('/adoption') }"
              to="/adoption/"
<<<<<<< Updated upstream
            >Adoption</RouterLink>
          </li>
=======
              >Adoption</RouterLink
            >
          </li>

>>>>>>> Stashed changes
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: route.path.startsWith('/services') }"
              to="/services/"
<<<<<<< Updated upstream
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
=======
              >Services</RouterLink
            >
          </li>

          <!-- AI Dropdown -->
          <li class="nav-item dropdown">
            <a
              href="#"
              class="nav-link dropdown-toggle"
              id="navbar-ai-dropdown"
              role="button"
              data-bs-toggle="dropdown"
            >
              AI
            </a>
            <ul class="dropdown-menu">
              <li>
                <RouterLink
                  class="dropdown-item"
                  :class="{ active: route.path.startsWith('/ai/recog') }"
                  to="/ai/recog/"
                  >AI Recognition</RouterLink
                >
              </li>
              <li>
                <RouterLink
                  class="dropdown-item"
                  :class="{ active: route.path.startsWith('/ai/guidebook') }"
                  to="/ai/guidebook/"
                  >AI Guidebook</RouterLink
                >
              </li>
            </ul>
          </li>
>>>>>>> Stashed changes
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  z-index: 10100;
}

<<<<<<< Updated upstream
/* Logo size */
.navbar-logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

/* Active link styling */
=======
/* Logo placeholder */
.navbar-logo {
  width: 54px;
  height: 48px;
}

/* Highlight active nav link */
>>>>>>> Stashed changes
.nav-link.active,
.dropdown-item.active {
  color: #0d6efd !important;
  font-weight: 600;
  border-bottom: 2px solid #0d6efd;
}

<<<<<<< Updated upstream
/* Dropdown appearance */
.dropdown-menu {
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Hover effect */
=======
/* Improve dropdown appearance */
.dropdown-menu {
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Slight hover feedback */
>>>>>>> Stashed changes
.nav-link:hover,
.dropdown-item:hover {
  color: #0a58ca !important;
}
</style>
