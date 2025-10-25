<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from "@/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp, getDoc, deleteDoc } from "firebase/firestore"
import { validateRegistration, validateLogin } from '@/utils/validators'

const router = useRouter()

// UI State
const showLogin = ref(false)
const isFadingOut = ref(false)
const isCardVisible = ref(false)
const isLogin = ref(true)
const errorMessage = ref('')
const currentTextIndex = ref(0)

// Landing Page
const accessButton = ref(null)
const texts = ["\u00A0", "Meow", "OW", "MEOWWWWWW", "OW OW OW", "STOP POKING ME", "Bleh :P"]
const tips = [
    "Cats sleep 12–16 hours a day on average.",
    "A flicking tail often means irritation — give space.",
    "Trim claws every few weeks to prevent overgrowth.",
    "Cats can rotate their ears 180 degrees.",
    "Keep your cat indoors or in a secured outdoor area for safety.",
    "Overfeeding leads to obesity — measure meals carefully.",
    "Cats knead to show contentment or mark scent.",
    "Cats love high places — add shelves or cat trees.",
    "Avoid giving cats milk — most are lactose intolerant.",
    "A cat's purr can have calming effects on humans.",
    "Always keep poisonous plants away.",
    "Regular vet checkups can prevent serious health issues.",
    "Play with your cat at least 10–15 minutes daily.",
    "Cats walk by moving both right feet, then both left — like camels.",
    "Provide a quiet, safe space for them to retreat.",
    "Respect their personal space; don't force cuddles.",
    "Each cat's nose print is unique — like a human fingerprint.",
    "Watch for subtle signs of illness: grooming, hiding, appetite.",
    "Domestic cats share 95.6% of their DNA with tigers.",
    "Spaying/neutering prevents unwanted litters and certain diseases."
]

const leftTipDisplay = ref('')
const rightTipDisplay = ref('')
const leftTipIndex = ref(0)
const rightTipIndex = ref(5)
let leftTipInterval = null
let rightTipInterval = null

// Forms
const loginForm = reactive({ email: '', password: '' })
const registerForm = reactive({ firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '', contactNumber: '' })
const loginFieldErrors = reactive({})
const registerFieldErrors = reactive({})

watch(() => loginForm.email, () => loginFieldErrors.email = '');
watch(() => loginForm.password, () => loginFieldErrors.password = '');

watch(() => registerForm.firstName, () => registerFieldErrors.firstName = '');
watch(() => registerForm.lastName, () => registerFieldErrors.lastName = '');
watch(() => registerForm.username, () => registerFieldErrors.username = '');
watch(() => registerForm.email, () => registerFieldErrors.email = '');
watch(() => registerForm.password, () => registerFieldErrors.password = '');
watch(() => registerForm.confirmPassword, () => registerFieldErrors.confirmPassword = '');
watch(() => registerForm.contactNumber, () => registerFieldErrors.contactNumber = '');

onMounted(() => {
    setTimeout(() => accessButton.value?.classList.replace('access-button-hidden', 'access-button-visible'), 1000)
    startTipAnimation('left')
    startTipAnimation('right')
})
onUnmounted(() => { clearInterval(leftTipInterval); clearInterval(rightTipInterval) })

function startTipAnimation(side) {
    const isLeft = side === 'left'
    const tipIndex = isLeft ? leftTipIndex : rightTipIndex
    const tipDisplay = isLeft ? leftTipDisplay : rightTipDisplay

    tipDisplay.value = ''
    let charIndex = 0
    const charInterval = setInterval(() => {
        if (charIndex < tips[tipIndex.value].length) tipDisplay.value += tips[tipIndex.value][charIndex++]
        else {
            clearInterval(charInterval)
            setTimeout(() => {
                tipIndex.value = (tipIndex.value + 1) % tips.length
                startTipAnimation(side)
            }, Math.max(1000, tips[tipIndex.value].length * 70))
        }
    }, 40)

    if (isLeft) leftTipInterval = charInterval
    else rightTipInterval = charInterval
}

