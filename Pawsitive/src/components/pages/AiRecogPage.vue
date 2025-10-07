<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import { runPrediction } from "@/api/catBreedApi";
import BottomFooter from '@/components/resuables/BottomFooter.vue';
</script>

<template>
    <Navbar>
        <template v-slot:navbar-title>
            AI Recognition
        </template>
    </Navbar>
      <div style="display: grid">
            <img src="../../../cat1.png" style="height: 200px; width: 200px;" alt="Cat" />
            <span>Click here to check cat breed</span>
            <button @click="runPrediction('../../../cat1.png')">Run API Cat Prediction</button>
            <span id="breed-1">Breed will be shown here</span>
        </div>

        <div style="display: grid">
            <img src="../../../cat2.png" style="height: 200px; width: 200px;" alt="Cat" />
            <span>Click here to check cat breed</span>
            <button @click="runPrediction('../../../cat2.png')">Run API Cat Prediction</button>
            <span id="breed-2">Breed will be shown here</span>
        </div>
    <BottomFooter></BottomFooter>
</template>

<style scoped></style>