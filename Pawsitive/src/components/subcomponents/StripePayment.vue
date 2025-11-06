<script setup>
import { ref, onMounted } from 'vue'
import { loadStripe } from '@stripe/stripe-js'

// Publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SGctLA4UE4DKmEOYkurPuHwLOC7aZGSMLJ0SxgGWnjdIz0PyfrwohTpxD1paL9X5xhFoPbUTdQnV3oyUIHNgb7j00YEyGc6kv'
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)

const cardElementRef = ref(null)
const loading = ref(false)
const message = ref('')
const clientSecret = ref(null)

let stripe = null
let elements = null
let card = null

onMounted(async () => {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 50,
    }),
  })

  const data = await response.json()
  clientSecret.value = data.clientSecret

  stripe = await stripePromise
  elements = stripe.elements()

  // Create the Card Element (plain form fields)
  card = elements.create('card', {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        '::placeholder': { color: '#a0aec0' },
      },
      invalid: { color: '#e53e3e' },
    },
  })
  card.mount(cardElementRef.value)
})

async function handleSubmit() {
  loading.value = true
  message.value = ''

  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret.value, {
    payment_method: { card },
  })

  if (error) {
    message.value = error.message
    loading.value = false
    return
  }

  if (paymentIntent && paymentIntent.status === 'succeeded') {
    window.location.href = '/donationsuccess'
  } else {
    message.value = 'Processing payment...'
  }

  loading.value = false
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="w-full max-w-md">
    <div ref="cardElementRef" class="border p-4 rounded-lg bg-white mb-4"></div>

    <button type="submit" class="pawsitive-btn" :disabled="loading">
      {{ loading ? 'Processing...' : 'Proceed with Payment' }}
    </button>

    <p v-if="message" class="error-message">{{ message }}</p>
  </form>
</template>

<style scoped>
.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.75rem;
}
</style>
