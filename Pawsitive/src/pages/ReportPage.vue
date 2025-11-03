<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import Navbar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'
import CatReportCard from '@/components/resuables/CatReportCard.vue'
import { getFirestore, collection, addDoc, getDoc, doc, getDocs, serverTimestamp, query, orderBy, where, GeoPoint } from 'firebase/firestore'
import { getAuth } from "firebase/auth"
import { validateCatReport } from '@/utils/validators'
import { Client } from "@gradio/client"

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const db = getFirestore()
const auth = getAuth()

// -------------------- Reactive State --------------------
const report = reactive({
  status: '',
  condition: '',
  catName: '',
  estimatedAge: '',
  gender: '',
  neutered: '',
  location: '',
  coords: null,
  description: '',
  imageFile: null,
  imagePreview: null,
  severity: 0
})

const reports = ref([])
const reportsLoading = ref(true)
const fieldErrors = ref({})
const showModal = ref(false)

const sidebarOpen = ref(false)
const fileInput = ref(null)

const searchQuery = ref('SMU');

const isLoading = ref(false)
const breedResult = ref(null)
const firstBreed = ref(null)
const nearbyCats = ref([])

const allPredictedCats = ref([]); // 🆕 store predicted cats globally

const locationSuggestions = ref([]);
const showSuggestions = ref(false);

let map = null;
let userMarker = null;
let userCircle = null;
let catMarkers = [];
const showMap = ref(false);

const otherCatsOpen = ref(false);

const RADIUS_METERS = 2000;

