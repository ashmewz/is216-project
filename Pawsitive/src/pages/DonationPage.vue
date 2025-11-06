<script setup>
import { ref } from 'vue'
import NavBar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'
import StripePayment from '@/components/subcomponents/StripePayment.vue'

const amount = ref(25)
const customAmount = ref('')
const selectedPreset = ref(25)
const clientSecret = ref(null)
const loading = ref(false)
const showPayment = ref(false)

const presetAmounts = [
  { value: 10, impact: 'Feeds 2 cats for a day' },
  { value: 25, impact: 'Provides medical checkup' },
  { value: 50, impact: 'Covers vaccination costs' },
  { value: 100, impact: 'Supports a rescue mission' },
]

function selectPreset(value) {
  selectedPreset.value = value
  amount.value = value
  customAmount.value = ''
}

function handleCustomAmount() {
  if (customAmount.value && customAmount.value > 0) {
    selectedPreset.value = null
    amount.value = parseFloat(customAmount.value)
  }
}

async function createPaymentIntent() {
  if (amount.value < 1) {
    alert("Please enter a valid amount")
    return
  }

  loading.value = true

  try {
    const res = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amount.value }),
    })
    const data = await res.json()

    if (data.clientSecret) {
      clientSecret.value = data.clientSecret
      showPayment.value = true
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

    <NavBar />
    <div class="donation-page background">
    <div class="donation-container ">
      
      <div class="hero-section">
        <h1 class="hero-title">
          Make a Difference Today
        </h1>
        <p class="hero-description">
          Your donation helps us rescue, care for, and find loving homes for cats in need. 
          Every contribution makes a real impact.
        </p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">1,247</div>
          <div class="stat-label">Cats Rescued</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">892</div>
          <div class="stat-label">Adoptions</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">$127K</div>
          <div class="stat-label">Raised This Year</div>
        </div>
      </div>

      <div class="form-wrapper">
        <div class="donation-card">
          <h2 class="card-title">Choose Your Donation Amount</h2>

          <div class="preset-grid">
            <button
              v-for="preset in presetAmounts"
              :key="preset.value"
              @click="selectPreset(preset.value)"
              :class="['preset-button', { 'preset-selected': selectedPreset === preset.value }]"
            >
              <div class="preset-amount">${{ preset.value }}</div>
              <div class="preset-impact">{{ preset.impact }}</div>
              <div v-if="selectedPreset === preset.value" class="preset-checkmark">
                <svg class="checkmark-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          </div>

          <div class="custom-amount-section">
            <label class="custom-label">Or enter a custom amount</label>
            <div class="custom-input-wrapper">
              <span class="dollar-sign">$</span>
              <input
                v-model="customAmount"
                @input="handleCustomAmount"
                type="number"
                min="1"
                step="1"
                placeholder="Enter amount"
                class="custom-input"
              />
            </div>
          </div>

          <div class="impact-message">
            <div class="impact-content">
              <div class="impact-icon">
                <svg class="heart-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h3 class="impact-title">Your Impact</h3>
                <p class="impact-text">
                  100% of your donation goes directly to cat rescue and care. We provide food, medical treatment, 
                  shelter, and help find forever homes for every cat we rescue.
                </p>
              </div>
            </div>
          </div>

          <button
            v-if="!showPayment"
            @click="createPaymentIntent"
            :disabled="loading || amount < 1"
            class="pawsitive-btn"
          >
            {{ loading ? 'Processing...' : `Donate $${amount}` }}
          </button>

          <div v-if="showPayment && clientSecret" class="payment-section">
            <div class="payment-divider">
              <h3 class="payment-title">Complete Your Donation</h3>
              <StripePayment :client-secret="clientSecret" />
            </div>
          </div>

          <div class="trust-section">
            <div class="trust-indicators">
              <div class="trust-item">
                <svg class="trust-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure Payment</span>
              </div>
              <div class="trust-item">
                <svg class="trust-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Tax Deductible</span>
              </div>
              <div class="trust-item">
                <svg class="trust-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>100% Goes to Cats</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      </div>
    <BottomFooter />
</template>

<style scoped>
.donation-page {
  min-height: 100vh;

}

.donation-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1rem;
}

.hero-section {
  text-align: center;
  margin-bottom: 4rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #806e83;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.hero-description {
  font-size: 1.25rem;
  color: #806e83;
  max-width: 42rem;
  margin: 0 auto;
  line-height: 1.6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark-blue);
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-card {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    gap: 0.5rem;
    padding: 1rem;
    text-align: left;
  }

  .stat-value {
    font-size: 1.5rem;
    margin: 0;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #444;
  }
}

.form-wrapper {
  max-width: 48rem;
  margin: 0 auto;
}

.donation-card {
  background: #ffffff;
  border-radius: 1.5rem;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.card-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  color: #1a1a1a;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.preset-button {
  position: relative;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 2px solid #e0e0e0;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-button:hover {
  border-color: var(--dark-blue);
  transform: scale(1.02);
}

.preset-button.preset-selected {
  border-color: var(--dark-blue);
  background: rgba(122, 92, 251, 0.1);
  transform: scale(1.05);
}

.preset-amount {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.preset-impact {
  font-size: 0.875rem;
  color: #666;
  line-height: 1.3;
}

.preset-checkmark {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 1.5rem;
  height: 1.5rem;
  background: var(--dark-blue);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkmark-icon {
  width: 1rem;
  height: 1rem;
  color: #ffffff;
}

.custom-amount-section {
  margin-bottom: 2rem;
}

.custom-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: #1a1a1a;
}

.custom-input-wrapper {
  position: relative;
}

.dollar-sign {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  color: #666;
}

.custom-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  font-size: 1.25rem;
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  border-radius: 1rem;
  transition: all 0.2s ease;
}

.custom-input:focus {
  outline: none;
  border-color: var(--dark-blue);
  background: #ffffff;
}

.impact-message {
  background: linear-gradient(135deg, #fef3c7 0%, #fecaca 100%);
  border: 2px solid rgba(252, 211, 77, 0.5);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.impact-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.impact-icon {
  width: 3rem;
  height: 3rem;
  background: var(--dark-blue);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.heart-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #ffffff;
}

.impact-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #7c2d12;
}

.impact-text {
  color: #7c2d12;
  line-height: 1.5;
  font-size: 0.9375rem;
}

.payment-section {
  margin-top: 2rem;
}

.payment-divider {
  border-top: 2px solid #e0e0e0;
  padding-top: 2rem;
}

.payment-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #1a1a1a;
}

.trust-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e0e0e0;
}

.trust-indicators {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.trust-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--dark-blue);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .donation-card {
    padding: 2rem 1.5rem;
  }

  .preset-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
