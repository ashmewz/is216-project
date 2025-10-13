<script setup>
import { useRoute } from "vue-router";
const route = useRoute(); // used to detect active route path
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary shadow-sm">
    <div class="container-fluid">
      <a class="navbar-brand d-flex align-items-center gap-2" href="#">
        <img
          src="@/assets/pawsitive_updated.png"
          alt="Pawsitive Logo"
          class="navbar-logo"
        />
      </a>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#pawsitive-navbar"
        aria-controls="pawsitive-navbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Nav Links -->
      <div class="collapse navbar-collapse" id="pawsitive-navbar">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">

          <!-- Standard links -->
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: route.path.startsWith('/map') }"
              to="/map/"
              >Map</RouterLink
            >
          </li>

          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: route.path.startsWith('/forum') }"
              to="/forum/"
              >Forum</RouterLink
            >
          </li>

          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: route.path.startsWith('/report') }"
              to="/report/"
              >Report</RouterLink
            >
          </li>

          <!-- Volunteer Dropdown -->
          <li class="nav-item dropdown">
            <a
              href="#"
              class="nav-link dropdown-toggle"
              id="navbar-volunteer-dropdown"
              role="button"
              data-bs-toggle="dropdown"
            >
              Volunteer
            </a>
<<<<<<< Updated upstream
            <div class="collapse navbar-collapse" id="pawsitive-navbar">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/map/">Map</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/forum/">Forum</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/report/">Report</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/donations">Donations</RouterLink>
                    </li>
                    <li class="nav-item dropdown">
                        <a href="#" class="nav-link dropdown-toggle" id="navbar-volunteer-dropdown" role="button" data-bs-toggle="dropdown">
                            Volunteer
                        </a>
                        <ul class="dropdown-menu">
                            <li class="nav-item">
                                <RouterLink class="nav-link" to="/volunteer/signup/">Sign Up</RouterLink>
                            </li>
                            <li class="nav-item">
                                <RouterLink class="nav-link" to="/volunteer/login/">Log in</RouterLink>
                            </li>
                            <li class="nav-item">
                                <RouterLink class="nav-link" to="/volunteer/profile/">Volunteer Profile</RouterLink>
                            </li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/adoption/">Adoption</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/services/">Services</RouterLink>
                    </li>
                    <li class="nav-item dropdown">
                        <a href="#" class="nav-link dropdown-toggle" id="navbar-ai-dropdown" role="button" data-bs-toggle="dropdown">
                            AI
                        </a>
                        <ul class="dropdown-menu">
                            <li class="nav-item">
                                <RouterLink class="nav-link" to="/ai/recog/">AI Recognition</RouterLink>
                            </li>
                            <li class="nav-item">
                                <RouterLink class="nav-link" to="/ai/guidebook/">AI Guidebook</RouterLink>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
=======
            <ul class="dropdown-menu">
              <li>
                <RouterLink
                  class="dropdown-item"
                  :class="{ active: route.path.startsWith('/volunteer/signup') }"
                  to="/volunteer/signup/"
                  >Sign Up</RouterLink
                >
              </li>
              <li>
                <RouterLink
                  class="dropdown-item"
                  :class="{ active: route.path.startsWith('/volunteer/login') }"
                  to="/volunteer/login/"
                  >Log in</RouterLink
                >
              </li>
              <li>
                <RouterLink
                  class="dropdown-item"
                  :class="{ active: route.path.startsWith('/volunteer/profile') }"
                  to="/volunteer/profile/"
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
              >Adoption</RouterLink
            >
          </li>

          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: route.path.startsWith('/services') }"
              to="/services/"
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
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  z-index: 10100;
}

/* Logo placeholder */
.navbar-logo {
  width: 54px;
  height: 48px;
}

/* Highlight active nav link */
.nav-link.active,
.dropdown-item.active {
  color: #0d6efd !important;
  font-weight: 600;
  border-bottom: 2px solid #0d6efd;
}

/* Improve dropdown appearance */
.dropdown-menu {
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Slight hover feedback */
.nav-link:hover,
.dropdown-item:hover {
  color: #0a58ca !important;
}
</style>
