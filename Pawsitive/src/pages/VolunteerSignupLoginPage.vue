<script setup>
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import { auth } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { validateRegistration, validateLogin } from '@/utils/validators';

const router = useRouter();

//state to indicate login form or registration form
const isLogin = ref(true);

//general errror msg
const errorMessage = ref('');

const loginForm = reactive({
  email: '',
  password: ''
});

const registerForm = reactive({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  contactNumber: ''
});

//field validation errors
const loginFieldErrors = ref({});
const registerFieldErrors = ref({});

//clear validatin fields when field being typed on
watch(() => loginForm.email, () => loginFieldErrors.value.email = '');
watch(() => loginForm.password, () => loginFieldErrors.value.password = '');

watch(() => registerForm.firstName, () => registerFieldErrors.value.firstName = '');
watch(() => registerForm.lastName, () => registerFieldErrors.value.lastName = '');
watch(() => registerForm.username, () => registerFieldErrors.value.username = '');
watch(() => registerForm.email, () => registerFieldErrors.value.email = '');
watch(() => registerForm.password, () => registerFieldErrors.value.password = '');
watch(() => registerForm.confirmPassword, () => registerFieldErrors.value.confirmPassword = '');
watch(() => registerForm.contactNumber, () => registerFieldErrors.value.contactNumber = '');



// Toggle login/register form
const toggleForm = () => {
  errorMessage.value = '';
  loginFieldErrors.value = {}; // reset errors
  registerFieldErrors.value = {}
  isLogin.value = !isLogin.value;

}

// Login handler
const handleLogin = async () => {

  loginFieldErrors.value = {}; // reset errors
  errorMessage.value = ''

  const errors = validateLogin(loginForm);
  if (Object.keys(errors).length > 0) {
    loginFieldErrors.value = errors; // set errors to show in template
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password)
    router.push("/volunteer/profile")
  } catch (error) {
    errorMessage.value = error.message
  }
}

