<script setup>
<<<<<<< Updated upstream
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
=======
import { ref, reactive, computed } from 'vue'; // Import Vue's reactivity API
import Navbar from '@/components/resuables/Navbar.vue'; // Navigation bar component
import BottomFooter from '@/components/resuables/BottomFooter.vue'; // Footer component
>>>>>>> Stashed changes

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

const cats = ref([
{
        name: "Peoni",
        age: 7,
        breed: "British Shorthair",
        gender: "Female",
        vaccinated: true,
        status: "Available",
        desc: "Peoni is cute and cuddly",
        images: ['/cat1.png', '/cat2.png', '/cat3.png'],
        favorite: false,
        rating: 4,
        notes: "Loves naps near windows.",
        microchipped: true,
        fee: 120
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
        favorite: false,
        rating: 5,
        notes: "Shy at first but affectionate with treats.",
        microchipped: false,
        fee: 100
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
        favorite: false,
        rating: 3,
        notes: "Very playful. Needs space to climb.",
        microchipped: true,
        fee: 140
    }, 
    {
        name: "Luna",
        age: 4,
        breed: "Siamese",
        gender: "Female",
        vaccinated: true,
        status: "Available",
        desc: "Luna is playful and loves attention.",
        images: ['/cat4.png', '/cat5.png', '/cat6.png'],
        favorite: false,
        rating: 5,
        notes: "Enjoys sunbathing by the window.",
        microchipped: true,
        fee: 110
    },
    {
        name: "Max",
        age: 3,
        breed: "Bengal",
        gender: "Male",
        vaccinated: true,
        status: "Pending",
        desc: "Max is energetic and curious.",
        images: ['/cat7.png', '/cat8.png', '/cat9.png'],
        favorite: false,
        rating: 4,
        notes: "Needs space to run and climb.",
        microchipped: true,
        fee: 130
    },
]);

<<<<<<< Updated upstream
=======
// Cat Adoption Timeline (unchanged)
>>>>>>> Stashed changes
const adoptionTimeline = [
    { label: "Fill in Application Form", date: "31 Oct", time: "10:00 AM" },
    { label: "Center Processes Application", date: "01 Nov ~ 07 Nov", time: "5-7 Days" },
    { label: "Schedule Meet and Greet", date: "08 Nov", time: "2:00 PM" },
    { label: "Cat Vaccinations", date: "09 Nov", time: "10:30 AM" },
    { label: "Monitoring Period", date: "11 Nov ~ 15 Nov", time: "5-7 Days" },
    { label: "Cat Pickup", date: "16 Nov", time: "11:00 AM" },
];

<<<<<<< Updated upstream
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
=======
// Adoption Form Reactive State
const form = reactive({
  reason: '',
  havePets: '',
  petsDetails: '',
  surrenderedBefore: '',
  surrenderReason: '',
  allergies: '',
  homeType: '',
  landlordPermission: '',
  landlordProof: '',
  dailySchedule: '',
  catAloneHours: null,
  indoorOutdoor: '',
  safetyMeasures: '',
  financialPrepared: '',
  specialNeedsAcceptance: '',
  researchedCare: '',
});

// Validation errors reactive state
const errors = reactive({});

