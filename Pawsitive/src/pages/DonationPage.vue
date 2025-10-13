<script setup>
import { ref } from 'vue'
import NavBar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'
import StripePayment from '@/components/subcomponents/StripePayment.vue'

const amount = ref(10)
const clientSecret = ref(null)
const loading = ref(false)

async function createPaymentIntent() {
  if (amount.value < 1) return alert("Please enter a valid amount")

  loading.value = true
  console.log("Sending donation amount:", amount.value)

  try {
    const res = await fetch('http://localhost:4242/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amount.value }),
    })
    const data = await res.json()
    console.log("Stripe response:", data)

    if (data.clientSecret) {
      clientSecret.value = data.clientSecret
    } else {
      alert(data.error || 'Something went wrong')
    }
  } catch (err) {
    console.error(err)
    alert('Error connecting to server')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <NavBar />

    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 class="text-4xl font-bold mb-4 text-center">Support Our Cause ❤️</h1>
      <p class="text-gray-600 text-center max-w-md mb-6">
        Enter an amount and donate securely with Stripe's embedded payment form.
      </p>

      <div class="flex gap-3 mb-6">
        <input
          v-model.number="amount"
          type="number"
          class="border rounded-md px-4 py-2"
          placeholder="Amount (USD)"
        />
        <button
          @click="createPaymentIntent"
          :disabled="loading"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
        >
          {{ loading ? 'Loading...' : 'Continue' }}
        </button>
      </div>

      <div v-if="clientSecret">
        <StripePayment :client-secret="clientSecret" />
      </div>
    </div>

    <BottomFooter />
  </div>
</template>

<style scoped>
body {
  font-family: 'Poppins', sans-serif;
}
</style>