function nextText() {
    currentTextIndex.value = (currentTextIndex.value + 1) % texts.length
    const calloutEle = document.getElementById("callout")
    calloutEle.classList.remove("bubble-pulse")
    void calloutEle.offsetWidth
    calloutEle.classList.toggle("speech-bubble-visible", currentTextIndex.value !== 0)
    calloutEle.classList.toggle("speech-bubble-hidden", currentTextIndex.value === 0)
    if (currentTextIndex.value !== 0) calloutEle.classList.add("bubble-pulse")
}

function goToLogin() {
    isFadingOut.value = true
    setTimeout(() => { showLogin.value = true; setTimeout(() => isCardVisible.value = true, 100) }, 800)
}

const toggleForm = () => {
    errorMessage.value = ''
    Object.keys(loginFieldErrors).forEach(k => loginFieldErrors[k] = '')
    Object.keys(registerFieldErrors).forEach(k => registerFieldErrors[k] = '')
    isLogin.value = !isLogin.value
}

const handleLogin = async () => {
    Object.keys(loginFieldErrors).forEach(k => loginFieldErrors[k] = '')
    errorMessage.value = ''
    const errors = validateLogin(loginForm)
    if (Object.keys(errors).length) { Object.assign(loginFieldErrors, errors); return }
    try { await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password); router.push("/map") }
    catch (e) { errorMessage.value = e.message }
}

const handleRegister = async () => {
    Object.keys(registerFieldErrors).forEach(k => registerFieldErrors[k] = '')
    errorMessage.value = ''
    const errors = validateRegistration(registerForm)
    if (Object.keys(errors).length) { Object.assign(registerFieldErrors, errors); return }

    const { username, email, password, firstName, lastName, contactNumber } = registerForm
    try {
        const usernameRef = doc(db, "usernames", username)
        if ((await getDoc(usernameRef)).exists()) { errorMessage.value = "Username taken"; return }
        await setDoc(usernameRef, { reserved: true })
        const user = (await createUserWithEmailAndPassword(auth, email, password)).user
        await setDoc(usernameRef, { uid: user.uid })
        await setDoc(doc(db, "volunteers", user.uid), { uid: user.uid, username, firstName, lastName, email, contactNumber, bio: "", role: "user", createdAt: serverTimestamp() })
        router.push("/volunteer/profile")
    } catch (e) {
        errorMessage.value = e.message
        if (registerForm.username) await deleteDoc(doc(db, "usernames", registerForm.username))
    }
}
</script>


