<template>
    <div class="page-wrapper pawsitive-background">
        <Navbar></Navbar>
        <div class="cat-profile container p-4 pawsitive-background" v-if="loaded">
            <div class="header">
                <h1 class="title">{{ cat.name || 'Unnamed Cat' }}</h1>
                <!-- Removed for now -->
                <!-- <div class="meta">
                <span class="badge">{{ cat.status || '—' }}</span>
                <span class="muted">•</span>
                <span class="muted">{{ cat.species || '—' }}</span>
            </div> -->
            </div>

            <div class="row layout justify-content-center align-items-start">
                <!-- LEFT: Carousel -->
                <div class="col-12 col-md-6 mb-4">
                    <section>
                        <div class="carousel" @keydown.left.prevent="prevImage" @keydown.right.prevent="nextImage"
                            tabindex="0">
                            <div class="carousel-main">
                                <img :src="currentImage" :alt="cat.name" v-if="currentImage" />
                                <div class="no-image" v-else>No image</div>

                                <button class="ctrl prev" @click="prevImage" aria-label="Previous image"><span
                                        id="left-arrow">‹</span></button>
                                <button class="ctrl next" @click="nextImage" aria-label="Next image"><span
                                        id="right-arrow">›</span></button>
                            </div>

                            <div class="thumbs" v-if="images.length > 0">
                                <img v-for="(src, i) in images" :key="i" :src="src" :class="{ active: i === index }"
                                    @click="index = i" :alt="`thumbnail ${i + 1}`" />
                            </div>
                        </div>
                    </section>
                </div>

                <!-- RIGHT: Details -->
                <div class="col-12 col-md-6">
                    <section>
                        <table class="details">
                            <tbody>
                                <tr>
                                    <th>Name</th>
                                    <td>{{ cat.name || '—' }}</td>
                                </tr>
                                <tr>
                                    <th>Age</th>
                                    <td>{{ cat.age ?? 'unknown' }}</td>
                                </tr>
                                <tr>
                                    <th>Color</th>
                                    <td>{{ cat.color || '—' }}</td>
                                </tr>
                                <tr>
                                    <th>Gender</th>
                                    <td>{{ cat.gender || 'unknown' }}</td>
                                </tr>
                                <tr>
                                    <th>Neutered</th>
                                    <td>{{ cat.neutered || 'unknown' }}</td>
                                </tr>
                                <tr>
                                    <th>Species</th>
                                    <td>{{ cat.species || 'unknown' }}</td>
                                </tr>
                                <tr>
                                    <th>Status</th>
                                    <td>{{ cat.status || '—' }}</td>
                                </tr>
                                <tr>
                                    <th>Last seen</th>
                                    <td v-if="cat.last_location">
                                        {{ latLngDisplay(cat.last_location) }}
                                        <div class="pawsitive-btn open-map-btn">
                                            <a :href="mapsLink(cat.last_location)" target="_blank"
                                                rel="noreferrer">Open in OneMap</a>
                                        </div>
                                    </td>
                                    <td v-else>—</td>
                                </tr>
                                <tr v-if="cat.description">
                                    <th>Description</th>
                                    <td>{{ cat.description }}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="actions">
                            <!-- For now no actions -->
                        </div>
                    </section>
                </div>
            </div>

        </div>

        <div v-else class="loading container p-4 pawsitive-background">
            <!-- TODO: Loading spinner? -->
            Loading...
        </div>
        <BottomFooter style="background-color: white;"></BottomFooter>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import Navbar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'

// state
const route = useRoute();
const router = useRouter();
const id = route.params.id;
const loaded = ref(false);
const cat = ref({});
const images = ref([]);
const index = ref(0);

