<template>
    <PawCanvas />
    <div class="landing-page">
        <!-- Header -->
        <header class="nav-wrap">
            <div class="wrap nav">
                <div class="brand" aria-label="Pawsitive brand">
                    <div class="logo" aria-hidden="true">🐾</div>
                    <span>Pawsitive</span>
                </div>
                <router-link to="/login">
                    <button class="btn ghost">Login</button>
                </router-link>

            </div>
        </header>

        <!-- Hero Section -->
        <section class="hero wrap">
            <div class="hero-grid">
                <div class="hero-text-block">
                    <h1 class="typed">{{ typedText }}</h1>

                    <div class="cta-row">
                        <router-link :to="{ path: '/login', query: { form: 'register' } }">
                            <button class="btn primary">Register
                                Now!</button>
                        </router-link>
                    </div>
                </div>


                <div class="mascot bounce">
                    <img src="/src/assets/pawsitive_gif_bgnone.gif" alt="Pawsitive mascot GIF" />
                </div>
            </div>
        </section>

        <!-- Feature Section -->
        <section id="features" class="features wrap">
            <h2 class="reveal mb-5">Why Use Pawsitive</h2>
            <div class="grid">
                <article class="feature reveal">
                    <h3>Quick Reporting</h3>
                    <p>Found a lost or injured cat? Submit a report in seconds and alert your community immediately.</p>
                </article>
                <article class="feature reveal">
                    <h3>Community Updates</h3>
                    <p>Stay informed about cats in your area. Receive notifications and updates from fellow cat lovers.
                    </p>
                </article>
                <article class="feature reveal">
                    <h3>Trusted Guidance</h3>
                    <p>Access tips on helping injured cats safely, from first aid to local shelter contacts.</p>
                </article>
            </div>

        </section>

        <!-- How it works & Newsletter -->
        <!-- <section id="how" class="wrap split">
            <div class="panel reveal">
                <ol>
                    <li><strong>Create a profile</strong> for you and your pet.</li>
                    <li><strong>Set tiny goals</strong> like 10 min play or a new trick.</li>
                    <li><strong>Log moments</strong> and share highlights with the community.</li>
                </ol>
            </div>
            <div class="panel reveal">
                <form @submit.prevent="handleNewsletter">
                    <h3>Join the early list</h3>
                    <p>Get monthly tips and goodies. No spam.</p>
                    <input class="input" type="email" v-model="email" placeholder="you@example.com" required />
                    <button class="btn primary" type="submit">Count me in</button>
                    <p style="margin-top:10px; font-weight:700">{{ signed }}</p>
                </form>
            </div>
        </section> -->


        <!-- Footer -->
        <footer class="wrap">
            Made with 🐾 and good energy. © {{ currentYear }} Pawsitive
        </footer>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PawCanvas from '@/components/resuables/PawCanvas.vue';

const messages = [
    "Found An Injured Cat And You Don't Know What To Do?",
    "Lost Cat And You Too Are Lost?",
    "Want To Inform The Community About It? Spread The Word For Quick Resolution"
];


const typedText = ref('')
let currentMessageIndex = 0
let charIndex = 0
let typingSpeed = 50 // ms per character
let pauseTime = 2000 // wait before switching to next message

function typeMessage() {
    const currentMessage = messages[currentMessageIndex]
    if (charIndex < currentMessage.length) {
        typedText.value += currentMessage[charIndex]
        charIndex++
        setTimeout(typeMessage, typingSpeed)
    } else {
        // Wait before deleting / switching
        setTimeout(() => {
            deleteMessage()
        }, pauseTime)
    }
}

function deleteMessage() {
    if (charIndex > 0) {
        typedText.value = typedText.value.slice(0, -1)
        charIndex--
        setTimeout(deleteMessage, typingSpeed / 2)
    } else {
        currentMessageIndex = (currentMessageIndex + 1) % messages.length
        setTimeout(typeMessage, typingSpeed)
    }
}

onMounted(() => {
    typeMessage()
})

const email = ref('')
const signed = ref('')
const counter = ref(0)
const currentYear = new Date().getFullYear()

const scrollTo = (selector) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' })
}

const handleNewsletter = () => {
    signed.value = 'Thanks for joining the pack! 🐶'
    email.value = ''
    setTimeout(() => signed.value = '', 4000)
}

// Animated counter + scroll reveal
onMounted(() => {
    const target = 12874
    const duration = 1400
    const start = performance.now()
    const step = (t) => {
        const p = Math.min(1, (t - start) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        counter.value = Math.floor(eased * target)
        if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)

    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('show')
                io.unobserve(e.target)
            }
        })
    }, { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))
})
</script>

<style scoped>
body,
.landing-page {
    margin: 0;
    font-family: system-ui, sans-serif;
    background: linear-gradient(120deg,
            /* Light pink */
            #f8d7ea,
            /* Warm rose */
            #f9bec7,
            /* Subtle coral pink */
            #f8a5c2,
            /* Gentle mid-pink */
            #fdf2f8
            /* Loop back */
        );
    background-size: 400% 400%;
    animation: bgShift 14s ease-in-out infinite;
    color: #2d1b2b;
    min-height: 100vh;
    padding-left: 16px;
    padding-right: 16px;
    box-sizing: border-box;

}

