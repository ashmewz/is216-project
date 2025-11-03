<script setup>
import { ref, onMounted } from 'vue'
import { loadStripe } from '@stripe/stripe-js'

const props = defineProps({
  clientSecret: String,
})

// Public test key — safe for client
const STRIPE_PUBLISHABLE_KEY = "pk_test_51SGctLA4UE4DKmEOYkurPuHwLOC7aZGSMLJ0SxgGWnjdIz0PyfrwohTpxD1paL9X5xhFoPbUTdQnV3oyUIHNgb7j00YEyGc6kv"

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
const paymentElementRef = ref(null)
const loading = ref(false)
const message = ref('')

let stripe, elements

onMounted(async () => {
  stripe = await stripePromise
  elements = stripe.elements({ clientSecret: props.clientSecret })
  const paymentElement = elements.create('payment')
  paymentElement.mount(paymentElementRef.value)
})

async function handleSubmit() {
  loading.value = true
  message.value = ''

  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    redirect: 'if_required',
  })

  if (error) {
    message.value = error.message
    loading.value = false
    return
  }

  if (paymentIntent && paymentIntent.status === 'succeeded') {
    window.location.href = '/donationsuccess'
  } else {
    message.value = 'Payment not completed. Please try again.'
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="w-full max-w-md">
    <div ref="paymentElementRef" class="border p-4 rounded-lg bg-white mb-4"></div>

    <button
      type="submit"
      class="donate-btn"
      :disabled="loading"
    >
      {{ loading ? 'Processing...' : 'Proceed with Payment' }}
    </button>

    <p v-if="message" class="error-message">{{ message }}</p>
  </form>
</template>

<style scoped>
.donate-btn {
  width: 100%;
  padding: 1.25rem 3rem;
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  color: #ffffff;
  background: var(--dark-blue, --blue);
  border: 3px solid #ffffff;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.donate-btn:hover:not(:disabled) {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.donate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.75rem;
}
</style>