// helpers to parse Firestore Timestamp / GeoPoint
function asDate(val) {
    if (!val) return null;
    if (val?.toDate) return val.toDate();
    if (val?.seconds) return new Date(val.seconds * 1000);
    if (val instanceof Date) return val;
    return null;
}
function formatDate(val) {
    const d = asDate(val);
    return d ? d.toLocaleString() : 'Unknown';
}
function latLngDisplay(gp) {
    if (!gp) return '';
    const lat = gp.latitude ?? gp._lat ?? gp.lat;
    const lng = gp.longitude ?? gp._long ?? gp.lng;
    if (lat == null || lng == null) return 'Unknown';
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}
function mapsLink(gp) {
    const lat = gp.latitude ?? gp._lat ?? gp.lat;
    const lng = gp.longitude ?? gp._long ?? gp.lng;
    if (lat == null || lng == null) return '#';
    return `https://www.onemap.gov.sg/main/v2/?lat=${lat}&lng=${lng}`;
    // return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

// carousel controls
const currentImage = computed(() => images.value[index.value] || null);
function prevImage() {
    if (!images.value.length) return;
    index.value = (index.value - 1 + images.value.length) % images.value.length;
}
function nextImage() {
    if (!images.value.length) return;
    index.value = (index.value + 1) % images.value.length;
}

async function loadCat() {
    try {
        if (!id) {
            console.error('No id param provided to CatProfile');
            router.push('/');
            return;
        }
        const d = await getDoc(doc(db, 'cats', id));
        if (!d.exists()) {
            console.error('Cat not found:', id);
            router.push('/');
            return;
        }
        const data = d.data();

        cat.value = {
            id: d.id,
            name: data.name ?? '',
            age: data.age ?? 'unknown',
            color: data.color ?? '',
            gender: data.gender ?? 'unknown',
            neutered: data.neutered ?? 'unknown',
            species: data.species ?? 'unknown',
            status: data.status ?? '',
            photos: Array.isArray(data.photos) ? data.photos : data.photos ? [data.photos] : [],
            description: data.description ?? data.desc ?? '',
            last_seen: data.last_seen ?? null,
            created_at: data.created_at ?? null,
            updated_at: data.updated_at ?? null,
            last_location: data.last_location ?? null,
        };

        images.value = cat.value.photos || [];
        index.value = 0;
        loaded.value = true;
    } catch (err) {
        console.error('Failed to load cat:', err);
        router.push('/');
    }
}

function goBack() {
    router.back();
}

function copyLink() {
    const url = `${window.location.origin}${router.resolve({ name: route.name || 'CatProfile', params: { id } }).href}`;
    navigator.clipboard?.writeText(url).then(() => {
        alert('Link copied to clipboard');
    }).catch(() => {
        alert('Could not copy link');
    });
}

onMounted(() => {
    loadCat();
});
</script>

<style scoped>
.container {
    max-width: 980px;
    margin: 0 auto;
}

.btn-back {
    margin-bottom: 12px;
    background: none;
    border: none;
    cursor: pointer;
    color: #333;
    font-size: 16px;
}

.header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    justify-content: space-between;
}

.title {
    margin: 0;
    font-size: 28px;
}

.meta {
    color: #666;
    font-size: 14px;
    display: flex;
    gap: 8px;
    align-items: center;
}

.badge {
    background: #eef;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
}

.carousel {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    outline: none;
}

.carousel-main {
    position: relative;
    width: 100%;
    height: 400px;
    overflow: hidden;
    border-radius: 16px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
}

.carousel-main img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-color: #fff;
    border-radius: 16px;
}

#left-arrow,
#right-arrow {
    padding-bottom: 0.175em;
}

#left-arrow {
    padding-right: 0.1em;
}

#right-arrow {
    padding-left: 0.1em;
}

.carousel .ctrl {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.4);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 2rem;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
}

.carousel .ctrl:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: translateY(-50%) scale(1.1);
}

.carousel .ctrl.prev {
    left: 12px;
}

.carousel .ctrl.next {
    right: 12px;
}

.thumbs {
    display: flex;
    gap: 6px;
    margin-top: 10px;
    flex-wrap: wrap;
    justify-content: center;
}

.thumbs img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 6px;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s, transform 0.2s;
}

.thumbs img.active {
    opacity: 1;
    outline: 2px solid #007bff;
    transform: scale(1.05);
}

.details {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0;
}

.details th {
    text-align: left;
    padding: 6px 8px;
    color: #444;
    width: 140px;
    vertical-align: top;
    font-weight: 600;
}

.details td {
    padding: 6px 8px;
    color: #222;
}

.actions {
    margin-top: 16px;
    display: flex;
    gap: 8px;
}

.open-map-btn {
    background: #6d5c70;
    color: #fff;
    padding: 2px 12px;
    border-radius: 100px;
    font-size: 12px;
    display: inline-flex;
    height: unset;
    width: unset;
}
.open-map-btn > a {
    padding: 0px;
    margin: 0px;
}
.open-map-btn > a:hover {
    text-decoration: none;
}

.layout {
    margin-top: 1.5rem;
}

@media (max-width: 768px) {
    .carousel-main {
        height: 300px;
        /* slightly smaller on mobile */
    }

    .details th {
        width: 110px;
    }
}
</style>