@keyframes bgShift {
    0% {
        background-position: 0% 50%;
    }

    25% {
        background-position: 100% 50%;
    }

    50% {
        background-position: 100% 100%;
    }

    75% {
        background-position: 0% 100%;
    }

    100% {
        background-position: 0% 50%;
    }
}

a,
router-link {
    background-color: transparent !important;
    color: black;
}




.wrap {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Navbar */
.nav-wrap {
    position: sticky;
    top: 0;
    z-index: 20;
    backdrop-filter: blur(6px);
}

.nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    flex-wrap: wrap;
    gap: 12px;
}

.brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 800;
    font-size: 20px;
    flex-shrink: 0;
}

.logo {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
}

.links {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
}

.links a {
    font-weight: 600;
    color: #111111;
    text-decoration: none;
    opacity: 0.9;
}

.btn.ghost {
    flex-shrink: 0;
}

/* Hero */
.hero {
    padding: 72px 0 96px;
}





.hero-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 32px;
    align-items: center;
}

.kicker {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.22em;
    color: #0b2530;
    opacity: 0.85;
}

h1 {
    font-size: clamp(36px, 5vw, 64px);
    line-height: 1.05;
    margin: 12px 0 10px;
    letter-spacing: 0.2px;
}

.lead {
    font-size: clamp(16px, 2.2vw, 20px);
    color: #0b2530;
    opacity: 0.92;
    margin: 0 0 18px;
}

.cta-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

/* Cards / mascot */
.card {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
    padding: 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 16px;
}




.mascot {
    aspect-ratio: 1/1;
    width: min(420px, 80%);
    margin: 0 auto;
}

.bounce {
    animation: bounce 2.6s ease-in-out infinite;
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-8px);
    }
}

/* Features */
.features {
    padding: 12px 0 56px;
}

.grid {
    display: grid;
    gap: 18px;
    grid-template-columns: repeat(3, 1fr);
}

.feature {
    background: #ffffff;
    border-radius: 16px;
    padding: 18px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.tag {
    display: inline-block;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 999px;
    background: #eef6ff;
}

/* Split panels */
.split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
    padding: 56px 0;
}

.panel {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
    padding: 22px;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.input {
    padding: 12px 14px;
    border-radius: 999px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    width: 100%;
    font: inherit;
    margin-bottom: 12px;
}

/* Buttons */
.btn {
    cursor: pointer;
    border: none;
    font-weight: 700;
    padding: 12px 18px;
    border-radius: 999px;
    transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
}

.btn.primary {
  background: #ff80ab;               /* Vibrant pink that pops on the soft bg */
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(255, 128, 171, 0.35);
  transition: all 0.2s ease;
}

.btn.primary:hover {
  background: #ff6b9d;               /* Slightly deeper on hover */
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 128, 171, 0.45);
}

/* Scroll reveal */
.reveal {
    opacity: 0;
    transform: translateY(18px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal.show {
    opacity: 1;
    transform: translateY(0);
}

/* Footer */
footer {
    padding: 40px 0 80px;
    text-align: center;
    color: #0b2530;
    opacity: 0.8;
}

/* Responsive */
@media(max-width:980px) {
    .hero-grid {
        grid-template-columns: 1fr;
        text-align: center;
    }

    .split {
        grid-template-columns: 1fr;
    }

    .grid {
        grid-template-columns: 1fr 1fr;
    }

    .links {
        display: none;
    }
}

@media(max-width:620px) {
    .grid {
        grid-template-columns: 1fr;
    }
}

/* Reserve vertical space for typed text so CTA doesn't move */
.hero-text-block {
    min-height: 200px;
    /* start here; increase if necessary for your longest lines */
    display: flex;
    flex-direction: column;
    gap: 18px;
    justify-content: center;
    /* keeps heading vertically centered inside the reserved area */
    align-items: flex-start;
    /* keep left alignment on wide screens */
    width: 100%;
}

/* The typed heading inside the reserved box */
h1.typed {
    margin: 0;
    font-size: clamp(36px, 5vw, 64px);
    line-height: 1.05;
    display: block;
    word-break: break-word;
    /* allow wrapping cleanly */
    hyphens: auto;
    /* give enough internal height to absorb a line wrap without moving CTA */
    min-height: calc(2.2em + 4px);
}

/* Pin the CTA to the bottom of the reserved block so it doesn't shift */
.hero-text-block .cta-row {
    margin-top: auto;
}

/* Responsive adjustments */
@media (max-width: 980px) {
    .hero-text-block {
        min-height: 160px;
        align-items: center;
        /* center on stacked layout */
        text-align: center;
    }

    .hero-text-block .cta-row {
        justify-content: center;
    }
}

@media (max-width: 620px) {
    .hero-text-block {
        min-height: 140px;
    }
}
</style>
