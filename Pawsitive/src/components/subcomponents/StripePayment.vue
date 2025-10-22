<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { loadStripe } from '@stripe/stripe-js'

const props = defineProps({
  clientSecret: { type: String, required: true },
})

// Put your real publishable key here or use env var
const STRIPE_PUBLISHABLE_KEY = "pk_test_51SGctLA4UE4DKmEOYkurPuHwLOC7aZGSMLJ0SxgGWnjdIz0PyfrwohTpxD1paL9X5xhFoPbUTdQnV3oyUIHNgb7j00YEyGc6kv"

let stripe = null
let elements = null
const mountedPayment = ref(false)
const errorMessage = ref(null)
const loading = ref(false)

async function initStripe(secret) {
  errorMessage.value = null
  if (!secret) return

  loading.value = true
  try {
    if (!stripe) {
      stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY)
    }

    // If elements already exists, destroy and recreate to ensure correct clientSecret
    if (elements) {
      try {
        elements.unmount?.('#payment-element')
      } catch (e) {
        // ignore
      }
      elements = null
    }

    elements = stripe.elements({ clientSecret: secret })

    // create & mount Payment Element
    const paymentElement = elements.create('payment', { layout: 'tabs' })
    paymentElement.mount('#payment-element')
    mountedPayment.value = true
  } catch (err) {
    console.error('Stripe init error', err)
    errorMessage.value = err.message || 'Failed to initialize payment'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.clientSecret,
  (newSecret) => {
    if (newSecret) initStripe(newSecret)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  try {
    elements?.unmount?.('#payment-element')
  } catch (e) {
    // noop
  }
})
  
async function handleSubmit() {
  errorMessage.value = null
  if (!stripe || !elements) {
    errorMessage.value = 'Payment not initialized yet.'
    return
  }

  loading.value = true
  try {
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // redirect back to donation success placeholder
        return_url: `${window.location.origin}/donation-success`,
      },
    })

    if (error) {
      // display localized message
      errorMessage.value = error.message || 'Payment failed'
      console.error('confirmPayment error', error)
    }
    // If no error, Stripe will redirect the user automatically
  } catch (err) {
    console.error(err)
    errorMessage.value = err.message || 'Unexpected error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="stripe-payment-wrapper">
    <div v-if="loading" class="loading-note">Loading payment form…</div>

    <div id="payment-element" style="min-height:120px;"></div>

    <div v-if="errorMessage" class="stripe-error">{{ errorMessage }}</div>

    <button
      class="complete-button"
      @click="handleSubmit"
      :disabled="loading || !mountedPayment"
    >
      {{ loading ? 'Processing...' : 'Complete Payment' }}
    </button>
  </div>
</template>

<style scoped>
.loading-note {
  margin-bottom: 1rem;
  color: #444;
}
.stripe-error {
  margin: 1rem 0;
  color: #dc2626;
}
.complete-button {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 9999px;
  border: none;
  background: var(--dark-blue);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  margin-top: 30px;
}
.complete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