<template>
    <!-- Main container with dynamic background color transition -->
    <div class="main-container" :class="{ 'show-login-bg': showLogin }">
        <!-- Landing Page View -->
        <div v-if="!showLogin" class="landing-page" :class="{ 'fade-out': isFadingOut }">
            <div class="tip-column tip-left" :class="{ 'fade-out-element': isFadingOut }">
                <div class="tip-text">{{ leftTipDisplay }}</div>
            </div>

            <div class="center-content" :class="{ 'fade-out-element': isFadingOut }">
                <video src="/src/assets/pawsitive_gif_updated.mp4" autoplay muted loop playsinline
                    class="landing-video explode-bounce gif" @click="nextText"></video>

                <div id="callout" class="speech-bubble-box speech-bubble-hidden">
                    {{ texts[currentTextIndex] }}
                </div>

                <button ref="accessButton" @click="goToLogin" class="access-button access-button-hidden">
                    ENTER
                </button>
            </div>

            <div class="tip-column tip-right" :class="{ 'fade-out-element': isFadingOut }">
                <div class="tip-text">{{ rightTipDisplay }}</div>
            </div>
        </div>

        <!-- Login/Register View -->
        <div v-if="showLogin" class="login-container">
            <main class="flex-grow-1 d-flex justify-content-center align-items-center py-4">
                <div class="card shadow card-entrance" :class="{ 'card-visible': isCardVisible }"
                    style="max-width: 900px; width: 90%;">
                    <div class="row g-0">
                        <div
                            class="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center bg-secondary text-white p-4 rounded-start">
                            <h1>Welcome!</h1>
                            <p class="lead text-center">Join our volunteer community and make a difference.</p>
                            <img src="../assets/pawsitive-logo.png" alt="Graphic" class="img-fluid rounded mt-3">
                        </div>

                        <div class="col-12 col-md-6 d-flex justify-content-center align-items-center p-4">
                            <div class="w-100" style="max-width: 25rem;">
                                <h3 class="text-center mb-4">{{ isLogin ? 'Volunteer Login' : 'Volunteer Registration'
                                    }}</h3>

                                <transition name="slide-fade" mode="out-in">
                                    <form v-if="isLogin" key="login" @submit.prevent="handleLogin">
                                        <div class="mb-3">
                                            <label class="form-label">Email</label>
                                            <input v-model="loginForm.email" class="form-control"
                                                :class="{ 'is-invalid': loginFieldErrors.email }"
                                                placeholder="Enter email" />
                                            <div class="invalid-feedback">{{ loginFieldErrors.email }}</div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Password</label>
                                            <input v-model="loginForm.password" type="password" class="form-control"
                                                :class="{ 'is-invalid': loginFieldErrors.password }"
                                                placeholder="Enter password" />
                                            <div class="invalid-feedback">{{ loginFieldErrors.password }}</div>
                                        </div>

                                        <div v-if="errorMessage" class="alert alert-danger"
                                            style="white-space: pre-line;">{{ errorMessage }}</div>
                                        <button type="submit" class="btn w-100"
                                            style="background-color: #7a5cfb; color: #fff;">Login</button>

                                        <p class="text-center mt-3">
                                            Not a volunteer?
                                            <a href="javascript:void(0)" class="text-primary"
                                                @click.prevent="toggleForm">Register here</a>
                                        </p>
                                    </form>

                                    <form v-else key="register" @submit.prevent="handleRegister">
                                        <div class="row mb-3">
                                            <div class="col-12 col-md-6 mb-2 mb-md-0">
                                                <label class="form-label">First Name</label>
                                                <input v-model="registerForm.firstName" type="text" class="form-control"
                                                    :class="{ 'is-invalid': registerFieldErrors.firstName }"
                                                    placeholder="First Name" />
                                                <div class="invalid-feedback">{{ registerFieldErrors.firstName }}</div>
                                            </div>
                                            <div class="col-12 col-md-6">
                                                <label class="form-label">Last Name</label>
                                                <input v-model="registerForm.lastName" type="text" class="form-control"
                                                    :class="{ 'is-invalid': registerFieldErrors.lastName }"
                                                    placeholder="Last Name" />
                                                <div class="invalid-feedback">{{ registerFieldErrors.lastName }}</div>
                                            </div>
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label">Username</label>
                                            <input v-model="registerForm.username" type="text" class="form-control"
                                                :class="{ 'is-invalid': registerFieldErrors.username }"
                                                placeholder="Enter username" />
                                            <div class="invalid-feedback">{{ registerFieldErrors.username }}</div>
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label">Email address</label>
                                            <input v-model="registerForm.email" type="email" class="form-control"
                                                :class="{ 'is-invalid': registerFieldErrors.email }"
                                                placeholder="Enter email" />
                                            <div class="invalid-feedback">{{ registerFieldErrors.email }}</div>
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label">Contact Number</label>
                                            <input v-model="registerForm.contactNumber" type="tel" class="form-control"
                                                :class="{ 'is-invalid': registerFieldErrors.contactNumber }"
                                                placeholder="Enter contact number" />
                                            <div class="invalid-feedback">{{ registerFieldErrors.contactNumber }}</div>
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label">Password</label>
                                            <input v-model="registerForm.password" type="password" class="form-control"
                                                :class="{ 'is-invalid': registerFieldErrors.password }"
                                                placeholder="Enter password" />
                                            <div class="invalid-feedback">{{ registerFieldErrors.password }}</div>
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label">Confirm Password</label>
                                            <input v-model="registerForm.confirmPassword" type="password"
                                                class="form-control"
                                                :class="{ 'is-invalid': registerFieldErrors.confirmPassword }"
                                                placeholder="Confirm password" />
                                            <div class="invalid-feedback">{{ registerFieldErrors.confirmPassword }}
                                            </div>
                                        </div>

                                        <div v-if="errorMessage" class="alert alert-danger"
                                            style="white-space: pre-line;">{{ errorMessage }}</div>
                                        <button type="submit" class="btn w-100"
                                            style="background-color: #7a5cfb; color: #fff;">Register</button>

                                        <p class="text-center mt-3">
                                            Already a volunteer?
                                            <a href="javascript:void(0)" class="text-primary"
                                                @click.prevent="toggleForm">Login here</a>
                                        </p>
                                    </form>
                                </transition>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped>
