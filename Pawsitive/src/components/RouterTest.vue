<script setup>

</script>

<script>
    export default { 
        data() {
            return {
                
            }
        }
    }
</script>

<template>   

    <RouterLink to="/map/">Map</RouterLink>
    <RouterLink to="/forum/">Forum</RouterLink>
    <RouterLink to="/report/">Report</RouterLink>
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
