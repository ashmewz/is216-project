<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
</script>

<template>
    <Navbar>
        <template v-slot:navbar-title>
            Map
        </template>
    </Navbar>
    <div class="container">
        <h1>This is the WIP Map page</h1>
    </div>
    <BottomFooter></BottomFooter>
</template>

<style scoped></style>