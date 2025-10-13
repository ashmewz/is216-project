<script setup>
import { auth } from "@/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
</script>

<script>
export default {
  data() {
    return {
      currentUser: null // will hold the logged-in user
    };
  },
  methods: {

    //firebase logout
    async handleLogout() {
      try {
        await signOut(auth);
        this.currentUser = null; 
      } catch (error) {
        console.error(error);
      }
    }
  },
  mounted() {
    //check if logged in or not
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in
        this.currentUser = user;
      } else {
        // User is logged out
        this.currentUser = null;
      }
    });
  },
}
</script>

<template>

      <div v-if="currentUser" class="d-flex align-items-center">
        <span class="me-3">Hello, {{ currentUser.displayName || currentUser.email }}</span>
        <button @click="handleLogout" class="btn btn-sm btn-outline-primary">Log Out</button>
    </div>

  <RouterLink to="/map/">Map</RouterLink>
  <RouterLink to="/forum/">Forum</RouterLink>
  <RouterLink to="/report/">Report</RouterLink>
  <RouterLink to="/donations/">Donations</RouterLink>
  <RouterLink to="/volunteer/signup/">Sign Up</RouterLink> 
  <RouterLink to="/volunteer/login/">Log in</RouterLink>
  <RouterLink to="/volunteer/profile/">Volunteer Profile</RouterLink>
  <RouterLink to="/adoption/">Adoption</RouterLink>
  <RouterLink to="/services/">Services</RouterLink>
  <RouterLink to="/ai/recog/">AI Recognition</RouterLink>
  <RouterLink to="/ai/guidebook/">AI Guidebook</RouterLink>

</template>

<style scope>
a {
  margin: 5px;
  display: block;
}

a,
.green {
  text-decoration: none;
  color: hsla(160, 100%, 37%, 1);
  transition: 0.4s;
  padding: 3px;
}

@media (hover: hover) {
  a:hover {
    background-color: hsla(160, 100%, 37%, 0.2);
  }
}
</style>
