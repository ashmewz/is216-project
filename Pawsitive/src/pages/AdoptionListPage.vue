<script setup>

import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import { db } from "@/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

const containerRef = ref(null);
const scrolledPast = ref(false);
const showApplicationForm = ref(false);
const applicationFormRef = ref(null);

const SCROLL_THRESHOLD = 50;

const applicationData = ref({
    livingSituation: '',
    hasOtherPets: '',
    hasKids: '',
    allergies: '',
    hoursAlone: '',
    financialCommit: '',
    routinePlan: '',
    movingSoon: '',
    agreeHomeVisit: false,
    references: ''
});

const yesNoOptions = ['Yes', 'No'];
const livingSituations = ['HDB Flat', 'Condo', 'Landed Property', 'Others'];
const cats = ref([])

// Firestore Cat Profile Data (For redundancy)
// async function addCatProfile() {
//   try {
//     await addDoc(collection(db, "catAdoption"), 

//     );
//     console.log("Cat profile added successfully!");
//   } catch (e) {
//     console.error("Error adding document: ", e);
//   }
// }

// addCatProfile();

// const catss = ref([
//     {
//         name: "Peoni",
//         age: 7,
//         breed: "British Shorthair",
//         gender: "Female",
//         vaccinated: true,
//         status: "Available",
//         desc: "Peoni is cute and cuddly",
//         images: ['/cat1.png', '/cat2.png', '/cat3.png'],
//         favorite: false,
//         rating: 4,
//         notes: "Loves naps near windows.",
//         microchipped: true,
//         fee: 120
//     },
//     {
//         name: "Keoni",
//         age: 6,
//         breed: "Tabby",
//         gender: "Female",
//         vaccinated: false,
//         status: "Available",
//         desc: "Keoni is Peoni's younger sister, even more cute and cuddly",
//         images: ['/cat4.png', '/cat5.png', '/cat6.png'],
//         favorite: false,
//         rating: 5,
//         notes: "Shy at first but affectionate with treats.",
//         microchipped: false,
//         fee: 100
//     },
//     {
//         name: "Meoni",
//         age: 5,
//         breed: "Maine Coon",
//         gender: "Male",
//         vaccinated: true,
//         status: "Pending",
//         desc: "Meoni is the youngest brother, so full of cutsies and cuddles",
//         images: ['/cat7.png', '/cat8.png', '/cat9.png'],
//         favorite: false,
//         rating: 3,
//         notes: "Very playful. Needs space to climb.",
//         microchipped: true,
//         fee: 140
//     },
//     {
//         name: "Luna",
//         age: 4,
//         breed: "Siamese",
//         gender: "Female",
//         vaccinated: true,
//         status: "Available",
//         desc: "Luna is playful and loves attention.",
//         images: ['/cat10.png', '/cat11.png', '/cat12.png'],
//         favorite: false,
//         rating: 5,
//         notes: "Enjoys sunbathing by the window.",
//         microchipped: true,
//         fee: 110
//     },
//     {
//         name: "Max",
//         age: 3,
//         breed: "Bengal",
//         gender: "Male",
//         vaccinated: true,
//         status: "Pending",
//         desc: "Max is energetic and curious.",
//         images: ['/cat13.png', '/cat14.png', '/cat15.png'],
//         favorite: false,
//         rating: 4,
//         notes: "Needs space to run and climb.",
//         microchipped: true,
//         fee: 130
//     },
//     {
//         name: "Mochi",
//         age: 2,
//         breed: "Ragdoll",
//         gender: "Female",
//         vaccinated: true,
//         status: "Available",
//         desc: "Mochi is calm, affectionate, and loves being carried around.",
//         images: ['/cat16.png', '/cat17.png', '/cat18.png'],
//         favorite: false,
//         rating: 5,
//         notes: "Enjoys quiet spaces and gentle petting.",
//         microchipped: true,
//         fee: 115
//     },
//     {
//         name: "Oreo",
//         age: 8,
//         breed: "Tuxedo",
//         gender: "Male",
//         vaccinated: true,
//         status: "Available",
//         desc: "Oreo is a wise old gentleman who loves warm laps.",
//         images: ['/cat19.png', '/cat20.png', '/cat21.png'],
//         favorite: false,
//         rating: 4,
//         notes: "Prefers soft blankets and slow mornings.",
//         microchipped: true,
//         fee: 90
//     },
//     {
//         name: "Nala",
//         age: 1,
//         breed: "Scottish Fold",
//         gender: "Female",
//         vaccinated: false,
//         status: "Available",
//         desc: "Nala is curious and loves chasing feather toys.",
//         images: ['/cat22.png', '/cat23.png', '/cat24.png'],
//         favorite: false,
//         rating: 5,
//         notes: "Loves attention and exploring new rooms.",
//         microchipped: false,
//         fee: 100
//     },
//     {
//         name: "Simba",
//         age: 3,
//         breed: "Abyssinian",
//         gender: "Male",
//         vaccinated: true,
//         status: "Available",
//         desc: "Simba is adventurous and confident with a big heart.",
//         images: ['/cat25.png', '/cat26.png', '/cat27.png'],
//         favorite: false,
//         rating: 4,
//         notes: "Enjoys interactive play and scratching posts.",
//         microchipped: true,
//         fee: 125
//     },
//     {
//         name: "Cleo",
//         age: 5,
//         breed: "Persian",
//         gender: "Female",
//         vaccinated: true,
//         status: "Pending",
//         desc: "Cleo is elegant, calm, and always photo-ready.",
//         images: ['/cat28.png', '/cat29.png', '/cat30.png'],
//         favorite: false,
//         rating: 5,
//         notes: "Needs regular grooming and soft bedding.",
//         microchipped: true,
//         fee: 150
//     }

