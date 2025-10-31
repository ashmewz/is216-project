<!-- Scripting -->

<script setup>
import { ref } from 'vue'; // Import Vue's reactivity API
import Navbar from '@/components/resuables/Navbar.vue'; // Navigation bar component
import BottomFooter from '@/components/resuables/BottomFooter.vue'; // Footer component

// Cat profiles for adoption. Each object includes basic information and a list of images.
const cats = [
    {
        name: "Peoni",
        age: 7,
        breed: "British Shorthair",
        gender: "Female",
        vaccinated: true,
        status: "Available",
        desc: "Peoni is cute and cuddly",
        images: ['/cat1.png', '/cat2.png', '/cat3.png'],
    },
    {
        name: "Keoni",
        age: 6,
        breed: "Tabby",
        gender: "Female",
        vaccinated: false,
        status: "Available",
        desc: "Keoni is Peoni's younger sister, even more cute and cuddly",
        images: ['/cat2.png', '/cat3.png', '/cat1.png'],
    },
    {
        name: "Meoni",
        age: 5,
        breed: "Maine Coon",
        gender: "Male",
        vaccinated: true,
        status: "Pending",
        desc: "Meoni is the youngest brother, so full of cutsies and cuddles",
        images: ['/cat3.png', '/cat1.png', '/cat2.png'],
    },
];

// Cat Adoption Timeline
// Timeline steps for the adoption process (Hardcoded)
const adoptionTimeline = [
    {
        label: "Fill in Application Form",
        date: "31 Oct",
        time: "10:00 AM",
    },
    {
        label: "Center Processes Application",
        date: "01 Nov ~ 07 Nov",
        time: "5-7 Days",
    },
    {
        label: "Schedule Meet and Greet",
        date: "08 Nov",
        time: "2:00 PM",
    },
    {
        label: "Cat Vaccinations",
        date: "09 Nov",
        time: "10:30 AM",
    },
    {
        label: "Monitoring Period",
        date: "11 Nov ~ 15 Nov",
        time: "5-7 Days",
    },
    {
        label: "Cat Pickup",
        date: "16 Nov",
        time: "11:00 AM",
    },
];


// Reactive state management
const adoptionReason = ref('');      // Intialise User Input for adoption reason
const currentIndex = ref(0);         // Initialise Index of currently displayed cat profile
const carouselIndex = ref(0);        // Initialise Index for the carousel image shown
const showDetails = ref(false);      // Initialise display of cat details section
const showSuccess = ref(false);      // Initialise visibility of the adoption success popup

// Display the next cat profile and reset the image carousel
function nextCat() {
    if (currentIndex.value < cats.length - 1) {
        currentIndex.value++;
        carouselIndex.value = 0;
    }
}

// Display the previous cat profile and reset the image carousel
function prevCat() {
    if (currentIndex.value > 0) {
        currentIndex.value--;
        carouselIndex.value = 0;
    }
}

// Toggle favorite status for the selected cat profile
function toggleFavorite(cat) {
    cat.favorite = !cat.favorite;
}

// Cycle to the next image for the current cat profile
function nextPhoto() {
    const cat = cats[currentIndex.value];
    if (carouselIndex.value < cat.images.length - 1) {
        carouselIndex.value++;
    }
}

// Cycle to the previous image for the current cat profile
function prevPhoto() {
    const cat = cats[currentIndex.value];
    if (cat && carouselIndex.value > 0) {
        carouselIndex.value--;
    }
}

// Handle adoption form submission and display success feedback
function handleSubmit(event) {
    event.preventDefault();
    showSuccess.value = true;
    setTimeout(() => showSuccess.value = false, 2500);
}

</script>

<!-- Template -->