// -------------------- Reverse Geocoding (Nominatim) --------------------
async function reverseGeocode(lat, lon) {
  if (lat == null || lon == null) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=16&addressdetails=1`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await resp.json();
    return data?.display_name ?? null;
  } catch (err) {
    console.warn('Reverse geocoding failed:', err);
    return null;
  }
}

// -------------------- Utility Functions --------------------
function haversineMeters(lat1, lon1, lat2, lon2) {
  const toRad = d => d * Math.PI / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function roughlySameArea(a, b, marginMeters, opts = {}) {
  const getCoords = obj =>
    Array.isArray(obj)
      ? obj
      : [obj.lat ?? obj.latitude ?? obj._lat, obj.lon ?? obj.longitude ?? obj._long];

  const [lat1, lon1] = getCoords(a);
  const [lat2, lon2] = getCoords(b);
  if ([lat1, lon1, lat2, lon2].some(v => v == null))
    return { within: false, meters: Infinity, threshold: marginMeters };

  const dist = haversineMeters(lat1, lon1, lat2, lon2);
  const extra = Math.max(0, opts.accuracyA || 0, opts.accuracyB || 0);
  const threshold = marginMeters + extra;
  return { within: dist <= threshold, meters: dist, threshold };
}

function extractFirstBreed(breedResult) {
  if (!breedResult) return null;
  let text = Array.isArray(breedResult) ? breedResult[0] : breedResult;
  const match = text.match(/^\d+\.\s*([^(]+)/m);
  return match ? match[1].trim() : null;
}

async function getCoordinatesFromQuery(query) {
  if (!query) return null;
  try {
    const resp = await fetch(`https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(query)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`);
    const data = await resp.json();
    if (data.found === 0 || !data.results?.length) return null;
    const result = data.results[0];
    return { lat: parseFloat(result.LATITUDE), lng: parseFloat(result.LONGITUDE) };
  } catch (err) {
    console.error("OneMap fetch error:", err)
    return null;
  }
}

async function updateLocation() {
  if (!report.location) return alert("Please enter a location!");
  const coords = await getCoordinatesFromQuery(report.location);
  if (!coords) {
    alert("Failed to resolve location. Check your input.");
    report.coords = null;
    return;
  }
  report.coords = coords;
  console.log("Updated coordinates:", coords);
}

// -------------------- Location Suggestions --------------------
watch(() => report.location, async (newVal) => {
  if (!newVal || newVal.length < 2) {
    locationSuggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  try {
    const resp = await fetch(
      `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(newVal)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`
    );
    const data = await resp.json();
    if (data.found > 0) {
      locationSuggestions.value = data.results.slice(0, 5).map(r => ({
        label: r.ADDRESS,
        coords: { lat: parseFloat(r.LATITUDE), lng: parseFloat(r.LONGITUDE) }
      }));
      showSuggestions.value = true;
    } else {
      locationSuggestions.value = [];
      showSuggestions.value = false;
    }
  } catch (err) {
    console.error("Location suggestion error:", err);
    locationSuggestions.value = [];
    showSuggestions.value = false;
  }
});

function selectLocationSuggestion(suggestion) {
  report.location = suggestion.label;
  report.coords = suggestion.coords;
  showSuggestions.value = false;
}

// -------------------- Get User Location --------------------
function getLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported, using fallback coordinates");
      resolve([1.36599, 103.9535]);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve([pos.coords.latitude, pos.coords.longitude]),
      err => {
        console.error("Geolocation failed:", err);
        resolve([1.36599, 103.9535]);
      }
    );
  });
}

// -------------------- Filter Nearby Cats --------------------

function filterCatsByProximity(cats, myLocation, radiusMeters = RADIUS_METERS) {
  if (!myLocation) return [];

  const myLat = Array.isArray(myLocation) ? myLocation[0] : myLocation.lat;
  const myLng = Array.isArray(myLocation) ? myLocation[1] : myLocation.lng;

  const nearby = cats
    .map(cat => {
      const loc = cat.last_location;
      if (!loc) return null;

      let catLat, catLng;

      if (Array.isArray(loc)) {
        [catLat, catLng] = loc;
      } else if (loc.latitude !== undefined && loc.longitude !== undefined) {
        catLat = loc.latitude;
        catLng = loc.longitude;
      } else if (loc._lat !== undefined && loc._long !== undefined) {
        catLat = loc._lat;
        catLng = loc._long;
      } else {
        return null;
      }

      const dist = haversineMeters(myLat, myLng, catLat, catLng);
      return { ...cat, distanceMeters: dist, withinRadius: dist <= radiusMeters };
    })
    .filter(cat => cat && cat.withinRadius);

  return nearby;
}


// -------------------- Map Functions --------------------
function clearCatMarkers() {
  catMarkers.forEach(marker => map.removeLayer(marker));
  catMarkers = [];
}

async function initMapWithRadius(cats = []) {
  const [lat, lon] = report.coords
    ? [report.coords.lat, report.coords.lng]
    : await getLocation();

  // Persist current coords if not already set
  if (!report.coords) {
    report.coords = { lat, lng: lon };
  }

  if (!map) {
    map = L.map("map").setView([lat, lon], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);
  } else {
    // Recenter map on subsequent calls to reflect new coordinates
    const currentZoom = map.getZoom();
    map.setView([lat, lon], currentZoom);
  }

  clearCatMarkers();

  // Create or move the user marker and circle
  if (userMarker) {
    userMarker.setLatLng([lat, lon]);
  } else {
    userMarker = L.marker([lat, lon]).addTo(map).bindPopup("📍 Selected Location");
  }
  if (userCircle) {
    userCircle.setLatLng([lat, lon]);
    userCircle.setRadius(RADIUS_METERS);
  } else {
    userCircle = L.circle([lat, lon], { radius: RADIUS_METERS, color: "blue", fillColor: "#3b82f6", fillOpacity: 0.2 }).addTo(map);
  }

  // Ensure map recalculates layout in case container size changed
  setTimeout(() => map.invalidateSize(), 0);

  // Reverse-geocode and prefill the Location field when the map is drawn
  try {
    const addr = await reverseGeocode(lat, lon);
    if (addr && !report.location) {
      report.location = addr;
    }
  } catch (e) {
    console.warn('Prefill via reverse geocode failed:', e);
  }

  cats.forEach(cat => {
    const loc = cat.last_location;
    const [catLat, catLon] = Array.isArray(loc) ? loc : [loc.latitude ?? loc._lat, loc.longitude ?? loc._long];
    if (!catLat || !catLon) return;
    const marker = L.marker([catLat, catLon])
      .addTo(map)
      .bindPopup(`<strong>${cat.name || "Unnamed Cat"}</strong><br>Distance: ${cat.distanceMeters?.toFixed(2)} m<br>Condition: ${cat.condition || "Unknown"}`);
    catMarkers.push(marker);
  });
}

// -------------------- Watchers --------------------
// Update nearby cats when user selects a new location
watch(() => report.coords, (newCoords) => {
  if (!newCoords || !firstBreed.value) return;
  console.log("New location selected:", newCoords);
  nearbyCats.value = filterCatsByProximity(allPredictedCats.value, newCoords, RADIUS_METERS);
  showMap.value = nearbyCats.value.length > 0;
  if (showMap.value) initMapWithRadius(nearbyCats.value);
}, { deep: true });

// -------------------- Breed Identification --------------------
async function fetchCatsByBreed(breedName) {
  if (!breedName) return [];
  try {
    const q = query(collection(db, "cats"), where("species", "==", breedName));
    const snapshot = await getDocs(q);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(cat => {
        const createdAt = cat.created_at?.toDate ? cat.created_at.toDate() : null;
        return createdAt && createdAt >= oneDayAgo;
      });
  } catch (err) {
    console.error("Fetch cats failed:", err);
    return [];
  }
}

async function identifyBreed(imageBlob) {
  try {
    isLoading.value = true;
    const myLocation = await getLocation();
    const client = await Client.connect("kevansoon/cat-breed-detector");
    const result = await client.predict("/predict", { image: imageBlob });
    if (!result.data) {
      breedResult.value = "Prediction returned no data.";
      return;
    }
    const breedText = Array.isArray(result.data) ? result.data[0] : result.data;
    breedResult.value = breedText;

    const breed = extractFirstBreed(breedText);
    firstBreed.value = breed;
    if (!breed) return;
    report.catName = firstBreed.value;

    const cats = await fetchCatsByBreed(breed);
    allPredictedCats.value = cats;
    nearbyCats.value = filterCatsByProximity(cats, myLocation, RADIUS_METERS);
    showMap.value = nearbyCats.value.length > 0;
    if (showMap.value) initMapWithRadius(nearbyCats.value);
  } catch (err) {
    console.error("Identify breed failed:", err);
    breedResult.value = "Failed to process image or location.";
  } finally {
    isLoading.value = false;
  }
}

// -------------------- File Upload --------------------
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    report.imageFile = file;
    const reader = new FileReader();
    reader.onload = e => report.imagePreview = e.target.result;
    reader.readAsDataURL(file);
    identifyBreed(file);
  }
}

function removeImage() {
  report.imageFile = null;
  report.imagePreview = null;
  if (fileInput.value) fileInput.value.value = null;
}

// -------------------- Sidebar & Severity --------------------
function toggleSidebar() { sidebarOpen.value = !sidebarOpen.value }
function setSeverity(level) { report.severity = level }

// -------------------- Fetch Reports --------------------
const fetchReports = async () => {
  reportsLoading.value = true;
  try {
    const q = query(collection(db, "cats"), orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);
    const catsData = [];
    for (const docSnap of snapshot.docs) {
      const cat = { id: docSnap.id, ...docSnap.data() };
      if (cat.submittedBy) {
        const userDoc = await getDoc(doc(db, "volunteers", cat.submittedBy));
        cat.username = userDoc.exists() ? userDoc.data().username || "Unknown" : "Unknown";
        cat.avatar = userDoc.exists() ? userDoc.data().avatar || null : null;
      } else {
        cat.username = "Unknown";
        cat.avatar = null;
      }
      catsData.push(cat);
    }
    reports.value = catsData;
  } catch (err) {
    console.error("Failed to fetch cats", err);
  } finally {
    reportsLoading.value = false;
  }
}

// -------------------- Submit Report --------------------
const submitReport = async () => {
  const toValidate = {
    status: report.status,
    name: report.catName,
    location: report.location,
    description: report.description,
    image: report.imagePreview
  };
  const errors = validateCatReport(toValidate);
  if (Object.keys(errors).length > 0) {
    fieldErrors.value = errors;
    return;
  }
  const currentUser = auth.currentUser;
  if (!currentUser) return alert("You must be logged in to submit a report.");
  try {
    if (!report.coords) await updateLocation();
    if (!report.coords) return;
    const { lat, lng } = report.coords;
    await addDoc(collection(db, "cats"), {
      age: report.estimatedAge || "",
      color: "",
      created_at: serverTimestamp(),
      description: report.description || "",
      gender: report.gender || "",
      last_location: new GeoPoint(lat, lng),
      last_seen: serverTimestamp(),
      name: report.catName || "",
      neutered: report.neutered || "",
      photos: report.imagePreview ? [report.imagePreview] : [],
      species: report.catName || "",
      status: report.status || ""
    });
    // Reset form
    report.status = '';
    report.catName = '';
    report.location = '';
    report.description = '';
    report.imageFile = null;
    report.imagePreview = null;
    report.condition = '';
    report.severity = 0;
    report.gender = '';
    report.neutered = '';
    report.estimatedAge = '';
    fieldErrors.value = {};
    if (fileInput.value) fileInput.value.value = null;

    fetchReports();
    showModal.value = false;
    alert("✅ Report submitted successfully!");
  } catch (err) {
    console.error("Error submitting report:", err);
    alert("Failed to submit report. Check console.");
  }
}

// -------------------- Mounted --------------------
onMounted(() => {
  fetchReports();
  getLocation();
});
</script>



<template>
  <Navbar>
    <template v-slot:navbar-title>Report</template>
  </Navbar>
  <h2 class="report-header">Report a Cat</h2>

  <form class="report-form" @submit.prevent="submitReport">


    <!-- Image Upload -->
    <div class="mb-3">
      <label class="form-label">Upload Image</label>
      <input type="file" class="form-control" ref="fileInput" @change="handleFileUpload" accept="image/*" />


      <!-- Preview Section -->
      <div v-if="report.imagePreview" class="image-preview-container mt-2 position-relative">
        <img :src="report.imagePreview" class="img-preview rounded" />
        <button type="button" class="btn btn-sm btn-danger remove-image-btn" @click="removeImage">
          ✕
        </button>
      </div>
    </div>

    <!-- 🐾 Breed Prediction Result -->
    <div v-if="isLoading" class="text-muted mt-2">
      Analyzing image for breed...
    </div>
    <div v-else-if="breedResult" class="mt-2 alert alert-info">
      <strong>Detected Breed:</strong> {{ breedResult }}
    </div>

    <div v-show="showMap" id="map" style="height: 400px; border-radius: 12px; margin-top: 1rem;"></div>


    <!-- Location (auto-detect) -->
    <div class="mb-3 position-relative">
      <label class="form-label">Location</label>
      <input type="text" class="form-control" v-model="report.location" placeholder="Enter location..."
        @focus="showSuggestions.value = locationSuggestions.value.length > 0" />

      <!-- Dropdown Suggestions -->
      <ul v-if="showSuggestions" class="list-group position-absolute w-100"
        style="z-index: 1000; max-height: 200px; overflow-y: auto;">
        <li v-for="(suggestion, index) in locationSuggestions" :key="index"
          class="list-group-item list-group-item-action" @click="selectLocationSuggestion(suggestion)"
          style="cursor: pointer;">
          {{ suggestion.label }}
        </li>
      </ul>
    </div>


    <!-- Status Dropdown -->
    <div class="mb-3">
      <label class="form-label">Status</label>
      <select v-model="report.status" class="form-select">
        <option value="" disabled>Select status</option>
        <option value="Lost">Lost</option>
        <option value="Injured">Injured</option>
      </select>
    </div>

    <!-- Cat Breed -->
    <div class="mb-3">
      <label class="form-label">Cat Breed</label>
      <input type="text" class="form-control" v-model="report.catName" placeholder="Enter cat breed" />
    </div>

    <!-- Estimated Age -->
    <div class="form-group">
      <label class="form-label">Estimated Age</label>
      <input type="number" class="form-control input-field" v-model="report.estimatedAge" placeholder="e.g. 2 (years)"
        min="0" />
    </div>

    <!-- Gender -->
    <div class="form-group">
      <label class="form-label">Gender</label>
      <select class="form-select input-field" v-model="report.gender">
        <option value="" disabled>Select gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Unknown">Unknown</option>
      </select>
    </div>

    <!-- Neutered -->
    <div class="form-group">
      <label class="form-label">Neutered</label>
      <select class="form-select input-field" v-model="report.neutered">
        <option value="" disabled>Select status</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
        <option value="Unknown">Unknown</option>
      </select>
    </div>




    <!-- Condition Dropdown (always shown) -->
    <div class="mb-3">
      <label class="form-label">Condition of the cat (optional)</label>
      <select v-model="report.condition" class="form-select">
        <option value="" disabled>Select condition</option>
        <option value="Bleeding">Bleeding</option>
        <option value="Limping">Limping</option>
        <option value="Vomiting / Diarrhea">Vomiting / Diarrhea</option>
        <option value="Weak / Lethargic">Weak / Lethargic</option>
        <option value="Fracture / Broken bone">Fracture / Broken bone</option>
        <option value="Eye injury / Infection">Eye injury / Infection</option>
        <option value="Open wound / Cut">Open wound / Cut</option>
        <option value="Swelling / Bruising">Swelling / Bruising</option>
        <option value="Difficulty breathing">Difficulty breathing</option>
        <option value="Seizures">Seizures</option>
        <option value="Other">Other</option>
      </select>
    </div>

    <!-- Severity Selector -->
    <div class="mb-3">
      <label class="form-label">Severity of Condition</label>
      <div class="severity-container">
        <div v-for="level in 5" :key="level" class="severity-box" :class="{ selected: report.severity >= level }"
          @click="setSeverity(level)">
          {{ level }}
        </div>
      </div>
      <small class="text-muted">1 = Mild, 5 = Very Severe</small>
    </div>


    <!-- Description -->
    <div class="mb-3">
      <label class="form-label">Description</label>
      <textarea class="form-control" rows="3" v-model="report.description"
        placeholder="Describe the cat's condition..."></textarea>
    </div>

    <button class="btn btn-dark w-100" type="submit">Submit Report</button>
  </form>
  <div class="d-flex main-container" :class="{ 'sidebar-open': sidebarOpen }">

    <div class="d-flex main-container" :class="{ 'sidebar-open': sidebarOpen }">


      <!-- Sidebar -->
      <div class="sidebar" v-if="sidebarOpen">



        <!-- Nearby Cats Section -->
        <h5 style="margin-top: 30px">Nearby Similar Reports (Past 24h, < 1 km ) </h5>
            <div v-if="nearbyCats.length === 0" class="text-muted">
              No nearby cats found.
            </div>
            <div v-else class="nearby-cats-container">
              <div v-for="cat in nearbyCats" :key="cat.id" class="nearby-cat-card card mb-3 p-2">
                <div class="d-flex gap-2">
                  <img v-if="cat.photos && cat.photos.length" :src="cat.photos[0]" alt="cat photo" class="card-img"
                    style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" />
                  <div>
                    <h6 class="mb-1">{{ cat.name || 'Unnamed Cat' }}</h6>
                    <p class="mb-1"><strong>Description:</strong> {{ cat.description || 'No description' }}</p>
                    <p class="mb-1"><strong>Last Location:</strong>
                      {{ Array.isArray(cat.last_location) ? cat.last_location.join(", ") : cat.last_location._lat + ", "
                        +
                      cat.last_location._long }}
                    </p>
                    <p class="mb-1"><strong>Created At:</strong> {{ cat.created_at?.toDate ?
                      cat.created_at.toDate().toLocaleString() : cat.created_at }}</p>
                    <p v-if="cat.distanceMeters" class="mb-0"><strong>Estimated Distance:</strong> {{
                      cat.distanceMeters.toFixed(2) }} m</p>
                  </div>
                </div>
              </div>
            </div>

            <hr />


            <!-- Other Cats Section -->
            <h5>Other Cat Reports</h5>
            <!-- Other Cats Section with Accordion -->
            <div>
              <button class="btn btn-outline-secondary w-100 mb-2" type="button"
                @click="otherCatsOpen = !otherCatsOpen">
                Other Cats ({{ reports.length }})
                <span>{{ otherCatsOpen ? '▲' : '▼' }}</span>
              </button>

              <div v-show="otherCatsOpen" class="nearby-cats-container">
                <div v-for="cat in reports" :key="cat.id" class="nearby-cat-card card mb-3 p-2">
                  <div class="d-flex gap-2">
                    <img v-if="cat.photos && cat.photos.length" :src="cat.photos[0]" alt="cat photo" class="card-img"
                      style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" />
                    <div>
                      <h6 class="mb-1">{{ cat.name || 'Unnamed Cat' }}</h6>
                      <p class="mb-1"><strong>Description:</strong> {{ cat.description || 'No description' }}</p>
                      <p class="mb-1"><strong>Last Location:</strong>
                        {{ Array.isArray(cat.last_location) ? cat.last_location.join(", ") : cat.last_location._lat + ","
                        + cat.last_location._long }}
                      </p>
                      <p class="mb-1"><strong>Created At:</strong> {{ cat.created_at?.toDate ?
                        cat.created_at.toDate().toLocaleString() : cat.created_at }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

      </div>



      <!-- Toggle button -->
      <button class="sidebar-toggle" :class="{ 'sidebar-open-btn': sidebarOpen }" @click="toggleSidebar">
        {{ sidebarOpen ? '⮞' : '⮜' }}
      </button>

    </div>


  </div>

  <BottomFooter />
</template>

<style>
/* ---- Container Layout ---- */
.main-container {
  display: flex;
  justify-content: center;
  /* center form by default */
  transition: all 0.3s ease;
  padding: 1rem;
}

.main-content {
  transition: margin-right 0.3s ease;
  margin-right: 0;
  /* centered by default */
  max-width: 500px;
  /* same width as your form */
  width: 100%;
  /* responsive */
  padding-top: 30px;
}

/* ---- Sidebar ---- */
.sidebar {
  width: 300px;
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  padding: 1rem;
  padding-top: 70px;
  /* space for navbar */
  z-index: 1000;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

/* Sidebar open state */
.sidebar-open .sidebar {
  transform: translateX(0);
}

/* Push form left when sidebar open (desktop only) */
.sidebar-open .main-content {
  margin-right: 300px;
}

/* ---- Sidebar Toggle Button ---- */
.sidebar-toggle {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1100;
  background-color: #343a40;
  color: #fff;
  border: none;
  border-radius: 4px 0 0 4px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* When sidebar is open, move toggle left */
.sidebar-open-btn {
  right: 300px;
  /* matches sidebar width */
  border-radius: 4px;
}

/* ---- Responsive Sidebar ---- */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    transform: translateX(100%);
  }

  .sidebar-open .sidebar {
    transform: translateX(0);
  }

  .sidebar-open .main-content {
    margin-right: 0;
    /* no shift on mobile */
  }

  .sidebar-open-btn {
    right: 0;
    /* stays visible */
  }
}

/* ==============================
   Report Form Styles
   ============================== */
.report-form {
  max-width: 500px;
  margin: 2rem auto;
}

.report-form input,
.report-form textarea,
.report-form select {
  font-size: 0.95rem;
  border-radius: 8px;
}

/* ---- Header ---- */
.report-header {
  text-align: center;
  padding-top: 20px;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

/* ==============================
   Severity Selector
   ============================== */
.severity-container {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.severity-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.severity-box.selected {
  background-color: #343a40;
  color: white;
  border-color: #343a40;
}

.severity-box:hover {
  background-color: #495057;
  color: white;
  border-color: #495057;
}

/* ==============================
   Image Preview
   ============================== */
.image-preview-container {
  position: relative;
  display: inline-block;
}

.img-preview {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  border-radius: 50%;
  line-height: 1;
}

/* ==============================
   Nearby Cats Section
   ============================== */
.nearby-cats-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.nearby-cat-card {
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}


/* ==============================
   Suggestion
   ============================== */

.list-group-item:hover {
  background-color: #f1f1f1;
}
</style>