/* Main container with smooth background transition */
.main-container {
    min-height: 100vh;
    background-color: var(--blue);
    transition: background 1s ease-in-out;
}

.main-container.show-login-bg {
    background: var(--dark-blue);
}

/* Landing page styles */
.landing-page {
    height: 100vh;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-template-rows: 1fr auto;
    grid-template-areas: "left content right" "content content content";
    gap: 20px;
    justify-items: center;
    align-items: center;
    padding: 20px;
    position: relative;
}

.center-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 2rem;
}

.gif {
    width: 400px;
    height: 400px;
    border-radius: 50%;
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

.tip-column {
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 300px;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.7);
    color: black;
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    min-width: 220px;
}

.tip-left {
    justify-self: center;
    padding-right: 1rem;
}

.tip-right {
    justify-self: center;
    padding-left: 1rem;
}

.tip-text {
    color: black;
    font-size: 18px;
    line-height: 1.5;
    text-align: center;
    padding: 10px;
}

@media (max-width: 1024px) {
    .tip-column {
        display: none;
    }
}

.speech-bubble-box {
    position: relative;
    padding: 1.25rem 2rem;
    border-radius: 1.5rem;
    background: linear-gradient(135deg, #fef3c7 0%, #fecaca 100%);
    border: 3px solid #ffffff;
    color: #7c2d12;
    font-size: 1.6rem;
    font-weight: 700;
    line-height: 1.3;
    display: inline-block;
    max-width: 80%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    text-align: center;
}

.speech-bubble-box::after {
    content: '';
    position: absolute;
    top: -23px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-bottom: 23px solid #ffffff;
}

.speech-bubble-hidden {
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.4s, visibility 0.4s;
}

.speech-bubble-visible {
    opacity: 1;
    visibility: visible;
    transition: opacity 0.4s, visibility 0.4s;
}

.bubble-pulse {
    animation: bubble-pulse 1.5s infinite;
}

@keyframes bubble-pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1);
    }
}

.access-button {
    margin-top: 3rem;
    padding: 1.25rem 3rem;
    font-size: 1.5rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    color: #ffffff;
    border-radius: 9999px;
    border: 3px solid #ffffff;
    cursor: pointer;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    background-color: var(--dark-blue);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    transition-property: opacity, transform;
    transition-duration: 0.8s;
}

.access-button:hover {
    transform: translateY(-4px) scale(1.05);
}

.access-button:active {
    transform: translateY(-2px) scale(1.02);
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

.fade-out-element {
    animation: fadeOut 0.8s ease-out forwards;
}

@keyframes fadeOut {
    0% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }

    100% {
        opacity: 0;
        transform: translateY(-30px) scale(0.95);
    }
}

/* Login container styles */
.login-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.4s ease;
}

.slide-fade-enter-from {
    opacity: 0;
    transform: translateX(30px);
}

.slide-fade-leave-to {
    opacity: 0;
    transform: translateX(-30px);
}

.card-entrance {
    opacity: 0;
    transform: translateY(100px) scale(0.9);
    transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-entrance.card-visible {
    opacity: 1;
    transform: translateY(0) scale(1);
}
</style>