// ]);

const timelineSteps = [
    { label: "Send Application", offsetDays: 0, time: "10:00 AM" },
    { label: "Application Processing", offsetDays: 2, time: "5-7 Days" },
    { label: "Meet and Greet", offsetDays: 8, time: "2:00 PM" },
    { label: "Cat Vaccinations", offsetDays: 9, time: "10:30 AM" },
    { label: "Monitoring Period", offsetDays: 11, time: "5-7 Days" },
    { label: "Cat Pickup", offsetDays: 16, time: "11:00 AM" }
];

const currentIndex = ref(0);
const carouselIndex = ref(0);
const showDetails = ref(false);
const showSuccess = ref(false);
const searchQuery = ref('');
const vaccinatedOnly = ref(false);
const statusFilter = ref('');
const sortOption = ref('default');
const showBooking = ref(false);
const booking = ref({ date: '', time: '', attendees: 1, notes: '' });
const showContact = ref(false);
const contactForm = ref({ name: '', email: '', message: '' });
const successTitle = ref('');
const successMessage = ref('');
const timelineProgress = ref(0);
const FAVORITES_KEY = 'cat_favorites_v1';

function onScroll() {
    if (!containerRef.value || !applicationFormRef.value) return;
    const containerScrollTop = containerRef.value.scrollTop;
    const applicationOffset = applicationFormRef.value.offsetTop - 120;
    if (containerScrollTop >= applicationOffset && showApplicationForm.value) {
        scrolledPast.value = true;
    } else {
        scrolledPast.value = false;
    }
}


// Fetch all cat profiles from Firestore
onMounted(async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'catAdoption'))
        cats.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
        console.error('Error fetching cats:', e)
    }
})

// Firestore Application Form Data (For redundancy)
async function submitApplication() {

    try {
        await addDoc(collection(db, 'catApplication'), applicationData.value)
        console.log('Application submitted successfully')
        // Optionally, reset form or show success message
    } catch (error) {
        console.error('Error submitting application: ', error)
    }
    showSuccessPopup('Application Submitted', 'Thank you for your interest! Our team will review your application.');
    showApplicationForm.value = false;
    scrolledPast.value = false;
}

function getTimelineWithDates() {
    const today = new Date()
    return timelineSteps.map(step => {
        const eventDate = new Date(today)
        eventDate.setDate(today.getDate() + step.offsetDays)
        return {
            label: step.label,
            date: eventDate.toLocaleDateString('en-GB'), // Date format: DD/MM/YYYY
            time: step.time
        }
    });
}
const adoptionTimeline = ref(getTimelineWithDates())

function openScheduleVisit() {
    window.open("https://spca.org.sg/services/adoption", "_blank", "noopener");
}

function openContactCenter() {
    window.open("https://www.catwelfare.org/adoptions", "_blank", "noopener");
}

function openContactUs() {
    window.open("https://www.catwelfare.org/get-help", "_blank", "noopener");
}

function openAskQuestion() {
    window.open("https://spca.org.sg/services/adoption", "_blank", "noopener");
}


// Adoption Timeline
onMounted(() => {
    adoptionTimeline.value = getTimelineWithDates()
})

onMounted(() => {
    if (containerRef.value) {
        containerRef.value.addEventListener('scroll', onScroll);
    }

    try {
        const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
        if (Array.isArray(stored)) {
            cats.value.forEach(cat => {
                cat.favorite = stored.includes(cat.name);
            });
        }
    } catch (e) { }

    const idx = cats.value.findIndex(c => c.status === 'Available');
    timelineProgress.value = idx !== -1 ? 0 : 0;
});

onUnmounted(() => {
    if (containerRef.value) {
        containerRef.value.removeEventListener('scroll', onScroll);
    }
});

watch(cats, (newCats) => {
    try {
        const favs = newCats.filter(c => c.favorite).map(c => c.name);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    } catch (e) { }
}, { deep: true });

const filtered = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    return cats.value.filter(cat => {
        if (vaccinatedOnly.value && !cat.vaccinated) return false;
        if (statusFilter.value && cat.status !== statusFilter.value) return false;
        if (!q) return true;
        return cat.name.toLowerCase().includes(q) || (cat.breed && cat.breed.toLowerCase().includes(q));
    });
});

