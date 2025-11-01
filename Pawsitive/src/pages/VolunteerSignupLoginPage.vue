<template>
  <div class="main-container">
    <div class="login-container">
      <main class="flex-grow-1 d-flex justify-content-center align-items-center py-4 py-md-5">
        <!-- Card: Full width on mobile, max 900px on large screens -->
        <div class="card shadow card-entrance card-visible w-100 mx-3 mx-md-4 mx-lg-0" style="max-width: 900px;">
          <div class="row g-0">

            <!-- ========== GRAPHIC PANEL (Top on mobile, Left on lg) ========== -->
            <div class="col-12 col-lg-6 order-lg-1 bg-secondary text-white d-flex flex-column justify-content-center align-items-center p-4 p-lg-5 rounded-top rounded-lg-start">
              <h1 class="display-5 fw-bold mb-3">Welcome!</h1>
              <p class="lead text-center mb-4">Join our volunteer community and make a difference.</p>
              <img src="/src/assets/pawsitive_gif_bgnone.gif"
                   alt="Pawsitive"
                   class="img-fluid rounded gif-img">
            </div>

            <!-- ========== FORM PANEL ========== -->
            <div class="col-12 col-lg-6 order-lg-2 bg-white d-flex justify-content-center align-items-center p-4 p-lg-5 rounded-bottom rounded-lg-end">
              <div class="w-100" style="max-width: 420px;">
                <h3 class="text-center mb-4 fw-semibold">
                  {{ isLogin ? 'Volunteer Login' : 'Volunteer Registration' }}
                </h3>

                <transition name="slide-fade" mode="out-in">
                  <!-- ========= LOGIN ========= -->
                  <form v-if="isLogin" key="login" @submit.prevent="handleLogin" class="mobile-form-padding">
                    <div class="mb-3">
                      <label class="form-label">Email</label>
                      <input v-model="loginForm.email" type="email" class="form-control"
                             :class="{ 'is-invalid': loginFieldErrors.email }"
                             placeholder="Enter email">
                      <div class="invalid-feedback">{{ loginFieldErrors.email }}</div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Password</label>
                      <input v-model="loginForm.password" type="password" class="form-control"
                             :class="{ 'is-invalid': loginFieldErrors.password }"
                             placeholder="Enter password">
                      <div class="invalid-feedback">{{ loginFieldErrors.password }}</div>
                    </div>

                    <div v-if="errorMessage" class="alert alert-danger small" style="white-space: pre-line;">
                      {{ errorMessage }}
                    </div>

                    <button type="submit" class="btn btn-primary w-100 rounded-pill py-2 fw-medium mt-2">
                      Login
                    </button>

                    <p class="text-center mt-3 small text-muted">
                      Not a volunteer?
                      <a href="#" @click.prevent="toggleForm" class="text-primary text-decoration-none fw-medium">Register</a>
                    </p>
                  </form>

                  <!-- ========= REGISTER ========= -->
                  <form v-else key="register" @submit.prevent="handleRegister" class="mobile-form-padding">
                    <p class="text-muted small mb-3">* All fields are required</p>

                    <div class="row mb-3">
                      <div class="col-12 col-md-6 mb-3 mb-md-0">
                        <label class="form-label">First Name</label>
                        <input v-model="registerForm.firstName" type="text" class="form-control"
                               :class="{ 'is-invalid': registerFieldErrors.firstName }"
                               placeholder="John">
                        <div class="invalid-feedback">{{ registerFieldErrors.firstName }}</div>
                      </div>
                      <div class="col-12 col-md-6">
                        <label class="form-label">Last Name</label>
                        <input v-model="registerForm.lastName" type="text" class="form-control"
                               :class="{ 'is-invalid': registerFieldErrors.lastName }"
                               placeholder="Doe">
                        <div class="invalid-feedback">{{ registerFieldErrors.lastName }}</div>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Username</label>
                      <input v-model="registerForm.username" type="text" class="form-control"
                             :class="{ 'is-invalid': registerFieldErrors.username }"
                             placeholder="johndoe123">
                      <div class="invalid-feedback">{{ registerFieldErrors.username }}</div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Email address</label>
                      <input v-model="registerForm.email" type="email" class="form-control"
                             :class="{ 'is-invalid': registerFieldErrors.email }"
                             placeholder="john@example.com">
                      <div class="invalid-feedback">{{ registerFieldErrors.email }}</div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Contact Number</label>
                      <input v-model="registerForm.contactNumber" type="tel" class="form-control"
                             :class="{ 'is-invalid': registerFieldErrors.contactNumber }"
                             placeholder="+65 9123 4567">
                      <div class="invalid-feedback">{{ registerFieldErrors.contactNumber }}</div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Password</label>
                      <input v-model="registerForm.password" type="password" class="form-control"
                             :class="{ 'is-invalid': registerFieldErrors.password }"
                             placeholder="Enter password">
                      <div class="invalid-feedback">{{ registerFieldErrors.password }}</div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Confirm Password</label>
                      <input v-model="registerForm.confirmPassword" type="password" class="form-control"
                             :class="{ 'is-invalid': registerFieldErrors.confirmPassword }"
                             placeholder="Confirm password">
                      <div class="invalid-feedback">{{ registerFieldErrors.confirmPassword }}</div>
                    </div>

                    <div class="form-check mb-3">
                      <input class="form-check-input" type="checkbox" v-model="registerForm.acceptTerms" id="termsConsent">
                      <label class="form-check-label small" for="termsConsent">
                        I agree to Terms and Conditions
                      </label>
                      <div v-if="registerFieldErrors.acceptTerms" class="invalid-feedback d-block small">
                        {{ registerFieldErrors.acceptTerms }}
                      </div>
                    </div>

                    <div v-if="errorMessage" class="alert alert-danger small" style="white-space: pre-line;">
                      {{ errorMessage }}
                    </div>

                    <button type="submit" class="btn btn-primary w-100 rounded-pill py-2 fw-medium mt-2">
                      Register
                    </button>

                    <p class="text-center mt-3 small text-muted">
                      Already a volunteer?
                      <a href="#" @click.prevent="toggleForm" class="text-primary text-decoration-none fw-medium">Log In</a>
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

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '@/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth'
import {
  doc, setDoc, serverTimestamp, getDoc, deleteDoc
} from 'firebase/firestore'
import { validateRegistration, validateLogin } from '@/utils/validators'

