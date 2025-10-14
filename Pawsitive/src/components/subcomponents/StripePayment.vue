<script setup>
import { ref, onMounted } from 'vue'
import { loadStripe } from '@stripe/stripe-js'

const props = defineProps({
  clientSecret: String,
})

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
const paymentElementRef = ref(null)
let stripe, elements

onMounted(async () => {
  stripe = await stripePromise
  elements = stripe.elements({ clientSecret: props.clientSecret })

  const paymentElement = elements.create('payment')
  paymentElement.mount(paymentElementRef.value)
})

async function handleSubmit() {
  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: window.location.origin + '/donate/success',
    },
  })
  if (error) alert(error.message)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="w-full max-w-md">
    <div ref="paymentElementRef" class="border p-4 rounded-lg bg-white mb-4"></div>
    <button
      type="submit"
      class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
    >
      Donate Now
    </button>
  </form>
</template>

<style scoped>
#payment-element {
  width: 100%;
}
</style>