const filteredAndSorted = computed(() => {
    const list = [...filtered.value];
    switch (sortOption.value) {
        case 'age-asc': list.sort((a, b) => a.age - b.age); break;
        case 'age-desc': list.sort((a, b) => b.age - a.age); break;
        case 'name-asc': list.sort((a, b) => a.name.localeCompare(b.name)); break;
        case 'name-desc': list.sort((a, b) => b.name.localeCompare(a.name)); break;
        default: break;
    }
    return list;
});

const currentCat = computed(() => {
    const list = filteredAndSorted.value;
    if (list.length === 0) return cats.value[0] || {};
    const idx = Math.min(Math.max(currentIndex.value, 0), list.length - 1);
    currentIndex.value = idx;
    return list[idx];
});

const currentImage = computed(() => {
    const cat = currentCat.value;
    if (!cat || !cat.images || cat.images.length === 0) return '';
    if (carouselIndex.value >= cat.images.length) carouselIndex.value = 0;
    return cat.images[carouselIndex.value];
});

const statusClass = computed(() => {
    const s = currentCat.value.status || '';
    return {
        available: s === 'Available',
        pending: s === 'Pending',
        adopted: s === 'Adopted'
    };
});

const favoriteTitle = computed(() => currentCat.value.favorite ? 'Remove from favorites' : 'Add to favorites');

function toggleFavorite(cat) { cat.favorite = !cat.favorite; }

function showSuccessPopup(title, message, timeout = 2500) {
    successTitle.value = title;
    successMessage.value = message;
    showSuccess.value = true;
    setTimeout(() => showSuccess.value = false, timeout);
}

function handleIndicateInterest() {
    showApplicationForm.value = true;
    nextTick(() => {
        applicationFormRef.value?.scrollIntoView({ behavior: 'smooth' });
    });
}

function openBookingModal() {
    booking.value = { date: '', time: '', attendees: 1, notes: '' };
    showBooking.value = true;
}

function closeBooking() {
    showBooking.value = false;
}

function submitBooking() {
    closeBooking();
    showSuccessPopup('Booking Confirmed', `Your visit for ${currentCat.value.name} has been scheduled on ${booking.value.date} at ${booking.value.time}.`);
}

function openContactModal() {
    contactForm.value = { name: '', email: '', message: '' };
    showContact.value = true;
}