const router = useRouter()

const isLogin = ref(true)
const errorMessage = ref('')

const loginForm = reactive({ email: '', password: '' })
const registerForm = reactive({
  firstName: '', lastName: '', username: '', email: '',
  password: '', confirmPassword: '', contactNumber: '', acceptTerms: false
})

const loginFieldErrors = reactive({})
const registerFieldErrors = reactive({})

// Clear errors on input
watch(() => loginForm.email, () => loginFieldErrors.email = '')
watch(() => loginForm.password, () => loginFieldErrors.password = '')

watch(() => registerForm.firstName, () => registerFieldErrors.firstName = '')
watch(() => registerForm.lastName, () => registerFieldErrors.lastName = '')
watch(() => registerForm.username, () => registerFieldErrors.username = '')
watch(() => registerForm.email, () => registerFieldErrors.email = '')
watch(() => registerForm.contactNumber, () => registerFieldErrors.contactNumber = '')
watch(() => registerForm.password, () => registerFieldErrors.password = '')
watch(() => registerForm.confirmPassword, () => registerFieldErrors.confirmPassword = '')
watch(() => registerForm.acceptTerms, () => registerFieldErrors.acceptTerms = '')

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
  if (Object.keys(errors).length) {
    Object.assign(loginFieldErrors, errors)
    return
  }
  try {
    await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password)
    router.push('/map')
  } catch (e) {
    errorMessage.value = e.message
  }
}

const handleRegister = async () => {
  Object.keys(registerFieldErrors).forEach(k => registerFieldErrors[k] = '')
  errorMessage.value = ''
  const errors = validateRegistration(registerForm)
  if (Object.keys(errors).length) {
    Object.assign(registerFieldErrors, errors)
    return
  }
  if (!registerForm.acceptTerms) {
    registerFieldErrors.acceptTerms = 'You must accept the Terms and Conditions.'
    return
  }

  const { username, email, password, firstName, lastName, contactNumber } = registerForm
  try {
    const usernameRef = doc(db, 'usernames', username)
    if ((await getDoc(usernameRef)).exists()) {
      errorMessage.value = 'Username taken'
      return
    }
    await setDoc(usernameRef, { reserved: true })
    const user = (await createUserWithEmailAndPassword(auth, email, password)).user
    await setDoc(usernameRef, { uid: user.uid })
    await setDoc(doc(db, 'volunteers', user.uid), {
      uid: user.uid, username, firstName, lastName, email, contactNumber,
      bio: '', role: 'user', createdAt: serverTimestamp(), region: ''
    })
    router.push('/volunteer/profile')
  } catch (e) {
    errorMessage.value = e.message
    if (registerForm.username) await deleteDoc(doc(db, 'usernames', registerForm.username))
  }
}
</script>

<style scoped>
/* Background Animation */
.main-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(120deg, #4fa6ff, #7ecbff, #a0e1ff, #c0f0ff);
  background-size: 300% 300%;
  animation: bgShift 18s ease-in-out infinite;
}
@keyframes bgShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Card Entrance */
.card-entrance {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Form Transition */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all .4s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateX(30px); }
.slide-fade-leave-to   { opacity: 0; transform: translateX(-30px); }

/* Button */
.btn-primary {
  background-color: #7a5cfb;
  border: none;
  font-weight: 500;
}
.btn-primary:hover { background-color: #6a4ce0; }

/* GIF Size */
.gif-img {
  max-height: 180px;
  width: auto;
  object-fit: contain;
}
@media (min-width: 992px) {
  .gif-img { max-height: 200px; }
}

/* Mobile Form Padding (extra breathing room) */
.mobile-form-padding {
  padding: 0 0.5rem;
}
@media (max-width: 576px) {
  .mobile-form-padding {
    padding: 0 1rem;
  }
}

/* Optional: Hide graphic on very small phones */
@media (max-width: 480px) {
  .order-lg-1 { display: none; }
}
</style>