<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const texts = [
  "Welcome to Pawsitive!",
  "We help all feline communities to live well and thrive!",
  "Are you ready to MEOW?",
]
const currentTextIndex = ref(0)
const showText = ref(true)
const buttonVisible = ref(false)

onMounted(() => {
  setTimeout(() => {
    buttonVisible.value = true
  }, 2500)
})

function nextText() {
  showText.value = false
  setTimeout(() => {
    currentTextIndex.value =
      (currentTextIndex.value + 1) % texts.length
    showText.value = true
  }, 300)
}

function goToPlaceholder() {
  router.push('/map')
}
</script>

<template>
    <div
        class="landing-page min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-300 via-pink-300 to-orange-200 p-6"
    >
        <video
            src="/src/assets/pawsitive_gif_updated.mp4"
            autoplay
            muted
            loop
            playsinline
            class="landing-video explode-bounce gif"
        ></video>

        <div
        v-if="showText"
        class="mt-8 text-center max-w-xl text-2xl font-semibold transition-opacity duration-300 cursor-pointer"
        @click="nextText"
        >
        {{ texts[currentTextIndex] }}
        </div>

        <button
        @click="goToMap"
        class="mt-12 bg-white text-purple-700 font-bold px-8 py-3 rounded-full shadow-lg transform transition-all duration-500"
        :class="buttonVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        >
        Welcome
        </button>
    </div>
</template>

<style scoped>
.landing-page {
    height: 100vh;
    width: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.gif {
    width: 400px;
    height: 400px;
    object-fit: contain;
    cursor: pointer;
}

@keyframes explodeBounce {
    0% {
        transform: scale(0.1);
    }
    30% {
        transform: scale(1.2);
    }
    50% {
        transform: scale(0.9);
    }
    65% {
        transform: scale(1.1);
    }
    80% {
        transform: scale(0.95);
    }
    100% {
        transform: scale(1);
    }
}

.explode-bounce {
    animation: explodeBounce 1.5s ease-out forwards; 
}
</style>