<template>
    <Navbar>
        <template v-slot:navbar-title>Adoption</template>
    </Navbar>

    <!-- Header -->
    <div class="adoption-header">Adopt Your Cats Here</div>

    <!-- Background -->
    <div class="adoption-bg">

        <!-- Timeline -->
        <div class="timeline-container">
            <ul class="timeline">
                <li v-for="(step, index) in adoptionTimeline" :key="index" class="timeline-step">

                    <!-- Make Visual Dot -->
                    <div class="timeline-dot"></div>

                    <!-- Content -->
                    <div class="timeline-content">
                        <span class="timeline-label">{{ step.label }}</span>
                        <span class="timeline-date">{{ step.date }}</span>
                        <span class="timeline-time">{{ step.time }}</span>
                    </div>
                </li>
            </ul>
        </div>

        <!-- Profile Navigation -->
        <div class="card-row">

            <!-- Reset Arrow Index -->
            <button class="arrow-btn" @click="prevCat" :disabled="currentIndex === 0">&#8592;</button>
            
            <!-- Adoption Card -->
            <div class="adoption-card">

                <!-- Carousel Container -->
                <div class="carousel-container">
                    <img :src="cats[currentIndex].images[carouselIndex]" class="cat-image" alt="Cat photo" />

                    <!-- Carousel Navigation -->
                    <button class="carousel-arrow left" @click="prevPhoto" :disabled="carouselIndex === 0"
                        aria-label="Previous photo">‹</button>
                    <button class="carousel-arrow right" @click="nextPhoto"
                        :disabled="carouselIndex === cats[currentIndex].images.length - 1"
                        aria-label="Next photo">›</button>
                </div>

                <!-- Cat Information -->
                <div class="cat-info">
                    <h2 class="cat-name">{{ cats[currentIndex].name }}, {{ cats[currentIndex].age }}</h2>
                    <p class="cat-desc">{{ cats[currentIndex].desc }}</p>
                    <div class="button-row">

                        <!-- Show Details Button -->
                        <button class="details-btn" @click="showDetails = true">Show Details</button>

                        <!-- Show Status Button -->
                        <div class="cat-status">{{ cats[currentIndex].status }}</div>

                        <!-- Toggle Favourite Button -->
                        <button @click="toggleFavorite(cats[currentIndex])" class="fav-btn">
                            <span v-if="cats[currentIndex].favorite">♥</span>
                            <span v-else>♡</span>
                        </button>

                    </div>
                </div>

                <!-- Cat Details Pop - Up -->
                <div class="cat-details" v-if="showDetails">
                    <h3 class="details-title">{{ cats[currentIndex].name }}'s Details</h3>
                    <p><strong>Breed:</strong> {{ cats[currentIndex].breed }}</p>
                    <p><strong>Gender:</strong> {{ cats[currentIndex].gender }}</p>
                    <p><strong>Vaccinated:</strong> {{ cats[currentIndex].vaccinated ? 'Yes' : 'No' }}</p>
                    <p><strong>Status:</strong> {{ cats[currentIndex].status }}</p>

                    <!-- Close the Pop - Up -->
                    <button class="close-btn" @click="showDetails = false">Close</button>
                </div>
            </div>

            <!-- End of Profiles -->
            <button class="arrow-btn" @click="nextCat" :disabled="currentIndex === cats.length - 1">&#8594;</button>
        </div>

        <!-- Adoption Form -->
        <form class="adoption-form" @submit="handleSubmit">
            <div class="form-label">
                <span>Why do you want to adopt {{ cats[currentIndex].name }}?</span>
                <br><small>Your reasons here</small></br>
            </div>

            <!-- Form Input Passed Here -->
            <textarea v-model="adoptionReason" class="reason-input" rows="2"></textarea>
            <button type="submit" class="next-btn">Next</button>
        </form>
    </div>

    <!-- Success Notification -->
    <transition name="fade">
        <div v-if="showSuccess">
            <div class="success-overlay"></div>
            <div class="success-popup">
                <h3>Interest Indicated</h3>
                <p>Please proceed to fill out the application form for {{ cats[currentIndex].name }}.</p>
            </div>
        </div>
    </transition>

    <BottomFooter></BottomFooter>
</template>

<!-- Styling -->

<style scoped>
/* Adoption Background, Header */
.adoption-bg {
    min-height: 100vh;
    background: linear-gradient(135deg, #ffe7f7 0%, #f7faff 60%, #e0eefc 100%);
    padding: 90px 0 70px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.adoption-header {
    text-align: center;
    font-size: 2rem;
    color: #395069;
    margin: 44px 0 18px 0;
    font-weight: 700;
    letter-spacing: 1px;
}

/* Adoption Timeline */
.timeline-container {
    width: 90vw;
    max-width: 1120px;
    margin: 0 auto 26px auto;
    padding-top: 14px;
}

.timeline {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    list-style: none;
    padding: 0;
    margin: 0;
    position: relative;
}

.timeline-step {
    flex: 1;
    text-align: center;
    position: relative;
    min-width: 110px;
}

.timeline-step:not(:last-child)::after {
    content: "";
    position: absolute;
    top: 24px;
    right: -50%;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #afe9f5 0%, #fbe3e0 100%);
    z-index: 1;
}

.timeline-dot {
    width: 24px;
    height: 24px;
    background: #ffe7f2;
    border: 4px solid #395069;
    border-radius: 50%;
    margin: 0 auto;
    z-index: 2;
    position: relative;
    box-shadow: 0 2px 10px rgba(60, 60, 60, 0.06);
}

.timeline-content {
    margin-top: 7px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.timeline-label {
    font-weight: 600;
    font-size: 1.04rem;
    color: #395069;
    margin-bottom: 3px;
}

.timeline-date {
    font-size: 0.96rem;
    color: #888;
    letter-spacing: 0.5px;
}

.timeline-time {
    font-size: 0.92rem;
    color: #8096b6;
    margin-top: 2px;
}

@media (max-width: 700px) {
    .timeline-container {
        width: 99vw;
        max-width: 100vw;
    }

    .timeline-step {
        min-width: 60px;
        font-size: 0.93rem;
    }

    .timeline-label {
        font-size: 0.98rem;
    }

    .timeline-date,
    .timeline-time {
        font-size: 0.86rem;
    }
}

/* Adoption Card and Form */
.adoption-card,
.adoption-form {
    background: rgba(255, 255, 255, 0.85);
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(60, 60, 60, 0.12);
    padding: 20px;
    width: 90vw;
    max-width: 90vw;
    min-width: 10vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 auto;
}

.card-row {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-bottom: 16px;
}

/*  Carousel */
.carousel-container {
    width: 100%;
    aspect-ratio: 16/9;
    max-width: 90vw;
    min-width: 10vw;
    margin: 0 auto 10px auto;
    height: auto;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border-radius: 16px;
    background: #fff8f8;
}

.cat-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: none;
    display: block;
    background: none;
    box-shadow: none;
}

.cat-info {
    text-align: center;
}

.cat-name {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2px;
    letter-spacing: 1px;
}

.cat-desc {
    color: #444;
    font-size: 1rem;
}

/* Arrows (Cycle Profiles) */
.arrow-btn {
    background: #ececec;
    border: none;
    border-radius: 50%;
    font-size: 2rem;
    height: 48px;
    width: 48px;
    margin: 0 12px;
    color: #6075a7;
}

.arrow-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Arrows (Cycle Pictures) */
.carousel-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: #ececec;
    border: none;
    border-radius: 50%;
    font-size: 2rem;
    width: 38px;
    height: 38px;
    color: #6075a7;
    opacity: 0.8;
    z-index: 2;
    cursor: pointer;
    transition: opacity 0.1s;
}

.carousel-arrow.left {
    left: 8px;
}

.carousel-arrow.right {
    right: 8px;
}

.carousel-arrow:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

/* Buttons (Within Profile) */

.button-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 18px;
    margin-top: 16px;
    margin-bottom: 2px;
    width: 100%;
}

