<script setup>
import { ref, onMounted } from 'vue'
import { loadStripe } from '@stripe/stripe-js'

const status = ref('loading')
const message = ref('Checking your payment status...')

onMounted(async () => {
  const stripe = await loadStripe('pk_test_YourPublicKeyHere')

  // Stripe adds this to the redirect URL automatically
  const clientSecret = new URLSearchParams(window.location.search).get(
    'payment_intent_client_secret'
  )

  if (!clientSecret) {
    status.value = 'error'
    message.value = 'No payment information found.'
    return
  }

  // Retrieve the PaymentIntent to check status
  const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)

  switch (paymentIntent.status) {
    case 'succeeded':
      status.value = 'success'
      message.value = '🎉 Your donation was successful! Thank you for your kindness ❤️'
      break
    case 'processing':
      status.value = 'processing'
      message.value = '⏳ Your donation is still being processed. Please wait...'
      break
    case 'requires_payment_method':
      status.value = 'error'
      message.value = '⚠️ Your payment was not successful. Please try again.'
      break
    default:
      status.value = 'error'
      message.value = 'Something went wrong. Please contact support.'
      break
  }
})
</script>

<template>
  <div class="success-container">
    <div class="card">
      <div v-if="status === 'loading'" class="spinner"></div>
      <h1
        v-if="status === 'success'"
        class="success-title"
      >
        Thank You!
      </h1>
      <h1
        v-else-if="status === 'error'"
        class="error-title"
      >
        Payment Failed
      </h1>
      <h1
        v-else-if="status === 'processing'"
        class="processing-title"
      >
        Processing Payment
      </h1>
      <p class="status-message">{{ message }}</p>

      <router-link to="/" class="back-button">Return to Home</router-link>
    </div>
  </div>
</template>

<style scoped>
.success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--blue);
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 1.5rem;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.success-title {
  color: #16a34a;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.error-title {
  color: #dc2626;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.processing-title {
  color: #f59e0b;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.status-message {
  font-size: 1.125rem;
  color: #333;
  margin-bottom: 2rem;
}

.back-button {
  display: inline-block;
  background: var(--dark-blue);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #5b21b6;
}

.spinner {
  margin: 2rem auto;
  border: 6px solid #f3f3f3;
  border-top: 6px solid var(--dark-blue);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
