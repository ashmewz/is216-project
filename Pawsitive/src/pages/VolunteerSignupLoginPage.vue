<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

</script>

<script>

//TODO: have to change the vue format for this page to composition api instead of options api as it seems like everyone else is doing it that way

export default {
    name: "AuthForm",
    data() {
        return {
            isLogin: true,
            loginForm: {
                email: '',
                password: ''
            },
            registerForm: {
                firstName: '',
                lastName: '',
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                contactNumber: ''
            },

            errorMessage: '',

        };
    },
    methods: {
        async handleLogin() {
            this.errorMessage = ""; // reset previous errors
            try {
                //firebase login
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    this.loginForm.email,
                    this.loginForm.password
                );

                // if login success go to profile page
                this.$router.push("/volunteer/profile");

            } catch (error) {
                // any error write to errorMessage
                this.errorMessage = error.message;
            }
        },
        async handleRegister() {
            this.errorMessage = ""; // reset previous errors

            const username = this.registerForm.username.trim();
            const email = this.registerForm.email.trim();
            const password = this.registerForm.password;
            const confirmPassword = this.registerForm.confirmPassword;
            const firstName = this.registerForm.firstName.trim();
            const lastName = this.registerForm.lastName.trim();
            const contactNumber = this.registerForm.contactNumber.trim();

            try {
                // 1️⃣ Password match validation
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match.");
                }

                // 2️⃣ Basic contact number validation (digits only, 7-15 chars)
                const phoneRegex = /^[0-9]{7,15}$/;
                if (!phoneRegex.test(contactNumber)) {
                    throw new Error("Please enter a valid contact number (digits only).");
                }

                // 3️⃣ Check username availability
                const usernameRef = doc(db, "usernames", username);
                const usernameSnap = await getDoc(usernameRef);
                if (usernameSnap.exists()) {
                    throw new Error("That username is already taken. Please choose another.");
                }

                // 4️⃣ Reserve username
                await setDoc(usernameRef, { reserved: true });

                // 5️⃣ Create Auth user
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // 6️⃣ Link username → UID
                await setDoc(usernameRef, { uid: user.uid });

                // 7️⃣ Save volunteer record in Firestore
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

                // 8️⃣ Redirect on success
                this.$router.push("/volunteer/profile");

            } catch (error) {
                console.error(error);
                this.errorMessage = error.message;

                // Clean up username doc if registration fails
                if (username) {
                    await deleteDoc(doc(db, "usernames", username));
                }
            }
        }


        ,
        toggleForm() {
            this.errorMessage = ""; // reset previous errors
            this.isLogin = !this.isLogin;
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
            <div class="card shadow " style="max-width: 900px; width: 90%;">
                <div class="row g-0 ">

                    <!-- Left Section (Graphic / Text) -->
                    <div
                        class="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center bg-secondary text-white p-4 rounded-start">
                        <h1>Welcome!</h1>
                        <p class="lead text-center">Join our volunteer community and make a difference.</p>
                        <img src="../assets/pawsitive-logo.png" alt="Graphic" class="img-fluid rounded mt-3">
                    </div>

                    <!-- Right Section (Auth Form) -->
                    <div class="col-12 col-md-6 d-flex justify-content-center align-items-center p-4">
                        <div class="w-100" style="max-width: 25rem;">
                            <h3 class="text-center mb-4">{{ isLogin ? 'Volunteer Login' : 'Volunteer Registration' }}
                            </h3>

                            <!-- Login Form -->
                            <transition name="slide-fade" mode="out-in">
                                <form v-if="isLogin" key="login" @submit.prevent="handleLogin">
                                    <div class="mb-3">
                                        <label class="form-label">Email address</label>
                                        <input v-model="loginForm.email" type="email" class="form-control"
                                            placeholder="Enter email" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Password</label>
                                        <input v-model="loginForm.password" type="password" class="form-control"
                                            placeholder="Enter password" required>
                                    </div>

                                    <div v-if="errorMessage" class="alert alert-danger">
                                        {{ errorMessage }}
                                    </div>
                                    <button type="submit" class="btn w-100"
                                        style="background-color: #7a5cfb; color: #fff;">Login</button>

                                    <p class="text-center mt-3">
                                        Not a volunteer?
                                        <a href="javascript:void(0)" class="text-primary"
                                            @click.prevent="toggleForm">Register
                                            here</a>
                                    </p>
                                </form>

                                <form v-else key="register" @submit.prevent="handleRegister">
                                    <!-- First Name + Last Name inline on md+, stacked on mobile -->
                                    <div class="row mb-3">
                                        <div class="col-12 col-md-6 mb-2 mb-md-0">
                                            <label class="form-label">First Name</label>
                                            <input v-model="registerForm.firstName" type="text" class="form-control"
                                                placeholder="First Name" required>
                                        </div>
                                        <div class="col-12 col-md-6">
                                            <label class="form-label">Last Name</label>
                                            <input v-model="registerForm.lastName" type="text" class="form-control"
                                                placeholder="Last Name" required>
                                        </div>
                                    </div>

                                    <!-- Username -->
                                    <div class="mb-3">
                                        <label class="form-label">Username</label>
                                        <input v-model="registerForm.username" type="text" class="form-control"
                                            placeholder="Enter username" required>
                                    </div>

                                    <!-- Email -->
                                    <div class="mb-3">
                                        <label class="form-label">Email address</label>
                                        <input v-model="registerForm.email" type="email" class="form-control"
                                            placeholder="Enter email" required>
                                    </div>

                                    <!-- Contact Number -->
                                    <div class="mb-3">
                                        <label class="form-label">Contact Number</label>
                                        <input v-model="registerForm.contactNumber" type="tel" class="form-control"
                                            placeholder="Enter contact number" required>
                                    </div>

                                    <!-- Password -->
                                    <div class="mb-3">
                                        <label class="form-label">Password</label>
                                        <input v-model="registerForm.password" type="password" class="form-control"
                                            placeholder="Enter password" required>
                                    </div>

                                    <!-- Confirm Password -->
                                    <div class="mb-3">
                                        <label class="form-label">Confirm Password</label>
                                        <input v-model="registerForm.confirmPassword" type="password"
                                            class="form-control" placeholder="Confirm password" required>
                                    </div>



                                    <!-- Error Message -->
                                    <div v-if="errorMessage" class="alert alert-danger">
                                        {{ errorMessage }}
                                    </div>

                                    <!-- Submit Button -->
                                    <button type="submit" class="btn w-100"
                                        style="background-color: #7a5cfb; color: #fff;">
                                        Register
                                    </button>

                                    <!-- Toggle to Login -->
                                    <p class="text-center mt-3">
                                        Already a volunteer?
                                        <a href="javascript:void(0)" class="text-primary"
                                            @click.prevent="toggleForm">Login
                                            here</a>
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
/* Add slide-fade animation */
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