// Validation rules
function validateForm() {
  errors.reason = form.reason.trim() ? '' : 'Please provide your reason.';
  errors.havePets = form.havePets ? '' : 'Please select if you have pets.';
  errors.petsDetails = form.havePets === 'yes' && !form.petsDetails.trim() ? 'Please describe your current pets.' : '';
  errors.surrenderedBefore = form.surrenderedBefore ? '' : 'Please select if you surrendered pets before.';
  errors.surrenderReason = form.surrenderedBefore === 'yes' && !form.surrenderReason.trim() ? 'Please provide surrender reason.' : '';
  errors.allergies = form.allergies ? '' : 'Please specify if anyone has allergies.';
  errors.homeType = form.homeType ? '' : 'Please select your home ownership.';
  errors.landlordPermission = form.homeType === 'rent' && !form.landlordPermission ? 'Please specify landlord permission.' : '';
  errors.landlordProof = form.landlordPermission === 'yes' && !form.landlordProof.trim() ? 'Please provide landlord permission proof.' : '';
  errors.dailySchedule = form.dailySchedule.trim() ? '' : 'Please describe your daily schedule.';
  errors.catAloneHours = form.catAloneHours !== null && form.catAloneHours !== '' && !isNaN(form.catAloneHours) && form.catAloneHours >= 0 ? '' : 'Please enter valid hours cat will be alone.';
  errors.indoorOutdoor = form.indoorOutdoor ? '' : 'Please select cat indoor/outdoor preference.';
  errors.safetyMeasures = form.safetyMeasures.trim() ? '' : 'Please explain safety measures.';
  errors.financialPrepared = form.financialPrepared ? '' : 'Please confirm financial preparedness.';
  errors.specialNeedsAcceptance = form.specialNeedsAcceptance ? '' : 'Please confirm acceptance of special needs cat.';
  errors.researchedCare = form.researchedCare ? '' : 'Please confirm research on cat care.';

  // Return true if no errors
  return Object.values(errors).every(e => e === '');
}

const currentQuestionIndex = ref(0);

const questions = [
  {
    id: 'reason',
    type: 'textarea',
    label: "1. Why do you want to adopt a cat? *",
    placeholder: '',
    required: true,
  },
  {
    id: 'havePets',
    type: 'radio',
    label: '2. Do you currently have pets? *',
    options: ['yes', 'no'],
    required: true,
  },
  {
    id: 'petsDetails',
    type: 'textarea',
    label: 'Please describe your pets (species, ages, health, temperament) *',
    required: true,
    conditionalOn: { field: 'havePets', value: 'yes' }
  },
  {
    id: 'surrenderedBefore',
    type: 'radio',
    label: '3. Have you ever surrendered or rehomed a pet? *',
    options: ['yes', 'no'],
    required: true,
  },
  {
    id: 'surrenderReason',
    type: 'textarea',
    label: 'Please provide reason for surrender *',
    required: true,
    conditionalOn: { field: 'surrenderedBefore', value: 'yes' }
  },
  {
    id: 'allergies',
    type: 'radio',
    label: '4. Does anyone in your household have allergies to cats or other animals? *',
    options: ['yes', 'no'],
    required: true,
  },
  {
    id: 'homeType',
    type: 'radio',
    label: '5. Do you own or rent your home? *',
    options: ['own', 'rent'],
    required: true,
  },
  {
    id: 'landlordPermission',
    type: 'radio',
    label: 'Does your landlord allow pets? *',
    options: ['yes', 'no'],
    required: true,
    conditionalOn: { field: 'homeType', value: 'rent' }
  },
  {
    id: 'landlordProof',
    type: 'text',
    label: 'Please provide proof of landlord permission *',
    placeholder: 'e.g. lease agreement clause',
    required: true,
    conditionalOn: { field: 'landlordPermission', value: 'yes' }
  },
  {
    id: 'dailySchedule',
    type: 'textarea',
    label: '6. Describe your typical daily schedule and how many hours the cat will be alone each day? *',
    placeholder: 'e.g. at work 9am-6pm, home evenings',
    required: true,
  },
  {
    id: 'catAloneHours',
    type: 'number',
    label: 'Hours cat will be alone daily *',
    required: true,
    min: 0,
  },
  {
    id: 'indoorOutdoor',
    type: 'radio',
    label: '7. Will the cat be indoor only, outdoor only, or indoor/outdoor? *',
    options: ['indoor', 'outdoor', 'indoorOutdoor'],
    required: true,
  },
  {
    id: 'safetyMeasures',
    type: 'textarea',
    label: "How will you ensure the cat's safety? *",
    required: true,
  },
  {
    id: 'financialPrepared',
    type: 'radio',
    label: '8. Are you financially prepared to cover routine and emergency vet care, food, and supplies? *',
    options: ['yes', 'no'],
    required: true,
  },
  {
    id: 'specialNeedsAcceptance',
    type: 'radio',
    label: '9. Are you willing to adopt a cat with medical or behavioral needs? *',
    options: ['yes', 'no'],
    required: true,
  },
  {
    id: 'researchedCare',
    type: 'radio',
    label: '10. Have you researched proper cat care including vaccinations, spaying/neutering, and enrichment? *',
    options: ['yes', 'no'],
    required: true,
  },
];

