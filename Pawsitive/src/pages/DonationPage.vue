<script setup>
import NavBar from '@/components/resuables/Navbar.vue';
import { ref } from "vue";
import BottomFooter from '@/components/resuables/BottomFooter.vue';

// Replace this with your actual Stripe Payment Link
const stripeLink = "https://buy.stripe.com/test_123456789ABCDEFG";

const thankYou = ref("");

function goToStripe() {
  window.location.href = stripeLink;
}
</script>

<template>
    <div>
        <NavBar \></NavBar>
    </div>
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
    <h1 class="text-4xl font-bold mb-4 text-center">Support Our Cause ❤️</h1>
    <p class="text-gray-600 max-w-md text-center mb-8">
      Your contribution helps us continue our wellness and sustainability programs. Every bit counts!
    </p>

    <button
      @click="goToStripe"
      class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg shadow-md transition-all"
    >
      Donate Now
    </button>

    <p v-if="thankYou" class="mt-6 text-green-600 text-lg">{{ thankYou }}</p>
  </div>
  <BottomFooter \></BottomFooter>
</template>

<style scoped>
body {
  font-family: "Poppins", sans-serif;
}
</style>
