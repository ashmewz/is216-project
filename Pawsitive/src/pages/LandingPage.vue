<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import '@/assets/base.css'

const router = useRouter()

const texts = [
  "ow",
  "OW",
  "OW OW OW",
  "STOP POKING ME",
  "MEOWWWWWW",
  "MEOWWWW MEOWWWWWWWWWW",
  "bleh :p"
]
const currentTextIndex = ref(0)
const showText = ref(false)
const buttonVisible = ref(false)

onMounted(() => {
  setTimeout(() => {
    buttonVisible.value = true
  }, 2500)
})

function nextText() {
    if (!showText.value) {
        showText.value = true
    }
    currentTextIndex.value = (currentTextIndex.value + 1) % texts.length
}


function goToMap() {
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
            style="border-radius: 50%;"
            @click="nextText"
        ></video>

        <div
        v-if="showText"
        class="mt-8 text-center transition-opacity"
        >
        {{ texts[currentTextIndex] }}
        </div>

        <button
        @click="goToMap"
        class="mt-6 bg-white transform transition-all duration-500"
        :class="buttonVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        >
        Access Page
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
    background-color: var(--blue);
    gap: 40px;
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