const submitAttempted = ref(false);

function isQuestionVisible(question) {
  if (!question.conditionalOn) return true;
  const { field, value } = question.conditionalOn;
  return form[field] === value;
}
function isQuestionVisible(question) {
  if (!question.conditionalOn) return true;
  const { field, value } = question.conditionalOn;
  return form[field] === value;
}

function goNext() {
  // Validate current question field first
  const q = visibleQuestions.value[currentQuestionIndex.value];
  if (!validateCurrentQuestion(q)) return;

  // If last question, submit
  if (currentQuestionIndex.value >= visibleQuestions.value.length -1) {
    handleformSubmit();
  } else {
    currentQuestionIndex.value++;
    // Scroll top smoothly after next tick
    nextTick(() => {
      const el = document.querySelector('.question-wrapper');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

// Validate only current question field
function validateCurrentQuestion(question) {
  const field = question.id;
  const val = form[field];
  let error = '';
  if(question.required) {
    if(val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
      error = 'This field is required';
    } else if (field === 'catAloneHours' && (isNaN(val) || val < 0)) {
      error = 'Please enter valid number >= 0';
    }
  }
  errors[field] = error;
  return !error;
}

const visibleQuestions = computed(() => questions.filter(isQuestionVisible));

const submitAttempted = ref(false);
function handleformSubmit() {
  submitAttempted.value = true;
  let allValid = true;
  visibleQuestions.value.forEach(q => {
    if (!validateCurrentQuestion(q)) allValid = false;
  });
  if (allValid) {
    alert('Application submitted successfully!');
    // further submission logic here
  } else {
    alert('Please fix errors before submitting.');
  }
}

function handleformSubmit() {
  submitAttempted.value = true;
  if (validateForm()) {
    alert('Application submitted successfully!');
    // further submission logic here
  } else {
    alert('Please fix errors before submitting.');
  }
}

// Reactive state management (unchanged)
const adoptionReason = ref('');
const currentIndex = ref(0);
const carouselIndex = ref(0);
const showSuccess = ref(false);

function nextCat() {
    if (currentIndex.value < cats.length - 1) {
        currentIndex.value++;
        carouselIndex.value = 0;
>>>>>>> Stashed changes
    }
  } catch (e) {}

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
  } catch (e) {}
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

<<<<<<< Updated upstream
function handleIndicateInterest() {
  showApplicationForm.value = true;
  nextTick(() => {
    applicationFormRef.value?.scrollIntoView({ behavior: 'smooth' });
  });
}

function submitApplication() {
  showSuccessPopup('Application Submitted', 'Thank you for your interest! Our team will review your application.');
  showApplicationForm.value = false;
  scrolledPast.value = false;
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
=======
function prevCat() {
    if (currentIndex.value > 0) {
        currentIndex.value--;
        carouselIndex.value = 0;
    }
}

function toggleFavorite(cat) {
    cat.favorite = !cat.favorite;
}

function nextPhoto() {
    const cat = cats[currentIndex.value];
    if (carouselIndex.value < cat.images.length - 1) {
        carouselIndex.value++;
    }
}

function prevPhoto() {
    const cat = cats[currentIndex.value];
    if (cat && carouselIndex.value > 0) {
        carouselIndex.value--;
    }
}

function handleSubmit(event) {
    event.preventDefault();
    showSuccess.value = true;
    setTimeout(() => showSuccess.value = false, 2500);
}
>>>>>>> Stashed changes
</script>

<template>
    <Navbar>
        <template v-slot:navbar-title>Adoption</template>
    </Navbar>

<<<<<<< Updated upstream
    <div ref="containerRef" :class="['scroll-bg-container', { 'background-changed': scrolledPast }]"
        style="min-height: 100vh; overflow-y: auto;">
        <!-- 1. Centered header -->
        <div class="adoption-header full-center">Adopt Your Cats Here</div>

        <!-- 2 & 3. Swapped & buttonified "Vaccinated Only", Sort moved right -->
        <div class="section-center">
            <div class="controls-row full-width-row">
                <input v-model="searchQuery" class="search-input" placeholder="Search by name or breed..."
                    aria-label="Search cats" />
                <div class="select-group">
                    <select v-model="statusFilter" aria-label="Filter by status">
                        <option value="">All statuses</option>
                        <option value="Available">Available</option>
                        <option value="Pending">Pending</option>
                        <option value="Adopted">Adopted</option>
                    </select>
                    <!-- Vaccinated Only UI as toggle button -->
                    <button type="button" class="filter-btn" :class="{ checked: vaccinatedOnly }"
                        @click="vaccinatedOnly = !vaccinatedOnly">
                        Vaccinated Only
                    </button>
                    <!-- Sort moved rightmost -->
                    <select v-model="sortOption" aria-label="Sort cats">
                        <option value="default">Sort: Default</option>
                        <option value="age-asc">Age ↑</option>
                        <option value="age-desc">Age ↓</option>
                        <option value="name-asc">Name A→Z</option>
                        <option value="name-desc">Name Z→A</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Timeline, now with encapsulating background -->
        <div class="section-center">
            <div class="timeline-bg">
                <div class="timeline-container full-width-row">
                    <ul class="timeline">
                        <li v-for="(step, index) in adoptionTimeline" :key="index" class="timeline-step"
                            :aria-label="`${step.label}, ${step.date}, ${step.time}`">
                            <div class="timeline-dot" :class="{ active: index === timelineProgress }"></div>
                            <div class="timeline-content">
                                <span class="timeline-label">{{ step.label }}</span>
                                <br />
                                <span class="timeline-date">{{ step.date }}</span>
                                <span class="timeline-time">{{ step.time }}</span>
                            </div>
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
                                    :class="{ active: idx === carouselIndex }" @click="carouselIndex = idx"
                                    :aria-label="`Show photo ${idx + 1}`">
                                    <img :src="img" :alt="`Thumbnail ${idx + 1}`" />
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
                        <button class="action-btn" @click="showDetails = !showDetails" :aria-expanded="showDetails">
                            {{ showDetails ? 'Hide Details' : 'Show Details' }}
                        </button>
                        <button class="action-btn" @click="openBookingModal"
                            :disabled="currentCat.status !== 'Available'">
                            Schedule Visit
                        </button>
                        <button class="action-btn" @click="openContactModal">Contact Center</button>
                        <button class="action-btn" @click="shareProfile">Share</button>
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
                <h3 class="details-title">{{ currentCat.name }}'s Details</h3>
                <p><strong>Breed:</strong> {{ currentCat.breed }}</p>
                <p><strong>Gender:</strong> {{ currentCat.gender }}</p>
                <p><strong>Vaccinated:</strong> {{ currentCat.vaccinated ? 'Yes' : 'No' }}</p>
                <p><strong>Status:</strong> {{ currentCat.status }}</p>
                <p><strong>Age:</strong> {{ currentCat.age }} years</p>
                <p><strong>Microchipped:</strong> {{ currentCat.microchipped ? 'Yes' : 'No' }}</p>
                <p><strong>Adoption Fee:</strong> {{ currentCat.fee ? `$${currentCat.fee}` : 'TBD' }}</p>
                <div class="close-row">
                    <button class="close-btn" @click="showDetails = false">Close</button>
                </div>
            </div>
=======
    <div class="adoption-header">Adopt Your Cats Here</div>

    <div class="adoption-bg">

        <!-- Timeline -->
        <div class="timeline-container">
            <ul class="timeline">
                <li v-for="(step, index) in adoptionTimeline" :key="index" class="timeline-step">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <span class="timeline-label">{{ step.label }}</span>
                        <span class="timeline-date">{{ step.date }}</span>
                        <span class="timeline-time">{{ step.time }}</span>
                    </div>
                </li>
            </ul>
        </div>

        <!-- Main Layout -->
        <div class="card-row">

            <!-- Prev Btn -->
            <button class="arrow-btn" @click="prevCat" :disabled="currentIndex === 0">&#8592;</button>

            <!-- Adoption Card Left -->
            <div class="adoption-card">
                <div class="carousel-container">
                    <img :src="cats[currentIndex].images[carouselIndex]" alt="Cat photo" class="cat-image" />
                    <button class="carousel-arrow left" @click="prevPhoto" :disabled="carouselIndex === 0" aria-label="Previous photo">‹</button>
                    <button class="carousel-arrow right" @click="nextPhoto" :disabled="carouselIndex === cats[currentIndex].images.length -1" aria-label="Next photo">›</button>
                </div>
            </div>

            <!-- Right Side: cat-info top, cat-status bottom -->
            <div class="right-side-grid">

                <!-- Cat Info Top -->
                <div class="cat-info">
                    <h2 class="cat-name">{{ cats[currentIndex].name }}, {{ cats[currentIndex].age }}</h2>
                    <p class="cat-desc">{{ cats[currentIndex].desc }}</p>
                </div>

                <!-- Status and Favourite Bottom -->
                <div class="status-fav-wrapper">
                    <div class="cat-status">{{ cats[currentIndex].status }}</div>
                    <button @click="toggleFavorite(cats[currentIndex])" class="fav-btn">
                        <span v-if="cats[currentIndex].favorite">♥</span>
                        <span v-else>♡</span>
                    </button>
                </div>

                <!-- Cat Details always below the above grid items -->
                <div class="cat-details-full">
                    <p><strong>Breed:</strong> {{ cats[currentIndex].breed }}</p>
                    <p><strong>Gender:</strong> {{ cats[currentIndex].gender }}</p>
                    <p><strong>Vaccinated:</strong> {{ cats[currentIndex].vaccinated ? 'Yes' : 'No' }}</p>
                    <p><strong>Status:</strong> {{ cats[currentIndex].status }}</p>
                </div>
            </div>

            <!-- Next Btn -->
            <button class="arrow-btn" @click="nextCat" :disabled="currentIndex === cats.length - 1">&#8594;</button>
>>>>>>> Stashed changes
        </div>
    <!-- New Adoption Form -->
    <form @submit.prevent="handleSubmit" novalidate>
    <!-- Why adopt -->
    <label>
      1. Why do you want to adopt a cat? *
      <textarea v-model="form.reason" rows="3"></textarea>
      <span v-if="submitAttempted && errors.reason" class="error">{{ errors.reason }}</span>
    </label>

<<<<<<< Updated upstream
        <div class="profile-card-subrow full-width-row">
            <div class="list-card subrow-half">
                <h3>All Cats</h3>
                <ul class="cat-list">
                    <li v-for="(cat, idx) in filteredAndSorted" :key="cat.name + idx"
                        :class="{ selected: idx === currentIndex }" @click="selectCatByFilteredIndex(idx)" role="button"
                        tabindex="0">
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
            <div class="list-card subrow-half">
                <h4>Quick Help</h4>
                <p>Phone: +65 6123 4567</p>
                <p>Email: adopt@catshelter.sg</p>
                <button class="main-btn outline" @click="openContactModal">Contact Us</button>
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
                <button type="button" class="main-btn" @click="handleIndicateInterest">Indicate Interest</button>
                <button type="button" class="main-btn outline" @click="openContactModal">Ask a Question</button>
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
                <button type="submit" class="main-btn">Submit Application</button>
                <button type="button" class="main-btn outline"
                    @click="showApplicationForm = false; scrolledPast = false;">
                    Cancel
                </button>
            </div>
        </form>
    </div>


=======
    <!-- Pets currently -->
    <fieldset>
      <legend>2. Do you currently have pets? *</legend>
      <label><input type="radio" value="yes" v-model="form.havePets" /> Yes</label>
      <label><input type="radio" value="no" v-model="form.havePets" /> No</label>
      <span v-if="submitAttempted && errors.havePets" class="error">{{ errors.havePets }}</span>
    </fieldset>
    <label v-if="form.havePets === 'yes'">
      Please describe your pets (species, ages, health, temperament) *
      <textarea v-model="form.petsDetails" rows="3"></textarea>
      <span v-if="submitAttempted && errors.petsDetails" class="error">{{ errors.petsDetails }}</span>
    </label>

    <!-- Surrendered pets before -->
    <fieldset>
      <legend>3. Have you ever surrendered or rehomed a pet? *</legend>
      <label><input type="radio" value="yes" v-model="form.surrenderedBefore" /> Yes</label>
      <label><input type="radio" value="no" v-model="form.surrenderedBefore" /> No</label>
      <span v-if="submitAttempted && errors.surrenderedBefore" class="error">{{ errors.surrenderedBefore }}</span>
    </fieldset>
    <label v-if="form.surrenderedBefore === 'yes'">
      Please provide reason for surrender *
      <textarea v-model="form.surrenderReason" rows="2"></textarea>
      <span v-if="submitAttempted && errors.surrenderReason" class="error">{{ errors.surrenderReason }}</span>
    </label>

    <!-- Allergies -->
    <fieldset>
      <legend>4. Does anyone in your household have allergies to cats or other animals? *</legend>
      <label><input type="radio" value="yes" v-model="form.allergies" /> Yes</label>
      <label><input type="radio" value="no" v-model="form.allergies" /> No</label>
      <span v-if="submitAttempted && errors.allergies" class="error">{{ errors.allergies }}</span>
    </fieldset>

    <!-- Home type -->
    <fieldset>
      <legend>5. Do you own or rent your home? *</legend>
      <label><input type="radio" value="own" v-model="form.homeType" /> Own</label>
      <label><input type="radio" value="rent" v-model="form.homeType" /> Rent</label>
      <span v-if="submitAttempted && errors.homeType" class="error">{{ errors.homeType }}</span>
    </fieldset>

    <fieldset v-if="form.homeType === 'rent'">
      <legend>Does your landlord allow pets? *</legend>
      <label><input type="radio" value="yes" v-model="form.landlordPermission" /> Yes</label>
      <label><input type="radio" value="no" v-model="form.landlordPermission" /> No</label>
      <span v-if="submitAttempted && errors.landlordPermission" class="error">{{ errors.landlordPermission }}</span>
      <label v-if="form.landlordPermission === 'yes'">
        Please provide proof of landlord permission *
        <input type="text" v-model="form.landlordProof" placeholder="e.g. lease agreement clause" />
        <span v-if="submitAttempted && errors.landlordProof" class="error">{{ errors.landlordProof }}</span>
      </label>
    </fieldset>

    <!-- Daily schedule -->
    <label>
      6. Describe your typical daily schedule and how many hours the cat will be alone each day? *
      <textarea v-model="form.dailySchedule" rows="2" placeholder="e.g. at work 9am-6pm, home evenings">
      </textarea>
      <span v-if="submitAttempted && errors.dailySchedule" class="error">{{ errors.dailySchedule }}</span>
    </label>
    <label>
      Hours cat will be alone daily *
      <input type="number" min="0" v-model.number="form.catAloneHours" />
      <span v-if="submitAttempted && errors.catAloneHours" class="error">{{ errors.catAloneHours }}</span>
    </label>

    <!-- Indoor/outdoor -->
    <fieldset>
      <legend>7. Will the cat be indoor only, outdoor only, or indoor/outdoor? *</legend>
      <label><input type="radio" value="indoor" v-model="form.indoorOutdoor" /> Indoor Only</label>
      <label><input type="radio" value="outdoor" v-model="form.indoorOutdoor" /> Outdoor Only</label>
      <label><input type="radio" value="indoorOutdoor" v-model="form.indoorOutdoor" /> Indoor & Outdoor</label>
      <span v-if="submitAttempted && errors.indoorOutdoor" class="error">{{ errors.indoorOutdoor }}</span>
    </fieldset>
    <label>
      How will you ensure the cat's safety? *
      <textarea v-model="form.safetyMeasures" rows="2">
      </textarea>
      <span v-if="submitAttempted && errors.safetyMeasures" class="error">{{ errors.safetyMeasures }}</span>
    </label>

    <!-- Financial -->
    <fieldset>
      <legend>8. Are you financially prepared to cover routine and emergency vet care, food, and supplies? *</legend>
      <label><input type="radio" value="yes" v-model="form.financialPrepared" /> Yes</label>
      <label><input type="radio" value="no" v-model="form.financialPrepared" /> No</label>
      <span v-if="submitAttempted && errors.financialPrepared" class="error">{{ errors.financialPrepared }}</span>
    </fieldset>

    <!-- Special needs -->
    <fieldset>
      <legend>9. Are you willing to adopt a cat with medical or behavioral needs? *</legend>
      <label><input type="radio" value="yes" v-model="form.specialNeedsAcceptance" /> Yes</label>
      <label><input type="radio" value="no" v-model="form.specialNeedsAcceptance" /> No</label>
      <span v-if="submitAttempted && errors.specialNeedsAcceptance" class="error">{{ errors.specialNeedsAcceptance }}</span>
    </fieldset>

    <!-- Research -->
    <fieldset>
      <legend>10. Have you researched proper cat care including vaccinations, spaying/neutering, and enrichment? *</legend>
      <label><input type="radio" value="yes" v-model="form.researchedCare" /> Yes</label>
      <label><input type="radio" value="no" v-model="form.researchedCare" /> No</label>
      <span v-if="submitAttempted && errors.researchedCare" class="error">{{ errors.researchedCare }}</span>
    </fieldset>

    <button type="submit">Submit Application</button>
  </form>
</div>
    <!-- Success Notification -->
>>>>>>> Stashed changes
    <transition name="fade">
        <div v-if="showSuccess">
            <div class="success-overlay"></div>
            <div class="success-popup">
                <h3>{{ successTitle }}</h3>
                <p>{{ successMessage }}</p>
            </div>
        </div>
    </transition>
<<<<<<< Updated upstream
    <BottomFooter />
</template>

<style scoped>
/* Header center fix */
.full-center {
    text-align: center;
=======
    <BottomFooter></BottomFooter>
</template>

<style scoped>
.adoption-bg {
    min-height: 100vh;
    background: linear-gradient(135deg, #ffe7f7 0%, #f7faff 60%, #e0eefc 100%);
    padding: 90px 0 70px 0;
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
    border-radius: 14px;
    border: 1px solid #efeff2;
    background: #fff;
    font-size: 1.08rem;
    box-shadow: 0 2px 20px rgba(230, 197, 218, 0.08);
}

/* --- Timeline --- */
=======
>>>>>>> Stashed changes
.timeline-container {
    width: 90vw;
    max-width: 1120px;
    margin: 0 auto 18px auto;
}

.timeline {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    list-style: none;
    padding: 10px;
    margin: 0;
    position: relative;
}

.timeline-step {
    flex: 1;
    text-align: center;
    position: relative;
    min-width: 112px;
    padding: 8px 6px;
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

.timeline-dot.active {
    background: linear-gradient(180deg, #fff, #f9e0e4);
    box-shadow: 0 2px 22px rgba(57, 80, 105, 0.21);
    opacity: 1;
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

.timeline-step:not(:last-child)::after {
    content: "";
    position: absolute;
    top: 29px;
    right: -50%;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #f9e0e4 0%, #afaee9 100%);
    z-index: 1;
    border-radius: 4px;
    opacity: 0.6;
}


<<<<<<< Updated upstream
/* --- Card Standardisation --- */
.adoption-card,
.list-card {
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 10px 34px rgba(60, 60, 60, 0.08);
    padding: 24px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.adoption-form {
    margin-top: 20px;
=======
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

/* Main container with left and right parts */
.card-row {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    margin-bottom: 16px;
    gap: 20px;
    flex-wrap: wrap;
}

/* Adoption Card left half */
.adoption-card {
    background: rgba(255, 255, 255, 0.85);
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(60, 60, 60, 0.12);
    padding: 20px;
    width: 48vw;
    max-width: 700px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* Right side container uses grid with two rows: cat-info top, status-fav bottom */
.right-side-grid {
    background: rgba(255, 255, 255, 0.85);
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(60, 60, 60, 0.12);
    padding: 20px;
    width: 40vw;
    max-width: 350px;
    display: grid;
    grid-template-rows: auto auto auto;
    row-gap: 16px;
}

/* cat-info on top row */
.cat-info {
    grid-row: 1;
    text-align: left;
}

/* status and fav wrapper on second row */
.status-fav-wrapper {
    grid-row: 2;
    display: flex;
    align-items: center;
    gap: 12px;
}

/* cat-details on third row spanning full width */
.cat-details-full {
    grid-row: 3;
>>>>>>> Stashed changes
}

.list-card {
    margin-bottom: 18px;
}

/* --- Carousel and Image --- */
.carousel-container {
    width: 100%;
    aspect-ratio: 16/9;
<<<<<<< Updated upstream
    max-width: 100%;
    margin: 0 auto 14px auto;
=======
    max-width: 90vw;
    height: auto;
>>>>>>> Stashed changes
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border-radius: 16px;
    background: #fcf2f7;
    box-shadow: 0 8px 32px rgba(233, 211, 229, 0.05);
}

<<<<<<< Updated upstream
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
    text-align: left;
    width: 100%;
    margin-top: 10px;
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
.main-btn:disabled {
    background: #f8f6fc;
    color: #bcbcc8;
    cursor: not-allowed;
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
=======
.cat-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: none;
    display: block;
    background: none;
    box-shadow: none;
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

.cat-status {
    background: #f7e4ed;
    color: #6075a7;
    font-size: 1.03rem;
    font-weight: 600;
    padding: 12px 32px;
    border-radius: 12px;
    border: 2px solid #f7e4ed;
    min-width: 98px;
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    gap: 16px;
    margin-top: 8px;
    font-size: 1.05rem;
}

.form-row.center-buttons {
    display: flex;
    justify-content: center;
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
=======
    align-items: center;
    justify-content: center;
}

.fav-btn:active {
    background: #fbe1ed;
}

/* Buttons (rest unchanged) */
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
    margin: 0 auto 40px auto;
>>>>>>> Stashed changes
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
.cat-list {
    list-style: none;
    padding: 0;
    margin: 10px 0 0 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 52vh;
    overflow: auto;
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

<<<<<<< Updated upstream
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
=======
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

/* Success Message styles as before */
>>>>>>> Stashed changes
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
.app-form.profile-card-wide {
    width: 100%;
    max-width: 960px;
    margin-left: auto;
    margin-right: auto;
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

/* 3. Timeline background */
.timeline-bg {
    background: #f7f6fd;
    border-radius: 24px;
    padding: 28px 10px 22px 10px;
    margin-bottom: 36px;
    box-shadow: 0 2px 22px rgba(140, 140, 180, 0.10);
}

/* Responsive support */
@media (max-width:1020px) {

    .adoption-form.profile-card-wide,
    .app-form.profile-card-wide {
        max-width: 95vw;
    }

    .timeline-bg {
        padding: 16px 2vw;
    }
}

<<<<<<< Updated upstream
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
    font-size: 1.62rem;
    font-weight: 800;
    color: #4c5069;
    margin: 0 0 8px 0;
    letter-spacing: 1.2px;
}

.cat-desc {
    margin: 0 0 10px 0;
    color: #4c5069;
    font-size: 1.08rem;
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
=======
@media (max-width: 900px) {
    .card-row {
        flex-direction: column;
        align-items: center;
    }
    .adoption-card,
    .right-side-grid {
        width: 95vw;
        max-width: 95vw;
    }
}

form {
  max-width: 600px;
  margin: auto;
  display: flex;
  flex-direction: column;
}

label, fieldset {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.error {
  color: red;
  font-size: 0.9em;
  margin-top: 4px;
}

input[type="text"],
input[type="number"],
textarea {
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  padding: 6px 8px;
  margin-top: 6px;
  resize: vertical;
}

button[type="submit"] {
  background-color: #6075a7;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  font-size: 1.1rem;
}

button[type="submit"]:hover {
  background-color: #445c85;
}
</style>
>>>>>>> Stashed changes
