<script setup>
import NavBar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function handleBackHome() {
  router.push('/')
}
</script>

<template>
  <div class="success-page background">
    <NavBar />

    <div class="success-container">
      <!-- Hero Section -->
      <div class="success-hero">
        <div class="success-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="check-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 class="success-title">Thank You for Your Generosity!</h1>
        <p class="success-text">
          Your donation has been received successfully. Because of your kindness, more cats
          will receive the care, food, and shelter they need. You truly make a difference!
        </p>

        <div class="impact-box">
          <h2 class="impact-heading">Your Impact</h2>
          <p class="impact-description">
            100% of your donation goes directly toward cat rescue operations — providing
            medical care, food, shelter, and rehoming for cats in need.
          </p>
        </div>

        <button @click="handleBackHome" class="pawsitive-btn">
          Back to Home
        </button>
      </div>
    </div>
  </div>
  <BottomFooter />
</template>

<style scoped>
.success-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.success-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 4rem 1rem;
  text-align: center;
}

.success-icon {
  width: 5rem;
  height: 5rem;
  margin: 0 auto 2rem;
  background: #a7f3d0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 25px rgba(34, 197, 94, 0.3);
}

.check-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #059669;
}

.success-title {
  font-size: 2.75rem;
  font-weight: 700;
  color: #4b5563;
  margin-bottom: 1.25rem;
}

.success-text {
  font-size: 1.125rem;
  color: #6b7280;
  max-width: 38rem;
  margin: 0 auto 2rem;
  line-height: 1.6;
}

.impact-box {
  background: linear-gradient(135deg, #fef3c7 0%, #fecaca 100%);
  border: 2px solid rgba(252, 211, 77, 0.5);
  border-radius: 1rem;
  padding: 2rem;
  margin: 2rem auto;
  max-width: 36rem;
}

.impact-heading {
  font-size: 1.5rem;
  font-weight: 700;
  color: #7c2d12;
  margin-bottom: 0.75rem;
}

.impact-description {
  color: #7c2d12;
  line-height: 1.5;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .success-title {
    font-size: 2rem;
  }

  .impact-box {
    padding: 1.5rem;
  }
}
</style>