.details-btn {
    background: #ececec;
    border: 2px solid #6075a7;
    border-radius: 12px;
    font-size: 1.06rem;
    color: #6075a7;
    padding: 12px 32px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.14s;
}

.details-btn:hover {
    background: #f5f8ff;
}

.cat-status {
    background: #f7e4ed;
    color: #6075a7;
    font-size: 1.03rem;
    font-weight: 600;
    padding: 12px 32px;
    border-radius: 12px;
    border: 2px solid #f7e4ed;
    min-width: 98px;
    text-align: center;
}

.fav-btn {
    background: #fff8fc;
    border: 2px solid #f78da7;
    border-radius: 12px;
    font-size: 2rem;
    color: #f78da7;
    cursor: pointer;
    margin: 0;
    padding: 0 24px;
    height: 44px;
    width: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.fav-btn:active {
    background: #fbe1ed;
}

/* Cat Details */

.cat-details {
    background: #fff8f8;
    border-radius: 16px;
    padding: 18px;
    margin-top: 10px;
    box-shadow: 0 2px 10px rgba(140, 140, 140, 0.12);
    text-align: left;
    width: 95%;
    max-width: 95%;
}

.details-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 10px;
}

.close-btn {
    margin-top: 8px;
    background: #fdd4e2;
    border: none;
    border-radius: 8px;
    font-size: 1.02rem;
    color: #6075a7;
    padding: 6px 18px;
    cursor: pointer;
}

/* Adoption Form */

.form-label {
    width: 100%;
    text-align: left;
    margin-bottom: 8px;
}

.form-label span {
    font-weight: 600;
    font-size: 1.07rem;
}

.form-label small {
    color: #888;
    font-size: 0.92rem;
}

.reason-input {
    width: 100%;
    margin: 18px 0;
    padding: 14px 10px;
    border-radius: 10px;
    border: 1px solid #e0dee3;
    background: #f9f3f6;
    font-size: 1.03rem;
    min-height: 42px;
}

.next-btn {
    width: 100%;
    background: #8096b6;
    color: #fff;
    border: none;
    border-radius: 18px;
    font-weight: 600;
    font-size: 1.15rem;
    padding: 14px 0;
    margin-top: 8px;
}

.next-btn:hover {
    background: #445c85;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

@media (max-width: 600px) {

    .adoption-card,
    .adoption-form {
        width: 95vw;
        max-width: 100vw;
        min-width: unset;
        padding: 14px 5px;
    }

    .carousel-container {
        max-width: 95vw;
    }
}

/* Adoption Success Message */
.success-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(60, 60, 60, 0.46);
    z-index: 1001;
}

.success-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1002;
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 6px 44px rgba(60, 60, 60, 0.24);
    padding: 32px 28px 22px 28px;
    min-width: 300px;
    text-align: center;
    animation: popscale 0.22s;
}

@keyframes popscale {
    from {
        transform: translate(-50%, -50%) scale(0.9);
        opacity: 0.5;
    }

    to {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
    }
}
</style>;