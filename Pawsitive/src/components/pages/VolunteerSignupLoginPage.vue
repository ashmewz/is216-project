<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase"; 

</script>

<script>
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
                name: '',
                email: '',
                password: ''
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

                // if login success go to root page
                
                this.$router.push("/"); 

            } catch (error) {
                // any error write to errorMessage
                this.errorMessage = error.message; 
            }
        },
        async handleRegister() {

            this.errorMessage = ""; // reset previous errors

            try {

                //firebase create user account
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    this.registerForm.email,
                    this.registerForm.password
                );

                //auto logs in and get user details
                const user = userCredential.user;


                //write user details to firestore db users collection
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    name: this.registerForm.name,
                    email: this.registerForm.email,
                    role: 'user',   //potential security issue as malicous user can change this (e.g to 'admin'), might be able to fix with firestore db rules or firebase cloud functions (need billing info to access)
                    createdAt: serverTimestamp()
                });

                //go to root page if login success
                this.$router.push('/');


            } catch (error) {
                //any error write to errorMessage
                console.error(error);
                this.errorMessage = error.message;
            }
        },
        toggleForm() {
            this.errorMessage = ""; // reset previous errors
            this.isLogin = !this.isLogin;
        }
    }
}
</script>


<template>
    <Navbar>
        <template v-slot:navbar-title>
            Signup / Login
        </template>
    </Navbar>



    <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div class="card shadow " style="max-width: 900px; width: 90%;">
            <div class="row g-0 ">

                <!-- Left Section (Graphic / Text) -->
                <div
                    class="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center bg-secondary text-white p-4 rounded-start">
                    <h1>Welcome!</h1>
                    <p class="lead text-center">Join our volunteer community and make a difference.</p>
                    <img src="../../assets/pawsitive-logo.png" alt="Graphic" class="img-fluid rounded mt-3">
                </div>

                <!-- Right Section (Auth Form) -->
                <div class="col-12 col-md-6 d-flex justify-content-center align-items-center p-4">
                    <div class="w-100" style="max-width: 25rem;">
                        <h3 class="text-center mb-4">{{ isLogin ? 'Volunteer Login' : 'Volunteer Registration' }}</h3>

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

                            <!-- Register Form -->
                            <form v-else key="register" @submit.prevent="handleRegister">
                                <div class="mb-3">
                                    <label class="form-label">Full Name</label>
                                    <input v-model="registerForm.name" type="text" class="form-control"
                                        placeholder="Enter full name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Email address</label>
                                    <input v-model="registerForm.email" type="email" class="form-control"
                                        placeholder="Enter email" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Password</label>
                                    <input v-model="registerForm.password" type="password" class="form-control"
                                        placeholder="Enter password" required>
                                </div>
                                <div v-if="errorMessage" class="alert alert-danger">
                                    {{ errorMessage }}
                                </div>
                                <button type="submit" class="btn w-100"
                                    style="background-color: #7a5cfb; color: #fff;">Register</button>

                                <p class="text-center mt-3">
                                    Already a volunteer?
                                    <a href="javascript:void(0)" class="text-primary" @click.prevent="toggleForm">Login
                                        here</a>
                                </p>
                            </form>
                        </transition>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <BottomFooter></BottomFooter>

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
