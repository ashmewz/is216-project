<template>
    <div class="landing-page">
        <!-- Header -->
        <header class="nav-wrap">
            <div class="wrap nav">
                <div class="brand" aria-label="Pawsitive brand">
                    <div class="logo" aria-hidden="true">🐾</div>
                    <span>Pawsitive</span>
                </div>

                <button class="btn ghost" @click="scrollTo('#join')">Get started</button>
            </div>
        </header>

        <!-- Hero Section -->
        <section class="hero wrap">
            <div class="hero-grid">
                <div>
                    <p class="kicker">Pets • People • Joy</p>
                    <h1>Make every step Pawsitive</h1>
                    <p class="lead">A cheerful hub for pets and their humans - tips, tools, and a caring community that
                        helps tails wag and hearts feel light.</p>
                    <div class="cta-row">
                        <button class="btn primary" @click="alert('Welcome to Pawsitive! 🐾')">Try a happy demo</button>
                        <button class="btn ghost" @click="scrollTo('#features')">Explore features</button>
                    </div>

                </div>

                <div class="mascot bounce">
                    <img src="/src/assets/pawsitive_gif_bgnone.gif" alt="Pawsitive mascot GIF" />
                </div>
            </div>
        </section>

        <!-- Feature Section -->
        <section id="features" class="features wrap">
            <h2 class="reveal">Why Pawsitive</h2>
            <div class="grid">
                <article class="feature reveal">
                    <span class="tag">Community</span>
                    <h3>Friendly guidance</h3>
                    <p>Curated tips and stories from pet lovers like you. Learn, share, and celebrate every small win.
                    </p>
                </article>
                <article class="feature reveal">
                    <span class="tag">Wellness</span>
                    <h3>Happy routines</h3>
                    <p>Track walks, meals, and playtime. Build joyful habits with gentle reminders and simple charts.
                    </p>
                </article>
                <article class="feature reveal">
                    <span class="tag">Care</span>
                    <h3>Trusted resources</h3>
                    <p>Vet-approved checklists, first aid basics, and training pointers to keep paws safe and spirits
                        bright.</p>
                </article>
            </div>
        </section>

        <!-- How it works & Newsletter -->
        <section id="how" class="wrap split">
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
        </section>


        <!-- Footer -->
        <footer class="wrap">
            Made with 🐾 and good energy. © {{ currentYear }} Pawsitive
        </footer>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PuppyMascot from '@/components/PuppyMascot.vue'

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
    background: linear-gradient(120deg, #ffb86b, #ff6bcb, #8be9fd, #a4ff9f);
    background-size: 300% 300%;
    animation: bgShift 18s ease-in-out infinite;
    color: #1b1b1f;
}

@keyframes bgShift {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
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
    0%, 100% {
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
    background: #00c2ff;
    color: #00233a;
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

</style>
