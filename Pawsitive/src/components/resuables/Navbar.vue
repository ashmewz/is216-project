<script setup>
</script>

<template>

    <!-- <div class="navbar">
    <RouterLink to="/KevanTest/">Kevan Test</RouterLink>
    <RouterLink to="/map/">Map</RouterLink>
</div> -->

    <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#pawsitive-navbar"
                aria-controls="pawsitive-navbar" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <a class="navbar-brand" href="#">
                <slot name="navbar-title">Pawsitive</slot>
            </a>
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
                        <RouterLink class="nav-link" to="/volunteer/signup/">Sign Up</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/volunteer/login/">Log in</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/volunteer/profile/">Volunteer Profile</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/adoption/">Adoption</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/services/">Services</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/ai/recog/">AI Recognition</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/ai/guidebook/">AI Guidebook</RouterLink>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

</template>

<style scoped></style>