// Register handler
const handleRegister = async () => {
  registerFieldErrors.value = {}; // reset errors
  errorMessage.value = '';
  const errors = validateRegistration(registerForm);
  if (Object.keys(errors).length > 0) {
    registerFieldErrors.value = errors; // set errors to show in template
    return;
  }

  //destructure the fields in the form object
  const { username, email, password, firstName, lastName, contactNumber } = registerForm;

  try {
    // Check username availability
    const usernameRef = doc(db, "usernames", username);
    const usernameSnap = await getDoc(usernameRef);
    if (usernameSnap.exists()) {
      errorMessage.value = "That username is already taken, please choose another"
      return;
    }

    // Reserve username
    await setDoc(usernameRef, { reserved: true });

    // Create Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Link username → UID
    await setDoc(usernameRef, { uid: user.uid });

    // Save volunteer record in Firestore
    await setDoc(doc(db, "volunteers", user.uid), {
      uid: user.uid,
      username,
      firstName,
      lastName,
      email,
      contactNumber,
      bio: "",
      role: "user",
      createdAt: serverTimestamp(),
    });

    router.push("/volunteer/profile");

  } catch (error) {
    errorMessage.value = error.message;

    // Clean up username doc if registration fails
    if (registerForm.username) {
      await deleteDoc(doc(db, "usernames", registerForm.username));
    }
  }
}
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <Navbar>
      <template v-slot:navbar-title>
        Signup / Login
      </template>
    </Navbar>

    <main class="flex-grow-1 d-flex justify-content-center align-items-center py-4">
      <div class="card shadow" style="max-width: 900px; width: 90%;">
        <div class="row g-0">

          <!-- Left Section -->
          <div
            class="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center bg-secondary text-white p-4 rounded-start">
            <h1>Welcome!</h1>
            <p class="lead text-center">Join our volunteer community and make a difference.</p>
            <img src="../assets/pawsitive-logo.png" alt="Graphic" class="img-fluid rounded mt-3">
          </div>

          <!-- Right Section -->
          <div class="col-12 col-md-6 d-flex justify-content-center align-items-center p-4">
            <div class="w-100" style="max-width: 25rem;">
              <h3 class="text-center mb-4">{{ isLogin ? 'Volunteer Login' : 'Volunteer Registration' }}</h3>

              <transition name="slide-fade" mode="out-in">
                <!-- Login Form -->
                <form v-if="isLogin" key="login" @submit.prevent="handleLogin">
                  <div class="mb-3">

                    <input v-model="loginForm.email" type="email" class="form-control"
                      :class="{ 'is-invalid': loginFieldErrors.email }" placeholder="Enter email" />
                    <div class="invalid-feedback">
                      {{ loginFieldErrors.email }}
                    </div>

                    <!-- <input v-model="loginForm.email" type="email" class="form-control" placeholder="Enter email"> -->
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input v-model="loginForm.password" type="password" class="form-control"
                      :class="{ 'is-invalid': loginFieldErrors.password }" placeholder="Enter password" />
                    <div class="invalid-feedback">
                      {{ loginFieldErrors.password }}
                    </div>
                  </div>

                  <div v-if="errorMessage" class="alert alert-danger" style="white-space: pre-line;">{{ errorMessage }}
                  </div>
                  <button type="submit" class="btn w-100" style="background-color: #7a5cfb; color: #fff;">Login</button>

                  <p class="text-center mt-3">
                    Not a volunteer?
                    <a href="javascript:void(0)" class="text-primary" @click.prevent="toggleForm">Register here</a>
                  </p>
                </form>

                <!-- Register Form -->
                <form v-else key="register" @submit.prevent="handleRegister">
                  <div class="row mb-3">
                    <div class="col-12 col-md-6 mb-2 mb-md-0">
                      <label class="form-label">First Name</label>
                      <input v-model="registerForm.firstName" type="text" class="form-control"
                        :class="{ 'is-invalid': registerFieldErrors.firstName }" placeholder="First Name" />
                      <div class="invalid-feedback">{{ registerFieldErrors.firstName }}</div>
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Last Name</label>
                      <input v-model="registerForm.lastName" type="text" class="form-control"
                        :class="{ 'is-invalid': registerFieldErrors.lastName }" placeholder="Last Name" />
                      <div class="invalid-feedback">{{ registerFieldErrors.lastName }}</div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Username</label>
                    <input v-model="registerForm.username" type="text" class="form-control"
                      :class="{ 'is-invalid': registerFieldErrors.username }" placeholder="Enter username" />
                    <div class="invalid-feedback">{{ registerFieldErrors.username }}</div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Email address</label>
                    <input v-model="registerForm.email" type="email" class="form-control"
                      :class="{ 'is-invalid': registerFieldErrors.email }" placeholder="Enter email" />
                    <div class="invalid-feedback">{{ registerFieldErrors.email }}</div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Contact Number</label>
                    <input v-model="registerForm.contactNumber" type="tel" class="form-control"
                      :class="{ 'is-invalid': registerFieldErrors.contactNumber }" placeholder="Enter contact number" />
                    <div class="invalid-feedback">{{ registerFieldErrors.contactNumber }}</div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input v-model="registerForm.password" type="password" class="form-control"
                      :class="{ 'is-invalid': registerFieldErrors.password }" placeholder="Enter password" />
                    <div class="invalid-feedback">{{ registerFieldErrors.password }}</div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Confirm Password</label>
                    <input v-model="registerForm.confirmPassword" type="password" class="form-control"
                      :class="{ 'is-invalid': registerFieldErrors.confirmPassword }" placeholder="Confirm password" />
                    <div class="invalid-feedback">{{ registerFieldErrors.confirmPassword }}</div>
                  </div>

                  <div v-if="errorMessage" class="alert alert-danger" style="white-space: pre-line;">{{ errorMessage }}
                  </div>
                  <button type="submit" class="btn w-100"
                    style="background-color: #7a5cfb; color: #fff;">Register</button>

                  <p class="text-center mt-3">
                    Already a volunteer?
                    <a href="javascript:void(0)" class="text-primary" @click.prevent="toggleForm">Login here</a>
                  </p>
                </form>
              </transition>
            </div>
          </div>

        </div>
      </div>
    </main>

    <BottomFooter></BottomFooter>
  </div>
</template>

<style scoped>
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

button {
  background-color: #7a5cfb;
  color: white;
}
</style>