function shareProfile() {
    const url = `${location.origin}${location.pathname}#${encodeURIComponent(currentCat.value.name)}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showSuccessPopup('Link Copied', 'Profile link copied to clipboard.');
        }).catch(() => {
            showSuccessPopup('Share', 'Could not copy automatically. You can copy this URL: ' + url);
        });
    } else {
        showSuccessPopup('Share', `Profile URL: ${url}`);
    }
}

function selectCatByFilteredIndex(idxInFiltered) {
    currentIndex.value = idxInFiltered;
    carouselIndex.value = 0;
    showDetails.value = false;
}

watch(currentIndex, (v) => {
    timelineProgress.value = Math.min(v, adoptionTimeline.length - 1);
});

</script>



<template>
    <Navbar>
        <template v-slot:navbar-title>Adoption</template>
    </Navbar>

    <!-- <button @click="addCat">Add Cat to Firestore</button> -->

    <div ref="containerRef" :class="['scroll-bg-container', { 'background-changed': scrolledPast }]"
        style="min-height: 100vh; overflow-y: auto;">
        <!-- 1. Centered header -->
        <div class="adoption-header full-center">Adopt Your Cats Here</div>

        <!-- 2 & 3. Swapped & buttonified "Vaccinated Only", Sort moved right -->
        <div class="section-center">
            <div class="col-12 col-md-8 mx-auto controls-row full-width-row">
                <input v-model="searchQuery" class="search-input col-sm-12" placeholder="Search by name or breed..."
                    aria-label="Search cats" />

                <div class="row g-2 justify-content-center">
                    <div class="col-4 col-md-auto">
                        <select v-model="statusFilter" class="form-select w-100" aria-label="Filter by status">
                            <option value="">Sort: Status</option>
                            <option value="Available">Available</option>
                            <option value="Pending">Pending</option>
                            <option value="Adopted">Adopted</option>
                        </select>
                    </div>
                    <div class="col-4 col-md-auto">
                        <select v-model="sortOption" class="form-select w-100" aria-label="Sort cats">
                            <option value="default">Sort: Default</option>
                            <option value="age-asc">Age ↑</option>
                            <option value="age-desc">Age ↓</option>
                            <option value="name-asc">Name A→Z</option>
                            <option value="name-desc">Name Z→A</option>
                        </select>
                    </div>
                    <div class="col-4 col-md-auto">
                        <button type="button" class="btn btn-outline-primary w-100" :class="{ checked: vaccinatedOnly }"
                            @click="vaccinatedOnly = !vaccinatedOnly">
                            Vaccinated Only
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Timeline, now with encapsulating background -->
        <div class="section-center">
            <div class="timeline-bg">
                <div class="timeline-container full-width-row">
                    <ul class="timeline">
                        <li v-for="(step, index) in adoptionTimeline" :key="index" class="timeline-step col-12" :class="{
                            'col-sm-3': index < 4,
                            'col-sm-6': index >= 4
                        }">
                            <div class="timeline-dot" :class="{ active: index === timelineProgress }"></div>
                            <strong>{{ step.label }}</strong>
                            <div>{{ step.date }}</div>
                            <div>{{ step.time }}</div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Profile Card, image with frame -->
        <div class="section-center">
            <div class="profile-card-container full-width-row">
                <div class="adoption-card profile-card-wide" role="region"
                    :aria-label="`Profile of ${currentCat.name}`">

                    <div class="framed-image">
                        <img :src="currentImage" class="cat-image"
                            :alt="`${currentCat.name} photo ${carouselIndex + 1}`" />
                    </div>

                    <div class="cat-header-row">
                        <div class="cat-main-id">
                            <h2 class="cat-name">{{ currentCat.name }}, {{ currentCat.age }}</h2>
                            <p class="cat-desc">{{ currentCat.desc }}</p>
                            <div class="thumb-strip-horizontal">
                                <button v-for="(img, idx) in currentCat.images" :key="img" class="thumb"
                                    :class="{ active: idx === carouselIndex }" @click="carouselIndex = idx">
                                    <img :src="img" :alt="'Thumbnail ' + (idx + 1)" />
                                </button>
                            </div>
                        </div>
                        <div class="cat-header-actions">
                            <div class="status-pill" :class="statusClass">{{ currentCat.status }}</div>
                            <button class="fav-badge" @click="toggleFavorite(currentCat)"
                                :aria-pressed="!!currentCat.favorite" :title="favoriteTitle">
                                <span v-if="currentCat.favorite">♥</span>
                                <span v-else>♡</span>
                            </button>
                        </div>
                    </div>

                    <div class="meta-row">
                        <div><strong>Breed:</strong> {{ currentCat.breed }}</div>
                        <div><strong>Gender:</strong> {{ currentCat.gender }}</div>
                        <div><strong>Vaccinated:</strong> {{ currentCat.vaccinated ? 'Yes' : 'No' }}</div>
                    </div>
                    <div class="button-row">
                        <button class="pawsitive-btn" @click="showDetails = !showDetails" :aria-expanded="showDetails">
                            {{ showDetails ? 'Hide Details' : 'Show Details' }}
                        </button>

                        <button class="pawsitive-btn" @click="openScheduleVisit"
                            :disabled="currentCat.status !== 'Available'">
                            Schedule Visit
                        </button>
                        <button class="pawsitive-btn" @click="openContactCenter">Contact
                            Center</button>
                        <button class="pawsitive-btn" @click="shareProfile">Share</button>
                    </div>
                    <div class="notes-row">
                        <div class="rating" aria-hidden="true">
                            <span v-for="n in 5" :key="n" class="star"
                                :class="{ filled: n <= currentCat.rating }">★</span>
                        </div>
                        <div class="small-note">
                            <small>{{ currentCat.notes || 'No additional notes.' }}</small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="cat-details" v-if="showDetails">
                <h2>{{ currentCat.name }}</h2>
                <p>{{ currentCat.desc }}</p>
                <p>Breed: {{ currentCat.breed }}</p>
                <p>Age: {{ currentCat.age }}</p>
                <p>Gender: {{ currentCat.gender }}</p>
                <img :src="currentCat.images[0]" :alt="currentCat.name" width="64" height="48" />
                <p>Fee: {{ currentCat.fee }}</p>
                <p>Microchipped: {{ currentCat.microchipped ? 'Yes' : 'No' }}</p>
                <p>Notes: {{ currentCat.notes }}</p>
                <div class="close-row">
                    <button class="close-btn" @click="showDetails = false">Close</button>
                </div>
            </div>
        </div>

        <div class="profile-card-subrow full-width-row">
            <div class="list-card subrow-half">
                <h3>Cat Catalogue (Scroll)</h3>
                <div class="all-cats-card">
                    <ul class="cat-list">
                        <li v-for="(cat, idx) in filteredAndSorted" :key="cat.name + idx"
                            :class="{ selected: idx === currentIndex }" @click="selectCatByFilteredIndex(idx)"
                            role="button" tabindex="0">
                            <img :src="cat.images[0]" :alt="`${cat.name} thumbnail`" />
                            <div class="list-info">
                                <div class="list-name">{{ cat.name }}</div>
                                <div class="list-sub">{{ cat.breed }} • {{ cat.age }}y</div>
                            </div>
                            <div class="list-right">
                                <div class="list-status">{{ cat.status }}</div>
                                <button class="mini-fav" @click.stop="toggleFavorite(cat)">{{ cat.favorite ? '♥' : '♡'
                                    }}</button>
                            </div>
                        </li>
                        <li v-if="filteredAndSorted.length === 0" class="no-results">No cats match your filters.</li>
                    </ul>
                </div>
            </div>
            <div class="list-card subrow-half">
                <h4>Quick Help</h4>
                <p>Phone: +65 6123 4567</p>
                <p>Email: adopt@catshelter.sg</p>

                <button class="pawsitive-btn-outline" @click="openContactUs">Contact Us</button>
            </div>
        </div>
    </div>
    <!-- Adoption form -->
    <div class="section-center">
        <div class="adoption-form profile-card-wide">
            <div class="form-label big center">
                Are you ready to adopt {{ currentCat.name }}?
            </div>
            <div class="form-row center-buttons">
                <button type="button" class="pawsitive-btn" @click="handleIndicateInterest">Indicate Interest</button>
                <button type="button" class="pawsitive-btn-outline" @click="openAskQuestion">Ask a Question</button>
            </div>
        </div>
    </div>

    <!-- New: Adoption Application Form Section, appears after click -->
    <div v-if="showApplicationForm" ref="applicationFormRef" class="section-center">
        <form class="adoption-form profile-card-wide app-form" @submit.prevent="submitApplication">

            <div class="form-label big center margin-bottom">
                Adoption Application – Tell us about yourself
            </div>

            <!-- Question 1: Living Situation -->
            <div class="form-group">
                <label><strong>1. What type of residence do you live in?</strong></label>
                <select v-model="applicationData.livingSituation" required>
                    <option value="" disabled>Select...</option>
                    <option v-for="opt in livingSituations" :key="opt">{{ opt }}</option>
                </select>
            </div>

            <!-- Question 2: Other pets at home -->
            <div class="form-group">
                <label><strong>2. Do you currently have any other pets?</strong></label>
                <div class="radio-group">
                    <label v-for="opt in yesNoOptions" :key="opt">
                        <input type="radio" :value="opt" v-model="applicationData.hasOtherPets" required />
                        {{ opt }}
                    </label>
                </div>
            </div>

            <!-- Question 3: Children in the home -->
            <div class="form-group">
                <label><strong>3. Are there young children (aged under 10)?</strong></label>
                <div class="radio-group">
                    <label v-for="opt in yesNoOptions" :key="opt">
                        <input type="radio" :value="opt" v-model="applicationData.hasKids" required />
                        {{ opt }}
                    </label>
                </div>
            </div>

            <!-- Question 4: Allergies -->
            <div class="form-group">
                <label><strong>4. Does anyone in your home have cat allergies?</strong></label>
                <div class="radio-group">
                    <label v-for="opt in yesNoOptions" :key="opt">
                        <input type="radio" :value="opt" v-model="applicationData.allergies" required />
                        {{ opt }}
                    </label>
                </div>
            </div>

            <!-- Question 5: Hours home alone -->
            <!-- Q5: Place input below label -->
            <div class="form-group">
                <label><strong>5. On average, how many hours will the cat be home alone each day?</strong></label>
                <div>
                    <input v-model="applicationData.hoursAlone" type="number" min="0" max="24" required>
                </div>
            </div>


            <!-- Question 6: Financial commitment -->
            <div class="form-group">
                <label><strong>6. Can you commit to pet expenses (vet, food, insurance, etc)?</strong></label>
                <div class="radio-group">
                    <label v-for="opt in yesNoOptions" :key="opt">
                        <input type="radio" :value="opt" v-model="applicationData.financialCommit" required />
                        {{ opt }}
                    </label>
                </div>
            </div>

            <!-- Question 7: Daily routine/plan -->
            <div class="form-group">
                <label><strong>7. Briefly describe how you plan to care for your cat daily.</strong></label>
                <textarea v-model="applicationData.routinePlan" required rows="2"
                    placeholder="Describe your daily plan…"></textarea>
            </div>

            <!-- Question 8: Plans to move soon -->
            <div class="form-group">
                <label><strong>8. Are you or anyone in your household planning to move soon?</strong></label>
                <div class="radio-group">
                    <label v-for="opt in yesNoOptions" :key="opt">
                        <input type="radio" :value="opt" v-model="applicationData.movingSoon" required />
                        {{ opt }}
                    </label>
                </div>
            </div>

            <!-- Question 9: Home visit agreement -->
            <div class="form-group">
                <label>
                    <strong>9. Do you agree to a pre-adoption home visit if required?</strong>
                    <div>
                        <input type="checkbox" v-model="applicationData.agreeHomeVisit" required>
                        <span> Yes, I agree</span>
                    </div>

                </label>
            </div>

            <!-- Question 10: References (textarea) -->
            <div class="form-group">
                <label><strong>10. Please provide a reference (friend, vet, etc.):</strong></label>
                <textarea v-model="applicationData.references" rows="2" required
                    placeholder="Reference name and contact…"></textarea>
            </div>

            <div class="form-row center-buttons">
                <button type="submit" class="pawsitive-btn">Submit</button>
                <button type="button" class="pawsitive-btn-outline"
                    @click="showApplicationForm = false; scrolledPast = false;">
                    Cancel
                </button>
            </div>
        </form>
    </div>


    <transition name="fade">
        <div v-if="showSuccess">
            <div class="success-overlay"></div>
            <div class="success-popup">
                <h3>{{ successTitle }}</h3>
                <p>{{ successMessage }}</p>
            </div>
        </div>
    </transition>
    <BottomFooter />
</template>

<style scoped>
/* Header center fix */
.full-center {
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Controls row changed layout */
.full-width-row {
    width: 100%;
    max-width: 990px;
    margin-left: auto;
    margin-right: auto;
}

.controls-row {
    justify-content: center;
    align-items: center;
    gap: 16px;
    width: 100%;
    max-width: 990px;
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 26px;
}

/* Vaccinated only as button */
.filter-btn {
    padding: 11px 22px;
    margin-left: 7px;
    margin-top: 7px;
    border-radius: 11px;
    background: #fcfcfc;
    border: 1.5px solid #7582cf;
    color: #7582cf;
    font-weight: 700;
    transition: background .15s;
    font-size: 1.04rem;
    cursor: pointer;
    outline: none;
}

.filter-btn.checked {
    background: #dbeaff;
    color: #375ba1;
    border-color: #375ba1;
}

.filter-btn:active {
    background: #eef2fa;
}

.select-group select {
    padding: 11px;
    margin-left: 7px;
    margin-top: 7px;
    border-radius: 11px;
    border: 1px solid #efeff2;
    background: #fcfcfc;
    font-size: 1.05rem;
}

/* Profile card and 5/6 sub-cards are wide, consistent width styling */



.profile-card-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100%;
}

.profile-card-wide {
    width: 100%;
    max-width: 960px;
    margin: 0 auto 22px auto;
}

/* Two cards (all cats, quick help) below: share row, each half width */
.profile-card-subrow {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 24px;
    width: 100%;
    max-width: 960px;
    margin: 0 auto 24px auto;
}

.subrow-half {
    width: 49.5%;
    min-width: 320px;
    max-width: 480px;
    box-sizing: border-box;
}

@media (max-width: 1024px) {

    .profile-card-container,
    .profile-card-wide,
    .profile-card-subrow,
    .full-width-row {
        max-width: 99vw;
    }

    .subrow-half {
        min-width: 180px;
        max-width: 99vw;
    }

    .timeline-container {
        max-width: 100vw;
    }
}

@media (max-width: 750px) {
    .profile-card-subrow {
        flex-direction: column;
    }

    .subrow-half {
        width: 100%;
    }
}

/* Center Section Helper */
.section-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    max-width: 1140px;
}

.adoption-header {
    margin-top: 32px;
    margin-bottom: 26px;
    text-align: center;
}

/* Adoption form center fix */
.adoption-form {
    max-width: 700px;
    margin: 22px auto 24px auto;
}

/* --- Controls --- */

.search-input {
    flex: 1;
    padding: 14px 18px;
    margin: 10px;
    border-radius: 14px;
    border: 1px solid #efeff2;
    background: #fff;
    font-size: 1.08rem;
    box-shadow: 0 2px 20px rgba(230, 197, 218, 0.08);
}

/* --- Timeline --- */

.timeline {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    list-style: none;
    padding: 10px;
    margin: 0;
    position: relative;
}

.timeline-step {
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 6px;
    background-color: #f9f9f9;
    text-align: center;
}

.timeline-dot {
    width: 25px;
    height: 25px;
    background: #f9e0e4;
    border: 4px solid #535875;
    border-radius: 50%;
    margin: 0 auto;
    z-index: 2;
    position: relative;
    box-shadow: 0 2px 10px rgba(60, 60, 60, 0.07);
    opacity: 0.8;
    transition: opacity 0.2s;
}


.timeline-label {
    font-weight: 700;
    font-size: 1.09rem;
    color: #4c5069;
    margin-bottom: 2px;
    letter-spacing: 0.6px;
    display: block;
}

.timeline-date {
    font-size: 0.98rem;
    color: #938fa3;
    letter-spacing: 0.4px;
    display: block;
}

.timeline-time {
    font-size: 0.93rem;
    color: #b198c7;
    margin-top: 2px;
    display: block;
}


/* --- Card Standardisation --- */
.adoption-card,
.list-card,
.timeline-container {
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 10px 34px rgba(60, 60, 60, 0.08);
    padding: 24px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.list-card {
    margin-bottom: 18px;
}

/* --- Carousel and Image --- */
.carousel-container {
    width: 100%;
    aspect-ratio: 16/9;
    max-width: 100%;
    margin: 0 auto 14px auto;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border-radius: 16px;
    background: #fcf2f7;
    box-shadow: 0 8px 32px rgba(233, 211, 229, 0.05);
}

/* --- Arrows --- */
.arrow-btn,
.carousel-arrow {
    min-width: 38px;
    min-height: 38px;
    max-width: 38px;
    max-height: 38px;
    border-radius: 50%;
    background: #fff;
    color: #7a80a9;
    border: 2px solid #f0e9f2;
    box-shadow: 0 2px 12px rgba(60, 75, 110, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    padding: 0;
    margin: 0 6px;
    transition: background 0.13s, color 0.13s;
    cursor: pointer;
}

.arrow-btn[disabled],
.carousel-arrow[disabled] {
    opacity: 0.36;
    background: #fcfcfc;
    color: #aaa;
    cursor: not-allowed;
}

.arrow-icon {
    pointer-events: none;
    font-size: 1.55rem;
}

/* --- Thumbnails --- */

.thumb {
    border-radius: 8px;
    overflow: hidden;
    width: 56px;
    height: 40px;
    padding: 2px;
    background: rgba(255, 255, 255, 0.8);
    border: 2px solid transparent;
}

/* --- Cat Info --- */
.cat-info {
    flex-grow: 1;
    overflow: hidden;
}

.cat-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
}

.status-pill.available {
    background: #e6fff6;
    border-color: #c7d7d1;
    color: #2d7966;
}

.status-pill.pending {
    background: #fff5e6;
    border-color: #f4dcc7;
    color: #a56b1f;
}

.status-pill.adopted {
    background: #f4f4f6;
    border-color: #e9eaf3;
    color: #868;
}


.meta-row {
    display: flex;
    gap: 16px;
    color: #5f55c1;
    font-weight: 600;
    margin-top: 12px;
    font-size: 1.03rem;
    letter-spacing: 0.02em;
}

/* --- Action Buttons --- */
.button-row {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    flex-wrap: wrap;
    justify-content: flex-start;
}

/* --- Standard Action and Main Buttons --- */
.action-btn,
.main-btn {
    min-width: 130px;
    max-width: 200px;
    height: 48px;
    border-radius: 12px;
    font-size: 1.08rem;
    font-weight: 700;
    padding: 0 20px;
    background: #e4e5fb;
    color: #6f80a9;
    border: 2px solid #d7d9ef;
    transition: background 0.14s, color 0.14s;
    cursor: pointer;
    margin-bottom: 0;
}

.action-btn:hover,
.main-btn:hover {
    background: #d1d5f5;
    color: #474e75;
}

.action-btn:disabled,
.main-btn:disabled,
.pawsitive-btn:disabled {
    background: #f8f6fc !important;
    color: #bcbcc8 !important;
    cursor: not-allowed;
}

.pawsitive-btn, .pawsitive-btn-outline {
    width: auto !important;
    min-width: 130px;
    max-width: 200px;
    padding: 0 20px !important;
}

/* Main action btn (primary) */

.main-btn.outline {
    background: transparent;
    color: #7582cf;
    border: 2px solid #7582cf;
}

/* --- Rating & Notes --- */
.notes-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    margin-top: 14px;
    width: 100%;
}

.rating .star {
    font-size: 1.10rem;
    color: #e6e7ea;
}

.rating .star.filled {
    color: #f7b267;
}

.small-note small {
    font-size: 0.96rem;
    color: #938fa3;
}

/* --- Adoption Form --- */

.app-form {
    margin-top: 42px;
    margin-bottom: 36px;
}

.form-group {
    margin-bottom: 20px;
}

.form-label.big.center,
.form-label.center {
    text-align: center;
    font-size: 1.28rem;
    margin-bottom: 20px;
    width: 100%;
}

.margin-bottom {
    margin-bottom: 28px;
}

.radio-group {
    display: flex;
    gap: 16px;
    margin-top: 8px;
    font-size: 1.05rem;
}

.form-row.center-buttons {
    display: flex;
    justify-content: center;
    padding: 5px;
    gap: 14px;
    width: 100%;
    margin-top: 12px;
}

/* Make sure select and textarea are full width */
.app-form select,
.app-form textarea,
.app-form input[type="number"] {
    font-size: 1.03rem;
    padding: 12px;
    border-radius: 7px;
    border: 1.2px solid #ece2ef;
    background: #f6f4fc;
    width: 100%;
    box-sizing: border-box;
    margin-top: 4px;
}

.app-form input[type="number"] {
    width: 120px;
}

@media (max-width: 700px) {
    .app-form {
        margin-bottom: 30px;
    }
}

.form-label {
    width: 100%;
    text-align: left;
    font-weight: 700;
    font-size: 1.08rem;
    margin-bottom: 8px;
    color: #655691;
}

.reason-input {
    width: 100%;
    margin: 10px 0 14px 0;
    padding: 15px;
    border-radius: 12px;
    border: 1px solid #ede1ef;
    background: #f8f2f7;
    font-size: 1.03rem;
}

.form-row {
    display: flex;
    gap: 10px;
    width: 100%;
    margin-top: 4px;
}

/* --- List Panel --- */

.all-cats-card {
    height: 150px;
    overflow-y: auto;
    /* vertical scroll if content overflows */
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fff;
}

.cat-list {
    margin: 0;
    padding: 0;
    list-style: none;
}

.cat-list-item {
    display: flex;
    gap: 12px;
    padding: 8px 4px;
    border-bottom: 1px solid #eee;
}

.cat-thumbnail {
    width: 70px;
    height: 70px;
    object-fit: cover;
    border-radius: 6px;
}

.cat-list li {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 12px;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.13s;
    background: #f9f5fc;
    box-shadow: 0 1px 5px rgba(160, 140, 180, 0.04);
}

.cat-list li.selected {
    background: linear-gradient(90deg, #eae5f7, #fff);
    border: 1px solid #e3eaf8;
}

.cat-list img {
    width: 64px;
    height: 48px;
    object-fit: cover;
    border-radius: 8px;
}

.list-info {
    flex: 1;
}

.list-name {
    font-weight: 700;
    color: #4c5069;
    font-size: 1.08rem;
}

.list-sub {
    font-size: 1.01rem;
    color: #8f7db1;
}

.list-right {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
}

.list-status {
    font-size: 0.94rem;
    font-weight: 600;
    color: #b198c7;
}

.mini-fav {
    background: transparent;
    border: none;
    font-size: 1.16rem;
    color: #eb88ae;
    cursor: pointer;
}

/* --- Modal --- */
.modal-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(60, 60, 60, 0.46);
    z-index: 2000;
}

.modal {
    background: #fff;
    border-radius: 18px;
    padding: 28px;
    min-width: 320px;
    max-width: 560px;
    box-shadow: 0 12px 48px rgba(30, 30, 30, 0.28);
}

.modal h3 {
    margin-top: 0;
    color: #655691;
}

.modal label {
    display: block;
    margin: 10px 0;
    font-weight: 700;
    color: #534585;
}

.modal input,
.modal textarea {
    width: 100%;
    padding: 10px;
    border-radius: 9px;
    border: 1px solid #ede1ef;
    margin-top: 7px;
    font-size: 1.03rem;
}

.modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 18px;
}

/* --- Success Popup --- */
.success-overlay {
    position: fixed;
    inset: 0;
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
    box-shadow: 0 6px 44px rgba(60, 60, 60, 0.20);
    padding: 30px;
    min-width: 260px;
    text-align: center;
    color: #6e608c;
}

/* --- Transitions --- */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Scrolling Background */
.scroll-bg-container {
    transition: background-color 0.5s ease;
    background-color: var(--pink);
}

.background-changed {
    background-color: var(--blue);
}

/* 1. Ensure these forms match profile card full width */
.adoption-form.profile-card-wide,
.app-form.profile-card-wide .timeline-bg {
    width: 100%;
    max-width: 960px;
    margin-left: auto;
    margin-right: auto;
}

.timeline-bg {
    width: 100%;
    box-sizing: border-box;
    padding: 20px;
    margin-bottom: 36px;
}

.timeline {
    width: 100%;
}

/* 2. Framed photo */
.framed-image {
    width: 100%;
    aspect-ratio: 3/2;
    border: 4px solid black;
    border-radius: 18px;
    overflow: hidden;
    margin-bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Responsive support */
@media (max-width:1020px) {

    .adoption-form.profile-card-wide,
    .app-form.profile-card-wide {
        max-width: 95vw;
    }

    .timeline-step {
        min-height: 135px;
        font-size: 0.9rem;
    }
}

.form-group {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 20px;
    width: 100%;
}

.form-group>label {
    margin-bottom: 7px;
}

.form-group input[type="number"] {
    width: 100% !important;
    max-width: 180px;
    margin-top: 4px;
}

.app-form textarea,
.app-form select,
.app-form input[type="number"],
.radio-group {
    width: 100%;
    max-width: 100%;
}

.radio-group {
    display: flex;
    gap: 24px;
    margin-top: 7px;
}

.cat-image {
    width: 150%;
    height: 150%;
    object-fit: cover;
    border-radius: 14px;
    display: block;
}

/* New: All main card content (name, desc, status) below preview row */
.cat-text-content {
    width: 100%;
    margin: 14px 0 0 0;
}

.cat-header-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 18px;
    gap: 24px;
}

.cat-main-id {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1;
}

.cat-name {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.1;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.cat-breed-age {
    margin: 2px 0 6px;
    font-size: 13px;
    color: #666;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.cat-desc {
    font-size: 12px;
    color: #444;
    line-height: 1.2;
    max-height: 34px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.thumb-strip-horizontal {
    display: flex;
    gap: 10px;
    margin-top: 2px;
}

.thumb {
    border: 2px solid transparent;
    border-radius: 8px;
    width: 44px;
    height: 32px;
    background: #fff;
    cursor: pointer;
    transition: border-color .13s;
}

.thumb.active {
    border-color: #7582cf;
}

.thumb img {
    width: 100%;
    height: 100%;
    border-radius: 7px;
    object-fit: cover;
}

.cat-header-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    min-width: 80px;
}

.status-pill {
    padding: 9px 15px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1.07rem;
    border: 2px solid #e9eaf3;
    background: #e6fff6;
    color: #2d7966;
    box-shadow: 0 1px 8px rgba(128, 128, 128, 0.08);
}

.fav-badge {
    font-size: 1.32rem;
    background: #fff;
    border: 2px solid #e5e4fc;
    border-radius: 8px;
    color: #e478b6;
    padding: 6px 14px;
    cursor: pointer;
    transition: background .13s;
}

.card-details-popup {
    width: 100%;
    max-width: 95vw;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.cat-details {
    background: white;
    max-width: 99vw;
    border-radius: 14px;
    box-shadow: 0 2px 14px rgba(229, 205, 218, 0.10);
    padding: 24px 28px 18px 28px;
    margin-bottom: 20px;
    width: 100%;
    box-sizing: border-box;
    font-size: 1.09rem;
}

.close-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
}

.close-btn {
    padding: 8px 22px;
    color: #655691;
    background: #f7e6f4;
    border-radius: 8px;
    border: none;
    font-weight: 700;
    cursor: pointer;
    font-size: 1.08rem;
}
</style>