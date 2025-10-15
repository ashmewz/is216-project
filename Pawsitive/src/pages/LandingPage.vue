<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import '@/assets/base.css'

const router = useRouter()

const texts = [
    "\u00A0", // Intentionally empty to be first one.
    "Meow",
    "OW",
    "MEOWWWWWW",
    "OW OW OW",
    "MEOWWWW MEOWWWWWWWWWW",
    "STOP POKING ME",
    "Bleh :P",
]
const currentTextIndex = ref(0)

onMounted(() => {
    setTimeout(() => {
        accessButton.classList.remove('access-button-hidden');
        accessButton.classList.add('access-button-visible');
    }, 350)
})

function nextText() {
    currentTextIndex.value = (currentTextIndex.value + 1) % texts.length
    const calloutEle = document.getElementById("callout");
    calloutEle.classList.remove("bubble-pulse");
    void calloutEle.offsetWidth; // NOTE: Forces repaint to restart animation from beginning.

    if (currentTextIndex.value == 0) {
        calloutEle.classList.remove("speech-bubble-visible");
        calloutEle.classList.add("speech-bubble-hidden");
    } else {
        calloutEle.classList.remove("speech-bubble-hidden");
        calloutEle.classList.add("speech-bubble-visible");
        calloutEle.classList.add("bubble-pulse");
    }
}


function goToMap() {
    router.push('/map')
}
</script>

<template>
    <div
        class="landing-page min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-300 via-pink-300 to-orange-200 p-6">
        <video src="/src/assets/pawsitive_gif_updated.mp4" autoplay muted loop playsinline
            class="landing-video explode-bounce gif" style="border-radius: 50%;" @click="nextText"></video>

        <div id="callout" class="speech-bubble-box speech-bubble-hidden">
            {{ texts[currentTextIndex] }}
        </div>

        <button @click="goToMap" id="accessButton" class="access-button access-button-hidden">
            ENTER
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

.access-button {
    margin-top: 3rem;
    padding: 1rem 2.5rem;
    font-size: 1.25rem;
    font-weight: 800;
    color: #FFFDF7;
    border-radius: 9999px;
    border: none;
    cursor: pointer;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

    /* background: linear-gradient(to right, #88ace5, #ffb7b7); */
    background: linear-gradient(45deg, rgb(255, 173, 173) 0%, #ff3a5e 50%, #ffc400 100%);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1);

    transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
    transition-property: opacity, transform;
    transition-duration: 0.8s;
    transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
}

.access-button:hover {
    transform: scale(1.1);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
}

.access-button:active {
    transform: scale(0.98);
}

.access-button-hidden {
    opacity: 0;
    transform: translateY(2rem);
    pointer-events: none;
}

.access-button-visible {
    opacity: 1;
    transform: translateY(0);
}

.speech-bubble-box {
    position: relative;
    margin-top: 3rem;
    text-align: center;
    transition: opacity 0.15s ease-out, transform 0.35s ease-in-out;

    background-color: #ffffff;
    color: #333333;
    padding: 1rem 2rem;
    border-radius: 1.5rem;
    font-size: 1.6rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1.3;

    display: inline-block;
    max-width: 80%;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
}

/* The speech bubble tail */
.speech-bubble-box::after {
    content: '';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-bottom: 20px solid #ffffff;
}

.speech-bubble-hidden {
    opacity: 0;
    transform: scale(0) translateY(-4rem);
}

.speech-bubble-visible {
    opacity: 1;
    transform: scale(1) translateY(-4rem);
}

@keyframes pulse {
    0% {
        transform: scale(0) translateY(-10rem);
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
    }

    50% {
        transform: scale(1.15) translateY(-5rem);
        box-shadow: 0 0 35px 5px rgba(255, 153, 0, 0.6);
    }

    100% {
        transform: scale(1) translateY(-2rem);
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
    }
}

.bubble-pulse {
    transition: none;
    animation: pulse 0.3s 1 ease-in;
}
</style>
