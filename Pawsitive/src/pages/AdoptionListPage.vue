<script setup>
import { ref } from 'vue'; // Vue's reactivity system
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';

const cats = [
    {
        name: "Peoni",
        age: 7,
        desc: "Peoni is cute and cuddly",
        image: '/public/cat1.png', // Absolute Pathing
    },
    {
        name: "Keoni",
        age: 6,
        desc: "Keoni is Peoni's younger sister, even more cute and cuddly",
        image: '/public/cat2.png',
    },
    {
        name: "Meoni",
        age: 5,
        desc: "Meoni is the youngest brother, so full of cutsies and cuddles",
        image: '/public/cat3.png',
    },
];

const currentIndex = ref(0); // Update reactively
const adoptionReason = ref('');

function nextCat() {
    if (currentIndex.value < cats.length - 1)
        currentIndex.value++; // Increase Index
}
function prevCat() {
    if (currentIndex.value > 0)
        currentIndex.value--; // Decrease Index
}
</script>


<template>
    <Navbar>
        <template v-slot:navbar-title>
            Adoption
        </template>
    </Navbar>
    
    <main class="background">
    <div class="adoption-bg">
        <div class="card-row">
            <button class="arrow-btn" @click="prevCat" :disabled="currentIndex === 0">&#8592;</button>
            <div class="adoption-card">
                <img class="pet-image" :src="cats[currentIndex].image" alt="Cat" />
                <div class="pet-info">
                    <h2 class="pet-name">{{ cats[currentIndex].name }}, {{ cats[currentIndex].age }}</h2>
                    <p class="pet-desc">{{ cats[currentIndex].desc }}</p>
                </div>
            </div>
            <button class="arrow-btn" @click="nextCat" :disabled="currentIndex === cats.length - 1">&#8594;</button>
        </div>

        <form class="adoption-form">
            <div class="form-label">
                <span>Why do you want to adopt {{ cats[currentIndex].name }}?</span>
                <br><small>Your reasons here</small></br>
            </div>
            <textarea v-model="adoptionReason" class="reason-input" rows="2"></textarea>
            <button type="submit" class="next-btn">Next</button>
        </form>
    </div>
    </main>
 

    <BottomFooter></BottomFooter>
</template>

<style scoped>
.adoption-bg {
    min-height: 100vh;
    padding-top: 90px;
    padding-bottom: 70px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.card-row {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-bottom: 16px;
}

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

.adoption-card {
    background: rgba(255, 255, 255, 0.85);
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(60, 60, 60, 0.12);
    padding: 20px;
    max-width: 90vw;
    width: 350px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.pet-image {
    width: 100%;
    height: 70%;
    border-radius: 16px;
    margin-bottom: 14px;
    box-shadow: 0 2px 8px rgba(60, 60, 60, 0.2);
    border: 3px solid #f7e4ed;
}

.pet-info {
    text-align: center;
}

.pet-name {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2px;
    letter-spacing: 1px;
}

.pet-desc {
    color: #444;
    font-size: 1rem;
}

.adoption-form {
    background: #fff;
    border-radius: 20px;
    margin-top: 10px;
    padding: 24px 14px;
    box-shadow: 0 2px 12px rgba(120, 120, 120, 0.10);
    width: 350px;
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
</style>;